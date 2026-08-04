from uuid import uuid4
from datetime import datetime, date
from sqlalchemy import Date, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class HabitCompletion(Base):
    """
    One row per habit per day it was marked complete. `user_id` is denormalised
    onto the row (in addition to being reachable via habit.user_id) purely to
    keep streak/progress queries a single indexed lookup rather than a join.
    """
    __tablename__ = "habit_completions"

    id:             Mapped[UUID]     = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    habit_id:       Mapped[UUID]     = mapped_column(UUID(as_uuid=True), ForeignKey("user_habits.id", ondelete="CASCADE"), nullable=False)
    user_id:        Mapped[UUID]     = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    completed_date: Mapped[date]     = mapped_column(Date, nullable=False)
    created_at:     Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    # ── Relationships ────────────────────────────────────────────────────────
    habit: Mapped["Habit"] = relationship("Habit", back_populates="completions")

    def __repr__(self) -> str:
        return f"<HabitCompletion habit_id={self.habit_id} date={self.completed_date}>"
