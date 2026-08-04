import logging
from datetime import date, timedelta
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.dependencies import get_current_user
from app.core.habit_templates import get_habit_template
from app.models.user import User
from app.models.habit import Habit
from app.models.habit_completion import HabitCompletion
from app.schemas.habit import HabitItem, HabitListResponse

router = APIRouter(prefix="/habits", tags=["Habit Tracker"])
logger = logging.getLogger(__name__)


async def _seed_habits_if_empty(db: AsyncSession, user: User, seed_archetype: Optional[str]) -> None:
    existing = await db.scalar(select(Habit).where(Habit.user_id == user.id).limit(1))
    if existing is not None:
        return

    template = get_habit_template(seed_archetype)
    for i, name in enumerate(template):
        db.add(Habit(user_id=user.id, name=name, source_archetype=seed_archetype, sort_order=i))
    await db.commit()
    logger.info(f"[habits] Seeded {len(template)} habits for user {user.id} from archetype={seed_archetype}")


async def _current_streak(db: AsyncSession, habit_id: UUID) -> int:
    """
    Counts consecutive completed days ending today or yesterday. Simple,
    non-gamified streak — matches the brief's "do not implement advanced
    gamification yet".
    """
    result = await db.execute(
        select(HabitCompletion.completed_date)
        .where(HabitCompletion.habit_id == habit_id)
        .order_by(HabitCompletion.completed_date.desc())
    )
    completed_dates = set(result.scalars().all())
    if not completed_dates:
        return 0

    today = date.today()
    cursor = today if today in completed_dates else today - timedelta(days=1)
    if cursor not in completed_dates:
        return 0

    streak = 0
    while cursor in completed_dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


async def _build_list_response(db: AsyncSession, user: User) -> HabitListResponse:
    result = await db.execute(
        select(Habit)
        .where(Habit.user_id == user.id, Habit.is_active == True)  # noqa: E712
        .order_by(Habit.sort_order)
    )
    habits = result.scalars().all()

    today = date.today()
    items: list[HabitItem] = []
    today_completed = 0

    for h in habits:
        completed_today = await db.scalar(
            select(HabitCompletion.id)
            .where(HabitCompletion.habit_id == h.id, HabitCompletion.completed_date == today)
            .limit(1)
        ) is not None
        if completed_today:
            today_completed += 1

        streak = await _current_streak(db, h.id)

        items.append(HabitItem(
            id=h.id, name=h.name, completed_today=completed_today,
            current_streak=streak, sort_order=h.sort_order,
        ))

    return HabitListResponse(habits=items, today_completed=today_completed, today_total=len(items))


# ── List (auto-seeds on first access) ─────────────────────────────────────────

@router.get("", response_model=HabitListResponse, summary="List the current user's habits")
async def list_habits(
    seed_archetype: Optional[str] = None,
    db:   AsyncSession = Depends(get_db),
    user: User          = Depends(get_current_user),
) -> HabitListResponse:
    await _seed_habits_if_empty(db, user, seed_archetype)
    return await _build_list_response(db, user)


# ── Toggle today's completion ────────────────────────────────────────────────

@router.post("/{habit_id}/toggle", response_model=HabitListResponse, summary="Toggle today's completion for a habit")
async def toggle_habit(
    habit_id: UUID,
    db:   AsyncSession = Depends(get_db),
    user: User          = Depends(get_current_user),
) -> HabitListResponse:
    habit = await db.scalar(select(Habit).where(Habit.id == habit_id, Habit.user_id == user.id))
    if habit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    today = date.today()
    existing = await db.scalar(
        select(HabitCompletion)
        .where(HabitCompletion.habit_id == habit_id, HabitCompletion.completed_date == today)
    )

    if existing is not None:
        await db.execute(delete(HabitCompletion).where(HabitCompletion.id == existing.id))
    else:
        db.add(HabitCompletion(habit_id=habit_id, user_id=user.id, completed_date=today))

    await db.commit()
    return await _build_list_response(db, user)
