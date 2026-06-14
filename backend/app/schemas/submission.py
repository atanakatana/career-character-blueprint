from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator

# ─── Valid values ────────────────────────────────────────────────────────────
_MBTI_TYPES = {
    "ISTJ","ISFJ","INFJ","INTJ",
    "ISTP","ISFP","INFP","INTP",
    "ESTP","ESFP","ENFP","ENTP",
    "ESTJ","ESFJ","ENFJ","ENTJ",
    "UNKNOWN",
}

_HD_TYPES = {
    "Generator", "Manifesting Generator",
    "Projector", "Manifestor", "Reflector",
    "UNKNOWN",
}

_HD_AUTHORITIES = {
    "Sacral", "Emotional / Solar Plexus", "Splenic",
    "Ego / Heart", "Self-Projected",
    "Mental / Environmental", "Lunar",
    "UNKNOWN",
}

_HD_PROFILES = {
    "1/3 — Investigator / Martyr",   "1/4 — Investigator / Opportunist",
    "2/4 — Hermit / Opportunist",    "2/5 — Hermit / Heretic",
    "3/5 — Martyr / Heretic",        "3/6 — Martyr / Role Model",
    "4/6 — Opportunist / Role Model","4/1 — Opportunist / Investigator",
    "5/1 — Heretic / Investigator",  "5/2 — Heretic / Hermit",
    "6/2 — Role Model / Hermit",     "6/3 — Role Model / Martyr",
    "UNKNOWN",
}


# ─── REQUEST ─────────────────────────────────────────────────────────────────
class SubmissionCreate(BaseModel):
    nickname:           str      = Field(..., min_length=1, max_length=100)
    email:              EmailStr
    mbti_type:          str      = Field(..., description="MBTI type or UNKNOWN")
    hd_type:            str      = Field(..., description="Human Design type or UNKNOWN")
    hd_authority:       str      = Field(..., description="Human Design authority or UNKNOWN")
    hd_profile:         str      = Field(..., description="Human Design profile or UNKNOWN")
    current_occupation: str      = Field(..., min_length=1, max_length=500)
    burnout_triggers:   str      = Field(..., min_length=1, max_length=2000)
    success_vision:     str      = Field(..., min_length=1, max_length=2000)

    @field_validator("mbti_type")
    @classmethod
    def validate_mbti(cls, v: str) -> str:
        if v not in _MBTI_TYPES:
            raise ValueError(f"Invalid MBTI type: {v!r}. Must be one of the 16 types or UNKNOWN.")
        return v

    @field_validator("hd_type")
    @classmethod
    def validate_hd_type(cls, v: str) -> str:
        if v not in _HD_TYPES:
            raise ValueError(f"Invalid HD type: {v!r}.")
        return v

    @field_validator("hd_authority")
    @classmethod
    def validate_hd_authority(cls, v: str) -> str:
        if v not in _HD_AUTHORITIES:
            raise ValueError(f"Invalid HD authority: {v!r}.")
        return v

    @field_validator("hd_profile")
    @classmethod
    def validate_hd_profile(cls, v: str) -> str:
        if v not in _HD_PROFILES:
            raise ValueError(f"Invalid HD profile: {v!r}.")
        return v

    model_config = {"str_strip_whitespace": True}


# ─── RESPONSES ───────────────────────────────────────────────────────────────
class SubmissionResponse(BaseModel):
    id:      UUID
    status:  str
    message: str

    model_config = {"from_attributes": True}


class SubmissionSummary(BaseModel):
    """Lightweight summary embedded in report responses."""
    id:           UUID
    nickname:     str
    email:        str
    mbti_type:    str
    hd_type:      str
    hd_authority: str
    hd_profile:   str
    status:       str
    created_at:   datetime

    model_config = {"from_attributes": True}


class SubmissionListItem(BaseModel):
    id:           UUID
    nickname:     str
    email:        str
    mbti_type:    str
    hd_type:      str
    status:       str
    created_at:   datetime
    celery_task_id: str | None

    model_config = {"from_attributes": True}


class PaginatedSubmissions(BaseModel):
    items:  list[SubmissionListItem]
    total:  int
    skip:   int
    limit:  int
