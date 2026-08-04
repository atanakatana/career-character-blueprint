import type { Metadata } from 'next'
import { PixelLayout }                from '@/components/layout/PixelLayout'
import { ScrollProgress }             from '@/components/ui/motion'
import { HeroSection }                from '@/components/landing/HeroSection'
import { HowItWorksSection }          from '@/components/landing/HowItWorksSection'
import { FeaturesSection }            from '@/components/landing/FeaturesSection'
import { PredictionProcessSection }   from '@/components/landing/PredictionProcessSection'
import { BlueprintPreviewSection }    from '@/components/landing/BlueprintPreviewSection'
import { PricingSection }             from '@/components/landing/PricingSection'
import { FaqSection }                 from '@/components/landing/FaqSection'

export const metadata: Metadata = {
  title: 'Re:Lumma | AI-Powered Career Guidance',
  description:
    'Discover your Re:Lumma Blueprint — a cinematic, AI-powered career identity ' +
    'built from your MBTI type and Human Design. Start with a free Trial Reading.',
  keywords: ['career guidance', 'MBTI career', 'Human Design career', 'AI career blueprint', 'career identity', 'Re:Lumma'],
  openGraph: {
    title: 'Discover Your Re:Lumma Blueprint',
    description:
      'A 10-section personalized career codex built from your MBTI type, Human Design, and AI synthesis.',
    type: 'website',
  },
}

export default function LandingPage() {
  return (
    <PixelLayout>
      {/* Reading-progress bar spanning the whole scroll journey */}
      <ScrollProgress />

      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PredictionProcessSection />
      <BlueprintPreviewSection />
      <PricingSection />
      <FaqSection />
    </PixelLayout>
  )
}
