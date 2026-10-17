import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Hero } from '@/components/landing/Hero'
import { CategoryExplorer } from '@/components/landing/CategoryExplorer'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { GuestAlbum } from '@/components/landing/GuestAlbum'
import { RsvpFeature } from '@/components/landing/RsvpFeature'
import { PricingSection } from '@/components/landing/PricingSection'
import { Reviews } from '@/components/landing/Reviews'
import { FinalCta } from '@/components/landing/FinalCta'

export function LandingPage() {
  // Links like /#pricing from other pages scroll to their section.
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 50)
    return () => clearTimeout(t)
  }, [hash])

  return (
    <div>
      <Hero />
      <CategoryExplorer />
      <HowItWorks />
      <GuestAlbum />
      <RsvpFeature />
      <PricingSection />
      <Reviews />
      <FinalCta />
    </div>
  )
}
