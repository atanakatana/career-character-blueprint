'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { PixelButton } from '@/components/ui/PixelButton'
import { PixelPanel } from '@/components/ui/PixelPanel'

const STAT_BARS = [
  { label: 'Career Alignment',    value: 94, color: 'bg-pixel-gold'  },
  { label: 'Energy Compatibility', value: 87, color: 'bg-pixel-blue'  },
  { label: 'Growth Potential',    value: 92, color: 'bg-pixel-green' },
]

// ─── Floating pixel decorations ─────────────────────────────────────────────
const FLOATERS = [
  { top: '18%', left:  '4%',  size: 'w-2 h-2',   color: 'bg-pixel-gold',  delay: 0 },
  { top: '35%', right: '7%',  size: 'w-1.5 h-1.5', color: 'bg-pixel-blue',  delay: 1.1 },
  { top: '65%', left:  '12%', size: 'w-1 h-1',    color: 'bg-pixel-green', delay: 0.6 },
  { top: '72%', right: '14%', size: 'w-2 h-2',   color: 'bg-pixel-gold',  delay: 1.8 },
  { top: '25%', left:  '48%', size: 'w-1 h-1',    color: 'bg-pixel-blue',  delay: 0.9 },
]

export function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">

      {/* Background pixel grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245,197,66,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,197,66,0.045) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Radial glow behind hero content */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 30% 50%, rgba(245,197,66,0.04) 0%, transparent 70%)',
        }}
      />

      {/* Floating pixel decorations */}
      {FLOATERS.map((f, i) => (
        <div
          key={i}
          className={`absolute ${f.size} ${f.color} opacity-25 animate-pixel-float pointer-events-none`}
          style={{
            top: f.top,
            left: 'left' in f ? f.left : undefined,
            right: 'right' in f ? f.right : undefined,
            animationDelay: `${f.delay}s`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left: Text + CTA ─────────────────────────────────────────── */}
          <motion.div
            className="space-y-7"
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          >
            {/* Eyebrow badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="pixel-tag">PROFESIONAL TEAM</span>
              <span className="pixel-tag-blue">CAREER GUIDANCE</span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="font-pixel text-3xl sm:text-4xl lg:text-[2.6rem] text-pixel-text leading-tight">
                Discover Your
                <br />
                <span className="text-pixel-gold">Career Blueprint</span>
              </h1>
            </div>

            {/* VT323 tagline */}
            <p className="font-vt text-vt-xl text-pixel-muted leading-tight tracking-wide">
              MBTI · HUMAN DESIGN · AI&nbsp;&mdash;&nbsp;YOUR PATH REVEALED
            </p>

            {/* Body */}
            <p className="font-body text-base text-pixel-muted leading-relaxed max-w-md">
              Answer 9 questions about your personality type, energy design, and where 
              you want your career to go. Receive a&nbsp;10-section personalized report — 
              grounded in who you actually are, not who you think you should be.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
              <Link href="/create">
                <PixelButton variant="primary" size="lg">
                  ▶&nbsp; Start Your Career Blueprint
                </PixelButton>
              </Link>
              <span className="font-press text-[0.42rem] text-pixel-muted">
                Dependable&nbsp;·&nbsp;Quick Result&nbsp;·&nbsp;Delivered by email
              </span>
            </div>
          </motion.div>

          {/* ── Right: Animated Stat Block ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease: 'easeOut' }}
            className="max-w-sm mx-auto lg:mx-0 w-full"
          >
            <StatBlock />
          </motion.div>

        </div>
      </div>

      {/* Bottom fade into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #10141F)' }}
      />
    </section>
  )
}

// ── Animated Character Stat Block ─────────────────────────────────────────────
function StatBlock() {
  return (
    <PixelPanel>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-press text-[0.42rem] text-pixel-gold tracking-wider">
          ◆&nbsp; CAREER CODEX
        </span>
        <span className="pixel-tag-muted animate-pixel-pulse">SAMPLE</span>
      </div>
      <div className="pixel-divider my-0" />

      {/* Character identity */}
      <div className="mt-4 mb-4 space-y-2">
        <p className="font-press text-[0.38rem] text-pixel-muted uppercase tracking-widest">
          Character Class
        </p>
        <p className="font-pixel text-xl text-pixel-gold leading-tight">
          The Empathic Architect
        </p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="pixel-tag">INFJ</span>
          <span className="pixel-tag-blue">Generator</span>
          <span className="pixel-tag-muted">3/5 Profile</span>
        </div>
      </div>

      <div className="pixel-divider my-0" />

      {/* Stat bars */}
      <div className="mt-4 space-y-3.5">
        {STAT_BARS.map((stat, i) => (
          <div key={stat.label}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-press text-[0.38rem] text-pixel-muted">{stat.label}</span>
              <span className="font-press text-[0.38rem] text-pixel-gold">{stat.value}%</span>
            </div>
            <div className="h-2 bg-pixel-bg border border-pixel-border overflow-hidden">
              <motion.div
                className={`h-full ${stat.color}`}
                initial={{ width: '0%' }}
                animate={{ width: `${stat.value}%` }}
                transition={{ duration: 1.1, delay: 0.9 + i * 0.18, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="pixel-divider mt-4 mb-0" />

      {/* Career paths */}
      <div className="mt-3 space-y-2">
        <p className="font-press text-[0.38rem] text-pixel-muted uppercase tracking-widest">
          Top Career Paths
        </p>
        <div className="flex flex-wrap gap-1.5">
          {['UX Research', 'Strategic Consulting', 'Coaching'].map((path) => (
            <span
              key={path}
              className="font-press text-[0.38rem] text-pixel-blue border border-pixel-blue px-1.5 py-0.5"
            >
              {path}
            </span>
          ))}
        </div>
      </div>

      {/* Blinking cursor line */}
      <div className="mt-4 pt-3 border-t border-pixel-border">
        <span className="font-press text-[0.38rem] text-pixel-muted">
          ▸&nbsp; Your blueprint is waiting
        </span>
        <span className="font-press text-[0.38rem] text-pixel-gold animate-pixel-blink">
          &nbsp;█
        </span>
      </div>
    </PixelPanel>
  )
}
