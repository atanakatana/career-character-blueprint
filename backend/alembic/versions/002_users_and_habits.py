"""Re:Lumma accounts + habit tracker — additive tables only

Adds end-user accounts (separate from admin_users) and a lightweight habit
tracker. Does NOT alter submissions, reports, report_tokens, or payments —
the existing paid-report pipeline is untouched. Blueprint <-> account linking
is done at query time by matching User.email to Submission.email, not via a
foreign key, so no existing table needs a new column.

Revision ID: 002
Revises: 001
Create Date: 2025-01-01 00:00:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:

    # ── 1. users ──────────────────────────────────────────────────────────────
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

    # ── 2. user_habits ────────────────────────────────────────────────────────
    op.create_table(
        "user_habits",
        sa.Column("id",               UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id",          UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at",       sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("name",             sa.String(150), nullable=False),
        sa.Column("source_archetype", sa.String(10),  nullable=True),
        sa.Column("sort_order",       sa.Integer(),   nullable=False, server_default="0"),
        sa.Column("is_active",        sa.Boolean(),   nullable=False, server_default="true"),
    )
    op.create_index("idx_user_habits_user_id", "user_habits", ["user_id"])

    # ── 3. habit_completions ──────────────────────────────────────────────────
    op.create_table(
        "habit_completions",
        sa.Column("id",             UUID(as_uuid=True), primary_key=True),
        sa.Column("habit_id",       UUID(as_uuid=True), sa.ForeignKey("user_habits.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id",        UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("completed_date", sa.Date(), nullable=False),
        sa.Column("created_at",     sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("idx_habit_completions_user_id", "habit_completions", ["user_id"])
    op.create_index(
        "uq_habit_completions_habit_date", "habit_completions",
        ["habit_id", "completed_date"], unique=True,
    )


def downgrade() -> None:
    op.drop_table("habit_completions")
    op.drop_table("user_habits")
    op.drop_table("users")
