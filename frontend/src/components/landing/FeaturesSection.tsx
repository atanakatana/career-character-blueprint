'use client'

import { motion } from 'framer-motion'
import {
  BrainCircuit, Shield, Swords, ShieldAlert, GraduationCap,
  Compass, Building2, HeartHandshake, TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { TiltCard } from '@/components/ui/motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { staggerContainer, staggerItem, fadeUp, VIEWPORT } from '@/lib/motion'

interface Feature { Icon: LucideIcon; title: string; desc: string; color: string; glow: string }

const FEATURES: Feature[] = [
  { Icon: BrainCircuit,   title: 'AI Analysis',        desc: 'A synthesis engine reads the intersection of your two frameworks — not a lookup table.', color: 'text-pixel-gold',  glow: 'rgba(245,197,66,0.14)' },
  { Icon: Shield,         title: 'Career Archetypes',  desc: 'Your unique "character class" — the role you were built to play across any industry.',    color: 'text-pixel-blue',  glow: 'rgba(77,166,255,0.14)' },
  { Icon: Swords,         title: 'Strength Analysis',  desc: 'The capacities that come effortlessly to you, mapped to where they create real value.',   color: 'text-pixel-green', glow: 'rgba(92,226,122,0.14)' },
  { Icon: ShieldAlert,    title: 'Weakness Analysis',  desc: 'Blind spots with mechanism + scenario, so you can see them coming before they cost you.',  color: 'text-pixel-gold',  glow: 'rgba(245,197,66,0.14)' },
  { Icon: GraduationCap,  title: 'Learning Style',     desc: 'How you actually absorb and master new skills — and the paths that fight your wiring.',    color: 'text-pixel-blue',  glow: 'rgba(77,166,255,0.14)' },
  { Icon: Compass,        title: 'Ideal Career',       desc: '3–5 concrete arenas ranked by fit, each with a first action and realistic income range.', color: 'text-pixel-green', glow: 'rgba(92,226,122,0.14)' },
  { Icon: Building2,      title: 'Work Environment',   desc: 'The conditions where you thrive vs. quietly burn out — team, autonomy, pace, structure.',  color: 'text-pixel-gold',  glow: 'rgba(245,197,66,0.14)' },
  { Icon: HeartHandshake, title: 'Relationship Style', desc: 'How you collaborate, lead, and are best led — the interpersonal side of your career.',      color: 'text-pixel-blue',  glow: 'rgba(77,166,255,0.14)' },
  { Icon: TrendingUp,     title: 'Growth Path',        desc: 'A long-range vision plus a skill roadmap that compounds toward who you are becoming.',      color: 'text-pixel-green', glow: 'rgba(92,226,122,0.14)' },
]

export function FeaturesSection() {
  const reduced = usePrefersReducedMotion()

  return (
    <section
      id="features"
      className="relative px-4 py-28 sm:px-6"
      aria-label="What's inside your blueprint"
      style={{ background: 'linear-gradient(180deg, #10141F 0%, rgba(28,36,52,0.35) 50%, #10141F 100%)' }}
    >
      {/* faint aurora accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="fx-aurora absolute left-1/2 top-0 h-[30vw] w-[30vw] -translate-x-1/2 rounded-full opacity-30"
             style={{ background: 'radial-gradient(circle, rgba(77,166,255,0.2), transparent 60%)' }} />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <motion.div className="mb-14 text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}>
          <p className="mb-3 font-press text-[0.42rem] uppercase tracking-widest text-pixel-muted">Inside the codex</p>
          <h2 className="font-pixel text-3xl text-pixel-text sm:text-4xl">
            Nine lenses on <span className="fx-gradient-text">who you are</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg font-body text-sm text-pixel-muted">
            Every blueprint decodes your identity from nine angles — each one actionable, not just descriptive.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer} custom={0.07}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-8%' }}
        >
          {FEATURES.map((f) => (
            <motion.div key={f.title} variants={staggerItem}>
              <TiltCard max={8} spotlightColor={f.glow} className="h-full">
                <div className="group relative h-full overflow-hidden pixel-panel-subtle p-6 transition-colors duration-300 hover:border-pixel-gold">
                  {!reduced && <span className="fx-shimmer" aria-hidden />}
                  <div className={`mb-4 inline-flex ${reduced ? '' : 'fx-drift'}`}>
                    <div className="flex h-12 w-12 items-center justify-center border-2 border-pixel-border bg-pixel-bg">
                      <f.Icon className={`h-6 w-6 ${f.color}`} />
                    </div>
                  </div>
                  <h3 className="font-press text-press-xs leading-relaxed text-pixel-text">{f.title}</h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-pixel-muted">{f.desc}</p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
