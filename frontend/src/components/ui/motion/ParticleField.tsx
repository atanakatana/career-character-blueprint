'use client'

import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface ParticleFieldProps {
  /** particles per 100k px² of canvas — density scales with area */
  density?: number
  /** parallax follow of the pointer (0 = none) */
  parallax?: number
  className?: string
  /** hex colours to sample from (defaults to the pixel palette) */
  colors?: string[]
}

interface P {
  x: number; y: number; z: number      // z = depth 0.3–1 (parallax + size)
  size: number; vy: number; base: number
  tw: number; tws: number; color: string
}

/**
 * Canvas "pixel dust" field — tiny drifting, twinkling squares that give the
 * hero real depth. Everything runs on a single rAF loop drawing simple filled
 * rects (cheap, GPU-composited canvas). Design decisions:
 *
 *  • Squares, not circles → stays on-brand with the pixel-RPG identity.
 *  • Depth (`z`) drives size + parallax so nearer motes react more to the mouse.
 *  • IntersectionObserver pauses the loop when the field scrolls offscreen.
 *  • devicePixelRatio-aware for crispness; re-inits on resize (debounced).
 *  • prefers-reduced-motion → paints one static frame and never animates.
 */
export function ParticleField({
  density = 8,
  parallax = 14,
  className,
  colors = ['#F5C542', '#4DA6FF', '#5CE27A', '#8892A4'],
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let particles: P[] = []
    let raf = 0
    let running = true
    let w = 0, h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }

    const init = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.round((w * h) / 100000 * density)
      particles = Array.from({ length: count }, () => {
        const z = 0.3 + Math.random() * 0.7
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          size: Math.max(1, Math.round(z * 3)),
          vy: (0.08 + Math.random() * 0.22) * z,
          base: 0.25 + Math.random() * 0.5,
          tw: Math.random() * Math.PI * 2,
          tws: 0.008 + Math.random() * 0.02,
          color: colors[Math.floor(Math.random() * colors.length)],
        }
      })
    }

    const draw = (animate: boolean) => {
      ctx.clearRect(0, 0, w, h)
      pointer.x += (pointer.tx - pointer.x) * 0.06
      pointer.y += (pointer.ty - pointer.y) * 0.06

      for (const p of particles) {
        if (animate) {
          p.y -= p.vy
          if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w }
          p.tw += p.tws
        }
        const twinkle = 0.6 + Math.sin(p.tw) * 0.4
        const px = p.x + pointer.x * parallax * p.z
        const py = p.y + pointer.y * parallax * p.z
        ctx.globalAlpha = p.base * twinkle
        ctx.fillStyle = p.color
        ctx.fillRect(Math.round(px), Math.round(py), p.size, p.size)
      }
      ctx.globalAlpha = 1
    }

    const loop = () => {
      if (!running) return
      draw(true)
      raf = requestAnimationFrame(loop)
    }

    init()
    if (reduced) {
      draw(false) // single static frame
    } else {
      loop()
    }

    // Pause when offscreen
    const io = new IntersectionObserver(
      ([entry]) => {
        if (reduced) return
        if (entry.isIntersecting && !running) { running = true; loop() }
        else if (!entry.isIntersecting) { running = false; cancelAnimationFrame(raf) }
      },
      { threshold: 0 },
    )
    io.observe(canvas)

    // Pointer parallax (skip on touch)
    const fine = !window.matchMedia('(pointer: coarse)').matches
    const onMove = (e: MouseEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1
    }
    if (fine && !reduced && parallax > 0) {
      window.addEventListener('mousemove', onMove, { passive: true })
    }

    // Debounced resize
    let rt = 0
    const onResize = () => {
      clearTimeout(rt)
      rt = window.setTimeout(() => { init(); if (reduced) draw(false) }, 180)
    }
    window.addEventListener('resize', onResize)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
      clearTimeout(rt)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [density, parallax, reduced, colors.join(',')])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
