from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID


# ── Request schemas ───────────────────────────────────────────────────────────

class PaymentCreateRequest(BaseModel):
    email: str
    tier:  str   # 'tier1' | 'tier2'


# ── Response schemas ──────────────────────────────────────────────────────────

class PaymentCreateResponse(BaseModel):
    order_id:    str
    payment_url: str
    tier:        str
    amount:      int


class PaymentAdminItem(BaseModel):
    id:               UUID
    created_at:       datetime
    email:            str
    tier:             str
    status:           str
    amount:           int
    mayar_product_id: Optional[str]
    payment_url:      Optional[str]
    paid_at:          Optional[datetime]

    model_config = {"from_attributes": True}


# ── Webhook payload (from Mayar.id) ──────────────────────────────────────────
# Mayar sends POST with Content-Type: application/json
# Event field is 'payment.received' for completed payments

class MayarWebhookData(BaseModel):
    id:             Optional[str]   = None
    status:         Optional[bool]  = None   # true = paid
    customerEmail:  Optional[str]   = None
    customerName:   Optional[str]   = None
    productId:      Optional[str]   = None
    productName:    Optional[str]   = None
    amount:         Optional[int]   = None
    merchantEmail:  Optional[str]   = None

    model_config = {"extra": "allow"}  # accept any extra Mayar fields


class MayarWebhookPayload(BaseModel):
    event: Optional[str]            = None
    data:  Optional[MayarWebhookData] = None

    model_config = {"extra": "allow"}
