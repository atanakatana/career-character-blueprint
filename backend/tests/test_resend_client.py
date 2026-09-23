from unittest.mock import MagicMock, patch

import httpx
import pytest

import app.config as cfg
from app.email.resend_client import ResendClient


def test_dry_run_when_no_api_key(monkeypatch):
    monkeypatch.setattr(cfg.settings, "RESEND_API_KEY", None)

    result = ResendClient().send("test@example.com", "Test Subject", "<p>Hello</p>")

    assert result == {"id": "dry_run"}


def test_raises_on_invalid_api_key(monkeypatch):
    monkeypatch.setattr(cfg.settings, "RESEND_API_KEY", "re_invalid_key_for_test")

    mock_response = MagicMock()
    mock_response.status_code = 401
    mock_response.text = '{"name":"missing_api_key","message":"Missing API key"}'
    mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
        "401", request=MagicMock(), response=mock_response
    )

    with patch("httpx.post", return_value=mock_response):
        with pytest.raises(httpx.HTTPStatusError):
            ResendClient().send("a@b.com", "Subject", "<p>Test</p>")
