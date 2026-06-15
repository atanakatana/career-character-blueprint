// ─── Internal form state type ────────────────────────────────────────────────
// Uses plain strings so empty/unselected values are '' rather than a typed enum.
export interface FormState {
  nickname:           string
  email:              string
  mbti_type:          string
  hd_type:            string
  hd_authority:       string
  hd_profile:         string
  current_occupation: string
  burnout_triggers:   string
  success_vision:     string
}

export const INITIAL_FORM_STATE: FormState = {
  nickname:           '',
  email:              '',
  mbti_type:          '',
  hd_type:            '',
  hd_authority:       '',
  hd_profile:         '',
  current_occupation: '',
  burnout_triggers:   '',
  success_vision:     '',
}

export type FormErrors = Partial<Record<keyof FormState, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ─── Per-step validators ──────────────────────────────────────────────────────

export function validateStep1(data: FormState): FormErrors {
  const e: FormErrors = {}
  if (!data.nickname.trim())                    e.nickname = 'Nickname is required.'
  if (data.nickname.trim().length > 100)        e.nickname = 'Max 100 characters.'
  if (!data.email.trim())                       e.email = 'Email address is required.'
  else if (!EMAIL_RE.test(data.email.trim()))   e.email = 'Enter a valid email address.'
  return e
}

export function validateStep2(data: FormState): FormErrors {
  const e: FormErrors = {}
  if (!data.mbti_type) e.mbti_type = 'Please select your MBTI type.'
  return e
}

export function validateStep3(data: FormState): FormErrors {
  const e: FormErrors = {}
  if (!data.hd_type)      e.hd_type      = 'Please select your Human Design type.'
  if (!data.hd_authority) e.hd_authority = 'Please select your Authority.'
  if (!data.hd_profile)   e.hd_profile   = 'Please select your Profile.'
  return e
}

export function validateStep4(data: FormState): FormErrors {
  const e: FormErrors = {}
  const MIN = 20

  if (!data.current_occupation.trim())
    e.current_occupation = 'Please enter your current occupation.'

  if (!data.burnout_triggers.trim())
    e.burnout_triggers = 'Please share what drains or burns you out.'
  else if (data.burnout_triggers.trim().length < MIN)
    e.burnout_triggers = `At least ${MIN} characters helps the AI give better insights.`

  if (!data.success_vision.trim())
    e.success_vision = 'Please share your vision of success.'
  else if (data.success_vision.trim().length < MIN)
    e.success_vision = `At least ${MIN} characters helps the AI give better insights.`

  return e
}

export function validateStep(step: number, data: FormState): FormErrors {
  switch (step) {
    case 1: return validateStep1(data)
    case 2: return validateStep2(data)
    case 3: return validateStep3(data)
    case 4: return validateStep4(data)
    default: return {}
  }
}
