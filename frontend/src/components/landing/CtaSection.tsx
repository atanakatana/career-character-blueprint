'use client'

import Link from 'next/link'
import { PixelButton } from '@/components/ui/PixelButton'
import { AnimatedSection } from '@/components/ui/AnimatedSection'

export function CtaSection() {
  return (
    <section className="relative py-28 px-4 sm:px-6 overflow-hidden">

      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245,197,66,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,197,66,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(245,197,66,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-7">

        <AnimatedSection>
          {/* Badge */}
          <div className="flex justify-center mb-4">
            <span className="pixel-tag animate-pixel-pulse">READY?</span>
          </div>

          {/* Headline */}
          <h2 className="font-pixel text-2xl sm:text-3xl text-pixel-text leading-tight">
            Your career codex
            <br />
            <span className="text-pixel-gold">is waiting to be written</span>
          </h2>

          {/* Subtext */}
          <p className="font-body text-base text-pixel-muted leading-relaxed mt-5 max-w-md mx-auto">
            Answer 9 questions. Get a personalized career report built from who you 
            actually are — not who a generic quiz thinks you might be.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link href="/create">
              <PixelButton variant="primary" size="lg">
                ▶&nbsp; Start Your Career Blueprint
              </PixelButton>
            </Link>
          </div>

          {/* Trust line */}
          <p className="font-press text-[0.4rem] text-pixel-muted mt-5">
            For you&nbsp; · &nbsp;Less than 24 hours&nbsp; · &nbsp;Delivered to your inbox
          </p>
        </AnimatedSection>

        {/* Decorative pixel border */}
        <AnimatedSection delay={0.15}>
          <div className="mt-12 flex items-center gap-4">
            <div className="flex-1 h-px bg-pixel-border" />
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-pixel-gold opacity-30"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <div className="flex-1 h-px bg-pixel-border" />
          </div>

          {/* What's inside reminder */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              'Character Title',
              'Career Paths',
              'Skill Roadmap',
              'Action Plan',
              'Decision Guide',
              'Long-Term Vision',
            ].map((item) => (
              <div
                key={item}
                className="border border-pixel-border px-3 py-2 text-center"
              >
                <span className="font-press text-[0.38rem] text-pixel-muted">{item}</span>
              </div>
            ))}
          </div>
          <p className="font-press text-[0.38rem] text-pixel-muted mt-3">
            + 4 more sections in every blueprint
          </p>
        </AnimatedSection>

      </div>
    </section>
  )
}
