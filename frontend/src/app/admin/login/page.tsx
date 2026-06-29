'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PixelPanel }  from '@/components/ui/PixelPanel'
import { PixelButton } from '@/components/ui/PixelButton'
import { adminLogin, saveToken } from '@/lib/adminApi'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async () => {
    if (!email || !password) { setError('Email and password are required'); return }
    setLoading(true)
    setError('')
    try {
      const token = await adminLogin(email, password)
      saveToken(token)
      router.push('/admin/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleLogin() }

  return (
    <div className="min-h-screen bg-pixel-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-pixel-gold flex items-center justify-center mx-auto mb-4"
               style={{ boxShadow: '3px 3px 0px #C4A033' }}>
            <span className="font-press text-sm text-pixel-bg">CC</span>
          </div>
          <p className="font-press text-sm text-pixel-gold">CCB ADMIN</p>
          <p className="font-press text-xs text-pixel-muted mt-1">CHARACTER CAREER BLUEPRINT</p>
        </div>

        <PixelPanel>
          <div className="space-y-5">
            <p className="font-press text-xs text-pixel-gold text-center">◆ ACCESS RESTRICTED ◆</p>

            {/* Email */}
            <div>
              <label className="font-press text-xs text-pixel-muted block mb-2">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={onKey}
                placeholder="admin@ccblueprint.local"
                className="w-full bg-pixel-bg border-2 border-pixel-border text-pixel-text
                           font-body text-sm px-3 py-2.5
                           focus:outline-none focus:border-pixel-gold placeholder:text-pixel-muted/50"
              />
            </div>

            {/* Password */}
            <div>
              <label className="font-press text-xs text-pixel-muted block mb-2">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={onKey}
                placeholder="••••••••"
                className="w-full bg-pixel-bg border-2 border-pixel-border text-pixel-text
                           font-body text-sm px-3 py-2.5
                           focus:outline-none focus:border-pixel-gold placeholder:text-pixel-muted/50"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="font-press text-xs text-pixel-error text-center">{error}</p>
            )}

            <PixelButton
              variant="primary"
              size="md"
              className="w-full"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? '...' : '▶ LOGIN'}
            </PixelButton>
          </div>
        </PixelPanel>

      </div>
    </div>
  )
}
