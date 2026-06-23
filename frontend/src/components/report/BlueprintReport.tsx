'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

import { PixelPanel }  from '@/components/ui/PixelPanel'
import { PixelButton } from '@/components/ui/PixelButton'
import { ReportHero }  from '@/components/report/ReportHero'
import { CareerCard }  from '@/components/report/CareerCard'
import { config }      from '@/lib/config'
import type { BlueprintReportResponse } from '@/lib/types'

// ─── Text utilities ────────────────────────────────────────────────────────────

function toBullets(text: string, limit = 5): string[] {
  if (!text) return []
  let parts = text.split(/\n\n+/)
  if (parts.length <= 1) parts = text.split(/\n/)
  if (parts.length <= 1) parts = text.split(/\.\s+(?=[A-Z])/)
  return parts
    .map(s => s.trim().replace(/\.$/, ''))
    .filter(s => s.length > 12)
    .slice(0, limit)
    .map(s => s.length > 160 ? s.slice(0, 160) + '…' : s)
}

// ─── MBTI parser ───────────────────────────────────────────────────────────────

function parseMBTI(type: string) {
  if (!type || type === 'UNKNOWN' || type.length !== 4) return null
  return [
    { a: 'I', b: 'E', active: type[0], aLabel: 'Introvert',  bLabel: 'Extravert'  },
    { a: 'N', b: 'S', active: type[1], aLabel: 'Intuitive',  bLabel: 'Sensing'    },
    { a: 'F', b: 'T', active: type[2], aLabel: 'Feeling',    bLabel: 'Thinking'   },
    { a: 'J', b: 'P', active: type[3], aLabel: 'Judging',    bLabel: 'Perceiving' },
  ]
}

// ─── HD lookup ─────────────────────────────────────────────────────────────────

const HD_ENERGY: Record<string, {
  badge: string; strategy: string; recharge: string; drain: string; signal: string
}> = {
  'Generator': {
    badge:'SUSTAINABLE', strategy:'Wait to Respond',
    recharge:'Work that genuinely excites you',
    drain:'Initiating without authentic pull',
    signal:'Gut response — uh-huh / uh-uh',
  },
  'Manifesting Generator': {
    badge:'HIGH-VOLUME', strategy:'Wait to Respond → Inform',
    recharge:'Multiple simultaneous workstreams',
    drain:'Single-track linear execution',
    signal:'Gut response, then inform before acting',
  },
  'Projector': {
    badge:'FOCUSED', strategy:'Wait for the Invitation',
    recharge:'Recognition and guiding others',
    drain:'Sustained output at Generator pace',
    signal:'Specific invitations from the right people',
  },
  'Manifestor': {
    badge:'INITIATING', strategy:'Inform before acting',
    recharge:'Acting on independent initiative',
    drain:'Asking permission or being controlled',
    signal:'Inner urge to initiate something new',
  },
  'Reflector': {
    badge:'LUNAR', strategy:'Wait a full 28-day cycle',
    recharge:'Healthy environments and quality people',
    drain:'Wrong environments or rushed decisions',
    signal:'28-day cycle of sampling perspectives',
  },
}

// ─── Primitives ────────────────────────────────────────────────────────────────

function Panel({ num, label, accent = 'border-pixel-gold', children, className = '' }: {
  num?: string; label: string; accent?: string; children: React.ReactNode; className?: string
}) {
  return (
    <div className={`border-2 ${accent} bg-pixel-panel shadow-pixel ${className}`}>
      <div className="bg-pixel-bg border-b border-pixel-border px-3 py-2 flex items-center gap-2">
        {num && <span className="font-press text-[0.34rem] text-pixel-muted opacity-60">{num}</span>}
        <span className="font-press text-[0.42rem] text-pixel-gold tracking-wider">{label}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function Bullet({ text, prefix = '▸', color = 'text-pixel-gold' }: {
  text: string; prefix?: string; color?: string
}) {
  return (
    <div className="flex gap-2.5 py-1">
      <span className={`font-press text-[0.4rem] flex-shrink-0 mt-0.5 ${color}`}>{prefix}</span>
      <span className="font-body text-[13px] text-pixel-text leading-snug">{text}</span>
    </div>
  )
}

// ─── Section panels ────────────────────────────────────────────────────────────

function CharacterStatsPanel({ report }: { report: BlueprintReportResponse }) {
  const dims    = parseMBTI(report.submission.mbti_type)
  const bullets = toBullets(report.report_data.profile_summary, 4)
  return (
    <Panel num="01" label="CHARACTER STATS" accent="border-pixel-gold">
      {dims && (
        <div className="space-y-2 mb-4">
          <p className="font-press text-[0.36rem] text-pixel-muted mb-2 uppercase tracking-widest">
            Personality Dimensions
          </p>
          {dims.map(d => {
            const activeA = d.active === d.a
            return (
              <div key={d.a} className="flex items-center gap-2">
                <span className={`font-press text-[0.38rem] w-4 flex-shrink-0 text-right ${activeA ? 'text-pixel-gold' : 'text-pixel-muted'}`}>{d.a}</span>
                <div className="flex-1 h-1.5 bg-pixel-bg border border-pixel-border overflow-hidden">
                  <div className="h-full bg-pixel-gold" style={{ width: activeA ? '70%' : '30%' }} />
                </div>
                <span className={`font-press text-[0.38rem] w-4 flex-shrink-0 ${!activeA ? 'text-pixel-gold' : 'text-pixel-muted'}`}>{d.b}</span>
                <span className="font-press text-[0.36rem] text-pixel-muted w-20 flex-shrink-0">{activeA ? d.aLabel : d.bLabel}</span>
              </div>
            )
          })}
        </div>
      )}
      <div className="pixel-divider-subtle" />
      <div className="space-y-0.5 mt-3">
        <p className="font-press text-[0.36rem] text-pixel-muted mb-2 uppercase tracking-widest">Profile Snapshot</p>
        {bullets.map((b, i) => <Bullet key={i} text={b} />)}
      </div>
    </Panel>
  )
}

function EnergyPanel({ report }: { report: BlueprintReportResponse }) {
  const hdType   = report.submission.hd_type
  const hdAuth   = report.submission.hd_authority
  const energy   = HD_ENERGY[hdType]
  const capacity = toBullets(report.report_data.capacity_and_energy, 3)
  const rows = energy ? [
    { label: 'STRATEGY', value: energy.strategy  },
    { label: 'RECHARGE', value: energy.recharge  },
    { label: 'DRAIN',    value: energy.drain     },
    { label: 'SIGNAL',   value: energy.signal    },
  ] : []
  return (
    <Panel num="02" label="ENERGY PROFILE" accent="border-pixel-blue">
      <div className="mb-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {hdType !== 'UNKNOWN' && <span className="pixel-tag-blue">{hdType}</span>}
          {hdAuth !== 'UNKNOWN' && <span className="pixel-tag-muted">{hdAuth}</span>}
          {energy && <span className="pixel-tag">{energy.badge}</span>}
        </div>
        <div className="space-y-2">
          {rows.map(row => (
            <div key={row.label} className="flex gap-3 items-start">
              <span className="font-press text-[0.34rem] text-pixel-muted flex-shrink-0 w-14 mt-0.5">{row.label}</span>
              <span className="font-body text-[12px] text-pixel-text leading-snug">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
      {capacity.length > 0 && (
        <>
          <div className="pixel-divider-subtle" />
          <div className="space-y-0.5 mt-3">
            <p className="font-press text-[0.36rem] text-pixel-muted mb-2 uppercase tracking-widest">At Your Best</p>
            {capacity.map((b, i) => <Bullet key={i} text={b} prefix="⚡" color="text-pixel-blue" />)}
          </div>
        </>
      )}
    </Panel>
  )
}

function BlindSpotsPanel({ text }: { text: string }) {
  const warnings = toBullets(text, 5)
  return (
    <Panel num="03" label="BLIND SPOTS" accent="border-pixel-error">
      <div className="space-y-0.5">
        {warnings.map((w, i) => <Bullet key={i} text={w} prefix="⚠" color="text-pixel-error" />)}
      </div>
    </Panel>
  )
}

function EnvironmentPanel({ text }: { text: string }) {
  const all      = toBullets(text, 7)
  const positive = all.filter(s => !/\b(avoid|not |without |refrain|resist|unless)\b/i.test(s))
  const negative = all.filter(s =>  /\b(avoid|not |without |refrain|resist|unless)\b/i.test(s))
  const useAll   = positive.length === 0 && negative.length === 0
  return (
    <Panel num="04" label="OPTIMAL ENVIRONMENT" accent="border-pixel-green">
      <div className="space-y-0.5">
        {(useAll ? all : positive).map((s, i) => <Bullet key={`p${i}`} text={s} prefix="✓" color="text-pixel-green" />)}
        {negative.map((s, i) => <Bullet key={`n${i}`} text={s} prefix="✗" color="text-pixel-error" />)}
      </div>
    </Panel>
  )
}

function CareerQuestsPanel({ recs }: { recs: BlueprintReportResponse['report_data']['career_recommendations'] }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="font-press text-[0.4rem] text-pixel-gold bg-pixel-gold/10 border border-pixel-gold/30 px-2 py-1">05</span>
        <span className="font-press text-press-xs text-pixel-text">CAREER QUESTS</span>
        <div className="flex-1 h-px bg-pixel-border" />
        <span className="font-press text-[0.36rem] text-pixel-muted">{recs.length} paths unlocked</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recs.map((rec, i) => <CareerCard key={i} rec={rec} rank={i + 1} />)}
      </div>
    </div>
  )
}

function VisionPanel({ text }: { text: string }) {
  const points = toBullets(text, 4)
  const nodes  = ['NOW', '6 MO', '1 YR', '3 YRS', '5 YRS']
  return (
    <Panel num="06" label="LONG-TERM VISION" accent="border-pixel-blue">
      <div className="hidden sm:flex items-center gap-0 mb-5">
        {nodes.map((node, i) => (
          <div key={node} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-2 h-2 bg-pixel-blue flex-shrink-0" />
              <span className="font-press text-[0.32rem] text-pixel-muted whitespace-nowrap">{node}</span>
            </div>
            {i < nodes.length - 1 && <div className="flex-1 h-px bg-pixel-border mx-1" />}
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        {points.map((p, i) => (
          <div key={i} className="flex gap-3">
            <span className="font-press text-[0.36rem] text-pixel-blue opacity-60 flex-shrink-0 w-5 mt-0.5">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="font-body text-[13px] text-pixel-text leading-snug">{p}</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function SkillPanel({ text }: { text: string }) {
  const skills = toBullets(text, 5)
  return (
    <Panel num="07" label="SKILL ROADMAP" accent="border-pixel-border">
      <div className="space-y-2">
        {skills.map((s, i) => (
          <div key={i} className="flex gap-3 items-start">
            <span className="font-press text-[0.36rem] text-pixel-bg bg-pixel-gold px-1.5 py-0.5 flex-shrink-0 leading-tight">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="font-body text-[13px] text-pixel-text leading-snug pt-0.5">{s}</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function DecisionPanel({ text, authority }: { text: string; authority: string }) {
  const steps = toBullets(text, 5)
  return (
    <Panel num="08" label="DECISION GUIDE" accent="border-pixel-border">
      {authority !== 'UNKNOWN' && (
        <div className="mb-3 pb-3 border-b border-pixel-border">
          <p className="font-press text-[0.36rem] text-pixel-muted mb-1">AUTHORITY</p>
          <p className="font-press text-press-xs text-pixel-gold">{authority}</p>
        </div>
      )}
      <div className="space-y-0.5">
        {steps.map((s, i) => <Bullet key={i} text={s} prefix="▸" color="text-pixel-gold" />)}
      </div>
    </Panel>
  )
}

function ActionPlanPanel({ items }: { items: string[] }) {
  return (
    <Panel num="09" label="QUEST OBJECTIVES" accent="border-pixel-gold">
      <ol className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-4">
            <span className="font-press text-[0.38rem] text-pixel-bg bg-pixel-gold px-2 py-1 flex-shrink-0 h-fit leading-tight">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="font-body text-[14px] text-pixel-text leading-snug pt-0.5">{item}</span>
          </li>
        ))}
      </ol>
    </Panel>
  )
}

function ClosingPanel({ text }: { text: string }) {
  return (
    <Panel num="10" label="CLOSING" accent="border-pixel-gold">
      <div className="border-l-2 border-pixel-gold pl-4">
        <p className="font-pixel text-xl text-pixel-text leading-relaxed">{text}</p>
      </div>
    </Panel>
  )
}

// ─── Loading / error screens ───────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen bg-pixel-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <PixelPanel>
          <div className="text-center space-y-6 py-4">
            <div className="font-vt text-vt-3xl text-pixel-gold animate-pixel-float">◆</div>
            <div>
              <p className="font-press text-press-xs text-pixel-gold mb-2">CAREER CODEX</p>
              <p className="font-press text-[0.4rem] text-pixel-muted uppercase tracking-widest">Retrieving your blueprint…</p>
            </div>
            <div className="h-2 bg-pixel-bg border border-pixel-border overflow-hidden">
              <motion.div className="h-full bg-pixel-gold" initial={{ width: '0%' }} animate={{ width: '100%' }}
                transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity }} />
            </div>
          </div>
        </PixelPanel>
      </div>
    </motion.div>
  )
}

function NotFoundScreen() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-pixel-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-7">
        <div className="font-vt text-vt-4xl text-pixel-muted">✕</div>
        <PixelPanel>
          <h1 className="font-press text-press-sm text-pixel-text mb-3">Codex Not Found</h1>
          <p className="font-body text-sm text-pixel-muted leading-relaxed mb-5">
            This blueprint link is invalid or doesn&rsquo;t exist. Check your email for the correct link.
          </p>
          <Link href="/"><PixelButton variant="secondary" size="md">◀ Back to Home</PixelButton></Link>
        </PixelPanel>
      </div>
    </motion.div>
  )
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-pixel-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-7">
        <div className="font-vt text-vt-4xl text-pixel-error">!</div>
        <PixelPanel>
          <h1 className="font-press text-press-sm text-pixel-error mb-3">Something Went Wrong</h1>
          <p className="font-body text-sm text-pixel-muted mb-1">We couldn&rsquo;t load your blueprint.</p>
          {message && <p className="font-press text-[0.38rem] text-pixel-muted mb-5">Error: {message}</p>}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <PixelButton variant="primary" size="sm" onClick={() => window.location.reload()}>↺ Retry</PixelButton>
            <Link href="/"><PixelButton variant="ghost" size="sm">◀ Home</PixelButton></Link>
          </div>
        </PixelPanel>
      </div>
    </motion.div>
  )
}

// ─── Top bar ───────────────────────────────────────────────────────────────────

function TopBar({ nickname }: { nickname: string }) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-pixel-gold bg-pixel-panel/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-pixel-gold flex items-center justify-center flex-shrink-0"
               style={{ boxShadow: '2px 2px 0px #C4A033' }}>
            <span className="font-press text-[0.38rem] text-pixel-bg">CC</span>
          </div>
          <span className="font-press text-[0.42rem] text-pixel-gold hidden sm:block">CAREER CODEX</span>
          <span className="font-press text-[0.34rem] text-pixel-border hidden sm:block">·</span>
          <span className="font-press text-[0.38rem] text-pixel-muted hidden sm:block">{nickname}</span>
        </div>
        <Link href="/"><PixelButton variant="ghost" size="sm">◀ Home</PixelButton></Link>
      </div>
    </header>
  )
}

// ─── Full report screen ────────────────────────────────────────────────────────

function ReportScreen({ report }: { report: BlueprintReportResponse }) {
  const { report_data: rd, submission: sub } = report
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}
      className="min-h-screen bg-pixel-bg">
      <TopBar nickname={sub.nickname} />
      <ReportHero report={report} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CharacterStatsPanel report={report} />
          <EnergyPanel report={report} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <BlindSpotsPanel text={rd.blind_spots} />
          <EnvironmentPanel text={rd.ideal_work_environment} />
        </div>
        <CareerQuestsPanel recs={rd.career_recommendations} />
        <ActionPlanPanel items={rd.action_plan} />
        <VisionPanel text={rd.long_term_vision} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SkillPanel text={rd.skill_development_roadmap} />
          <DecisionPanel text={rd.decision_making_guide} authority={sub.hd_authority} />
        </div>
        <ClosingPanel text={rd.closing_statement} />
        <div className="text-center pt-4 pb-8 space-y-3">
          <div className="pixel-divider" />
          <p className="font-press text-[0.38rem] text-pixel-muted">◆ CHARACTER CAREER BLUEPRINT · Prepared for {sub.nickname}</p>
          <div className="flex justify-center gap-4">
            <Link href="/"><PixelButton variant="secondary" size="sm">◀ Home</PixelButton></Link>
            <Link href="/create"><PixelButton variant="ghost" size="sm">▶ New Blueprint</PixelButton></Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

type FetchState = 'loading' | 'not-found' | 'error' | 'ready'

export function BlueprintReport({ token }: { token: string }) {
  const [state,  setState]  = useState<FetchState>('loading')
  const [report, setReport] = useState<BlueprintReportResponse | null>(null)
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    fetch(`${config.api.baseUrl}/api/reports/${token}`)
      .then(res => {
        if (res.status === 404) { setState('not-found'); return null }
        if (!res.ok) throw new Error(`Server returned ${res.status}`)
        return res.json() as Promise<BlueprintReportResponse>
      })
      .then(data => { if (data) { setReport(data); setState('ready') } })
      .catch((err: Error) => { setErrMsg(err.message); setState('error') })
  }, [token])

  return (
    <AnimatePresence mode="wait">
      {state === 'loading'   && <LoadingScreen   key="loading" />}
      {state === 'not-found' && <NotFoundScreen  key="not-found" />}
      {state === 'error'     && <ErrorScreen     key="error" message={errMsg} />}
      {state === 'ready' && report && <ReportScreen key="report" report={report} />}
    </AnimatePresence>
  )
}
