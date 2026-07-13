from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import String, Integer, DateTime, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB

from app.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id:              Mapped[UUID]              = mapped_column(primary_key=True, default=uuid4)
    created_at:      Mapped[datetime]          = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:      Mapped[datetime]          = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Customer
    email:           Mapped[str]               = mapped_column(String(255), nullable=False, index=True)
    tier:            Mapped[str]               = mapped_column(String(20),  nullable=False)

    # Payment state
    status:          Mapped[str]               = mapped_column(String(20),  nullable=False, default="pending")
    amount:          Mapped[int]               = mapped_column(Integer(),   nullable=False)

    # Mayar.id references
    mayar_product_id: Mapped[Optional[str]]    = mapped_column(String(255), nullable=True, unique=True)
    mayar_order_id:   Mapped[Optional[str]]    = mapped_column(String(255), nullable=True, index=True)
    payment_url:      Mapped[Optional[str]]    = mapped_column(Text(),      nullable=True)

    # Confirmation
    paid_at:          Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    webhook_payload:  Mapped[Optional[dict]]   = mapped_column(JSONB(),     nullable=True)

    def __repr__(self) -> str:
        return f"<Payment {self.id} email={self.email} tier={self.tier} status={self.status}>"
