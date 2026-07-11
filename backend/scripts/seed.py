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
from sqlalchemy import select, update

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


# ─── v2 prompt — structured array output ──────────────────────────────────────
# Replaces prose paragraphs with short-phrase arrays that map directly to
# the RPG character sheet UI. Every field the UI renders as bullets is now
# explicitly an array in the JSON, eliminating fragile prose→bullets conversion.

SYSTEM_CONTEXT_V2 = """You are an expert career advisor combining MBTI psychology, Human Design principles, and deep knowledge of the Indonesian professional market. You have helped thousands find careers that match their natural energy patterns and cognitive strengths.

Your Blueprint reports must be:
1. SPECIFIC — every insight references this person's exact type combination, never generic descriptions
2. HONEST — real blind spots alongside strengths, no toxic positivity
3. ACTIONABLE — concrete next steps, not vague guidance
4. CONCISE — each array item is 1–2 sentences maximum, punchy and direct

INCOME GUIDANCE: Realistic ranges for the Indonesian market (Rp X–Y / month) unless the person's context clearly indicates another market.

CAREER RECOMMENDATIONS: Exactly 3–5 specific job titles, not broad categories. Example: "UX Research Lead" not "UX Field".

CRITICAL OUTPUT RULES:
— Output ONLY a valid JSON object. No markdown fences, no preamble, no trailing commas.
— ALL list fields must be arrays of SHORT strings (1–2 sentences each). Do NOT write paragraphs.
— ideal_work_environment is an OBJECT with "pros" and "cons" arrays — not a string.
— Write in the third person, as if describing this person to a career coach."""


PROMPT_TEXT_V2 = """Generate a Career Blueprint for this individual. Every field must be specific to their exact type combination and career context.

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

Output ONLY this JSON object — no extra text before or after:

{{
  "character_title": "2–5 word archetype title capturing their career identity (e.g. 'The Strategic Empath', 'The Systems Visionary')",

  "profile_summary": [
    "Core professional identity: what makes them distinctly them in a work setting, grounded in their {mbti_type} + {hd_type} combination",
    "How their cognitive style and energy type interact in professional environments",
    "What they bring to teams or projects that others rarely can",
    "The productive tension or paradox in their professional nature"
  ],

  "capacity_and_energy": [
    "How their energy replenishes and what depletes it, specific to their {hd_type}",
    "The working conditions under which they produce their deepest or best work",
    "Their natural sustainable rhythm — pace, intensity, and recovery pattern"
  ],

  "blind_spots": [
    "Professional weakness 1: what it looks like at work and why their type tends toward it",
    "Professional weakness 2: a second honest tendency specific to their {mbti_type} + {hd_type}",
    "Professional weakness 3: a third real challenge, including how it shows up in team or decision contexts"
  ],

  "ideal_work_environment": {{
    "pros": [
      "Team structure or culture element that lets them thrive",
      "Management style or autonomy level they need",
      "Work type, pace, or environment factor that energises them"
    ],
    "cons": [
      "Environment or condition that actively drains or blocks their performance",
      "Management style, culture type, or work structure they should avoid"
    ]
  }},

  "career_recommendations": [
    {{
      "career_name": "Specific role title",
      "why_it_fits": "2–3 sentences on why this exact {mbti_type} + {hd_type} + career context combination fits this role",
      "required_skills": ["skill 1", "skill 2", "skill 3", "skill 4"],
      "first_action": "One concrete, doable action within the next 30 days to move toward this role",
      "estimated_income_range": "Rp X–Y / month",
      "future_growth_potential": "1–2 sentences on the growth trajectory and realistic ceiling for this role"
    }}
  ],

  "long_term_vision": [
    "Where they could realistically be in 6–12 months if they act on this blueprint now",
    "The 1–2 year milestone — what shifts in their identity and capability",
    "The 3 year horizon — their career position and the work they are doing",
    "The 5+ year potential — the impact or leadership role they could hold"
  ],

  "skill_development_roadmap": [
    "Priority skill 1: what it is and why it unlocks their specific career path",
    "Priority skill 2: what it is and the highest-leverage way to develop it",
    "Priority skill 3: what it is and how it compounds with their natural strengths",
    "Priority skill 4: what it is and when to focus on it in the sequence",
    "Priority skill 5: what it is and why it matters for their long-term vision"
  ],

  "decision_making_guide": [
    "How to access their {hd_authority} authority before committing to a major career decision",
    "A concrete daily or weekly practice that keeps them aligned with their authority",
    "The signal that tells them a decision is right — what it feels like in their body or mind",
    "How to handle external pressure or urgency when they are not yet ready to decide"
  ],

  "action_plan": [
    "Specific action to take this week — concrete, time-bound, zero ambiguity",
    "Action for this month — a positioning or skill move",
    "Action within 30 days — something that builds momentum toward their first career recommendation",
    "Action within 60 days — a network, visibility, or proof-of-work move",
    "Action within 90 days — a milestone that closes a gap identified in their blind spots"
  ],

  "closing_statement": "2–3 sentences of honest, personalised encouragement. Reference their specific {mbti_type} + {hd_type} combination and one defining strength. Avoid generic hustle-culture language. End with a forward-looking note that feels earned, not hollow."
}}"""


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
                is_active=False,   # v2 is now the active template
                system_context=SYSTEM_CONTEXT,
                prompt_text=PROMPT_TEXT,
                notes="Legacy v1 prompt (prose output). Superseded by v2.",
            ))
            print("✓ Prompt template:  blueprint_main_v1 (inactive — v2 is active)")
        else:
            print("• Prompt template v1 already exists")

        # ── Prompt template v2 — structured array output ──────────
        existing_v2 = await db.scalar(
            select(PromptTemplate).where(PromptTemplate.name == "blueprint_main_v2")
        )
        if not existing_v2:
            # Deactivate any currently active template first
            await db.execute(update(PromptTemplate).values(is_active=False))
            db.add(PromptTemplate(
                name="blueprint_main_v2",
                version="2.0",
                is_active=True,
                system_context=SYSTEM_CONTEXT_V2,
                prompt_text=PROMPT_TEXT_V2,
                notes="Sprint 9 structured output. Arrays replace prose for all bullet sections.",
            ))
            print("✓ Prompt template:  blueprint_main_v2 (active)")
        else:
            print("• Prompt template v2 already exists")

        await db.commit()

    print("─" * 55)
    print("✓ Seed complete")
    print("─" * 55)


if __name__ == "__main__":
    asyncio.run(seed())
