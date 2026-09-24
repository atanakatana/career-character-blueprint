from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.payment import Payment

# The Habit Tracker is a Blueprint + Tracker (tier2) perk — see the pricing
# copy in frontend/src/components/landing/PricingSection.tsx. tier1 ("Solo
# Quest") explicitly lists it as locked.
HABIT_TRACKER_TIER = "tier2"


async def get_paid_tier(db: AsyncSession, email: str) -> str | None:
    """Highest tier this email has a *paid* Payment for, or None.

    tier2 is a superset of tier1's entitlements, so if a customer somehow
    has both (e.g. bought tier1, later upgraded), tier2 wins.
    """
    result = await db.execute(
        select(Payment.tier).where(
            Payment.email == email.lower().strip(),
            Payment.status == "paid",
        )
    )
    tiers = {row[0] for row in result.all()}
    if "tier2" in tiers:
        return "tier2"
    if "tier1" in tiers:
        return "tier1"
    return None


async def has_habit_tracker_access(db: AsyncSession, email: str) -> bool:
    return await get_paid_tier(db, email) == HABIT_TRACKER_TIER
