import httpx
from unittest.mock import patch, MagicMock

import sys
sys.path.insert(0, '.')

import app.config as cfg
cfg.settings.RESEND_API_KEY = "re_invalid_key_for_test"

from app.email.resend_client import ResendClient

# Mock httpx to return a 401
mock_response = MagicMock()
mock_response.status_code = 401
mock_response.text = '{"name":"missing_api_key","message":"Missing API key"}'
mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
    "401", request=MagicMock(), response=mock_response
)

with patch("httpx.post", return_value=mock_response):
    try:
        ResendClient().send("a@b.com", "Subject", "<p>Test</p>")
        print("FAIL — should have raised")
    except httpx.HTTPStatusError as e:
        print(f"Correctly raised HTTPStatusError on 401")

cfg.settings.RESEND_API_KEY = None