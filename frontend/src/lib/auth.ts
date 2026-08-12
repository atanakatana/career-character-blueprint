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

/**
 * Fetch wrapper that attaches the Bearer token and throws with the API's
 * error detail on failure.
 *
 * On a 401 (expired or invalid token — this app has no refresh flow, so
 * that's the only way forward), clears the stale token and hard-redirects
 * to /login before the caller ever sees a rejected promise. Mirrors the
 * pattern already used by the admin panel's `adminFetch` (lib/adminApi.ts).
 * Individual pages may still want their own try/catch for non-401 failures
 * (network errors, 500s) where redirecting to login isn't the right call —
 * see dashboard/page.tsx for an example that treats secondary-data failures
 * differently from an auth failure.
 */
export async function authedFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken()
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(url, { ...init, headers })

  if (res.status === 401) {
    clearToken()
    if (typeof window !== 'undefined') window.location.href = '/login'
    throw new Error('Session expired — redirecting to login')
  }

  return res
}
