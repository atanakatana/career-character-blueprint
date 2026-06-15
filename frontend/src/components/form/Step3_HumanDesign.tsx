'use client'

import { PixelSelect }       from '@/components/ui/PixelSelect'
import { PixelExternalLink } from '@/components/ui/PixelExternalLink'
import { config }            from '@/lib/config'
import type { FormState, FormErrors } from '@/lib/validation'
import type { SelectOption } from '@/components/ui/PixelSelect'

interface Props {
  data:     FormState
  errors:   FormErrors
  onChange: (field: keyof FormState, value: string) => void
}

const HD_TYPE_OPTIONS: SelectOption[] = [
  { value: 'Generator',             label: 'Generator — The Builder' },
  { value: 'Manifesting Generator', label: 'Manifesting Generator — The Multi-Passionate' },
  { value: 'Projector',             label: 'Projector — The Guide' },
  { value: 'Manifestor',            label: 'Manifestor — The Initiator' },
  { value: 'Reflector',             label: 'Reflector — The Mirror' },
]

const HD_AUTHORITY_OPTIONS: SelectOption[] = [
  { value: 'Sacral',                    label: 'Sacral' },
  { value: 'Emotional / Solar Plexus',  label: 'Emotional / Solar Plexus' },
  { value: 'Splenic',                   label: 'Splenic' },
  { value: 'Ego / Heart',               label: 'Ego / Heart' },
  { value: 'Self-Projected',            label: 'Self-Projected' },
  { value: 'Mental / Environmental',    label: 'Mental / Environmental' },
  { value: 'Lunar',                     label: 'Lunar' },
]

const HD_PROFILE_OPTIONS: SelectOption[] = [
  { value: '1/3 — Investigator / Martyr',       label: '1/3 — Investigator / Martyr' },
  { value: '1/4 — Investigator / Opportunist',  label: '1/4 — Investigator / Opportunist' },
  { value: '2/4 — Hermit / Opportunist',        label: '2/4 — Hermit / Opportunist' },
  { value: '2/5 — Hermit / Heretic',            label: '2/5 — Hermit / Heretic' },
  { value: '3/5 — Martyr / Heretic',            label: '3/5 — Martyr / Heretic' },
  { value: '3/6 — Martyr / Role Model',         label: '3/6 — Martyr / Role Model' },
  { value: '4/6 — Opportunist / Role Model',    label: '4/6 — Opportunist / Role Model' },
  { value: '4/1 — Opportunist / Investigator',  label: '4/1 — Opportunist / Investigator' },
  { value: '5/1 — Heretic / Investigator',      label: '5/1 — Heretic / Investigator' },
  { value: '5/2 — Heretic / Hermit',            label: '5/2 — Heretic / Hermit' },
  { value: '6/2 — Role Model / Hermit',         label: '6/2 — Role Model / Hermit' },
  { value: '6/3 — Role Model / Martyr',         label: '6/3 — Role Model / Martyr' },
]

export function Step3_HumanDesign({ data, errors, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-vt text-vt-xl text-pixel-gold mb-1">Human Design</p>
        <p className="font-body text-sm text-pixel-muted">
          Human Design reveals how you're designed to use your energy, make decisions, 
          and interact with the world. These three fields come from your free chart.
        </p>
      </div>

      <div className="pixel-divider" />

      <PixelExternalLink
        href={config.externalLinks.hdChart}
        label="Get your free Human Design chart"
        description="Enter your birth date, time, and place at Jovian Archive — your Type, Authority, and Profile appear on the result page."
      />

      <div className="space-y-5">
        <PixelSelect
          label="Human Design Type"
          options={HD_TYPE_OPTIONS}
          placeholder="Select your Type…"
          value={data.hd_type}
          onChange={e => onChange('hd_type', e.target.value)}
          error={errors.hd_type}
          hint="Found in the top section of your chart."
        />

        <PixelSelect
          label="Authority"
          options={HD_AUTHORITY_OPTIONS}
          placeholder="Select your Authority…"
          value={data.hd_authority}
          onChange={e => onChange('hd_authority', e.target.value)}
          error={errors.hd_authority}
          hint="Your inner decision-making guidance system."
        />

        <PixelSelect
          label="Profile"
          options={HD_PROFILE_OPTIONS}
          placeholder="Select your Profile…"
          value={data.hd_profile}
          onChange={e => onChange('hd_profile', e.target.value)}
          error={errors.hd_profile}
          hint="Shown as two numbers (e.g. 3/5) on your chart."
        />
      </div>
    </div>
  )
}
