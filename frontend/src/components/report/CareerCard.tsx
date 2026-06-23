import type { CareerRecommendation } from '@/lib/types'

interface CareerCardProps {
  rec:   CareerRecommendation
  rank:  number
}

export function CareerCard({ rec, rank }: CareerCardProps) {
  const rankStr = String(rank).padStart(2, '0')

  return (
    <div className="border-2 border-pixel-border bg-pixel-panel shadow-pixel">

      {/* ── Card header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-pixel-bg border-b border-pixel-border">
        <div className="flex items-center gap-3">
          <span className="font-press text-[0.38rem] text-pixel-muted flex-shrink-0">
            #{rankStr}
          </span>
          <h3 className="font-press text-press-xs text-pixel-gold leading-tight">
            {rec.career_name}
          </h3>
        </div>
        <span className="pixel-tag-green flex-shrink-0 text-[0.36rem]">RECOMMENDED</span>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="divide-y divide-pixel-border">

        {/* Why it fits */}
        <div className="px-4 py-4">
          <p className="font-press text-[0.38rem] text-pixel-muted mb-2 uppercase tracking-wider">
            Why It Fits
          </p>
          <p className="font-body text-[15px] text-pixel-text leading-relaxed">
            {rec.why_it_fits}
          </p>
        </div>

        {/* First action */}
        <div className="px-4 py-4">
          <p className="font-press text-[0.38rem] text-pixel-blue mb-2 uppercase tracking-wider">
            ▶ First Action
          </p>
          <p className="font-body text-[15px] text-pixel-text leading-relaxed">
            {rec.first_action}
          </p>
        </div>

        {/* Required skills */}
        <div className="px-4 py-4">
          <p className="font-press text-[0.38rem] text-pixel-muted mb-2.5 uppercase tracking-wider">
            Required Skills
          </p>
          <div className="flex flex-wrap gap-2">
            {rec.required_skills.map((skill, i) => (
              <span
                key={i}
                className="font-press text-[0.38rem] text-pixel-blue border border-pixel-blue px-2 py-1 leading-tight"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Income + Growth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-pixel-border">
          <div className="px-4 py-4">
            <p className="font-press text-[0.38rem] text-pixel-muted mb-1.5 uppercase tracking-wider">
              Estimated Income
            </p>
            <p className="font-press text-press-xs text-pixel-green">
              {rec.estimated_income_range}
            </p>
          </div>
          <div className="px-4 py-4">
            <p className="font-press text-[0.38rem] text-pixel-muted mb-1.5 uppercase tracking-wider">
              Growth Potential
            </p>
            <p className="font-body text-[15px] text-pixel-text leading-relaxed">
              {rec.future_growth_potential}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
