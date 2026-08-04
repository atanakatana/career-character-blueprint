'use client'

import Link from 'next/link'
import { PixelButton } from '@/components/ui/PixelButton'
import { isLoggedIn } from '@/lib/auth'

export function PixelNavbar() {
  const loggedIn = isLoggedIn()

  return (
    <header className="w-full border-b-2 border-pixel-border bg-pixel-panel/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div
            className="w-8 h-8 bg-pixel-gold flex items-center justify-center flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"
            style={{ boxShadow: '2px 2px 0px #C4A033' }}
          >
            <span className="font-press text-[0.4rem] text-pixel-bg leading-none">R:L</span>
          </div>
          <span className="font-pixel text-base text-pixel-gold hidden sm:block">
            Re:Lumma
          </span>
        </Link>

        {/* Nav */}
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <Link href="/dashboard">
              <PixelButton variant="secondary" size="sm">
                ◆ Dashboard
              </PixelButton>
            </Link>
          ) : (
            <Link href="/login" className="font-press text-xs text-pixel-muted hover:text-pixel-gold transition-colors hidden sm:block">
              Log In
            </Link>
          )}

          <Link href="/create">
            <PixelButton variant="primary" size="sm">
              ▶ Start Quest
            </PixelButton>
          </Link>
        </div>

      </div>
    </header>
  )
}
