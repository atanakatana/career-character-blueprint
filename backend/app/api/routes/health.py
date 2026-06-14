import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from redis import asyncio as aioredis

from app.database import get_db
from app.config import settings

router = APIRouter(tags=["System"])
logger = logging.getLogger(__name__)


@router.get("/health", summary="Basic liveness check")
async def health_check():
    """Returns 200 as long as the API process is running."""
    return {
        "status": "ok",
        "service": "character-career-blueprint-api",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/health/detailed", summary="Checks API, DB, and Redis")
async def health_check_detailed(db: AsyncSession = Depends(get_db)):
    """
    Pings PostgreSQL and Redis in addition to the basic liveness check.
    Returns overall status: ok | degraded.
    """
    checks: dict[str, str] = {}

    # ── PostgreSQL ────────────────────────────────────────────────────────────
    try:
        await db.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as exc:
        logger.error(f"DB health check failed: {exc}")
        checks["database"] = "error"

    # ── Redis ─────────────────────────────────────────────────────────────────
    try:
        r = aioredis.from_url(settings.REDIS_URL, socket_connect_timeout=2)
        await r.ping()
        await r.aclose()
        checks["redis"] = "ok"
    except Exception as exc:
        logger.error(f"Redis health check failed: {exc}")
        checks["redis"] = "error"

    overall = "ok" if all(v == "ok" for v in checks.values()) else "degraded"

    return {
        "status": overall,
        "service": "character-career-blueprint-api",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "checks": checks,
    }
