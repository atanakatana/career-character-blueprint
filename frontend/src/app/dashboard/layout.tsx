'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isLoggedIn, logout } from '@/lib/auth'
import { PixelLayout } from '@/components/layout/PixelLayout'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login')
    } else {
      setReady(true)
    }
  }, [router])

  // Wait for the auth check to avoid flashing protected content.
  if (!ready) return null

  return (
    <PixelLayout>
      <div className="border-b-2 border-pixel-border bg-pixel-panel/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-11 flex items-center justify-between">
          <Link href="/dashboard" className="font-press text-[0.4rem] text-pixel-gold uppercase tracking-widest">
            Dashboard
          </Link>
          <button
            onClick={logout}
            className="font-press text-[0.4rem] text-pixel-muted hover:text-pixel-text uppercase tracking-widest"
          >
            Log out
          </button>
        </div>
      </div>
      {children}
    </PixelLayout>
  )
}
