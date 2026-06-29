from app.email.templates import build_blueprint_email

for profile, expected_code in [
    ("1/3 — Investigator / Martyr", "1/3"),
    ("6/3 — Role Model / Martyr",   "6/3"),
    ("5/2 — Heretic / Hermit",      "5/2"),
]:
    html = build_blueprint_email("N", "T", "INFJ", "Generator", profile,
                                 "http://localhost/x")
    assert expected_code in html, f"Profile code {expected_code} not found in badge"
    assert "Martyr" not in html or html.count("Martyr") <= 1, \
        "Full profile name leaked into badge"

print("Profile code extraction OK for all tested formats")