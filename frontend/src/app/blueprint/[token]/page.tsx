import type { Metadata } from 'next'
import { BlueprintReport } from '@/components/report/BlueprintReport'

export const metadata: Metadata = {
  title: 'Your Career Blueprint | Character Career Blueprint',
  robots: { index: false, follow: false },
}

export default function BlueprintPage({ params }: { params: { token: string } }) {
  return <BlueprintReport token={params.token} />
}
