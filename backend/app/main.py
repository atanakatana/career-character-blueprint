from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.api.routes import health, submissions, reports, admin, payments, auth, trial, habits, users

# Values config.py falls back to when the corresponding env var isn't set.
# Fine for local dev; catastrophic in production, since ADMIN_SECRET_KEY signs
# every JWT (both admin and end-user auth — see core/security.py) and
# REPORT_TOKEN_SECRET protects report access tokens. Booting production with
# either still equal to this string means anyone who has read this file (it's
# in git) can forge tokens.
_INSECURE_DEFAULT = "change-this-in-production"


def _assert_production_secrets_are_set() -> None:
    if settings.ENVIRONMENT != "production":
        return
    insecure = [
        name for name, value in (
            ("ADMIN_SECRET_KEY", settings.ADMIN_SECRET_KEY),
            ("REPORT_TOKEN_SECRET", settings.REPORT_TOKEN_SECRET),
        )
        if value == _INSECURE_DEFAULT
    ]
    if insecure:
        raise RuntimeError(
            "Refusing to start with ENVIRONMENT=production while these "
            f"settings still use their insecure default value: {', '.join(insecure)}. "
            "Set real secrets in .env — e.g. "
            "python -c \"import secrets; print(secrets.token_hex(32))\""
        )


@asynccontextmanager
async def lifespan(app: FastAPI):
    _assert_production_secrets_are_set()
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"📍 Environment: {settings.ENVIRONMENT}")
    yield
    print("👋 Shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI-powered career guidance platform combining MBTI, "
        "Human Design, and career psychology."
    ),
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# ── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(health.router,       prefix="/api")
app.include_router(payments.router,     prefix="/api")
app.include_router(submissions.router,  prefix="/api")
app.include_router(reports.router,      prefix="/api")
app.include_router(admin.router,        prefix="/api")

# Re:Lumma accounts, trial reading, and habit tracker — all additive, none of
# them touch the payment-gated submission/report pipeline above.
app.include_router(auth.router,         prefix="/api")
app.include_router(trial.router,        prefix="/api")
app.include_router(habits.router,       prefix="/api")
app.include_router(users.router,        prefix="/api")
