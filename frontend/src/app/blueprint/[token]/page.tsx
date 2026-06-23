import type { Metadata } from 'next'
import { BlueprintReport } from '@/components/report/BlueprintReport'

// Dynamic metadata will be set client-side — this is a personal report page.
// SEO is intentionally minimal since the URL is token-based, not indexable.
export const metadata: Metadata = {
  title: 'Your Career Blueprint | Character Career Blueprint',
  robots: { index: false, follow: false },
}

interface Props {
  params: { token: string }
}

export default function BlueprintPage({ params }: Props) {
  return <BlueprintReport token={params.token} />
}
