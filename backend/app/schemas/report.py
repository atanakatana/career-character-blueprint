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


class WorkEnvironment(BaseModel):
    pros: list[str]
    cons: list[str]


class ReportData(BaseModel):
    """Maps 1:1 to the JSONB report_data column schema (v2, v1-compatible)."""
    profile_summary:           list[str] | str
    capacity_and_energy:       list[str] | str
    blind_spots:               list[str] | str
    ideal_work_environment:    WorkEnvironment | str
    career_recommendations:    list[CareerRecommendation]
    long_term_vision:          list[str] | str
    skill_development_roadmap: list[str] | str
    decision_making_guide:     list[str] | str
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
