'use client'

import { motion, useScroll, useSpring } from 'framer-motion'

/**
 * Fixed 2px reading-progress bar pinned to the top of the viewport, filling as
 * the page scrolls. Uses the native scroll progress (0–1) scaled on the X axis
 * — a single GPU transform, no scroll listeners of our own. Purely decorative,
 * so it is aria-hidden.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })

  return (
    <motion.div
      aria-hidden
      className="fixed left-0 top-0 z-[60] h-0.5 w-full origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #F5C542, #4DA6FF, #5CE27A)',
        boxShadow: '0 0 8px rgba(245,197,66,0.6)',
      }}
    />
  )
}
