import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturedTemplatesSection } from '@/components/landing/FeaturedTemplatesSection'
import { HowItWorksSection, FeaturesSection, RsvpExplanationSection, CtaSection } from '@/components/landing/Sections'

export function LandingPage() {
  return (
    <div>
      <HeroSection />
      <FeaturedTemplatesSection />
      <HowItWorksSection />
      <FeaturesSection />
      <RsvpExplanationSection />
      <CtaSection />
    </div>
  )
}
