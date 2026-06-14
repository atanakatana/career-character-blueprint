from uuid import uuid4
from datetime import datetime
from sqlalchemy import String, Text, Boolean, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class PromptTemplate(Base):
    __tablename__ = "ai_prompt_templates"

    id:         Mapped[UUID]     = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    name:           Mapped[str]      = mapped_column(String(100), nullable=False, unique=True)
    version:        Mapped[str]      = mapped_column(String(20),  nullable=False)
    is_active:      Mapped[bool]     = mapped_column(Boolean,     nullable=False, default=False)
    prompt_text:    Mapped[str]      = mapped_column(Text,        nullable=False)
    system_context: Mapped[str]      = mapped_column(Text,        nullable=False)
    notes:          Mapped[str|None] = mapped_column(Text,        nullable=True)
    created_by:     Mapped[UUID|None] = mapped_column(UUID(as_uuid=True), ForeignKey("admin_users.id"), nullable=True)

    def __repr__(self) -> str:
        return f"<PromptTemplate name={self.name} version={self.version} active={self.is_active}>"
