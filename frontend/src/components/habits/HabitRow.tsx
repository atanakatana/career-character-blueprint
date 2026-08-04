import type { HabitItem } from '@/lib/types'

export function HabitRow({ habit, onToggle, disabled }: {
  habit: HabitItem
  onToggle: (id: string) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(habit.id)}
      disabled={disabled}
      className="w-full flex items-center gap-3 border border-pixel-border bg-pixel-bg px-3 py-2.5 text-left transition-colors hover:border-pixel-gold disabled:opacity-60"
    >
      <span
        className={`flex-shrink-0 w-5 h-5 flex items-center justify-center border-2 font-press text-[0.4rem] ${
          habit.completed_today
            ? 'bg-pixel-green border-pixel-green text-pixel-bg'
            : 'border-pixel-border text-transparent'
        }`}
      >
        ✓
      </span>
      <span className={`flex-1 font-body text-sm ${habit.completed_today ? 'text-pixel-muted line-through' : 'text-pixel-text'}`}>
        {habit.name}
      </span>
      {habit.current_streak > 0 && (
        <span className="font-press text-[0.36rem] text-pixel-gold whitespace-nowrap">
          🔥 {habit.current_streak}d
        </span>
      )}
    </button>
  )
}
