'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

/**
 * Counts from 0 → `target` once the element scrolls into view, using
 * requestAnimationFrame with an expo-out curve. Respects reduced motion by
 * snapping straight to the target.
 *
 * Returns `[value, ref]` — attach `ref` to the element that should trigger it.
 */
export function useCountUp(
  target: number,
  { duration = 1400, reduced = false }: { duration?: number; reduced?: boolean } = {},
): [number, React.RefObject<HTMLSpanElement>] {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduced) { setValue(target); return }

    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3) // cubic-out
      setValue(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, duration, reduced])

  return [value, ref]
}
