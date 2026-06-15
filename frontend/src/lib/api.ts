import { config } from './config'
import type { SubmissionFormData, SubmissionResponse } from './types'

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
