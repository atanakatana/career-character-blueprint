'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { loginUser } from '@/lib/api'
import { setToken } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()

  const tier          = params.get('tier')
  const prefillEmail  = params.get('email') ?? ''

  const [email,    setEmail]    = useState(prefillEmail)
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const registerHref = `/register${buildQuery({ tier, email })}`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) { setError('Enter your email and password.'); return }

    setLoading(true)
    try {
      const auth = await loginUser({ email: email.trim(), password })
      setToken(auth.access_token)
      router.push(`/dashboard${buildQuery({ tier })}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-pixel-text">Welcome back</h1>
        <p className="mt-2 text-sm text-pixel-muted">
          {tier ? 'Log in to continue unlocking your Blueprint.' : 'Log in to your Re:Lumma dashboard.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-pixel-muted mb-1.5">Email</label>
          <input
            id="email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="glass-input"
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-medium text-pixel-muted mb-1.5">Password</label>
          <input
            id="password" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="glass-input"
            autoComplete="current-password"
          />
        </div>

        {error && <p className="text-xs text-pixel-error">{error}</p>}

        <button type="submit" disabled={loading} className="glass-btn-primary w-full py-3 mt-2">
          {loading ? 'Logging in…' : 'Log In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-pixel-muted">
        New to Re:Lumma?{' '}
        <Link href={registerHref} className="text-pixel-gold hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}

function buildQuery(params: Record<string, string | null | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => !!v) as [string, string][]
  if (entries.length === 0) return ''
  return `?${new URLSearchParams(entries).toString()}`
}
