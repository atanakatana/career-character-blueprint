'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getMe } from '@/lib/api'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { PixelButton } from '@/components/ui/PixelButton'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import type { UserProfile } from '@/lib/types'

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getMe().then(setUser).catch((err) => setError(err instanceof Error ? err.message : 'Could not load your profile.'))
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <AnimatedSection>
        <h1 className="font-pixel text-lg text-pixel-gold">
          {user ? `Welcome back, ${user.nickname}` : 'Welcome back'}
        </h1>
        {error && <p className="mt-2 font-press text-[0.38rem] text-pixel-error">{error}</p>}
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <PixelPanel padding="lg" className="space-y-4">
          <h2 className="font-press text-xs text-pixel-text">Habit Tracker</h2>
          <p className="font-body text-sm text-pixel-muted">
            Turn your daily career-growth actions into quests, XP, and streaks.
          </p>
          <Link href="/dashboard/tracker">
            <PixelButton variant="primary">Open Tracker</PixelButton>
          </Link>
        </PixelPanel>
      </AnimatedSection>
    </div>
  )
}
