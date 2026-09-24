#!/usr/bin/env python3
"""
TEMPORARY demo helper — do not use this in production.

Manually marks a "paid" Payment for an email, bypassing Mayar entirely, so
you can run a friend through the real submission -> Gemini -> report
pipeline while Mayar is unavailable (see MAYAR_API_KEY 401 in .env). Not an
API endpoint, not reachable by end users — just a CLI script you run
yourself. Delete this file once Mayar is fixed for real.

Usage:
    docker compose exec backend python -m scripts.grant_demo_payment <email> <tier1|tier2>

Example:
    docker compose exec backend python -m scripts.grant_demo_payment friend@example.com tier2
"""
import asyncio, os, sys
from datetime import datetime, timezone
from uuid import uuid4

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models.payment import Payment
from app.config import settings

VALID_TIERS = {"tier1": settings.TIER1_PRICE, "tier2": settings.TIER2_PRICE}


async def grant(email: str, tier: str) -> None:
    email = email.lower().strip()

    async with AsyncSessionLocal() as db:
        existing = await db.scalar(
            select(Payment).where(
                Payment.email == email,
                Payment.tier == tier,
                Payment.status == "paid",
            )
        )
        if existing is not None:
            print(f"• {email} already has a paid {tier} entitlement (payment {existing.id}) — nothing to do.")
            return

        payment = Payment(
            email=email,
            tier=tier,
            status="paid",
            amount=VALID_TIERS[tier],
            mayar_product_id=f"manual-demo-{uuid4().hex[:12]}",
            mayar_order_id=f"manual-demo-{uuid4().hex[:12]}",
            payment_url=None,
            paid_at=datetime.now(timezone.utc),
            webhook_payload={"source": "grant_demo_payment.py", "note": "Manual demo grant — not a real Mayar payment"},
        )
        db.add(payment)
        await db.commit()

        print(f"✓ Granted {tier} to {email} (payment {payment.id}). No email will be sent automatically —")
        print(f"  have them log in / register, then submit the assessment from their Dashboard.")
        print(f"  Once generated, the report shows in-app immediately; email delivery is separately blocked (Resend test mode).")


def main() -> None:
    if len(sys.argv) != 3 or sys.argv[2] not in VALID_TIERS:
        print(__doc__)
        sys.exit(1)
    asyncio.run(grant(sys.argv[1], sys.argv[2]))


if __name__ == "__main__":
    main()
