// ─── Submissions ──────────────────────────────────────────────────────────────

export interface SubmissionListItem {
  id:             string
  nickname:       string
  email:          string
  mbti_type:      string
  hd_type:        string
  status:         string
  created_at:     string
  celery_task_id: string | null
}

export interface PaginatedSubmissions {
  items: SubmissionListItem[]
  total: number
  skip:  number
  limit: number
}

export interface AdminSubmissionDetail {
  id:                      string
  nickname:                string
  email:                   string
  mbti_type:               string
  hd_type:                 string
  hd_authority:            string
  hd_profile:              string
  current_occupation:      string
  burnout_triggers:        string
  success_vision:          string
  status:                  string
  created_at:              string
  celery_task_id:          string | null
  processing_started_at:   string | null
  processing_completed_at: string | null
  error_message:           string | null
  retry_count:             number
  report_token:            string | null
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

export interface PromptTemplate {
  id:             string
  name:           string
  version:        string
  is_active:      boolean
  prompt_text:    string
  system_context: string
  notes:          string | null
  created_at:     string
  updated_at:     string
}

// ─── Models ───────────────────────────────────────────────────────────────────

export interface AIModelConfig {
  id:              string
  provider:        string
  model_name:      string
  is_active:       boolean
  api_key_env_var: string
  max_tokens:      number
  temperature:     number
  config_json:     Record<string, unknown> | null
  created_at:      string
}

// ─── Email logs ───────────────────────────────────────────────────────────────

export interface EmailLogItem {
  id:                string
  submission_id:     string
  email_type:        string
  recipient_email:   string
  resend_message_id: string | null
  status:            string
  error_message:     string | null
  created_at:        string
}
