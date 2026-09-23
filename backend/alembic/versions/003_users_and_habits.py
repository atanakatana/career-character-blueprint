"""Re:Lumma accounts + habit tracker — additive tables only

Adds end-user accounts (separate from admin_users) and a lightweight habit
tracker. Does NOT alter submissions, reports, report_tokens, or payments —
the existing paid-report pipeline is untouched here.

Renumbered from "002" to "003" and rechained onto payments (2026-08-13):
this file and 002_payments.py were both originally stamped revision "002"
with down_revision "001" — two independent sprint branches (payments in
sprint 12, this one in sprint 13) that each assumed they were the only
migration since the initial schema, and neither got renumbered when the
branches were merged together. `alembic heads` confirms two heads and warns
"Revision 002 is present more than once" — upgrade/downgrade is ambiguous
until this is fixed. Payments shipped first chronologically, so this chains
after it. If you have ever run `alembic upgrade head` against a real
database before this fix, check `alembic_version` there before applying
this — it may already have one of the two "002" revisions stamped, in which
case reconcile manually rather than re-running blind.

Original note, now superseded — kept for history: "Blueprint <-> account
linking is done at query time by matching User.email to Submission.email,
not via a foreign key, so no existing table needs a new column." See
004_submissions_user_id.py — this turned out to be a real vulnerability
(any account with a matching email could view another user's paid report,
since registration has no email verification) and is fixed there by adding
a proper foreign key.

Revision ID: 003
Revises: 002
Create Date: 2025-01-01 00:00:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "003"
down_revision = "002"
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
