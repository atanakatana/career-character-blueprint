'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

import { PixelPanel }    from '@/components/ui/PixelPanel'
import { PixelButton }   from '@/components/ui/PixelButton'
import { PixelProgressBar } from '@/components/ui/PixelProgressBar'

import { Step1_Identity }    from './Step1_Identity'
import { Step2_MBTI }        from './Step2_MBTI'
import { Step3_HumanDesign } from './Step3_HumanDesign'
import { Step4_Career }      from './Step4_Career'
import { Step5_Review }      from './Step5_Review'
import { TrialReadingScreen } from '@/components/trial/TrialReadingScreen'

import {
  INITIAL_FORM_STATE,
  validateStep,
  type FormState,
  type FormErrors,
} from '@/lib/validation'
import { getTrialReading } from '@/lib/api'
import type { TrialReadingResponse } from '@/lib/types'
import { FORM_STEPS, PENDING_ASSESSMENT_KEY } from '@/lib/constants'

const STEP_LABELS = FORM_STEPS.map(s => s.label)

export function CharacterCreationForm({ prefillEmail }: { prefillEmail?: string }) {
  const router = useRouter()
  const [formData, setFormData] = useState<FormState>({
    ...INITIAL_FORM_STATE,
    ...(prefillEmail ? { email: prefillEmail } : {}),
  })

  const [step,         setStep]         = useState(1)
  const [direction,    setDirection]    = useState<1 | -1>(1)
  const [errors,       setErrors]       = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError,  setSubmitError]  = useState<string | null>(null)
  const [trialData,    setTrialData]    = useState<TrialReadingResponse | null>(null)

  // ── Field update ────────────────────────────────────────────────────────────
  const handleChange = useCallback((field: keyof FormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear the error for this field immediately on change
    setErrors(prev => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  // ── Navigation ──────────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    const stepErrors = validateStep(step, formData)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    setErrors({})
    setDirection(1)
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step, formData])

  const handleBack = useCallback(() => {
    setErrors({})
    setDirection(-1)
    setStep(s => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleGoToStep = useCallback((target: number) => {
    setErrors({})
    setDirection(target < step ? -1 : 1)
    setStep(target)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  // ── Submit ──────────────────────────────────────────────────────────────────
  // The assessment is free and gated behind nothing. Submitting it produces
  // an instant Trial Reading (computed from static knowledge, not an AI
  // call) — no email, no payment, no account needed yet. The full answers
  // are cached so that if the user later unlocks the Complete Blueprint,
  // they never have to fill this form out a second time.
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const reading = await getTrialReading({
        mbti_type:    formData.mbti_type,
        hd_type:      formData.hd_type,
        hd_authority: formData.hd_authority,
        hd_profile:   formData.hd_profile,
      })

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(PENDING_ASSESSMENT_KEY, JSON.stringify(formData))
      }

      setTrialData(reading)
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Could not build your Trial Reading. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }, [formData])

  // ── Trial Reading revealed — replaces the wizard entirely ───────────────────
  if (trialData) {
    return (
      <TrialReadingScreen
        reading={trialData}
        onUnlock={() => router.push('/#pricing')}
      />
    )
  }

  // ── Step renderer ───────────────────────────────────────────────────────────
  const stepProps = { data: formData, errors, onChange: handleChange }

  const stepContent: Record<number, React.ReactNode> = {
    1: <Step1_Identity   {...stepProps} />,
    2: <Step2_MBTI       {...stepProps} />,
    3: <Step3_HumanDesign {...stepProps} />,
    4: <Step4_Career     {...stepProps} />,
    5: (
      <Step5_Review
        data={formData}
        isSubmitting={isSubmitting}
        submitError={submitError}
        onSubmit={handleSubmit}
        onGoToStep={handleGoToStep}
      />
    ),
  }

  const isLastStep  = step === 5
  const isFirstStep = step === 1

  // Slide direction matches navigation direction
  const variants = {
    enter:   (dir: number) => ({ opacity: 0, x: dir > 0 ?  32 : -32 }),
    center:  ()            => ({ opacity: 1, x: 0 }),
    exit:    (dir: number) => ({ opacity: 0, x: dir > 0 ? -32 :  32 }),
  }

  return (
    <div className="w-full space-y-6">

      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="font-pixel text-xl text-pixel-gold">Re:Lumma Blueprint</h1>
        <p className="font-press text-[0.4rem] text-pixel-muted">
          STEP {step} OF {FORM_STEPS.length} — {FORM_STEPS[step - 1].title.toUpperCase()}
        </p>
      </div>

      {/* Progress bar */}
      <PixelProgressBar
        currentStep={step}
        totalSteps={5}
        labels={STEP_LABELS}
      />

      {/* Animated step panel */}
      <PixelPanel>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            {stepContent[step]}
          </motion.div>
        </AnimatePresence>
      </PixelPanel>

      {/* Navigation — hidden on Step 5 (has its own submit button) */}
      {!isLastStep && (
        <div className="flex items-center justify-between gap-4">
          {isFirstStep ? (
            <div /> // spacer so Next stays right-aligned on step 1
          ) : (
            <PixelButton
              variant="ghost"
              size="md"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              ◀&nbsp; Back
            </PixelButton>
          )}

          <PixelButton
            variant="primary"
            size="md"
            onClick={handleNext}
          >
            {step === 4 ? 'Review ▶' : 'Next ▶'}
          </PixelButton>
        </div>
      )}

      {/* Step 5: only Back button (submit is inside the step) */}
      {isLastStep && (
        <div className="flex">
          <PixelButton
            variant="ghost"
            size="md"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            ◀&nbsp; Back
          </PixelButton>
        </div>
      )}

    </div>
  )
}
