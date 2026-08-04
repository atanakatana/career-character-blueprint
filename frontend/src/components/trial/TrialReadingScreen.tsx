'use client'

import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { PixelPanel }  from '@/components/ui/PixelPanel'
import { PixelButton } from '@/components/ui/PixelButton'
import type { TrialReadingResponse } from '@/lib/types'

const LOCKED_SECTIONS = [
  'Complete Blueprint',
  'Weakness Analysis',
  'Growth Roadmap',
  'Career Compatibility',
  'Personalized Habit Plan',
  'Long-term Development Strategy',
]

interface Props {
  reading:  TrialReadingResponse
  onUnlock: () => void
}

/**
 * Free Trial Reading — shown instantly after the assessment, before any
 * email, login, or payment. Unlocked fields come straight from
 * TrialReadingResponse (computed server-side from static knowledge, not an
 * AI call). Locked sections are a static, always-the-same list per the
 * brief — they render blurred with a lock overlay as a preview of the
 * Complete Blueprint.
 */
export function TrialReadingScreen({ reading, onUnlock }: Props) {
  return (
    <div className="w-full space-y-6">

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="font-vt text-4xl text-pixel-gold animate-pixel-float inline-block">◆</div>
        <p className="font-press text-[0.42rem] uppercase tracking-widest text-pixel-muted">
          Free Trial Reading
        </p>
        <h1 className="font-pixel text-2xl text-pixel-gold">{reading.character_archetype}</h1>
      </div>

      {/* ── Unlocked preview ─────────────────────────────────────────────── */}
      <PixelPanel>
        <div className="space-y-5">
          <Field label="Personality Summary" value={reading.personality_summary} />

          <div>
            <p className="font-press text-[0.38rem] uppercase tracking-widest text-pixel-muted mb-2">
              Core Strengths
            </p>
            <div className="flex flex-wrap gap-1.5">
              {reading.core_strengths.map((s) => (
                <span key={s} className="pixel-tag-green">{s}</span>
              ))}
            </div>
          </div>

          <Field label="Energy Type" value={reading.energy_type} />
          <Field label="Basic Career Recommendation" value={reading.basic_career_recommendation} />
        </div>
      </PixelPanel>

      {/* ── Locked sections ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        {LOCKED_SECTIONS.map((label, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative overflow-hidden border-2 border-pixel-border bg-pixel-panel px-4 py-4"
          >
            {/* Blurred placeholder content behind the lock */}
            <div className="select-none blur-sm opacity-50" aria-hidden>
              <p className="font-press text-[0.42rem] text-pixel-gold mb-1">{label}</p>
              <p className="font-body text-xs text-pixel-muted">
                ████████ ████ ██████████ ████ ██████ ████████████ ██ ████.
              </p>
            </div>

            {/* Lock overlay */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-pixel-bg/60 backdrop-blur-[1px]">
              <Lock className="h-3.5 w-3.5 text-pixel-muted" />
              <span className="font-press text-[0.4rem] text-pixel-muted">{label} — Locked</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <PixelPanel variant="accent" className="text-center space-y-4">
        <p className="font-press text-xs text-pixel-blue">◆ YOUR FULL BLUEPRINT IS WAITING</p>
        <p className="font-body text-sm text-pixel-muted max-w-md mx-auto">
          This Trial Reading is a preview. Unlock your Complete Blueprint for the full
          10-section reading, weakness analysis, growth roadmap, and a personalised habit plan.
        </p>
        <PixelButton variant="primary" size="lg" className="w-full justify-center" onClick={onUnlock}>
          ▶&nbsp; Unlock Your Blueprint
        </PixelButton>
      </PixelPanel>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-press text-[0.38rem] uppercase tracking-widest text-pixel-muted mb-1.5">
        {label}
      </p>
      <p className="font-body text-sm text-pixel-text leading-relaxed">{value}</p>
    </div>
  )
}
