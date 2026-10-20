'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { PixelInput } from '@/components/ui/PixelInput'
import { PixelButton } from '@/components/ui/PixelButton'
import { loginUser } from '@/lib/api'
import { setToken } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }

    setLoading(true)
    try {
      const auth = await loginUser({ email: email.trim(), password })
      setToken(auth.access_token)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h1 className="font-pixel text-base text-pixel-gold">Welcome back</h1>
        <p className="mt-2 font-body text-sm text-pixel-muted">Log in to your Dashboard and Habit Tracker.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="••••••••"
          autoComplete="current-password"
        />

        {error && <p role="alert" className="font-press text-[0.38rem] text-pixel-error">{error}</p>}

        <PixelButton type="submit" variant="primary" disabled={loading} className="w-full">
          {loading ? 'Logging in…' : 'Log In'}
        </PixelButton>
      </form>

      <p className="mt-6 text-center font-body text-sm text-pixel-muted">
        New here?{' '}
        <Link href="/register" className="text-pixel-gold hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
