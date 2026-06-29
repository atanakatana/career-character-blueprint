'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminFetch, getToken } from '@/lib/adminApi'
import { StatusBadge }         from '@/components/admin/StatusBadge'
import type { PaginatedSubmissions, SubmissionListItem } from '@/lib/adminTypes'

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

interface Stats {
  total:      number
  completed:  number
  failed:     number
  pending:    number
}

function StatCard({ label, value, color = 'text-pixel-gold' }: {
  label: string; value: number | string; color?: string
}) {
  return (
    <div className="border-2 border-pixel-border bg-pixel-panel p-5"
         style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.6)' }}>
      <p className="font-press text-xs text-pixel-muted mb-3">{label}</p>
      <p className={`font-pixel text-5xl ${color}`}>{value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [recent,  setRecent]  = useState<SubmissionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) return

    Promise.all([
      adminFetch<PaginatedSubmissions>('/admin/submissions?limit=10', token),
      adminFetch<PaginatedSubmissions>('/admin/submissions?status=completed&limit=1', token),
      adminFetch<PaginatedSubmissions>('/admin/submissions?status=failed&limit=1', token),
      adminFetch<PaginatedSubmissions>('/admin/submissions?status=pending&limit=1', token),
    ])
      .then(([all, completed, failed, pending]) => {
        setStats({
          total:     all.total,
          completed: completed.total,
          failed:    failed.total,
          pending:   pending.total,
        })
        setRecent(all.items)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 sm:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <p className="font-press text-xs text-pixel-muted mb-1">ADMIN</p>
        <h1 className="font-press text-sm text-pixel-gold">DASHBOARD</h1>
      </div>

      {loading && <p className="font-press text-xs text-pixel-muted">Loading…</p>}
      {error   && <p className="font-press text-xs text-pixel-error">{error}</p>}

      {stats && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard label="TOTAL"     value={stats.total}     color="text-pixel-gold"  />
            <StatCard label="COMPLETED" value={stats.completed} color="text-pixel-green" />
            <StatCard label="FAILED"    value={stats.failed}    color="text-pixel-error" />
            <StatCard label="PENDING"   value={stats.pending}   color="text-pixel-blue"  />
          </div>

          {/* Recent submissions */}
          <div className="border-2 border-pixel-border bg-pixel-panel"
               style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.6)' }}>
            <div className="border-b border-pixel-border px-5 py-3 flex items-center justify-between">
              <span className="font-press text-xs text-pixel-gold">RECENT SUBMISSIONS</span>
              <Link href="/admin/submissions"
                    className="font-press text-xs text-pixel-muted hover:text-pixel-gold transition-colors">
                VIEW ALL →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-pixel-border bg-pixel-bg">
                    {['NICKNAME','EMAIL','MBTI · HD','STATUS','DATE'].map(h => (
                      <th key={h} className="font-press text-xs text-pixel-muted py-3 px-4 text-left whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map(s => (
                    <tr key={s.id}
                        className="border-b border-pixel-border hover:bg-pixel-panel-hover transition-colors">
                      <td className="py-3 px-4">
                        <Link href={`/admin/submissions/${s.id}`}
                              className="font-press text-xs text-pixel-gold hover:underline">
                          {s.nickname}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-body text-sm text-pixel-muted">{s.email}</td>
                      <td className="py-3 px-4 font-press text-xs text-pixel-muted whitespace-nowrap">
                        {s.mbti_type} · {s.hd_type}
                      </td>
                      <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                      <td className="py-3 px-4 font-body text-sm text-pixel-muted whitespace-nowrap">
                        {fmt(s.created_at)}
                      </td>
                    </tr>
                  ))}
                  {recent.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center font-press text-xs text-pixel-muted">
                      No submissions yet
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
