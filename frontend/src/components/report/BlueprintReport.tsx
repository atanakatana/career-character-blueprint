'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

import { PixelPanel }   from '@/components/ui/PixelPanel'
import { PixelButton }  from '@/components/ui/PixelButton'
import { ReportHero }   from '@/components/report/ReportHero'
import { ReportSidebar } from '@/components/report/ReportSidebar'
import { CareerCard }   from '@/components/report/CareerCard'

import { config }       from '@/lib/config'
import type { BlueprintReportResponse, ReportData } from '@/lib/types'

// ── Section manifest ──────────────────────────────────────────────────────────
// Drives both the sidebar navigation and content rendering order.
type SectionKey = keyof ReportData

const SECTIONS: { id: string; num: string; label: string; key: SectionKey }[] = [
  { id: 'profile-summary',  num: '01', label: 'Profile Summary',   key: 'profile_summary' },
  { id: 'capacity-energy',  num: '02', label: 'Capacity & Energy',  key: 'capacity_and_energy' },
  { id: 'blind-spots',      num: '03', label: 'Blind Spots',       key: 'blind_spots' },
  { id: 'work-environment', num: '04', label: 'Ideal Environment',  key: 'ideal_work_environment' },
  { id: 'career-paths',     num: '05', label: 'Career Paths',      key: 'career_recommendations' },
  { id: 'long-term-vision', num: '06', label: 'Long-Term Vision',  key: 'long_term_vision' },
  { id: 'skill-roadmap',    num: '07', label: 'Skill Roadmap',     key: 'skill_development_roadmap' },
  { id: 'decision-guide',   num: '08', label: 'Decision Guide',    key: 'decision_making_guide' },
  { id: 'action-plan',      num: '09', label: 'Action Plan',       key: 'action_plan' },
  { id: 'closing',          num: '10', label: 'Closing',           key: 'closing_statement' },
]

// ── Main component ─────────────────────────────────────────────────────────────
type FetchState = 'loading' | 'not-found' | 'error' | 'ready'

export function BlueprintReport({ token }: { token: string }) {
  const [state,  setState]  = useState<FetchState>('loading')
  const [report, setReport] = useState<BlueprintReportResponse | null>(null)
  const [errMsg, setErrMsg] = useState<string>('')

  useEffect(() => {
    fetch(`${config.api.baseUrl}/api/reports/${token}`)
      .then((res) => {
        if (res.status === 404) { setState('not-found'); return null }
        if (!res.ok) throw new Error(`Server returned ${res.status}`)
        return res.json() as Promise<BlueprintReportResponse>
      })
      .then((data) => {
        if (data) { setReport(data); setState('ready') }
      })
      .catch((err: Error) => {
        setErrMsg(err.message)
        setState('error')
      })
  }, [token])

  return (
    <AnimatePresence mode="wait">
      {state === 'loading'   && <LoadingScreen key="loading" />}
      {state === 'not-found' && <NotFoundScreen key="not-found" />}
      {state === 'error'     && <ErrorScreen key="error" message={errMsg} />}
      {state === 'ready' && report && (
        <ReportScreen key="report" report={report} />
      )}
    </AnimatePresence>
  )
}

// ── Loading ────────────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-pixel-bg flex items-center justify-center px-4"
    >
      <div className="w-full max-w-sm">
        <PixelPanel>
          <div className="text-center space-y-6 py-4">
            <div className="font-vt text-vt-3xl text-pixel-gold animate-pixel-float">◆</div>
            <div>
              <p className="font-press text-press-xs text-pixel-gold mb-2">CAREER CODEX</p>
              <p className="font-press text-[0.4rem] text-pixel-muted uppercase tracking-widest">
                Retrieving your blueprint…
              </p>
            </div>
            {/* Pixel progress bar */}
            <div className="h-2 bg-pixel-bg border border-pixel-border overflow-hidden">
              <motion.div
                className="h-full bg-pixel-gold"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity }}
              />
            </div>
          </div>
        </PixelPanel>
      </div>
    </motion.div>
  )
}

// ── Not found ──────────────────────────────────────────────────────────────────
function NotFoundScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-pixel-bg flex items-center justify-center px-4"
    >
      <div className="max-w-md w-full text-center space-y-7">
        <div className="font-vt text-vt-4xl text-pixel-muted">✕</div>
        <PixelPanel>
          <h1 className="font-press text-press-sm text-pixel-text mb-3">
            Codex Not Found
          </h1>
          <p className="font-body text-sm text-pixel-muted leading-relaxed mb-5">
            This blueprint link is invalid or doesn&rsquo;t exist.
            Check your email for the correct link, or start a new blueprint below.
          </p>
          <Link href="/">
            <PixelButton variant="secondary" size="md">◀ Back to Home</PixelButton>
          </Link>
        </PixelPanel>
      </div>
    </motion.div>
  )
}

// ── Error ──────────────────────────────────────────────────────────────────────
function ErrorScreen({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-pixel-bg flex items-center justify-center px-4"
    >
      <div className="max-w-md w-full text-center space-y-7">
        <div className="font-vt text-vt-4xl text-pixel-error">!</div>
        <PixelPanel>
          <h1 className="font-press text-press-sm text-pixel-error mb-3">
            Something Went Wrong
          </h1>
          <p className="font-body text-sm text-pixel-muted leading-relaxed mb-1">
            We couldn&rsquo;t load your blueprint right now.
          </p>
          {message && (
            <p className="font-press text-[0.38rem] text-pixel-muted mb-5">
              Error: {message}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <PixelButton variant="primary" size="sm" onClick={() => window.location.reload()}>
              ↺ Retry
            </PixelButton>
            <Link href="/">
              <PixelButton variant="ghost" size="sm">◀ Home</PixelButton>
            </Link>
          </div>
        </PixelPanel>
      </div>
    </motion.div>
  )
}

// ── Full report ────────────────────────────────────────────────────────────────
function ReportScreen({ report }: { report: BlueprintReportResponse }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-pixel-bg"
    >
      {/* Top bar */}
      <ReportTopBar nickname={report.submission.nickname} />

      {/* Hero */}
      <ReportHero report={report} />

      {/* Mobile section tabs */}
      <div className="lg:hidden border-b border-pixel-border bg-pixel-panel/50 overflow-x-auto">
        <div className="flex gap-0 min-w-max px-4 py-0">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                const el = document.getElementById(s.id)
                if (el) {
                  const y = el.getBoundingClientRect().top + window.scrollY - 110
                  window.scrollTo({ top: y, behavior: 'smooth' })
                }
              }}
              className="font-press text-[0.38rem] text-pixel-muted hover:text-pixel-gold px-3 py-3 whitespace-nowrap border-b-2 border-transparent hover:border-pixel-gold transition-colors"
            >
              {s.num} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex gap-8 items-start">

          {/* Sidebar — desktop only */}
          <div className="hidden lg:block w-52 flex-shrink-0">
            <ReportSidebar sections={SECTIONS} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-10">
            {SECTIONS.map((section, i) => (
              <motion.div
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                {section.key === 'career_recommendations' ? (
                  <CareerSection recs={report.report_data.career_recommendations} section={section} />
                ) : section.key === 'action_plan' ? (
                  <ActionPlanSection items={report.report_data.action_plan} section={section} />
                ) : section.key === 'closing_statement' ? (
                  <ClosingSection text={report.report_data.closing_statement} section={section} />
                ) : (
                  <TextSection
                    section={section}
                    text={report.report_data[section.key] as string}
                  />
                )}
              </motion.div>
            ))}

            {/* Report footer */}
            <ReportFooter report={report} />
          </div>

        </div>
      </div>
    </motion.div>
  )
}

// ── Top bar ────────────────────────────────────────────────────────────────────
function ReportTopBar({ nickname }: { nickname: string }) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-pixel-gold bg-pixel-panel/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 bg-pixel-gold flex items-center justify-center flex-shrink-0"
            style={{ boxShadow: '2px 2px 0px #C4A033' }}
          >
            <span className="font-press text-[0.38rem] text-pixel-bg">CC</span>
          </div>
          <span className="font-press text-[0.42rem] text-pixel-gold hidden sm:block">
            CAREER CODEX
          </span>
          <span className="font-press text-[0.34rem] text-pixel-border hidden sm:block">·</span>
          <span className="font-press text-[0.38rem] text-pixel-muted hidden sm:block">
            {nickname}
          </span>
        </div>
        <Link href="/">
          <PixelButton variant="ghost" size="sm">
            ◀ Home
          </PixelButton>
        </Link>
      </div>
    </header>
  )
}

// ── Section header ─────────────────────────────────────────────────────────────
function SectionHeader({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="font-press text-[0.4rem] text-pixel-gold bg-pixel-gold/10 border border-pixel-gold/30 px-2 py-1 flex-shrink-0">
        {num}
      </span>
      <span className="font-press text-press-xs text-pixel-text">{label}</span>
      <div className="flex-1 h-px bg-pixel-border" />
    </div>
  )
}

// ── Prose paragraphs ───────────────────────────────────────────────────────────
function Prose({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div className="space-y-4">
      {paragraphs.map((para, i) => (
        <p key={i} className="font-body text-[15px] text-pixel-text leading-relaxed">
          {para}
        </p>
      ))}
    </div>
  )
}

// ── Text section (most sections) ───────────────────────────────────────────────
function TextSection({
  section,
  text,
}: {
  section: { num: string; label: string }
  text: string
}) {
  return (
    <PixelPanel variant="subtle">
      <SectionHeader num={section.num} label={section.label} />
      <Prose text={text} />
    </PixelPanel>
  )
}

// ── Career recommendations section ─────────────────────────────────────────────
function CareerSection({
  recs,
  section,
}: {
  recs: BlueprintReportResponse['report_data']['career_recommendations']
  section: { num: string; label: string }
}) {
  return (
    <div>
      {/* Section header sits above the cards, not inside a panel */}
      <div className="flex items-center gap-3 mb-5">
        <span className="font-press text-[0.4rem] text-pixel-gold bg-pixel-gold/10 border border-pixel-gold/30 px-2 py-1 flex-shrink-0">
          {section.num}
        </span>
        <span className="font-press text-press-xs text-pixel-text">{section.label}</span>
        <div className="flex-1 h-px bg-pixel-border" />
      </div>
      <div className="space-y-5">
        {recs.map((rec, i) => (
          <CareerCard key={i} rec={rec} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}

// ── Action plan section ─────────────────────────────────────────────────────────
function ActionPlanSection({
  items,
  section,
}: {
  items: string[]
  section: { num: string; label: string }
}) {
  return (
    <PixelPanel variant="subtle">
      <SectionHeader num={section.num} label={section.label} />
      <ol className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex gap-4">
            <span className="font-press text-[0.4rem] text-pixel-gold flex-shrink-0 mt-1 w-6">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex-1 border-l border-pixel-border pl-4">
              <p className="font-body text-[15px] text-pixel-text leading-relaxed">{item}</p>
            </div>
          </li>
        ))}
      </ol>
    </PixelPanel>
  )
}

// ── Closing section ─────────────────────────────────────────────────────────────
function ClosingSection({
  text,
  section,
}: {
  text: string
  section: { num: string; label: string }
}) {
  return (
    <PixelPanel variant="default">
      <SectionHeader num={section.num} label={section.label} />
      <div className="border-l-2 border-pixel-gold pl-4">
        <p className="font-pixel text-xl text-pixel-text leading-relaxed">{text}</p>
      </div>
    </PixelPanel>
  )
}

// ── Report footer ───────────────────────────────────────────────────────────────
function ReportFooter({ report }: { report: BlueprintReportResponse }) {
  return (
    <div className="border-t-2 border-pixel-border pt-8 text-center space-y-4">
      <div className="pixel-divider" />
      <p className="font-press text-[0.4rem] text-pixel-muted">
        ◆ CHARACTER CAREER BLUEPRINT
      </p>
      <p className="font-body text-sm text-pixel-muted">
        This report was prepared exclusively for{' '}
        <span className="text-pixel-text">{report.submission.nickname}</span>.
        Your blueprint link never expires.
      </p>
      <div className="flex justify-center gap-4 pt-2">
        <Link href="/">
          <PixelButton variant="secondary" size="sm">
            ◀ Home
          </PixelButton>
        </Link>
        <Link href="/create">
          <PixelButton variant="ghost" size="sm">
            ▶ New Blueprint
          </PixelButton>
        </Link>
      </div>
    </div>
  )
}
