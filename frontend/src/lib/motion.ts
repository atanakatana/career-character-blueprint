/**
 * Shared framer-motion variants + easing tokens.
 *
 * Centralising these keeps every landing section visually consistent and makes
 * the motion system easy to tune globally. All variants are GPU-friendly
 * (transform + opacity only) and animate on `whileInView`.
 *
 * Reduced-motion: components read `usePrefersReducedMotion()` and pass the
 * `static`/disabled variants, or skip the wrapper entirely. Keep transforms
 * modest so the fallback (opacity-only) still reads well.
 */
import type { Variants, Transition } from 'framer-motion'

// ── Easing curves ─────────────────────────────────────────────────────────────
/** Expo-out — the "premium deceleration" used by Linear / Vercel / Framer. */
export const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]
/** Gentle in-out for looping ambient motion. */
export const EASE_IN_OUT: [number, number, number, number] = [0.45, 0, 0.55, 1]
/** Snappy back-ease for pops (badges, icons). */
export const EASE_BACK: [number, number, number, number] = [0.34, 1.56, 0.64, 1]

// ── Viewport config (single source of truth) ─────────────────────────────────
export const VIEWPORT = { once: true, margin: '-12% 0px -12% 0px' } as const

// ── Reveal variants ───────────────────────────────────────────────────────────
export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 32 },
  visible: (d: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT_EXPO, delay: d },
  }),
}

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: (d: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.9, ease: EASE_OUT_EXPO, delay: d },
  }),
}

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.9 },
  visible: (d: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_BACK, delay: d },
  }),
}

export const slideInLeft: Variants = {
  hidden:  { opacity: 0, x: -48 },
  visible: (d: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE_OUT_EXPO, delay: d },
  }),
}

export const slideInRight: Variants = {
  hidden:  { opacity: 0, x: 48 },
  visible: (d: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE_OUT_EXPO, delay: d },
  }),
}

/** Clip-path wipe — used for the "codex unsealing" reveal. */
export const wipeUp: Variants = {
  hidden:  { opacity: 0, clipPath: 'inset(100% 0% 0% 0%)' },
  visible: (d: number = 0) => ({
    opacity: 1,
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: { duration: 0.8, ease: EASE_OUT_EXPO, delay: d },
  }),
}

// ── Stagger orchestration ─────────────────────────────────────────────────────
export const staggerContainer: Variants = {
  hidden:  {},
  visible: (stagger: number = 0.09) => ({
    transition: { staggerChildren: stagger, delayChildren: 0.05 },
  }),
}

/** Child used inside a `staggerContainer`. */
export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 28, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
}

// ── Ambient loops (for decorative layers only) ────────────────────────────────
export const floatLoop = (distance = 8, duration = 6): Transition & { y: number[] } => ({
  y: [0, -distance, 0],
  duration,
  repeat: Infinity,
  ease: EASE_IN_OUT,
})

/** Opacity-only variant used when the user prefers reduced motion. */
export const reducedReveal: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
}
