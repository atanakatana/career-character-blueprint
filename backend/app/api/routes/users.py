import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.submission import Submission
from app.models.report import Report
from app.models.report_token import ReportToken
from app.schemas.report import BlueprintReportResponse, ReportData
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
    Links the account to the existing (unmodified) paid-report pipeline by
    matching email — the same identifier the pricing/create flow already
    uses to gate submissions. No foreign key on `submissions` needed.

    Case-insensitive on purpose: `submissions.email` is stored as typed by
    the user (SubmissionCreate does not normalise case), while `users.email`
    is always lowercased at registration/login. Comparing case-sensitively
    would silently miss a real, paid submission over a casing mismatch.
    """
    submission = await db.scalar(
        select(Submission)
        .where(func.lower(Submission.email) == user.email.lower().strip())
        .options(selectinload(Submission.report))
        .order_by(Submission.created_at.desc())
        .limit(1)
    )

    if submission is None:
        return MyBlueprintResponse(unlocked=False, status="none")

    if submission.status in ("pending", "processing"):
        return MyBlueprintResponse(unlocked=False, status=submission.status)

    if submission.status == "failed":
        return MyBlueprintResponse(unlocked=False, status="failed")

    report: Report | None = submission.report
    if report is None:
        # Marked completed but report missing — treat as still processing
        # rather than erroring the dashboard.
        return MyBlueprintResponse(unlocked=False, status="processing")

    try:
        parsed_report_data = ReportData(**report.report_data)
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
        report=BlueprintReportResponse(
            id=report.id,
            character_title=report.character_title,
            report_data=parsed_report_data,
            ai_model_used=report.ai_model_used,
            created_at=report.created_at,
            submission=SubmissionSummary.model_validate(submission),
        ),
    )
