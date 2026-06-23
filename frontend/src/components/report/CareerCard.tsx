import type { CareerRecommendation } from '@/lib/types'

// Extract the first N meaningful sentences from a prose string
function firstLines(text: string, limit = 2): string[] {
  const parts = text.split(/\.\s+(?=[A-Z])/).filter(s => s.trim().length > 10)
  return parts.slice(0, limit).map(s => s.trim().replace(/\.$/, ''))
}

interface CareerCardProps {
  rec:  CareerRecommendation
  rank: number
}

export function CareerCard({ rec, rank }: CareerCardProps) {
  const rankStr    = String(rank).padStart(2, '0')
  const whyPoints  = firstLines(rec.why_it_fits, 2)
  const growthLine = rec.future_growth_potential.split(/[.!]/)[0].trim()

  return (
    <div className="border-2 border-pixel-border bg-pixel-panel shadow-pixel flex flex-col h-full">

      {/* ── Header bar ────────────────────────────────── */}
      <div className="bg-pixel-bg border-b border-pixel-border px-3 py-2
                      flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-press text-[0.36rem] text-pixel-muted">#{rankStr}</span>
          <span className="pixel-tag-green text-[0.32rem]">QUEST</span>
        </div>
        <span className="font-press text-[0.34rem] text-pixel-blue">AVAILABLE</span>
      </div>

      {/* ── Career name ───────────────────────────────── */}
      <div className="px-3 py-3 border-b border-pixel-border flex-shrink-0">
        <h3 className="font-press text-press-xs text-pixel-gold leading-tight">
          {rec.career_name}
        </h3>
      </div>

      {/* ── Why it fits ───────────────────────────────── */}
      <div className="px-3 py-2.5 border-b border-pixel-border flex-1 space-y-1.5">
        {whyPoints.map((point, i) => (
          <div key={i} className="flex gap-2">
            <span className="font-press text-[0.36rem] text-pixel-gold flex-shrink-0 mt-0.5">▸</span>
            <span className="font-body text-[12px] text-pixel-muted leading-snug">{point}</span>
          </div>
        ))}
      </div>

      {/* ── Income / Growth ───────────────────────────── */}
      <div className="grid grid-cols-2 divide-x divide-pixel-border border-b border-pixel-border flex-shrink-0">
        <div className="px-3 py-2">
          <p className="font-press text-[0.34rem] text-pixel-muted mb-1">INCOME</p>
          <p className="font-press text-[0.4rem] text-pixel-green leading-tight">
            {rec.estimated_income_range}
          </p>
        </div>
        <div className="px-3 py-2">
          <p className="font-press text-[0.34rem] text-pixel-muted mb-1">GROWTH</p>
          <p className="font-body text-[12px] text-pixel-text leading-tight">{growthLine}</p>
        </div>
      </div>

      {/* ── Required skills ───────────────────────────── */}
      <div className="px-3 py-2.5 border-b border-pixel-border flex-shrink-0">
        <p className="font-press text-[0.34rem] text-pixel-muted mb-1.5">SKILLS NEEDED</p>
        <div className="flex flex-wrap gap-1">
          {rec.required_skills.map((skill, i) => (
            <span
              key={i}
              className="font-press text-[0.34rem] text-pixel-blue border border-pixel-blue
                         px-1.5 py-0.5 leading-tight"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* ── First objective ───────────────────────────── */}
      <div className="px-3 py-2.5 bg-pixel-bg/50 flex-shrink-0">
        <p className="font-press text-[0.36rem] text-pixel-blue mb-1">▶ FIRST OBJECTIVE</p>
        <p className="font-body text-[12px] text-pixel-text leading-snug">
          {rec.first_action}
        </p>
      </div>

    </div>
  )
}
