// ─── MBTI ──────────────────────────────────────────────────────────────────
export const MBTI_TYPES = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ',
] as const

export type MBTIType = typeof MBTI_TYPES[number] | 'UNKNOWN'

// ─── HUMAN DESIGN TYPES ────────────────────────────────────────────────────
export const HD_TYPES = [
  'Generator',
  'Manifesting Generator',
  'Projector',
  'Manifestor',
  'Reflector',
] as const

export type HDType = typeof HD_TYPES[number] | 'UNKNOWN'

// ─── HUMAN DESIGN AUTHORITIES ──────────────────────────────────────────────
export const HD_AUTHORITIES = [
  'Sacral',
  'Emotional / Solar Plexus',
  'Splenic',
  'Ego / Heart',
  'Self-Projected',
  'Mental / Environmental',
  'Lunar',
] as const

export type HDAuthority = typeof HD_AUTHORITIES[number] | 'UNKNOWN'

// ─── HUMAN DESIGN PROFILES ─────────────────────────────────────────────────
export const HD_PROFILES = [
  '1/3 — Investigator / Martyr',
  '1/4 — Investigator / Opportunist',
  '2/4 — Hermit / Opportunist',
  '2/5 — Hermit / Heretic',
  '3/5 — Martyr / Heretic',
  '3/6 — Martyr / Role Model',
  '4/6 — Opportunist / Role Model',
  '4/1 — Opportunist / Investigator',
  '5/1 — Heretic / Investigator',
  '5/2 — Heretic / Hermit',
  '6/2 — Role Model / Hermit',
  '6/3 — Role Model / Martyr',
] as const

export type HDProfile = typeof HD_PROFILES[number] | 'UNKNOWN'

// ─── FORM STEPS ────────────────────────────────────────────────────────────
export const FORM_STEPS = [
  { id: 1, label: 'Identity', title: 'Create Your Character',   subtitle: 'Who are you?' },
  { id: 2, label: 'MBTI',    title: 'Personality Type',        subtitle: 'How do you think?' },
  { id: 3, label: 'Design',  title: 'Human Design',            subtitle: 'How do you operate?' },
  { id: 4, label: 'Career',  title: 'Career Context',          subtitle: 'Where are you now?' },
  { id: 5, label: 'Review',  title: 'Review & Submit',         subtitle: 'Ready to generate?' },
] as const

export type FormStep = typeof FORM_STEPS[number]

// ─── SESSION STORAGE KEYS ───────────────────────────────────────────────────
/** Caches the completed assessment answers between the free Trial Reading and
 *  the paid unlock, so the user is never asked to re-fill the form after
 *  logging in / paying. Cleared once replayed through /api/submissions. */
export const PENDING_ASSESSMENT_KEY = 'relumma_pending_assessment'

// ─── REPORT SECTIONS ───────────────────────────────────────────────────────
export const REPORT_SECTIONS = [
  { id: 'profile-summary',         label: '01 — Profile Summary' },
  { id: 'capacity-energy',         label: '02 — Capacity & Energy' },
  { id: 'blind-spots',             label: '03 — Blind Spots' },
  { id: 'work-environment',        label: '04 — Ideal Environment' },
  { id: 'career-recommendations',  label: '05 — Career Paths' },
  { id: 'long-term-vision',        label: '06 — Long-Term Vision' },
  { id: 'skill-roadmap',           label: '07 — Skill Roadmap' },
  { id: 'decision-guide',          label: '08 — Decision Guide' },
  { id: 'action-plan',             label: '09 — Action Plan' },
  { id: 'closing',                 label: '10 — Closing' },
] as const
