import logging
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.payment import Payment
from app.models.admin_user import AdminUser
from app.core.dependencies import get_current_admin
from app.schemas.payment import (
    PaymentCreateRequest, PaymentCreateResponse,
    PaymentStatusResponse, PaymentAdminItem,
    MayarWebhookPayload,
)
from app.services.mayar import create_payment_link, MayarError, TIER_CONFIG

router = APIRouter(prefix="/payments", tags=["Payments"])
logger = logging.getLogger(__name__)


# ── Create payment link ───────────────────────────────────────────────────────

@router.post(
    "/create",
    response_model=PaymentCreateResponse,
    summary="Create a Mayar.id payment link for a given tier",
)
async def create_payment(
    body: PaymentCreateRequest,
    db:   AsyncSession = Depends(get_db),
) -> PaymentCreateResponse:
    """
    Creates a Mayar.id payment link and records a pending payment.
    Returns the checkout URL for the frontend to redirect the customer.
    """
    tier = body.tier.lower()
    if tier not in TIER_CONFIG:
        raise HTTPException(status_code=400, detail=f"Invalid tier '{tier}'. Must be 'tier1' or 'tier2'.")

    order_id = str(uuid4())

    try:
        result = await create_payment_link(
            order_id=order_id,
            email=body.email.lower().strip(),
            tier=tier,
        )
    except MayarError as exc:
        logger.error("[Payment] Mayar API error: %s", exc)
        raise HTTPException(status_code=502, detail=f"Payment gateway error: {exc}")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    # Persist a pending payment record
    payment = Payment(
        email=body.email.lower().strip(),
        tier=tier,
        status="pending",
        amount=result["amount"],
        mayar_product_id=result["mayar_product_id"],
        mayar_order_id=order_id,
        payment_url=result["payment_url"],
    )
    db.add(payment)
    await db.commit()

    logger.info(
        "[Payment] Created pending payment: order=%s email=%s tier=%s amount=%s",
        order_id, payment.email, tier, payment.amount,
    )

    return PaymentCreateResponse(
        order_id=order_id,
        payment_url=result["payment_url"],
        tier=tier,
        amount=result["amount"],
    )


# ── Mayar.id webhook ──────────────────────────────────────────────────────────

@router.post(
    "/webhook",
    status_code=status.HTTP_200_OK,
    summary="Receive payment notifications from Mayar.id",
)
async def mayar_webhook(
    request: Request,
    db:      AsyncSession = Depends(get_db),
) -> dict:
    """
    Receives webhook events from Mayar.id.

    Mayar sends `payment.received` when a customer completes payment.
    We match the Mayar product ID to our payment record and mark it as paid.

    Security note: Mayar does not sign webhook payloads with an HMAC.
    We verify authenticity by cross-checking `data.productId` against our DB
    (only we know which product IDs we created), plus matching the amount.

    Configure the webhook URL in your Mayar dashboard:
      Integration → Webhook → URL: https://yourdomain.com/api/payments/webhook
    """
    try:
        raw = await request.json()
    except Exception:
        logger.warning("[Webhook] Failed to parse request body as JSON")
        # Always return 200 to Mayar — they retry on non-200
        return {"ok": False, "detail": "invalid json"}

    try:
        payload = MayarWebhookPayload.model_validate(raw)
    except Exception as exc:
        logger.warning("[Webhook] Schema parse failed: %s — raw: %s", exc, str(raw)[:200])
        return {"ok": False, "detail": "schema error"}

    logger.info("[Webhook] Received event=%s", payload.event)

    if payload.event != "payment.received":
        # Ignore non-payment events (membership, shipping, etc.)
        return {"ok": True, "detail": "ignored"}

    data = payload.data
    if not data:
        return {"ok": False, "detail": "empty data"}

    mayar_product_id = data.productId
    customer_email   = (data.customerEmail or "").lower().strip()

    if not mayar_product_id:
        logger.warning("[Webhook] payment.received missing productId: %s", raw)
        return {"ok": False, "detail": "missing productId"}

    # Find the payment record by Mayar product ID
    payment: Payment | None = await db.scalar(
        select(Payment).where(Payment.mayar_product_id == mayar_product_id)
    )

    if payment is None:
        logger.warning(
            "[Webhook] Unknown product_id=%s email=%s — no matching payment",
            mayar_product_id, customer_email,
        )
        return {"ok": False, "detail": "payment not found"}

    if payment.status == "paid":
        logger.info("[Webhook] Already marked paid: %s", mayar_product_id)
        return {"ok": True, "detail": "already paid"}

    # Mark as paid
    payment.status          = "paid"
    payment.paid_at         = datetime.now(timezone.utc)
    payment.webhook_payload = raw

    # Reconcile email if Mayar provided it
    if customer_email and customer_email != payment.email:
        logger.info(
            "[Webhook] Email mismatch: stored=%s mayar=%s — updating to Mayar's",
            payment.email, customer_email,
        )
        payment.email = customer_email

    await db.commit()

    logger.info(
        "[Webhook] Payment confirmed: product_id=%s email=%s tier=%s amount=%s",
        mayar_product_id, payment.email, payment.tier, payment.amount,
    )

    return {"ok": True}


# ── Check payment status (frontend polling) ────────────────────────────────────

@router.get(
    "/status/{email}",
    response_model=PaymentStatusResponse,
    summary="Check whether an email has a valid paid payment",
)
async def check_payment_status(
    email: str,
    db:    AsyncSession = Depends(get_db),
) -> PaymentStatusResponse:
    """
    Used by the form page to verify the customer has paid before showing
    the submission form. Returns the most recent paid payment for this email.
    """
    payment: Payment | None = await db.scalar(
        select(Payment)
        .where(Payment.email == email.lower().strip())
        .where(Payment.status == "paid")
        .order_by(Payment.paid_at.desc())
        .limit(1)
    )

    if payment is None:
        return PaymentStatusResponse(has_valid_payment=False)

    return PaymentStatusResponse(
        has_valid_payment=True,
        tier=payment.tier,
        paid_at=payment.paid_at.isoformat() if payment.paid_at else None,
    )


# ── Admin: list all payments ───────────────────────────────────────────────────

@router.get(
    "/admin",
    response_model=list[PaymentAdminItem],
    summary="Admin: list all payments",
)
async def list_payments_admin(
    skip:   int          = 0,
    limit:  int          = 50,
    db:     AsyncSession = Depends(get_db),
    _admin: AdminUser    = Depends(get_current_admin),
) -> list[PaymentAdminItem]:
    result = await db.execute(
        select(Payment)
        .order_by(Payment.created_at.desc())
        .offset(skip)
        .limit(min(limit, 200))
    )
    return [PaymentAdminItem.model_validate(p) for p in result.scalars().all()]
