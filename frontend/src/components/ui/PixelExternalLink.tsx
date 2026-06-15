import { cn } from '@/lib/utils'

interface PixelExternalLinkProps {
  href:        string
  label:       string
  description: string
  className?:  string
}

export function PixelExternalLink({ href, label, description, className }: PixelExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group block border border-pixel-border bg-pixel-bg/40 p-3',
        'hover:border-pixel-blue transition-colors duration-150',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <p className="font-press text-[0.4rem] text-pixel-blue group-hover:text-pixel-gold transition-colors">
            {label}
          </p>
          <p className="font-body text-xs text-pixel-muted">{description}</p>
        </div>
        <span className="font-press text-[0.5rem] text-pixel-blue flex-shrink-0 mt-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
          ↗
        </span>
      </div>
    </a>
  )
}
