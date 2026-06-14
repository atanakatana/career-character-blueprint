import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

type BorderColor = 'gold' | 'blue' | 'green' | 'muted'

interface PixelBorderProps extends HTMLAttributes<HTMLDivElement> {
  color?: BorderColor
}

const colorClass: Record<BorderColor, string> = {
  gold:  'pixel-border',
  blue:  'pixel-border-blue',
  green: 'pixel-border-green',
  muted: 'pixel-border-muted',
}

const PixelBorder = forwardRef<HTMLDivElement, PixelBorderProps>(
  ({ className, color = 'gold', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(colorClass[color], className)}
      {...props}
    >
      {children}
    </div>
  )
)

PixelBorder.displayName = 'PixelBorder'

export { PixelBorder }
