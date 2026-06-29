import sys
sys.path.insert(0, '.')

# Temporarily unset the key
import app.config as cfg
original = cfg.settings.RESEND_API_KEY
cfg.settings.RESEND_API_KEY = None

from app.email.resend_client import ResendClient
client = ResendClient()
result = client.send("test@example.com", "Test Subject", "<p>Hello</p>")

assert result == {"id": "dry_run"}, f"Expected dry_run result, got: {result}"
cfg.settings.RESEND_API_KEY = original
print("Dry-run mode OK")
