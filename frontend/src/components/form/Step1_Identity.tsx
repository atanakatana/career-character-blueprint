'use client'

import { PixelInput }  from '@/components/ui/PixelInput'
import type { FormState, FormErrors } from '@/lib/validation'

interface Props {
  data:     FormState
  errors:   FormErrors
  onChange: (field: keyof FormState, value: string) => void
}

export function Step1_Identity({ data, errors, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-vt text-vt-xl text-pixel-gold mb-1">Create Your Character</p>
        <p className="font-body text-sm text-pixel-muted">
          This is who you'll be known as in your blueprint, and where we'll send it.
        </p>
      </div>

      <div className="pixel-divider" />

      <div className="space-y-5">
        <PixelInput
          label="Nickname"
          placeholder="How should we address you in the report?"
          value={data.nickname}
          onChange={e => onChange('nickname', e.target.value)}
          error={errors.nickname}
          maxCount={100}
          autoComplete="nickname"
          autoFocus
        />

        <PixelInput
          label="Email Address"
          type="email"
          placeholder="your@email.com"
          value={data.email}
          onChange={e => onChange('email', e.target.value)}
          error={errors.email}
          hint="Your unique blueprint link will be delivered here."
          autoComplete="email"
        />
      </div>
    </div>
  )
}
