import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update

from app.config import settings
from app.database import get_db
from app.core.security import verify_password, create_access_token, hash_password
from app.core.dependencies import get_current_admin
from app.models.admin_user import AdminUser
from app.models.submission import Submission
from app.models.report import Report
from app.models.prompt_template import PromptTemplate
from app.models.ai_model_config import AIModelConfig
from app.celery_app import celery_app
from app.schemas.admin import (
    AdminLoginRequest, AdminLoginResponse, AdminProfile,
    PromptTemplateCreate, PromptTemplateUpdate, PromptTemplateResponse,
    AIModelConfigCreate, AIModelConfigResponse,
)
from app.schemas.submission import SubmissionListItem, SubmissionSummary, PaginatedSubmissions
from app.schemas.report import ReportListItem

router = APIRouter(prefix="/admin", tags=["Admin"])
logger = logging.getLogger(__name__)


# ── AUTH ──────────────────────────────────────────────────────────────────────

@router.post("/auth/login", response_model=AdminLoginResponse, summary="Admin login")
async def admin_login(
    data: AdminLoginRequest,
    db: AsyncSession = Depends(get_db),
) -> AdminLoginResponse:
    result = await db.execute(select(AdminUser).where(AdminUser.email == data.email))
    admin: AdminUser | None = result.scalar_one_or_none()

    if admin is None or not verify_password(data.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    # Update last login
    await db.execute(
        update(AdminUser)
        .where(AdminUser.id == admin.id)
        .values(last_login_at=datetime.now(timezone.utc))
    )
    await db.commit()

    token = create_access_token(data={"sub": str(admin.id)})
    return AdminLoginResponse(
        access_token=token,
        expires_in=settings.JWT_EXPIRE_MINUTES * 60,
    )


@router.get("/auth/me", response_model=AdminProfile, summary="Get current admin profile")
async def get_admin_profile(
    admin: AdminUser = Depends(get_current_admin),
) -> AdminProfile:
    return AdminProfile.model_validate(admin)


# ── SUBMISSIONS ───────────────────────────────────────────────────────────────

@router.get("/submissions", response_model=PaginatedSubmissions, summary="List all submissions")
async def list_submissions(
    skip:    int           = 0,
    limit:   int           = 20,
    status:  Optional[str] = None,
    db:      AsyncSession  = Depends(get_db),
    _admin:  AdminUser     = Depends(get_current_admin),
) -> PaginatedSubmissions:
    query = select(Submission).order_by(Submission.created_at.desc())
    count_query = select(func.count()).select_from(Submission)

    if status:
        query = query.where(Submission.status == status)
        count_query = count_query.where(Submission.status == status)

    query = query.offset(skip).limit(min(limit, 100))

    results, total = await db.execute(query), await db.scalar(count_query)
    submissions = results.scalars().all()

    return PaginatedSubmissions(
        items=[SubmissionListItem.model_validate(s) for s in submissions],
        total=total or 0,
        skip=skip,
        limit=limit,
    )


@router.get("/submissions/{submission_id}", response_model=SubmissionSummary, summary="Get submission detail")
async def get_submission(
    submission_id: str,
    db:     AsyncSession = Depends(get_db),
    _admin: AdminUser    = Depends(get_current_admin),
) -> SubmissionSummary:
    result = await db.execute(select(Submission).where(Submission.id == submission_id))
    submission: Submission | None = result.scalar_one_or_none()

    if submission is None:
        raise HTTPException(status_code=404, detail="Submission not found")

    return SubmissionSummary.model_validate(submission)


@router.post("/submissions/{submission_id}/regenerate", summary="Re-trigger blueprint generation")
async def regenerate_blueprint(
    submission_id: str,
    db:     AsyncSession = Depends(get_db),
    _admin: AdminUser    = Depends(get_current_admin),
) -> dict:
    result = await db.execute(select(Submission).where(Submission.id == submission_id))
    submission: Submission | None = result.scalar_one_or_none()

    if submission is None:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Reset status and enqueue
    await db.execute(
        update(Submission)
        .where(Submission.id == submission_id)
        .values(status="pending", error_message=None, retry_count=Submission.retry_count + 1)
    )

    try:
        task = celery_app.send_task("app.tasks.generate_blueprint", args=[submission_id])
        await db.execute(
            update(Submission)
            .where(Submission.id == submission_id)
            .values(celery_task_id=task.id)
        )
        logger.info(f"Re-generation task enqueued: {task.id} for submission {submission_id}")
    except Exception as exc:
        logger.error(f"Failed to enqueue regeneration: {exc}")
        await db.rollback()
        raise HTTPException(status_code=503, detail="Task queue unavailable")

    await db.commit()
    return {"message": "Blueprint regeneration enqueued", "submission_id": submission_id}


# ── PROMPT TEMPLATES ──────────────────────────────────────────────────────────

@router.get("/prompts", response_model=list[PromptTemplateResponse], summary="List prompt templates")
async def list_prompts(
    db:     AsyncSession = Depends(get_db),
    _admin: AdminUser    = Depends(get_current_admin),
) -> list[PromptTemplateResponse]:
    result = await db.execute(select(PromptTemplate).order_by(PromptTemplate.created_at.desc()))
    return [PromptTemplateResponse.model_validate(p) for p in result.scalars().all()]


@router.post("/prompts", response_model=PromptTemplateResponse, status_code=201, summary="Create prompt template")
async def create_prompt(
    data:   PromptTemplateCreate,
    db:     AsyncSession = Depends(get_db),
    admin:  AdminUser    = Depends(get_current_admin),
) -> PromptTemplateResponse:
    prompt = PromptTemplate(**data.model_dump(), created_by=admin.id)
    db.add(prompt)
    await db.commit()
    await db.refresh(prompt)
    return PromptTemplateResponse.model_validate(prompt)


@router.put("/prompts/{prompt_id}/activate", summary="Set a prompt template as active")
async def activate_prompt(
    prompt_id: str,
    db:     AsyncSession = Depends(get_db),
    _admin: AdminUser    = Depends(get_current_admin),
) -> dict:
    # Deactivate all, then activate the target
    await db.execute(update(PromptTemplate).values(is_active=False))
    result = await db.execute(
        update(PromptTemplate)
        .where(PromptTemplate.id == prompt_id)
        .values(is_active=True)
        .returning(PromptTemplate.id)
    )
    if result.scalar_one_or_none() is None:
        await db.rollback()
        raise HTTPException(status_code=404, detail="Prompt template not found")

    await db.commit()
    return {"message": "Prompt template activated", "id": prompt_id}


# ── AI MODEL CONFIG ───────────────────────────────────────────────────────────

@router.get("/models", response_model=list[AIModelConfigResponse], summary="List AI model configs")
async def list_models(
    db:     AsyncSession = Depends(get_db),
    _admin: AdminUser    = Depends(get_current_admin),
) -> list[AIModelConfigResponse]:
    result = await db.execute(select(AIModelConfig).order_by(AIModelConfig.created_at.desc()))
    return [AIModelConfigResponse.model_validate(m) for m in result.scalars().all()]


@router.post("/models", response_model=AIModelConfigResponse, status_code=201, summary="Add AI model config")
async def create_model_config(
    data:   AIModelConfigCreate,
    db:     AsyncSession = Depends(get_db),
    _admin: AdminUser    = Depends(get_current_admin),
) -> AIModelConfigResponse:
    model = AIModelConfig(**data.model_dump())
    db.add(model)
    await db.commit()
    await db.refresh(model)
    return AIModelConfigResponse.model_validate(model)


@router.put("/models/{model_id}/activate", summary="Set an AI model config as active")
async def activate_model(
    model_id: str,
    db:     AsyncSession = Depends(get_db),
    _admin: AdminUser    = Depends(get_current_admin),
) -> dict:
    await db.execute(update(AIModelConfig).values(is_active=False))
    result = await db.execute(
        update(AIModelConfig)
        .where(AIModelConfig.id == model_id)
        .values(is_active=True)
        .returning(AIModelConfig.id)
    )
    if result.scalar_one_or_none() is None:
        await db.rollback()
        raise HTTPException(status_code=404, detail="Model config not found")

    await db.commit()
    return {"message": "Model config activated", "id": model_id}
