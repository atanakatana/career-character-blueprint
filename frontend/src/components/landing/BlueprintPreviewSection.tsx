'use client'

import Link from 'next/link'
import { PixelButton } from '@/components/ui/PixelButton'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { AnimatedSection } from '@/components/ui/AnimatedSection'

// ── Mock report content ───────────────────────────────────────────────────────
const MOCK = {
  characterTitle: 'The Empathic Architect',
  mbti:      'INFJ',
  hdType:    'Generator',
  hdProfile: '3/5 Profile',
  hdAuth:    'Sacral Authority',

  profileSummary: `You hold a rare combination of deep strategic insight and genuine empathy — the kind that lets you build systems that actually serve people. Your Generator energy is most alive when responding to work that truly resonates: not initiating blindly, but waiting for the pull that feels right, then committing completely. The 3/5 profile means your real wisdom comes from lived experience and trial, not theory. You have a Martyr's resilience and a Heretic's magnetism — people look to you for solutions to problems they can't solve themselves. Your work needs to be meaningful or it will drain you, not grow you.`,

  careers: [
    {
      name:        'UX Research Lead',
      fit:         96,
      fitColor:    'bg-pixel-green',
      why:         'Your INFJ pattern-recognition and genuine user empathy make you exceptional at surfacing insight others miss. Generator energy means sustained deep work comes naturally when the problem matters.',
      firstAction: "Complete the Google UX Research Certificate or Nielsen Norman Group's UX Research program.",
      income:      'Rp 18M – 40M / month',
      growth:      'High — demand accelerating across tech and product-led companies',
      visible:     true,
    },
    {
      name:        'Organisational Development Consultant',
      fit:         91,
      fitColor:    'bg-pixel-blue',
      why:         '',
      firstAction: '',
      income:      '',
      growth:      '',
      visible:     false,
    },
    {
      name:        'Product Strategy Manager',
      fit:         88,
      fitColor:    'bg-pixel-gold',
      why:         '',
      firstAction: '',
      income:      '',
      growth:      '',
      visible:     false,
    },
  ],
}

const SIDEBAR_SECTIONS = [
  { id: '01', label: 'Profile Summary',       active: true,  locked: false },
  { id: '02', label: 'Capacity & Energy',     active: false, locked: false },
  { id: '03', label: 'Blind Spots',           active: false, locked: true  },
  { id: '04', label: 'Ideal Environment',     active: false, locked: true  },
  { id: '05', label: 'Career Paths',          active: false, locked: false },
  { id: '06', label: 'Long-Term Vision',      active: false, locked: true  },
  { id: '07', label: 'Skill Roadmap',         active: false, locked: true  },
  { id: '08', label: 'Decision Guide',        active: false, locked: true  },
  { id: '09', label: 'Action Plan',           active: false, locked: true  },
  { id: '10', label: 'Closing Statement',     active: false, locked: true  },
]

export function BlueprintPreviewSection() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Section header */}
        <AnimatedSection className="text-center">
          <div className="flex items-center gap-4 mb-6">
            <div className="pixel-divider flex-1" />
            <span className="font-press text-press-xs text-pixel-gold whitespace-nowrap">
              EXAMPLE BLUEPRINT
            </span>
            <div className="pixel-divider flex-1" />
          </div>
          <h2 className="font-pixel text-2xl sm:text-3xl text-pixel-text">
            This is what you'll receive
          </h2>
          <p className="font-body text-sm text-pixel-muted mt-3 max-w-lg mx-auto">
            A full codex built from your actual inputs. The sample below shows real report 
            content — the rest is revealed only in yours.
          </p>
        </AnimatedSection>

        {/* Codex preview frame */}
        <AnimatedSection delay={0.1}>
          <div className="pixel-panel overflow-hidden">

            {/* Codex header bar */}
            <div className="bg-pixel-bg border-b-2 border-pixel-gold px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="font-press text-[0.4rem] text-pixel-gold">◆ CAREER CODEX</span>
                <span className="hidden sm:inline pixel-divider-subtle w-px h-4 mx-0 my-0 inline-block" />
                <span className="hidden sm:inline font-press text-[0.38rem] text-pixel-muted">
                  PERSONAL CAREER BLUEPRINT
                </span>
              </div>
              <span className="pixel-tag">SAMPLE REPORT</span>
            </div>

            {/* Character title bar */}
            <div className="bg-pixel-panel/60 border-b border-pixel-border px-4 sm:px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-press text-[0.38rem] text-pixel-muted mb-1">CHARACTER CLASS</p>
                  <h3 className="font-pixel text-2xl sm:text-3xl text-pixel-gold">
                    {MOCK.characterTitle}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="pixel-tag">{MOCK.mbti}</span>
                  <span className="pixel-tag-blue">{MOCK.hdType}</span>
                  <span className="pixel-tag-muted">{MOCK.hdProfile}</span>
                  <span className="pixel-tag-muted">{MOCK.hdAuth}</span>
                </div>
              </div>
            </div>

            {/* Main codex body */}
            <div className="flex flex-col lg:flex-row min-h-0">

              {/* Sidebar navigation (desktop) */}
              <div className="hidden lg:block w-52 flex-shrink-0 border-r border-pixel-border bg-pixel-bg/40">
                <div className="p-3">
                  <p className="font-press text-[0.35rem] text-pixel-muted mb-3 uppercase tracking-widest px-1">
                    Sections
                  </p>
                  {SIDEBAR_SECTIONS.map((s) => (
                    <div
                      key={s.id}
                      className={`
                        flex items-center gap-2 px-2 py-2 mb-0.5 font-press text-[0.38rem] leading-tight
                        ${s.active
                          ? 'bg-pixel-gold/10 border-l-2 border-pixel-gold text-pixel-gold'
                          : 'text-pixel-muted border-l-2 border-transparent'
                        }
                      `}
                    >
                      <span className="text-[0.32rem] opacity-60">{s.id}</span>
                      <span className="flex-1">{s.label}</span>
                      {s.locked && (
                        <span className="text-[0.32rem] opacity-50">🔒</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content area */}
              <div className="flex-1 p-4 sm:p-6 space-y-8 overflow-hidden">

                {/* Section 01: Profile Summary */}
                <ReportSection number="01" title="Profile Summary">
                  <p className="font-body text-sm text-pixel-muted leading-relaxed">
                    {MOCK.profileSummary}
                  </p>
                </ReportSection>

                {/* Section 05: Career Paths */}
                <ReportSection number="05" title="Career Paths">
                  <div className="space-y-4">
                    {MOCK.careers.map((career, i) => (
                      career.visible ? (
                        <VisibleCareerCard key={i} career={career} rank={i + 1} />
                      ) : (
                        <LockedCareerCard key={i} career={career} rank={i + 1} />
                      )
                    ))}
                  </div>
                </ReportSection>

                {/* Locked section teaser */}
                <div className="border border-pixel-border bg-pixel-bg/40 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-press text-[0.4rem] text-pixel-muted">
                        + 8 more sections in your full blueprint
                      </p>
                      <p className="font-body text-xs text-pixel-muted mt-1">
                        Decision guide · Action plan · Skill roadmap · Long-term vision · and more
                      </p>
                    </div>
                    <span className="text-pixel-muted font-vt text-vt-xl opacity-30">🔒</span>
                  </div>
                </div>

                {/* In-preview CTA */}
                <div className="pt-2 text-center">
                  <Link href="/create">
                    <PixelButton variant="primary" size="lg">
                      ▶&nbsp; Generate My Blueprint
                    </PixelButton>
                  </Link>
                  <p className="font-press text-[0.4rem] text-pixel-muted mt-3">
                    Free · 5 min · Delivered to your email
                  </p>
                </div>

              </div>
            </div>

          </div>
        </AnimatedSection>

      </div>
    </section>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function ReportSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="font-press text-[0.38rem] text-pixel-gold bg-pixel-gold/10 border border-pixel-gold/30 px-2 py-1">
          {number}
        </span>
        <span className="font-press text-press-xs text-pixel-text">{title}</span>
        <div className="flex-1 h-px bg-pixel-border" />
      </div>
      {children}
    </div>
  )
}

function VisibleCareerCard({ career, rank }: { career: typeof MOCK.careers[0]; rank: number }) {
  return (
    <PixelPanel variant="subtle" padding="sm" className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-press text-[0.38rem] text-pixel-muted">#{rank}</span>
          <span className="font-press text-press-xs text-pixel-gold">{career.name}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-16 h-1.5 bg-pixel-bg border border-pixel-border overflow-hidden">
            <div className={`h-full ${career.fitColor}`} style={{ width: `${career.fit}%` }} />
          </div>
          <span className="font-press text-[0.38rem] text-pixel-gold">{career.fit}%</span>
          <span className="pixel-tag-green text-[0.36rem]">FIT</span>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <p className="font-press text-[0.36rem] text-pixel-muted mb-1 uppercase">Why it fits</p>
          <p className="font-body text-xs text-pixel-muted leading-relaxed">{career.why}</p>
        </div>
        <div className="space-y-2">
          <div>
            <p className="font-press text-[0.36rem] text-pixel-muted mb-1 uppercase">First action</p>
            <p className="font-body text-xs text-pixel-muted">{career.firstAction}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div>
              <p className="font-press text-[0.36rem] text-pixel-muted mb-0.5">Income</p>
              <p className="font-press text-[0.38rem] text-pixel-green">{career.income}</p>
            </div>
          </div>
        </div>
      </div>
    </PixelPanel>
  )
}

function LockedCareerCard({ career, rank }: { career: typeof MOCK.careers[0]; rank: number }) {
  return (
    <div className="border border-pixel-border bg-pixel-bg/30 p-3">
      {/* Header — blurred */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-press text-[0.38rem] text-pixel-muted">#{rank}</span>
          <span
            className="font-press text-press-xs text-pixel-text"
            style={{ filter: 'blur(6px)', userSelect: 'none' }}
          >
            {career.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-16 h-1.5 bg-pixel-bg border border-pixel-border overflow-hidden">
            <div
              className={`h-full ${career.fitColor} opacity-40`}
              style={{ width: `${career.fit}%`, filter: 'blur(2px)' }}
            />
          </div>
          <span
            className="font-press text-[0.38rem] text-pixel-muted"
            style={{ filter: 'blur(4px)', userSelect: 'none' }}
          >
            {career.fit}%
          </span>
          <span className="pixel-tag-muted text-[0.36rem]">FIT</span>
        </div>
      </div>

      {/* Content — blurred */}
      <div style={{ filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' }}>
        <p className="font-body text-xs text-pixel-muted leading-relaxed">
          Your unique combination of strategic thinking and empathic communication positions
          you exceptionally well for this role. The career path rewards depth and long-term
          relationship building — both of which come naturally from your design.
        </p>
      </div>
    </div>
  )
}
