export interface PricingPlan {
  id: 'silver' | 'gold'
  name: string
  price: number // Naira
  maxGuests: number
  hostingDays: number
  description: string
  /** True only on the plan that includes the guests' photo album. */
  guestAlbum: boolean
}

/**
 * The two plans. The ids ('silver' and 'gold') are stored in the database and used by the
 * payment check, so they stay the same even though the names changed.
 * The price here is the single source of truth: the payment button and the server check both read it.
 */
export const pricingPlans: PricingPlan[] = [
  {
    id: 'silver',
    name: 'Essential',
    price: 25000,
    maxGuests: 300,
    hostingDays: 90,
    description: 'A beautiful invitation with RSVP, for gatherings up to 300 guests.',
    guestAlbum: false,
  },
  {
    id: 'gold',
    name: 'Signature',
    price: 45000,
    maxGuests: 1000,
    hostingDays: 365,
    description: 'Everything in Essential, plus one shared album for every photo your guests take.',
    guestAlbum: true,
  },
]

/** What every plan includes. */
export const sharedPlanFeatures = [
  'Animated invitation with your own entrance',
  'Every template, in every event category',
  'RSVP and live guest list',
  'Guest messages wall',
  'Countdown, Add to Calendar and WhatsApp sharing',
  'Photo gallery and background music',
  'QR code and shareable link',
]

/** Extra on the Signature plan only. */
export const albumFeature = 'Guests\u2019 photo album: one tap, no app, download in full quality'

export interface WholesaleTier {
  range: string
  pricePerEvent: number
}

export const wholesaleTiers: WholesaleTier[] = [
  { range: '1-5 weddings', pricePerEvent: 7000 },
  { range: '6-20 weddings', pricePerEvent: 6000 },
  { range: '21+ weddings', pricePerEvent: 5000 },
]

export function getPlanById(id: string): PricingPlan | undefined {
  return pricingPlans.find((p) => p.id === id)
}