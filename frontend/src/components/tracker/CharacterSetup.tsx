'use client'

import { useState } from 'react'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { PixelSelect } from '@/components/ui/PixelSelect'
import { PixelButton } from '@/components/ui/PixelButton'

// Ported verbatim from the original standalone prototype's character
// creation step.
const JOBS = [
  'Software Engineer', 'UI/UX Designer', 'Data Analyst',
  'Content Writer', 'Digital Marketer', 'Product Manager', 'Video Editor',
]

interface CharacterSetupProps {
  onSubmit: (targetJob: string) => Promise<void>
}

export function CharacterSetup({ onSubmit }: CharacterSetupProps) {
  const [job, setJob] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!job) { setError('Pilih tujuan kariermu dulu.'); return }
    setError('')
    setLoading(true)
    try {
      await onSubmit(job)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan tujuan.')
      setLoading(false)
    }
  }

  return (
    <PixelPanel padding="lg" className="space-y-4 max-w-md mx-auto">
      <div className="text-center space-y-1">
        <p className="font-press text-[0.42rem] text-pixel-gold">✦ DESA LUMINA · TEMPAT KEMBALI</p>
        <h2 className="font-pixel text-base text-pixel-text">Langkah kecil. Petualangan besar.</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PixelSelect
          label="Tujuanmu"
          options={JOBS.map((j) => ({ value: j, label: j }))}
          value={job}
          onChange={(e) => setJob(e.target.value)}
        />
        {error && <p role="alert" className="font-press text-[0.38rem] text-pixel-error">{error}</p>}
        <PixelButton type="submit" variant="primary" disabled={loading} className="w-full">
          {loading ? 'Menyimpan…' : 'Mulai'}
        </PixelButton>
      </form>
    </PixelPanel>
  )
}
