'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Shared backdrop for /login and /register — the only two screens in the
 * app using the glassmorphism treatment (per the brief: redesign only the
 * Login/Register UI, keep the rest of the pixel design system as-is).
 */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion()

  return (
    <div className="relative min-h-screen overflow-hidden bg-pixel-bg flex items-center justify-center px-4 py-12">

      {/* Aurora backdrop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className={`glass-orb -left-[10%] top-[10%] h-[45vw] w-[45vw] ${reduced ? '' : ''}`}
             style={{ background: 'radial-gradient(circle, rgba(245,197,66,0.30), transparent 60%)' }} />
        <div className="glass-orb right-[-10%] top-[30%] h-[40vw] w-[40vw]"
             style={{ background: 'radial-gradient(circle, rgba(77,166,255,0.28), transparent 60%)', animationDelay: '5s' }} />
        <div className="glass-orb bottom-[-15%] left-[25%] h-[38vw] w-[38vw]"
             style={{ background: 'radial-gradient(circle, rgba(92,226,122,0.20), transparent 60%)', animationDelay: '9s' }} />
      </div>

      {/* Logo */}
      <Link href="/" className="absolute top-6 left-6 z-10 flex items-center gap-2 group">
        <div className="w-7 h-7 bg-pixel-gold flex items-center justify-center flex-shrink-0 rounded-md">
          <span className="font-press text-[0.32rem] text-pixel-bg leading-none">R:L</span>
        </div>
        <span className="font-pixel text-sm text-pixel-gold">Re:Lumma</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-panel p-8">
          {children}
        </div>
      </motion.div>
    </div>
  )
}
