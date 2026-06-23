import type { BlueprintReportResponse } from '@/lib/types'

interface ReportHeroProps {
  report: BlueprintReportResponse
}

export function ReportHero({ report }: ReportHeroProps) {
  const { character_title, submission, created_at } = report

  // Extract short profile code: "3/5 — Martyr / Heretic"  →  "3/5"
  const profileCode =
    submission.hd_profile !== 'UNKNOWN' && submission.hd_profile.includes('—')
      ? submission.hd_profile.split('—')[0].trim()
      : submission.hd_profile

  const createdDate = new Date(created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="border-b-2 border-pixel-border bg-pixel-panel/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Label */}
        <p className="font-press text-[0.38rem] text-pixel-muted mb-2 uppercase tracking-widest">
          Character Class
        </p>

        {/* Title */}
        <h1 className="font-pixel text-3xl sm:text-4xl lg:text-5xl text-pixel-gold leading-tight mb-4">
          {character_title}
        </h1>

        {/* Type badges */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {submission.mbti_type !== 'UNKNOWN' && (
            <span className="pixel-tag">{submission.mbti_type}</span>
          )}
          {submission.hd_type !== 'UNKNOWN' && (
            <span className="pixel-tag-blue">{submission.hd_type}</span>
          )}
          {submission.hd_authority !== 'UNKNOWN' && (
            <span className="pixel-tag-muted">{submission.hd_authority}</span>
          )}
          {submission.hd_profile !== 'UNKNOWN' && (
            <span className="pixel-tag-muted">{profileCode}</span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <span className="font-press text-[0.38rem] text-pixel-muted">
            Prepared for&nbsp;<span className="text-pixel-text">{submission.nickname}</span>
          </span>
          <span className="font-press text-[0.34rem] text-pixel-border select-none">·</span>
          <span className="font-press text-[0.38rem] text-pixel-muted">
            {createdDate}
          </span>
          <span className="font-press text-[0.34rem] text-pixel-border select-none">·</span>
          <span className="font-press text-[0.38rem] text-pixel-muted">
            Character Career Blueprint
          </span>
        </div>

      </div>
    </div>
  )
}
