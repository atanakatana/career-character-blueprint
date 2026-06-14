'use client'

import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { ButtonHTMLAttributes, forwardRef } from 'react'

const buttonVariants = cva(
  // Base — handles transitions via .pixel-btn in globals.css
  'pixel-btn disabled:opacity-45 disabled:cursor-not-allowed disabled:!transform-none disabled:!shadow-none',
  {
    variants: {
      variant: {
        primary:   'pixel-btn-primary',
        secondary: 'pixel-btn-secondary',
        ghost:     'pixel-btn-ghost',
        danger:    'pixel-btn-danger',
      },
      size: {
        sm: 'text-[0.45rem] px-3 py-2 gap-1.5',
        md: 'text-press-xs px-5 py-2.5 gap-2',
        lg: 'text-press-sm px-7 py-3.5 gap-2.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size:    'md',
    },
  }
)

interface PixelButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  )
)

PixelButton.displayName = 'PixelButton'

export { PixelButton, buttonVariants }
