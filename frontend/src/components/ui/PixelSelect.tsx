'use client'

import { SelectHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectGroup {
  group:   string
  options: SelectOption[]
}

export type SelectOptions = SelectOption[] | SelectGroup[]

function isGrouped(opts: SelectOptions): opts is SelectGroup[] {
  return opts.length > 0 && 'group' in opts[0]
}

interface PixelSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label:       string
  options:     SelectOptions
  placeholder?: string
  error?:      string
  hint?:       string
}

const PixelSelect = forwardRef<HTMLSelectElement, PixelSelectProps>(
  ({ label, options, placeholder = 'Select…', error, hint, className, id: idProp, ...props }, ref) => {
    const autoId = useId()
    const id     = idProp ?? autoId

    return (
      <div className="w-full space-y-1.5">
        {/* Label */}
        <label
          htmlFor={id}
          className="block font-press text-[0.4rem] text-pixel-muted uppercase tracking-widest"
        >
          {label}
        </label>

        {/* Select wrapper */}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            className={cn(
              'pixel-input appearance-none pr-8 cursor-pointer',
              error && 'border-pixel-error focus:border-pixel-error focus:shadow-[0_0_0_1px_var(--color-error)]',
              className,
            )}
            {...props}
          >
            {/* Placeholder option */}
            <option value="" disabled>
              {placeholder}
            </option>

            {isGrouped(options)
              ? options.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.options.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </optgroup>
                ))
              : (options as SelectOption[]).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))
            }
          </select>

          {/* Custom dropdown arrow */}
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <span className="font-press text-[0.4rem] text-pixel-muted">▼</span>
          </div>
        </div>

        {error && (
          <p id={`${id}-error`} role="alert" className="font-press text-[0.38rem] text-pixel-error">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${id}-hint`} className="font-body text-xs text-pixel-muted">
            {hint}
          </p>
        )}
      </div>
    )
  },
)

PixelSelect.displayName = 'PixelSelect'

export { PixelSelect }
