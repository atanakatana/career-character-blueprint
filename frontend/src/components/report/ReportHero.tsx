import type { BlueprintReportResponse } from '@/lib/types'

export function ReportHero({ report }: { report: BlueprintReportResponse }) {
  const { character_title, submission, created_at } = report

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
        <p className="font-press text-xs text-pixel-muted mb-3 uppercase tracking-widest">
          Blueprint Archetype
        </p>
        <h1 className="font-pixel text-4xl sm:text-5xl text-pixel-gold leading-tight mb-5">
          {character_title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {submission.mbti_type !== 'UNKNOWN' && (
            <span className="pixel-tag font-press text-xs px-3 py-1.5">{submission.mbti_type}</span>
          )}
          {submission.hd_type !== 'UNKNOWN' && (
            <span className="pixel-tag-blue font-press text-xs px-3 py-1.5">{submission.hd_type}</span>
          )}
          {submission.hd_authority !== 'UNKNOWN' && (
            <span className="pixel-tag-muted font-press text-xs px-3 py-1.5">{submission.hd_authority}</span>
          )}
          {submission.hd_profile !== 'UNKNOWN' && (
            <span className="pixel-tag-muted font-press text-xs px-3 py-1.5">{profileCode}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="font-press text-xs text-pixel-muted">
            For&nbsp;<span className="text-pixel-text">{submission.nickname}</span>
          </span>
          <span className="font-press text-xs text-pixel-muted">{createdDate}</span>
        </div>
      </div>
    </div>
  )
}
