import re, sys
sys.path.insert(0, '.')
from app.email.templates import build_blueprint_email

html = build_blueprint_email(
    nickname        = "Andi",
    character_title = "The Strategic Empath",
    mbti_type       = "INFJ",
    hd_type         = "Generator",
    hd_profile      = "3/5 — Martyr / Heretic",
    blueprint_url   = "http://localhost:3000/blueprint/testtoken123",
)

# Content checks
for needle in ["Andi", "The Strategic Empath", "INFJ", "Generator",
               "3/5", "testtoken123", "VIEW YOUR BLUEPRINT",
               "QUEST COMPLETE", "CHARACTER CLASS"]:
    assert needle in html, f"Missing: {needle}"

# No unresolved f-string placeholders
remaining = re.findall(r'\{[a-z_][a-z_]+\}', html)
assert not remaining, f"Unresolved placeholders: {remaining}"

# Size check — Gmail clips above 102 KB
assert len(html) < 102_400, f"Email too large: {len(html)} bytes"

print(f"OK — {len(html):,} bytes")