import Link from 'next/link'
import { PixelPanel }  from '@/components/ui/PixelPanel'
import { PixelButton } from '@/components/ui/PixelButton'
import { HabitRow } from '@/components/habits/HabitRow'
import { SimpleProgressBar } from '@/components/habits/SimpleProgressBar'
import type { HabitListResponse } from '@/lib/types'

export function TodayHabitsCard({ habits, onToggle, toggling, error, locked }: {
  habits:   HabitListResponse | null
  onToggle: (id: string) => void
  toggling: boolean
  error?:   string
  locked?:  boolean
}) {
  if (locked) {
    return (
      <PixelPanel>
        <p className="font-press text-[0.4rem] uppercase tracking-widest text-pixel-muted mb-2">
          Today&apos;s Habits
        </p>
        <p className="font-body text-sm text-pixel-muted mb-4">
          The Habit Tracker is part of the Blueprint + Tracker plan.
        </p>
        <Link href="/#pricing">
          <PixelButton variant="ghost" size="sm">▶ Upgrade to Unlock</PixelButton>
        </Link>
      </PixelPanel>
    )
  }

  if (!habits || habits.habits.length === 0) {
    return (
      <PixelPanel>
        <p className="font-press text-[0.4rem] uppercase tracking-widest text-pixel-muted mb-2">
          Today&apos;s Habits
        </p>
        <p className="font-body text-sm text-pixel-muted">
          Your habit tracker will appear here once it&apos;s set up.
        </p>
      </PixelPanel>
    )
  }

  return (
    <PixelPanel>
      <div className="flex items-center justify-between mb-3">
        <p className="font-press text-[0.4rem] uppercase tracking-widest text-pixel-muted">
          Today&apos;s Habits
        </p>
        <Link href="/dashboard/habits" className="font-press text-[0.36rem] text-pixel-blue hover:text-pixel-gold transition-colors">
          View all ▸
        </Link>
      </div>

      {error && (
        <p role="alert" className="font-press text-[0.38rem] text-pixel-error mb-3">✕ {error}</p>
      )}

      <div className="space-y-2 mb-4">
        {habits.habits.slice(0, 4).map((h) => (
          <HabitRow key={h.id} habit={h} onToggle={onToggle} disabled={toggling} />
        ))}
      </div>

      <SimpleProgressBar completed={habits.today_completed} total={habits.today_total} />

      <div className="mt-4">
        <Link href="/dashboard/habits">
          <PixelButton variant="ghost" size="sm">◆ Open Habit Tracker</PixelButton>
        </Link>
      </div>
    </PixelPanel>
  )
}
