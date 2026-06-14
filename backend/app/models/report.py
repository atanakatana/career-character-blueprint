from uuid import uuid4
from datetime import datetime
from sqlalchemy import String, Integer, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base


class Report(Base):
    __tablename__ = "reports"

    # ── Identity ─────────────────────────────────────────────────────────────
    id:            Mapped[UUID]     = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    submission_id: Mapped[UUID]     = mapped_column(UUID(as_uuid=True), ForeignKey("submissions.id"), nullable=False)
    created_at:    Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at:    Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # ── Content ──────────────────────────────────────────────────────────────
    character_title: Mapped[str]  = mapped_column(String(255), nullable=False)
    report_data:     Mapped[dict] = mapped_column(JSONB, nullable=False)
    # report_data schema (enforced at application layer via Pydantic):
    # {
    #   profile_summary: str,
    #   capacity_and_energy: str,
    #   blind_spots: str,
    #   ideal_work_environment: str,
    #   career_recommendations: [{
    #     career_name, why_it_fits, required_skills[],
    #     first_action, estimated_income_range, future_growth_potential
    #   }],
    #   long_term_vision: str,
    #   skill_development_roadmap: str,
    #   decision_making_guide: str,
    #   action_plan: str[],
    #   closing_statement: str
    # }

    # ── Generation Metadata ───────────────────────────────────────────────────
    ai_model_used:      Mapped[str]      = mapped_column(String(100), nullable=False)
    ai_prompt_version:  Mapped[str]      = mapped_column(String(50),  nullable=False)
    generation_tokens:  Mapped[int|None] = mapped_column(Integer, nullable=True)
    generation_ms:      Mapped[int|None] = mapped_column(Integer, nullable=True)

    # ── Relationships ─────────────────────────────────────────────────────────
    submission: Mapped["Submission"]    = relationship("Submission",   back_populates="report")
    token:      Mapped["ReportToken"]   = relationship("ReportToken",  back_populates="report", uselist=False)

    def __repr__(self) -> str:
        return f"<Report id={self.id} submission_id={self.submission_id}>"
