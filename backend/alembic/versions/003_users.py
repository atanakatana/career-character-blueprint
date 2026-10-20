"""Re:Lumma end-user accounts

Adds end-user accounts (separate from admin_users). Does NOT alter
submissions, reports, report_tokens, or payments — the existing paid-report
pipeline is untouched here. Account <-> paid-report linking is intentionally
deferred (see api/routes/habit_tracker.py); entitlement is checked directly
against `payments.email` + `payments.status` (see core/entitlements.py),
independent of this table.

Revision ID: 003
Revises: 002
Create Date: 2026-10-18
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id",            UUID(as_uuid=True), primary_key=True),
        sa.Column("created_at",    sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at",    sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("email",         sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("nickname",      sa.String(100), nullable=False),
        sa.Column("is_active",     sa.Boolean(),  nullable=False, server_default="true"),
        sa.Column("last_login_at", sa.TIMESTAMP(timezone=True), nullable=True),
    )
    op.create_index("uq_users_email", "users", ["email"], unique=True)


def downgrade() -> None:
    op.drop_index("uq_users_email", table_name="users")
    op.drop_table("users")
