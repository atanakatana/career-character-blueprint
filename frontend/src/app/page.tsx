import type { Metadata } from 'next'
import { PixelLayout }             from '@/components/layout/PixelLayout'
import { HeroSection }             from '@/components/landing/HeroSection'
import { HowItWorksSection }       from '@/components/landing/HowItWorksSection'
import { BenefitsSection }         from '@/components/landing/BenefitsSection'
import { BlueprintPreviewSection } from '@/components/landing/BlueprintPreviewSection'
import { CtaSection }              from '@/components/landing/CtaSection'

export const metadata: Metadata = {
  title: 'Character Career Blueprint | AI-Powered Career Guidance',
  description:
    'Discover your personalized career path through AI-powered guidance combining ' +
    'MBTI, Human Design, and career psychology. Free. 5 minutes. Delivered to your inbox.',
  keywords: ['career guidance', 'MBTI career', 'Human Design career', 'AI career blueprint'],
  openGraph: {
    title: 'Character Career Blueprint',
    description:
      'A 10-section personalized career report built from your MBTI type, ' +
      'Human Design, and career context.',
    type: 'website',
  },
}

export default function LandingPage() {
  return (
    <PixelLayout>
      <HeroSection />
      <HowItWorksSection />
      <BenefitsSection />
      <BlueprintPreviewSection />
      <CtaSection />
    </PixelLayout>
  )
}
