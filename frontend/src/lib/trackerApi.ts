import { config } from './config'
import { authedFetch } from './auth'
import type { TrackerState, CompleteQuestResponse } from './types'

const BASE = `${config.api.baseUrl}/api/tracker`

/** Thrown when the tracker API responds 403 (account isn't tier2). */
export class UpgradeRequiredError extends Error {
  constructor() {
    super('upgrade_required')
  }
}

async function _handle<T>(res: Response): Promise<T> {
  if (res.status === 403) throw new UpgradeRequiredError()
  if (!res.ok) {
    let detail = `Request failed: ${res.status}`
    try {
      const data = await res.json()
      if (typeof data.detail === 'string') detail = data.detail
    } catch {/* ignore parse errors */}
    throw new Error(detail)
  }
  return res.json()
}

export async function getTracker(): Promise<TrackerState> {
  const res = await authedFetch(BASE)
  return _handle<TrackerState>(res)
}

export async function setGoal(targetJob: string): Promise<TrackerState> {
  const res = await authedFetch(`${BASE}/goal`, {
    method: 'POST',
    body:   JSON.stringify({ target_job: targetJob }),
  })
  return _handle<TrackerState>(res)
}

export async function generateQuests(reading: string, goal: string): Promise<TrackerState> {
  const res = await authedFetch(`${BASE}/quests/generate`, {
    method: 'POST',
    body:   JSON.stringify({ reading, goal }),
  })
  return _handle<TrackerState>(res)
}

export async function completeQuest(questId: string): Promise<CompleteQuestResponse> {
  const res = await authedFetch(`${BASE}/quests/${questId}/complete`, { method: 'POST' })
  return _handle<CompleteQuestResponse>(res)
}
