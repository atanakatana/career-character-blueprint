'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminFetch, getToken } from '@/lib/adminApi'
import { StatusBadge }         from '@/components/admin/StatusBadge'
import { PixelButton }         from '@/components/ui/PixelButton'
import type { PaginatedSubmissions, SubmissionListItem } from '@/lib/adminTypes'

const STATUSES = ['all', 'pending', 'processing', 'completed', 'failed']
const LIMIT    = 20

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function SubmissionsPage() {
  const [data,      setData]      = useState<PaginatedSubmissions | null>(null)
  const [filter,    setFilter]    = useState('all')
  const [skip,      setSkip]      = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) return
    setLoading(true)
    const status = filter !== 'all' ? `&status=${filter}` : ''
    adminFetch<PaginatedSubmissions>(
      `/admin/submissions?skip=${skip}&limit=${LIMIT}${status}`, token
    )
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [filter, skip])

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0
  const currentPage = Math.floor(skip / LIMIT) + 1

  const handleFilter = (s: string) => { setFilter(s); setSkip(0) }

  return (
    <div className="p-6 sm:p-8 max-w-6xl">
      <div className="mb-6">
        <p className="font-press text-xs text-pixel-muted mb-1">ADMIN</p>
        <h1 className="font-press text-sm text-pixel-gold">SUBMISSIONS</h1>
        {data && <p className="font-press text-xs text-pixel-muted mt-1">{data.total} total</p>}
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-0 mb-6 border-2 border-pixel-border w-fit">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => handleFilter(s)}
            className={`font-press text-xs px-4 py-2.5 transition-colors border-r border-pixel-border last:border-0
              ${filter === s
                ? 'bg-pixel-gold text-pixel-bg'
                : 'text-pixel-muted hover:text-pixel-text'
              }`}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      {loading && <p className="font-press text-xs text-pixel-muted">Loading…</p>}
      {error   && <p className="font-press text-xs text-pixel-error">{error}</p>}

      {data && (
        <>
          <div className="border-2 border-pixel-border bg-pixel-panel"
               style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.6)' }}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-pixel-border bg-pixel-bg">
                    {['#ID','NICKNAME','EMAIL','TYPE','STATUS','DATE',''].map(h => (
                      <th key={h} className="font-press text-xs text-pixel-muted py-3 px-4 text-left whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((s: SubmissionListItem) => (
                    <tr key={s.id}
                        className="border-b border-pixel-border hover:bg-pixel-panel-hover transition-colors">
                      <td className="py-3 px-4 font-press text-xs text-pixel-muted">
                        {s.id.slice(0, 8)}…
                      </td>
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
                      <td className="py-3 px-4">
                        <Link href={`/admin/submissions/${s.id}`}>
                          <PixelButton variant="ghost" size="sm">VIEW</PixelButton>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {data.items.length === 0 && (
                    <tr><td colSpan={7} className="py-8 text-center font-press text-xs text-pixel-muted">
                      No submissions match this filter
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-4 mt-5">
              <PixelButton variant="secondary" size="sm"
                onClick={() => setSkip(Math.max(0, skip - LIMIT))}
                disabled={skip === 0}>
                ◀ PREV
              </PixelButton>
              <span className="font-press text-xs text-pixel-muted">
                {currentPage} / {totalPages}
              </span>
              <PixelButton variant="secondary" size="sm"
                onClick={() => setSkip(skip + LIMIT)}
                disabled={currentPage >= totalPages}>
                NEXT ▶
              </PixelButton>
            </div>
          )}
        </>
      )}
    </div>
  )
}
