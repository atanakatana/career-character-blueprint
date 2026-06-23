from app.email.templates import build_blueprint_email

html = build_blueprint_email(
    nickname        = '<script>alert("xss")</script>',
    character_title = 'Budi & "The Best" <Advisor>',
    mbti_type       = "INTJ",
    hd_type         = "Projector",
    hd_profile      = "1/3 — Investigator / Martyr",
    blueprint_url   = "http://localhost:3000/blueprint/x",
)

assert "<script>" not in html,       "Raw <script> tag found — XSS not escaped"
assert 'alert("xss")' not in html,   "Raw alert() found"
assert "&amp;" in html,              "& not escaped to &amp;"
assert "&lt;" in html or "&#" in html, "< not escaped"
print("XSS escaping OK")