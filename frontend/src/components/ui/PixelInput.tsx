'use client'

import { InputHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label:       string
  error?:      string
  hint?:       string
  maxCount?:   number   // show character counter when set
}

const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(
  ({ label, error, hint, maxCount, className, id: idProp, value, ...props }, ref) => {
    const autoId = useId()
    const id     = idProp ?? autoId
    const count  = typeof value === 'string' ? value.length : 0

    return (
      <div className="w-full space-y-1.5">
        {/* Label row */}
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            className="font-press text-[0.4rem] text-pixel-muted uppercase tracking-widest"
          >
            {label}
          </label>
          {maxCount != null && (
            <span className={cn(
              'font-press text-[0.36rem]',
              count > maxCount ? 'text-pixel-error' : 'text-pixel-muted',
            )}>
              {count}/{maxCount}
            </span>
          )}
        </div>

        {/* Input */}
        <input
          ref={ref}
          id={id}
          value={value}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(
            'pixel-input',
            error && 'border-pixel-error focus:border-pixel-error focus:shadow-[0_0_0_1px_var(--color-error)]',
            className,
          )}
          {...props}
        />

        {/* Error message */}
        {error && (
          <p id={`${id}-error`} role="alert" className="font-press text-[0.38rem] text-pixel-error">
            {error}
          </p>
        )}

        {/* Hint (only when no error) */}
        {hint && !error && (
          <p id={`${id}-hint`} className="font-body text-xs text-pixel-muted">
            {hint}
          </p>
        )}
      </div>
    )
  },
)

PixelInput.displayName = 'PixelInput'

export { PixelInput }
