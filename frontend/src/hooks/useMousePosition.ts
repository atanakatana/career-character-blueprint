'use client'

import { useEffect, useState } from 'react'

export interface NormalizedPointer {
  /** -1 (left) … 1 (right) relative to viewport centre */
  x: number
  /** -1 (top) … 1 (bottom) relative to viewport centre */
  y: number
}

/**
 * Tracks the pointer as a normalized (-1…1) offset from the viewport centre.
 * Used to drive parallax layers in the hero. Listener is passive and cheap;
 * consumers multiply by their own depth factor.
 *
 * Disabled entirely when `enabled` is false (e.g. reduced motion / touch),
 * returning a static centre value so parallax collapses to nothing.
 */
export function useMousePosition(enabled = true): NormalizedPointer {
  const [pos, setPos] = useState<NormalizedPointer>({ x: 0, y: 0 })

  useEffect(() => {
    if (!enabled) return
    // Skip on coarse pointers (touch) — no hover to track.
    if (window.matchMedia('(pointer: coarse)').matches) return

    let frame = 0
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        setPos({
          x: (e.clientX / window.innerWidth) * 2 - 1,
          y: (e.clientY / window.innerHeight) * 2 - 1,
        })
      })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [enabled])

  return pos
}
