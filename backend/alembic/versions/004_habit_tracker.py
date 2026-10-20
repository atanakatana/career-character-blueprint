"""Gamified habit tracker (tier2 perk) — habit_trackers + habit_quests

One HabitTracker row per user holds authoritative progress (xp, level,
streaks) as real columns — never derived from a client payload — plus a
`state` JSONB blob for non-authoritative cosmetic/world data ported from
the original standalone prototype's game state. HabitQuest rows are the
daily quest list; completion is enforced idempotently at the application
layer (conditional UPDATE ... WHERE status='active').

Revision ID: 004
Revises: 003
Create Date: 2026-10-18
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "habit_trackers",
        sa.Column("id",                   UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id",               UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at",            sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at",            sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("target_job",            sa.String(150), nullable=True),
        sa.Column("xp",                    sa.Integer(),  nullable=False, server_default="0"),
        sa.Column("level",                 sa.Integer(),  nullable=False, server_default="1"),
        sa.Column("current_streak",        sa.Integer(),  nullable=False, server_default="0"),
        sa.Column("longest_streak",        sa.Integer(),  nullable=False, server_default="0"),
        sa.Column("last_completed_date",   sa.Date(),     nullable=True),
        sa.Column("state",                 JSONB(),       nullable=False, server_default="{}"),
    )
    op.create_index("uq_habit_trackers_user_id", "habit_trackers", ["user_id"], unique=True)

    op.create_table(
        "habit_quests",
        sa.Column("id",             UUID(as_uuid=True), primary_key=True),
        sa.Column("tracker_id",     UUID(as_uuid=True), sa.ForeignKey("habit_trackers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title",          sa.String(200), nullable=False),
        sa.Column("description",    sa.Text(),      nullable=False),
        sa.Column("time_estimate",  sa.String(50),  nullable=True),
        sa.Column("xp_reward",      sa.Integer(),   nullable=False, server_default="20"),
        sa.Column("status",         sa.String(20),  nullable=False, server_default="active"),
        sa.Column("source",         sa.String(20),  nullable=False, server_default="example"),
        sa.Column("completed_at",   sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("created_at",     sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("idx_habit_quests_tracker_id", "habit_quests", ["tracker_id"])


def downgrade() -> None:
    op.drop_index("idx_habit_quests_tracker_id", table_name="habit_quests")
    op.drop_table("habit_quests")
    op.drop_index("uq_habit_trackers_user_id", table_name="habit_trackers")
    op.drop_table("habit_trackers")
