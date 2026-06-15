from pydantic import BaseModel, Field


class CareerRecommendation(BaseModel):
    career_name:             str = Field(..., min_length=1)
    why_it_fits:             str = Field(..., min_length=10)
    required_skills:         list[str] = Field(..., min_length=1)
    first_action:            str = Field(..., min_length=10)
    estimated_income_range:  str = Field(..., min_length=1)
    future_growth_potential: str = Field(..., min_length=10)


class AIOutput(BaseModel):
    """
    Full schema for what the AI is asked to return.
    `character_title` is extracted and stored as a separate DB column.
    The remaining 10 fields are stored together in the `report_data` JSONB column.
    """

    character_title:           str = Field(..., min_length=1, max_length=255)
    profile_summary:           str = Field(..., min_length=50)
    capacity_and_energy:       str = Field(..., min_length=50)
    blind_spots:               str = Field(..., min_length=50)
    ideal_work_environment:    str = Field(..., min_length=50)
    career_recommendations:    list[CareerRecommendation] = Field(..., min_length=2, max_length=5)
    long_term_vision:          str = Field(..., min_length=50)
    skill_development_roadmap: str = Field(..., min_length=50)
    decision_making_guide:     str = Field(..., min_length=50)
    action_plan:               list[str] = Field(..., min_length=3, max_length=10)
    closing_statement:         str = Field(..., min_length=20)

    def to_report_data(self) -> dict:
        """Returns the JSONB-storable dict, excluding character_title."""
        data = self.model_dump()
        data.pop("character_title", None)
        return data
