'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PixelLayout } from '@/components/layout/PixelLayout'
import { WelcomeCard }      from '@/components/dashboard/WelcomeCard'
import { BlueprintCard }    from '@/components/dashboard/BlueprintCard'
import { TodayHabitsCard }  from '@/components/dashboard/TodayHabitsCard'
import { ProgressOverview } from '@/components/dashboard/ProgressOverview'
import { isLoggedIn, clearToken } from '@/lib/auth'
import {
  getMe, getMyBlueprint, getHabits, toggleHabit,
  createSubmission, createPayment,
} from '@/lib/api'
import type { UserProfile, MyBlueprintResponse, HabitListResponse, SubmissionFormData } from '@/lib/types'
import { PENDING_ASSESSMENT_KEY } from '@/lib/constants'

export default function DashboardPage() {
  const router = useRouter()
  const params = useSearchParams()
  const tierParam = params.get('tier')

  const [profile,   setProfile]   = useState<UserProfile | null>(null)
  const [blueprint, setBlueprint] = useState<MyBlueprintResponse | null>(null)
  const [habits,    setHabits]    = useState<HabitListResponse | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [toggling,  setToggling]  = useState(false)

  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError,   setCheckoutError]   = useState('')
  const [hasPendingAnswers, setHasPendingAnswers] = useState(false)

  const load = useCallback(async () => {
    if (!isLoggedIn()) {
      router.replace('/login')
      return
    }

    // getMe() is the auth-gating call — this app uses a single long-lived
    // JWT with no refresh flow, so a failure here is almost always an
    // expired or invalid token. Previously an uncaught rejection here left
    // the page stuck on "Loading your dashboard…" forever (loading became
    // false via the old single finally block, but profile was never set,
    // and the render guard is `loading || !profile`). Clear the stale token
    // and send the user back to log in instead of a dead end.
    let me: UserProfile
    try {
      me = await getMe()
    } catch {
      clearToken()
      router.replace('/login')
      return
    }
    setProfile(me)

    try {
      let bp = await getMyBlueprint()

      // If we're not unlocked yet but have a cached free-assessment answer
      // set (from the Trial Reading step), try to kick off the real,
      // payment-gated submission automatically — this is what lets the
      // user skip re-filling the form after login/payment.
      const cachedRaw = typeof window !== 'undefined'
        ? window.sessionStorage.getItem(PENDING_ASSESSMENT_KEY)
        : null

      setHasPendingAnswers(!!cachedRaw)

      if (bp.status === 'none' && cachedRaw) {
        try {
          const cached = JSON.parse(cachedRaw) as SubmissionFormData
          await createSubmission({ ...cached, email: me.email })
          window.sessionStorage.removeItem(PENDING_ASSESSMENT_KEY)
          setHasPendingAnswers(false)
          bp = await getMyBlueprint()
        } catch {
          // 402 (payment required) is the expected case pre-checkout —
          // just fall through and let the BlueprintCard show the
          // "Complete Checkout" CTA. Any other error is silently ignored
          // here too; the user can retry via the checkout button.
        }
      }

      setBlueprint(bp)

      const seedArchetype = cachedRaw
        ? (JSON.parse(cachedRaw) as SubmissionFormData).mbti_type
        : bp.report?.submission.mbti_type
      const h = await getHabits(seedArchetype)
      setHabits(h)
    } catch {
      // Profile already loaded successfully at this point — blueprint/habits
      // are secondary data. Let the page render with whatever did load
      // rather than dead-ending; BlueprintCard/TodayHabitsCard/
      // ProgressOverview all already handle a null value.
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { load() }, [load])

  const handleToggle = async (habitId: string) => {
    setToggling(true)
    try {
      const updated = await toggleHabit(habitId)
      setHabits(updated)
    } finally {
      setToggling(false)
    }
  }

  const handleStartCheckout = async () => {
    if (!profile || !tierParam) return
    setCheckoutError('')
    setCheckoutLoading(true)
    try {
      const { payment_url } = await createPayment({ email: profile.email, tier: tierParam })
      window.location.href = payment_url
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Could not start checkout.')
      setCheckoutLoading(false)
    }
  }

  if (loading || !profile) {
    return (
      <PixelLayout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <span className="font-vt text-4xl text-pixel-gold animate-pixel-float inline-block">◆</span>
          <p className="font-press text-xs text-pixel-muted mt-4">Loading your dashboard…</p>
        </div>
      </PixelLayout>
    )
  }

  return (
    <PixelLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-5">
        <div className="flex items-center justify-between">
          <span className="font-press text-[0.4rem] text-pixel-muted">◆ DASHBOARD</span>
          <button
            onClick={() => { clearToken(); router.push('/') }}
            className="font-press text-[0.4rem] text-pixel-muted hover:text-pixel-error transition-colors"
          >
            Log Out
          </button>
        </div>

        <WelcomeCard nickname={profile.nickname} />

        <BlueprintCard
          blueprint={blueprint}
          selectedTier={tierParam}
          hasPendingAnswers={hasPendingAnswers}
          checkoutLoading={checkoutLoading}
          checkoutError={checkoutError}
          onStartCheckout={handleStartCheckout}
        />

        <TodayHabitsCard habits={habits} onToggle={handleToggle} toggling={toggling} />

        <ProgressOverview habits={habits} />
      </div>
    </PixelLayout>
  )
}
