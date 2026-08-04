'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Gem, Shield, Crown, Check, Lock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { TiltCard, MagneticButton } from '@/components/ui/motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { fadeUp, staggerContainer, staggerItem, VIEWPORT, EASE_OUT_EXPO } from '@/lib/motion'

interface Tier {
  id: string | null           // null = not purchasable yet (Legend)
  rarity: string
  className: string
  Icon: LucideIcon
  price: string
  tagline: string
  accent: string              // text colour
  border: string              // border colour class
  gradient: string            // conic border gradient
  glow: string
  features: string[]
  locked?: string[]
  popular?: boolean
  comingSoon?: boolean
}

const TIERS: Tier[] = [
  {
    id: 'tier1', rarity: 'COMMON', className: 'Explorer', Icon: Gem, price: 'Rp 149.000',
    tagline: 'Solo Quest', accent: 'text-pixel-green', border: 'border-pixel-green',
    gradient: 'conic-gradient(from 0deg, transparent 55%, #5CE27A, transparent 85%)',
    glow: 'rgba(92,226,122,0.16)',
    features: [
      '7-section career identity Blueprint',
      'MBTI × Human Design conflict analysis',
      'Profile line deep analysis',
      '3 blind spots (mechanism + scenario)',
      '3–5 career arenas + skill map',
      'Personalised decision protocol',
      'Delivered to your email in 24 hours',
    ],
    locked: ['Habit tracker access', 'Account dashboard'],
  },
  {
    id: 'tier2', rarity: 'RARE', className: 'Adventurer', Icon: Shield, price: 'Rp 299.000',
    tagline: 'Full Campaign', accent: 'text-pixel-blue', border: 'border-pixel-blue',
    gradient: 'conic-gradient(from 0deg, transparent 50%, #4DA6FF, #F5C542, transparent 85%)',
    glow: 'rgba(77,166,255,0.18)', popular: true,
    features: [
      'Everything in Explorer',
      'Habit tracker dashboard',
      'Daily habit completion + streaks',
      'Career goal progress tracking',
      'Account to access your Blueprint anytime',
      'Complete Blueprint + tracker, always available',
    ],
  },
  {
    id: null, rarity: 'LEGENDARY', className: 'Legend', Icon: Crown, price: 'Coming Soon',
    tagline: 'Guild Ascension', accent: 'text-pixel-gold', border: 'border-pixel-gold',
    gradient: 'conic-gradient(from 0deg, transparent 45%, #F5C542, #FFE9A8, #F5C542, transparent 90%)',
    glow: 'rgba(245,197,66,0.2)', comingSoon: true,
    features: [
      'Everything in Adventurer',
      '1:1 career strategist session',
      'Quarterly blueprint recalibration',
      'Private guild community',
      'Priority blueprint delivery',
    ],
  },
]

export function PricingSection() {
  const reduced = usePrefersReducedMotion()
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [email, setEmail]       = useState('')
  const [error, setError]       = useState('')

  const selectedTier = TIERS.find((t) => t.id === selected)

  // Package selection no longer pays immediately — the flow is now
  // Choose Package -> Login -> Register (if needed) -> Dashboard, where
  // the actual Mayar.id checkout is triggered. This keeps the existing
  // /api/payments/create + webhook pipeline completely unchanged; it's
  // just called one step later, from the Dashboard instead of from here.
  const handleProceed = () => {
    if (!selected) return
    if (!email.trim()) { setError('Please enter your email address.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address.'); return }
    setError('')
    const params = new URLSearchParams({ tier: selected, email: email.trim() })
    router.push(`/login?${params.toString()}`)
  }

  return (
    <section id="pricing" className="relative overflow-hidden px-4 py-28 sm:px-6" aria-label="Pricing">
      {/* aurora backdrop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden
           style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(245,197,66,0.06), transparent 70%)' }} />

      <div className="relative mx-auto max-w-6xl">
        <motion.div className="mb-14 text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}>
          <p className="mb-3 font-press text-[0.42rem] uppercase tracking-widest text-pixel-muted">Choose your path</p>
          <h2 className="font-pixel text-3xl text-pixel-text sm:text-4xl">
            Claim your <span className="fx-gradient-text">character card</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg font-body text-sm text-pixel-muted">
            Every tier includes the full Re:Lumma Blueprint. Level up for the habit tracker and beyond.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3"
          variants={staggerContainer} custom={0.12}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-8%' }}
        >
          {TIERS.map((t) => (
            <motion.div key={t.className} variants={staggerItem} className={t.popular && !reduced ? 'md:-mt-4 md:mb-4' : ''}>
              <TiltCard max={t.popular ? 12 : 9} spotlightColor={t.glow} className="h-full">
                <PricingCard
                  tier={t}
                  reduced={reduced}
                  active={selected === t.id}
                  onSelect={() => {
                    if (t.comingSoon || !t.id) return
                    setSelected(selected === t.id ? null : t.id)
                    setError('')
                  }}
                />
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Inline checkout */}
        <AnimatePresence>
          {selectedTier && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 10 }}
              transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
              className="mx-auto mt-10 max-w-md overflow-hidden"
            >
              <div className="pixel-panel p-5">
                <p className="mb-4 text-center font-press text-[0.42rem] text-pixel-gold">
                  ▶ CHECKOUT · {selectedTier.className.toUpperCase()} — {selectedTier.price}
                </p>
                <label htmlFor="pricing-email" className="mb-2 block font-press text-[0.4rem] text-pixel-muted">EMAIL ADDRESS</label>
                <input
                  id="pricing-email" type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder="your@email.com"
                  className="pixel-input"
                />
                <p className="mt-2 font-press text-[0.34rem] leading-relaxed text-pixel-muted">
                  Your blueprint is delivered to this email — make sure it&apos;s correct.
                </p>
                {error && <p className="mt-3 font-press text-[0.4rem] text-pixel-error">{error}</p>}
                <MagneticButton
                  onClick={handleProceed}
                  aria-label="Unlock your Blueprint"
                  className="pixel-btn-primary mt-4 w-full px-5 py-3 text-press-xs disabled:opacity-45"
                >
                  <span className="inline-flex items-center gap-2">▶ UNLOCK YOUR BLUEPRINT</span>
                </MagneticButton>
                <p className="mt-3 text-center font-press text-[0.34rem] leading-relaxed text-pixel-muted">
                  Log in or create your account next · Secure payment via Mayar.id
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

function PricingCard({ tier, active, onSelect, reduced }: {
  tier: Tier; active: boolean; onSelect: () => void; reduced: boolean
}) {
  return (
    <div className="group relative h-full">
      {/* rotating gradient border for the popular / legendary cards */}
      {!reduced && (
        <div className="pointer-events-none absolute -inset-[2px] overflow-hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100"
             style={{ opacity: active ? 1 : undefined }} aria-hidden>
          <div className="fx-spin-slow absolute left-1/2 top-1/2 h-[200%] w-[200%] -translate-x-1/2 -translate-y-1/2"
               style={{ background: tier.gradient }} />
        </div>
      )}

      <div
        onClick={onSelect}
        role={tier.comingSoon ? undefined : 'button'}
        tabIndex={tier.comingSoon ? -1 : 0}
        onKeyDown={(e) => { if (!tier.comingSoon && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect() } }}
        aria-pressed={tier.comingSoon ? undefined : active}
        className={`relative flex h-full cursor-pointer flex-col border-2 bg-pixel-panel p-6 transition-all duration-300
          ${active ? tier.border : 'border-pixel-border'} ${tier.comingSoon ? 'cursor-default' : ''}`}
        style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.7)' }}
      >
        {/* shimmer */}
        {!reduced && <span className="fx-shimmer" aria-hidden />}

        {/* popular / rarity ribbon */}
        {tier.popular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-pixel-blue px-3 py-1 font-press text-[0.4rem] text-white"
               style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.6)' }}>
            ★ MOST POPULAR
          </div>
        )}

        {/* header */}
        <div className="flex items-center justify-between">
          <span className={`font-press text-[0.36rem] tracking-widest ${tier.accent}`}>{tier.rarity}</span>
          <div className={`flex h-10 w-10 items-center justify-center border-2 border-pixel-border bg-pixel-bg ${reduced ? '' : 'fx-drift'}`}>
            <tier.Icon className={`h-5 w-5 ${tier.accent}`} />
          </div>
        </div>

        <h3 className={`mt-3 font-pixel text-2xl ${tier.accent}`}>{tier.className}</h3>
        <p className="font-press text-[0.4rem] text-pixel-muted">{tier.tagline}</p>

        <p className="mt-4 font-pixel text-3xl text-pixel-text">{tier.price}</p>
        <div className="my-4 h-px w-full bg-pixel-border" />

        {/* features */}
        <ul className="flex-1 space-y-2">
          {tier.features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 ${tier.accent}`} />
              <span className="font-body text-xs leading-snug text-pixel-text">{f}</span>
            </li>
          ))}
          {tier.locked?.map((f) => (
            <li key={f} className="flex items-start gap-2 opacity-40">
              <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-pixel-muted" />
              <span className="font-body text-xs leading-snug text-pixel-muted line-through">{f}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="mt-5">
          {tier.comingSoon ? (
            <div className="flex items-center justify-center gap-2 border-2 border-dashed border-pixel-border py-3 font-press text-[0.4rem] text-pixel-muted">
              <Lock className="h-3 w-3" /> COMING SOON
            </div>
          ) : (
            <div className={`flex items-center justify-center border-2 py-3 font-press text-[0.42rem] transition-colors
              ${active ? `${tier.border} ${tier.accent} bg-pixel-bg` : 'border-pixel-border text-pixel-muted group-hover:border-pixel-gold group-hover:text-pixel-gold'}`}>
              {active ? '◆ SELECTED' : '▶ SELECT'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
