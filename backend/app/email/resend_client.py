import logging
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

_RESEND_URL = "https://api.resend.com/emails"


class ResendClient:
    """
    Thin wrapper around the Resend HTTP API.

    Dry-run mode: when RESEND_API_KEY is not set (local dev, CI) the client
    logs the would-be email instead of calling the API, so the pipeline
    completes without crashing.
    """

    def send(self, to: str, subject: str, html: str) -> dict:
        api_key    = settings.RESEND_API_KEY
        from_email = settings.RESEND_FROM_EMAIL

        # ── Dry-run ───────────────────────────────────────────────────────────
        if not api_key:
            logger.warning(
                "[Resend] DRY RUN — RESEND_API_KEY not set.\n"
                f"  To  : {to}\n"
                f"  From: {from_email}\n"
                f"  Subj: {subject}"
            )
            return {"id": "dry_run"}

        # ── Real send ─────────────────────────────────────────────────────────
        from_field = (
            f"{settings.RESEND_FROM_NAME} <{from_email}>"
            if settings.RESEND_FROM_NAME
            else from_email
        )
        try:
            response = httpx.post(
                _RESEND_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type":  "application/json",
                },
                json={
                    "from":    from_field,
                    "to":      [to],
                    "subject": subject,
                    "html":    html,
                },
                timeout=30.0,
            )
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            logger.error(
                f"[Resend] HTTP {exc.response.status_code}: "
                f"{exc.response.text[:300]}"
            )
            raise
        except httpx.RequestError as exc:
            logger.error(f"[Resend] Network error: {exc}")
            raise

        data = response.json()
        logger.info(f"[Resend] Delivered — id={data.get('id')}  to={to}")
        return data


resend_client = ResendClient()
