import secrets
from uuid import uuid4
from datetime import datetime
from sqlalchemy import String, Integer, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


def _generate_token() -> str:
    """Generates a cryptographically random 86-char URL-safe token."""
    return secrets.token_urlsafe(64)


class ReportToken(Base):
    __tablename__ = "report_tokens"

    id:        Mapped[UUID]     = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    report_id: Mapped[UUID]     = mapped_column(UUID(as_uuid=True), ForeignKey("reports.id"), nullable=False)
    token:     Mapped[str]      = mapped_column(String(128), nullable=False, unique=True, default=_generate_token)
    created_at:    Mapped[datetime]      = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    expires_at:    Mapped[datetime|None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)  # NULL = never expires (v1)
    accessed_count:    Mapped[int]            = mapped_column(Integer, nullable=False, default=0)
    last_accessed_at:  Mapped[datetime|None]  = mapped_column(TIMESTAMP(timezone=True), nullable=True)

    # ── Relationships ─────────────────────────────────────────────────────────
    report: Mapped["Report"] = relationship("Report", back_populates="token")

    def __repr__(self) -> str:
        return f"<ReportToken id={self.id} report_id={self.report_id}>"
