'use client'

import { useEffect, useState } from 'react'
import { adminFetch, getToken } from '@/lib/adminApi'
import { PixelButton }         from '@/components/ui/PixelButton'
import type { AIModelConfig }  from '@/lib/adminTypes'

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ModelsPage() {
  const [models,    setModels]    = useState<AIModelConfig[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const [showForm,  setShowForm]  = useState(false)
  const [saving,    setSaving]    = useState(false)

  const [provider,   setProvider]   = useState('gemini')
  const [modelName,  setModelName]  = useState('')
  const [apiKeyEnv,  setApiKeyEnv]  = useState('GEMINI_API_KEY')
  const [maxTokens,  setMaxTokens]  = useState('8000')
  const [temp,       setTemp]       = useState('0.7')

  const load = () => {
    const token = getToken()
    if (!token) return
    adminFetch<AIModelConfig[]>('/admin/models', token)
      .then(setModels)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const activate = async (id: string) => {
    const token = getToken()
    if (!token) return
    setActionMsg('')
    try {
      await adminFetch(`/admin/models/${id}/activate`, token, { method: 'PUT' })
      setActionMsg('✓ Model activated')
      load()
    } catch (e) {
      setActionMsg(`✗ ${e instanceof Error ? e.message : 'Failed'}`)
    }
  }

  const createModel = async () => {
    const token = getToken()
    if (!token || !modelName || !apiKeyEnv) {
      setActionMsg('✗ Provider, model name and API key env var are required')
      return
    }
    setSaving(true)
    setActionMsg('')
    try {
      await adminFetch('/admin/models', token, {
        method: 'POST',
        body: {
          provider,
          model_name:      modelName,
          api_key_env_var: apiKeyEnv,
          max_tokens:      parseInt(maxTokens) || 8000,
          temperature:     parseFloat(temp) || 0.7,
        },
      })
      setActionMsg('✓ Model config created')
      setShowForm(false)
      setModelName(''); setMaxTokens('8000'); setTemp('0.7')
      load()
    } catch (e) {
      setActionMsg(`✗ ${e instanceof Error ? e.message : 'Failed'}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-press text-xs text-pixel-muted mb-1">ADMIN</p>
          <h1 className="font-press text-sm text-pixel-gold">AI MODELS</h1>
        </div>
        <PixelButton variant="secondary" size="sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ CANCEL' : '+ ADD MODEL'}
        </PixelButton>
      </div>

      {actionMsg && (
        <p className={`font-press text-xs mb-5 ${actionMsg.startsWith('✓') ? 'text-pixel-green' : 'text-pixel-error'}`}>
          {actionMsg}
        </p>
      )}

      {loading && <p className="font-press text-xs text-pixel-muted">Loading…</p>}
      {error   && <p className="font-press text-xs text-pixel-error">{error}</p>}

      {!loading && (
        <div className="border-2 border-pixel-border bg-pixel-panel mb-6"
             style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.6)' }}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-pixel-border bg-pixel-bg">
                {['PROVIDER','MODEL','MAX TOKENS','TEMP','STATUS','CREATED',''].map(h => (
                  <th key={h} className="font-press text-xs text-pixel-muted py-3 px-4 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {models.map(m => (
                <tr key={m.id} className="border-b border-pixel-border hover:bg-pixel-panel-hover">
                  <td className="py-3 px-4 font-press text-xs text-pixel-muted">{m.provider}</td>
                  <td className="py-3 px-4 font-press text-xs text-pixel-text">{m.model_name}</td>
                  <td className="py-3 px-4 font-body text-sm text-pixel-muted">{m.max_tokens.toLocaleString()}</td>
                  <td className="py-3 px-4 font-body text-sm text-pixel-muted">{m.temperature}</td>
                  <td className="py-3 px-4">
                    {m.is_active
                      ? <span className="font-press text-xs text-pixel-bg bg-pixel-green px-2.5 py-1">ACTIVE</span>
                      : <span className="font-press text-xs text-pixel-muted">inactive</span>}
                  </td>
                  <td className="py-3 px-4 font-body text-sm text-pixel-muted whitespace-nowrap">{fmt(m.created_at)}</td>
                  <td className="py-3 px-4">
                    {!m.is_active && (
                      <PixelButton variant="ghost" size="sm" onClick={() => activate(m.id)}>
                        ACTIVATE
                      </PixelButton>
                    )}
                  </td>
                </tr>
              ))}
              {models.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center font-press text-xs text-pixel-muted">
                  No model configs found
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add model form */}
      {showForm && (
        <div className="border-2 border-pixel-border bg-pixel-panel"
             style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.6)' }}>
          <div className="bg-pixel-bg border-b border-pixel-border px-5 py-3">
            <span className="font-press text-xs text-pixel-gold">ADD MODEL CONFIG</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-press text-xs text-pixel-muted block mb-2">PROVIDER</label>
                <select value={provider} onChange={e => setProvider(e.target.value)}
                  className="w-full bg-pixel-bg border-2 border-pixel-border text-pixel-text
                             font-body text-sm px-3 py-2.5 focus:outline-none focus:border-pixel-gold">
                  <option value="gemini">gemini</option>
                  <option value="openai">openai</option>
                  <option value="anthropic">anthropic</option>
                </select>
              </div>
              <FormInput label="MODEL NAME"      value={modelName}  onChange={setModelName}  placeholder="gemini-2.5-flash" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput label="API KEY ENV VAR" value={apiKeyEnv}  onChange={setApiKeyEnv}  placeholder="GEMINI_API_KEY" />
              <FormInput label="MAX TOKENS"      value={maxTokens}  onChange={setMaxTokens}  placeholder="8000" />
              <FormInput label="TEMPERATURE"     value={temp}       onChange={setTemp}        placeholder="0.7" />
            </div>
            <PixelButton variant="primary" size="md" onClick={createModel} disabled={saving}>
              {saving ? '…' : 'SAVE MODEL'}
            </PixelButton>
          </div>
        </div>
      )}
    </div>
  )
}

function FormInput({ label, value, onChange, placeholder }: {
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
