from uuid import uuid4
from datetime import datetime
from sqlalchemy import String, Text, Integer, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class HabitQuest(Base):
    """
    A single daily-quest item belonging to a HabitTracker.

    `status` transitions active -> completed exactly once; completion is
    enforced with an atomic conditional UPDATE in the route handler (not
    here) so duplicate submissions can't double-award XP.
    """
    __tablename__ = "habit_quests"

    id:         Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    tracker_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("habit_trackers.id", ondelete="CASCADE"), nullable=False,
    )

    title:         Mapped[str]      = mapped_column(String(200), nullable=False)
    description:   Mapped[str]      = mapped_column(Text, nullable=False)
    time_estimate: Mapped[str|None] = mapped_column(String(50), nullable=True)
    xp_reward:     Mapped[int]      = mapped_column(Integer, nullable=False, default=20)

    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    # status values: active | completed
    source: Mapped[str] = mapped_column(String(20), nullable=False, default="example")
    # source values: example | generated

    completed_at: Mapped[datetime|None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    created_at:    Mapped[datetime]     = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    # ── Relationships ────────────────────────────────────────────────────────
    tracker: Mapped["HabitTracker"] = relationship("HabitTracker", back_populates="quests")

    def __repr__(self) -> str:
        return f"<HabitQuest id={self.id} tracker_id={self.tracker_id} status={self.status}>"
