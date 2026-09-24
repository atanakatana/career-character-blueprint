"""
Shared fixtures for DB-backed route tests.

Strategy: a session-scoped engine points at a dedicated *_test database
(never the dev DB — see _test_db_url), with tables created once from
Base.metadata (models are the source of truth here, not Alembic — the
migration chain itself is verified separately, see git history around
004_submissions_user_id.py). Each test gets its own AsyncSession and, after
the test, every table is truncated — simpler and more version-portable than
SAVEPOINT-based rollback, and correct regardless of whether route code under
test already called db.commit().

Uses NullPool for the test engine for the same reason app/database.py's
WorkerSessionLocal does: pytest-asyncio hands every test function a fresh
event loop by default, and a pooled asyncpg connection is bound to the loop
it was opened on — reusing one across a loop boundary raises "attached to a
different loop" / "another operation is in progress". NullPool opens a new
connection per checkout and never carries one across loops, so the engine
itself can stay session-scoped (schema created once) while individual
connections stay loop-safe per test.
"""
import os

import asyncpg
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.engine.url import make_url
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.config import settings
from app.database import Base, get_db
from app.main import app


def _test_db_url() -> str:
    override = os.getenv("TEST_DATABASE_URL")
    if override:
        return override
    base, _, dbname = settings.DATABASE_URL.rpartition("/")
    return f"{base}/{dbname}_test"


TEST_DATABASE_URL = _test_db_url()


async def _ensure_database_exists(url: str) -> None:
    """CREATE DATABASE can't run inside the pool's connection the way normal
    queries do, so this connects directly via asyncpg to the `postgres`
    maintenance database (always present) and creates the test DB if needed."""
    sa_url = make_url(url)
    conn = await asyncpg.connect(
        user=sa_url.username, password=sa_url.password,
        host=sa_url.host, port=sa_url.port, database="postgres",
    )
    try:
        exists = await conn.fetchval(
            "SELECT 1 FROM pg_database WHERE datname = $1", sa_url.database
        )
        if not exists:
            await conn.execute(f'CREATE DATABASE "{sa_url.database}"')
    finally:
        await conn.close()


@pytest_asyncio.fixture(scope="session")
async def engine():
    await _ensure_database_exists(TEST_DATABASE_URL)
    eng = create_async_engine(TEST_DATABASE_URL, poolclass=NullPool)
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield eng
    await eng.dispose()


@pytest_asyncio.fixture
async def db_session(engine):
    """A session for direct ORM setup/assertions *within a test body*. Not
    shared with the app under test — see `client` below for why."""
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    async with async_session() as session:
        yield session

    # Truncate everything so the next test starts from empty, regardless of
    # what this session or the app (via `client`) committed.
    async with engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            await conn.execute(table.delete())


@pytest_asyncio.fixture
async def client(engine, db_session):
    """httpx.ASGITransport runs each request's dependency-injected code in a
    task context that doesn't safely share a single AsyncSession/asyncpg
    connection with the fixture's own task (raises "another operation is in
    progress" if you try). So `get_db` here mirrors the real one — a fresh
    session per request, bound to the same test engine/database — rather
    than reusing `db_session`'s session object directly."""
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async def _override_get_db():
        async with async_session() as session:
            yield session

    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
