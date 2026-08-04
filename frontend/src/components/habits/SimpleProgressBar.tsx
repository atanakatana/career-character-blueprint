export function SimpleProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-press text-[0.38rem] text-pixel-muted">TODAY&apos;S PROGRESS</span>
        <span className="font-press text-[0.38rem] text-pixel-gold">{completed}/{total}</span>
      </div>
      <div className="h-2.5 overflow-hidden border border-pixel-border bg-pixel-bg">
        <div
          className="h-full bg-pixel-green transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
