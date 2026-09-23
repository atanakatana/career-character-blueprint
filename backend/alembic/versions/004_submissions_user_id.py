"""Add submissions.user_id — closes an account/report-linking gap

Until now, a completed paid report was linked to a logged-in Re:Lumma
account purely by matching `users.email` against `submissions.email` at
read time (see `api/routes/users.py::get_my_blueprint`) — there was no
foreign key, by design (see the superseded note in 003_users_and_habits.py).

That turned out to be a real vulnerability: registration has no email
verification, so anyone who knew (or guessed) a paying customer's email
could register a Re:Lumma account with that email and immediately view the
victim's paid report — including what they wrote about their occupation,
burnout triggers, and success vision. No interaction from the victim
required.

This migration adds a nullable `user_id` FK so ownership can be established
at submission-*creation* time (by the authenticated session that actually
created it — see `api/routes/submissions.py`), instead of inferred later
from an unverified string match. Nullable and `ON DELETE SET NULL` rather
than `NOT NULL` / `CASCADE`:
  - Nullable even after backfill, because a submission's email might not
    match any registered user (e.g. submitted before any account existed) —
    there's no account to attribute those rows to.
  - SET NULL (not CASCADE) on delete because a submission/report represents
    something the customer paid for; deleting a `User` row should never
    delete their purchase history as a side effect.

Confirmed 2026-09-23: this project has never run against a database with
real customers, so this migration also backfills `user_id` for every
existing row where a matching user exists, and the email-match fallback in
`get_my_blueprint` has been removed entirely (see api/routes/users.py) —
`user_id` is now the only way a submission is ever linked to an account.

Revision ID: 004
Revises: 003
Create Date: 2026-08-13
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "submissions",
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
    )
    op.create_index("idx_submissions_user_id", "submissions", ["user_id"])

    # One-time backfill — see confirmation note above. Rows whose email
    # matches no registered user are left with user_id NULL.
    op.execute("""
        UPDATE submissions
        SET user_id = users.id
        FROM users
        WHERE lower(users.email) = lower(submissions.email)
          AND submissions.user_id IS NULL
    """)


def downgrade() -> None:
    op.drop_index("idx_submissions_user_id", table_name="submissions")
    op.drop_column("submissions", "user_id")
