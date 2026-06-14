import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'

type PanelVariant = 'default' | 'subtle' | 'accent'
type PanelPadding = 'none' | 'sm' | 'md' | 'lg'

interface PixelPanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: PanelVariant
  padding?: PanelPadding
}

const variantClass: Record<PanelVariant, string> = {
  default: 'pixel-panel',
  subtle:  'pixel-panel-subtle',
  accent:  'pixel-panel-accent',
}

const paddingClass: Record<PanelPadding, string> = {
  none: '',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-7',
}

const PixelPanel = forwardRef<HTMLDivElement, PixelPanelProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(variantClass[variant], paddingClass[padding], className)}
      {...props}
    >
      {children}
    </div>
  )
)

PixelPanel.displayName = 'PixelPanel'

export { PixelPanel }
