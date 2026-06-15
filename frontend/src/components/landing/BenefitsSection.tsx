'use client'

import React from 'react'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { AnimatedSection } from '@/components/ui/AnimatedSection'

const BENEFITS = [
  {
    symbol:      '◈',
    symbolColor: 'text-pixel-gold',
    variant:     'default' as const,
    title:       'Built around you, not a template',
    description: 'The report is generated from the intersection of your MBTI type, Human Design configuration, and real career context. Not a generic quiz result — a document written about you specifically.',
  },
  {
    symbol:      '▸',
    symbolColor: 'text-pixel-blue',
    variant:     'subtle' as const,
    title:       'Actionable from the first read',
    description: 'Each career recommendation includes a specific first action, a skills roadmap, and a realistic income range. You leave with a plan, not a personality label.',
  },
  {
    symbol:      '◆',
    symbolColor: 'text-pixel-green',
    variant:     'subtle' as const,
    title:       'Grounded in two established frameworks',
    description: 'MBTI is the world\'s most widely used personality framework. Human Design offers a distinct lens on energy type and decision-making. The combination reveals patterns that neither system shows alone.',
  },
  {
    symbol:      '★',
    symbolColor: 'text-pixel-gold',
    variant:     'default' as const,
    title:       'A long-term career reference',
    description: 'Ten sections covering your profile, capacity, blind spots, environment needs, career paths, vision, skill roadmap, decision guide, and action plan. A codex you return to, not discard.',
  },
]

export function BenefitsSection() {
  return (
    <section
      className="py-24 px-4 sm:px-6"
      style={{
        background: 'linear-gradient(180deg, #10141F 0%, rgba(28,36,52,0.4) 50%, #10141F 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <AnimatedSection className="mb-12 text-center">
          <p className="font-press text-[0.42rem] text-pixel-muted mb-3 uppercase tracking-widest">
            Why It Works
          </p>
          <h2 className="font-pixel text-2xl sm:text-3xl text-pixel-text">
            Not just advice.{' '}
            <span className="text-pixel-gold">A career codex.</span>
          </h2>
        </AnimatedSection>

        {/* 2×2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {BENEFITS.map((b, i) => (
            <AnimatedSection key={b.title} delay={i * 0.1}>
              <BenefitCard {...b} />
            </AnimatedSection>
          ))}
        </div>

      </div>
    </section>
  )
}

interface BenefitCardProps {
  symbol:      string
  symbolColor: string
  variant:     'default' | 'subtle'
  title:       string
  description: string
}

function BenefitCard({ symbol, symbolColor, variant, title, description }: BenefitCardProps) {
  return (
    <PixelPanel variant={variant} className="flex gap-5 h-full">
      {/* Symbol column */}
      <div className="flex-shrink-0 mt-0.5">
        <span className={`font-vt text-vt-2xl ${symbolColor}`}>{symbol}</span>
      </div>

      {/* Text column */}
      <div className="space-y-2">
        <h3 className="font-press text-press-xs text-pixel-text leading-relaxed">{title}</h3>
        <p className="font-body text-sm text-pixel-muted leading-relaxed">{description}</p>
      </div>
    </PixelPanel>
  )
}
