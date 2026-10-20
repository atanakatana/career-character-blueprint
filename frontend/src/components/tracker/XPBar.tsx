import { cn } from '@/lib/utils'

interface XPBarProps {
  xp:             number
  level:          number
  currentStreak:  number
  xpPerLevel?:    number
  className?:     string
}

export function XPBar({ xp, level, currentStreak, xpPerLevel = 100, className }: XPBarProps) {
  const intoLevel = xp % xpPerLevel
  const pct = Math.min(100, Math.round((intoLevel / xpPerLevel) * 100))

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between font-press text-[0.42rem] text-pixel-muted">
        <span>LV {level}</span>
        <span>{intoLevel}/{xpPerLevel} XP</span>
        {currentStreak > 0 && <span className="text-pixel-gold">🔥 {currentStreak}d</span>}
      </div>
      <div
        className="h-3 w-full border-2 border-pixel-border bg-pixel-panel"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-pixel-gold transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
