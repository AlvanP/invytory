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
    description: 'Everything in Essential, plus a shared guest photo album and ready-made thank-you cards.',
    guestAlbum: true,
  },
]

/** What every plan includes. */
export const sharedPlanFeatures = [
  'Animated invitation with your own entrance',
  '44 templates, every one in every event category',
  'Colours of the day, with your own hex colours',
  'RSVP, live guest list and a guest messages wall',
  'Personalised links for your special guests',
  'Automatic reminders to guests the week and the day before',
  'Add to Calendar for Google, Apple and Outlook',
  'Photo gallery and background music',
  'WhatsApp sharing, QR code and shareable link',
  'Invite a co-host or manager to help',
]

/** Extra on the Signature plan only. */
export const albumFeature = 'Guests\u2019 photo album: one tap, no app, download in full quality'
export const thankYouFeature = 'Thank-you cards: 8 designs, shared as a photo on WhatsApp or email'

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