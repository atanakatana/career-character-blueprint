'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { PixelInput } from '@/components/ui/PixelInput'
import { PixelButton } from '@/components/ui/PixelButton'
import { registerUser } from '@/lib/api'
import { setToken } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()

  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!nickname.trim()) { setError('Tell us what to call you.'); return }
    if (!email.trim()) { setError('Enter your email.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const auth = await registerUser({ email: email.trim(), password, nickname: nickname.trim() })
      setToken(auth.access_token)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h1 className="font-pixel text-base text-pixel-gold">Create your account</h1>
        <p className="mt-2 font-body text-sm text-pixel-muted">
          Use the same email you paid with to unlock your perks.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PixelInput
          label="Nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="What should we call you?"
          autoComplete="nickname"
        />
        <PixelInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
        />
        <PixelInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
        <PixelInput
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter your password"
          autoComplete="new-password"
        />

        {error && <p role="alert" className="font-press text-[0.38rem] text-pixel-error">{error}</p>}

        <PixelButton type="submit" variant="primary" disabled={loading} className="w-full">
          {loading ? 'Creating account…' : 'Create Account'}
        </PixelButton>
      </form>

      <p className="mt-6 text-center font-body text-sm text-pixel-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-pixel-gold hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}
