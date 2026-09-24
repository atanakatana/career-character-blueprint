"""
Route-level coverage for the submission -> account ownership flow fixed in
004_submissions_user_id.py / api/routes/{submissions,users}.py: a paid
report must only ever be reachable by the account whose authenticated
session created it, never by email string alone.
"""
from datetime import datetime, timezone
from unittest.mock import MagicMock
from uuid import uuid4

import pytest

from app.celery_app import celery_app
from app.models.payment import Payment
from app.models.report import Report
from app.models.report_token import ReportToken
from app.models.submission import Submission

SUBMISSION_PAYLOAD = {
    "nickname": "Andi",
    "email": "should-be-ignored@example.com",  # server uses the account's own email — see submissions.py
    "mbti_type": "INFJ",
    "hd_type": "Generator",
    "hd_authority": "Sacral",
    "hd_profile": "3/5 — Martyr / Heretic",
    "current_occupation": "Software Engineer",
    "burnout_triggers": "Micromanagement and unclear priorities",
    "success_vision": "Leading a small, trusted team",
}

MINIMAL_REPORT_DATA = {
    "profile_summary": "A summary.",
    "capacity_and_energy": "Steady.",
    "blind_spots": "Overcommitting.",
    "ideal_work_environment": "Quiet, autonomous.",
    "career_recommendations": [{
        "career_name": "Backend Engineer",
        "why_it_fits": "Matches strengths.",
        "required_skills": ["Python"],
        "first_action": "Apply.",
        "estimated_income_range": "N/A",
        "future_growth_potential": "High",
    }],
    "long_term_vision": "Grow into a lead role.",
    "skill_development_roadmap": "Learn X, then Y.",
    "decision_making_guide": "Trust the gut check.",
    "action_plan": ["Update resume", "Apply to 5 roles"],
    "closing_statement": "You've got this.",
}

# See test_auth_routes.py for why — keeps this file's tests on the same
# loop as the session-scoped test-DB fixtures.
pytestmark = pytest.mark.asyncio(loop_scope="session")


async def _register(client, email, password="hunter22", nickname="N"):
    res = await client.post("/api/auth/register", json={
        "email": email, "password": password, "nickname": nickname,
    })
    assert res.status_code == 201
    return res.json()["access_token"]


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


async def _mark_paid(db_session, email, tier="tier1"):
    db_session.add(Payment(
        email=email, tier=tier, status="paid", amount=149_000,
        mayar_product_id=f"mock-{uuid4()}", mayar_order_id=f"order-{uuid4()}",
        payment_url="http://mock", paid_at=datetime.now(timezone.utc),
    ))
    await db_session.commit()


async def _insert_completed_submission(db_session, *, email, user_id):
    """Bypasses the AI pipeline entirely (no Celery/Gemini in these tests) —
    inserts a submission already in its post-pipeline state, to test the
    *retrieval* logic in isolation from generation."""
    submission = Submission(email=email, user_id=user_id, status="completed", **{
        k: v for k, v in SUBMISSION_PAYLOAD.items() if k != "email"
    })
    db_session.add(submission)
    await db_session.flush()

    report = Report(
        submission_id=submission.id, character_title="The Strategic Empath",
        report_data=MINIMAL_REPORT_DATA, ai_model_used="test-model", ai_prompt_version="v1",
    )
    db_session.add(report)
    await db_session.flush()

    token = ReportToken(report_id=report.id)
    db_session.add(token)
    await db_session.commit()
    return submission, report, token


# ─── POST /api/submissions ────────────────────────────────────────────────────

async def test_create_submission_requires_auth(client, db_session):
    await _mark_paid(db_session, "anon@example.com")
    res = await client.post("/api/submissions", json=SUBMISSION_PAYLOAD)
    assert res.status_code in (401, 403)


async def test_create_submission_without_payment_is_rejected(client, db_session):
    token = await _register(client, "nopay@example.com")
    res = await client.post("/api/submissions", json=SUBMISSION_PAYLOAD, headers=_auth(token))
    assert res.status_code == 402


async def test_create_submission_stamps_account_email_and_user_id(client, db_session, monkeypatch):
    # celery_app is a shared singleton imported by reference into
    # api/routes/submissions.py, so patching the object here (rather than a
    # string import path — send_task is an attribute of an instance, not a
    # module) affects the route's call too.
    monkeypatch.setattr(celery_app, "send_task", MagicMock(return_value=MagicMock(id="fake-task-id")))

    email = "paiduser@example.com"
    await _mark_paid(db_session, email)
    token = await _register(client, email)

    res = await client.post("/api/submissions", json=SUBMISSION_PAYLOAD, headers=_auth(token))
    assert res.status_code == 202

    submission = await db_session.get(Submission, res.json()["id"])
    # The account's own email is used — never the client-supplied body field,
    # which this payload deliberately set to a different address.
    assert submission.email == email
    assert submission.user_id is not None


# ─── GET /api/users/me/blueprint ──────────────────────────────────────────────

async def test_blueprint_none_when_no_submission(client, db_session):
    token = await _register(client, "nosubmission@example.com")
    res = await client.get("/api/users/me/blueprint", headers=_auth(token))
    assert res.status_code == 200
    assert res.json() == {"unlocked": False, "status": "none", "token": None, "report": None}


async def test_blueprint_returns_own_completed_report(client, db_session):
    email = "owner@example.com"
    token = await _register(client, email)

    me = await client.get("/api/auth/me", headers=_auth(token))
    user_id = me.json()["id"]

    _, _, report_token = await _insert_completed_submission(db_session, email=email, user_id=user_id)

    res = await client.get("/api/users/me/blueprint", headers=_auth(token))
    assert res.status_code == 200
    body = res.json()
    assert body["unlocked"] is True
    assert body["status"] == "completed"
    assert body["token"] == report_token.token


async def test_blueprint_never_leaks_across_accounts(client, db_session):
    owner_token = await _register(client, "victim@example.com")
    owner_me = await client.get("/api/auth/me", headers=_auth(owner_token))
    owner_id = owner_me.json()["id"]

    await _insert_completed_submission(db_session, email="victim@example.com", user_id=owner_id)

    other_token = await _register(client, "someone-else@example.com")
    res = await client.get("/api/users/me/blueprint", headers=_auth(other_token))

    assert res.status_code == 200
    assert res.json()["unlocked"] is False
    assert res.json()["status"] == "none"


async def test_legacy_submission_with_no_user_id_is_not_returned(client, db_session):
    """Regression test for the fix itself: before 004_submissions_user_id.py,
    get_my_blueprint fell back to matching Submission.email against the
    logged-in user's email whenever user_id was NULL — that's exactly the
    account/report-linking vulnerability. The fallback was deliberately
    removed (see api/routes/users.py). This pins that down: a submission
    with a matching email but no user_id must stay unreachable, even to the
    account that legitimately owns that email — it can only be surfaced by
    an explicit admin-side backfill, never by a self-service lookup."""
    email = "legacyrow@example.com"
    await _insert_completed_submission(db_session, email=email, user_id=None)

    token = await _register(client, email)
    res = await client.get("/api/users/me/blueprint", headers=_auth(token))

    assert res.status_code == 200
    assert res.json()["unlocked"] is False
    assert res.json()["status"] == "none"
