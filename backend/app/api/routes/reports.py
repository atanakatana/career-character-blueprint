import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.report_token import ReportToken
from app.models.report import Report
from app.schemas.report import BlueprintReportResponse, ReportData
from app.schemas.submission import SubmissionSummary

router = APIRouter(prefix="/reports", tags=["Reports"])
logger = logging.getLogger(__name__)


@router.get(
    "/{token}",
    response_model=BlueprintReportResponse,
    summary="Retrieve a career blueprint report by its access token",
)
async def get_report_by_token(
    token: str,
    db: AsyncSession = Depends(get_db),
) -> BlueprintReportResponse:
    """
    Fetches the full career blueprint report associated with a unique token.
    The token is delivered via email after the report is generated.
    Returns 404 for any unknown token.
    """
    # 1. Resolve token → report → submission
    result = await db.execute(
        select(ReportToken)
        .where(ReportToken.token == token)
        .options(
            selectinload(ReportToken.report).selectinload(Report.submission)
        )
    )
    report_token: ReportToken | None = result.scalar_one_or_none()

    if report_token is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found. Please check your email link.",
        )

    # 2. Atomic access counter increment
    await db.execute(
        update(ReportToken)
        .where(ReportToken.id == report_token.id)
        .values(
            accessed_count=ReportToken.accessed_count + 1,
            last_accessed_at=func.now(),
        )
    )
    await db.commit()

    report = report_token.report
    submission = report.submission

    # 3. Validate JSONB report_data through the Pydantic schema
    try:
        parsed_report_data = ReportData(**report.report_data)
    except Exception as exc:
        logger.error(f"Report data validation failed for report {report.id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Report data is malformed. Please contact support.",
        )

    return BlueprintReportResponse(
        id=report.id,
        character_title=report.character_title,
        report_data=parsed_report_data,
        ai_model_used=report.ai_model_used,
        created_at=report.created_at,
        submission=SubmissionSummary(
            id=submission.id,
            nickname=submission.nickname,
            email=submission.email,
            mbti_type=submission.mbti_type,
            hd_type=submission.hd_type,
            hd_authority=submission.hd_authority,
            hd_profile=submission.hd_profile,
            status=submission.status,
            created_at=submission.created_at,
        ),
    )
