import time
import logging
from typing import Optional

from app.ai.gateway import AIProvider, AIConfig, AIResponse

logger = logging.getLogger(__name__)


class GeminiProvider(AIProvider):
    """
    Google Gemini implementation of AIProvider.
    Uses the `google-generativeai` SDK.
    Future providers (OpenAI, Claude, OpenRouter) implement the same interface.
    """

    def __init__(self, api_key: str):
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            self._genai = genai
        except ImportError:
            raise RuntimeError(
                "google-generativeai is not installed. "
                "Run: pip install google-generativeai"
            )

    def generate(
        self,
        system_prompt: str,
        user_prompt:   str,
        config:        AIConfig,
    ) -> AIResponse:
        genai = self._genai

        generation_config = genai.types.GenerationConfig(
            max_output_tokens=config.max_tokens,
            temperature=config.temperature,
            # Constrain model to output valid JSON — reduces parsing failures
            response_mime_type="application/json",
        )

        model = genai.GenerativeModel(
            model_name=config.model_name,
            system_instruction=system_prompt,
            generation_config=generation_config,
        )

        logger.info(
            f"[Gemini] Calling {config.model_name} | "
            f"temp={config.temperature} | max_tokens={config.max_tokens}"
        )

        t0 = time.time()
        try:
            response = model.generate_content(user_prompt)
        except Exception as exc:
            logger.error(f"[Gemini] API error: {exc}")
            raise

        latency_ms = int((time.time() - t0) * 1000)

        # Extract token counts (may be None if not returned)
        input_tokens:  Optional[int] = None
        output_tokens: Optional[int] = None
        try:
            meta = response.usage_metadata
            input_tokens  = getattr(meta, "prompt_token_count",     None)
            output_tokens = getattr(meta, "candidates_token_count", None)
        except Exception:
            pass

        content = response.text
        logger.info(
            f"[Gemini] Done in {latency_ms}ms | "
            f"in={input_tokens} out={output_tokens} tokens"
        )

        return AIResponse(
            content=content,
            model=config.model_name,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            latency_ms=latency_ms,
        )
