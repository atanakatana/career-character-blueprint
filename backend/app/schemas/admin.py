from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr


# ─── AUTH ────────────────────────────────────────────────────────────────────
class AdminLoginRequest(BaseModel):
    email:    EmailStr
    password: str


class AdminLoginResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    expires_in:   int  # seconds


class AdminProfile(BaseModel):
    id:            UUID
    email:         str
    is_active:     bool
    last_login_at: datetime | None
    created_at:    datetime

    model_config = {"from_attributes": True}


# ─── SUBMISSION DETAIL (admin) ────────────────────────────────────────────────
class AdminSubmissionDetail(BaseModel):
    """Full submission data for the admin detail view."""
    id:                      UUID
    nickname:                str
    email:                   str
    mbti_type:               str
    hd_type:                 str
    hd_authority:            str
    hd_profile:              str
    current_occupation:      str
    burnout_triggers:        str
    success_vision:          str
    status:                  str
    created_at:              datetime
    celery_task_id:          str | None
    processing_started_at:   datetime | None
    processing_completed_at: datetime | None
    error_message:           str | None
    retry_count:             int
    report_token:            str | None = None   # populated from ReportToken join

    model_config = {"from_attributes": True}


# ─── EMAIL LOG ────────────────────────────────────────────────────────────────
class EmailLogResponse(BaseModel):
    id:                 UUID
    submission_id:      UUID
    email_type:         str
    recipient_email:    str
    resend_message_id:  str | None
    status:             str
    error_message:      str | None
    created_at:         datetime

    model_config = {"from_attributes": True}


# ─── PROMPT TEMPLATE ─────────────────────────────────────────────────────────
class PromptTemplateCreate(BaseModel):
    name:           str
    version:        str
    prompt_text:    str
    system_context: str
    notes:          str | None = None


class PromptTemplateUpdate(BaseModel):
    prompt_text:    str | None = None
    system_context: str | None = None
    notes:          str | None = None


class PromptTemplateResponse(BaseModel):
    id:             UUID
    name:           str
    version:        str
    is_active:      bool
    prompt_text:    str
    system_context: str
    notes:          str | None
    created_at:     datetime
    updated_at:     datetime

    model_config = {"from_attributes": True}


# ─── AI MODEL CONFIG ──────────────────────────────────────────────────────────
class AIModelConfigCreate(BaseModel):
    provider:        str
    model_name:      str
    api_key_env_var: str
    max_tokens:      int   = 8000
    temperature:     float = 0.7
    config_json:     dict | None = None


class AIModelConfigResponse(BaseModel):
    id:              UUID
    provider:        str
    model_name:      str
    is_active:       bool
    api_key_env_var: str
    max_tokens:      int
    temperature:     float
    config_json:     dict | None
    created_at:      datetime

    model_config = {"from_attributes": True}
