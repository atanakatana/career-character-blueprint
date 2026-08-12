'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/lib/adminApi'

const NAV = [
  { href: '/admin/dashboard',   icon: '◈', label: 'DASHBOARD'   },
  { href: '/admin/payments',    icon: '💳', label: 'PAYMENTS'   },
  { href: '/admin/submissions', icon: '📋', label: 'SUBMISSIONS' },
  { href: '/admin/models',      icon: '⚙',  label: 'AI MODELS'  },
  { href: '/admin/prompts',     icon: '📝', label: 'PROMPTS'    },
  { href: '/admin/emails',      icon: '✉',  label: 'EMAILS'     },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-52 flex-shrink-0 border-r-2 border-pixel-gold bg-pixel-panel
                 flex flex-col min-h-screen sticky top-0"
      style={{ boxShadow: '4px 0 0px rgba(245,197,66,0.05)' }}
    >
      {/* Logo */}
      <div className="border-b-2 border-pixel-gold px-4 py-5 bg-pixel-bg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-pixel-gold flex items-center justify-center flex-shrink-0"
               style={{ boxShadow: '2px 2px 0px #C4A033' }}>
            <span className="font-press text-xs text-pixel-bg">RL</span>
          </div>
          <div>
            <p className="font-press text-xs text-pixel-gold leading-tight">RE:LUMMA</p>
            <p className="font-press text-[0.38rem] text-pixel-muted leading-tight">ADMIN</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {NAV.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 border-l-2 transition-colors
                ${active
                  ? 'border-pixel-gold bg-pixel-gold/8 text-pixel-gold'
                  : 'border-transparent text-pixel-muted hover:text-pixel-text hover:bg-pixel-panel-hover'
                }
              `}
            >
              <span className="text-base w-5 flex-shrink-0">{item.icon}</span>
              <span className="font-press text-xs leading-tight">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-pixel-border py-3">
        <Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-pixel-muted hover:text-pixel-text transition-colors">
          <span className="text-base w-5">◀</span>
          <span className="font-press text-xs">SITE</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-pixel-error
                     hover:text-pixel-error/80 transition-colors"
        >
          <span className="text-base w-5">⏻</span>
          <span className="font-press text-xs">LOGOUT</span>
        </button>
      </div>
    </aside>
  )
}
