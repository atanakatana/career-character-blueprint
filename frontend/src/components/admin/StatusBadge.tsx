const COLORS: Record<string, string> = {
  pending:    'bg-pixel-gold    text-pixel-bg',
  processing: 'bg-pixel-blue   text-white',
  completed:  'bg-pixel-green  text-pixel-bg',
  failed:     'bg-pixel-error  text-white',
  sent:       'bg-pixel-green  text-pixel-bg',
  bounced:    'bg-pixel-gold   text-pixel-bg',
  error:      'bg-pixel-error  text-white',
}

export function StatusBadge({ status }: { status: string }) {
  const color = COLORS[status] ?? 'bg-pixel-border text-pixel-text'
  return (
    <span className={`font-press text-xs px-2.5 py-1 leading-tight inline-block ${color}`}>
      {status.toUpperCase()}
    </span>
  )
}
