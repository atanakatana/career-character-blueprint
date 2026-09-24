import pytest

# Fixtures (engine/db_session/client in conftest.py) are session-loop-scoped
# (see asyncio_default_fixture_loop_scope in pytest.ini) because the test
# engine uses NullPool, which is loop-safe per-connection but still needs
# fixture setup/teardown and the test body itself on the same loop to avoid
# "attached to a different loop" when a session's implicit transaction gets
# rolled back at teardown. Tests default to their own per-function loop
# unless told otherwise — this aligns them with the fixtures.
pytestmark = pytest.mark.asyncio(loop_scope="session")


async def test_register_then_get_profile(client):
    res = await client.post("/api/auth/register", json={
        "email": "newuser@example.com",
        "password": "hunter22",
        "nickname": "Newbie",
    })
    assert res.status_code == 201
    token = res.json()["access_token"]

    me = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "newuser@example.com"


async def test_register_duplicate_email_is_rejected(client):
    payload = {"email": "dupe@example.com", "password": "hunter22", "nickname": "A"}

    first = await client.post("/api/auth/register", json=payload)
    assert first.status_code == 201

    second = await client.post("/api/auth/register", json=payload)
    assert second.status_code == 409


async def test_login_wrong_password_rejected(client):
    await client.post("/api/auth/register", json={
        "email": "loginuser@example.com", "password": "correct-horse", "nickname": "L",
    })

    res = await client.post("/api/auth/login", json={
        "email": "loginuser@example.com", "password": "wrong-password",
    })
    assert res.status_code == 401


async def test_login_correct_password_returns_token(client):
    await client.post("/api/auth/register", json={
        "email": "loginuser2@example.com", "password": "correct-horse", "nickname": "L",
    })

    res = await client.post("/api/auth/login", json={
        "email": "loginuser2@example.com", "password": "correct-horse",
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


async def test_me_rejects_invalid_token(client):
    res = await client.get("/api/auth/me", headers={"Authorization": "Bearer not-a-real-token"})
    assert res.status_code == 401
