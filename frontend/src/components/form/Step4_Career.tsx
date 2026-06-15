'use client'

import { PixelInput }    from '@/components/ui/PixelInput'
import { PixelTextarea } from '@/components/ui/PixelTextarea'
import type { FormState, FormErrors } from '@/lib/validation'

interface Props {
  data:     FormState
  errors:   FormErrors
  onChange: (field: keyof FormState, value: string) => void
}

export function Step4_Career({ data, errors, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-vt text-vt-xl text-pixel-gold mb-1">Career Context</p>
        <p className="font-body text-sm text-pixel-muted">
          The more specific your answers, the more precise your blueprint. 
          Write freely — there are no wrong answers here.
        </p>
      </div>

      <div className="pixel-divider" />

      <div className="space-y-5">
        <PixelInput
          label="Current Occupation"
          placeholder="e.g. Product Manager at a fintech startup"
          value={data.current_occupation}
          onChange={e => onChange('current_occupation', e.target.value)}
          error={errors.current_occupation}
          hint="Your current role and industry. 'Student' or 'Freelancer' are valid answers too."
          maxCount={500}
        />

        <PixelTextarea
          label="What Drains or Burns You Out?"
          placeholder="e.g. Repetitive tasks with no creative input, working in silos with no collaboration, being micromanaged without autonomy…"
          value={data.burnout_triggers}
          onChange={e => onChange('burnout_triggers', e.target.value)}
          error={errors.burnout_triggers}
          hint="Specific patterns, environments, or types of work that deplete you. The AI uses this to identify environments to avoid."
          rows={4}
          maxCount={2000}
        />

        <PixelTextarea
          label="What Does Success Look Like for You?"
          placeholder="e.g. Leading a small team building products that change how people learn. Having creative ownership. Working remotely with flexibility…"
          value={data.success_vision}
          onChange={e => onChange('success_vision', e.target.value)}
          error={errors.success_vision}
          hint="Describe the work, environment, impact, and lifestyle you're building toward. Be as specific as possible."
          rows={4}
          maxCount={2000}
        />
      </div>

      <div className="border border-pixel-border bg-pixel-bg/30 p-3">
        <p className="font-press text-[0.4rem] text-pixel-gold mb-1">ℹ Why we ask</p>
        <p className="font-body text-xs text-pixel-muted leading-relaxed">
          Career context is what separates a generic personality report from a real blueprint.
          Your occupation, burnout patterns, and vision are fed directly to the AI alongside 
          your MBTI and Human Design data.
        </p>
      </div>
    </div>
  )
}
