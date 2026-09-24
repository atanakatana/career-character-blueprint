import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.core.dependencies import get_current_user
from app.core.entitlements import get_paid_tier
from app.models.user import User
from app.models.submission import Submission
from app.models.report import Report
from app.models.report_token import ReportToken
from app.schemas.report import BlueprintReportResponse, parse_report_data
from app.schemas.submission import SubmissionSummary
from app.schemas.users import MyBlueprintResponse

router = APIRouter(prefix="/users", tags=["Users"])
logger = logging.getLogger(__name__)


@router.get(
    "/me/blueprint",
    response_model=MyBlueprintResponse,
    summary="Get the logged-in user's Blueprint, if one has been generated",
)
async def get_my_blueprint(
    db:   AsyncSession = Depends(get_db),
    user: User          = Depends(get_current_user),
) -> MyBlueprintResponse:
    """
    Links the account to the existing paid-report pipeline via
    `Submission.user_id`, set at *creation* time by the authenticated
    session that created it (see api/routes/submissions.py) — actual proof
    of ownership, not an unverified string match.

    Until 2026-08-13 this matched purely by email string (`users.email` vs
    `submissions.email`), with no foreign key. That was a real vulnerability:
    registration has no email verification, so anyone who knew a paying
    customer's email could register an account with it and immediately view
    that customer's paid report. Fixed in 004_submissions_user_id.py, which
    also backfilled `user_id` for every pre-fix row (safe because this
    project has never run against a database with real customers — confirmed
    2026-09-23). A submission whose email matches no registered user is
    simply unreachable here, same as one that was never submitted — there is
    no longer an email-match fallback.
    """
    tier = await get_paid_tier(db, user.email)

    submission = await db.scalar(
        select(Submission)
        .where(Submission.user_id == user.id)
        .options(selectinload(Submission.report))
        .order_by(Submission.created_at.desc())
        .limit(1)
    )

    if submission is None:
        return MyBlueprintResponse(unlocked=False, status="none", tier=tier)

    if submission.status in ("pending", "processing"):
        return MyBlueprintResponse(unlocked=False, status=submission.status, tier=tier)

    if submission.status == "failed":
        return MyBlueprintResponse(unlocked=False, status="failed", tier=tier)

    report: Report | None = submission.report
    if report is None:
        # Marked completed but report missing — treat as still processing
        # rather than erroring the dashboard.
        return MyBlueprintResponse(unlocked=False, status="processing", tier=tier)

    try:
        parsed_report_data = parse_report_data(report.report_data)
    except Exception as exc:
        logger.error(f"[users] Report data validation failed for report {report.id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Blueprint data is malformed. Please contact support.",
        )

    token = await db.scalar(select(ReportToken.token).where(ReportToken.report_id == report.id))

    return MyBlueprintResponse(
        unlocked=True,
        status="completed",
        token=token,
        tier=tier,
        report=BlueprintReportResponse(
            id=report.id,
            character_title=report.character_title,
            report_data=parsed_report_data,
            ai_model_used=report.ai_model_used,
            created_at=report.created_at,
            submission=SubmissionSummary.model_validate(submission),
        ),
    )
