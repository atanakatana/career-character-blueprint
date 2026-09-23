import re

import pytest

from app.email.templates import build_blueprint_email


def test_standard_render():
    html = build_blueprint_email(
        nickname="Andi",
        character_title="The Strategic Empath",
        mbti_type="INFJ",
        hd_type="Generator",
        hd_profile="3/5 — Martyr / Heretic",
        blueprint_url="http://localhost:3000/blueprint/testtoken123",
    )

    for needle in [
        "Andi", "The Strategic Empath", "INFJ", "Generator",
        "3/5", "testtoken123", "VIEW YOUR BLUEPRINT",
        "QUEST COMPLETE", "BLUEPRINT ARCHETYPE",
    ]:
        assert needle in html, f"Missing: {needle}"

    # No unresolved f-string placeholders
    remaining = re.findall(r"\{[a-z_][a-z_]+\}", html)
    assert not remaining, f"Unresolved placeholders: {remaining}"

    # Size check — Gmail clips above 102 KB
    assert len(html) < 102_400, f"Email too large: {len(html)} bytes"


def test_html_injection_is_escaped():
    html = build_blueprint_email(
        nickname='<script>alert("xss")</script>',
        character_title='Budi & "The Best" <Advisor>',
        mbti_type="INTJ",
        hd_type="Projector",
        hd_profile="1/3 — Investigator / Martyr",
        blueprint_url="http://localhost:3000/blueprint/x",
    )

    assert "<script>" not in html, "Raw <script> tag found — XSS not escaped"
    assert 'alert("xss")' not in html, "Raw alert() found"
    assert "&amp;" in html, "& not escaped to &amp;"
    assert "&lt;" in html or "&#" in html, "< not escaped"


def test_unknown_type_fields_are_hidden_not_leaked():
    html = build_blueprint_email(
        nickname="Sari",
        character_title="The Guide",
        mbti_type="UNKNOWN",
        hd_type="UNKNOWN",
        hd_profile="UNKNOWN",
        blueprint_url="http://localhost:3000/blueprint/y",
    )

    assert ">UNKNOWN<" not in html, "UNKNOWN appeared as a badge"
    assert "The Guide" in html
    assert "VIEW YOUR BLUEPRINT" in html


@pytest.mark.parametrize("profile,expected_code", [
    ("1/3 — Investigator / Martyr", "1/3"),
    ("6/3 — Role Model / Martyr", "6/3"),
    ("5/2 — Heretic / Hermit", "5/2"),
])
def test_profile_badge_shows_code_not_full_name(profile, expected_code):
    html = build_blueprint_email(
        nickname="N",
        character_title="T",
        mbti_type="INFJ",
        hd_type="Generator",
        hd_profile=profile,
        blueprint_url="http://localhost/x",
    )
    assert expected_code in html, f"Profile code {expected_code} not found in badge"
    assert "Martyr" not in html or html.count("Martyr") <= 1, \
        "Full profile name leaked into badge"
