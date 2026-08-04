import { PixelPanel } from '@/components/ui/PixelPanel'

export function WelcomeCard({ nickname }: { nickname: string }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <PixelPanel>
      <p className="font-press text-[0.4rem] uppercase tracking-widest text-pixel-muted mb-2">
        {greeting}
      </p>
      <h1 className="font-pixel text-2xl text-pixel-gold">{nickname}</h1>
      <p className="mt-2 font-body text-sm text-pixel-muted">
        Welcome back to your Re:Lumma dashboard.
      </p>
    </PixelPanel>
  )
}
