from uuid import uuid4
from datetime import datetime
from sqlalchemy import String, Text, Integer, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Submission(Base):
    __tablename__ = "submissions"

    # ── Identity ────────────────────────────────────────────────────────────
    id:         Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    status:     Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    # status values: pending | processing | completed | failed

    # Owning Re:Lumma account, if this submission was created through an
    # authenticated session (true for everything created after 2026-08-13 —
    # see 004_submissions_user_id.py). Nullable to allow legacy, pre-fix rows
    # with no session to attribute ownership to; NEVER treat a NULL here as
    # "belongs to whoever's email matches" without also checking it's really
    # unclaimed — that email-match assumption is exactly the vulnerability
    # this column exists to close. See api/routes/users.py::get_my_blueprint.
    user_id: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True,
    )

    # ── User Inputs ─────────────────────────────────────────────────────────
    nickname:           Mapped[str] = mapped_column(String(100), nullable=False)
    email:              Mapped[str] = mapped_column(String(255), nullable=False)
    mbti_type:          Mapped[str] = mapped_column(String(10),  nullable=False)
    hd_type:            Mapped[str] = mapped_column(String(50),  nullable=False)
    hd_authority:       Mapped[str] = mapped_column(String(50),  nullable=False)
    hd_profile:         Mapped[str] = mapped_column(String(30),  nullable=False)
    current_occupation: Mapped[str] = mapped_column(Text, nullable=False)
    burnout_triggers:   Mapped[str] = mapped_column(Text, nullable=False)
    success_vision:     Mapped[str] = mapped_column(Text, nullable=False)

    # ── Processing Metadata ─────────────────────────────────────────────────
    celery_task_id:           Mapped[str | None]      = mapped_column(String(255), nullable=True)
    processing_started_at:    Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    processing_completed_at:  Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    error_message:            Mapped[str | None]      = mapped_column(Text, nullable=True)
    retry_count:              Mapped[int]              = mapped_column(Integer, nullable=False, default=0)

    # ── Relationships ────────────────────────────────────────────────────────
    report:     Mapped["Report"]      = relationship("Report",    back_populates="submission", uselist=False)
    email_logs: Mapped[list["EmailLog"]] = relationship("EmailLog", back_populates="submission")

    def __repr__(self) -> str:
        return f"<Submission id={self.id} email={self.email} status={self.status}>"
