"""
Celery task definitions.
Sprint 2: stub task that logs and acknowledges receipt.
Sprint 5: full AI generation pipeline.
"""
import asyncio
import logging

from app.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(
    bind=True,
    name="app.tasks.generate_blueprint",
    max_retries=2,
    default_retry_delay=30,
)
def generate_blueprint(self, submission_id: str):
    """
    Main pipeline task: generates the career blueprint for a submission.

    Sprint 2 stub — logs receipt and returns.
    Sprint 5 will implement:
      1. Load knowledge context (MBTI + HD JSON files)
      2. Construct prompt from active template
      3. Call AI Gateway (Gemini → AIProvider interface)
      4. Parse and validate JSON response
      5. Save Report + ReportToken to DB
      6. Update Submission status → completed
      7. Enqueue send_blueprint_email task
    """
    logger.info(f"[generate_blueprint] Received submission_id={submission_id}")
    asyncio.run(_acknowledge_stub(submission_id))
    logger.info(f"[generate_blueprint] Stub complete for submission_id={submission_id}")
    return {"status": "stub_ok", "submission_id": submission_id}


async def _acknowledge_stub(submission_id: str) -> None:
    """
    Minimal async operation: just confirms the worker can reach the DB.
    Sprint 5 replaces this with the full generation logic.
    """
    from app.database import AsyncSessionLocal
    from app.models.submission import Submission
    from sqlalchemy import select

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(Submission.id, Submission.email, Submission.status)
            .where(Submission.id == submission_id)
        )
        row = result.one_or_none()
        if row:
            logger.info(
                f"[stub] Submission confirmed in DB: "
                f"id={row.id} email={row.email} status={row.status}"
            )
        else:
            logger.warning(f"[stub] Submission {submission_id} not found in DB")


@celery_app.task(
    bind=True,
    name="app.tasks.send_blueprint_email",
    max_retries=3,
    default_retry_delay=60,
)
def send_blueprint_email(self, submission_id: str, token: str):
    """
    Email delivery task.
    Sprint 2 stub.
    Sprint 6 will implement Resend API integration.
    """
    logger.info(
        f"[send_blueprint_email] Stub called: submission_id={submission_id} token={token[:8]}..."
    )
    return {"status": "stub_ok", "submission_id": submission_id}
