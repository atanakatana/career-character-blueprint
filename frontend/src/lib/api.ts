import { config } from './config'
import { authedFetch } from './auth'
import type {
  SubmissionFormData, SubmissionResponse,
  TrialReadingResponse, AuthResponse, UserProfile, MyBlueprintResponse,
  HabitListResponse,
} from './types'

async function readErrorDetail(res: Response, fallback: string): Promise<string> {
  let detail = fallback
  try {
    const body = await res.json()
    if (typeof body.detail === 'string') detail = body.detail
    // Pydantic validation errors return detail as an array
    if (Array.isArray(body.detail)) {
      detail = body.detail.map((e: { msg: string }) => e.msg).join(', ')
    }
  } catch {/* ignore parse errors */}
  return detail
}

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
    throw new Error(await readErrorDetail(res, 'Submission failed. Please try again.'))
  }

  return res.json()
}

// ─── Trial Reading ───────────────────────────────────────────────────────────

export async function getTrialReading(data: {
  mbti_type: string; hd_type: string; hd_authority: string; hd_profile: string
}): Promise<TrialReadingResponse> {
  const res = await fetch(`${config.api.baseUrl}/api/trial/reading`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  })
  if (!res.ok) {
    throw new Error(await readErrorDetail(res, 'Could not build your Trial Reading. Please try again.'))
  }
  return res.json()
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function registerUser(data: {
  email: string; password: string; nickname: string
}): Promise<AuthResponse> {
  const res = await fetch(`${config.api.baseUrl}/api/auth/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  })
  if (!res.ok) {
    throw new Error(await readErrorDetail(res, 'Could not create your account.'))
  }
  return res.json()
}

export async function loginUser(data: {
  email: string; password: string
}): Promise<AuthResponse> {
  const res = await fetch(`${config.api.baseUrl}/api/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  })
  if (!res.ok) {
    throw new Error(await readErrorDetail(res, 'Invalid email or password.'))
  }
  return res.json()
}

export async function getMe(): Promise<UserProfile> {
  const res = await authedFetch(`${config.api.baseUrl}/api/auth/me`)
  if (!res.ok) throw new Error(await readErrorDetail(res, 'Could not load your profile.'))
  return res.json()
}

// ─── Dashboard / Blueprint ───────────────────────────────────────────────────

export async function getMyBlueprint(): Promise<MyBlueprintResponse> {
  const res = await authedFetch(`${config.api.baseUrl}/api/users/me/blueprint`)
  if (!res.ok) throw new Error(await readErrorDetail(res, 'Could not load your Blueprint.'))
  return res.json()
}

// ─── Payments (existing endpoint, called post-login now) ────────────────────

export async function createPayment(data: {
  email: string; tier: string
}): Promise<{ payment_url: string }> {
  const res = await fetch(`${config.api.baseUrl}/api/payments/create`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await readErrorDetail(res, 'Could not start checkout. Please try again.'))
  return res.json()
}

// ─── Habits ──────────────────────────────────────────────────────────────────

export async function getHabits(seedArchetype?: string): Promise<HabitListResponse> {
  const qs  = seedArchetype ? `?seed_archetype=${encodeURIComponent(seedArchetype)}` : ''
  const res = await authedFetch(`${config.api.baseUrl}/api/habits${qs}`)
  if (!res.ok) throw new Error(await readErrorDetail(res, 'Could not load your habits.'))
  return res.json()
}

export async function toggleHabit(habitId: string): Promise<HabitListResponse> {
  const res = await authedFetch(`${config.api.baseUrl}/api/habits/${habitId}/toggle`, { method: 'POST' })
  if (!res.ok) throw new Error(await readErrorDetail(res, 'Could not update that habit.'))
  return res.json()
}
