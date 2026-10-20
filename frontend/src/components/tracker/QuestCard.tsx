'use client'

import { useState } from 'react'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { PixelButton } from '@/components/ui/PixelButton'
import type { TrackerQuest } from '@/lib/types'

interface QuestCardProps {
  quest:      TrackerQuest
  onComplete: (questId: string) => Promise<void>
}

export function QuestCard({ quest, onComplete }: QuestCardProps) {
  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    setLoading(true)
    try {
      await onComplete(quest.id)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PixelPanel variant="subtle" padding="md" className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-press text-[0.5rem] text-pixel-text">{quest.title}</h3>
        <span className="font-press text-[0.4rem] text-pixel-gold whitespace-nowrap">+{quest.xp_reward} XP</span>
      </div>
      <p className="font-body text-sm text-pixel-muted">{quest.description}</p>
      <div className="flex items-center justify-between pt-1">
        {quest.time_estimate && (
          <span className="font-press text-[0.38rem] text-pixel-muted">{quest.time_estimate}</span>
        )}
        <PixelButton variant="secondary" size="sm" disabled={loading} onClick={handleComplete}>
          {loading ? '…' : 'Selesai'}
        </PixelButton>
      </div>
    </PixelPanel>
  )
}
