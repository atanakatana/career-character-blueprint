'use client'

import { useEffect, useState } from 'react'
import { adminFetch, getToken } from '@/lib/adminApi'
import { PixelButton }         from '@/components/ui/PixelButton'
import type { PromptTemplate } from '@/lib/adminTypes'

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function PromptsPage() {
  const [prompts,   setPrompts]   = useState<PromptTemplate[]>([])
  const [selected,  setSelected]  = useState<string | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [actionMsg, setActionMsg] = useState('')

  // New prompt form
  const [showForm,   setShowForm]   = useState(false)
  const [formName,   setFormName]   = useState('')
  const [formVer,    setFormVer]    = useState('')
  const [formSystem, setFormSystem] = useState('')
  const [formText,   setFormText]   = useState('')
  const [formNotes,  setFormNotes]  = useState('')
  const [saving,     setSaving]     = useState(false)

  const load = () => {
    const token = getToken()
    if (!token) return
    adminFetch<PromptTemplate[]>('/admin/prompts', token)
      .then(setPrompts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const activate = async (id: string) => {
    const token = getToken()
    if (!token) return
    setActionMsg('')
    try {
      await adminFetch(`/admin/prompts/${id}/activate`, token, { method: 'PUT' })
      setActionMsg('✓ Template activated')
      load()
    } catch (e) {
      setActionMsg(`✗ ${e instanceof Error ? e.message : 'Failed'}`)
    }
  }

  const createPrompt = async () => {
    const token = getToken()
    if (!token || !formName || !formVer || !formSystem || !formText) {
      setActionMsg('✗ Name, version, system context, and prompt text are required')
      return
    }
    setSaving(true)
    setActionMsg('')
    try {
      await adminFetch('/admin/prompts', token, {
        method: 'POST',
        body: { name: formName, version: formVer, system_context: formSystem, prompt_text: formText, notes: formNotes || null },
      })
      setActionMsg('✓ Template created')
      setShowForm(false)
      setFormName(''); setFormVer(''); setFormSystem(''); setFormText(''); setFormNotes('')
      load()
    } catch (e) {
      setActionMsg(`✗ ${e instanceof Error ? e.message : 'Failed'}`)
    } finally {
      setSaving(false)
    }
  }

  const selectedPrompt = prompts.find(p => p.id === selected)

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-press text-xs text-pixel-muted mb-1">ADMIN</p>
          <h1 className="font-press text-sm text-pixel-gold">PROMPT TEMPLATES</h1>
        </div>
        <PixelButton variant="secondary" size="sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ CANCEL' : '+ NEW TEMPLATE'}
        </PixelButton>
      </div>

      {actionMsg && (
        <p className={`font-press text-xs mb-5 ${actionMsg.startsWith('✓') ? 'text-pixel-green' : 'text-pixel-error'}`}>
          {actionMsg}
        </p>
      )}

      {loading && <p className="font-press text-xs text-pixel-muted">Loading…</p>}
      {error   && <p className="font-press text-xs text-pixel-error">{error}</p>}

      {/* Prompt list */}
      {!loading && (
        <div className="border-2 border-pixel-border bg-pixel-panel mb-6"
             style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.6)' }}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-pixel-border bg-pixel-bg">
                {['NAME','VERSION','STATUS','CREATED',''].map(h => (
                  <th key={h} className="font-press text-xs text-pixel-muted py-3 px-4 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prompts.map(p => (
                <tr key={p.id}
                    className={`border-b border-pixel-border transition-colors cursor-pointer
                      ${selected === p.id ? 'bg-pixel-gold/5' : 'hover:bg-pixel-panel-hover'}`}
                    onClick={() => setSelected(selected === p.id ? null : p.id)}>
                  <td className="py-3 px-4 font-press text-xs text-pixel-text">{p.name}</td>
                  <td className="py-3 px-4 font-press text-xs text-pixel-muted">{p.version}</td>
                  <td className="py-3 px-4">
                    {p.is_active
                      ? <span className="font-press text-xs text-pixel-bg bg-pixel-green px-2.5 py-1">ACTIVE</span>
                      : <span className="font-press text-xs text-pixel-muted">inactive</span>}
                  </td>
                  <td className="py-3 px-4 font-body text-sm text-pixel-muted">{fmt(p.created_at)}</td>
                  <td className="py-3 px-4">
                    {!p.is_active && (
                      <PixelButton variant="ghost" size="sm"
                        onClick={e => { e.stopPropagation(); activate(p.id) }}>
                        ACTIVATE
                      </PixelButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Expanded prompt view */}
      {selectedPrompt && (
        <div className="border-2 border-pixel-gold bg-pixel-panel mb-6"
             style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.6)' }}>
          <div className="bg-pixel-bg border-b border-pixel-border px-5 py-3 flex items-center justify-between">
            <span className="font-press text-xs text-pixel-gold">
              {selectedPrompt.name} · v{selectedPrompt.version}
            </span>
            <button onClick={() => setSelected(null)}
                    className="font-press text-xs text-pixel-muted hover:text-pixel-text">✕</button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <p className="font-press text-xs text-pixel-muted mb-2">SYSTEM CONTEXT</p>
              <textarea readOnly rows={4} value={selectedPrompt.system_context}
                className="w-full bg-pixel-bg border border-pixel-border text-pixel-text
                           font-body text-sm p-3 resize-none focus:outline-none" />
            </div>
            <div>
              <p className="font-press text-xs text-pixel-muted mb-2">PROMPT TEXT</p>
              <textarea readOnly rows={12} value={selectedPrompt.prompt_text}
                className="w-full bg-pixel-bg border border-pixel-border text-pixel-text
                           font-body text-sm p-3 resize-y focus:outline-none" />
            </div>
            {selectedPrompt.notes && (
              <div>
                <p className="font-press text-xs text-pixel-muted mb-2">NOTES</p>
                <p className="font-body text-sm text-pixel-muted">{selectedPrompt.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New prompt form */}
      {showForm && (
        <div className="border-2 border-pixel-border bg-pixel-panel"
             style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.6)' }}>
          <div className="bg-pixel-bg border-b border-pixel-border px-5 py-3">
            <span className="font-press text-xs text-pixel-gold">NEW TEMPLATE</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="NAME" value={formName} onChange={setFormName} placeholder="blueprint_main" />
              <FormField label="VERSION" value={formVer} onChange={setFormVer} placeholder="v2" />
            </div>
            <div>
              <label className="font-press text-xs text-pixel-muted block mb-2">SYSTEM CONTEXT</label>
              <textarea rows={4} value={formSystem} onChange={e => setFormSystem(e.target.value)}
                placeholder="You are an expert career advisor..."
                className="w-full bg-pixel-bg border-2 border-pixel-border text-pixel-text
                           font-body text-sm p-3 resize-none focus:outline-none focus:border-pixel-gold" />
            </div>
            <div>
              <label className="font-press text-xs text-pixel-muted block mb-2">PROMPT TEXT</label>
              <textarea rows={10} value={formText} onChange={e => setFormText(e.target.value)}
                placeholder="Generate a career blueprint for..."
                className="w-full bg-pixel-bg border-2 border-pixel-border text-pixel-text
                           font-body text-sm p-3 resize-y focus:outline-none focus:border-pixel-gold" />
            </div>
            <FormField label="NOTES (optional)" value={formNotes} onChange={setFormNotes} placeholder="What changed in this version" />
            <PixelButton variant="primary" size="md" onClick={createPrompt} disabled={saving}>
              {saving ? '…' : 'SAVE TEMPLATE'}
            </PixelButton>
          </div>
        </div>
      )}
    </div>
  )
}

function FormField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label className="font-press text-xs text-pixel-muted block mb-2">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-pixel-bg border-2 border-pixel-border text-pixel-text
                   font-body text-sm px-3 py-2.5 focus:outline-none focus:border-pixel-gold
                   placeholder:text-pixel-muted/50" />
    </div>
  )
}
