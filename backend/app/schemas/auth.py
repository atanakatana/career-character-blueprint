from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


# ─── REGISTER / LOGIN ────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email:    EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    nickname: str = Field(..., min_length=1, max_length=100)

    model_config = {"str_strip_whitespace": True}


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str

    model_config = {"str_strip_whitespace": True}


class AuthResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    expires_in:   int  # seconds


# ─── PROFILE ─────────────────────────────────────────────────────────────────
class UserProfile(BaseModel):
    id:            UUID
    email:         str
    nickname:      str
    is_active:     bool
    last_login_at: datetime | None
    created_at:    datetime

    model_config = {"from_attributes": True}
