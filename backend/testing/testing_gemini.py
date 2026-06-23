import os
import google.generativeai as genai

# Grab your API key from the container's environment
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

print("\n=== AVAILABLE MODELS FOR YOUR KEY ===")
for m in genai.list_models():
    if "generateContent" in m.supported_generation_methods:
        # Strip the 'models/' prefix to match your database format
        print(m.name.replace('models/', ''))
print("=====================================\n")