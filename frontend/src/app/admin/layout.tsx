'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const isLogin  = pathname === '/admin/login'
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (isLogin) { setReady(true); return }
    const token = sessionStorage.getItem('admin_token')
    if (!token) {
      router.replace('/admin/login')
    } else {
      setReady(true)
    }
  }, [isLogin, router])

  // Login page: full-screen, no sidebar
  if (isLogin) {
    return <div className="min-h-screen bg-pixel-bg">{children}</div>
  }

  // Wait for auth check to avoid flash
  if (!ready) return null

  return (
    <div className="flex min-h-screen bg-pixel-bg">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  )
}
