"""
Static MBTI-type -> starter habit list mapping.

Per the brief: "Static mappings are acceptable for now" / "Do not implement
advanced gamification yet." This is intentionally simple — four habits per
type, no AI personalisation, no per-user tuning. A user's habit list is
seeded once (see api/routes/habits.py) and can be edited/extended later
without needing this module to change.
"""

MBTI_HABIT_TEMPLATES: dict[str, list[str]] = {
    "INTJ": ["Deep Work Block", "Systems Review", "Reading", "Strength Training"],
    "INTP": ["Deep Work Block", "Idea Journal", "Reading", "Exercise"],
    "ENTJ": ["Priority Planning", "Deep Work Block", "Reading", "Strength Training"],
    "ENTP": ["Brainstorming Session", "Idea Journal", "Networking Touchpoint", "Movement Break"],

    "INFJ": ["Deep Work Block", "Reflection Journal", "Reading", "Quiet Walk"],
    "INFP": ["Creative Session", "Reflection Journal", "Reading", "Meditation"],
    "ENFJ": ["Check-in With Someone", "Reflection Journal", "Reading", "Movement Break"],
    "ENFP": ["Creative Session", "Brainstorming", "Walking", "Meditation"],

    "ISTJ": ["Daily Planning", "Task Review", "Reading", "Exercise"],
    "ISFJ": ["Daily Planning", "Care Check-in", "Reading", "Quiet Walk"],
    "ESTJ": ["Priority Planning", "Task Review", "Reading", "Strength Training"],
    "ESFJ": ["Check-in With Someone", "Daily Planning", "Reading", "Movement Break"],

    "ISTP": ["Hands-on Practice", "Solo Focus Block", "Reading", "Exercise"],
    "ISFP": ["Creative Session", "Solo Focus Block", "Walking", "Meditation"],
    "ESTP": ["Physical Training", "Priority Planning", "Networking Touchpoint", "Movement Break"],
    "ESFP": ["Creative Session", "Check-in With Someone", "Walking", "Movement Break"],

    "UNKNOWN": ["Deep Work Block", "Reflection Journal", "Reading", "Exercise"],
}


def get_habit_template(mbti_type: str | None) -> list[str]:
    key = (mbti_type or "UNKNOWN").upper()
    return MBTI_HABIT_TEMPLATES.get(key, MBTI_HABIT_TEMPLATES["UNKNOWN"])
