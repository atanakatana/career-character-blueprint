from pydantic import BaseModel, Field, field_validator
from app.schemas.submission import _MBTI_TYPES, _HD_TYPES, _HD_AUTHORITIES, _HD_PROFILES


class TrialReadingRequest(BaseModel):
    """
    Same MBTI/HD vocabulary as SubmissionCreate, reused rather than
    redefined. No email, no payment check — this endpoint is free and
    unauthenticated by design.
    """
    mbti_type:    str = Field(..., description="MBTI type or UNKNOWN")
    hd_type:      str = Field(..., description="Human Design type or UNKNOWN")
    hd_authority: str = Field(..., description="Human Design authority or UNKNOWN")
    hd_profile:   str = Field(..., description="Human Design profile or UNKNOWN")

    model_config = {"str_strip_whitespace": True}

    @field_validator("mbti_type")
    @classmethod
    def validate_mbti(cls, v: str) -> str:
        if v not in _MBTI_TYPES:
            raise ValueError(f"Invalid MBTI type: {v!r}")
        return v

    @field_validator("hd_type")
    @classmethod
    def validate_hd_type(cls, v: str) -> str:
        if v not in _HD_TYPES:
            raise ValueError(f"Invalid HD type: {v!r}")
        return v

    @field_validator("hd_authority")
    @classmethod
    def validate_hd_authority(cls, v: str) -> str:
        if v not in _HD_AUTHORITIES:
            raise ValueError(f"Invalid HD authority: {v!r}")
        return v

    @field_validator("hd_profile")
    @classmethod
    def validate_hd_profile(cls, v: str) -> str:
        if v not in _HD_PROFILES:
            raise ValueError(f"Invalid HD profile: {v!r}")
        return v


class TrialReadingResponse(BaseModel):
    """
    The free preview shown immediately after the assessment. Deliberately
    thin — assembled from static knowledge JSON only, never an AI call —
    so it renders instantly and costs nothing.
    """
    character_archetype:         str
    personality_summary:         str
    core_strengths:              list[str]
    energy_type:                 str
    basic_career_recommendation: str

    # Echoed back so the frontend can use it to seed the habit tracker
    # after the user unlocks their full account, without a second round trip.
    mbti_type: str
