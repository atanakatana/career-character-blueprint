'use client'

import { useEffect, useState } from 'react'
import { adminFetch, getToken } from '@/lib/adminApi'
import { StatusBadge }         from '@/components/admin/StatusBadge'

interface PaymentItem {
  id:               string
  created_at:       string
  email:            string
  tier:             string
  status:           string
  amount:           number
  mayar_product_id: string | null
  payment_url:      string | null
  paid_at:          string | null
}

function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtRp(amount: number) {
  return `Rp ${amount.toLocaleString('id-ID')}`
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) return
    adminFetch<PaymentItem[]>('/payments/admin', token)
      .then(setPayments)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const paid    = payments.filter(p => p.status === 'paid').length
  const pending = payments.filter(p => p.status === 'pending').length
  const revenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="p-6 sm:p-8 max-w-6xl">
      <div className="mb-6">
        <p className="font-press text-xs text-pixel-muted mb-1">ADMIN</p>
        <h1 className="font-press text-sm text-pixel-gold">PAYMENTS</h1>
      </div>

      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'TOTAL',   value: payments.length, color: 'text-pixel-gold'  },
            { label: 'PAID',    value: paid,            color: 'text-pixel-green' },
            { label: 'PENDING', value: pending,         color: 'text-pixel-blue'  },
            { label: 'REVENUE', value: fmtRp(revenue),  color: 'text-pixel-green' },
          ].map(card => (
            <div key={card.label} className="border-2 border-pixel-border bg-pixel-panel p-4"
                 style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.6)' }}>
              <p className="font-press text-xs text-pixel-muted mb-2">{card.label}</p>
              <p className={`font-pixel text-3xl ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {loading && <p className="font-press text-xs text-pixel-muted">Loading…</p>}
      {error   && <p className="font-press text-xs text-pixel-error">{error}</p>}

      {!loading && (
        <div className="border-2 border-pixel-border bg-pixel-panel"
             style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.6)' }}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-pixel-border bg-pixel-bg">
                  {['EMAIL','TIER','STATUS','AMOUNT','PAID AT','CREATED'].map(h => (
                    <th key={h} className="font-press text-xs text-pixel-muted py-3 px-4 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-b border-pixel-border hover:bg-pixel-panel-hover">
                    <td className="py-3 px-4 font-body text-sm text-pixel-text">{p.email}</td>
                    <td className="py-3 px-4">
                      <span className={`font-press text-xs px-2 py-1 leading-tight ${
                        p.tier === 'tier2' ? 'bg-pixel-blue text-white' : 'bg-pixel-gold text-pixel-bg'
                      }`}>
                        {p.tier === 'tier2' ? 'TIER 2' : 'TIER 1'}
                      </span>
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                    <td className="py-3 px-4 font-press text-xs text-pixel-green">{fmtRp(p.amount)}</td>
                    <td className="py-3 px-4 font-body text-sm text-pixel-muted whitespace-nowrap">{fmt(p.paid_at)}</td>
                    <td className="py-3 px-4 font-body text-sm text-pixel-muted whitespace-nowrap">{fmt(p.created_at)}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center font-press text-xs text-pixel-muted">
                    No payments yet
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
