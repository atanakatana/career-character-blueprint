import type { Metadata } from 'next'
import { BlueprintReport } from '@/components/report/BlueprintReport'

export const metadata: Metadata = {
  title: 'Your Complete Blueprint | Re:Lumma',
  robots: { index: false, follow: false },
}

export default function BlueprintPage({ params }: { params: { token: string } }) {
  return <BlueprintReport token={params.token} />
}
