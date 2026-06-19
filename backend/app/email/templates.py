"""
Career Blueprint delivery email.

Design constraints:
- Table-based layout (Outlook compatibility)
- All CSS inline (Gmail strips <style> blocks for forwarded mail)
- No percentage heights on <td> (Outlook bug)
- bgcolor attribute as background-color fallback
- No CSS Grid / Flexbox
- Max width 600px
- Web fonts declared but gracefully degrade to Courier New / Georgia
"""
import html as _html


# ─── Public API ───────────────────────────────────────────────────────────────

def build_blueprint_email(
    nickname:        str,
    character_title: str,
    mbti_type:       str,
    hd_type:         str,
    hd_profile:      str,
    blueprint_url:   str,
) -> str:
    """Returns the full HTML email string ready to send via Resend."""

    # Escape user-supplied strings before injecting into HTML
    e_nickname  = _html.escape(nickname)
    e_title     = _html.escape(character_title)

    # ── Type badges ────────────────────────────────────────────────────────────
    badges = []
    if mbti_type and mbti_type != "UNKNOWN":
        badges.append(_badge(_html.escape(mbti_type), bg="#F5C542", fg="#10141F"))
    if hd_type and hd_type != "UNKNOWN":
        badges.append(_badge(_html.escape(hd_type), bg="#4DA6FF", fg="#10141F"))
    if hd_profile and hd_profile != "UNKNOWN":
        # "3/5 — Martyr / Heretic"  →  "3/5"
        code = hd_profile.split("—")[0].strip() if "—" in hd_profile else hd_profile
        badges.append(_badge(_html.escape(code), bg="#2E3B52", fg="#8892A4"))

    badges_html = "&nbsp;".join(badges)

    # ── Section preview list ───────────────────────────────────────────────────
    sections = [
        "Character Title &amp; Profile Summary",
        "Capacity, Energy &amp; Work Style",
        "Blind Spots &amp; Growth Edges",
        "Career Recommendations (3&ndash;5 Specific Roles)",
        "Skill Roadmap &amp; Long-Term Vision",
        "+ 5 more sections",
    ]
    sections_html = _section_rows(sections)

    return _layout(
        e_nickname    = e_nickname,
        e_title       = e_title,
        badges_html   = badges_html,
        sections_html = sections_html,
        blueprint_url = blueprint_url,
    )


# ─── Private helpers ──────────────────────────────────────────────────────────

def _badge(text: str, bg: str, fg: str) -> str:
    return (
        f'<span style="display:inline-block;background-color:{bg};color:{fg};'
        f'font-family:\'Courier New\',Courier,monospace;font-size:9px;'
        f'font-weight:bold;padding:3px 8px;letter-spacing:1px;">'
        f'{text}</span>'
    )


def _section_rows(sections: list[str]) -> str:
    rows = []
    for i, s in enumerate(sections):
        border = "border-bottom:1px solid #2E3B52;" if i < len(sections) - 1 else ""
        color  = "#8892A4" if s.startswith("+") else "#F5F5F5"
        rows.append(
            f'<tr><td style="{border}padding:8px 0;">'
            f'<span style="font-family:\'Courier New\',Courier,monospace;font-size:10px;'
            f'color:#5CE27A;">&#9658;</span>'
            f'&nbsp;<span style="font-family:Georgia,\'Times New Roman\',serif;'
            f'font-size:13px;color:{color};">{s}</span>'
            f'</td></tr>'
        )
    return (
        '<table width="100%" cellpadding="0" cellspacing="0" border="0" '
        'style="border:1px solid #2E3B52;background-color:#1C2434;">'
        '<tr><td style="padding:4px 14px;">'
        '<table width="100%" cellpadding="0" cellspacing="0" border="0">'
        + "".join(rows) +
        '</table></td></tr></table>'
    )


def _layout(
    e_nickname:    str,
    e_title:       str,
    badges_html:   str,
    sections_html: str,
    blueprint_url: str,
) -> str:
    return f"""\
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Your Career Blueprint is Ready</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    body,table,td,a{{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}}
    table,td{{mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;}}
    a[x-apple-data-detectors]{{color:inherit!important;text-decoration:none!important;}}
    body{{margin:0;padding:0;background-color:#0A0E1A;}}
    @media only screen and (max-width:620px){{
      .email-wrap{{width:100%!important;}}
      .mob-pad{{padding:24px 16px!important;}}
      .mob-font{{font-size:20px!important;}}
    }}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#0A0E1A;">

  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    {e_title} &mdash; your Career Blueprint has been crafted. Click to open your full report.&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;
  </div>

  <center>
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#0A0E1A;min-width:320px;">
    <tr>
      <td align="center" style="padding:40px 20px;">

        <!-- ═══════════════════════════════════
             MAIN CONTAINER  (600px max)
        ═══════════════════════════════════ -->
        <table class="email-wrap" width="600" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px;border:2px solid #F5C542;background-color:#10141F;">


          <!-- ── HEADER BAR ────────────────────── -->
          <tr>
            <td bgcolor="#1C2434"
                style="padding:14px 28px;border-bottom:2px solid #F5C542;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:'Courier New',Courier,monospace;
                              font-size:10px;color:#F5C542;letter-spacing:2px;">
                    &#9670; CHARACTER CAREER BLUEPRINT
                  </td>
                  <td align="right"
                      style="font-family:'Courier New',Courier,monospace;
                             font-size:8px;color:#5CE27A;letter-spacing:1px;">
                    QUEST COMPLETE
                  </td>
                </tr>
              </table>
            </td>
          </tr>


          <!-- ── HERO ─────────────────────────── -->
          <tr>
            <td class="mob-pad" align="center" bgcolor="#10141F"
                style="padding:44px 40px 32px;">
              <p style="margin:0 0 10px;font-family:'Courier New',Courier,monospace;
                         font-size:22px;color:#F5C542;">
                &#9733;
              </p>
              <h1 class="mob-font"
                  style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;
                         font-size:26px;font-weight:bold;color:#F5F5F5;line-height:1.35;
                         letter-spacing:0;">
                Your Career Blueprint<br />is Ready, {e_nickname}
              </h1>
              <p style="margin:0;font-family:'Courier New',Courier,monospace;
                         font-size:9px;color:#8892A4;letter-spacing:2px;">
                YOUR CAREER CODEX HAS BEEN CRAFTED
              </p>
            </td>
          </tr>


          <!-- ── CHARACTER CARD ────────────────── -->
          <tr>
            <td style="padding:0 28px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="border:2px solid #F5C542;background-color:#1C2434;">
                <tr>
                  <td bgcolor="#10141F"
                      style="padding:8px 14px;border-bottom:1px solid #2E3B52;">
                    <span style="font-family:'Courier New',Courier,monospace;
                                  font-size:8px;color:#F5C542;letter-spacing:2px;">
                      CHARACTER CLASS
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 16px 14px;">
                    <p style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;
                               font-size:22px;font-weight:bold;color:#F5C542;line-height:1.2;">
                      {e_title}
                    </p>
                    <p style="margin:0;">{badges_html}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>


          <!-- ── WHAT'S INSIDE ─────────────────── -->
          <tr>
            <td style="padding:0 28px 28px;">
              <p style="margin:0 0 10px;font-family:'Courier New',Courier,monospace;
                         font-size:9px;color:#8892A4;letter-spacing:2px;">
                YOUR BLUEPRINT INCLUDES
              </p>
              {sections_html}
            </td>
          </tr>


          <!-- ── CTA BUTTON ────────────────────── -->
          <tr>
            <td align="center" style="padding:0 28px 12px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td bgcolor="#F5C542"
                      style="border:2px solid #C4A033;">
                    <a href="{blueprint_url}"
                       style="display:block;padding:14px 40px;
                              font-family:'Courier New',Courier,monospace;
                              font-size:11px;font-weight:bold;
                              color:#10141F;text-decoration:none;
                              letter-spacing:2px;white-space:nowrap;">
                      &#9658;&nbsp; VIEW YOUR BLUEPRINT
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>


          <!-- ── PLAIN URL FALLBACK ────────────── -->
          <tr>
            <td align="center" style="padding:0 28px 36px;">
              <p style="margin:0 0 4px;font-family:'Courier New',Courier,monospace;
                         font-size:9px;color:#8892A4;">
                Or copy this link:
              </p>
              <p style="margin:0 0 12px;font-family:'Courier New',Courier,monospace;
                         font-size:9px;word-break:break-all;">
                <a href="{blueprint_url}"
                   style="color:#4DA6FF;text-decoration:none;">
                  {blueprint_url}
                </a>
              </p>
              <p style="margin:0;font-family:Georgia,serif;font-size:12px;
                         color:#8892A4;font-style:italic;">
                Your blueprint link never expires &mdash; it&rsquo;s yours to keep and revisit.
              </p>
            </td>
          </tr>


          <!-- ── FOOTER ────────────────────────── -->
          <tr>
            <td bgcolor="#1C2434"
                style="padding:20px 28px;border-top:2px solid #2E3B52;">
              <p style="margin:0;font-family:'Courier New',Courier,monospace;
                         font-size:8px;color:#8892A4;line-height:1.8;">
                Character Career Blueprint &middot; AI-Powered Career Guidance<br />
                You are receiving this because you submitted a Career Blueprint request.<br />
                This is a transactional email. No marketing. No spam.
              </p>
            </td>
          </tr>


        </table>
        <!-- end main container -->

      </td>
    </tr>
  </table>
  </center>

</body>
</html>"""
