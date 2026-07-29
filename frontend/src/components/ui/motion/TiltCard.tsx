'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, useState, type ReactNode, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface TiltCardProps {
  children: ReactNode
  className?: string
  /** max rotation in degrees at the edges */
  max?: number
  /** show a cursor-tracking spotlight sheen */
  spotlight?: boolean
  spotlightColor?: string
  /** lift + scale on hover */
  lift?: boolean
}

/**
 * 3D pointer-tilt container with an optional spotlight sheen. Rotation is
 * spring-smoothed so it feels weighty rather than jittery, and the whole thing
 * collapses to a plain div under prefers-reduced-motion.
 *
 * Used for the pricing "collectible cards" and feature cards.
 */
export function TiltCard({
  children,
  className,
  max = 10,
  spotlight = true,
  spotlightColor = 'rgba(245,197,66,0.14)',
  lift = true,
}: TiltCardProps) {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const [hover, setHover] = useState(false)

  const rotX = useSpring(useTransform(my, [0, 1], [max, -max]), { stiffness: 200, damping: 20 })
  const rotY = useSpring(useTransform(mx, [0, 1], [-max, max]), { stiffness: 200, damping: 20 })
  const [sheen, setSheen] = useState({ x: 50, y: 50 })

  const onMove = (e: MouseEvent) => {
    if (reduced || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    mx.set(px); my.set(py)
    setSheen({ x: px * 100, y: py * 100 })
  }

  const onLeave = () => {
    mx.set(0.5); my.set(0.5); setHover(false)
  }

  if (reduced) {
    return <div className={cn('relative', className)}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={onLeave}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d', transformPerspective: 900 }}
      animate={lift ? { scale: hover ? 1.03 : 1, z: hover ? 40 : 0 } : undefined}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={cn('relative', className)}
    >
      {children}
      {spotlight && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: hover ? 1 : 0,
            background: `radial-gradient(circle at ${sheen.x}% ${sheen.y}%, ${spotlightColor}, transparent 60%)`,
          }}
        />
      )}
    </motion.div>
  )
}
