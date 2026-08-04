import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.config import settings
from app.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse, UserProfile

router = APIRouter(prefix="/auth", tags=["Auth"])
logger = logging.getLogger(__name__)


# ── Register ──────────────────────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a Re:Lumma account",
)
async def register(
    data: RegisterRequest,
    db:   AsyncSession = Depends(get_db),
) -> AuthResponse:
    email = data.email.lower().strip()

    existing = await db.scalar(select(User).where(User.email == email))
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists. Try logging in instead.",
        )

    user = User(
        email=email,
        password_hash=hash_password(data.password),
        nickname=data.nickname,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    logger.info(f"[Auth] Registered new user: {user.email}")

    token = create_access_token(data={"sub": str(user.id)})
    return AuthResponse(access_token=token, expires_in=settings.JWT_EXPIRE_MINUTES * 60)


# ── Login ─────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=AuthResponse, summary="Log in to a Re:Lumma account")
async def login(
    data: LoginRequest,
    db:   AsyncSession = Depends(get_db),
) -> AuthResponse:
    email = data.email.lower().strip()

    user: User | None = await db.scalar(select(User).where(User.email == email))

    if user is None or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    await db.execute(
        update(User).where(User.id == user.id).values(last_login_at=datetime.now(timezone.utc))
    )
    await db.commit()

    token = create_access_token(data={"sub": str(user.id)})
    return AuthResponse(access_token=token, expires_in=settings.JWT_EXPIRE_MINUTES * 60)


# ── Profile ───────────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserProfile, summary="Get the current user's profile")
async def get_me(user: User = Depends(get_current_user)) -> UserProfile:
    return UserProfile.model_validate(user)
