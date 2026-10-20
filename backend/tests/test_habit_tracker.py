from datetime import datetime, timezone

import pytest

from app.models.payment import Payment
from app.models.habit_tracker import HabitTracker

pytestmark = pytest.mark.asyncio(loop_scope="session")


async def _register_and_login(client, email: str) -> str:
    await client.post("/api/auth/register", json={
        "email": email, "password": "hunter22", "nickname": "Hero",
    })
    res = await client.post("/api/auth/login", json={"email": email, "password": "hunter22"})
    return res.json()["access_token"]


async def _grant_tier(db_session, email: str, tier: str) -> None:
    db_session.add(Payment(
        email=email, tier=tier, status="paid", amount=1,
        paid_at=datetime.now(timezone.utc),
    ))
    await db_session.commit()


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


async def test_tracker_requires_auth(client):
    # No Authorization header at all: FastAPI's HTTPBearer(auto_error=True)
    # raises 403 here, distinct from 401 for a present-but-invalid token
    # (see test_me_rejects_invalid_token in test_auth_routes.py) — same
    # pre-existing behavior as the admin auth dependency this mirrors.
    res = await client.get("/api/tracker")
    assert res.status_code == 403


async def test_tracker_requires_tier2(client, db_session):
    email = "tier1user@example.com"
    token = await _register_and_login(client, email)
    await _grant_tier(db_session, email, "tier1")

    res = await client.get("/api/tracker", headers=_auth(token))
    assert res.status_code == 403
    assert res.json()["detail"] == "upgrade_required"


async def test_tracker_lazy_creates_for_tier2_user(client, db_session):
    email = "tier2user@example.com"
    token = await _register_and_login(client, email)
    await _grant_tier(db_session, email, "tier2")

    res = await client.get("/api/tracker", headers=_auth(token))
    assert res.status_code == 200
    body = res.json()
    assert body["xp"] == 0
    assert body["level"] == 1
    assert len(body["quests"]) == 3
    assert all(q["status"] == "active" for q in body["quests"])


async def test_complete_quest_awards_xp_and_is_idempotent(client, db_session):
    email = "completer@example.com"
    token = await _register_and_login(client, email)
    await _grant_tier(db_session, email, "tier2")

    tracker = (await client.get("/api/tracker", headers=_auth(token))).json()
    quest = tracker["quests"][0]

    first = await client.post(f"/api/tracker/quests/{quest['id']}/complete", headers=_auth(token))
    assert first.status_code == 200
    first_body = first.json()
    assert first_body["xp_gained"] == quest["xp_reward"]
    assert first_body["tracker"]["xp"] == quest["xp_reward"]
    assert len(first_body["tracker"]["quests"]) == 2  # completed quest drops out of the active list

    # Resubmitting the same completion must not double-award XP.
    second = await client.post(f"/api/tracker/quests/{quest['id']}/complete", headers=_auth(token))
    assert second.status_code == 200
    second_body = second.json()
    assert second_body["xp_gained"] == 0
    assert second_body["leveled_up"] is False
    assert second_body["tracker"]["xp"] == first_body["tracker"]["xp"]


async def test_level_up_on_xp_threshold(client, db_session):
    email = "leveler@example.com"
    token = await _register_and_login(client, email)
    await _grant_tier(db_session, email, "tier2")

    tracker_body = (await client.get("/api/tracker", headers=_auth(token))).json()
    quest = tracker_body["quests"][0]

    # Push xp close to the level-2 threshold (100) directly, bypassing the
    # API — this test is about the level math, not accumulation via quests.
    tracker_row = await db_session.get(HabitTracker, tracker_body["id"])
    tracker_row.xp = 100 - quest["xp_reward"] + 1  # one completion away from leveling
    await db_session.commit()

    res = await client.post(f"/api/tracker/quests/{quest['id']}/complete", headers=_auth(token))
    body = res.json()
    assert body["leveled_up"] is True
    assert body["tracker"]["level"] == 2
