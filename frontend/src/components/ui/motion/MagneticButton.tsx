'use client'

import { motion } from 'framer-motion'
import { useRef, useState, type ReactNode, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'
import { useMagnetic } from '@/hooks/useMagnetic'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface Ripple { id: number; x: number; y: number }

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  /** magnetic pull strength (0 disables) */
  strength?: number
  /** ripple + glow accent colour */
  glow?: string
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit'
  disabled?: boolean
  'aria-label'?: string
}

/**
 * A motion wrapper that adds three premium micro-interactions to any content:
 *  1. Magnetic pull toward the cursor (spring-backed, via useMagnetic).
 *  2. Material-style ripple on click, originating at the pointer.
 *  3. A soft radial glow that tracks the cursor across the surface.
 *
 * It is intentionally unstyled beyond layout so callers can drop a `.pixel-btn`
 * (or anything) inside and keep the existing design system. All effects are
 * disabled under prefers-reduced-motion.
 */
export function MagneticButton({
  children,
  className,
  strength = 0.35,
  glow = 'rgba(245,197,66,0.55)',
  onClick,
  type = 'button',
  disabled,
  ...aria
}: MagneticButtonProps) {
  const reduced = usePrefersReducedMotion()
  const { ref, x, y, onMouseMove, onMouseLeave } = useMagnetic(strength, !reduced && !disabled)
  const [ripples, setRipples] = useState<Ripple[]>([])
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50, on: false })
  const idRef = useRef(0)

  const handleMove = (e: MouseEvent) => {
    onMouseMove(e)
    if (reduced) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setGlowPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      on: true,
    })
  }

  const handleLeave = () => {
    onMouseLeave()
    setGlowPos((g) => ({ ...g, on: false }))
  }

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!reduced && !disabled) {
      const rect = e.currentTarget.getBoundingClientRect()
      const id = idRef.current++
      setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
      setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 600)
    }
    onClick?.(e)
  }

  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      style={reduced ? undefined : { x, y }}
      className={cn('relative overflow-hidden', className)}
      {...aria}
    >
      {/* cursor-tracking glow */}
      {!reduced && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: glowPos.on ? 1 : 0,
            background: `radial-gradient(120px circle at ${glowPos.x}% ${glowPos.y}%, ${glow}, transparent 70%)`,
          }}
        />
      )}

      {/* ripples */}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          aria-hidden
          className="pointer-events-none absolute rounded-full"
          style={{ left: r.x, top: r.y, background: glow, translateX: '-50%', translateY: '-50%' }}
          initial={{ width: 0, height: 0, opacity: 0.5 }}
          animate={{ width: 320, height: 320, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}

      <span className="relative z-10 inline-flex items-center justify-center">{children}</span>
    </motion.button>
  )
}
