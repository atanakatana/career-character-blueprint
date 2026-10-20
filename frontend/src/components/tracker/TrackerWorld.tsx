'use client'

import { useState } from 'react'
import { XPBar } from './XPBar'
import { CharacterSetup } from './CharacterSetup'
import { QuestList } from './QuestList'
import { LevelUpModal } from './LevelUpModal'
import { setGoal, generateQuests, completeQuest } from '@/lib/trackerApi'
import type { TrackerState } from '@/lib/types'

export function TrackerWorld({ initial }: { initial: TrackerState }) {
  const [tracker, setTracker] = useState(initial)
  const [levelUp, setLevelUp] = useState<number | null>(null)

  const handleSetGoal = async (job: string) => {
    const next = await setGoal(job)
    setTracker(next)
  }

  const handleGenerate = async (reading: string) => {
    const next = await generateQuests(reading, tracker.target_job ?? '')
    setTracker(next)
  }

  const handleComplete = async (questId: string) => {
    const res = await completeQuest(questId)
    setTracker(res.tracker)
    if (res.leveled_up) setLevelUp(res.tracker.level)
  }

  if (!tracker.target_job) {
    return <CharacterSetup onSubmit={handleSetGoal} />
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <p className="font-press text-[0.42rem] text-pixel-gold">✦ DESA LUMINA · TEMPAT KEMBALI</p>
        <h1 className="font-pixel text-base text-pixel-text">Langkah kecil. Petualangan besar.</h1>
        <p className="font-body text-sm text-pixel-muted">Tujuanmu: {tracker.target_job}</p>
      </div>

      <XPBar xp={tracker.xp} level={tracker.level} currentStreak={tracker.current_streak} />

      <QuestList
        quests={tracker.quests}
        targetJob={tracker.target_job}
        onComplete={handleComplete}
        onGenerate={handleGenerate}
      />

      {levelUp != null && <LevelUpModal level={levelUp} onClose={() => setLevelUp(null)} />}
    </div>
  )
}
