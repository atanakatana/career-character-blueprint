from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ────────────────────────────────────────────────────────
    APP_NAME: str = "Re:Lumma API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # ── Database ───────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://ccblueprint:devpassword@postgres:5432/ccblueprint"

    # ── Redis ──────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://redis:6379/0"

    # ── Security ───────────────────────────────────────────────────────────
    REPORT_TOKEN_SECRET: str = "change-this-in-production"
    ADMIN_SECRET_KEY: str = "change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 8  # 8 hours

    # ── AI Providers ───────────────────────────────────────────────────────
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    OPENROUTER_API_KEY: Optional[str] = None

    # ── Email (Resend) ─────────────────────────────────────────────────────
    RESEND_API_KEY:    Optional[str] = None
    RESEND_FROM_EMAIL: str = "noreply@yourdomain.com"
    RESEND_FROM_NAME:  str = "Re:Lumma"

    # ── Frontend ───────────────────────────────────────────────────────────
    FRONTEND_BASE_URL: str = "http://localhost:3000"

    # ── External Links (configurable from env) ─────────────────────────────
    MBTI_EXTERNAL_URL: str = "https://www.16personalities.com/"
    HD_EXTERNAL_URL: str = "https://www.jovianarchive.com/get_your_chart"

    # ── Mayar.id Payment Gateway ────────────────────────────────────────────
    MAYAR_API_KEY:    Optional[str] = None
    MAYAR_PRODUCTION: bool          = False  # False = sandbox (api.mayar.club)

    # Tier pricing in IDR
    TIER1_PRICE: int = 149_000   # Career Blueprint only
    TIER2_PRICE: int = 299_000   # Career Blueprint + Habit Tracker

    # ── CORS ───────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:80",
        "http://localhost",
    ]


settings = Settings()
