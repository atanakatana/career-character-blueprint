import json
import re
import logging
from pydantic import ValidationError
from app.schemas.ai import AIOutput

logger = logging.getLogger(__name__)


class OutputParser:
    """
    Converts raw AI response text → validated AIOutput.

    Handles two common cases:
    1. Pure JSON (expected when response_mime_type="application/json" is set)
    2. JSON wrapped in ```json ... ``` fences (fallback)
    """

    def parse(self, raw: str) -> AIOutput:
        content = raw.strip()

        # Strip markdown fences if present
        if content.startswith("```"):
            content = re.sub(r"^```(?:json)?\s*\n?", "", content, flags=re.MULTILINE)
            content = re.sub(r"\n?\s*```\s*$",        "", content, flags=re.MULTILINE)
            content = content.strip()

        # Parse JSON
        try:
            data = json.loads(content)
        except json.JSONDecodeError as exc:
            preview = content[:300]
            logger.error(f"AI response is not valid JSON: {exc}\nPreview: {preview}")
            raise ValueError(
                f"AI response is not valid JSON: {exc}. "
                f"First 300 chars: {preview}"
            ) from exc

        # Validate against schema
        try:
            return AIOutput(**data)
        except ValidationError as exc:
            logger.error(f"AI output schema validation failed: {exc}")
            raise ValueError(f"AI output doesn't match required schema: {exc}") from exc


output_parser = OutputParser()
