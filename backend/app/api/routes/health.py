from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter(tags=["System"])


@router.get("/health", summary="Basic health check")
async def health_check():
    """Returns 200 if the API process is running."""
    return {
        "status": "ok",
        "service": "character-career-blueprint-api",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/health/detailed", summary="Detailed health check")
async def health_check_detailed():
    """
    Checks API + downstream dependencies.
    DB and Redis checks are wired up in Sprint 2.
    """
    return {
        "status": "ok",
        "service": "character-career-blueprint-api",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "checks": {
            "api": "ok",
            "database": "pending_sprint_2",
            "redis": "pending_sprint_2",
            "worker": "pending_sprint_2",
        },
    }
