from uuid import uuid4
from datetime import datetime
from sqlalchemy import String, Integer, Float, Boolean, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base


class AIModelConfig(Base):
    __tablename__ = "ai_model_configs"

    id:         Mapped[UUID]     = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    provider:        Mapped[str]       = mapped_column(String(50),  nullable=False)  # gemini | openai | claude | openrouter
    model_name:      Mapped[str]       = mapped_column(String(100), nullable=False)
    is_active:       Mapped[bool]      = mapped_column(Boolean,     nullable=False, default=False)
    api_key_env_var: Mapped[str]       = mapped_column(String(100), nullable=False)  # env var name, not the key itself
    max_tokens:      Mapped[int]       = mapped_column(Integer,     nullable=False, default=8000)
    temperature:     Mapped[float]     = mapped_column(Float,       nullable=False, default=0.7)
    config_json:     Mapped[dict|None] = mapped_column(JSONB,       nullable=True)   # provider-specific params

    def __repr__(self) -> str:
        return f"<AIModelConfig provider={self.provider} model={self.model_name} active={self.is_active}>"
