# Import all models so Alembic picks up their metadata
# and so SQLAlchemy resolves relationship strings correctly.
from app.models.admin_user import AdminUser
from app.models.submission import Submission
from app.models.report import Report
from app.models.report_token import ReportToken
from app.models.email_log import EmailLog
from app.models.prompt_template import PromptTemplate
from app.models.ai_model_config import AIModelConfig
from app.models.payment import Payment
from app.models.user import User
from app.models.habit import Habit
from app.models.habit_completion import HabitCompletion

__all__ = [
    "AdminUser",
    "Submission",
    "Report",
    "ReportToken",
    "EmailLog",
    "PromptTemplate",
    "AIModelConfig",
    "Payment",
    "User",
    "Habit",
    "HabitCompletion",
]
