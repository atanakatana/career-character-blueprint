import os, sys
sys.path.insert(0, '.')

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("GEMINI_API_KEY not set — skipping live test")
    sys.exit(0)

from app.ai.providers.gemini import GeminiProvider
from app.ai.gateway import AIConfig

provider = GeminiProvider(api_key=api_key)
config = AIConfig(
    model_name="gemini-2.5-flash",
    max_tokens=200,
    temperature=0.7,
    api_key=api_key,
)
response = provider.generate(
    system_prompt="You are a helpful assistant. Respond only with valid JSON.",
    user_prompt='Return exactly this JSON: {"status": "ok", "model": "gemini-2.5-flash"}',
    config=config,
)
print(f"Response: {response.content[:100]}")
print(f"Latency:  {response.latency_ms}ms")
print(f"Tokens:   in={response.input_tokens} out={response.output_tokens}")
print("Gemini 2.5 Flash provider OK")