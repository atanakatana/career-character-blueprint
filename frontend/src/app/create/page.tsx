import type { Metadata } from 'next'
import { redirect }             from 'next/navigation'
import { PixelLayout }          from '@/components/layout/PixelLayout'
import { CharacterCreationForm } from '@/components/form/CharacterCreationForm'

export const metadata: Metadata = {
  title: 'Start Your Assessment | Re:Lumma',
  description: 'Answer 9 questions and get an instant, free Trial Reading of your Re:Lumma Blueprint.',
}

// The assessment is free and open to everyone — no payment, no email, no
// account required to start. Completing it produces an instant Trial
// Reading; the Complete Blueprint is unlocked afterwards via Pricing ->
// Login/Register -> Dashboard. See CharacterCreationForm for the
// Trial Reading hand-off.
//
// Note: Mayar.id's payment redirect is hardcoded (backend/app/services/mayar.py)
// to send paying customers back to /create?email=...&ref=.... That backend
// behaviour is intentionally left untouched (out of scope: payment
// infrastructure) — instead we just bounce that specific case straight to
// the Dashboard, where the paid submission is actually kicked off.
export default function CreatePage({
  searchParams,
}: {
  searchParams: { ref?: string; email?: string }
}) {
  if (searchParams?.ref) {
    redirect('/dashboard')
  }

  return (
    <PixelLayout>
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
        <CharacterCreationForm />
      </div>
    </PixelLayout>
  )
}
