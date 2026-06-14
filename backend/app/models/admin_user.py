from uuid import uuid4
from datetime import datetime
from sqlalchemy import String, Boolean, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class AdminUser(Base):
    __tablename__ = "admin_users"

    id:            Mapped[UUID]          = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    created_at:    Mapped[datetime]      = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    email:         Mapped[str]           = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str]           = mapped_column(String(255), nullable=False)
    is_active:     Mapped[bool]          = mapped_column(Boolean,     nullable=False, default=True)
    last_login_at: Mapped[datetime|None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)

    def __repr__(self) -> str:
        return f"<AdminUser email={self.email} active={self.is_active}>"
