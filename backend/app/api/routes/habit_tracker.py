import json
import re
import logging
import asyncio
from datetime import datetime, timezone, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.config import settings
from app.core.dependencies import get_current_user
from app.core.entitlements import has_habit_tracker_access
from app.models.user import User
from app.models.habit_tracker import HabitTracker
from app.models.habit_quest import HabitQuest
from app.ai.gateway import AIConfig
from app.ai.providers.gemini import GeminiProvider
from app.schemas.habit_tracker import (
    SetGoalRequest, GenerateQuestsRequest, TrackerState, QuestItem, CompleteQuestResponse,
)

router = APIRouter(prefix="/tracker", tags=["Habit Tracker"])
logger = logging.getLogger(__name__)

# Flat XP curve for v1 — level = xp // XP_PER_LEVEL + 1. Revisit if the
# gamification design calls for a steeper/variable curve later.
XP_PER_LEVEL = 100

# Ported fallback intent from the original prototype's `rExamplePlan()` —
# shown on first access and whenever personalization is unavailable, so the
# tracker is never empty.
_EXAMPLE_QUESTS = [
    {"title": "Tulis satu langkah kecil", "description": "Tulis satu langkah kecil menuju tujuan kariermu hari ini.", "time_estimate": "5 MENIT", "xp_reward": 15},
    {"title": "Belajar satu hal", "description": "Baca satu paragraf yang berkaitan dengan arah kariermu, lalu catat satu ide.", "time_estimate": "10 MENIT", "xp_reward": 15},
    {"title": "Hubungi satu orang", "description": "Kirim satu pesan ke seseorang di bidang yang kamu tuju.", "time_estimate": "10 MENIT", "xp_reward": 20},
]


# ── Helpers ────────────────────────────────────────────────────────────────

async def _require_pro(db: AsyncSession, user: User) -> None:
    if not await has_habit_tracker_access(db, user.email):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="upgrade_required")


async def _get_or_create_tracker(db: AsyncSession, user: User) -> HabitTracker:
    tracker = await db.scalar(
        select(HabitTracker)
        .where(HabitTracker.user_id == user.id)
        .options(selectinload(HabitTracker.quests))
    )
    if tracker is not None:
        return tracker

    tracker = HabitTracker(user_id=user.id)
    db.add(tracker)
    await db.flush()  # assign tracker.id

    for q in _EXAMPLE_QUESTS:
        db.add(HabitQuest(tracker_id=tracker.id, source="example", **q))
    await db.commit()

    return await db.scalar(
        select(HabitTracker)
        .where(HabitTracker.id == tracker.id)
        .options(selectinload(HabitTracker.quests))
        .execution_options(populate_existing=True)
    )


def _to_state(tracker: HabitTracker) -> TrackerState:
    active = sorted(
        (q for q in tracker.quests if q.status == "active"),
        key=lambda q: q.created_at,
    )
    return TrackerState(
        id=tracker.id,
        target_job=tracker.target_job,
        xp=tracker.xp,
        level=tracker.level,
        current_streak=tracker.current_streak,
        longest_streak=tracker.longest_streak,
        last_completed_date=tracker.last_completed_date,
        quests=[QuestItem.model_validate(q) for q in active],
    )


async def _reload(db: AsyncSession, tracker_id: UUID) -> HabitTracker:
    return await db.scalar(
        select(HabitTracker)
        .where(HabitTracker.id == tracker_id)
        .options(selectinload(HabitTracker.quests))
        .execution_options(populate_existing=True)
    )


# ── AI quest generation (+ graceful fallback) ────────────────────────────────

def _validate_quest_plan(data) -> list[dict] | None:
    """Mirrors the original prototype's rPlanValid() shape checks."""
    if not isinstance(data, list) or not (3 <= len(data) <= 5):
        return None
    quests = []
    for item in data:
        if not isinstance(item, dict):
            return None
        title = str(item.get("title", "")).strip()
        description = str(item.get("description", "")).strip()
        if not title or not description:
            return None
        time_estimate = str(item.get("time_estimate") or "20 MENIT").strip()[:50]
        try:
            xp_reward = int(item.get("xp_reward", 20))
        except (TypeError, ValueError):
            xp_reward = 20
        xp_reward = max(10, min(xp_reward, 30))
        quests.append({
            "title": title[:200],
            "description": description[:2000],
            "time_estimate": time_estimate,
            "xp_reward": xp_reward,
        })
    return quests


async def _generate_quest_plan(reading: str, goal: str) -> list[dict] | None:
    if not settings.GEMINI_API_KEY:
        logger.info("[tracker] GEMINI_API_KEY not set — using example quests")
        return None

    system_prompt = (
        "Anda membantu menyusun 3-5 'quest' harian yang singkat dan konkret "
        "untuk seseorang yang mengejar tujuan karier tertentu, berdasarkan "
        "ringkasan bacaan mereka. Balas HANYA dengan JSON array, tanpa teks lain "
        "di luar JSON. Setiap item berbentuk: "
        '{"title": str singkat, "description": str (1-2 kalimat, actionable), '
        '"time_estimate": str singkat seperti "15 MENIT", "xp_reward": int 10-30}.'
    )
    user_prompt = f"Tujuan karier: {goal}\n\nRingkasan bacaan:\n{reading}"

    try:
        provider = GeminiProvider(api_key=settings.GEMINI_API_KEY)
        ai_config = AIConfig(
            model_name="gemini-2.5-flash",
            max_tokens=1024,
            temperature=0.7,
            api_key=settings.GEMINI_API_KEY,
        )
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None, lambda: provider.generate(system_prompt, user_prompt, ai_config)
        )
        raw = re.sub(r"^```(json)?|```$", "", response.content.strip(), flags=re.MULTILINE).strip()
        data = json.loads(raw)
    except Exception as exc:
        logger.warning(f"[tracker] Quest generation failed, falling back to examples: {exc}")
        return None

    return _validate_quest_plan(data)


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("", response_model=TrackerState, summary="Get the current user's habit tracker state")
async def get_tracker(
    db:   AsyncSession = Depends(get_db),
    user: User         = Depends(get_current_user),
) -> TrackerState:
    await _require_pro(db, user)
    tracker = await _get_or_create_tracker(db, user)
    return _to_state(tracker)


@router.post("/goal", response_model=TrackerState, summary="Set the tracker's career goal")
async def set_goal(
    data: SetGoalRequest,
    db:   AsyncSession = Depends(get_db),
    user: User         = Depends(get_current_user),
) -> TrackerState:
    await _require_pro(db, user)
    tracker = await _get_or_create_tracker(db, user)
    tracker_id = tracker.id
    tracker.target_job = data.target_job
    await db.commit()
    tracker = await _reload(db, tracker_id)
    return _to_state(tracker)


@router.post("/quests/generate", response_model=TrackerState, summary="Generate a personalized quest plan")
async def generate_quests(
    data: GenerateQuestsRequest,
    db:   AsyncSession = Depends(get_db),
    user: User         = Depends(get_current_user),
) -> TrackerState:
    await _require_pro(db, user)
    tracker = await _get_or_create_tracker(db, user)
    tracker_id = tracker.id

    quests = await _generate_quest_plan(data.reading, data.goal)
    source = "generated" if quests is not None else "example"
    if quests is None:
        quests = _EXAMPLE_QUESTS

    # Replace any not-yet-completed quests; completed history is untouched.
    for q in tracker.quests:
        if q.status == "active":
            await db.delete(q)
    for q in quests:
        db.add(HabitQuest(tracker_id=tracker_id, source=source, **q))

    tracker.target_job = data.goal
    await db.commit()

    tracker = await _reload(db, tracker_id)
    return _to_state(tracker)


@router.post(
    "/quests/{quest_id}/complete",
    response_model=CompleteQuestResponse,
    summary="Mark a quest complete and award XP",
)
async def complete_quest(
    quest_id: UUID,
    db:       AsyncSession = Depends(get_db),
    user:     User         = Depends(get_current_user),
) -> CompleteQuestResponse:
    await _require_pro(db, user)
    tracker = await _get_or_create_tracker(db, user)
    tracker_id = tracker.id

    quest = await db.scalar(
        select(HabitQuest).where(HabitQuest.id == quest_id, HabitQuest.tracker_id == tracker_id)
    )
    if quest is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest not found")

    # Atomic conditional transition — the WHERE clause is what makes this
    # safe against duplicate/concurrent completion requests: only the first
    # one to reach Postgres can ever flip status, so XP can never be
    # double-awarded by resubmitting the same request.
    result = await db.execute(
        update(HabitQuest)
        .where(HabitQuest.id == quest_id, HabitQuest.status == "active")
        .values(status="completed", completed_at=func.now())
    )

    if result.rowcount == 0:
        await db.rollback()
        tracker = await _reload(db, tracker_id)
        return CompleteQuestResponse(tracker=_to_state(tracker), xp_gained=0, leveled_up=False)

    xp_gained = quest.xp_reward
    today = datetime.now(timezone.utc).date()

    if tracker.last_completed_date == today:
        pass  # a later quest completed same day — streak already counted today
    elif tracker.last_completed_date == today - timedelta(days=1):
        tracker.current_streak += 1
    else:
        tracker.current_streak = 1
    tracker.last_completed_date = today
    tracker.longest_streak = max(tracker.longest_streak, tracker.current_streak)

    old_level = tracker.level
    tracker.xp += xp_gained
    tracker.level = tracker.xp // XP_PER_LEVEL + 1
    leveled_up = tracker.level > old_level

    await db.commit()

    tracker = await _reload(db, tracker_id)
    return CompleteQuestResponse(tracker=_to_state(tracker), xp_gained=xp_gained, leveled_up=leveled_up)
