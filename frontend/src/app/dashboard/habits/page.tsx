'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PixelLayout } from '@/components/layout/PixelLayout'
import { PixelPanel }  from '@/components/ui/PixelPanel'
import { PixelButton } from '@/components/ui/PixelButton'
import { HabitRow } from '@/components/habits/HabitRow'
import { SimpleProgressBar } from '@/components/habits/SimpleProgressBar'
import { isLoggedIn } from '@/lib/auth'
import { getHabits, toggleHabit, getMyBlueprint } from '@/lib/api'
import type { HabitListResponse } from '@/lib/types'
import { PENDING_ASSESSMENT_KEY } from '@/lib/constants'

export default function HabitTrackerPage() {
  const router = useRouter()
  const [habits,   setHabits]   = useState<HabitListResponse | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!isLoggedIn()) {
      router.replace('/login')
      return
    }
    try {
      const cachedRaw = typeof window !== 'undefined'
        ? window.sessionStorage.getItem(PENDING_ASSESSMENT_KEY)
        : null
      let seedArchetype: string | undefined
      if (cachedRaw) {
        seedArchetype = JSON.parse(cachedRaw).mbti_type
      } else {
        const bp = await getMyBlueprint()
        seedArchetype = bp.report?.submission.mbti_type
      }
      setHabits(await getHabits(seedArchetype))
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { load() }, [load])

  const handleToggle = async (habitId: string) => {
    setToggling(habitId)
    try {
      setHabits(await toggleHabit(habitId))
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

        {loading || !habits ? (
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
