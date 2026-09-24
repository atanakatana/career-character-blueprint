from uuid import UUID
from datetime import datetime
from typing import Union
from pydantic import BaseModel
from app.schemas.submission import SubmissionSummary


# ─── v3 REPORT SUB-TYPES (current — Sprint 11 "7-section" format) ────────────
# Mirrors frontend/src/lib/types.ts exactly — keep both in sync when the
# active prompt template (scripts/seed.py PROMPT_TEXT_V3) changes shape.

class ProfileLine(BaseModel):
    line_name:   str
    title:       str
    body:        str
    implication: str | None = None


class BlindSpotV3(BaseModel):
    name:      str
    mechanism: str
    scenario:  str


class CareerArena(BaseModel):
    career_name:       str
    career_subtitle:   str
    why_it_fits:       str
    existing_skills:   list[str]
    skills_to_develop: list[str]
    is_best_fit:       bool
    first_action:      str


class DailyQuest(BaseModel):
    name:          str
    description:   str
    time_estimate: str


class ReportDataV3(BaseModel):
    """Maps 1:1 to the JSONB report_data column for reports generated with
    the active v3 prompt template. Detected by the presence of
    `system_message` — see parse_report_data() below."""
    system_message:      str
    character_tagline:   str
    character_domain:    str
    conflict_mechanism:  str
    conflict_result:     str
    profile_intro:       str
    profile_lines:       list[ProfileLine]
    profile_synthesis:   str
    blind_spots:         list[BlindSpotV3]
    career_arenas:       list[CareerArena]
    decision_intro:      str
    decision_question:   str
    decision_yes_signal: str
    decision_no_signal:  str
    decision_trap_name:  str
    decision_trap_body:  str
    daily_quests:        list[DailyQuest]
    closing_statement:   str


# ─── v2 REPORT SUB-TYPES (legacy — kept for backward compat with old rows) ───

class WorkEnvironment(BaseModel):
    pros: list[str]
    cons: list[str]


class CareerRecommendation(BaseModel):
    career_name:              str
    why_it_fits:              str
    required_skills:          list[str]
    first_action:             str
    estimated_income_range:   str
    future_growth_potential:  str


class ReportDataV2(BaseModel):
    """v1/v2 prompt output shape — superseded by ReportDataV3 but a handful
    of pre-Sprint-11 rows may still carry this shape."""
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


ReportData = Union[ReportDataV3, ReportDataV2]


def parse_report_data(raw: dict) -> ReportData:
    """Dispatches on `system_message`, the v3 marker field — mirrors
    frontend/src/lib/types.ts::isV3 exactly, rather than relying on
    Pydantic's own (slower, less explicit) union resolution."""
    if "system_message" in raw:
        return ReportDataV3(**raw)
    return ReportDataV2(**raw)


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
