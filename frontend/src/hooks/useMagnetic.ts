'use client'

import { useRef, useCallback } from 'react'
import { useMotionValue, useSpring, type MotionValue } from 'framer-motion'

interface MagneticApi {
  ref: React.RefObject<HTMLElement>
  x: MotionValue<number>
  y: MotionValue<number>
  onMouseMove: (e: React.MouseEvent) => void
  onMouseLeave: () => void
}

/**
 * Magnetic-pull effect: the element eases toward the cursor while hovered,
 * then springs back to origin on leave. Returns spring-backed motion values so
 * the caller can bind them to a `motion` element's `style={{ x, y }}`.
 *
 * @param strength  fraction of the cursor offset to follow (0.2–0.5 feels good)
 * @param enabled   set false for reduced-motion / touch to disable the pull
 */
export function useMagnetic(strength = 0.35, enabled = true): MagneticApi {
  const ref = useRef<HTMLElement>(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 260, damping: 18, mass: 0.4 })
  const y = useSpring(rawY, { stiffness: 260, damping: 18, mass: 0.4 })

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled || !ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const relX = e.clientX - (rect.left + rect.width / 2)
      const relY = e.clientY - (rect.top + rect.height / 2)
      rawX.set(relX * strength)
      rawY.set(relY * strength)
    },
    [enabled, strength, rawX, rawY],
  )

  const onMouseLeave = useCallback(() => {
    rawX.set(0)
    rawY.set(0)
  }, [rawX, rawY])

  return { ref, x, y, onMouseMove, onMouseLeave }
}
