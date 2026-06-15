"""
Celery tasks — Sprint 5: full AI generation pipeline.
"""
import asyncio
import logging
import os
import time
from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.celery_app import celery_app
from app.database import AsyncSessionLocal
from app.models.submission import Submission
from app.models.report import Report
from app.models.report_token import ReportToken
from app.models.prompt_template import PromptTemplate
from app.models.ai_model_config import AIModelConfig
from app.ai.gateway import AIConfig
from app.ai.providers.gemini import GeminiProvider
from app.ai.knowledge import knowledge_loader
from app.ai.prompt_builder import prompt_builder
from app.ai.output_parser import output_parser

logger = logging.getLogger(__name__)


# ─── Main generation task ─────────────────────────────────────────────────────

@celery_app.task(
    bind=True,
    name="app.tasks.generate_blueprint",
    max_retries=2,
    default_retry_delay=30,
)
def generate_blueprint(self, submission_id: str):
    """
    Full AI generation pipeline.
    Retries up to 2 times on failure (30s, 60s backoff).
    After all retries exhausted, marks submission as 'failed'.
    """
    logger.info(
        f"[generate_blueprint] START submission={submission_id} "
        f"attempt={self.request.retries + 1}/{self.max_retries + 1}"
    )

    try:
        asyncio.run(_pipeline(submission_id))
        logger.info(f"[generate_blueprint] DONE submission={submission_id}")

    except Exception as exc:
        is_final = self.request.retries >= self.max_retries

        if is_final:
            logger.error(
                f"[generate_blueprint] PERMANENT FAILURE submission={submission_id}: {exc}"
            )
            try:
                asyncio.run(_mark_failed(submission_id, str(exc)))
            except Exception as inner:
                logger.error(f"[generate_blueprint] Could not mark failed: {inner}")
        else:
            backoff = 30 * (self.request.retries + 1)
            logger.warning(
                f"[generate_blueprint] RETRY in {backoff}s "
                f"submission={submission_id}: {exc}"
            )
            raise self.retry(exc=exc, countdown=backoff)


@celery_app.task(
    bind=True,
    name="app.tasks.send_blueprint_email",
    max_retries=3,
    default_retry_delay=60,
)
def send_blueprint_email(self, submission_id: str, token: str):
    """
    Email delivery task.
    Sprint 6 will implement the Resend API integration.
    This stub logs so the pipeline can be verified end-to-end.
    """
    logger.info(
        f"[send_blueprint_email] submission={submission_id} "
        f"token={token[:12]}... (Sprint 6: email delivery)"
    )


# ─── Async pipeline ───────────────────────────────────────────────────────────

async def _pipeline(submission_id: str) -> None:
    """Complete async generation pipeline — runs inside asyncio.run()."""
    t_start = time.time()

    async with AsyncSessionLocal() as db:

        # 1. Load submission
        submission = await db.scalar(
            select(Submission).where(Submission.id == submission_id)
        )
        if not submission:
            raise ValueError(f"Submission not found: {submission_id}")

        # 2. Mark processing
        await db.execute(
            update(Submission)
            .where(Submission.id == submission_id)
            .values(
                status="processing",
                processing_started_at=datetime.now(timezone.utc),
            )
        )
        await db.commit()

        logger.info(
            f"[pipeline] Processing: {submission.nickname} | "
            f"MBTI={submission.mbti_type} HD={submission.hd_type}"
        )

        # 3. Load knowledge context
        knowledge_ctx = knowledge_loader.load_context(
            submission.mbti_type,
            submission.hd_type,
            submission.hd_authority,
            submission.hd_profile,
        )

        # 4. Load active prompt template
        template = await _get_active_template(db)

        # 5. Build prompts
        system_prompt, user_prompt = prompt_builder.build(
            submission, knowledge_ctx, template
        )

        # 6. Load active AI provider
        provider, ai_config = await _get_active_provider(db)

        # 7. Call AI (sync call run in thread pool to avoid blocking event loop)
        loop = asyncio.get_event_loop()
        ai_response = await loop.run_in_executor(
            None,
            lambda: provider.generate(system_prompt, user_prompt, ai_config),
        )

        # 8. Parse & validate AI output
        ai_output = output_parser.parse(ai_response.content)

        # 9. Save Report
        report = Report(
            submission_id     = submission.id,
            character_title   = ai_output.character_title,
            report_data       = ai_output.to_report_data(),
            ai_model_used     = ai_response.model,
            ai_prompt_version = template.version,
            generation_tokens = (
                (ai_response.input_tokens or 0) + (ai_response.output_tokens or 0)
            ) or None,
            generation_ms     = ai_response.latency_ms,
        )
        db.add(report)
        await db.flush()  # get report.id

        # 10. Save ReportToken (unique URL slug)
        token_record = ReportToken(report_id=report.id)
        db.add(token_record)
        await db.flush()  # get token value

        token_str = token_record.token

        # 11. Mark submission completed
        await db.execute(
            update(Submission)
            .where(Submission.id == submission_id)
            .values(
                status="completed",
                processing_completed_at=datetime.now(timezone.utc),
            )
        )

        await db.commit()

        elapsed = int((time.time() - t_start) * 1000)
        logger.info(
            f"[pipeline] COMPLETE in {elapsed}ms | "
            f"report={report.id} | token={token_str[:12]}... | "
            f"ai_ms={ai_response.latency_ms}"
        )

        # 12. Enqueue email task
        celery_app.send_task(
            "app.tasks.send_blueprint_email",
            args=[submission_id, token_str],
        )


async def _get_active_template(db: AsyncSession) -> PromptTemplate:
    template = await db.scalar(
        select(PromptTemplate).where(PromptTemplate.is_active == True).limit(1)
    )
    if not template:
        raise ValueError(
            "No active prompt template found. "
            "Run: docker compose exec backend python -m scripts.seed"
        )
    return template


async def _get_active_provider(db: AsyncSession) -> tuple:
    config = await db.scalar(
        select(AIModelConfig).where(AIModelConfig.is_active == True).limit(1)
    )
    if not config:
        raise ValueError(
            "No active AI model config found. "
            "Run: docker compose exec backend python -m scripts.seed"
        )

    api_key = os.getenv(config.api_key_env_var)
    if not api_key:
        raise ValueError(
            f"AI API key not set. Expected env var: {config.api_key_env_var}"
        )

    provider_map = {
        "gemini":     GeminiProvider,
        # "openai":   OpenAIProvider,  # Sprint 5+
        # "claude":   ClaudeProvider,
        # "openrouter": OpenRouterProvider,
    }

    provider_class = provider_map.get(config.provider)
    if not provider_class:
        raise ValueError(f"Unsupported AI provider: {config.provider!r}")

    ai_config = AIConfig(
        model_name  = config.model_name,
        max_tokens  = config.max_tokens,
        temperature = config.temperature,
        api_key     = api_key,
    )

    return provider_class(api_key=api_key), ai_config


async def _mark_failed(submission_id: str, error_msg: str) -> None:
    async with AsyncSessionLocal() as db:
        await db.execute(
            update(Submission)
            .where(Submission.id == submission_id)
            .values(
                status="failed",
                error_message=error_msg[:2000],
            )
        )
        await db.commit()
