from uuid import UUID
from datetime import datetime
from pydantic import BaseModel
from app.schemas.submission import SubmissionSummary


# ─── NESTED REPORT DATA ──────────────────────────────────────────────────────
class CareerRecommendation(BaseModel):
    career_name:              str
    why_it_fits:              str
    required_skills:          list[str]
    first_action:             str
    estimated_income_range:   str
    future_growth_potential:  str


class ReportData(BaseModel):
    """Maps 1:1 to the JSONB report_data column schema."""
    profile_summary:           str
    capacity_and_energy:       str
    blind_spots:               str
    ideal_work_environment:    str
    career_recommendations:    list[CareerRecommendation]
    long_term_vision:          str
    skill_development_roadmap: str
    decision_making_guide:     str
    action_plan:               list[str]
    closing_statement:         str


# ─── REPORT RESPONSES ────────────────────────────────────────────────────────
class BlueprintReportResponse(BaseModel):
    """Full blueprint report returned to the user via their unique link."""
    id:              UUID
    character_title: str
    report_data:     ReportData
    ai_model_used:   str
    created_at:      datetime
    submission:      SubmissionSummary

    model_config = {"from_attributes": True}


class ReportListItem(BaseModel):
    """Lightweight item for admin report list."""
    id:              UUID
    submission_id:   UUID
    character_title: str
    ai_model_used:   str
    created_at:      datetime

    model_config = {"from_attributes": True}
