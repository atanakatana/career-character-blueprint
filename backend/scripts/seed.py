#!/usr/bin/env python3
"""
Database seed script.

Creates a default admin user and a default Gemini model config
if they don't already exist.

Usage (inside the backend container):
    python -m scripts.seed
"""
import asyncio
import os
import sys

# Ensure app is importable when run as a script
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import AsyncSessionLocal
from app.models.admin_user import AdminUser
from app.models.ai_model_config import AIModelConfig
from app.core.security import hash_password
from sqlalchemy import select


async def seed() -> None:
    print("─" * 50)
    print("Character Career Blueprint — Database Seed")
    print("─" * 50)

    async with AsyncSessionLocal() as db:

        # ── Admin user ────────────────────────────────────────────────────────
        email    = os.getenv("ADMIN_DEFAULT_EMAIL",    "admin@ccblueprint.com")
        password = os.getenv("ADMIN_DEFAULT_PASSWORD", "ChangeMe123!")

        existing_admin = await db.scalar(
            select(AdminUser).where(AdminUser.email == email)
        )
        if existing_admin is None:
            admin = AdminUser(
                email=email,
                password_hash=hash_password(password),
            )
            db.add(admin)
            print(f"✓ Admin user created:  {email}")
            print(f"  Password:            {password}")
            print("  ⚠  Change this password immediately in production.")
        else:
            print(f"• Admin user already exists: {email}")

        # ── Gemini model config ───────────────────────────────────────────────
        existing_model = await db.scalar(
            select(AIModelConfig).where(AIModelConfig.provider == "gemini")
        )
        if existing_model is None:
            model = AIModelConfig(
                provider="gemini",
                model_name="gemini-1.5-pro",
                is_active=True,
                api_key_env_var="GEMINI_API_KEY",
                max_tokens=8000,
                temperature=0.7,
                config_json={"safety_settings": "default"},
            )
            db.add(model)
            print("✓ Gemini model config created (gemini-1.5-pro, active)")
        else:
            print(f"• Gemini model config already exists: {existing_model.model_name}")

        await db.commit()

    print("─" * 50)
    print("✓ Seed complete")
    print("─" * 50)


if __name__ == "__main__":
    asyncio.run(seed())
