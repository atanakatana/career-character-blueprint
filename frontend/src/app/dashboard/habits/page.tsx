'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PixelLayout } from '@/components/layout/PixelLayout'
import { PixelPanel }  from '@/components/ui/PixelPanel'
import { PixelButton } from '@/components/ui/PixelButton'
import { HabitRow } from '@/components/habits/HabitRow'
import { SimpleProgressBar } from '@/components/habits/SimpleProgressBar'
import { isLoggedIn, clearToken } from '@/lib/auth'
import { getHabits, toggleHabit, getMyBlueprint } from '@/lib/api'
import type { HabitListResponse } from '@/lib/types'
import { PENDING_ASSESSMENT_KEY } from '@/lib/constants'

export default function HabitTrackerPage() {
  const router = useRouter()
  const [habits,      setHabits]      = useState<HabitListResponse | null>(null)
  const [locked,      setLocked]      = useState(false)
  const [loading,     setLoading]     = useState(true)
  const [toggling,    setToggling]    = useState<string | null>(null)
  const [toggleError, setToggleError] = useState('')

  const load = useCallback(async () => {
    if (!isLoggedIn()) {
      router.replace('/login')
      return
    }
    try {
      const bp = await getMyBlueprint()

      // Habit Tracker is a tier2 (Blueprint + Tracker) perk — the backend
      // 403s a tier1 request, so check first rather than calling and
      // handling the rejection.
      if (bp.tier !== 'tier2') {
        setLocked(true)
        return
      }

      const cachedRaw = typeof window !== 'undefined'
        ? window.sessionStorage.getItem(PENDING_ASSESSMENT_KEY)
        : null
      const seedArchetype = cachedRaw
        ? JSON.parse(cachedRaw).mbti_type
        : bp.report?.submission.mbti_type
      setHabits(await getHabits(seedArchetype))
    } catch {
      // Every call on this page requires auth and there's no partial state
      // worth rendering without habits data, so any failure here (almost
      // always an expired/invalid token — this app has no refresh flow) is
      // treated as a session problem. Previously this left the page stuck
      // on "Loading your habits…" forever (see dashboard/page.tsx for the
      // same bug, fixed the same way).
      clearToken()
      router.replace('/login')
      return
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { load() }, [load])

  const handleToggle = async (habitId: string) => {
    setToggling(habitId)
    setToggleError('')
    try {
      setHabits(await toggleHabit(habitId))
    } catch (err) {
      // Previously a failed toggle (network blip, stale habit, etc.) failed
      // silently — the checkbox just visually reset via `finally` with no
      // indication anything went wrong. Surface it instead.
      setToggleError(err instanceof Error ? err.message : 'Could not update that habit. Please try again.')
    } finally {
      setToggling(null)
    }
  }

  return (
    <PixelLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-5">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="font-press text-xs text-pixel-muted hover:text-pixel-gold transition-colors">
            ◀ Dashboard
          </Link>
          <span className="font-press text-[0.4rem] text-pixel-muted">◆ HABIT TRACKER</span>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <span className="font-vt text-4xl text-pixel-gold animate-pixel-float inline-block">◆</span>
            <p className="font-press text-xs text-pixel-muted mt-4">Loading your habits…</p>
          </div>
        ) : locked ? (
          <PixelPanel>
            <p className="font-press text-[0.4rem] uppercase tracking-widest text-pixel-muted mb-2">
              Habit Tracker
            </p>
            <p className="font-body text-sm text-pixel-muted mb-4">
              The Habit Tracker is part of the Blueprint + Tracker plan.
            </p>
            <Link href="/#pricing">
              <PixelButton variant="ghost" size="sm">▶ Upgrade to Unlock</PixelButton>
            </Link>
          </PixelPanel>
        ) : !habits ? (
          <div className="text-center py-16">
            <span className="font-vt text-4xl text-pixel-gold animate-pixel-float inline-block">◆</span>
            <p className="font-press text-xs text-pixel-muted mt-4">Loading your habits…</p>
          </div>
        ) : (
          <>
            <PixelPanel>
              <SimpleProgressBar completed={habits.today_completed} total={habits.today_total} />
            </PixelPanel>

            <PixelPanel>
              <p className="font-press text-[0.4rem] uppercase tracking-widest text-pixel-muted mb-4">
                Daily Habits
              </p>
              {toggleError && (
                <p role="alert" className="font-press text-[0.38rem] text-pixel-error mb-3">✕ {toggleError}</p>
              )}
              <div className="space-y-2">
                {habits.habits.map((h) => (
                  <HabitRow key={h.id} habit={h} onToggle={handleToggle} disabled={toggling === h.id} />
                ))}
              </div>
            </PixelPanel>

            <div className="text-center">
              <Link href="/dashboard">
                <PixelButton variant="ghost" size="sm">◀ Back to Dashboard</PixelButton>
              </Link>
            </div>
          </>
        )}
      </div>
    </PixelLayout>
  )
}
