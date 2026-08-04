'use client'

import { motion } from 'framer-motion'
import { Brain, Hexagon, Sparkles, ScrollText } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { staggerContainer, staggerItem, fadeUp, VIEWPORT, EASE_OUT_EXPO } from '@/lib/motion'

interface Step {
  n: string
  Icon: LucideIcon
  title: string
  desc: string
  detail: string
  color: string
  ring: string
}

const STEPS: Step[] = [
  { n: '01', Icon: Brain,      title: 'Input Your MBTI',        desc: 'Tell us your 16-type personality. This maps how you think, decide, and recharge.',                 detail: 'Personality core',  color: 'text-pixel-gold',  ring: 'border-pixel-gold'  },
  { n: '02', Icon: Hexagon,    title: 'Input Human Design',     desc: 'Your Type, Authority and Profile reveal how your energy actually wants to operate.',                detail: 'Energy blueprint',  color: 'text-pixel-blue',  ring: 'border-pixel-blue'  },
  { n: '03', Icon: Sparkles,   title: 'AI Analysis',            desc: 'Our engine cross-references both frameworks against a structured career knowledge base.',            detail: 'Synthesis engine',  color: 'text-pixel-green', ring: 'border-pixel-green' },
  { n: '04', Icon: ScrollText, title: 'Re:Lumma Blueprint', desc: 'Receive a 10-section codex: your class, arenas, blind spots, roadmap and action plan.',          detail: 'Your codex',        color: 'text-pixel-gold',  ring: 'border-pixel-gold'  },
]

export function HowItWorksSection() {
  const reduced = usePrefersReducedMotion()

  return (
    <section id="how-it-works" className="relative px-4 py-28 sm:px-6" aria-label="How it works">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}
        >
          <div className="mb-4 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-pixel-border" />
            <span className="font-press text-press-xs text-pixel-gold">YOUR QUEST</span>
            <span className="h-px w-12 bg-pixel-border" />
          </div>
          <h2 className="font-pixel text-3xl text-pixel-text sm:text-4xl">
            Four steps to your <span className="fx-gradient-text">blueprint</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg font-body text-sm text-pixel-muted">
            From raw self-knowledge to a cinematic career codex — the whole journey takes minutes.
          </p>
        </motion.div>

        {/* ── Desktop: horizontal rail with animated connector ─────────── */}
        <div className="relative hidden md:block">
          {/* Base line */}
          <div className="absolute left-0 right-0 top-[52px] h-0.5 bg-pixel-border" aria-hidden />
          {/* Animated fill line */}
          <motion.div
            className="absolute left-0 top-[52px] h-0.5 origin-left"
            style={{ background: 'linear-gradient(90deg, #F5C542, #4DA6FF, #5CE27A)' }}
            aria-hidden
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-20%' }}
            transition={{ duration: 1.6, ease: EASE_OUT_EXPO }}
          />
          {/* Traveling pulse */}
          {!reduced && (
            <motion.div
              className="absolute top-[52px] h-2 w-2 -translate-y-[3px] rounded-full bg-pixel-gold"
              style={{ boxShadow: '0 0 10px #F5C542' }}
              aria-hidden
              initial={{ left: '0%', opacity: 0 }}
              whileInView={{ left: '100%', opacity: [0, 1, 1, 0] }}
              viewport={{ once: true, margin: '-20%' }}
              transition={{ duration: 1.8, ease: EASE_OUT_EXPO }}
            />
          )}

          <motion.div
            className="grid grid-cols-4 gap-6"
            variants={staggerContainer} custom={0.18}
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-15%' }}
          >
            {STEPS.map((s) => <StepNode key={s.n} step={s} />)}
          </motion.div>
        </div>

        {/* ── Mobile: vertical stack ───────────────────────────────────── */}
        <motion.div
          className="relative space-y-4 md:hidden"
          variants={staggerContainer} custom={0.12}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-10%' }}
        >
          {STEPS.map((s, i) => (
            <motion.div key={s.n} variants={staggerItem} className="relative">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center border-2 bg-pixel-panel ${s.ring}`}>
                    <s.Icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  {i < STEPS.length - 1 && <span className="mt-1 w-0.5 flex-1 bg-pixel-border" />}
                </div>
                <div className="pixel-panel-subtle flex-1 p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <span className={`font-press text-[0.4rem] ${s.color}`}>STEP {s.n}</span>
                    <span className="font-press text-[0.36rem] text-pixel-muted">· {s.detail}</span>
                  </div>
                  <h3 className="font-press text-press-xs text-pixel-text">{s.title}</h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-pixel-muted">{s.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function StepNode({ step }: { step: Step }) {
  return (
    <motion.div variants={staggerItem} className="group text-center">
      {/* Node */}
      <div className="relative mx-auto mb-6 flex h-[104px] w-[104px] items-center justify-center">
        <div className={`fx-spin-slow absolute inset-0 rounded-full border border-dashed ${step.ring} opacity-30`} aria-hidden />
        <div
          className={`relative flex h-16 w-16 items-center justify-center border-2 bg-pixel-panel transition-transform duration-300 group-hover:-translate-y-1 ${step.ring}`}
          style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.6)' }}
        >
          <step.Icon className={`h-7 w-7 ${step.color}`} />
        </div>
      </div>

      <span className={`font-press text-[0.4rem] ${step.color}`}>STEP {step.n}</span>
      <h3 className="mt-2 font-press text-press-xs leading-relaxed text-pixel-text">{step.title}</h3>
      <p className="mx-auto mt-3 max-w-[15rem] font-body text-sm leading-relaxed text-pixel-muted">{step.desc}</p>
      <p className="mt-3 font-press text-[0.36rem] uppercase tracking-widest text-pixel-muted">{step.detail}</p>
    </motion.div>
  )
}
