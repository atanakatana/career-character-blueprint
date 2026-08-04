'use client'

import { useState }   from 'react'
import { useRouter }   from 'next/navigation'
import Link            from 'next/link'
import { motion }      from 'framer-motion'
import { PixelPanel }  from '@/components/ui/PixelPanel'
import { PixelButton } from '@/components/ui/PixelButton'

// ── Tier definitions ──────────────────────────────────────────────────────────

const TIERS = [
  {
    id:       'tier1',
    label:    'RE:LUMMA BLUEPRINT',
    subtitle: 'Solo Quest',
    price:    'Rp 149.000',
    color:    'border-pixel-gold',
    badge:    'bg-pixel-gold text-pixel-bg',
    features: [
      '7-section career identity Blueprint',
      'MBTI × Human Design conflict analysis',
      'Profile line deep analysis',
      '3 blind spots (MECHANISM + SCENARIO)',
      '3–5 career arenas + skill map',
      'Personalised decision protocol',
      '3–5 daily quest objectives',
      'Delivered to your email within 24 hours',
    ],
    notIncluded: [
      'Habit tracker access',
      'Account dashboard',
    ],
  },
  {
    id:       'tier2',
    label:    'BLUEPRINT + TRACKER',
    subtitle: 'Full Campaign',
    price:    'Rp 299.000',
    color:    'border-pixel-blue',
    badge:    'bg-pixel-blue text-white',
    features: [
      'Everything in Re:Lumma Blueprint',
      'Habit tracker dashboard',
      'Daily habit completion + streaks',
      'Career goal progress tracking',
      'Account to access your Blueprint anytime',
      'Complete Blueprint + tracker, always available',
    ],
    notIncluded: [],
    recommended: true,
  },
] as const

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const router = useRouter()
  const [selectedTier, setSelectedTier]   = useState<string | null>(null)
  const [email,        setEmail]          = useState('')
  const [error,        setError]          = useState('')

  // Package selection routes to Login next (Choose Package -> Login ->
  // Register if needed -> Dashboard). The actual Mayar.id payment link is
  // created from the Dashboard, once we know who's logged in — the
  // /api/payments/create endpoint itself is unchanged.
  const handleProceed = (tierId: string) => {
    if (!email.trim()) { setError('Please enter your email address.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    const params = new URLSearchParams({ tier: tierId, email: email.trim() })
    router.push(`/login?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-pixel-bg">

      {/* Header */}
      <div className="border-b border-pixel-border bg-pixel-panel/40 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-press text-xs text-pixel-gold hover:text-pixel-gold/80 transition-colors">
            ◀ BACK
          </Link>
          <span className="font-press text-xs text-pixel-muted">◆ THE GREAT ARCHITECT</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Title */}
        <div className="text-center mb-12">
          <p className="font-press text-xs text-pixel-muted mb-3 uppercase tracking-widest">
            Select Your Plan
          </p>
          <h1 className="font-pixel text-4xl sm:text-5xl text-pixel-gold mb-4">
            CHOOSE YOUR QUEST
          </h1>
          <p className="font-body text-base text-pixel-muted max-w-md mx-auto">
            Both plans include the full 7-section Re:Lumma Blueprint. Blueprint + Tracker adds a personalised habit tracker.
          </p>
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`border-2 ${tier.color} bg-pixel-panel relative cursor-pointer transition-all
                ${selectedTier === tier.id ? 'ring-2 ring-pixel-gold ring-offset-2 ring-offset-pixel-bg' : 'hover:brightness-110'}`}
              style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.7)' }}
              onClick={() => setSelectedTier(selectedTier === tier.id ? null : tier.id)}
            >
              {'recommended' in tier && tier.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pixel-blue text-white font-press text-xs px-3 py-1 whitespace-nowrap">
                  ★ RECOMMENDED
                </div>
              )}

              {/* Header */}
              <div className="border-b border-pixel-border bg-pixel-bg px-5 py-4">
                <div className={`inline-block font-press text-xs px-2.5 py-1.5 mb-2 ${tier.badge}`}>
                  {tier.subtitle}
                </div>
                <h2 className="font-press text-sm text-pixel-gold">{tier.label}</h2>
                <p className="font-pixel text-3xl text-pixel-text mt-2">{tier.price}</p>
              </div>

              {/* Features */}
              <div className="px-5 py-5 space-y-2">
                {tier.features.map((f, j) => (
                  <div key={j} className="flex gap-3 items-start">
                    <span className="text-pixel-green text-lg flex-shrink-0 leading-none mt-0.5">✓</span>
                    <span className="font-body text-sm text-pixel-text leading-snug">{f}</span>
                  </div>
                ))}
                {tier.notIncluded.map((f, j) => (
                  <div key={j} className="flex gap-3 items-start opacity-40">
                    <span className="text-pixel-muted text-lg flex-shrink-0 leading-none mt-0.5">✗</span>
                    <span className="font-body text-sm text-pixel-muted leading-snug">{f}</span>
                  </div>
                ))}
              </div>

              {/* Selected indicator */}
              {selectedTier === tier.id && (
                <div className="border-t border-pixel-border bg-pixel-gold/10 px-5 py-3">
                  <p className="font-press text-xs text-pixel-gold text-center">◆ SELECTED</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Email + payment form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: selectedTier ? 1 : 0.4 }}
          className="max-w-md mx-auto"
        >
          <PixelPanel>
            <div className="space-y-5">
              <p className="font-press text-xs text-pixel-gold text-center">
                {selectedTier
                  ? `▶ PROCEED WITH ${TIERS.find(t => t.id === selectedTier)?.label}`
                  : '◀ SELECT A PLAN ABOVE'}
              </p>

              <div>
                <label className="font-press text-xs text-pixel-muted block mb-2">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="your@email.com"
                  disabled={!selectedTier}
                  className="w-full bg-pixel-bg border-2 border-pixel-border text-pixel-text
                             font-body text-sm px-3 py-2.5
                             focus:outline-none focus:border-pixel-gold
                             placeholder:text-pixel-muted/50
                             disabled:opacity-40 disabled:cursor-not-allowed"
                />
                <p className="font-press text-xs text-pixel-muted mt-2 leading-relaxed">
                  Your blueprint will be delivered to this email. Make sure it's correct.
                </p>
              </div>

              {error && (
                <p className="font-press text-xs text-pixel-error">{error}</p>
              )}

              <PixelButton
                variant="primary"
                size="md"
                className="w-full"
                disabled={!selectedTier}
                onClick={() => selectedTier && handleProceed(selectedTier)}
              >
                ▶ UNLOCK YOUR BLUEPRINT
              </PixelButton>

              <p className="font-press text-xs text-pixel-muted text-center leading-relaxed">
                Log in or create your account next · Secure payment via Mayar.id
              </p>
            </div>
          </PixelPanel>
        </motion.div>

        {/* FAQ */}
        <div className="mt-12 max-w-lg mx-auto space-y-4">
          {[
            { q: 'What happens after I unlock?', a: 'You\'ll log in (or create an account) and complete payment, then your Complete Blueprint is prepared and sent to your email — and shown in your Dashboard — usually within 24 hours.' },
            { q: 'Do I need to redo the assessment?', a: 'No. If you already completed the free Trial Reading, your answers carry over automatically once you\'re logged in.' },
            { q: 'What is the Habit Tracker?', a: 'The Blueprint + Tracker package gives you a personal dashboard where your Blueprint\'s recommendations become daily habits — track completions and streaks toward your career goals.' },
          ].map((item, i) => (
            <div key={i} className="border border-pixel-border bg-pixel-panel px-4 py-3">
              <p className="font-press text-xs text-pixel-gold mb-2">{item.q}</p>
              <p className="font-body text-sm text-pixel-muted leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
