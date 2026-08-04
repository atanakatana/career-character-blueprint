import type { MBTIType, HDType, HDAuthority, HDProfile } from './constants'

// ─── FORM DATA ──────────────────────────────────────────────────────────────
export interface SubmissionFormData {
  nickname:           string
  email:              string
  mbti_type:          MBTIType
  hd_type:            HDType
  hd_authority:       HDAuthority
  hd_profile:         HDProfile
  current_occupation: string
  burnout_triggers:   string
  success_vision:     string
}

// ─── v3 REPORT SUB-TYPES ────────────────────────────────────────────────────

export interface ProfileLine {
  line_name:   string        // "LINE 3 // MARTYR"
  title:       string        // "LEARN THROUGH TRIAL AND ERROR"
  body:        string
  implication: string | null
}

export interface BlindSpot {
  name:      string   // "IDEA BURNOUT"
  mechanism: string
  scenario:  string
}

export interface CareerArena {
  career_name:       string
  career_subtitle:   string
  why_it_fits:       string
  existing_skills:   string[]
  skills_to_develop: string[]
  is_best_fit:       boolean
  first_action:      string
}

export interface DailyQuest {
  name:          string
  description:   string
  time_estimate: string  // "20 MINUTES"
}

// ─── v3 REPORT DATA ─────────────────────────────────────────────────────────
// Detected by presence of `system_message` field.

export interface ReportDataV3 {
  // v3 marker field
  system_message:       string

  // Cover
  character_tagline:    string
  character_domain:     string

  // Section II
  conflict_mechanism:   string
  conflict_result:      string

  // Section III
  profile_intro:        string
  profile_lines:        ProfileLine[]
  profile_synthesis:    string

  // Section IV
  blind_spots:          BlindSpot[]

  // Section V
  career_arenas:        CareerArena[]

  // Section VI
  decision_intro:       string
  decision_question:    string
  decision_yes_signal:  string
  decision_no_signal:   string
  decision_trap_name:   string
  decision_trap_body:   string

  // Section VII
  daily_quests:         DailyQuest[]

  closing_statement:    string
}

// ─── v2 REPORT DATA (legacy — kept for backward compat) ─────────────────────

export interface WorkEnvironment {
  pros: string[]
  cons: string[]
}

export interface CareerRecommendation {
  career_name:             string
  why_it_fits:             string
  required_skills:         string[]
  first_action:            string
  estimated_income_range:  string
  future_growth_potential: string
}

export interface ReportDataV2 {
  profile_summary:           string[] | string
  capacity_and_energy:       string[] | string
  blind_spots:               string[] | string
  ideal_work_environment:    WorkEnvironment | string
  long_term_vision:          string[] | string
  skill_development_roadmap: string[] | string
  decision_making_guide:     string[] | string
  career_recommendations:    CareerRecommendation[]
  action_plan:               string[]
  closing_statement:         string
}

// Union — v3 or legacy v2
export type ReportData = ReportDataV3 | ReportDataV2

/** Type guard — true if report_data is v3 format */
export function isV3(data: ReportData): data is ReportDataV3 {
  return 'system_message' in data
}

// ─── BLUEPRINT RESPONSE ─────────────────────────────────────────────────────

export interface BlueprintReportResponse {
  id:              string
  character_title: string
  report_data:     ReportData
  ai_model_used:   string
  created_at:      string
  submission: {
    nickname:     string
    email:        string
    mbti_type:    string
    hd_type:      string
    hd_authority: string
    hd_profile:   string
    status:       string
    created_at:   string
  }
}

// Keep for any existing imports
export type BlueprintReport = BlueprintReportResponse

// ─── API / UI ────────────────────────────────────────────────────────────────
export interface SubmissionResponse {
  id:      string
  status:  'pending'
  message: string
}

export interface ApiError {
  detail:      string
  status_code: number
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// ─── TRIAL READING ───────────────────────────────────────────────────────────
export interface TrialReadingResponse {
  character_archetype:         string
  personality_summary:         string
  core_strengths:              string[]
  energy_type:                 string
  basic_career_recommendation: string
  mbti_type:                   string
}

// ─── AUTH / ACCOUNT ──────────────────────────────────────────────────────────
export interface AuthResponse {
  access_token: string
  token_type:   string
  expires_in:   number
}

export interface UserProfile {
  id:            string
  email:         string
  nickname:      string
  is_active:     boolean
  last_login_at: string | null
  created_at:    string
}

export interface MyBlueprintResponse {
  unlocked: boolean
  status:   'none' | 'pending' | 'processing' | 'failed' | 'completed'
  report:   BlueprintReportResponse | null
  token:    string | null
}

// ─── HABIT TRACKER ───────────────────────────────────────────────────────────
export interface HabitItem {
  id:              string
  name:            string
  completed_today: boolean
  current_streak:  number
  sort_order:      number
}

export interface HabitListResponse {
  habits:          HabitItem[]
  today_completed: number
  today_total:     number
}
