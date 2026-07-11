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

// ─── REPORT STRUCTURES ──────────────────────────────────────────────────────

export interface CareerRecommendation {
  career_name:             string
  why_it_fits:             string
  required_skills:         string[]
  first_action:            string
  estimated_income_range:  string
  future_growth_potential: string
}

/**
 * v2 structured environment — explicit pros/cons lists.
 * v1 reports stored this as a prose string.
 */
export interface WorkEnvironment {
  pros: string[]
  cons: string[]
}

/**
 * v2 schema: bullet-type fields are string[] instead of prose strings.
 * Union types preserve backward compatibility with v1 reports in the DB.
 */
export interface ReportData {
  // v2: string[]  |  v1 fallback: string
  profile_summary:           string[] | string
  capacity_and_energy:       string[] | string
  blind_spots:               string[] | string
  ideal_work_environment:    WorkEnvironment | string   // v2: object  |  v1: string
  long_term_vision:          string[] | string
  skill_development_roadmap: string[] | string
  decision_making_guide:     string[] | string

  // unchanged from v1
  career_recommendations:    CareerRecommendation[]
  action_plan:               string[]
  closing_statement:         string
}

export interface BlueprintReport {
  id:              string
  character_title: string
  report_data:     ReportData
  ai_model_used:   string
  created_at:      string
  submission: {
    nickname:      string
    mbti_type:     string
    hd_type:       string
    hd_authority:  string
    hd_profile:    string
  }
}

// ─── API RESPONSES ──────────────────────────────────────────────────────────
export interface SubmissionResponse {
  id:      string
  status:  'pending'
  message: string
}

export interface ApiError {
  detail:      string
  status_code: number
}

// ─── UI STATES ──────────────────────────────────────────────────────────────
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// ─── Report page alias ───────────────────────────────────────────────────────
// Extends BlueprintReport with the full submission fields returned by the API
export interface BlueprintReportResponse extends BlueprintReport {
  submission: {
    nickname:      string
    email:         string
    mbti_type:     string
    hd_type:       string
    hd_authority:  string
    hd_profile:    string
    status:        string
    created_at:    string
  }
}
