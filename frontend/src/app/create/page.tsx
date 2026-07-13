'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams }                   from 'next/navigation'
import Link                                  from 'next/link'

import { PixelLayout }          from '@/components/layout/PixelLayout'
import { CharacterCreationForm } from '@/components/form/CharacterCreationForm'
import { PixelPanel }           from '@/components/ui/PixelPanel'
import { PixelButton }          from '@/components/ui/PixelButton'
import { config }               from '@/lib/config'

type GateState = 'checking' | 'email-needed' | 'polling' | 'verified' | 'not-paid'

interface PaymentStatus {
  has_valid_payment: boolean
  tier?: string
  paid_at?: string
}

export default function CreatePage() {
  const params = useSearchParams()

  const [gateState,    setGateState]   = useState<GateState>('checking')
  const [email,        setEmail]       = useState('')
  const [inputEmail,   setInputEmail]  = useState('')
  const [tier,         setTier]        = useState<string | null>(null)
  const [error,        setError]       = useState('')
  const [pollCount,    setPollCount]   = useState(0)

  // Check payment status for a given email
  const checkPayment = useCallback(async (emailToCheck: string): Promise<PaymentStatus> => {
    const res = await fetch(
      `${config.api.baseUrl}/api/payments/status/${encodeURIComponent(emailToCheck.toLowerCase().trim())}`
    )
    if (!res.ok) throw new Error(`Status check failed: ${res.status}`)
    return res.json() as Promise<PaymentStatus>
  }, [])

  // On mount: read email from URL params (set by Mayar redirect) and auto-verify
  useEffect(() => {
    const urlEmail = params.get('email')

    if (urlEmail) {
      setEmail(urlEmail)
      setGateState('polling')

      // Poll with backoff — webhook may not have fired yet when Mayar redirects
      let attempts = 0
      const maxAttempts = 10
      const interval = setInterval(async () => {
        attempts++
        setPollCount(attempts)
        try {
          const status = await checkPayment(urlEmail)
          if (status.has_valid_payment) {
            clearInterval(interval)
            setTier(status.tier ?? null)
            setGateState('verified')
          } else if (attempts >= maxAttempts) {
            clearInterval(interval)
            // Webhook took too long — let user retry manually
            setGateState('not-paid')
          }
        } catch {
          if (attempts >= maxAttempts) {
            clearInterval(interval)
            setGateState('email-needed')
          }
        }
      }, 3000)

      return () => clearInterval(interval)
    } else {
      setGateState('email-needed')
    }
  }, [params, checkPayment])

  const handleVerify = async () => {
    const e = inputEmail.trim()
    if (!e) { setError('Enter your email.'); return }
    setError('')
    try {
      const status = await checkPayment(e)
      if (status.has_valid_payment) {
        setEmail(e)
        setTier(status.tier ?? null)
        setGateState('verified')
      } else {
        setGateState('not-paid')
      }
    } catch {
      setError('Could not check payment status. Please try again.')
    }
  }

  // ── Render states ──────────────────────────────────────────────────────────

  if (gateState === 'checking') {
    return <GateLayout><LoadingGate /></GateLayout>
  }

  if (gateState === 'polling') {
    return <GateLayout><PollingGate count={pollCount} /></GateLayout>
  }

  if (gateState === 'not-paid') {
    return (
      <GateLayout>
        <NotPaidGate onRetry={() => setGateState('email-needed')} />
      </GateLayout>
    )
  }

  if (gateState === 'email-needed') {
    return (
      <GateLayout>
        <EmailGate
          value={inputEmail}
          onChange={v => { setInputEmail(v); setError('') }}
          onVerify={handleVerify}
          error={error}
        />
      </GateLayout>
    )
  }

  // Verified — show the form with the paid tier context
  return (
    <PixelLayout>
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
        {/* Payment verified banner */}
        <div className="mb-6 border border-pixel-green bg-pixel-green/5 px-4 py-3 flex items-center gap-3">
          <span className="text-pixel-green text-xl">✓</span>
          <div>
            <p className="font-press text-xs text-pixel-green">PAYMENT VERIFIED</p>
            <p className="font-body text-sm text-pixel-muted">
              {email}
              {tier === 'tier2' && ' · Blueprint + Habit Tracker'}
            </p>
          </div>
        </div>
        <CharacterCreationForm prefillEmail={email} />
      </div>
    </PixelLayout>
  )
}

// ── Layout wrapper for gate screens ───────────────────────────────────────────

function GateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-pixel-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}

// ── Gate screens ──────────────────────────────────────────────────────────────

function LoadingGate() {
  return (
    <PixelPanel>
      <div className="text-center py-6 space-y-4">
        <div className="font-vt text-5xl text-pixel-gold animate-pixel-float">◆</div>
        <p className="font-press text-xs text-pixel-muted uppercase tracking-widest">
          Checking payment…
        </p>
      </div>
    </PixelPanel>
  )
}

function PollingGate({ count }: { count: number }) {
  return (
    <PixelPanel>
      <div className="text-center py-6 space-y-5">
        <div className="font-vt text-5xl text-pixel-gold animate-pixel-float">◆</div>
        <div>
          <p className="font-press text-xs text-pixel-gold mb-2">VERIFYING PAYMENT</p>
          <p className="font-press text-xs text-pixel-muted">
            Waiting for confirmation from Mayar.id…
          </p>
        </div>
        {/* Animated dots */}
        <div className="h-1.5 bg-pixel-bg border border-pixel-border overflow-hidden">
          <div
            className="h-full bg-pixel-gold"
            style={{
              width: `${Math.min((count / 10) * 100, 95)}%`,
              transition: 'width 0.5s ease',
            }}
          />
        </div>
        <p className="font-press text-xs text-pixel-muted">
          Attempt {count} / 10 · checking every 3 seconds
        </p>
      </div>
    </PixelPanel>
  )
}

function NotPaidGate({ onRetry }: { onRetry: () => void }) {
  return (
    <PixelPanel>
      <div className="text-center space-y-5 py-4">
        <div className="font-vt text-5xl text-pixel-error">!</div>
        <div>
          <p className="font-press text-xs text-pixel-text mb-3">PAYMENT NOT CONFIRMED</p>
          <p className="font-body text-sm text-pixel-muted leading-relaxed">
            We couldn't verify your payment. This can happen if the payment is still processing.
            Wait a moment and try verifying with your email below.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <PixelButton variant="secondary" size="md" onClick={onRetry}>
            ↺ Verify with email
          </PixelButton>
          <Link href="/pricing">
            <PixelButton variant="ghost" size="md" className="w-full">
              ◀ Back to pricing
            </PixelButton>
          </Link>
        </div>
      </div>
    </PixelPanel>
  )
}

function EmailGate({ value, onChange, onVerify, error }: {
  value: string
  onChange: (v: string) => void
  onVerify: () => void
  error: string
}) {
  return (
    <PixelPanel>
      <div className="space-y-5">
        <div className="text-center">
          <div className="font-vt text-5xl text-pixel-gold mb-3">◆</div>
          <p className="font-press text-xs text-pixel-gold mb-2">ACCESS REQUIRED</p>
          <p className="font-body text-sm text-pixel-muted leading-relaxed">
            Enter the email address you used to complete payment. We'll verify your access.
          </p>
        </div>

        <div>
          <label className="font-press text-xs text-pixel-muted block mb-2">PAYMENT EMAIL</label>
          <input
            type="email"
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onVerify()}
            placeholder="your@email.com"
            className="w-full bg-pixel-bg border-2 border-pixel-border text-pixel-text
                       font-body text-sm px-3 py-2.5
                       focus:outline-none focus:border-pixel-gold
                       placeholder:text-pixel-muted/50"
          />
        </div>

        {error && <p className="font-press text-xs text-pixel-error">{error}</p>}

        <PixelButton variant="primary" size="md" className="w-full" onClick={onVerify}>
          ▶ VERIFY ACCESS
        </PixelButton>

        <div className="text-center">
          <Link href="/pricing" className="font-press text-xs text-pixel-muted hover:text-pixel-gold transition-colors">
            Haven't paid yet? → Go to pricing
          </Link>
        </div>
      </div>
    </PixelPanel>
  )
}
