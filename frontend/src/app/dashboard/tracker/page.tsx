'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getTracker, UpgradeRequiredError } from '@/lib/trackerApi'
import { TrackerWorld } from '@/components/tracker/TrackerWorld'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { PixelButton } from '@/components/ui/PixelButton'
import type { TrackerState } from '@/lib/types'

type Status = 'loading' | 'upgrade' | 'error' | 'ready'

export default function TrackerPage() {
  const [status, setStatus] = useState<Status>('loading')
  const [tracker, setTracker] = useState<TrackerState | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getTracker()
      .then((t) => { setTracker(t); setStatus('ready') })
      .catch((err) => {
        if (err instanceof UpgradeRequiredError) { setStatus('upgrade'); return }
        setError(err instanceof Error ? err.message : 'Gagal memuat tracker.')
        setStatus('error')
      })
  }, [])

  if (status === 'loading') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center font-press text-xs text-pixel-muted">
        Memuat…
      </div>
    )
  }

  if (status === 'upgrade') {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <PixelPanel padding="lg" className="text-center space-y-4">
          <h1 className="font-pixel text-base text-pixel-gold">Fitur Tier 2</h1>
          <p className="font-body text-sm text-pixel-muted">
            Habit Tracker tersedia untuk paket Career Blueprint + Habit Tracker.
          </p>
          <Link href="/pricing">
            <PixelButton variant="primary" className="w-full">Lihat Paket</PixelButton>
          </Link>
        </PixelPanel>
      </div>
    )
  }

  if (status === 'error' || tracker === null) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <p className="font-press text-[0.4rem] text-pixel-error">{error}</p>
        <PixelButton variant="secondary" onClick={() => window.location.reload()}>
          Coba Lagi
        </PixelButton>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <TrackerWorld initial={tracker} />
    </div>
  )
}
