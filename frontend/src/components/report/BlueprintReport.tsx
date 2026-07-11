'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

import { PixelPanel }   from '@/components/ui/PixelPanel'
import { PixelButton }  from '@/components/ui/PixelButton'
import { ReportHero }   from '@/components/report/ReportHero'
import { CareerCard }   from '@/components/report/CareerCard'
import { config }       from '@/lib/config'
import type { BlueprintReportResponse, WorkEnvironment } from '@/lib/types'

// ─── v1 backward-compat helpers ───────────────────────────────────────────────
// v2 reports store structured arrays. v1 reports stored prose strings.
// These helpers normalise both so old reports don't crash.

function toBullets(text: string, limit = 5): string[] {
  let parts = text.split(/\n\n+/)
  if (parts.length <= 1) parts = text.split(/\n/)
  if (parts.length <= 1) parts = text.split(/\.\s+(?=[A-Z])/)
  return parts
    .map(s => s.trim().replace(/\.$/, ''))
    .filter(s => s.length > 12)
    .slice(0, limit)
    .map(s => s.length > 180 ? s.slice(0, 180) + '…' : s)
}

/** Accept v2 array or fall back to prose splitting for v1. */
function asBullets(value: string[] | string, limit = 5): string[] {
  if (Array.isArray(value)) return value.slice(0, limit)
  return toBullets(value, limit)
}

/** Accept v2 WorkEnvironment object or heuristic-split v1 prose. */
function asEnvironment(value: WorkEnvironment | string): WorkEnvironment {
  if (typeof value === 'object' && value !== null && 'pros' in value) return value
  const all  = toBullets(value as string, 7)
  const cons = all.filter(s => /\b(avoid|not |without |refrain|resist)\b/i.test(s))
  const pros = all.filter(s => !/\b(avoid|not |without |refrain|resist)\b/i.test(s))
  return { pros: pros.length ? pros : all, cons }
}

// ─── MBTI parser ────────────────────────────────────────────────────────────
function parseMBTI(type: string) {
  if (!type || type === 'UNKNOWN' || type.length !== 4) return null
  return [
    { a: 'I', b: 'E', active: type[0], aLabel: 'Introvert',  bLabel: 'Extravert'  },
    { a: 'N', b: 'S', active: type[1], aLabel: 'Intuitive',  bLabel: 'Sensing'    },
    { a: 'F', b: 'T', active: type[2], aLabel: 'Feeling',    bLabel: 'Thinking'   },
    { a: 'J', b: 'P', active: type[3], aLabel: 'Judging',    bLabel: 'Perceiving' },
  ]
}

// ─── HD energy lookup ────────────────────────────────────────────────────────
const HD_ENERGY: Record<string, { badge: string; strategy: string; recharge: string; drain: string; signal: string }> = {
  'Generator':             { badge:'SUSTAINABLE', strategy:'Wait to Respond',         recharge:'Work that genuinely excites you',    drain:'Initiating without authentic pull',     signal:'Gut yes/no — uh-huh / uh-uh'             },
  'Manifesting Generator': { badge:'HIGH-VOLUME',  strategy:'Wait to Respond → Inform', recharge:'Multiple simultaneous workstreams', drain:'Single-track linear execution',        signal:'Gut response, then inform before acting'  },
  'Projector':             { badge:'FOCUSED',      strategy:'Wait for the Invitation',  recharge:'Recognition and guiding others',   drain:'Sustained output at Generator pace',   signal:'Specific invitations from right people'  },
  'Manifestor':            { badge:'INITIATING',   strategy:'Inform before acting',     recharge:'Acting on independent initiative', drain:'Asking permission or being controlled', signal:'Inner urge to initiate something new'     },
  'Reflector':             { badge:'LUNAR',        strategy:'Wait a full 28-day cycle', recharge:'Healthy environments + quality people', drain:'Wrong environments or rushed decisions', signal:'28-day cycle of sampling perspectives' },
}

// ─── Shared primitives ───────────────────────────────────────────────────────

function Panel({ num, icon, label, accent = 'border-pixel-gold', children, className = '' }: {
  num?: string; icon?: string; label: string; accent?: string
  children: React.ReactNode; className?: string
}) {
  return (
    <div className={`border-2 ${accent} bg-pixel-panel ${className}`}
         style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.7)' }}>
      <div className="border-b-2 border-b-[inherit] bg-pixel-bg px-5 py-4 flex items-center gap-4"
           style={{ backgroundImage: 'linear-gradient(180deg,rgba(245,197,66,0.06) 0%,transparent 100%)' }}>
        {icon && <span className="text-2xl flex-shrink-0">{icon}</span>}
        {num  && <span className="font-press text-xs text-pixel-muted opacity-60">{num}</span>}
        <span className="font-press text-sm text-pixel-gold tracking-wider">{label}</span>
      </div>
      <div className="p-5 sm:p-7">{children}</div>
    </div>
  )
}

function PixelBar({ fillPct, color = 'bg-pixel-gold' }: { fillPct: number; color?: string }) {
  return (
    <div className="flex-1 h-6 bg-pixel-bg border-2 border-pixel-border overflow-hidden relative">
      <div className={`absolute inset-y-0 left-0 ${color}`} style={{ width: `${fillPct}%` }} />
      <div className="absolute inset-0 pointer-events-none"
           style={{ backgroundImage: 'repeating-linear-gradient(90deg,transparent,transparent 8px,rgba(0,0,0,0.22) 8px,rgba(0,0,0,0.22) 10px)' }} />
    </div>
  )
}

function Bullet({ text, prefix = '▸', color = 'text-pixel-gold' }: {
  text: string; prefix?: string; color?: string
}) {
  return (
    <div className="flex gap-4 py-3 border-b border-pixel-border last:border-0 items-start">
      <span className={`text-2xl flex-shrink-0 leading-none mt-0.5 ${color}`}>{prefix}</span>
      <span className="font-body text-base text-pixel-text leading-relaxed">{text}</span>
    </div>
  )
}

// ─── Section panels ──────────────────────────────────────────────────────────

function CharacterSheetPanel({ report }: { report: BlueprintReportResponse }) {
  const { submission: sub, report_data: rd } = report
  const dims    = parseMBTI(sub.mbti_type)
  const bullets = asBullets(rd.profile_summary, 4)
  const hdProfile = sub.hd_profile !== 'UNKNOWN' && sub.hd_profile.includes('—')
    ? sub.hd_profile.split('—')[0].trim() : sub.hd_profile

  return (
    <Panel num="01" icon="⚔" label="CHARACTER SHEET" accent="border-pixel-gold">
      <div className="flex flex-col sm:flex-row gap-6">

        {/* Portrait box */}
        <div className="flex-shrink-0 border-2 border-pixel-gold bg-pixel-bg p-5 text-center sm:w-44"
             style={{ boxShadow: 'inset 2px 2px 0px rgba(245,197,66,0.12)' }}>
          <p className="font-press text-xs text-pixel-muted mb-3 uppercase tracking-widest">Class</p>
          {sub.mbti_type !== 'UNKNOWN'
            ? <p className="font-press text-3xl text-pixel-gold mb-3 tracking-widest">{sub.mbti_type}</p>
            : <p className="font-press text-3xl text-pixel-muted mb-3">????</p>}
          {sub.hd_type !== 'UNKNOWN' && (
            <p className="font-pixel text-base text-pixel-blue mb-2">{sub.hd_type}</p>
          )}
          {hdProfile !== 'UNKNOWN' && (
            <div className="mt-3 pt-3 border-t border-pixel-border">
              <p className="font-press text-xs text-pixel-muted">{hdProfile}</p>
            </div>
          )}
        </div>

        {/* MBTI bars */}
        <div className="flex-1">
          {dims ? (
            <>
              <p className="font-press text-xs text-pixel-muted mb-4 uppercase tracking-widest">
                Personality Dimensions
              </p>
              <div className="space-y-3">
                {dims.map(d => {
                  const activeA = d.active === d.a
                  return (
                    <div key={d.a} className="flex items-center gap-3">
                      <span className={`font-press text-sm flex-shrink-0 w-6 text-right ${activeA ? 'text-pixel-gold' : 'text-pixel-muted'}`}>{d.a}</span>
                      <PixelBar fillPct={activeA ? 68 : 32} color={activeA ? 'bg-pixel-gold' : 'bg-pixel-blue/40'} />
                      <span className={`font-press text-sm flex-shrink-0 w-6 ${!activeA ? 'text-pixel-gold' : 'text-pixel-muted'}`}>{d.b}</span>
                      <span className="font-press text-xs text-pixel-text w-24 flex-shrink-0">{activeA ? d.aLabel : d.bLabel}</span>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <p className="font-body text-sm text-pixel-muted">MBTI type not provided.</p>
          )}
        </div>
      </div>

      {/* Profile snapshot */}
      {bullets.length > 0 && (
        <div className="mt-6 pt-6 border-t-2 border-pixel-border">
          <p className="font-press text-xs text-pixel-muted mb-2 uppercase tracking-widest">Profile Snapshot</p>
          {bullets.map((b, i) => <Bullet key={i} text={b} />)}
        </div>
      )}
    </Panel>
  )
}

function EnergyPanel({ report }: { report: BlueprintReportResponse }) {
  const { submission: sub, report_data: rd } = report
  const energy  = HD_ENERGY[sub.hd_type]
  const bullets = asBullets(rd.capacity_and_energy, 3)

  const rows = energy ? [
    { label: 'STRATEGY', value: energy.strategy, icon: '🗺' },
    { label: 'RECHARGE', value: energy.recharge, icon: '⚡' },
    { label: 'DRAIN',    value: energy.drain,    icon: '⚠' },
    { label: 'SIGNAL',   value: energy.signal,   icon: '🔔' },
  ] : []

  return (
    <Panel num="02" icon="⚡" label="ENERGY PROFILE" accent="border-pixel-blue">
      <div className="flex flex-wrap gap-2 mb-6">
        {sub.hd_type !== 'UNKNOWN' && <span className="pixel-tag-blue font-press text-xs px-3 py-2">{sub.hd_type}</span>}
        {sub.hd_authority !== 'UNKNOWN' && <span className="pixel-tag-muted font-press text-xs px-3 py-2">{sub.hd_authority}</span>}
        {energy && <span className="pixel-tag font-press text-xs px-3 py-2">{energy.badge}</span>}
      </div>
      {rows.map(row => (
        <div key={row.label} className="flex gap-4 py-4 border-b border-pixel-border last:border-0 items-start">
          <span className="text-xl flex-shrink-0 w-8">{row.icon}</span>
          <span className="font-press text-xs text-pixel-muted flex-shrink-0 w-20 pt-1 uppercase">{row.label}</span>
          <span className="font-body text-base text-pixel-text leading-relaxed">{row.value}</span>
        </div>
      ))}
      {bullets.length > 0 && (
        <div className="mt-5 pt-5 border-t-2 border-pixel-border">
          <p className="font-press text-xs text-pixel-muted mb-2 uppercase tracking-widest">At Your Best</p>
          {bullets.map((b, i) => <Bullet key={i} text={b} prefix="⚡" color="text-pixel-blue" />)}
        </div>
      )}
    </Panel>
  )
}

function BlindSpotsPanel({ value }: { value: string[] | string }) {
  const items = asBullets(value, 5)
  return (
    <Panel num="03" icon="⚠" label="BLIND SPOTS" accent="border-pixel-error">
      {items.map((w, i) => <Bullet key={i} text={w} prefix="⚠" color="text-pixel-error" />)}
    </Panel>
  )
}

function EnvironmentPanel({ value }: { value: WorkEnvironment | string }) {
  const env = asEnvironment(value)
  return (
    <Panel num="04" icon="🏕" label="OPTIMAL TERRAIN" accent="border-pixel-green">
      {env.pros.map((s, i) => <Bullet key={`p${i}`} text={s} prefix="✓" color="text-pixel-green" />)}
      {env.cons.length > 0 && (
        <div className="mt-4 pt-4 border-t-2 border-pixel-border">
          <p className="font-press text-xs text-pixel-error mb-2 uppercase tracking-widest">Avoid</p>
          {env.cons.map((s, i) => <Bullet key={`n${i}`} text={s} prefix="✗" color="text-pixel-error" />)}
        </div>
      )}
    </Panel>
  )
}

function CareerQuestsPanel({
  recs,
}: { recs: BlueprintReportResponse['report_data']['career_recommendations'] }) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <span className="text-2xl">🗡</span>
        <span className="font-press text-sm text-pixel-gold tracking-wider">CAREER QUEST BOARD</span>
        <div className="flex-1 h-0.5 bg-pixel-border" />
        <span className="font-press text-xs text-pixel-muted px-3 py-1 border border-pixel-border">
          {recs.length} PATHS UNLOCKED
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recs.map((rec, i) => <CareerCard key={i} rec={rec} rank={i + 1} />)}
      </div>
    </div>
  )
}

function ActionPlanPanel({ items }: { items: string[] }) {
  return (
    <Panel num="09" icon="📜" label="QUEST OBJECTIVES" accent="border-pixel-gold">
      <ol className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex gap-5 py-4 border-b-2 border-pixel-border last:border-0 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-pixel-gold flex items-center justify-center"
                 style={{ boxShadow: '3px 3px 0px #C4A033' }}>
              <span className="font-press text-sm text-pixel-bg">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <span className="font-body text-lg text-pixel-text leading-relaxed pt-2">{item}</span>
          </li>
        ))}
      </ol>
    </Panel>
  )
}

function VisionPanel({ value }: { value: string[] | string }) {
  const points = asBullets(value, 4)
  const nodes  = ['NOW', '6 MO', '1 YR', '3 YRS', '5 YRS']
  return (
    <Panel num="06" icon="🔭" label="LONG-TERM QUEST LINE" accent="border-pixel-blue">
      <div className="hidden sm:flex items-center gap-0 mb-8">
        {nodes.map((node, i) => (
          <div key={node} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-3 h-3 bg-pixel-blue border-2 border-pixel-blue"
                   style={{ boxShadow: '2px 2px 0px rgba(77,166,255,0.4)' }} />
              <span className="font-press text-xs text-pixel-blue whitespace-nowrap">{node}</span>
            </div>
            {i < nodes.length - 1 && <div className="flex-1 h-0.5 bg-pixel-blue/40 mx-1" />}
          </div>
        ))}
      </div>
      {points.map((p, i) => (
        <div key={i} className="flex gap-5 items-start py-3 border-b border-pixel-border last:border-0">
          <span className="font-press text-xs text-pixel-blue flex-shrink-0 w-6 mt-1">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="font-body text-base text-pixel-text leading-relaxed">{p}</span>
        </div>
      ))}
    </Panel>
  )
}

function SkillPanel({ value }: { value: string[] | string }) {
  const skills = asBullets(value, 5)
  return (
    <Panel num="07" icon="📚" label="SKILL TREE" accent="border-pixel-border">
      <div className="space-y-0">
        {skills.map((s, i) => (
          <div key={i} className="flex gap-4 items-start py-4 border-b border-pixel-border last:border-0">
            <span className="font-press text-sm text-pixel-bg bg-pixel-gold px-2.5 py-1.5 flex-shrink-0 leading-tight"
                  style={{ boxShadow: '2px 2px 0px #C4A033' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="font-body text-base text-pixel-text leading-relaxed pt-1">{s}</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function DecisionPanel({ value, authority }: { value: string[] | string; authority: string }) {
  const steps = asBullets(value, 5)
  return (
    <Panel num="08" icon="🧭" label="DECISION GUIDE" accent="border-pixel-border">
      {authority !== 'UNKNOWN' && (
        <div className="mb-5 pb-5 border-b-2 border-pixel-border">
          <p className="font-press text-xs text-pixel-muted mb-2">AUTHORITY TYPE</p>
          <p className="font-pixel text-xl text-pixel-gold">{authority}</p>
        </div>
      )}
      {steps.map((s, i) => <Bullet key={i} text={s} prefix="▸" color="text-pixel-gold" />)}
    </Panel>
  )
}

function ClosingPanel({ text }: { text: string }) {
  return (
    <Panel num="10" icon="★" label="CLOSING" accent="border-pixel-gold">
      <div className="border-l-4 border-pixel-gold pl-6">
        <p className="font-pixel text-2xl text-pixel-text leading-relaxed">{text}</p>
      </div>
    </Panel>
  )
}

// ─── Loading / error screens ─────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen bg-pixel-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <PixelPanel>
          <div className="text-center space-y-7 py-6">
            <div className="font-vt text-vt-4xl text-pixel-gold animate-pixel-float">◆</div>
            <div>
              <p className="font-press text-sm text-pixel-gold mb-3">CAREER CODEX</p>
              <p className="font-press text-xs text-pixel-muted uppercase tracking-widest">Retrieving your blueprint…</p>
            </div>
            <div className="h-5 bg-pixel-bg border-2 border-pixel-border overflow-hidden relative">
              <motion.div className="absolute inset-y-0 left-0 bg-pixel-gold"
                initial={{ width: '0%' }} animate={{ width: '100%' }}
                transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity }} />
              <div className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: 'repeating-linear-gradient(90deg,transparent,transparent 8px,rgba(0,0,0,0.22) 8px,rgba(0,0,0,0.22) 10px)' }} />
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
          <h1 className="font-press text-sm text-pixel-text mb-4">Codex Not Found</h1>
          <p className="font-body text-base text-pixel-muted leading-relaxed mb-6">
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
          <h1 className="font-press text-sm text-pixel-error mb-4">Something Went Wrong</h1>
          <p className="font-body text-base text-pixel-muted mb-2">We couldn&rsquo;t load your blueprint.</p>
          {message && <p className="font-press text-xs text-pixel-muted mb-6">Error: {message}</p>}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <PixelButton variant="primary" size="md" onClick={() => window.location.reload()}>↺ Retry</PixelButton>
            <Link href="/"><PixelButton variant="ghost" size="md">◀ Home</PixelButton></Link>
          </div>
        </PixelPanel>
      </div>
    </motion.div>
  )
}

// ─── Top bar ─────────────────────────────────────────────────────────────────

function TopBar({ nickname }: { nickname: string }) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-pixel-gold bg-pixel-panel/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-pixel-gold flex items-center justify-center flex-shrink-0"
               style={{ boxShadow: '2px 2px 0px #C4A033' }}>
            <span className="font-press text-xs text-pixel-bg">CC</span>
          </div>
          <span className="font-press text-xs text-pixel-gold hidden sm:block">CAREER CODEX</span>
          <span className="font-press text-xs text-pixel-border hidden sm:block">·</span>
          <span className="font-press text-xs text-pixel-muted hidden sm:block">{nickname}</span>
        </div>
        <Link href="/"><PixelButton variant="ghost" size="md">◀ Home</PixelButton></Link>
      </div>
    </header>
  )
}

// ─── Full report ─────────────────────────────────────────────────────────────

function ReportScreen({ report }: { report: BlueprintReportResponse }) {
  const { report_data: rd, submission: sub } = report
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}
      className="min-h-screen bg-pixel-bg">
      <TopBar nickname={sub.nickname} />
      <ReportHero report={report} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Row 1: Character sheet + Energy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CharacterSheetPanel report={report} />
          <EnergyPanel report={report} />
        </div>

        {/* Row 2: Blind spots + Environment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BlindSpotsPanel value={rd.blind_spots} />
          <EnvironmentPanel value={rd.ideal_work_environment} />
        </div>

        {/* Career quest board */}
        <CareerQuestsPanel recs={rd.career_recommendations} />

        {/* Quest objectives */}
        <ActionPlanPanel items={rd.action_plan} />

        {/* Long-term vision */}
        <VisionPanel value={rd.long_term_vision} />

        {/* Row: Skill tree + Decision guide */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkillPanel value={rd.skill_development_roadmap} />
          <DecisionPanel value={rd.decision_making_guide} authority={sub.hd_authority} />
        </div>

        {/* Closing */}
        <ClosingPanel text={rd.closing_statement} />

        {/* Footer */}
        <div className="text-center pt-4 pb-10 space-y-4">
          <div className="pixel-divider" />
          <p className="font-press text-xs text-pixel-muted">
            ◆ CHARACTER CAREER BLUEPRINT · Prepared for {sub.nickname}
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/"><PixelButton variant="secondary" size="md">◀ Home</PixelButton></Link>
            <Link href="/create"><PixelButton variant="ghost" size="md">▶ New Blueprint</PixelButton></Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main exported component ─────────────────────────────────────────────────

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
