import time
import logging

from app.ai.gateway import AIProvider, AIConfig, AIResponse

logger = logging.getLogger(__name__)

# Gemini 2.5 Flash is a "thinking" model. Left unbounded, its internal
# reasoning ("thinking") tokens are drawn from the generation budget, and the
# visible JSON gets cut off mid-string — the "Unterminated string" parse
# failures you were seeing. Because thinking volume varies per call, the cutoff
# point varies too, which is why one 3158-token output failed and a 3081-token
# one succeeded. Bounding thinking removes that variable.
#
#   THINKING_BUDGET = 0     -> thinking disabled. Most deterministic; recommended
#                              to stop truncation. Flash allows 0 (Pro does not).
#   THINKING_BUDGET = N > 0 -> thinking capped at N tokens. More reasoning depth,
#                              still bounded. If you raise this, make sure
#                              max_output_tokens comfortably exceeds N + the
#                              size of the JSON, and watch the logged finish
#                              reason to confirm you're not truncating.
THINKING_BUDGET = 0


class GeminiProvider(AIProvider):
    """
    Google Gemini implementation of AIProvider, using the `google-genai` SDK
    (the supported successor to `google-generativeai`).

    Future providers (OpenAI, Claude, OpenRouter) implement the same interface.
    """

    def __init__(self, api_key: str):
        try:
            from google import genai
            self._genai = genai
            self._client = genai.Client(api_key=api_key)
        except ImportError:
            raise RuntimeError(
                "google-genai is not installed. Run: pip install google-genai"
            )

    def generate(
        self,
        system_prompt: str,
        user_prompt:   str,
        config:        AIConfig,
    ) -> AIResponse:
        from google.genai import types

        gen_config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            max_output_tokens=config.max_tokens,
            temperature=config.temperature,
            # Constrain the model to emit valid JSON.
            response_mime_type="application/json",
            # Bound thinking so it cannot consume the output budget (see note above).
            thinking_config=types.ThinkingConfig(thinking_budget=THINKING_BUDGET),
        )

        logger.info(
            f"[Gemini] Calling {config.model_name} | "
            f"temp={config.temperature} | max_tokens={config.max_tokens} | "
            f"thinking_budget={THINKING_BUDGET}"
        )

        t0 = time.time()
        try:
            response = self._client.models.generate_content(
                model=config.model_name,
                contents=user_prompt,
                config=gen_config,
            )
        except Exception as exc:
            logger.error(f"[Gemini] API error: {exc}")
            raise

        latency_ms = int((time.time() - t0) * 1000)

        # --- finish_reason: the field whose absence made this look mysterious ---
        finish_reason = None
        try:
            finish_reason = response.candidates[0].finish_reason
        except (AttributeError, IndexError, TypeError):
            pass

        # Token accounting (thinking is reported separately as thoughts_token_count).
        input_tokens = output_tokens = thinking_tokens = None
        try:
            meta = response.usage_metadata
            input_tokens    = getattr(meta, "prompt_token_count",     None)
            output_tokens   = getattr(meta, "candidates_token_count", None)
            thinking_tokens = getattr(meta, "thoughts_token_count",   None)
        except Exception:
            pass

        logger.info(
            f"[Gemini] Done in {latency_ms}ms | "
            f"in={input_tokens} out={output_tokens} thinking={thinking_tokens} | "
            f"finish={finish_reason}"
        )

        # If the model hit the ceiling, the JSON is almost certainly truncated.
        # Say so loudly here instead of letting the parser raise a cryptic error
        # three layers down.
        if finish_reason is not None and str(finish_reason).endswith("MAX_TOKENS"):
            logger.error(
                "[Gemini] Output truncated (finish_reason=MAX_TOKENS). "
                "Raise max_output_tokens or lower THINKING_BUDGET. "
                f"in={input_tokens} out={output_tokens} thinking={thinking_tokens}"
            )

        # response.text raises if there are no text parts (e.g. safety block or a
        # MAX_TOKENS finish with nothing emitted). Convert that into a clear error.
        try:
            content = response.text
        except Exception as exc:
            raise RuntimeError(
                f"Gemini returned no usable text (finish_reason={finish_reason}): {exc}"
            ) from exc

        return AIResponse(
            content=content,
            model=config.model_name,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            latency_ms=latency_ms,
        )