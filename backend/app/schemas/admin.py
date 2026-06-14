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
