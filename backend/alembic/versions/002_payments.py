"""Add payments table for Mayar.id payment tracking

Revision ID: 002
Revises: 001
Create Date: 2026-01-01
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID

revision      = "002"
down_revision = "001"
branch_labels = None
depends_on    = None


def upgrade() -> None:
    op.create_table(
        "payments",
        sa.Column("id",              UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("created_at",      sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at",      sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text("now()")),

        # Customer
        sa.Column("email",           sa.String(255), nullable=False),
        sa.Column("tier",            sa.String(20),  nullable=False),  # 'tier1' | 'tier2'

        # Payment state
        sa.Column("status",          sa.String(20),  nullable=False, server_default="'pending'"),
        # 'pending' | 'paid' | 'expired' | 'failed'
        sa.Column("amount",          sa.Integer(),   nullable=False),  # IDR

        # Mayar.id references
        sa.Column("mayar_product_id", sa.String(255), nullable=True, unique=True),  # Mayar product ID returned on link creation
        sa.Column("mayar_order_id",   sa.String(255), nullable=True),               # our internal order reference
        sa.Column("payment_url",      sa.Text(),      nullable=True),                # the Mayar checkout URL

        # Payment confirmation
        sa.Column("paid_at",          sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("webhook_payload",  JSONB(),        nullable=True),  # raw webhook data for debugging
    )

    op.create_index("ix_payments_email",           "payments", ["email"])
    op.create_index("ix_payments_status",          "payments", ["status"])
    op.create_index("ix_payments_mayar_order_id",  "payments", ["mayar_order_id"])


def downgrade() -> None:
    op.drop_table("payments")
