"""
Mayar.id Headless API client.

Docs: https://docs.mayar.id
API:  https://api.mayar.id/hl/v2   (production)
      https://api.mayar.club/hl/v2  (sandbox)

Key endpoints used:
  POST /products/payment-link/create  — create a one-time payment link
"""
import logging
from datetime import datetime, timezone, timedelta
from urllib.parse import quote

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────────────────────

PROD_BASE    = "https://api.mayar.id/hl/v2"
SANDBOX_BASE = "https://api.mayar.club/hl/v2"

TIER_CONFIG = {
    "tier1": {
        "label":       "Re:Lumma Blueprint",
        "description": "Full AI-powered Re:Lumma Blueprint — MBTI x Human Design x 7-section reading delivered via email.",
        "amount":      settings.TIER1_PRICE,
    },
    "tier2": {
        "label":       "Re:Lumma Blueprint + Habit Tracker",
        "description": "Everything in the Blueprint, plus a personalised habit tracker dashboard to monitor your progress toward your career goals.",
        "amount":      settings.TIER2_PRICE,
    },
}


def _base_url() -> str:
    return PROD_BASE if settings.MAYAR_PRODUCTION else SANDBOX_BASE


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {settings.MAYAR_API_KEY}",
        "Content-Type":  "application/json",
    }


class MayarError(Exception):
    """Raised when the Mayar API returns an error."""


async def create_payment_link(
    *,
    order_id: str,
    email:    str,
    tier:     str,
) -> dict:
    """
    Creates a single-use Mayar.id payment link for the given tier.

    Returns:
        { "mayar_product_id": str, "payment_url": str, "amount": int }

    Raises:
        MayarError if the API call fails.
        ValueError if the tier is invalid.
    """
    if not settings.MAYAR_API_KEY:
        # Dry-run mode for local development
        logger.warning("[Mayar] MAYAR_API_KEY not set — returning mock payment link")
        tier_cfg = TIER_CONFIG.get(tier, TIER_CONFIG["tier1"])
        return {
            "mayar_product_id": f"mock-{order_id[:8]}",
            "payment_url":      f"http://localhost:3000/dev-mock-payment?order={order_id}&email={quote(email)}",
            "amount":           tier_cfg["amount"],
        }

    tier_cfg = TIER_CONFIG.get(tier)
    if not tier_cfg:
        raise ValueError(f"Unknown tier: {tier}")

    # Build a unique product name to avoid Mayar 409 conflicts
    short_id   = order_id.replace("-", "")[:8].upper()
    product_name = f"CCB-{short_id}"

    # Redirect URL back to our form, email pre-filled
    redirect_url = (
        f"{settings.FRONTEND_BASE_URL}/create"
        f"?email={quote(email)}&ref={order_id}"
    )

    # 24-hour expiry
    expires_at = (
        datetime.now(timezone.utc) + timedelta(hours=24)
    ).strftime("%Y-%m-%dT%H:%M:%S.000Z")

    payload = {
        "name":        product_name,
        "description": tier_cfg["description"],
        "amount":      tier_cfg["amount"],
        "redirectUrl": redirect_url,
        "limit":       1,          # single-use link
        "expiredAt":   expires_at,
        "notes":       f"Order {order_id} | {email} | {tier_cfg['label']}",
    }

    url = f"{_base_url()}/products/payment-link/create"

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(url, json=payload, headers=_headers())
    except httpx.RequestError as exc:
        raise MayarError(f"Network error calling Mayar API: {exc}") from exc

    if resp.status_code not in (200, 201):
        logger.error(
            "[Mayar] Create payment link failed: status=%s body=%s",
            resp.status_code, resp.text[:300],
        )
        raise MayarError(f"Mayar API error {resp.status_code}: {resp.text[:200]}")

    body = resp.json()
    data = body.get("data", {})

    mayar_product_id = data.get("id")
    payment_url      = data.get("link")

    if not mayar_product_id or not payment_url:
        raise MayarError(f"Mayar response missing id/link: {body}")

    logger.info(
        "[Mayar] Payment link created: product_id=%s url=%s tier=%s email=%s",
        mayar_product_id, payment_url, tier, email,
    )

    return {
        "mayar_product_id": mayar_product_id,
        "payment_url":      payment_url,
        "amount":           tier_cfg["amount"],
    }
