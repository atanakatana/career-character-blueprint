from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.core.security import decode_access_token
from app.models.admin_user import AdminUser


_bearer = HTTPBearer(auto_error=True)

_UNAUTHORIZED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid or expired credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> AdminUser:
    """
    FastAPI dependency: validates the Bearer JWT and returns the active AdminUser.
    Raises 401 if the token is missing, invalid, expired, or the user is inactive.
    """
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise _UNAUTHORIZED

    admin_id: str | None = payload.get("sub")
    if not admin_id:
        raise _UNAUTHORIZED

    result = await db.execute(select(AdminUser).where(AdminUser.id == admin_id))
    admin: AdminUser | None = result.scalar_one_or_none()

    if admin is None or not admin.is_active:
        raise _UNAUTHORIZED

    return admin
