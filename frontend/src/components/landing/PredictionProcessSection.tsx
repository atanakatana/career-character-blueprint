'use client'

import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { Radar, GitCompareArrows, ScanSearch, Trophy, PenTool } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AnimatedCounter } from '@/components/ui/motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { fadeUp, VIEWPORT, EASE_OUT_EXPO } from '@/lib/motion'

interface Phase { Icon: LucideIcon; tag: string; title: string; desc: string; color: string }

const PHASES: Phase[] = [
  { Icon: Radar,            tag: 'PHASE 01', title: 'Ingest your signals',       desc: 'Your MBTI cognitive functions and Human Design circuitry are parsed into a structured signal set.', color: 'text-pixel-gold'  },
  { Icon: GitCompareArrows, tag: 'PHASE 02', title: 'Cross-reference frameworks', desc: 'The engine maps where MBTI and Human Design agree, and where they productively conflict.',           color: 'text-pixel-blue'  },
  { Icon: ScanSearch,       tag: 'PHASE 03', title: 'Detect patterns',           desc: 'Synergies, tensions and blind spots surface as repeatable behavioural patterns.',                    color: 'text-pixel-green' },
  { Icon: Trophy,           tag: 'PHASE 04', title: 'Score career arenas',       desc: 'Dozens of career arenas are ranked by fit against your specific configuration.',                     color: 'text-pixel-gold'  },
  { Icon: PenTool,          tag: 'PHASE 05', title: 'Compose your codex',        desc: 'Everything is written up into a readable, 10-section Career Character Blueprint.',                    color: 'text-pixel-blue'  },
]

const METRICS = [
  { label: 'Signals synthesized', to: 240, suffix: '+' },
  { label: 'Patterns detected',   to: 18,  suffix: ''  },
  { label: 'Arenas scored',       to: 12,  suffix: ''  },
  { label: 'Fit confidence',      to: 96,  suffix: '%' },
]

export function PredictionProcessSection() {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 65%', 'end 55%'] })
  const spineScale = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 })

  return (
    <section id="prediction-process" className="relative overflow-hidden px-4 py-28 sm:px-6" aria-label="The prediction process">
      {/* backdrop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden
           style={{ background: 'radial-gradient(ellipse 60% 50% at 80% 30%, rgba(77,166,255,0.08), transparent 70%)' }} />

      <div className="relative mx-auto max-w-6xl">
        <motion.div className="mb-16 text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}>
          <p className="mb-3 font-press text-[0.42rem] uppercase tracking-widest text-pixel-muted">Behind the magic</p>
          <h2 className="font-pixel text-3xl text-pixel-text sm:text-4xl">
            How the <span className="fx-gradient-text">prediction</span> is forged
          </h2>
          <p className="mx-auto mt-4 max-w-lg font-body text-sm text-pixel-muted">
            Not a personality quiz result — a multi-phase synthesis of two frameworks into one career identity.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">

          {/* ── Timeline with animated spine ─────────────────────────── */}
          <div ref={ref} className="relative pl-14">
            {/* spine track */}
            <div className="absolute left-[26px] top-2 bottom-2 w-0.5 bg-pixel-border" aria-hidden />
            {/* animated spine fill (scroll-driven) */}
            <motion.div
              className="absolute left-[26px] top-2 w-0.5 origin-top"
              style={{
                height: 'calc(100% - 16px)',
                scaleY: reduced ? 1 : spineScale,
                background: 'linear-gradient(180deg, #F5C542, #4DA6FF, #5CE27A)',
                boxShadow: '0 0 8px rgba(245,197,66,0.5)',
              }}
              aria-hidden
            />

            <div className="space-y-8">
              {PHASES.map((p, i) => (
                <motion.div
                  key={p.tag}
                  className="relative"
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-12%' }}
                  transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: i * 0.05 }}
                >
                  {/* node */}
                  <div className="absolute -left-14 top-0 flex h-[54px] w-[54px] items-center justify-center">
                    <span className={`fx-twinkle absolute inset-0 rounded-full border border-current opacity-20 ${p.color}`} aria-hidden />
                    <div className="flex h-11 w-11 items-center justify-center border-2 border-pixel-border bg-pixel-panel"
                         style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.6)' }}>
                      <p.Icon className={`h-5 w-5 ${p.color}`} />
                    </div>
                  </div>

                  <div className="pixel-panel-subtle p-4">
                    <span className={`font-press text-[0.38rem] tracking-wider ${p.color}`}>{p.tag}</span>
                    <h3 className="mt-1.5 font-press text-press-xs text-pixel-text">{p.title}</h3>
                    <p className="mt-2 font-body text-sm leading-relaxed text-pixel-muted">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Synthesis console ────────────────────────────────────── */}
          <motion.div
            className="lg:sticky lg:top-24 lg:self-start"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}
          >
            <div className="pixel-panel relative overflow-hidden p-5">
              {!reduced && <span className="fx-shimmer fx-shimmer-run" aria-hidden />}
              <div className="mb-3 flex items-center justify-between">
                <span className="font-press text-[0.42rem] tracking-wider text-pixel-gold">◆ SYNTHESIS CONSOLE</span>
                <span className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full bg-pixel-green ${reduced ? '' : 'animate-pixel-pulse'}`} />
                  <span className="font-press text-[0.36rem] text-pixel-green">RUNNING</span>
                </span>
              </div>
              <div className="pixel-divider my-0" />

              {/* metrics */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {METRICS.map((m) => (
                  <div key={m.label} className="border border-pixel-border bg-pixel-bg/50 p-3">
                    <p className="font-pixel text-2xl text-pixel-gold">
                      <AnimatedCounter to={m.to} suffix={m.suffix} />
                    </p>
                    <p className="mt-1 font-press text-[0.34rem] uppercase tracking-wide text-pixel-muted">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* live progress meters */}
              <div className="mt-4 space-y-3">
                {[
                  { label: 'Framework alignment', v: 94, c: 'bg-pixel-gold'  },
                  { label: 'Pattern coverage',    v: 88, c: 'bg-pixel-blue'  },
                  { label: 'Arena confidence',    v: 96, c: 'bg-pixel-green' },
                ].map((row, i) => (
                  <div key={row.label}>
                    <div className="mb-1 flex justify-between">
                      <span className="font-press text-[0.36rem] text-pixel-muted">{row.label}</span>
                      <span className="font-press text-[0.36rem] text-pixel-gold">{row.v}%</span>
                    </div>
                    <div className="h-2 overflow-hidden border border-pixel-border bg-pixel-bg">
                      <motion.div
                        className={`h-full ${row.c}`}
                        initial={{ width: '0%' }}
                        whileInView={{ width: `${row.v}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.2 + i * 0.15, ease: EASE_OUT_EXPO }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-pixel-border pt-3">
                <span className="font-press text-[0.36rem] text-pixel-muted">▸ Compiling career_blueprint.codex</span>
                <span className="font-press text-[0.36rem] text-pixel-gold animate-pixel-blink">&nbsp;█</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
