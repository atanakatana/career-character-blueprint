'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { MagneticButton, ParticleField } from '@/components/ui/motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { fadeUp, staggerContainer, staggerItem, VIEWPORT, EASE_OUT_EXPO } from '@/lib/motion'

const FAQS = [
  { q: 'What exactly is a Re:Lumma Blueprint?', a: 'A 10-section personalised reading that treats your career identity like an RPG character sheet — your class, strengths, blind spots, ideal arenas, and a concrete action plan, all derived from your actual personality and energy design.' },
  { q: 'How do MBTI and Human Design work together?', a: 'MBTI maps how you think and decide; Human Design maps how your energy wants to operate. On their own each is partial. Read together, they reveal patterns — synergies and tensions — that neither framework shows alone. Our AI synthesis focuses on that intersection.' },
  { q: 'Do I need to know my Human Design already?', a: 'It helps, but no. The form links you to free tools to find your Type, Authority and Profile in a couple of minutes. If you only know your MBTI, you can still proceed.' },
  { q: 'Do I have to pay before I see anything?', a: 'No. Complete the free assessment first and you\'ll get an instant Trial Reading — your archetype, core strengths, and energy type — with no email or payment required. Your Complete Blueprint unlocks after checkout.' },
  { q: 'What is the Habit Tracker?', a: 'The Blueprint + Tracker package adds a personal dashboard where your Blueprint\'s recommendations become daily habits — track completions, keep streaks, and see progress toward your career goals.' },
  { q: 'Is my data private?', a: 'Your inputs are used only to generate your Blueprint. Your full Blueprint lives behind a unique unguessable link that only you receive by email, or in your account dashboard once you\'ve unlocked it.' },
]

export function FaqSection() {
  const reduced = usePrefersReducedMotion()
  const router = useRouter()
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="relative px-4 py-28 sm:px-6" aria-label="Frequently asked questions">
      <div className="mx-auto max-w-3xl">
        <motion.div className="mb-12 text-center" variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}>
          <p className="mb-3 font-press text-[0.42rem] uppercase tracking-widest text-pixel-muted">Before you begin</p>
          <h2 className="font-pixel text-3xl text-pixel-text sm:text-4xl">
            Frequently asked <span className="fx-gradient-text">questions</span>
          </h2>
        </motion.div>

        <motion.div
          className="space-y-3"
          variants={staggerContainer} custom={0.06}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-8%' }}
        >
          {FAQS.map((item, i) => {
            const isOpen = open === i
            return (
              <motion.div key={item.q} variants={staggerItem}>
                <div className={`border-2 bg-pixel-panel transition-colors duration-300 ${isOpen ? 'border-pixel-gold' : 'border-pixel-border'}`}
                     style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.5)' }}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                  >
                    <span className={`font-press text-[0.46rem] leading-relaxed ${isOpen ? 'text-pixel-gold' : 'text-pixel-text'}`}>
                      {item.q}
                    </span>
                    <motion.span
                      aria-hidden
                      animate={{ rotate: isOpen ? 135 : 0 }}
                      transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                      className={`flex-shrink-0 ${isOpen ? 'text-pixel-gold' : 'text-pixel-muted'}`}
                    >
                      <Plus className="h-4 w-4" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${i}`}
                        key="content"
                        initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                        exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 font-body text-sm leading-relaxed text-pixel-muted">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* ── Closing band with floating background ─────────────────────── */}
      <div className="relative mx-auto mt-24 max-w-4xl overflow-hidden border-2 border-pixel-gold bg-pixel-panel"
           style={{ boxShadow: '6px 6px 0 rgba(0,0,0,0.6)' }}>
        <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden>
          <ParticleField density={6} parallax={8} colors={['#F5C542', '#4DA6FF']} />
        </div>
        <div className="pointer-events-none absolute inset-0" aria-hidden
             style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(245,197,66,0.08), transparent 70%)' }} />

        <motion.div
          className="relative px-6 py-14 text-center"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT}
        >
          <span className="pixel-tag animate-pixel-pulse">READY?</span>
          <h3 className="mx-auto mt-5 max-w-xl font-pixel text-2xl leading-tight text-pixel-text sm:text-3xl">
            Your career codex is waiting to be <span className="fx-gradient-text">written</span>
          </h3>
          <p className="mx-auto mt-4 max-w-md font-body text-sm text-pixel-muted">
            Answer 9 questions. Receive a Blueprint built from who you actually are.
          </p>
          <div className="mt-8 flex justify-center">
            <MagneticButton
              onClick={() => router.push('/create')}
              aria-label="Start your journey"
              className="pixel-btn-primary px-7 py-3.5 text-press-sm"
            >
              <span className="inline-flex items-center gap-2">▶ Start Your Journey</span>
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
