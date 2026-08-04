from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.api.routes import health, submissions, reports, admin, payments, auth, trial, habits, users


@asynccontextmanager
async def lifespan(app: FastAPI):
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
