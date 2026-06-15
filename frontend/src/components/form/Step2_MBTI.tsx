'use client'

import { PixelSelect }        from '@/components/ui/PixelSelect'
import { PixelExternalLink }  from '@/components/ui/PixelExternalLink'
import { config }             from '@/lib/config'
import type { FormState, FormErrors } from '@/lib/validation'
import type { SelectGroup }   from '@/components/ui/PixelSelect'

interface Props {
  data:     FormState
  errors:   FormErrors
  onChange: (field: keyof FormState, value: string) => void
}

const MBTI_GROUPS: SelectGroup[] = [
  { group: 'Analysts (NT)', options: [
    { value: 'INTJ', label: 'INTJ — The Architect' },
    { value: 'INTP', label: 'INTP — The Thinker' },
    { value: 'ENTJ', label: 'ENTJ — The Commander' },
    { value: 'ENTP', label: 'ENTP — The Debater' },
  ]},
  { group: 'Diplomats (NF)', options: [
    { value: 'INFJ', label: 'INFJ — The Advocate' },
    { value: 'INFP', label: 'INFP — The Mediator' },
    { value: 'ENFJ', label: 'ENFJ — The Protagonist' },
    { value: 'ENFP', label: 'ENFP — The Campaigner' },
  ]},
  { group: 'Sentinels (SJ)', options: [
    { value: 'ISTJ', label: 'ISTJ — The Logistician' },
    { value: 'ISFJ', label: 'ISFJ — The Defender' },
    { value: 'ESTJ', label: 'ESTJ — The Executive' },
    { value: 'ESFJ', label: 'ESFJ — The Consul' },
  ]},
  { group: 'Explorers (SP)', options: [
    { value: 'ISTP', label: 'ISTP — The Virtuoso' },
    { value: 'ISFP', label: 'ISFP — The Adventurer' },
    { value: 'ESTP', label: 'ESTP — The Entrepreneur' },
    { value: 'ESFP', label: 'ESFP — The Entertainer' },
  ]},
]

export function Step2_MBTI({ data, errors, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-vt text-vt-xl text-pixel-gold mb-1">Personality Type</p>
        <p className="font-body text-sm text-pixel-muted">
          MBTI reveals how you think, communicate, and make decisions. 
          Select the type you most identify with.
        </p>
      </div>

      <div className="pixel-divider" />

      <PixelSelect
        label="Your MBTI Type"
        options={MBTI_GROUPS}
        placeholder="Select your type…"
        value={data.mbti_type}
        onChange={e => onChange('mbti_type', e.target.value)}
        error={errors.mbti_type}
      />

      <PixelExternalLink
        href={config.externalLinks.mbtiTest}
        label="Don't know your MBTI type?"
        description="Take the free 16Personalities test — takes about 12 minutes."
      />

      <div className="border border-pixel-border bg-pixel-bg/30 p-3 space-y-1">
        <p className="font-press text-[0.4rem] text-pixel-muted">ℹ About MBTI in this report</p>
        <p className="font-body text-xs text-pixel-muted leading-relaxed">
          MBTI is used as one of two inputs. The AI does not produce generic type descriptions — 
          it synthesises your type with your Human Design and career context to produce 
          something specific to you.
        </p>
      </div>
    </div>
  )
}
