import { PixelPanel } from '@/components/ui/PixelPanel'
import type { HabitListResponse } from '@/lib/types'

export function ProgressOverview({ habits }: { habits: HabitListResponse | null }) {
  const totalHabits  = habits?.habits.length ?? 0
  const bestStreak   = habits?.habits.reduce((max, h) => Math.max(max, h.current_streak), 0) ?? 0
  const completionPct = habits && habits.today_total > 0
    ? Math.round((habits.today_completed / habits.today_total) * 100)
    : 0

  return (
    <PixelPanel variant="subtle">
      <p className="font-press text-[0.4rem] uppercase tracking-widest text-pixel-muted mb-4">
        Progress Overview
      </p>
      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat value={totalHabits}     label="Habits"          />
        <Stat value={bestStreak}      label="Best Streak"     suffix="d" />
        <Stat value={`${completionPct}%`} label="Today" />
      </div>
    </PixelPanel>
  )
}

function Stat({ value, label, suffix = '' }: { value: number | string; label: string; suffix?: string }) {
  return (
    <div>
      <p className="font-pixel text-xl text-pixel-gold">{value}{suffix}</p>
      <p className="font-press text-[0.34rem] uppercase tracking-wide text-pixel-muted mt-1">{label}</p>
    </div>
  )
}
