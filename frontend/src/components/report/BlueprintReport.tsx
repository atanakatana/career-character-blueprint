'use client'

import { useEffect, useState }  from 'react'
import Link                     from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

import { PixelPanel }   from '@/components/ui/PixelPanel'
import { PixelButton }  from '@/components/ui/PixelButton'
import { config }       from '@/lib/config'
import { isV3 }         from '@/lib/types'
import type {
  BlueprintReportResponse,
  ReportDataV3,
  BlindSpot,
  CareerArena,
  DailyQuest,
  ProfileLine,
} from '@/lib/types'

// ─── Design tokens (matching attached HTML standard) ─────────────────────────
const V = {
  bg:      '#0f0c1a',
  bgGrid:  '#16122a',
  panel:   '#1a1530',
  panelHi: '#221b3d',
  frame:   '#3a3160',
  frameHi: '#564a8a',
  gold:    '#ffcb47',
  goldD:   '#c9971f',
  cyan:    '#4fe3d0',
  cyanD:   '#2a9d8f',
  coral:   '#ff6b6b',
  coralD:  '#c44444',
  pink:    '#ff79c6',
  green:   '#7fe88a',
  ink:     '#f0ecff',
  ink2:    '#a89fd4',
  ink3:    '#6b6398',
} as const

// Notched-corner clip-path — the signature panel shape from the blueprint design
const NOTCH = 'polygon(0 8px,4px 8px,4px 4px,8px 4px,8px 0,calc(100% - 8px) 0,calc(100% - 8px) 4px,calc(100% - 4px) 4px,calc(100% - 4px) 8px,100% 8px,100% calc(100% - 8px),calc(100% - 4px) calc(100% - 8px),calc(100% - 4px) calc(100% - 4px),calc(100% - 8px) calc(100% - 4px),calc(100% - 8px) 100%,8px 100%,8px calc(100% - 4px),4px calc(100% - 4px),4px calc(100% - 8px),0 calc(100% - 8px))'

// Dotted section divider bar
const dotBar = (color = V.frame) => ({
  flex: 1 as const,
  height: 3,
  backgroundImage: `repeating-linear-gradient(90deg,${color} 0,${color} 6px,transparent 6px,transparent 10px)`,
})

// ─── VS Battle Screen lookup tables ──────────────────────────────────────────

const MBTI_VS: Record<string, { header: string; items: string[] }> = {
  ENFP: { header: 'THE ENFP BRAIN WANTS TO', items: ['Initiate ideas from internal excitement', 'Jump between possibilities without waiting', 'Force momentum before the world responds'] },
  ENTP: { header: 'THE ENTP BRAIN WANTS TO', items: ['Debate every angle and prototype immediately', 'Challenge the system and rebuild it on the fly', 'Move before execution catches up with ideation'] },
  INFJ: { header: 'THE INFJ BRAIN WANTS TO', items: ['Execute the singular vision already fully formed', 'Guide others before being invited to', 'Control direction to eliminate wasted motion'] },
  INTJ: { header: 'THE INTJ BRAIN WANTS TO', items: ['Build the system according to internal strategy', 'Operate independently from conviction alone', 'Move on the plan without external confirmation'] },
  ENTJ: { header: 'THE ENTJ BRAIN WANTS TO', items: ['Lead and direct before being asked', 'Optimise every process and override slower paths', 'Initiate structural change from the top down'] },
  ESTJ: { header: 'THE ESTJ BRAIN WANTS TO', items: ['Implement proven protocols immediately', 'Control the process to ensure reliability', 'Initiate based on established responsibility'] },
  ENFJ: { header: 'THE ENFJ BRAIN WANTS TO', items: ['Inspire and mobilise people proactively', 'Initiate connection and guidance without invitation', 'Drive the group toward a shared vision'] },
  ESFJ: { header: 'THE ESFJ BRAIN WANTS TO', items: ['Serve and support before being asked', 'Initiate harmony and care in every setting', 'Create structure around others\' needs first'] },
  INTP: { header: 'THE INTP BRAIN WANTS TO', items: ['Map every variable before moving', 'Work alone inside the framework indefinitely', 'Withhold action until the logic is airtight'] },
  ISTP: { header: 'THE ISTP BRAIN WANTS TO', items: ['Take immediate hands-on action when curious', 'Solve alone using internal logic and observation', 'Disengage the moment the problem is solved'] },
  INFP: { header: 'THE INFP BRAIN WANTS TO', items: ['Act on deep personal values and inner vision', 'Initiate creative work aligned with identity', 'Pursue the ideal even when no one calls for it'] },
  ISFP: { header: 'THE ISFP BRAIN WANTS TO', items: ['Act on authentic impulses in the present moment', 'Create beauty and meaning without announcement', 'Move quietly based on internal feeling'] },
  ISTJ: { header: 'THE ISTJ BRAIN WANTS TO', items: ['Follow the tested protocol from prior experience', 'Complete every commitment regardless of energy', 'Initiate based on established duty and obligation'] },
  ISFJ: { header: 'THE ISFJ BRAIN WANTS TO', items: ['Fulfill care duties before being asked', 'Initiate protection and support for others', 'Stick to proven, reliable methods from memory'] },
  ESTP: { header: 'THE ESTP BRAIN WANTS TO', items: ['Act immediately on what is tangible and real', 'Jump into opportunity without overanalysing', 'Initiate bold moves in the current moment'] },
  ESFP: { header: 'THE ESFP BRAIN WANTS TO', items: ['Dive into joyful action right now', 'Initiate spontaneous experiences without planning', 'Move fast and adapt to what comes'] },
}

const HD_VS: Record<string, { header: string; items: string[] }> = {
  'Generator':             { header: 'THE GENERATOR AURA NEEDS TO', items: ['Wait for external stimulus before moving', 'Respond authentically — not initiate from thought', 'Let energy be genuinely called, not forced'] },
  'Manifesting Generator': { header: 'THE MG AURA NEEDS TO',        items: ['Wait to respond, then inform others before acting', 'Follow the gut through multi-track paths', 'Let the right thing call — then move fast'] },
  'Projector':             { header: 'THE PROJECTOR AURA NEEDS TO', items: ['Wait for a specific, genuine invitation', 'Be recognised before offering guidance', 'Conserve energy until the right role calls'] },
  'Manifestor':            { header: 'THE MANIFESTOR AURA NEEDS TO',items: ['Inform those affected before initiating', 'Allow for resistance without abandoning the move', 'Act in closed energy without needing followers'] },
  'Reflector':             { header: 'THE REFLECTOR AURA NEEDS TO', items: ['Sample and observe before committing', 'Wait a full lunar cycle for major decisions', 'Reflect the environment — not absorb it'] },
}

// Profile line names lookup
const LINE_NAME: Record<number, string> = {
  1: 'INVESTIGATOR', 2: 'HERMIT', 3: 'MARTYR',
  4: 'OPPORTUNIST',  5: 'HERETIC', 6: 'ROLE MODEL',
}

function parseProfileNumbers(profile: string): [number, number] | null {
  const m = profile.match(/(\d)\/(\d)/)
  return m ? [parseInt(m[1]), parseInt(m[2])] : null
}

// ─── Shared primitives ───────────────────────────────────────────────────────

function Panel({
  children, border = V.frame, hi = false,
  style = {}, padding = '22px',
}: {
  children: React.ReactNode
  border?: string
  hi?: boolean
  style?: React.CSSProperties
  padding?: string
}) {
  return (
    <div style={{
      background: hi ? V.panelHi : V.panel,
      border: `3px solid ${border}`,
      clipPath: NOTCH,
      padding,
      ...style,
    }}>
      {children}
    </div>
  )
}

function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <span style={{ fontFamily: 'var(--font-press)', fontSize: 11, color: V.bg, background: V.gold, padding: '8px 11px', letterSpacing: '0.05em', flexShrink: 0 }}>
        {num}
      </span>
      <span style={{ fontFamily: 'var(--font-press)', fontSize: 12, color: V.ink, letterSpacing: '0.04em', lineHeight: 1.4 }}>
        {title}
      </span>
      <div style={dotBar()} />
    </div>
  )
}

function PanelNote({ icon = '⚙', label, children, border = V.cyan }: {
  icon?: string; label: string; children: React.ReactNode; border?: string
}) {
  return (
    <Panel border={border} style={{ marginBottom: 22 }}>
      <div style={{ fontFamily: 'var(--font-press)', fontSize: 9, color: border, marginBottom: 12, letterSpacing: '0.05em' }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 20, color: V.ink2, lineHeight: 1.55 }}>{children}</div>
    </Panel>
  )
}

// ─── Section I: Character Data ───────────────────────────────────────────────

function SectionCharacterData({ rd, report }: { rd: ReportDataV3; report: BlueprintReportResponse }) {
  const sub = report.submission
  const profileNums = parseProfileNumbers(sub.hd_profile)
  return (
    <div style={{ marginBottom: 38 }}>
      <SectionHeader num="I" title="CHARACTER DATA" />
      <Panel hi padding="24px">
        <div style={{ fontFamily: 'var(--font-press)', fontSize: 16, color: V.gold, textAlign: 'center', lineHeight: 1.5, marginBottom: 14, textShadow: `3px 3px 0 ${V.goldD}` }}>
          {report.character_title}
        </div>
        <div style={{ textAlign: 'center', color: V.cyan, fontSize: 20, fontStyle: 'italic', marginBottom: 20, paddingBottom: 18, borderBottom: `2px dashed ${V.frame}` }}>
          "{rd.character_tagline}"
        </div>
        {[
          { k: 'CHARACTER CODE',  v: `${sub.mbti_type} × ${sub.hd_type}` },
          { k: 'INTERACTION STYLE (PROFILE)', v: sub.hd_profile !== 'UNKNOWN' ? sub.hd_profile : `${profileNums ? profileNums.join('/') : '?'}` },
          { k: 'PRIMARY DOMAIN',  v: rd.character_domain },
          { k: 'AUTHORITY',       v: sub.hd_authority !== 'UNKNOWN' ? sub.hd_authority : '—' },
        ].map(({ k, v }) => (
          <div key={k} style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--font-press)', fontSize: 9, color: V.cyan, minWidth: 180, flexShrink: 0, letterSpacing: '0.03em', lineHeight: 1.6 }}>{k}</span>
            <span style={{ fontSize: 20, color: V.ink, lineHeight: 1.5 }}>{v}</span>
          </div>
        ))}
      </Panel>
    </div>
  )
}

// ─── Section II: Internal Conflict (MBTI vs HD) ──────────────────────────────

function SectionConflict({ rd, mbtiType, hdType }: { rd: ReportDataV3; mbtiType: string; hdType: string }) {
  const mbtiVs = MBTI_VS[mbtiType]
  const hdVs   = HD_VS[hdType]
  return (
    <div style={{ marginBottom: 38 }}>
      <SectionHeader num="II" title="INTERNAL CONFLICT ANALYSIS (MBTI vs HD)" />
      <PanelNote icon="⚙" label="CONFLICT MECHANISM" border={V.cyan}>
        {rd.conflict_mechanism}
      </PanelNote>

      {/* VS battle screen */}
      {mbtiVs && hdVs && (
        <>
          <div style={{ fontFamily: 'var(--font-press)', fontSize: 11, color: V.coral, textAlign: 'center', marginBottom: 18, letterSpacing: '0.04em' }}>
            CRITICAL SYSTEM CONFLICT
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'stretch', marginBottom: 16 }}>
            {/* Left — MBTI */}
            <div style={{ padding: '18px 16px', border: `3px solid ${V.cyanD}`, borderRight: 'none', background: `rgba(79,227,208,0.05)` }}>
              <div style={{ fontFamily: 'var(--font-press)', fontSize: 8, color: V.cyan, marginBottom: 12, lineHeight: 1.5, letterSpacing: '0.03em' }}>
                {mbtiVs.header}
              </div>
              {mbtiVs.items.map((item, i) => (
                <div key={i} style={{ fontSize: 19, color: V.ink2, padding: '3px 0', lineHeight: 1.4 }}>
                  ▸ {item}
                </div>
              ))}
            </div>
            {/* VS badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', background: V.bg, borderTop: `3px solid ${V.frame}`, borderBottom: `3px solid ${V.frame}` }}>
              <span style={{ fontFamily: 'var(--font-press)', fontSize: 13, color: V.gold, textShadow: `2px 2px 0 ${V.goldD}`, transform: 'rotate(-8deg)', display: 'block' }}>VS</span>
            </div>
            {/* Right — HD */}
            <div style={{ padding: '18px 16px', border: `3px solid ${V.coralD}`, borderLeft: 'none', background: `rgba(255,107,107,0.05)` }}>
              <div style={{ fontFamily: 'var(--font-press)', fontSize: 8, color: V.coral, marginBottom: 12, lineHeight: 1.5, letterSpacing: '0.03em' }}>
                {hdVs.header}
              </div>
              {hdVs.items.map((item, i) => (
                <div key={i} style={{ fontSize: 19, color: V.ink2, padding: '3px 0', lineHeight: 1.4 }}>
                  ▸ {item}
                </div>
              ))}
            </div>
          </div>
          <Panel border={V.frame} padding="14px 18px" style={{ marginBottom: 0 }}>
            <span style={{ fontSize: 20, color: V.ink2, lineHeight: 1.5 }}>{rd.conflict_result}</span>
          </Panel>
        </>
      )}
    </div>
  )
}

// ─── Section III: Profile Line Analysis ──────────────────────────────────────

function SectionProfileLines({ rd }: { rd: ReportDataV3 }) {
  const colors = [V.gold, V.pink]
  return (
    <div style={{ marginBottom: 38 }}>
      <SectionHeader num="III" title="PROFILE LINE ANALYSIS" />
      <p style={{ fontSize: 21, color: V.ink2, lineHeight: 1.55, marginBottom: 18 }}>{rd.profile_intro}</p>
      {rd.profile_lines.map((line: ProfileLine, i: number) => (
        <Panel key={i} border={V.frame} style={{ marginBottom: 14 }}>
          <span style={{ display: 'inline-block', fontFamily: 'var(--font-press)', fontSize: 8, padding: '6px 10px', color: V.bg, background: colors[i] ?? V.gold, marginBottom: 12, letterSpacing: '0.04em' }}>
            {line.line_name}
          </span>
          <div style={{ fontFamily: 'var(--font-press)', fontSize: 11, color: V.ink, marginBottom: 12, lineHeight: 1.5 }}>
            {line.title}
          </div>
          <div style={{ fontSize: 20, color: V.ink2, lineHeight: 1.55 }}>{line.body}</div>
          {line.implication && (
            <div style={{ marginTop: 12, padding: '12px 14px', background: V.bg, borderLeft: `4px solid ${V.gold}`, fontSize: 19, color: V.ink2, lineHeight: 1.5 }}>
              <span style={{ color: V.gold }}>Implication: </span>{line.implication}
            </div>
          )}
        </Panel>
      ))}
      <Panel border={V.gold} hi style={{ fontSize: 21, color: V.ink, lineHeight: 1.6 }}>
        {rd.profile_synthesis}
      </Panel>
    </div>
  )
}

// ─── Section IV: Blind Spots (Debuffs) ───────────────────────────────────────

function SectionBlindSpots({ rd }: { rd: ReportDataV3 }) {
  return (
    <div style={{ marginBottom: 38 }}>
      <SectionHeader num="IV" title="BLIND SPOTS (HIDDEN WEAKNESSES)" />
      {rd.blind_spots.map((bs: BlindSpot, i: number) => (
        <div key={i} style={{ padding: '18px 20px', marginBottom: 14, border: `3px solid ${V.coralD}`, background: `linear-gradient(180deg,rgba(255,107,107,0.06),${V.panel})`, clipPath: NOTCH }}>
          <div style={{ fontFamily: 'var(--font-press)', fontSize: 12, color: V.coral, marginBottom: 14, letterSpacing: '0.03em' }}>
            ☠ {bs.name}
          </div>
          {[
            { k: 'MECHANISM', v: bs.mechanism },
            { k: 'SCENARIO',  v: bs.scenario  },
          ].map(({ k, v }) => (
            <div key={k} style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-press)', fontSize: 8, color: V.ink3, minWidth: 84, flexShrink: 0, paddingTop: 4, letterSpacing: '0.03em' }}>{k}</span>
              <span style={{ fontSize: 20, color: V.ink2, lineHeight: 1.5, flex: 1 }}>{v}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Section V: Career Arenas ────────────────────────────────────────────────

function SectionCareerArenas({ rd }: { rd: ReportDataV3 }) {
  return (
    <div style={{ marginBottom: 38 }}>
      <SectionHeader num="V" title="CAREER ARENAS & SKILL MAP" />
      <PanelNote icon="⚙" label="MATCHING PRINCIPLE" border={V.cyan}>
        Career arenas below are matched to your existing background and the working style that fits your type — not generic job listings.
      </PanelNote>
      {rd.career_arenas.map((arena: CareerArena, i: number) => (
        <div key={i} style={{ padding: 22, marginBottom: 18, border: `3px solid ${arena.is_best_fit ? V.gold : V.frame}`, clipPath: NOTCH, position: 'relative' }}>
          {arena.is_best_fit && (
            <span style={{ position: 'absolute', top: -3, right: 18, background: V.gold, color: V.bg, fontFamily: 'var(--font-press)', fontSize: 8, padding: '6px 10px', letterSpacing: '0.05em' }}>
              ★ BEST FIT
            </span>
          )}
          <div style={{ fontFamily: 'var(--font-press)', fontSize: 10, color: V.cyan, marginBottom: 8 }}>ARENA {String(i + 1).padStart(2, '0')}</div>
          <div style={{ fontFamily: 'var(--font-press)', fontSize: 13, color: V.gold, marginBottom: 4, lineHeight: 1.5, textShadow: `2px 2px 0 ${V.goldD}` }}>
            {arena.career_name}
          </div>
          {arena.career_subtitle && (
            <div style={{ fontFamily: 'var(--font-press)', fontSize: 8, color: V.ink3, marginBottom: 16 }}>{arena.career_subtitle}</div>
          )}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-press)', fontSize: 8, color: V.pink, letterSpacing: '0.05em', marginBottom: 6 }}>WHY IT FITS</div>
            <div style={{ fontSize: 20, color: V.ink2, lineHeight: 1.55 }}>{arena.why_it_fits}</div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-press)', fontSize: 8, color: V.pink, letterSpacing: '0.05em', marginBottom: 6 }}>SKILLS YOU ALREADY HAVE</div>
            <ul style={{ listStyle: 'none', counterReset: 's', paddingLeft: 0 }}>
              {arena.existing_skills.map((sk, j) => (
                <li key={j} style={{ display: 'flex', gap: 10, fontSize: 20, color: V.ink2, lineHeight: 1.4, padding: '7px 0', borderBottom: `2px dotted ${V.frame}` }}>
                  <span style={{ width: 22, height: 22, background: V.cyan, color: V.bg, fontFamily: 'var(--font-press)', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{j + 1}</span>
                  {sk}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-press)', fontSize: 8, color: V.pink, letterSpacing: '0.05em', marginBottom: 6 }}>SKILLS TO DEVELOP</div>
            <ul style={{ listStyle: 'none', counterReset: 's', paddingLeft: 0 }}>
              {arena.skills_to_develop.map((sk, j) => (
                <li key={j} style={{ display: 'flex', gap: 10, fontSize: 20, color: V.ink2, lineHeight: 1.4, padding: '7px 0', borderBottom: `2px dotted ${V.frame}` }}>
                  <span style={{ width: 22, height: 22, background: V.frameHi, color: V.ink2, fontFamily: 'var(--font-press)', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{j + 1}</span>
                  {sk}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ padding: '11px 14px', border: `2px solid ${V.cyanD}`, background: `rgba(79,227,208,0.05)`, fontSize: 19, color: V.ink2, lineHeight: 1.5 }}>
            <span style={{ fontFamily: 'var(--font-press)', fontSize: 8, color: V.cyan, marginRight: 8 }}>▶ FIRST ACTION</span>
            {arena.first_action}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Section VI: Decision Protocol ───────────────────────────────────────────

function SectionDecision({ rd, authority }: { rd: ReportDataV3; authority: string }) {
  return (
    <div style={{ marginBottom: 38 }}>
      <SectionHeader num="VI" title="DECISION PROTOCOL" />
      <Panel hi border={V.gold} style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: 'var(--font-press)', fontSize: 9, color: V.gold, marginBottom: 12, letterSpacing: '0.05em' }}>
          ◆ NAVIGATION SYSTEM: {authority.toUpperCase()} AUTHORITY
        </div>
        <div style={{ fontSize: 20, color: V.ink2, lineHeight: 1.55 }}>{rd.decision_intro}</div>
      </Panel>

      {/* Flowchart */}
      <Panel border={V.frame} padding="22px" style={{ marginBottom: 16 }}>
        <div style={{ textAlign: 'center', padding: '11px 16px', border: `2px solid ${V.gold}`, background: V.bg, fontSize: 20, color: V.gold, maxWidth: 480, margin: '0 auto', lineHeight: 1.4 }}>
          {rd.decision_question}
        </div>
        <div style={{ textAlign: 'center', color: V.ink3, fontSize: 22, padding: '8px 0' }}>▼</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ padding: 14, border: `3px solid ${V.green}`, background: `rgba(127,232,138,0.06)`, textAlign: 'center' }}>
            <div style={{ fontSize: 18, color: V.ink2, lineHeight: 1.4, marginBottom: 8 }}>{rd.decision_yes_signal}</div>
            <div style={{ fontFamily: 'var(--font-press)', fontSize: 13, color: V.green }}>✓ YES — MOVE</div>
          </div>
          <div style={{ padding: 14, border: `3px solid ${V.coral}`, background: `rgba(255,107,107,0.06)`, textAlign: 'center' }}>
            <div style={{ fontSize: 18, color: V.ink2, lineHeight: 1.4, marginBottom: 8 }}>{rd.decision_no_signal}</div>
            <div style={{ fontFamily: 'var(--font-press)', fontSize: 13, color: V.coral }}>✗ NO — PASS</div>
          </div>
        </div>
      </Panel>

      <div style={{ padding: '16px 20px', border: `3px solid ${V.coral}`, background: `rgba(255,107,107,0.06)`, clipPath: NOTCH }}>
        <div style={{ fontFamily: 'var(--font-press)', fontSize: 9, color: V.coral, marginBottom: 10, letterSpacing: '0.03em' }}>
          ⚠ {rd.decision_trap_name}
        </div>
        <div style={{ fontSize: 20, color: V.ink2, lineHeight: 1.55 }}>{rd.decision_trap_body}</div>
      </div>
    </div>
  )
}

// ─── Section VII: Daily Quests ────────────────────────────────────────────────

function SectionDailyQuests({ rd }: { rd: ReportDataV3 }) {
  return (
    <div style={{ marginBottom: 38 }}>
      <SectionHeader num="VII" title="DAILY QUESTS // FIRST MOVES" />
      {rd.daily_quests.map((q: DailyQuest, i: number) => (
        <div key={i} style={{ display: 'flex', gap: 14, padding: '16px 18px', marginBottom: 12, border: `3px solid ${V.frame}`, clipPath: NOTCH }}>
          <div style={{ width: 34, height: 34, background: V.gold, color: V.bg, fontFamily: 'var(--font-press)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {i + 1}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-press)', fontSize: 11, color: V.ink, marginBottom: 8, lineHeight: 1.5 }}>{q.name}</div>
            <div style={{ fontSize: 20, color: V.ink2, lineHeight: 1.5, marginBottom: 6 }}>{q.description}</div>
            <div style={{ fontFamily: 'var(--font-press)', fontSize: 8, color: V.cyan }}>⏱ {q.time_estimate}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Full v3 report ───────────────────────────────────────────────────────────

function V3Report({ report }: { report: BlueprintReportResponse }) {
  const rd  = report.report_data as ReportDataV3
  const sub = report.submission

  return (
    <div style={{ minHeight: '100vh', background: V.bg, backgroundImage: `linear-gradient(${V.bgGrid} 1px,transparent 1px),linear-gradient(90deg,${V.bgGrid} 1px,transparent 1px)`, backgroundSize: '32px 32px', color: V.ink, fontFamily: 'var(--font-vt)', fontSize: 21, lineHeight: 1.5, position: 'relative' }}>

      {/* CRT scanline overlay */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, background: 'repeating-linear-gradient(0deg,rgba(0,0,0,0.16) 0px,rgba(0,0,0,0.16) 1px,transparent 1px,transparent 3px)', mixBlendMode: 'multiply', opacity: 0.5 }} />

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 18px' }}>

        {/* HUD bar */}
        <div style={{ padding: '14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${V.frame}`, fontFamily: 'var(--font-vt)', fontSize: 18, color: V.ink3, letterSpacing: '0.05em' }}>
          <span style={{ color: V.gold }}>◆ THE GREAT ARCHITECT</span>
          <span style={{ color: V.cyan }}>SYS.ONLINE<span style={{ animation: 'blink 1.1s steps(1) infinite' }}>_</span></span>
        </div>

        {/* Cover */}
        <div style={{ padding: '48px 0 40px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-press)', fontSize: 9, color: V.cyan, letterSpacing: '0.2em', marginBottom: 24 }}>
            {'< CAREER BLUEPRINT // FILE FOUND >'}
          </div>
          <div style={{ fontFamily: 'var(--font-press)', fontSize: 22, lineHeight: 1.35, color: V.gold, letterSpacing: '0.02em', marginBottom: 22, textShadow: `4px 4px 0 ${V.goldD},0 0 24px rgba(255,203,71,0.35)` }}>
            {report.character_title}
          </div>
          {rd.character_tagline && (
            <div style={{ fontSize: 22, color: V.ink2, marginBottom: 30, fontStyle: 'italic' }}>
              "{rd.character_tagline}"
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 560, margin: '0 auto' }}>
            {[
              { label: sub.nickname,                     bg: V.cyan  },
              { label: sub.mbti_type !== 'UNKNOWN' ? sub.mbti_type : null, bg: V.gold },
              { label: sub.hd_type   !== 'UNKNOWN' ? sub.hd_type   : null, bg: V.cyan },
              { label: sub.hd_profile !== 'UNKNOWN' ? sub.hd_profile.split('—')[0].trim() : null, bg: V.pink },
              { label: sub.hd_authority !== 'UNKNOWN' ? sub.hd_authority + ' AUTH.' : null, bg: V.gold },
            ].filter(t => t.label).map((tag, i) => (
              <span key={i} style={{ fontFamily: 'var(--font-press)', fontSize: 9, padding: '9px 12px', letterSpacing: '0.05em', color: V.bg, background: tag.bg }}>
                {tag.label}
              </span>
            ))}
          </div>
        </div>

        {/* System message */}
        <Panel hi padding="20px 22px" style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--font-press)', fontSize: 10, color: V.green, marginBottom: 14, letterSpacing: '0.05em' }}>▸ SYSTEM MESSAGE</div>
          <div style={{ fontSize: 21, color: V.ink, lineHeight: 1.55 }}>{rd.system_message}</div>
        </Panel>

        {/* Sections */}
        <SectionCharacterData rd={rd} report={report} />
        <SectionConflict      rd={rd} mbtiType={sub.mbti_type} hdType={sub.hd_type} />
        <SectionProfileLines  rd={rd} />
        <SectionBlindSpots    rd={rd} />
        <SectionCareerArenas  rd={rd} />
        <SectionDecision      rd={rd} authority={sub.hd_authority} />
        <SectionDailyQuests   rd={rd} />

        {/* Closing */}
        <Panel border={V.gold} hi padding="20px 24px" style={{ textAlign: 'center', fontSize: 21, color: V.ink, lineHeight: 1.6, marginBottom: 30 }}>
          {rd.closing_statement}
        </Panel>

        {/* Footer */}
        <div style={{ padding: '36px 0 48px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-press)', fontSize: 9, color: V.gold, letterSpacing: '0.15em', marginBottom: 14 }}>
            ✦ THE GREAT ARCHITECT ✦
          </div>
          <div style={{ fontFamily: 'var(--font-press)', fontSize: 11, color: V.ink2, marginBottom: 8 }}>CAREER BLUEPRINT</div>
          <div style={{ fontSize: 19, color: V.ink3, letterSpacing: '0.05em' }}>
            {sub.nickname} // {sub.mbti_type} // {sub.hd_type} // {sub.hd_profile.split('—')[0].trim()} // {sub.hd_authority}
          </div>
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 16 }}>
            <Link href="/"><button style={{ fontFamily: 'var(--font-press)', fontSize: 9, color: V.gold, background: 'transparent', border: `2px solid ${V.gold}`, padding: '10px 16px', cursor: 'pointer', letterSpacing: '0.05em' }}>◀ HOME</button></Link>
            <Link href="/create"><button style={{ fontFamily: 'var(--font-press)', fontSize: 9, color: V.ink3, background: 'transparent', border: `2px solid ${V.frame}`, padding: '10px 16px', cursor: 'pointer', letterSpacing: '0.05em' }}>▶ NEW BLUEPRINT</button></Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Legacy v2 fallback ───────────────────────────────────────────────────────

function LegacyReport({ report }: { report: BlueprintReportResponse }) {
  return (
    <div className="min-h-screen bg-pixel-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <PixelPanel>
          <p className="font-press text-xs text-pixel-gold mb-3">LEGACY REPORT</p>
          <p className="font-pixel text-2xl text-pixel-text mb-4">{report.character_title}</p>
          <p className="font-body text-sm text-pixel-muted mb-6 leading-relaxed">
            This report was generated with an earlier blueprint format. Regenerate it from the admin panel to get the full v3 Character Blueprint.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/"><PixelButton variant="secondary" size="md">◀ Home</PixelButton></Link>
          </div>
        </PixelPanel>
      </div>
    </div>
  )
}

// ─── Loading / error screens ──────────────────────────────────────────────────

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

// ─── Main exported component ──────────────────────────────────────────────────

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
      {state === 'ready' && report && (
        isV3(report.report_data)
          ? <V3Report    key="v3"     report={report} />
          : <LegacyReport key="legacy" report={report} />
      )}
    </AnimatePresence>
  )
}
