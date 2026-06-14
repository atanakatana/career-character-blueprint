import { PixelNavbar } from './PixelNavbar'
import { PixelFooter } from './PixelFooter'

interface PixelLayoutProps {
  children: React.ReactNode
  /** Hide navbar and footer for immersive pages (e.g. blueprint report) */
  bare?: boolean
}

export function PixelLayout({ children, bare = false }: PixelLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-pixel-bg">
      {!bare && <PixelNavbar />}
      <main className="flex-1 w-full">
        {children}
      </main>
      {!bare && <PixelFooter />}
    </div>
  )
}
