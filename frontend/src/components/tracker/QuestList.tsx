'use client'

import { useState } from 'react'
import { QuestCard } from './QuestCard'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { PixelTextarea } from '@/components/ui/PixelTextarea'
import { PixelButton } from '@/components/ui/PixelButton'
import type { TrackerQuest } from '@/lib/types'

interface QuestListProps {
  quests:          TrackerQuest[]
  targetJob:       string
  onComplete:      (questId: string) => Promise<void>
  onGenerate:      (reading: string) => Promise<void>
}

const MIN_READING_LENGTH = 30

export function QuestList({ quests, targetJob, onComplete, onGenerate }: QuestListProps) {
  const [reading, setReading] = useState('')
  const [generating, setGenerating] = useState(false)
  const [notice, setNotice] = useState('')

  const handleGenerate = async () => {
    if (reading.trim().length < MIN_READING_LENGTH) {
      setNotice(`Tambahkan ringkasan bacaan minimal ${MIN_READING_LENGTH} karakter agar quest punya konteks.`)
      return
    }
    setNotice('')
    setGenerating(true)
    try {
      await onGenerate(reading.trim())
      setReading('')
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Personalisasi belum tersedia. Coba lagi nanti.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {quests.length === 0 ? (
          <PixelPanel variant="subtle" padding="md">
            <p className="font-body text-sm text-pixel-muted">
              Semua misi hari ini selesai. Buat quest baru di bawah, atau kembali lagi besok.
            </p>
          </PixelPanel>
        ) : (
          quests.map((q) => <QuestCard key={q.id} quest={q} onComplete={onComplete} />)
        )}
      </div>

      <PixelPanel padding="md" className="space-y-3">
        <h3 className="font-press text-[0.42rem] text-pixel-muted uppercase tracking-widest">
          Bacaan karier &amp; arahmu: {targetJob}
        </h3>
        <PixelTextarea
          label="Ringkasan bacaan hari ini"
          value={reading}
          onChange={(e) => setReading(e.target.value)}
          placeholder="Ceritakan apa yang kamu baca/pelajari hari ini terkait arah kariermu…"
          rows={4}
          maxCount={4000}
        />
        {notice && <p className="font-press text-[0.38rem] text-pixel-error">{notice}</p>}
        <PixelButton variant="primary" size="sm" disabled={generating} onClick={handleGenerate}>
          {generating ? 'Menyusun quest…' : 'Buat Quest Personal'}
        </PixelButton>
      </PixelPanel>
    </div>
  )
}
