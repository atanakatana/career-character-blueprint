from app.email.templates import build_blueprint_email

html = build_blueprint_email(
    nickname        = "Sari",
    character_title = "The Guide",
    mbti_type       = "UNKNOWN",
    hd_type         = "UNKNOWN",
    hd_profile      = "UNKNOWN",
    blueprint_url   = "http://localhost:3000/blueprint/y",
)

# None of the UNKNOWN strings should appear as badge text
assert ">UNKNOWN<" not in html, "UNKNOWN appeared as a badge"
# Page should still render the title and CTA
assert "The Guide" in html
assert "VIEW YOUR BLUEPRINT" in html
print("UNKNOWN handling OK")