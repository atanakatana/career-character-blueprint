import type { CareerRecommendation } from '@/lib/types'

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
    <div
      className="border-2 border-pixel-gold bg-pixel-panel flex flex-col h-full"
      style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.7)' }}
    >
      {/* Header */}
      <div className="bg-pixel-bg border-b-2 border-pixel-gold px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-press text-sm text-pixel-muted">#{rankStr}</span>
          <span className="pixel-tag-green">QUEST</span>
        </div>
        <span className="font-press text-xs text-pixel-blue">AVAILABLE</span>
      </div>

      {/* Title */}
      <div className="px-5 py-5 border-b border-pixel-border">
        <h3 className="font-pixel text-2xl text-pixel-gold leading-tight">{rec.career_name}</h3>
      </div>

      {/* Why it fits */}
      <div className="px-5 py-4 border-b border-pixel-border flex-1 space-y-2.5">
        {whyPoints.map((point, i) => (
          <div key={i} className="flex gap-3 items-start">
            <span className="text-pixel-gold text-xl flex-shrink-0 leading-none mt-0.5">▸</span>
            <span className="font-body text-sm text-pixel-muted leading-relaxed">{point}</span>
          </div>
        ))}
      </div>

      {/* Income + Growth */}
      <div className="grid grid-cols-2 divide-x divide-pixel-border border-b border-pixel-border">
        <div className="px-5 py-4">
          <p className="font-press text-xs text-pixel-muted mb-2">INCOME</p>
          <p className="font-press text-xs text-pixel-green leading-relaxed">{rec.estimated_income_range}</p>
        </div>
        <div className="px-5 py-4">
          <p className="font-press text-xs text-pixel-muted mb-2">GROWTH</p>
          <p className="font-body text-base text-pixel-text leading-snug">{growthLine}</p>
        </div>
      </div>

      {/* Skills */}
      <div className="px-5 py-4 border-b border-pixel-border">
        <p className="font-press text-xs text-pixel-muted mb-3">SKILLS NEEDED</p>
        <div className="flex flex-wrap gap-2">
          {rec.required_skills.map((skill, i) => (
            <span
              key={i}
              className="font-press text-xs text-pixel-blue border-2 border-pixel-blue px-3 py-1.5 leading-tight"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* First objective */}
      <div className="px-5 py-4 bg-pixel-bg/60">
        <p className="font-press text-xs text-pixel-blue mb-2">▶ FIRST OBJECTIVE</p>
        <p className="font-body text-base text-pixel-text leading-snug">{rec.first_action}</p>
      </div>
    </div>
  )
}
