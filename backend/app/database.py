from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.config import settings


# ── API engine (FastAPI) ─────────────────────────────────────────────────────
# The web process is long-lived and runs on a single event loop, so connection
# pooling is correct and desirable here. Leave this exactly as it was.
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# ── Worker engine (Celery) ───────────────────────────────────────────────────
# The worker calls asyncio.run() per task, which creates a FRESH event loop and
# CLOSES it when the task finishes. A pooled asyncpg connection is bound to the
# loop it was created on, so when the pool hands that same connection to the
# next task — running on a new loop — you get exactly the errors in your logs:
#   "RuntimeError: Event loop is closed"
#   "got Future ... attached to a different loop"
# This also silently broke _mark_failed, leaving failed submissions stuck in
# 'processing' with no error recorded.
#
# NullPool fixes it structurally: it opens a brand-new connection on every
# checkout and closes it on release, within the same loop. Nothing is ever
# carried across loops, so there is no stale connection to recycle. (pool_pre_ping
# is irrelevant here because connections are always fresh, so it's omitted.)
worker_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    poolclass=NullPool,
)

WorkerSessionLocal = async_sessionmaker(
    worker_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


async def get_db():
    """FastAPI dependency: yields an async DB session from the pooled engine."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()