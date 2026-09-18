export interface PricingPlan {
  id: 'silver' | 'gold'
  name: string
  price: number // Naira
  maxGuests: number
  hostingDays: number
  description: string
}

/** Both plans include the exact same features — the only differences
 * are guest capacity and how long the invitation stays hosted. */
export const pricingPlans: PricingPlan[] = [
  {
    id: 'silver',
    name: 'Silver',
    price: 8000,
    maxGuests: 200,
    hostingDays: 30,
    description: 'Everything you need for a beautifully hosted invitation.',
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 15000,
    maxGuests: 1000,
    hostingDays: 90,
    description: 'The same full experience, built for larger celebrations and longer hosting.',
  },
]

export const sharedPlanFeatures = [
  'Cinematic wedding invitation',
  'Animated invitation entrance',
  'RSVP system',
  'Organizer dashboard',
  'Countdown',
  'Gallery',
  'Love Story',
  'QR code',
  'Shareable invitation link',
  'Guest management',
]

export interface WholesaleTier {
  range: string
  pricePerEvent: number
}

export const wholesaleTiers: WholesaleTier[] = [
  { range: '1–5 weddings', pricePerEvent: 7000 },
  { range: '6–20 weddings', pricePerEvent: 6000 },
  { range: '21+ weddings', pricePerEvent: 5000 },
]

export function getPlanById(id: string): PricingPlan | undefined {
  return pricingPlans.find((p) => p.id === id)
}