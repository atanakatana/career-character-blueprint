from uuid import uuid4
from datetime import datetime
from sqlalchemy import String, Text, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class EmailLog(Base):
    __tablename__ = "email_logs"

    id:            Mapped[UUID]     = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    submission_id: Mapped[UUID]     = mapped_column(UUID(as_uuid=True), ForeignKey("submissions.id"), nullable=False)
    created_at:    Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    email_type:        Mapped[str]      = mapped_column(String(50),  nullable=False)   # blueprint_ready
    recipient_email:   Mapped[str]      = mapped_column(String(255), nullable=False)
    resend_message_id: Mapped[str|None] = mapped_column(String(255), nullable=True)
    status:            Mapped[str]      = mapped_column(String(20),  nullable=False)   # sent | failed | bounced
    error_message:     Mapped[str|None] = mapped_column(Text, nullable=True)

    # ── Relationships ─────────────────────────────────────────────────────────
    submission: Mapped["Submission"] = relationship("Submission", back_populates="email_logs")

    def __repr__(self) -> str:
        return f"<EmailLog id={self.id} status={self.status} email={self.recipient_email}>"
