from uuid import uuid4
from datetime import datetime
from sqlalchemy import String, Boolean, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class User(Base):
    """
    End-user account (Re:Lumma).

    Separate from AdminUser — this is the account created after a customer
    unlocks their Blueprint, used to access the Dashboard and Habit Tracker.

    Deliberately minimal for v1: no email verification, no password reset,
    no refresh tokens. Session is a single long-lived JWT (see core/security.py),
    same mechanism already used for admin auth.
    """
    __tablename__ = "users"

    id:            Mapped[UUID]          = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    created_at:    Mapped[datetime]      = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at:    Mapped[datetime]      = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    email:         Mapped[str]           = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str]           = mapped_column(String(255), nullable=False)
    nickname:      Mapped[str]           = mapped_column(String(100), nullable=False)
    is_active:     Mapped[bool]          = mapped_column(Boolean, nullable=False, default=True)
    last_login_at: Mapped[datetime|None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)

    # ── Relationships ────────────────────────────────────────────────────────
    habits: Mapped[list["Habit"]] = relationship("Habit", back_populates="user")

    def __repr__(self) -> str:
        return f"<User email={self.email} active={self.is_active}>"
