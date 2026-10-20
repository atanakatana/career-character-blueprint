from uuid import uuid4
from datetime import datetime, date
from sqlalchemy import String, Integer, Date, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base


class HabitTracker(Base):
    """
    One row per user — the RPG habit tracker's game state.

    xp/level/current_streak/longest_streak/last_completed_date are real
    columns, not part of `state`, specifically so they are always computed
    and written server-side (see api/routes/habit_tracker.py) and can never
    be forged by a client-supplied payload.

    `state` holds everything else: non-authoritative, cosmetic/world data
    (camp layout, seen-tutorial flags, etc.) ported from the original
    standalone prototype's "BP"/"G" game-state blob. Nothing security- or
    progress-relevant belongs here.
    """
    __tablename__ = "habit_trackers"

    id:      Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True,
    )

    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # ── Player-set goal (self-service in v1 — no Blueprint auto-import yet) ──
    target_job: Mapped[str | None] = mapped_column(String(150), nullable=True)

    # ── Authoritative progress — server-computed only ────────────────────────
    xp:                  Mapped[int]       = mapped_column(Integer, nullable=False, default=0)
    level:                Mapped[int]       = mapped_column(Integer, nullable=False, default=1)
    current_streak:      Mapped[int]       = mapped_column(Integer, nullable=False, default=0)
    longest_streak:       Mapped[int]       = mapped_column(Integer, nullable=False, default=0)
    last_completed_date: Mapped[date|None] = mapped_column(Date, nullable=True)

    # ── Non-authoritative cosmetic/world state ────────────────────────────────
    state: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    # ── Relationships ────────────────────────────────────────────────────────
    user:   Mapped["User"]              = relationship("User", back_populates="tracker")
    quests: Mapped[list["HabitQuest"]]  = relationship("HabitQuest", back_populates="tracker")

    def __repr__(self) -> str:
        return f"<HabitTracker user_id={self.user_id} level={self.level} xp={self.xp}>"
