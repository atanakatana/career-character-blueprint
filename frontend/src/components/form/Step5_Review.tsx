'use client'

import { PixelPanel }  from '@/components/ui/PixelPanel'
import { PixelButton } from '@/components/ui/PixelButton'
import type { FormState } from '@/lib/validation'

interface Props {
  data:          FormState
  isSubmitting:  boolean
  submitError:   string | null
  onSubmit:      () => void
  onGoToStep:    (step: number) => void
}

export function Step5_Review({ data, isSubmitting, submitError, onSubmit, onGoToStep }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-vt text-vt-xl text-pixel-gold mb-1">Review & Submit</p>
        <p className="font-body text-sm text-pixel-muted">
          Confirm your details before we generate your free Trial Reading.
        </p>
      </div>

      <div className="pixel-divider" />

      {/* Summary grid */}
      <div className="space-y-4">

        {/* Identity */}
        <ReviewBlock
          title="Identity"
          onEdit={() => onGoToStep(1)}
        >
          <ReviewRow label="Nickname" value={data.nickname} />
          <ReviewRow label="Email"    value={data.email} />
        </ReviewBlock>

        {/* Personality */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ReviewBlock title="MBTI Type" onEdit={() => onGoToStep(2)}>
            <ReviewRow label="Type" value={data.mbti_type || '—'} />
          </ReviewBlock>

          <ReviewBlock title="Human Design" onEdit={() => onGoToStep(3)}>
            <ReviewRow label="Type"      value={data.hd_type      || '—'} />
            <ReviewRow label="Authority" value={data.hd_authority || '—'} />
            <ReviewRow label="Profile"   value={data.hd_profile   || '—'} />
          </ReviewBlock>
        </div>

        {/* Career context */}
        <ReviewBlock title="Career Context" onEdit={() => onGoToStep(4)}>
          <ReviewRow label="Occupation" value={data.current_occupation} />
          <ReviewLong label="Burnout Triggers" value={data.burnout_triggers} />
          <ReviewLong label="Success Vision"   value={data.success_vision} />
        </ReviewBlock>

      </div>

      {/* Privacy note */}
      <p className="font-body text-xs text-pixel-muted text-center">
        Your data is used only to generate your Trial Reading and, later, your Complete Blueprint.
        It is not shared with third parties.
      </p>

      {/* Submit error */}
      {submitError && (
        <div className="border border-pixel-error bg-pixel-error/10 p-3">
          <p className="font-press text-[0.4rem] text-pixel-error">
            ✕ {submitError}
          </p>
        </div>
      )}

      {/* Submit button */}
      <div className="pt-2">
        <PixelButton
          variant="primary"
          size="lg"
          className="w-full justify-center"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="animate-pixel-blink">⬛</span>
              &nbsp; Building Your Trial Reading&hellip;
            </>
          ) : (
            '▶\u00a0 Get My Free Trial Reading'
          )}
        </PixelButton>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ReviewBlock({
  title, onEdit, children,
}: {
  title: string; onEdit: () => void; children: React.ReactNode
}) {
  return (
    <PixelPanel variant="subtle" padding="sm">
      <div className="flex items-center justify-between mb-3">
        <span className="font-press text-[0.4rem] text-pixel-gold">{title}</span>
        <button
          type="button"
          onClick={onEdit}
          className="font-press text-[0.38rem] text-pixel-blue hover:text-pixel-gold transition-colors"
        >
          ✎ Edit
        </button>
      </div>
      <div className="space-y-2">{children}</div>
    </PixelPanel>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 items-start">
      <span className="font-press text-[0.36rem] text-pixel-muted min-w-[80px] flex-shrink-0 mt-0.5">
        {label}
      </span>
      <span className="font-body text-sm text-pixel-text break-all">{value || '—'}</span>
    </div>
  )
}

function ReviewLong({ label, value }: { label: string; value: string }) {
  const PREVIEW = 160
  const display = value.length > PREVIEW ? value.slice(0, PREVIEW) + '…' : value
  return (
    <div className="space-y-0.5">
      <span className="font-press text-[0.36rem] text-pixel-muted">{label}</span>
      <p className="font-body text-sm text-pixel-muted leading-relaxed">{display || '—'}</p>
    </div>
  )
}
