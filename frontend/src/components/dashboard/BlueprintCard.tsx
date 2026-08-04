import Link from 'next/link'
import { PixelPanel }  from '@/components/ui/PixelPanel'
import { PixelButton } from '@/components/ui/PixelButton'
import type { MyBlueprintResponse } from '@/lib/types'

const TIER_INFO: Record<string, { label: string; price: string }> = {
  tier1: { label: 'Re:Lumma Blueprint',        price: 'Rp 149.000' },
  tier2: { label: 'Blueprint + Tracker',        price: 'Rp 299.000' },
}

interface Props {
  blueprint:       MyBlueprintResponse | null
  selectedTier:    string | null
  hasPendingAnswers: boolean
  checkoutLoading: boolean
  checkoutError:   string
  onStartCheckout: () => void
}

export function BlueprintCard({
  blueprint, selectedTier, hasPendingAnswers, checkoutLoading, checkoutError, onStartCheckout,
}: Props) {
  // ── Unlocked: show the real Blueprint ─────────────────────────────────────
  if (blueprint?.unlocked && blueprint.report) {
    return (
      <PixelPanel variant="accent">
        <p className="font-press text-[0.4rem] uppercase tracking-widest text-pixel-blue mb-2">
          Your Complete Blueprint
        </p>
        <h2 className="font-pixel text-xl text-pixel-text mb-3">{blueprint.report.character_title}</h2>
        {blueprint.token && (
          <Link href={`/blueprint/${blueprint.token}`}>
            <PixelButton variant="secondary" size="sm">▶ View Full Blueprint</PixelButton>
          </Link>
        )}
      </PixelPanel>
    )
  }

  // ── Still being generated ──────────────────────────────────────────────────
  if (blueprint?.status === 'pending' || blueprint?.status === 'processing') {
    return (
      <PixelPanel>
        <p className="font-press text-[0.4rem] uppercase tracking-widest text-pixel-gold mb-2">
          Crafting Your Blueprint
        </p>
        <div className="flex items-center gap-3">
          <span className="font-vt text-2xl text-pixel-gold animate-pixel-blink">◆</span>
          <p className="font-body text-sm text-pixel-muted">
            Your Complete Blueprint is being generated and will arrive by email shortly.
          </p>
        </div>
      </PixelPanel>
    )
  }

  if (blueprint?.status === 'failed') {
    return (
      <PixelPanel>
        <p className="font-press text-[0.4rem] uppercase tracking-widest text-pixel-error mb-2">
          Generation Failed
        </p>
        <p className="font-body text-sm text-pixel-muted">
          Something went wrong generating your Blueprint. Contact support and we&apos;ll sort it out.
        </p>
      </PixelPanel>
    )
  }

  // ── Nothing unlocked yet ────────────────────────────────────────────────────
  const tierInfo = selectedTier ? TIER_INFO[selectedTier] : null

  return (
    <PixelPanel>
      <p className="font-press text-[0.4rem] uppercase tracking-widest text-pixel-muted mb-2">
        Selected Plan
      </p>

      {tierInfo ? (
        <>
          <h2 className="font-pixel text-xl text-pixel-gold mb-1">{tierInfo.label}</h2>
          <p className="font-body text-sm text-pixel-muted mb-4">{tierInfo.price}</p>

          {!hasPendingAnswers && (
            <p className="font-body text-xs text-pixel-muted mb-3">
              Complete the free assessment first so we know what to build your Blueprint from.
            </p>
          )}

          {checkoutError && (
            <p className="font-press text-[0.4rem] text-pixel-error mb-3">✕ {checkoutError}</p>
          )}

          {hasPendingAnswers ? (
            <PixelButton variant="primary" size="md" onClick={onStartCheckout} disabled={checkoutLoading}>
              {checkoutLoading ? '…REDIRECTING TO PAYMENT' : '▶ Complete Checkout'}
            </PixelButton>
          ) : (
            <Link href="/create">
              <PixelButton variant="primary" size="md">▶ Start Free Assessment</PixelButton>
            </Link>
          )}
        </>
      ) : (
        <>
          <p className="font-body text-sm text-pixel-muted mb-4">
            You haven&apos;t unlocked a Blueprint yet.
          </p>
          <Link href="/create">
            <PixelButton variant="primary" size="md">▶ Start Free Assessment</PixelButton>
          </Link>
        </>
      )}
    </PixelPanel>
  )
}
