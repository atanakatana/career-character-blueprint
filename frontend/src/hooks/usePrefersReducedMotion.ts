'use client'

import { useEffect, useState } from 'react'

/**
 * Returns `true` when the user has requested reduced motion at the OS level.
 * SSR-safe: defaults to `false` on the server, then syncs on mount and reacts
 * to live changes to the media query.
 *
 * Every ambient / looping animation in the landing page gates on this so we
 * honour `prefers-reduced-motion: reduce` without duplicating media queries.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)

    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
