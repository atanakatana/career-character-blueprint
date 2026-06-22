import json
import logging
import re

from pydantic import ValidationError

from app.schemas.ai import AIOutput

logger = logging.getLogger(__name__)


class TruncatedJSONError(ValueError):
    """The response looks cut off mid-output (open string / unbalanced braces).

    The root cause is almost always UPSTREAM (output-token budget, or Gemini's
    thinking budget eating into that budget), so a plain retry of the identical
    call tends to fail the same way. The task layer should treat this as a
    config problem to surface, not just another roll of the dice.
    """


class MalformedJSONError(ValueError):
    """The response is complete but not valid JSON (bad escaping, stray prose).

    Retrying the identical prompt at the same temperature is unlikely to help.
    """


class OutputParser:
    """Raw AI text -> validated AIOutput.

    IMPORTANT: this is a SAFETY NET, not a fix. It cannot recover characters
    the model never produced. If the model truncates, fix it upstream:
    set response_mime_type="application/json" + a responseSchema, and give the
    call a large enough output budget (accounting for thinking tokens).
    """

    def parse(self, raw: str) -> AIOutput:
        if not raw or not raw.strip():
            raise MalformedJSONError("AI response was empty.")

        content = self._extract_json(raw)
        data = self._loads_with_repair(content, raw)

        try:
            return AIOutput(**data)
        except ValidationError as exc:
            # Log the FULL response so a schema mismatch is debuggable.
            logger.error(
                "AI output failed schema validation: %s\n--- full raw response ---\n%s",
                exc,
                raw,
            )
            raise ValueError(f"AI output doesn't match required schema: {exc}") from exc

    # ------------------------------------------------------------------ #
    # helpers
    # ------------------------------------------------------------------ #

    @staticmethod
    def _extract_json(raw: str) -> str:
        """Drop any prose or code fences surrounding the JSON object.

        More robust than line-anchored regex: we remove ``` markers, then slice
        from the FIRST '{' to the LAST '}'. Anything the model adds before or
        after the object ("Here is your JSON:", trailing commentary) is
        discarded. If the response is truncated, the last '}' will belong to an
        inner object, the slice will be invalid JSON, and parsing will fail
        loudly below — which is what we want.
        """
        content = raw.strip()
        if "```" in content:
            content = content.replace("```json", "").replace("```", "").strip()

        start = content.find("{")
        end = content.rfind("}")
        if start != -1 and end > start:
            content = content[start : end + 1]
        return content.strip()

    def _loads_with_repair(self, content: str, raw: str) -> dict:
        # 1) Straight parse — the happy path (and the only path when structured
        #    output is enabled upstream).
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            pass  # fall through to a single repair attempt

        # 2) Cheap repair for *recoverable* defects only.
        repaired = self._cheap_repair(content)
        try:
            return json.loads(repaired)
        except json.JSONDecodeError as exc:
            self._log_and_classify(content, raw, exc)  # always raises

    @staticmethod
    def _cheap_repair(content: str) -> str:
        """Fix the two most common RECOVERABLE defects.

        1. Trailing commas before } or ]  ->  removed.
           Legal in JavaScript, illegal in JSON; LLMs emit them often.
        2. Raw C0 control characters (unescaped newlines/tabs inside string
           values) -> stripped. JSON requires these escaped (\\n, \\t), so a
           literal one makes the document invalid. Stripping structural
           whitespace is harmless (JSON ignores it outside strings); stripping
           it from inside a string lightly mangles formatting but salvages the
           parse.

        This deliberately does NOT try to close a truncated response. Auto-
        completing the rest of a paying customer's reading is worse than failing.
        """
        content = re.sub(r",\s*([}\]])", r"\1", content)  # trailing commas
        content = re.sub(r"[\x00-\x1f]", "", content)      # illegal control chars
        return content

    @staticmethod
    def _log_and_classify(content: str, raw: str, exc: json.JSONDecodeError) -> None:
        # Log EVERYTHING. The old 300-char preview hid exactly where it broke.
        logger.error(
            "JSON parse failed: %s | error_pos=%s content_len=%s\n"
            "--- full raw response ---\n%s",
            exc,
            exc.pos,
            len(content),
            raw,
        )

        # Classify so the caller can react intelligently. "Unterminated string"
        # or an error within the last couple of chars => the document ran out,
        # i.e. truncation. Anything else => malformed-but-complete.
        near_end = exc.pos >= len(content) - 2
        looks_truncated = ("Unterminated string" in str(exc)) or near_end

        if looks_truncated:
            raise TruncatedJSONError(
                f"AI response appears truncated: {exc} "
                f"(error at char {exc.pos} of {len(content)})."
            ) from exc

        raise MalformedJSONError(f"AI response is not valid JSON: {exc}.") from exc


output_parser = OutputParser()