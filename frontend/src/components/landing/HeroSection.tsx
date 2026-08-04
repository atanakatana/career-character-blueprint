'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronDown, Play, Sparkles } from 'lucide-react'
import { useMousePosition } from '@/hooks/useMousePosition'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { ParticleField, MagneticButton } from '@/components/ui/motion'
import { EASE_OUT_EXPO } from '@/lib/motion'

/** Headline is revealed word-by-word for a cinematic "title card" feel. */
const HEADLINE = ['Discover', 'Your', 'Re:Lumma', 'Blueprint']

const STAT_BARS = [
  { label: 'Career Alignment',     value: 94, color: 'bg-pixel-gold'  },
  { label: 'Energy Compatibility', value: 87, color: 'bg-pixel-blue'  },
  { label: 'Growth Potential',     value: 92, color: 'bg-pixel-green' },
]

const STARS = [
  { top: '14%', left: '8%',  d: 0   }, { top: '22%', left: '82%', d: 0.7 },
  { top: '40%', left: '18%', d: 1.4 }, { top: '68%', left: '9%',  d: 0.4 },
  { top: '30%', left: '54%', d: 1.1 }, { top: '76%', left: '78%', d: 1.8 },
  { top: '58%', left: '88%', d: 0.9 }, { top: '84%', left: '40%', d: 1.5 },
]

export function HeroSection() {
  const router = useRouter()
  const reduced = usePrefersReducedMotion()
  const { x: mx, y: my } = useMousePosition(!reduced)

  // Parallax helper: depth multiplies the normalized pointer offset.
  const layer = (depth: number) =>
    reduced ? {} : { transform: `translate3d(${mx * depth}px, ${my * depth}px, 0)` }

  const goCreate = () => router.push('/create')
  const watchDemo = () =>
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] items-center overflow-hidden"
      aria-label="Introduction"
    >
      {/* ══ BACKGROUND DEPTH STACK (aria-hidden) ══════════════════════════ */}

      {/* Aurora nebulae */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="fx-aurora absolute -left-[10%] top-[6%] h-[42vw] w-[42vw] rounded-full opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(245,197,66,0.28), transparent 60%)', ...layer(18) }}
        />
        <div
          className="fx-aurora absolute right-[-8%] top-[24%] h-[38vw] w-[38vw] rounded-full opacity-50"
          style={{ background: 'radial-gradient(circle, rgba(77,166,255,0.26), transparent 60%)', animationDelay: '4s', ...layer(28) }}
        />
        <div
          className="fx-aurora absolute bottom-[-12%] left-[30%] h-[34vw] w-[34vw] rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(92,226,122,0.22), transparent 60%)', animationDelay: '8s', ...layer(22) }}
        />
      </div>

      {/* Parallax pixel grid */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage:
            'linear-gradient(rgba(245,197,66,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,197,66,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, #000 30%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, #000 30%, transparent 85%)',
          ...layer(-8),
        }}
      />

      {/* Pixel dust particle field */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <ParticleField density={9} parallax={16} />
      </div>

      {/* Twinkling stars */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {STARS.map((s, i) => (
          <span
            key={i}
            className="fx-twinkle absolute block h-[3px] w-[3px] bg-pixel-text"
            style={{ top: s.top, left: s.left, animationDelay: `${s.d}s` }}
          />
        ))}
      </div>

      {/* Vignette + bottom fade into next section */}
      <div className="pointer-events-none absolute inset-0" aria-hidden
           style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, transparent 40%, rgba(16,20,31,0.75) 100%)' }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32" aria-hidden
           style={{ background: 'linear-gradient(to bottom, transparent, #10141F)' }} />

      {/* ══ CONTENT ═══════════════════════════════════════════════════════ */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">

          {/* ── Left: copy + CTAs ─────────────────────────────────────── */}
          <div style={layer(6)}>
            {/* Eyebrow */}
            <motion.div
              className="mb-6 inline-flex items-center gap-2 border border-pixel-border bg-pixel-panel/60 px-3 py-1.5 backdrop-blur-sm"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
            >
              <Sparkles className="h-3 w-3 text-pixel-gold" />
              <span className="font-press text-[0.42rem] tracking-wider text-pixel-gold">
                MBTI · HUMAN DESIGN · AI
              </span>
            </motion.div>

            {/* Headline — word-by-word */}
            <h1 className="font-pixel text-4xl leading-[1.05] text-pixel-text sm:text-5xl lg:text-6xl">
              {HEADLINE.map((word, i) => (
                <motion.span
                  key={word}
                  className={`mr-[0.28em] inline-block ${word === 'Re:Lumma' || word === 'Blueprint' ? 'fx-gradient-text' : ''}`}
                  initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.15 + i * 0.1 }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            {/* VT tagline */}
            <motion.p
              className="mt-5 font-vt text-vt-xl leading-tight tracking-wide text-pixel-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              A cinematic career identity, decoded from who you truly are.
            </motion.p>

            {/* Body */}
            <motion.p
              className="mt-5 max-w-md font-body text-base leading-relaxed text-pixel-muted"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.85 }}
            >
              We fuse your <span className="text-pixel-text">MBTI</span> type,{' '}
              <span className="text-pixel-text">Human Design</span> configuration, and{' '}
              <span className="text-pixel-text">AI</span> synthesis into a personalized
              Re:Lumma Blueprint — a codex of your strengths, arenas, and path forward.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 1 }}
            >
              <MagneticButton
                onClick={goCreate}
                aria-label="Start your journey"
                className="pixel-btn-primary px-7 py-3.5 text-press-sm"
                glow="rgba(245,197,66,0.6)"
              >
                <span className="inline-flex items-center gap-2">▶ Start Your Journey</span>
              </MagneticButton>

              <MagneticButton
                onClick={watchDemo}
                aria-label="Watch demo"
                className="pixel-btn-secondary px-6 py-3.5 text-press-sm"
                glow="rgba(77,166,255,0.5)"
                strength={0.25}
              >
                <span className="inline-flex items-center gap-2">
                  <Play className="h-3 w-3" /> Watch Demo
                </span>
              </MagneticButton>
            </motion.div>

            <motion.p
              className="mt-5 font-press text-[0.42rem] text-pixel-muted"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            >
              9 questions · Delivered by email · Built around you
            </motion.p>
          </div>

          {/* ── Right: floating codex ─────────────────────────────────── */}
          <motion.div
            className="mx-auto w-full max-w-sm lg:mx-0"
            initial={{ opacity: 0, y: 40, rotateX: 12 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.5 }}
            style={{ perspective: 1000 }}
          >
            <div style={layer(-20)}>
              <div className={reduced ? '' : 'fx-drift'}>
                <HeroCodex reduced={reduced} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      {!reduced && (
        <motion.button
          onClick={watchDemo}
          aria-label="Scroll to explore"
          className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 flex-col items-center gap-1.5 text-pixel-muted hidden sm:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          <span className="font-press text-[0.36rem] tracking-widest">SCROLL</span>
          <span className="flex h-8 w-5 justify-center rounded-full border border-pixel-border pt-1.5">
            <motion.span
              className="h-1.5 w-1 rounded-full bg-pixel-gold"
              animate={{ y: [0, 8, 0], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
          <ChevronDown className="h-3 w-3" />
        </motion.button>
      )}
    </section>
  )
}

/* ── Floating "Career Codex" card ──────────────────────────────────────────── */
function HeroCodex({ reduced }: { reduced: boolean }) {
  return (
    <div className="fx-conic-border">
      <div className="pixel-panel relative overflow-hidden p-5">
        {/* shimmer sweep on mount */}
        {!reduced && <span className="fx-shimmer fx-shimmer-run" aria-hidden />}

        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <span className="font-press text-[0.42rem] tracking-wider text-pixel-gold">◆ CAREER CODEX</span>
          <span className="pixel-tag-muted animate-pixel-pulse">LIVE</span>
        </div>
        <div className="pixel-divider my-0" />

        {/* Identity */}
        <div className="mb-4 mt-4 space-y-2">
          <p className="font-press text-[0.38rem] uppercase tracking-widest text-pixel-muted">Blueprint Archetype</p>
          <p className="font-pixel text-xl leading-tight text-pixel-gold">The Empathic Architect</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="pixel-tag">INFJ</span>
            <span className="pixel-tag-blue">Generator</span>
            <span className="pixel-tag-muted">3/5 Profile</span>
          </div>
        </div>

        <div className="pixel-divider my-0" />

        {/* Stat bars */}
        <div className="mt-4 space-y-3.5">
          {STAT_BARS.map((s, i) => (
            <div key={s.label}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-press text-[0.38rem] text-pixel-muted">{s.label}</span>
                <span className="font-press text-[0.38rem] text-pixel-gold">{s.value}%</span>
              </div>
              <div className="h-2 overflow-hidden border border-pixel-border bg-pixel-bg">
                <motion.div
                  className={`h-full ${s.color}`}
                  initial={{ width: '0%' }}
                  whileInView={{ width: `${s.value}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, delay: 0.9 + i * 0.18, ease: EASE_OUT_EXPO }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-pixel-border">
          <span className="font-press text-[0.38rem] text-pixel-muted">▸ Your blueprint is waiting</span>
          <span className="font-press text-[0.38rem] text-pixel-gold animate-pixel-blink">&nbsp;█</span>
        </div>
      </div>
    </div>
  )
}
