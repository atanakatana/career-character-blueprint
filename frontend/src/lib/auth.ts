/**
 * Minimal client-side auth helpers for Re:Lumma end-user accounts.
 *
 * v1 is intentionally simple: a single JWT in localStorage, no refresh
 * tokens, no silent renewal. Matches the backend's single-long-lived-JWT
 * design (see backend/app/core/security.py).
 */

const TOKEN_KEY = 'relumma_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TOKEN_KEY)
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

export function logout(): void {
  clearToken()
  if (typeof window !== 'undefined') window.location.href = '/'
}

/** Fetch wrapper that attaches the Bearer token and throws with the API's error detail on failure. */
export async function authedFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken()
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  return fetch(url, { ...init, headers })
}
