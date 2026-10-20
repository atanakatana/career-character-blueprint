import { config } from './config'
import { authedFetch } from './auth'
import type { SubmissionFormData, SubmissionResponse, RegisterPayload, LoginPayload, AuthResponse, UserProfile } from './types'

// ─── Submissions ─────────────────────────────────────────────────────────────

export async function createSubmission(
  data: SubmissionFormData,
): Promise<SubmissionResponse> {
  const res = await fetch(`${config.api.baseUrl}/api/submissions`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  })

  if (!res.ok) {
    let detail = 'Submission failed. Please try again.'
    try {
      const body = await res.json()
      if (typeof body.detail === 'string') detail = body.detail
      // Pydantic validation errors return detail as an array
      if (Array.isArray(body.detail)) {
        detail = body.detail.map((e: { msg: string }) => e.msg).join(', ')
      }
    } catch {/* ignore parse errors */}
    throw new Error(detail)
  }

  return res.json()
}

// ─── Auth ────────────────────────────────────────────────────────────────────

async function _authRequest(path: string, body: unknown): Promise<AuthResponse> {
  const res = await fetch(`${config.api.baseUrl}/api${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })

  if (!res.ok) {
    let detail = 'Request failed. Please try again.'
    try {
      const data = await res.json()
      if (typeof data.detail === 'string') detail = data.detail
    } catch {/* ignore parse errors */}
    throw new Error(detail)
  }

  return res.json()
}

export function registerUser(data: RegisterPayload): Promise<AuthResponse> {
  return _authRequest('/auth/register', data)
}

export function loginUser(data: LoginPayload): Promise<AuthResponse> {
  return _authRequest('/auth/login', data)
}

export async function getMe(): Promise<UserProfile> {
  const res = await authedFetch(`${config.api.baseUrl}/api/auth/me`)
  if (!res.ok) throw new Error('Could not load profile')
  return res.json()
}
