'use client'

import { cn }               from '@/lib/utils'
import { useActiveSection } from '@/hooks/useActiveSection'

interface Section {
  id:    string
  num:   string
  label: string
}

interface ReportSidebarProps {
  sections: Section[]
}

export function ReportSidebar({ sections }: ReportSidebarProps) {
  const activeId = useActiveSection(sections.map((s) => s.id))

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY - 88
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  return (
    <nav
      aria-label="Report sections"
      className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto"
    >
      {/* Header */}
      <div className="border-2 border-pixel-gold bg-pixel-panel shadow-pixel">
        <div className="bg-pixel-bg border-b border-pixel-border px-3 py-2">
          <span className="font-press text-[0.38rem] text-pixel-gold tracking-widest uppercase">
            ◆ Contents
          </span>
        </div>

        <ul className="py-1">
          {sections.map((s) => {
            const active = activeId === s.id
            return (
              <li key={s.id}>
                <button
                  onClick={() => scrollTo(s.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors duration-100',
                    'border-l-2',
                    active
                      ? 'border-pixel-gold bg-pixel-gold/8 text-pixel-gold'
                      : 'border-transparent text-pixel-muted hover:text-pixel-text hover:bg-pixel-panel-hover',
                  )}
                >
                  <span className="font-press text-[0.34rem] opacity-50 flex-shrink-0 w-5">
                    {s.num}
                  </span>
                  <span className="font-press text-[0.38rem] leading-snug">
                    {s.label}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
