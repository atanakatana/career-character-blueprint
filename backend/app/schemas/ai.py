from pydantic import BaseModel, Field


class CareerRecommendation(BaseModel):
    career_name:             str       = Field(..., min_length=1)
    why_it_fits:             str       = Field(..., min_length=10)
    required_skills:         list[str] = Field(..., min_length=1)
    first_action:            str       = Field(..., min_length=10)
    estimated_income_range:  str       = Field(..., min_length=1)
    future_growth_potential: str       = Field(..., min_length=10)


class WorkEnvironment(BaseModel):
    """v2 structured environment — explicit pros/cons lists instead of prose."""
    pros: list[str] = Field(..., min_length=2, max_length=6)
    cons: list[str] = Field(..., min_length=1, max_length=4)


class AIOutput(BaseModel):
    """
    v2 schema — structured arrays replace prose strings wherever the UI
    renders bullet points.  closing_statement stays as prose (it is a
    paragraph-length sign-off, not a list).

    Fields stored in the report_data JSONB column:
      profile_summary, capacity_and_energy, blind_spots,
      ideal_work_environment, career_recommendations,
      long_term_vision, skill_development_roadmap,
      decision_making_guide, action_plan, closing_statement

    character_title is stored as a separate DB column and excluded from
    report_data via to_report_data().
    """

    character_title:           str                        = Field(..., min_length=1,  max_length=255)

    # ── v2: short-phrase arrays ───────────────────────────────────────────────
    profile_summary:           list[str]                  = Field(..., min_length=3,  max_length=5)
    capacity_and_energy:       list[str]                  = Field(..., min_length=2,  max_length=5)
    blind_spots:               list[str]                  = Field(..., min_length=2,  max_length=5)
    ideal_work_environment:    WorkEnvironment
    long_term_vision:          list[str]                  = Field(..., min_length=3,  max_length=5)
    skill_development_roadmap: list[str]                  = Field(..., min_length=3,  max_length=6)
    decision_making_guide:     list[str]                  = Field(..., min_length=3,  max_length=6)

    # ── unchanged from v1 ────────────────────────────────────────────────────
    career_recommendations:    list[CareerRecommendation] = Field(..., min_length=2,  max_length=5)
    action_plan:               list[str]                  = Field(..., min_length=3,  max_length=10)
    closing_statement:         str                        = Field(..., min_length=20)

    def to_report_data(self) -> dict:
        """Returns the JSONB-storable dict, excluding character_title."""
        data = self.model_dump()
        data.pop("character_title", None)
        return data
