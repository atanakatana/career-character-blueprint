#!/usr/bin/env python3
"""
Database seed script — idempotent.
Creates: admin user, Gemini model config, and the v1 prompt template.

Usage:
    docker compose exec backend python -m scripts.seed
"""
import asyncio, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import AsyncSessionLocal
from app.models.admin_user import AdminUser
from app.models.ai_model_config import AIModelConfig
from app.models.prompt_template import PromptTemplate
from app.core.security import hash_password
from sqlalchemy import select

# ─── Prompt content ───────────────────────────────────────────────────────────

SYSTEM_CONTEXT = """You are an expert career advisor and human potential specialist who combines MBTI personality psychology with Human Design principles and practical career development methodology. You have helped thousands of professionals find career paths that align with their natural strengths and energy patterns.

Your Blueprint reports are distinguished by three qualities:
1. SPECIFICITY — every insight references this person's exact type/design combination, never generic descriptions
2. HONESTY — acknowledge real challenges and blind spots alongside strengths, no toxic positivity
3. ACTIONABILITY — every recommendation includes concrete next steps, not vague guidance

INCOME GUIDANCE: Provide income ranges realistic for the Indonesian market (Rp X – Y / month) unless the person's context clearly indicates another market.

CAREER RECOMMENDATIONS: Provide exactly 3–5 specific job titles or roles, not broad categories. Example: "UX Research Lead" not "UX Field".

CRITICAL OUTPUT FORMAT:
Respond ONLY with a valid JSON object. Do NOT include:
- Markdown code fences (```json)
- Preamble, explanation, or comments
- Trailing commas

The JSON must exactly match this schema:
{
  "character_title": "2–5 word professional archetype title capturing this person's unique career identity (e.g. 'The Strategic Empath', 'The Systems Visionary')",
  "profile_summary": "3–4 paragraphs synthesising MBTI and Human Design into a clear professional identity. Must reference their specific type combination, not generic descriptions.",
  "capacity_and_energy": "2–3 paragraphs on how they operate at their best: energy patterns, optimal working conditions, sustainable pace. Ground in their specific HD type and MBTI.",
  "blind_spots": "2–3 paragraphs on genuine professional weaknesses this combination tends to have. Be honest. Include how these show up at work.",
  "ideal_work_environment": "2–3 paragraphs describing team structure, management style, company culture, physical environment, and working hours that suit them.",
  "career_recommendations": [
    {
      "career_name": "Specific role title",
      "why_it_fits": "2–3 sentences on why this role fits this exact MBTI+HD+career context combination",
      "required_skills": ["skill 1", "skill 2", "skill 3"],
      "first_action": "One concrete, doable action within the next 30 days",
      "estimated_income_range": "Realistic range for this role",
      "future_growth_potential": "Career trajectory and growth ceiling for this path"
    }
  ],
  "long_term_vision": "2–3 paragraphs on what a fulfilling 5-year career arc looks like, grounded in their unique combination",
  "skill_development_roadmap": "3–4 paragraphs on key skills to develop in priority order, with reasoning tied to their specific profile",
  "decision_making_guide": "2–3 paragraphs on how this person should make important career decisions based on their HD authority and MBTI decision style",
  "action_plan": ["action 1", "action 2", "action 3", "action 4", "action 5"],
  "closing_statement": "2–3 sentences of genuine, specific encouragement tailored to their combination. Not generic motivation."
}"""

PROMPT_TEXT = """Generate a Career Blueprint for this individual. Use all provided context to produce a report that is deeply specific to them — not a generic type description.

═══ MBTI PROFILE ═══
Type: {mbti_type}
{mbti_context}

═══ HUMAN DESIGN ═══
Type: {hd_type}
{hd_type_context}

Authority: {hd_authority}
{hd_authority_context}

Profile: {hd_profile}
{hd_profile_context}

═══ CAREER CONTEXT ═══
Nickname: {nickname}
Current Occupation: {current_occupation}
What drains or burns them out: {burnout_triggers}
Their vision of success: {success_vision}

Generate the Career Blueprint now. Output only the JSON object. Every section must reference this person's specific type combination and career context."""


async def seed() -> None:
    print("─" * 55)
    print("Character Career Blueprint — Database Seed")
    print("─" * 55)

    async with AsyncSessionLocal() as db:

        # ── Admin user ────────────────────────────────────────────
        email    = os.getenv("ADMIN_DEFAULT_EMAIL",    "admin@ccblueprint.com")
        password = os.getenv("ADMIN_DEFAULT_PASSWORD", "ChangeMe123!")

        if not await db.scalar(select(AdminUser).where(AdminUser.email == email)):
            db.add(AdminUser(email=email, password_hash=hash_password(password)))
            print(f"✓ Admin user:       {email}  (password: {password})")
            print("  ⚠  Change this password immediately in production.")
        else:
            print(f"• Admin user already exists: {email}")

        # ── Gemini model config ───────────────────────────────────
        if not await db.scalar(select(AIModelConfig).where(AIModelConfig.provider == "gemini")):
            db.add(AIModelConfig(
                provider="gemini",
                model_name="gemini-2.5-flash",
                is_active=True,
                api_key_env_var="GEMINI_API_KEY",
                max_tokens=8000,
                temperature=0.7,
                config_json={"response_mime_type": "application/json"},
            ))
            print("✓ Gemini config:    gemini-2.5-flash (active)")
        else:
            print("• Gemini model config already exists")

        # ── Prompt template v1 ────────────────────────────────────
        if not await db.scalar(select(PromptTemplate).where(PromptTemplate.name == "blueprint_main_v1")):
            db.add(PromptTemplate(
                name="blueprint_main_v1",
                version="1.0",
                is_active=True,
                system_context=SYSTEM_CONTEXT,
                prompt_text=PROMPT_TEXT,
                notes="Default v1 prompt. Edit in admin panel for A/B testing.",
            ))
            print("✓ Prompt template:  blueprint_main_v1 (active)")
        else:
            print("• Prompt template already exists")

        await db.commit()

    print("─" * 55)
    print("✓ Seed complete")
    print("─" * 55)


if __name__ == "__main__":
    asyncio.run(seed())
