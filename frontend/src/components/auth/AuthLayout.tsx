import { PixelLayout } from '@/components/layout/PixelLayout'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { AnimatedSection } from '@/components/ui/AnimatedSection'

/** Shared centered-panel shell for /login and /register. */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <PixelLayout>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <AnimatedSection className="w-full max-w-md">
          <PixelPanel padding="lg">{children}</PixelPanel>
        </AnimatedSection>
      </div>
    </PixelLayout>
  )
}
