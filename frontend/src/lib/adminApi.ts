/**
 * Lightweight authenticated fetch wrapper for the admin API.
 * All functions read the JWT from sessionStorage, so they must
 * only be called from 'use client' components (never SSR).
 */

const BASE = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api`

/** Read JWT from sessionStorage (client-side only). */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem('admin_token')
}

/** Persist JWT to sessionStorage. */
export function saveToken(token: string): void {
  sessionStorage.setItem('admin_token', token)
}

/** Remove JWT and redirect to login. */
export function logout(): void {
  sessionStorage.removeItem('admin_token')
  window.location.href = '/admin/login'
}

interface FetchOptions {
  method?: string
  body?:   unknown
}

/**
 * Authenticated API call.
 * - Injects Bearer token automatically.
 * - On 401: clears token and redirects to /admin/login.
 * - On other errors: throws with the `detail` message from FastAPI.
 */
export async function adminFetch<T>(path: string, token: string, opts: FetchOptions = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method:  opts.method ?? 'GET',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    ...(opts.body ? { body: JSON.stringify(opts.body) } : {}),
  })

  if (res.status === 401) {
    logout()
    throw new Error('Session expired — redirecting to login')
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { detail?: string }
    throw new Error(data.detail ?? `Request failed: ${res.status}`)
  }

  return res.json() as Promise<T>
}

/** Login: returns access_token. */
export async function adminLogin(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE}/admin/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { detail?: string }
    throw new Error(data.detail ?? 'Invalid credentials')
  }
  const data = await res.json() as { access_token: string }
  return data.access_token
}
