from uuid import uuid4
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Habit(Base):
    """
    A single habit tracked by a user, seeded from a static archetype ->
    habit-list mapping (see app/core/habit_templates.py) the first time the
    user opens the Habit Tracker. No AI generation, no per-user personalisation
    yet — matches the brief's "static mappings are acceptable for now".
    """
    __tablename__ = "user_habits"

    id:               Mapped[UUID]     = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id:          Mapped[UUID]     = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at:       Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    name:             Mapped[str]      = mapped_column(String(150), nullable=False)
    source_archetype: Mapped[str|None] = mapped_column(String(10), nullable=True)  # MBTI type it was seeded from
    sort_order:       Mapped[int]      = mapped_column(Integer, nullable=False, default=0)
    is_active:        Mapped[bool]     = mapped_column(Boolean, nullable=False, default=True)

    # ── Relationships ────────────────────────────────────────────────────────
    user:        Mapped["User"]                  = relationship("User", back_populates="habits")
    completions: Mapped[list["HabitCompletion"]] = relationship(
        "HabitCompletion", back_populates="habit", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Habit name={self.name!r} user_id={self.user_id}>"
