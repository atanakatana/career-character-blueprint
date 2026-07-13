import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.submission import Submission
from app.models.payment import Payment
from app.schemas.submission import SubmissionCreate, SubmissionResponse
from app.celery_app import celery_app

router = APIRouter(prefix="/submissions", tags=["Submissions"])
logger = logging.getLogger(__name__)


@router.post(
    "",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=SubmissionResponse,
    summary="Create a new career blueprint submission",
)
async def create_submission(
    data: SubmissionCreate,
    db: AsyncSession = Depends(get_db),
) -> SubmissionResponse:
    """
    Accepts user form data, persists it, and enqueues an async AI generation task.

    Returns 202 Accepted immediately — the blueprint is generated in the background
    and delivered via email when ready.
    """
    # ── 0. Verify payment ──────────────────────────────────────────────────
    # The submission form is gated behind a Mayar.id payment.
    # A valid paid payment must exist for this email before we accept a submission.
    payment: Payment | None = await db.scalar(
        select(Payment)
        .where(Payment.email == data.email.lower().strip())
        .where(Payment.status == "paid")
        .order_by(Payment.paid_at.desc())
        .limit(1)
    )
    if payment is None:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Payment required. Please complete payment at /pricing before submitting.",
        )

    # ── 1. Persist the submission ──────────────────────────────────────────
    submission = Submission(**data.model_dump())
    db.add(submission)
    await db.flush()  # Assign ID before referencing in task

    submission_id = str(submission.id)

    # 2. Enqueue the Celery task
    #    The task is a stub in Sprint 2 and will be fully implemented in Sprint 5.
    #    We catch errors here so a Redis outage doesn't prevent form submission.
    try:
        task = celery_app.send_task(
            "app.tasks.generate_blueprint",
            args=[submission_id],
        )
        submission.celery_task_id = task.id
        logger.info(f"Task enqueued: {task.id} for submission {submission_id}")
    except Exception as exc:
        logger.error(
            f"Failed to enqueue task for submission {submission_id}: {exc}. "
            "Submission saved — task can be re-triggered from the admin panel."
        )

    await db.commit()

    return SubmissionResponse(
        id=submission.id,
        status="pending",
        message=(
            "Your Career Blueprint is being generated. "
            "You will receive an email with your unique report link within a few minutes."
        ),
    )
