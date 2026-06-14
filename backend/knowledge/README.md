# AI Knowledge Base

This directory contains the structured knowledge JSON files used to build
context for AI report generation. These files replace a vector database (RAG)
because the MBTI/Human Design domain is fully enumerable.

## Structure

```
knowledge/
  mbti/
    INFJ.json       ← one file per MBTI type (16 total)
    INTJ.json
    ...

  hd_types/
    Generator.json
    Manifesting_Generator.json
    Projector.json
    Manifestor.json
    Reflector.json

  hd_authorities/
    Sacral.json
    Emotional.json
    Splenic.json
    Ego.json
    Self-Projected.json
    Mental.json
    Lunar.json

  hd_profiles/
    1_3.json        ← one file per profile (12 total)
    1_4.json
    ...

  career_domains/
    technical.json
    creative.json
    leadership.json
    entrepreneurial.json
```

## JSON Schema (per file)

```json
{
  "id": "INFJ",
  "label": "The Counselor",
  "description": "...",
  "strengths": ["..."],
  "challenges": ["..."],
  "work_style": "...",
  "decision_patterns": "...",
  "environment_needs": ["..."],
  "compatible_career_domains": ["..."],
  "avoid_environments": ["..."]
}
```

## Implementation

Knowledge files are loaded in Sprint 5 by the prompt construction layer.
The loader reads only the files relevant to the user's specific MBTI type,
HD type, HD authority, and HD profile — keeping prompt size bounded.
