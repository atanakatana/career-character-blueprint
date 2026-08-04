'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { registerUser } from '@/lib/api'
import { setToken } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const params = useSearchParams()

  const tier         = params.get('tier')
  const prefillEmail = params.get('email') ?? ''

  const [nickname, setNickname] = useState('')
  const [email,    setEmail]    = useState(prefillEmail)
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const loginHref = `/login${buildQuery({ tier, email })}`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!nickname.trim())        { setError('Tell us what to call you.'); return }
    if (!email.trim())           { setError('Enter your email.'); return }
    if (password.length < 8)     { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm)    { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const auth = await registerUser({ email: email.trim(), password, nickname: nickname.trim() })
      setToken(auth.access_token)
      router.push(`/dashboard${buildQuery({ tier })}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-pixel-text">Create your account</h1>
        <p className="mt-2 text-sm text-pixel-muted">
          {tier ? 'One quick step before your Blueprint unlocks.' : 'Access your Dashboard and Habit Tracker anytime.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nickname" className="block text-xs font-medium text-pixel-muted mb-1.5">Nickname</label>
          <input
            id="nickname" type="text" value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="What should we call you?"
            className="glass-input"
            autoComplete="nickname"
          />
        </div>

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
            placeholder="At least 8 characters"
            className="glass-input"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-xs font-medium text-pixel-muted mb-1.5">Confirm password</label>
          <input
            id="confirm" type="password" value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter your password"
            className="glass-input"
            autoComplete="new-password"
          />
        </div>

        {error && <p className="text-xs text-pixel-error">{error}</p>}

        <button type="submit" disabled={loading} className="glass-btn-primary w-full py-3 mt-2">
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-pixel-muted">
        Already have an account?{' '}
        <Link href={loginHref} className="text-pixel-gold hover:underline">
          Log in
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
