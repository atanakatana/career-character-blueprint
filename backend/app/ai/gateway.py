"""
Provider-agnostic AI gateway.
Swap providers by implementing AIProvider and updating the factory in tasks.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional


@dataclass
class AIConfig:
    model_name:  str
    max_tokens:  int
    temperature: float
    api_key:     str


@dataclass
class AIResponse:
    content:       str
    model:         str
    input_tokens:  Optional[int]
    output_tokens: Optional[int]
    latency_ms:    int


class AIProvider(ABC):
    """
    All AI providers must implement this interface.
    The `generate` method is intentionally synchronous — it is called
    via `asyncio.run_in_executor` inside the Celery task to avoid
    blocking the event loop during the HTTP round-trip.
    """

    @abstractmethod
    def generate(
        self,
        system_prompt: str,
        user_prompt:   str,
        config:        AIConfig,
    ) -> AIResponse:
        """
        Call the AI API and return a structured response.
        Raises on any API or network error — the Celery retry mechanism handles retries.
        """
