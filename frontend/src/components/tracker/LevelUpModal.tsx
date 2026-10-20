'use client'

import { PixelPanel } from '@/components/ui/PixelPanel'
import { PixelButton } from '@/components/ui/PixelButton'

interface LevelUpModalProps {
  level:   number
  onClose: () => void
}

export function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Level up"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <PixelPanel
        padding="lg"
        className="max-w-sm w-full text-center space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-press text-[0.42rem] text-pixel-gold">LEVEL UP · LV {level}</p>
        <div className="text-4xl">✦</div>
        <h2 className="font-pixel text-base text-pixel-text">Satu langkah lebih jauh.</h2>
        <PixelButton variant="primary" onClick={onClose} className="w-full">
          Mengerti
        </PixelButton>
      </PixelPanel>
    </div>
  )
}
