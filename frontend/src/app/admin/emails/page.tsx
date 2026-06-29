'use client'

import { useEffect, useState } from 'react'
import { adminFetch, getToken } from '@/lib/adminApi'
import { StatusBadge }         from '@/components/admin/StatusBadge'
import type { EmailLogItem }   from '@/lib/adminTypes'

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function EmailsPage() {
  const [logs,    setLogs]    = useState<EmailLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) return
    adminFetch<EmailLogItem[]>('/admin/emails', token)
      .then(setLogs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 sm:p-8 max-w-6xl">
      <div className="mb-6">
        <p className="font-press text-xs text-pixel-muted mb-1">ADMIN</p>
        <h1 className="font-press text-sm text-pixel-gold">EMAIL LOGS</h1>
        {!loading && <p className="font-press text-xs text-pixel-muted mt-1">{logs.length} entries</p>}
      </div>

      {loading && <p className="font-press text-xs text-pixel-muted">Loading…</p>}
      {error   && <p className="font-press text-xs text-pixel-error">{error}</p>}

      {!loading && (
        <div className="border-2 border-pixel-border bg-pixel-panel"
             style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.6)' }}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-pixel-border bg-pixel-bg">
                  {['RECIPIENT','TYPE','STATUS','RESEND ID','DATE'].map(h => (
                    <th key={h} className="font-press text-xs text-pixel-muted py-3 px-4 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}
                      className="border-b border-pixel-border hover:bg-pixel-panel-hover transition-colors">
                    <td className="py-3 px-4 font-body text-sm text-pixel-text">{log.recipient_email}</td>
                    <td className="py-3 px-4 font-press text-xs text-pixel-muted">{log.email_type}</td>
                    <td className="py-3 px-4"><StatusBadge status={log.status} /></td>
                    <td className="py-3 px-4 font-body text-sm text-pixel-muted">
                      {log.resend_message_id
                        ? <span className="text-pixel-green">{log.resend_message_id}</span>
                        : <span className="text-pixel-muted/50">—</span>}
                    </td>
                    <td className="py-3 px-4 font-body text-sm text-pixel-muted whitespace-nowrap">
                      {fmt(log.created_at)}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center font-press text-xs text-pixel-muted">
                    No email logs yet
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Error detail rows */}
          {logs.some(l => l.error_message) && (
            <div className="border-t border-pixel-border px-5 py-4">
              <p className="font-press text-xs text-pixel-error mb-3">DELIVERY ERRORS</p>
              {logs.filter(l => l.error_message).map(l => (
                <div key={l.id} className="flex gap-3 py-2 border-b border-pixel-border last:border-0">
                  <span className="font-body text-sm text-pixel-muted flex-shrink-0">{l.recipient_email}</span>
                  <span className="font-body text-sm text-pixel-error">{l.error_message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
