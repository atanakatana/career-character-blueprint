"""Initial tables — all 7 schema tables

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:

    # ── 1. admin_users ────────────────────────────────────────────────────────
    op.create_table(
        "admin_users",
        sa.Column("id",            UUID(as_uuid=True), primary_key=True),
        sa.Column("created_at",    sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("email",         sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("is_active",     sa.Boolean(),  nullable=False, server_default="true"),
        sa.Column("last_login_at", sa.TIMESTAMP(timezone=True), nullable=True),
    )
    op.create_index("uq_admin_users_email", "admin_users", ["email"], unique=True)

    # ── 2. submissions ────────────────────────────────────────────────────────
    op.create_table(
        "submissions",
        sa.Column("id",         UUID(as_uuid=True), primary_key=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("status",     sa.String(20), nullable=False, server_default="pending"),
        # User inputs
        sa.Column("nickname",           sa.String(100), nullable=False),
        sa.Column("email",              sa.String(255), nullable=False),
        sa.Column("mbti_type",          sa.String(10),  nullable=False),
        sa.Column("hd_type",            sa.String(50),  nullable=False),
        sa.Column("hd_authority",       sa.String(50),  nullable=False),
        sa.Column("hd_profile",         sa.String(30),  nullable=False),
        sa.Column("current_occupation", sa.Text(),      nullable=False),
        sa.Column("burnout_triggers",   sa.Text(),      nullable=False),
        sa.Column("success_vision",     sa.Text(),      nullable=False),
        # Processing metadata
        sa.Column("celery_task_id",          sa.String(255),             nullable=True),
        sa.Column("processing_started_at",   sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("processing_completed_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("error_message",           sa.Text(),                   nullable=True),
        sa.Column("retry_count",             sa.Integer(), nullable=False, server_default="0"),
    )
    op.create_index("idx_submissions_status",     "submissions", ["status"])
    op.create_index("idx_submissions_email",      "submissions", ["email"])
    op.create_index("idx_submissions_created_at", "submissions", ["created_at"])

    # ── 3. reports ────────────────────────────────────────────────────────────
    op.create_table(
        "reports",
        sa.Column("id",            UUID(as_uuid=True), primary_key=True),
        sa.Column("submission_id", UUID(as_uuid=True), sa.ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at",    sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at",    sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("character_title",    sa.String(255), nullable=False),
        sa.Column("report_data",        JSONB(),        nullable=False),
        sa.Column("ai_model_used",      sa.String(100), nullable=False),
        sa.Column("ai_prompt_version",  sa.String(50),  nullable=False),
        sa.Column("generation_tokens",  sa.Integer(),   nullable=True),
        sa.Column("generation_ms",      sa.Integer(),   nullable=True),
    )
    op.create_index("idx_reports_submission_id", "reports", ["submission_id"])

    # ── 4. report_tokens ──────────────────────────────────────────────────────
    op.create_table(
        "report_tokens",
        sa.Column("id",        UUID(as_uuid=True), primary_key=True),
        sa.Column("report_id", UUID(as_uuid=True), sa.ForeignKey("reports.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token",      sa.String(128),              nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("expires_at",       sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("accessed_count",   sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_accessed_at", sa.TIMESTAMP(timezone=True), nullable=True),
    )
    op.create_index("uq_report_tokens_token",     "report_tokens", ["token"],     unique=True)
    op.create_index("idx_report_tokens_report_id", "report_tokens", ["report_id"])

    # ── 5. email_logs ─────────────────────────────────────────────────────────
    op.create_table(
        "email_logs",
        sa.Column("id",            UUID(as_uuid=True), primary_key=True),
        sa.Column("submission_id", UUID(as_uuid=True), sa.ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at",        sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("email_type",        sa.String(50),  nullable=False),
        sa.Column("recipient_email",   sa.String(255), nullable=False),
        sa.Column("resend_message_id", sa.String(255), nullable=True),
        sa.Column("status",            sa.String(20),  nullable=False),
        sa.Column("error_message",     sa.Text(),      nullable=True),
    )
    op.create_index("idx_email_logs_submission_id", "email_logs", ["submission_id"])

    # ── 6. ai_prompt_templates ────────────────────────────────────────────────
    op.create_table(
        "ai_prompt_templates",
        sa.Column("id",         UUID(as_uuid=True), primary_key=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("name",           sa.String(100), nullable=False),
        sa.Column("version",        sa.String(20),  nullable=False),
        sa.Column("is_active",      sa.Boolean(),   nullable=False, server_default="false"),
        sa.Column("prompt_text",    sa.Text(),      nullable=False),
        sa.Column("system_context", sa.Text(),      nullable=False),
        sa.Column("notes",          sa.Text(),      nullable=True),
        sa.Column("created_by",     UUID(as_uuid=True), sa.ForeignKey("admin_users.id", ondelete="SET NULL"), nullable=True),
    )
    op.create_index("uq_prompt_templates_name", "ai_prompt_templates", ["name"], unique=True)

    # ── 7. ai_model_configs ───────────────────────────────────────────────────
    op.create_table(
        "ai_model_configs",
        sa.Column("id",         UUID(as_uuid=True), primary_key=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("provider",        sa.String(50),  nullable=False),
        sa.Column("model_name",      sa.String(100), nullable=False),
        sa.Column("is_active",       sa.Boolean(),   nullable=False, server_default="false"),
        sa.Column("api_key_env_var", sa.String(100), nullable=False),
        sa.Column("max_tokens",      sa.Integer(),   nullable=False, server_default="8000"),
        sa.Column("temperature",     sa.Float(),     nullable=False, server_default="0.7"),
        sa.Column("config_json",     JSONB(),        nullable=True),
    )


def downgrade() -> None:
    # Drop in reverse FK dependency order
    op.drop_table("ai_model_configs")
    op.drop_table("ai_prompt_templates")
    op.drop_table("email_logs")
    op.drop_table("report_tokens")
    op.drop_table("reports")
    op.drop_table("submissions")
    op.drop_table("admin_users")
