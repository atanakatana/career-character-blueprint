'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isLoggedIn } from '@/lib/auth'
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

  return <PixelLayout>{children}</PixelLayout>
}
