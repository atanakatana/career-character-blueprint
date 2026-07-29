'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { AnimatedCounter, MagneticButton } from '@/components/ui/motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { fadeUp, wipeUp, VIEWPORT, EASE_OUT_EXPO } from '@/lib/motion'

// ── Mock report data ──────────────────────────────────────────────────────────
const STRENGTHS = [
  { label: 'Strategy',      v: 92 },
  { label: 'Empathy',       v: 88 },
  { label: 'Execution',     v: 74 },
  { label: 'Vision',        v: 95 },
  { label: 'Communication', v: 81 },
  { label: 'Resilience',    v: 79 },
]

const CAREERS = [
  { name: 'UX Research Lead',                  fit: 96, color: 'bg-pixel-green', income: 'Rp 18M – 40M / mo' },
  { name: 'Org Development Consultant',        fit: 91, color: 'bg-pixel-blue',  income: 'Rp 20M – 45M / mo' },
  { name: 'Product Strategy Manager',          fit: 88, color: 'bg-pixel-gold',  income: 'Rp 22M – 50M / mo' },
]

const GROWTH = [
  { when: 'Now',      title: 'Anchor your niche',   note: 'Lead with pattern-recognition + empathy in research.' },
  { when: '1–2 yrs',  title: 'Own the craft',       note: 'Ship a portfolio of insight work; build authority.' },
  { when: '3–5 yrs',  title: 'Shape the system',    note: 'Move from practitioner to strategist / team builder.' },
]

const TABS = ['Profile', 'Career Paths', 'Future Growth'] as const
type Tab = typeof TABS[number]

export function BlueprintPreviewSection() {
  const reduced = usePrefersReducedMotion()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('Profile')

  return (
    <section id="example-blueprint" className="relative px-4 py-28 sm:px-6" aria-label="Example blueprint">
      <div className="mx-auto max-w-6xl">
        <motion.div className="mb-12 text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}>
          <div className="mb-4 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-pixel-border" />
            <span className="font-press text-press-xs text-pixel-gold">EXAMPLE BLUEPRINT</span>
            <span className="h-px w-12 bg-pixel-border" />
          </div>
          <h2 className="font-pixel text-3xl text-pixel-text sm:text-4xl">
            This is what you&apos;ll <span className="fx-gradient-text">receive</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg font-body text-sm text-pixel-muted">
            A living codex built from your real inputs. Explore the sample below — click through the tabs.
          </p>
        </motion.div>

        <motion.div variants={wipeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-8%' }}>
          <div className="fx-conic-border">
            <div className="pixel-panel overflow-hidden">

              {/* Header bar */}
              <div className="flex items-center justify-between gap-4 border-b-2 border-pixel-gold bg-pixel-bg px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="font-press text-[0.4rem] text-pixel-gold">◆ CAREER CODEX</span>
                  <span className="hidden font-press text-[0.36rem] text-pixel-muted sm:inline">PERSONAL BLUEPRINT</span>
                </div>
                <span className="pixel-tag">SAMPLE</span>
              </div>

              {/* Character title + score */}
              <div className="grid grid-cols-1 gap-4 border-b border-pixel-border bg-pixel-panel/50 px-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:px-6">
                <div>
                  <p className="font-press text-[0.36rem] uppercase tracking-widest text-pixel-muted">Character Class</p>
                  <h3 className="mt-1 font-pixel text-2xl text-pixel-gold sm:text-3xl">The Empathic Architect</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="pixel-tag">INFJ</span>
                    <span className="pixel-tag-blue">Generator</span>
                    <span className="pixel-tag-muted">3/5 · Sacral</span>
                  </div>
                </div>
                {/* Career score dial */}
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <div className="text-right">
                    <p className="font-press text-[0.34rem] uppercase tracking-widest text-pixel-muted">Career Score</p>
                    <p className="font-pixel text-4xl text-pixel-green leading-none">
                      <AnimatedCounter to={94} />
                    </p>
                  </div>
                </div>
              </div>

              {/* Body: radar + tabbed content */}
              <div className="grid grid-cols-1 gap-0 lg:grid-cols-[300px_1fr]">

                {/* Radar panel */}
                <div className="border-b border-pixel-border p-5 lg:border-b-0 lg:border-r">
                  <p className="mb-3 font-press text-[0.38rem] uppercase tracking-widest text-pixel-muted">Strength Radar</p>
                  <StrengthRadar reduced={reduced} />
                  <div className="mt-4 grid grid-cols-2 gap-1.5">
                    {STRENGTHS.map((s) => (
                      <div key={s.label} className="flex items-center justify-between border border-pixel-border px-2 py-1">
                        <span className="font-press text-[0.32rem] text-pixel-muted">{s.label}</span>
                        <span className="font-press text-[0.32rem] text-pixel-gold">{s.v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabbed content */}
                <div className="p-5 sm:p-6">
                  {/* Tabs */}
                  <div className="mb-5 flex gap-1 border-b border-pixel-border" role="tablist" aria-label="Blueprint sections">
                    {TABS.map((t) => (
                      <button
                        key={t}
                        role="tab"
                        aria-selected={tab === t}
                        onClick={() => setTab(t)}
                        className={`relative px-3 py-2 font-press text-[0.4rem] transition-colors ${tab === t ? 'text-pixel-gold' : 'text-pixel-muted hover:text-pixel-text'}`}
                      >
                        {t}
                        {tab === t && (
                          <motion.span layoutId="tab-underline" className="absolute inset-x-0 -bottom-px h-0.5 bg-pixel-gold" />
                        )}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tab}
                      initial={{ opacity: 0, y: reduced ? 0 : 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: reduced ? 0 : -10 }}
                      transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                    >
                      {tab === 'Profile' && (
                        <div>
                          <SectionLabel n="01" title="Profile Summary" />
                          <p className="font-body text-sm leading-relaxed text-pixel-muted">
                            You hold a rare pairing of deep strategic insight and genuine empathy — the kind
                            that builds systems that actually serve people. Your Generator energy comes alive
                            responding to work that resonates, not initiating blindly. The 3/5 profile means
                            your wisdom is earned through lived experience: a Martyr&apos;s resilience with a
                            Heretic&apos;s magnetism. Work must feel meaningful, or it drains rather than grows you.
                          </p>
                        </div>
                      )}

                      {tab === 'Career Paths' && (
                        <div>
                          <SectionLabel n="05" title="Career Recommendations" />
                          <div className="space-y-3">
                            {CAREERS.map((c, i) => (
                              <div key={c.name} className="pixel-panel-subtle p-3">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="font-press text-[0.4rem] text-pixel-gold">#{i + 1} {c.name}</span>
                                  <span className="font-press text-[0.36rem] text-pixel-green">{c.fit}% FIT</span>
                                </div>
                                <div className="mt-2 h-1.5 overflow-hidden border border-pixel-border bg-pixel-bg">
                                  <motion.div className={`h-full ${c.color}`}
                                    initial={{ width: 0 }} animate={{ width: `${c.fit}%` }}
                                    transition={{ duration: 0.9, delay: i * 0.1, ease: EASE_OUT_EXPO }} />
                                </div>
                                <p className="mt-2 font-press text-[0.34rem] text-pixel-muted">{c.income}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {tab === 'Future Growth' && (
                        <div>
                          <SectionLabel n="06" title="Long-Term Vision" />
                          <div className="space-y-3">
                            {GROWTH.map((g, i) => (
                              <div key={g.when} className="flex gap-3">
                                <div className="flex flex-col items-center">
                                  <span className="flex h-6 w-6 items-center justify-center border border-pixel-gold font-press text-[0.32rem] text-pixel-gold">{i + 1}</span>
                                  {i < GROWTH.length - 1 && <span className="mt-1 w-px flex-1 bg-pixel-border" />}
                                </div>
                                <div className="pb-1">
                                  <span className="font-press text-[0.34rem] text-pixel-blue">{g.when}</span>
                                  <p className="font-press text-[0.4rem] text-pixel-text">{g.title}</p>
                                  <p className="mt-1 font-body text-xs text-pixel-muted">{g.note}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* locked teaser */}
                  <div className="mt-6 flex items-center justify-between border border-pixel-border bg-pixel-bg/40 p-3">
                    <p className="font-press text-[0.38rem] text-pixel-muted">+ 7 more sections in your full blueprint</p>
                    <span className="font-vt text-vt-lg opacity-30">🔒</span>
                  </div>
                </div>
              </div>

              {/* CTA footer */}
              <div className="border-t border-pixel-border bg-pixel-bg/40 px-4 py-6 text-center sm:px-6">
                <MagneticButton
                  onClick={() => router.push('/create')}
                  aria-label="Generate my blueprint"
                  className="pixel-btn-primary px-7 py-3.5 text-press-sm"
                >
                  <span className="inline-flex items-center gap-2">▶ Generate My Blueprint</span>
                </MagneticButton>
                <p className="mt-3 font-press text-[0.38rem] text-pixel-muted">9 questions · Delivered to your email</p>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function SectionLabel({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="border border-pixel-gold/30 bg-pixel-gold/10 px-2 py-1 font-press text-[0.36rem] text-pixel-gold">{n}</span>
      <span className="font-press text-press-xs text-pixel-text">{title}</span>
      <span className="h-px flex-1 bg-pixel-border" />
    </div>
  )
}

// ── Animated hexagonal strength radar (pure SVG) ──────────────────────────────
function StrengthRadar({ reduced }: { reduced: boolean }) {
  const cx = 100, cy = 100, R = 78
  const n = STRENGTHS.length
  const angle = (i: number) => (-90 + (360 / n) * i) * (Math.PI / 180)
  const pt = (i: number, r: number) => [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))]

  const rings = [0.25, 0.5, 0.75, 1]
  const ringPoints = (f: number) => STRENGTHS.map((_, i) => pt(i, R * f).map((v) => v.toFixed(1)).join(',')).join(' ')
  const dataPoints = STRENGTHS.map((s, i) => pt(i, R * (s.v / 100)).map((v) => v.toFixed(1)).join(',')).join(' ')

  return (
    <svg viewBox="0 0 200 200" className="mx-auto w-full max-w-[240px]" role="img" aria-label="Strength radar chart">
      {/* rings */}
      {rings.map((f, i) => (
        <polygon key={i} points={ringPoints(f)} fill="none" stroke="#2E3B52" strokeWidth="1" />
      ))}
      {/* spokes */}
      {STRENGTHS.map((_, i) => {
        const [x, y] = pt(i, R)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#2E3B52" strokeWidth="1" />
      })}
      {/* data polygon */}
      <motion.polygon
        points={dataPoints}
        fill="rgba(245,197,66,0.18)"
        stroke="#F5C542"
        strokeWidth="2"
        initial={reduced ? false : { scale: 0, opacity: 0 }}
        whileInView={reduced ? undefined : { scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
        style={{ transformOrigin: '100px 100px' }}
      />
      {/* vertices */}
      {STRENGTHS.map((s, i) => {
        const [x, y] = pt(i, R * (s.v / 100))
        return (
          <motion.rect key={i} x={Number(x) - 2.5} y={Number(y) - 2.5} width="5" height="5" fill="#F5C542"
            initial={reduced ? false : { opacity: 0 }}
            whileInView={reduced ? undefined : { opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 + i * 0.06 }} />
        )
      })}
      {/* labels */}
      {STRENGTHS.map((s, i) => {
        const [x, y] = pt(i, R + 14)
        return (
          <text key={i} x={x} y={y} fill="#8892A4" fontSize="7" textAnchor="middle" dominantBaseline="middle"
                style={{ fontFamily: 'var(--font-press), monospace' }}>
            {s.label.slice(0, 6)}
          </text>
        )
      })}
    </svg>
  )
}
