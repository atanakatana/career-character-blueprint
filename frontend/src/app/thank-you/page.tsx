import type { Metadata } from 'next'
import Link from 'next/link'
import { PixelLayout } from '@/components/layout/PixelLayout'
import { PixelPanel }  from '@/components/ui/PixelPanel'
import { PixelButton } from '@/components/ui/PixelButton'

export const metadata: Metadata = {
  title: 'Blueprint Requested | Character Career Blueprint',
  // Prevent indexing — this page has no useful content for search
  robots: { index: false },
}

const PROCESSING_STEPS = [
  { label: 'Character data received',    done: true,  active: false },
  { label: 'AI crafting your codex',     done: false, active: true  },
  { label: 'Blueprint delivered by email', done: false, active: false },
]

export default function ThankYouPage() {
  return (
    <PixelLayout>
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-20">

        {/* Quest accepted header */}
        <div className="text-center mb-10 space-y-3">
          <div className="font-vt text-vt-4xl text-pixel-gold animate-pixel-float inline-block">
            ★
          </div>
          <h1 className="font-press text-press-lg text-pixel-gold leading-relaxed">
            Quest Accepted
          </h1>
          <p className="font-vt text-vt-xl text-pixel-muted">
            YOUR BLUEPRINT IS BEING CRAFTED
          </p>
        </div>

        {/* Processing status panel */}
        <PixelPanel className="mb-8">

          {/* Status steps */}
          <div className="space-y-4 mb-6">
            {PROCESSING_STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center border border-pixel-border">
                  {s.done ? (
                    <span className="font-press text-[0.42rem] text-pixel-green">✓</span>
                  ) : s.active ? (
                    <span className="font-press text-[0.42rem] text-pixel-gold animate-pixel-blink">
                      ⬛
                    </span>
                  ) : (
                    <span className="font-press text-[0.42rem] text-pixel-border">○</span>
                  )}
                </div>
                <span className={`font-press text-[0.42rem] ${
                  s.done   ? 'text-pixel-green' :
                  s.active ? 'text-pixel-gold'  :
                             'text-pixel-muted'
                }`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <div className="pixel-divider" />

          {/* Estimated time */}
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-2">
              <span className="font-press text-[0.4rem] text-pixel-muted mt-0.5">⏱</span>
              <div>
                <p className="font-press text-[0.42rem] text-pixel-text mb-1">
                  Estimated time: 2–3 minutes
                </p>
                <p className="font-body text-sm text-pixel-muted leading-relaxed">
                  The AI is synthesising your MBTI type, Human Design configuration, 
                  and career context into a 10-section personalised blueprint.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="font-press text-[0.4rem] text-pixel-muted mt-0.5">✉</span>
              <div>
                <p className="font-press text-[0.42rem] text-pixel-text mb-1">
                  Check your inbox
                </p>
                <p className="font-body text-sm text-pixel-muted leading-relaxed">
                  Your blueprint link will arrive by email. Check your spam folder 
                  if it doesn't appear within 5 minutes.
                </p>
              </div>
            </div>
          </div>
        </PixelPanel>

        {/* What's inside reminder */}
        <PixelPanel variant="subtle" className="mb-8">
          <p className="font-press text-[0.42rem] text-pixel-muted mb-3">
            Your blueprint will include:
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {[
              'Character Title',
              'Profile Summary',
              'Capacity & Energy',
              'Blind Spots',
              'Ideal Environment',
              'Career Paths',
              'Long-Term Vision',
              'Skill Roadmap',
              'Decision Guide',
              'Action Plan',
            ].map(item => (
              <div key={item} className="flex items-center gap-1.5">
                <span className="font-press text-[0.36rem] text-pixel-green">▸</span>
                <span className="font-body text-xs text-pixel-muted">{item}</span>
              </div>
            ))}
          </div>
        </PixelPanel>

        {/* Navigation */}
        <div className="text-center space-y-3">
          <Link href="/">
            <PixelButton variant="ghost" size="md">
              ◀&nbsp; Back to Home
            </PixelButton>
          </Link>
          <p className="font-press text-[0.38rem] text-pixel-muted">
            You can close this tab — your blueprint will arrive by email.
          </p>
        </div>

      </div>
    </PixelLayout>
  )
}
