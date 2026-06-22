'use client'

import Link from 'next/link'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { AnimatedSection } from '@/components/ui/AnimatedSection'

const STEPS = [
  {
    number:      '01',
    symbol:      '▣',
    title:       'Create Your Character',
    description: 'Answer 9 questions: your MBTI type, Human Design configuration, current occupation, what burns you out, and the kind of success you\'re building toward.',
    detail:      '≈ 5 minutes',
    color:       'text-pixel-gold',
  },
  {
    number:      '02',
    symbol:      '⬡',
    title:       'Our Team Working Your Codex',
    description: 'Our professionals cross-references your personality type, energy design, and career context against a structured knowledge base — then creates your 10-section blueprint.',
    detail:      '≈ 24 hours',
    color:       'text-pixel-blue',
  },
  {
    number:      '03',
    symbol:      '✦',
    title:       'Receive Your Blueprint',
    description: 'A unique link arrives in your inbox. Your Career Blueprint is yours — readable, shareable, and built to revisit as your path evolves.',
    detail:      'In your inbox',
    color:       'text-pixel-green',
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <AnimatedSection className="mb-12">
          <div className="flex items-center gap-4">
            <div className="pixel-divider flex-1" />
            <span className="font-press text-press-xs text-pixel-gold whitespace-nowrap">
              YOUR QUEST
            </span>
            <div className="pixel-divider flex-1" />
          </div>
        </AnimatedSection>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-0">
          {STEPS.map((step, i) => (
            <div key={step.number} className="flex flex-col md:flex-row items-stretch">

              {/* Step card */}
              <AnimatedSection delay={i * 0.12} className="flex-1">
                <StepCard {...step} />
              </AnimatedSection>

              {/* Connector arrow (desktop) */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:flex items-center justify-center px-3 py-8 flex-shrink-0">
                  <span className="font-vt text-vt-xl text-pixel-gold opacity-50">▶</span>
                </div>
              )}

              {/* Connector arrow (mobile) */}
              {i < STEPS.length - 1 && (
                <div className="flex md:hidden items-center justify-center py-3">
                  <span className="font-vt text-vt-xl text-pixel-gold opacity-50 rotate-90">▶</span>
                </div>
              )}

            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

interface StepCardProps {
  number:      string
  symbol:      string
  title:       string
  description: string
  detail:      string
  color:       string
}

function StepCard({ number, symbol, title, description, detail, color }: StepCardProps) {
  return (
    <PixelPanel variant="subtle" className="relative h-full flex flex-col gap-4">
      {/* Step badge */}
      <div className="flex items-center gap-3">
        <span
          className={`font-press text-[0.4rem] bg-pixel-panel border border-pixel-border px-2 py-1 ${color}`}
        >
          STEP {number}
        </span>
      </div>

      {/* Icon + title */}
      <div className="space-y-2">
        <div className={`font-vt text-vt-3xl ${color}`}>{symbol}</div>
        <h3 className="font-press text-press-xs text-pixel-text leading-relaxed">{title}</h3>
      </div>

      {/* Body */}
      <p className="font-body text-sm text-pixel-muted leading-relaxed flex-1">
        {description}
      </p>

      {/* Footer timing */}
      <div className="pt-2 border-t border-pixel-border">
        <span className={`font-press text-[0.4rem] ${color}`}>{detail}</span>
      </div>
    </PixelPanel>
  )
}
