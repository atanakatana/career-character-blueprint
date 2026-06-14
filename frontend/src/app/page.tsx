import { PixelLayout } from '@/components/layout/PixelLayout'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { PixelButton } from '@/components/ui/PixelButton'
import { PixelProgressBar } from '@/components/ui/PixelProgressBar'
import { PixelBorder } from '@/components/ui/PixelBorder'
import Link from 'next/link'

const PALETTE = [
  { name: 'Background',   hex: '#10141F', cls: 'bg-pixel-bg border-2 border-pixel-border' },
  { name: 'Panel',        hex: '#1C2434', cls: 'bg-pixel-panel border-2 border-pixel-border' },
  { name: 'Gold',         hex: '#F5C542', cls: 'bg-pixel-gold' },
  { name: 'Blue',         hex: '#4DA6FF', cls: 'bg-pixel-blue' },
  { name: 'Green',        hex: '#5CE27A', cls: 'bg-pixel-green' },
  { name: 'Text',         hex: '#F5F5F5', cls: 'bg-pixel-text' },
  { name: 'Muted',        hex: '#8892A4', cls: 'bg-pixel-muted' },
  { name: 'Border',       hex: '#2E3B52', cls: 'bg-pixel-border' },
]

export default function HomePage() {
  return (
    <PixelLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="text-center space-y-4 py-6">
          <span className="pixel-tag-green">SPRINT 1 ✓ COMPLETE</span>
          <h1 className="font-press text-press-xl text-pixel-gold mt-4 leading-loose">
            Character Career Blueprint
          </h1>
          <p className="font-vt text-vt-xl text-pixel-muted">
            Design System · Infrastructure · Sprint 1
          </p>
          <p className="font-body text-sm text-pixel-muted max-w-xl mx-auto">
            All services are running. The pixel design system is loaded.
            Sprint 2 will wire up the database and API routes.
          </p>
        </div>

        {/* ── Status ─────────────────────────────────────────────────── */}
        <PixelPanel variant="accent">
          <h2 className="font-press text-press-sm text-pixel-blue mb-4">System Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-body text-sm">
            {[
              { label: 'Docker Compose',        status: 'ok' },
              { label: 'FastAPI (port 8000)',    status: 'ok' },
              { label: 'PostgreSQL (port 5432)', status: 'ok' },
              { label: 'Redis (port 6379)',      status: 'ok' },
              { label: 'Celery Worker',          status: 'ok' },
              { label: 'Nginx (port 80)',        status: 'ok' },
              { label: 'Next.js (port 3000)',    status: 'ok' },
              { label: 'Alembic (migrations)',   status: 'sprint-2' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={item.status === 'ok' ? 'text-pixel-green' : 'text-pixel-muted'}>
                  {item.status === 'ok' ? '●' : '○'}
                </span>
                <span className={item.status === 'ok' ? 'text-pixel-text' : 'text-pixel-muted'}>
                  {item.label}
                </span>
                {item.status === 'sprint-2' && (
                  <span className="pixel-tag-muted">Sprint 2</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6">
            <a
              href="http://localhost:8000/api/health"
              target="_blank"
              rel="noopener noreferrer"
            >
              <PixelButton variant="secondary" size="sm">
                ↗ Check API Health
              </PixelButton>
            </a>
          </div>
        </PixelPanel>

        {/* ── Color Palette ───────────────────────────────────────────── */}
        <PixelPanel>
          <h2 className="font-press text-press-sm text-pixel-gold mb-5">Color Palette</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PALETTE.map((item) => (
              <div key={item.name} className="flex flex-col gap-2">
                <div className={`h-12 w-full ${item.cls}`} />
                <p className="font-press text-[0.42rem] text-pixel-text">{item.name}</p>
                <p className="font-vt text-vt-lg text-pixel-muted leading-none">{item.hex}</p>
              </div>
            ))}
          </div>
        </PixelPanel>

        {/* ── Typography ──────────────────────────────────────────────── */}
        <PixelPanel>
          <h2 className="font-press text-press-sm text-pixel-gold mb-5">Typography</h2>
          <div className="space-y-5">

            <div>
              <p className="font-press text-[0.42rem] text-pixel-muted mb-2 uppercase tracking-widest">
                Press Start 2P — UI / Labels
              </p>
              <p className="font-press text-press-base text-pixel-text">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
              </p>
            </div>
            <div className="pixel-divider" />

            <div>
              <p className="font-press text-[0.42rem] text-pixel-muted mb-2 uppercase tracking-widest">
                Pixelify Sans — Headlines
              </p>
              <p className="font-pixel text-2xl text-pixel-text">
                Character Career Blueprint
              </p>
            </div>
            <div className="pixel-divider" />

            <div>
              <p className="font-press text-[0.42rem] text-pixel-muted mb-2 uppercase tracking-widest">
                VT323 — Decorative / Large Display
              </p>
              <p className="font-vt text-vt-2xl text-pixel-gold">
                GENERATOR · PROJECTOR · MANIFESTOR
              </p>
            </div>
            <div className="pixel-divider" />

            <div>
              <p className="font-press text-[0.42rem] text-pixel-muted mb-2 uppercase tracking-widest">
                Inter — Body Text
              </p>
              <p className="font-body text-base text-pixel-text leading-relaxed">
                Your personalized career blueprint combines Human Design wisdom, MBTI insights,
                and AI-powered analysis to reveal your unique professional path. Built for clarity,
                depth, and action.
              </p>
            </div>

          </div>
        </PixelPanel>

        {/* ── Buttons ─────────────────────────────────────────────────── */}
        <PixelPanel>
          <h2 className="font-press text-press-sm text-pixel-gold mb-5">Buttons</h2>
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <PixelButton variant="primary"   size="lg">▶ Large</PixelButton>
            <PixelButton variant="primary"   size="md">▶ Primary</PixelButton>
            <PixelButton variant="primary"   size="sm">▶ Small</PixelButton>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <PixelButton variant="secondary" size="md">◆ Secondary</PixelButton>
            <PixelButton variant="ghost"     size="md">◇ Ghost</PixelButton>
            <PixelButton variant="danger"    size="md">✕ Danger</PixelButton>
            <PixelButton variant="primary"   size="md" disabled>◌ Disabled</PixelButton>
          </div>
        </PixelPanel>

        {/* ── Progress Bar ────────────────────────────────────────────── */}
        <PixelPanel>
          <h2 className="font-press text-press-sm text-pixel-gold mb-5">Progress Bar</h2>
          <div className="space-y-8">
            {[1, 3, 5].map((step) => (
              <div key={step}>
                <p className="font-press text-[0.42rem] text-pixel-muted mb-3">
                  Step {step} of 5
                </p>
                <PixelProgressBar
                  currentStep={step}
                  totalSteps={5}
                  labels={['Identity', 'MBTI', 'Design', 'Career', 'Review']}
                />
              </div>
            ))}
          </div>
        </PixelPanel>

        {/* ── Panel Variants ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PixelPanel variant="default">
            <h3 className="font-press text-press-xs text-pixel-gold mb-2">Default</h3>
            <p className="font-body text-sm text-pixel-muted">Gold border · Primary content</p>
          </PixelPanel>
          <PixelPanel variant="subtle">
            <h3 className="font-press text-press-xs text-pixel-muted mb-2">Subtle</h3>
            <p className="font-body text-sm text-pixel-muted">Muted border · Secondary content</p>
          </PixelPanel>
          <PixelPanel variant="accent">
            <h3 className="font-press text-press-xs text-pixel-blue mb-2">Accent</h3>
            <p className="font-body text-sm text-pixel-muted">Blue border · Highlighted content</p>
          </PixelPanel>
        </div>

        {/* ── Tags ────────────────────────────────────────────────────── */}
        <PixelPanel>
          <h2 className="font-press text-press-sm text-pixel-gold mb-4">Tags</h2>
          <div className="flex flex-wrap gap-3">
            <span className="pixel-tag">GENERATOR</span>
            <span className="pixel-tag">INFJ</span>
            <span className="pixel-tag-blue">1/3 Profile</span>
            <span className="pixel-tag-blue">Sacral Authority</span>
            <span className="pixel-tag-green">ACTIVE</span>
            <span className="pixel-tag-green">COMPLETED</span>
            <span className="pixel-tag-muted">PENDING</span>
          </div>
        </PixelPanel>

        {/* ── PixelBorder ─────────────────────────────────────────────── */}
        <PixelPanel>
          <h2 className="font-press text-press-sm text-pixel-gold mb-4">Border Wrapper</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PixelBorder color="gold"  className="p-4 text-center">
              <span className="font-press text-press-xs text-pixel-gold">Gold</span>
            </PixelBorder>
            <PixelBorder color="blue"  className="p-4 text-center">
              <span className="font-press text-press-xs text-pixel-blue">Blue</span>
            </PixelBorder>
            <PixelBorder color="green" className="p-4 text-center">
              <span className="font-press text-press-xs text-pixel-green">Green</span>
            </PixelBorder>
          </div>
        </PixelPanel>

        {/* ── Next Steps ──────────────────────────────────────────────── */}
        <PixelPanel variant="default">
          <div className="flex items-start gap-5">
            <span className="font-vt text-vt-3xl text-pixel-gold animate-pixel-float hidden sm:block">
              ⬛
            </span>
            <div className="flex-1">
              <h2 className="font-press text-press-sm text-pixel-gold mb-3">Sprint 1 Complete</h2>
              <p className="font-body text-sm text-pixel-muted mb-4">
                Infrastructure is fully scaffolded. All Docker services are running.
                The pixel design system is validated and ready. Awaiting approval
                to proceed to Sprint 2.
              </p>
              <div className="pixel-divider" />
              <p className="font-press text-press-xs text-pixel-muted mt-3 mb-4">
                Sprint 2 will add: all DB tables · FastAPI submissions endpoint ·
                report retrieval endpoint · admin auth · DB health checks
              </p>
              <Link href="/create">
                <PixelButton variant="primary" size="md">
                  ▶ Proceed to Sprint 2
                </PixelButton>
              </Link>
            </div>
          </div>
        </PixelPanel>

      </div>
    </PixelLayout>
  )
}
