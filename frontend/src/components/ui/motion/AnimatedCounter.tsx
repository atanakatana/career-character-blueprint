'use client'

import { useCountUp } from '@/hooks/useCountUp'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

interface AnimatedCounterProps {
  to: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}

/**
 * Counts up to `to` when scrolled into view. Snaps instantly under
 * prefers-reduced-motion. Renders an inline <span> so it drops into headings.
 */
export function AnimatedCounter({ to, suffix = '', prefix = '', duration, className }: AnimatedCounterProps) {
  const reduced = usePrefersReducedMotion()
  const [value, ref] = useCountUp(to, { duration, reduced })
  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}{value}{suffix}
    </span>
  )
}
