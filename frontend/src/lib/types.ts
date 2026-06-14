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

export interface ReportData {
  profile_summary:          string
  capacity_and_energy:      string
  blind_spots:              string
  ideal_work_environment:   string
  career_recommendations:   CareerRecommendation[]
  long_term_vision:         string
  skill_development_roadmap: string
  decision_making_guide:    string
  action_plan:              string[]
  closing_statement:        string
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
