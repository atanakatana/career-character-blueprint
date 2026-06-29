'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminFetch, getToken } from '@/lib/adminApi'
import { StatusBadge }         from '@/components/admin/StatusBadge'
import { PixelButton }         from '@/components/ui/PixelButton'
import type { AdminSubmissionDetail } from '@/lib/adminTypes'

function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-pixel-border py-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
      <span className="font-press text-xs text-pixel-muted sm:pt-0.5">{label}</span>
      <span className="font-body text-base text-pixel-text sm:col-span-2 leading-relaxed">
        {value ?? '—'}
      </span>
    </div>
  )
}

export default function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const [data,         setData]         = useState<AdminSubmissionDetail | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [regenLoading, setRegenLoading] = useState(false)
  const [regenMsg,     setRegenMsg]     = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) return
    adminFetch<AdminSubmissionDetail>(`/admin/submissions/${params.id}`, token)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [params.id])

  const handleRegenerate = async () => {
    const token = getToken()
    if (!token || !data) return
    setRegenLoading(true)
    setRegenMsg('')
    try {
      await adminFetch(`/admin/submissions/${params.id}/regenerate`, token, { method: 'POST' })
      setRegenMsg('✓ Regeneration enqueued — check worker logs')
      setData(prev => prev ? { ...prev, status: 'pending' } : prev)
    } catch (e) {
      setRegenMsg(`✗ ${e instanceof Error ? e.message : 'Failed'}`)
    } finally {
      setRegenLoading(false)
    }
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/submissions"
              className="font-press text-xs text-pixel-muted hover:text-pixel-gold transition-colors">
          ◀ SUBMISSIONS
        </Link>
        <span className="font-press text-xs text-pixel-border">/</span>
        <span className="font-press text-xs text-pixel-gold">{params.id.slice(0, 8)}…</span>
      </div>

      {loading && <p className="font-press text-xs text-pixel-muted">Loading…</p>}
      {error   && <p className="font-press text-xs text-pixel-error">{error}</p>}

      {data && (
        <>
          {/* Title row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-pixel text-3xl text-pixel-gold">{data.nickname}</h1>
              <p className="font-body text-sm text-pixel-muted mt-1">{data.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={data.status} />
              <PixelButton
                variant={data.status === 'processing' ? 'ghost' : 'secondary'}
                size="md"
                onClick={handleRegenerate}
                disabled={regenLoading || data.status === 'processing'}
              >
                {regenLoading ? '…' : '↺ REGENERATE'}
              </PixelButton>
            </div>
          </div>
          {regenMsg && (
            <p className={`font-press text-xs mb-6 ${regenMsg.startsWith('✓') ? 'text-pixel-green' : 'text-pixel-error'}`}>
              {regenMsg}
            </p>
          )}

          {/* INPUT DATA */}
          <Section title="INPUT DATA">
            <Field label="MBTI TYPE"   value={data.mbti_type} />
            <Field label="HD TYPE"     value={data.hd_type} />
            <Field label="HD AUTHORITY" value={data.hd_authority} />
            <Field label="HD PROFILE"  value={data.hd_profile} />
            <Field label="OCCUPATION"  value={data.current_occupation} />
            <Field label="BURNOUT TRIGGERS" value={data.burnout_triggers} />
            <Field label="SUCCESS VISION"   value={data.success_vision} />
          </Section>

          {/* PROCESSING */}
          <Section title="PROCESSING">
            <Field label="STATUS"    value={<StatusBadge status={data.status} />} />
            <Field label="RETRIES"   value={String(data.retry_count)} />
            <Field label="TASK ID"   value={data.celery_task_id ?? '—'} />
            <Field label="STARTED"   value={fmt(data.processing_started_at)} />
            <Field label="COMPLETED" value={fmt(data.processing_completed_at)} />
            {data.error_message && (
              <Field label="ERROR"
                value={<span className="text-pixel-error font-body text-sm">{data.error_message}</span>} />
            )}
          </Section>

          {/* REPORT */}
          <Section title="REPORT">
            {data.report_token ? (
              <div className="py-4 flex items-center gap-4">
                <Link href={`/blueprint/${data.report_token}`} target="_blank">
                  <PixelButton variant="primary" size="md">VIEW REPORT ↗</PixelButton>
                </Link>
                <span className="font-press text-xs text-pixel-muted break-all">
                  token: {data.report_token}
                </span>
              </div>
            ) : (
              <div className="py-4">
                <p className="font-press text-xs text-pixel-muted">
                  {data.status === 'completed'
                    ? 'No report token found — check DB integrity'
                    : 'Report not generated yet'}
                </p>
              </div>
            )}
          </Section>
        </>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-2 border-pixel-border bg-pixel-panel mb-5"
         style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.6)' }}>
      <div className="bg-pixel-bg border-b border-pixel-border px-5 py-3">
        <span className="font-press text-xs text-pixel-gold">{title}</span>
      </div>
      <div className="px-5">{children}</div>
    </div>
  )
}
