import type { WeddingInvitation } from '@/types'
import { getTemplateById } from '@/data/templates'
import { getDesign } from '@/templates/designs'
import type { EventKind } from '@/templates/events'

/**
 * Sample invitations for the template previews and the phone mockups on the website.
 * The pictures are drawn soft shapes in each design's own colour (not photographs), so a
 * sample shows how a real photo will sit without needing any image files.
 */

function mix(hex: string, other: string, amount: number): string {
  const a = parseInt(hex.slice(1), 16)
  const b = parseInt(other.slice(1), 16)
  const ch = (shift: number) => Math.round(((a >> shift) & 255) * (1 - amount) + ((b >> shift) & 255) * amount)
  return `#${[16, 8, 0].map((s) => ch(s).toString(16).padStart(2, '0')).join('')}`
}

/** A soft landscape picture in the design's colour. `seed` changes the arrangement. */
export function sampleArt(colour: string, seed: number): string {
  const sky1 = mix(colour, '#FFFFFF', 0.72)
  const sky2 = mix(colour, '#FFFFFF', 0.35)
  const hill1 = mix(colour, '#000000', 0.12)
  const hill2 = mix(colour, '#000000', 0.38)
  const sunX = [250, 120, 200, 70, 280][seed % 5]
  const sunY = [150, 190, 130, 210, 170][seed % 5]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky1}"/><stop offset="1" stop-color="${sky2}"/></linearGradient></defs>
<rect width="400" height="520" fill="url(#g)"/>
<circle cx="${sunX}" cy="${sunY}" r="58" fill="#FFFFFF" opacity="0.55"/>
<circle cx="${sunX}" cy="${sunY}" r="96" fill="#FFFFFF" opacity="0.18"/>
<path d="M0 360 C 90 ${300 + (seed % 3) * 20}, 200 ${400 - (seed % 2) * 30}, 400 330 V520 H0z" fill="${hill1}" opacity="0.85"/>
<path d="M0 430 C 120 ${380 + (seed % 4) * 12}, 260 480, 400 410 V520 H0z" fill="${hill2}"/>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

interface SampleContent {
  names: [string, string]
  tagline?: string
  date: string
  time: string
  venue: string
  address: string
  city: string
  dressCode?: string
  reception?: string
  story?: string
  second?: string
  third?: string
  gifts?: string
  extra?: string
  hashtag?: string
}

const wedding: Record<string, SampleContent> = {
  white: {
    names: ['Mirabel', 'Gabriel'],
    tagline: 'Together with their families',
    date: '2027-03-20', time: '14:00',
    venue: 'The Garden Pavilion', address: '12 Admiralty Way', city: 'Lekki, Lagos',
    dressCode: 'Elegant formal', reception: 'Reception and dinner follow at the Pavilion.',
    story: 'We met over a shared umbrella on a rainy Tuesday. Six years later, we still share everything, mostly the umbrella.',
    second: 'A mutual friend insisted we would get along. She was right.', third: 'To laugh every day, and to always come home to each other.',
    gifts: 'Your presence is our gift.', hashtag: '#MirabelAndGabriel',
  },
  igbo: {
    names: ['Chidinma', 'Emeka'],
    tagline: 'Igba Nkwu · The traditional wedding',
    date: '2027-04-10', time: '11:00',
    venue: 'Obi Nwa Heritage Hall', address: '5 Ogui Road', city: 'Enugu',
    dressCode: 'Traditional Igbo attire', reception: 'Palm wine, kola and celebration to follow.',
    story: 'Two families, one table, and a calabash of palm wine. We cannot wait to welcome you.',
    gifts: 'Your blessing is our gift.', hashtag: '#ChiEmeka2027',
  },
  yoruba: {
    names: ['Folake', 'Tunde'],
    tagline: 'Introduction and traditional engagement',
    date: '2027-05-01', time: '10:00',
    venue: 'Ibadan Cultural Centre', address: 'Mokola Hill', city: 'Ibadan',
    dressCode: 'Aso-oke and gele', reception: 'Lunch and dancing follow the ceremony.',
    story: 'We are two families becoming one. Come and dance with us.',
    gifts: 'Your prayers and presence mean the world.', hashtag: '#FolakeTunde',
  },
  hausa: {
    names: ['Aisha', 'Musa'],
    tagline: 'The wedding Fatiha',
    date: '2027-06-12', time: '12:00',
    venue: 'Sultan Bello Hall', address: 'Ahmadu Bello Way', city: 'Kaduna',
    dressCode: 'Traditional attire', reception: 'Refreshments and a reception follow the Fatiha.',
    story: 'With the blessing of our families, we invite you to witness the beginning of our life together.',
    gifts: 'Your prayers are our greatest gift.', hashtag: '#AishaAndMusa',
  },
}

const others: Record<Exclude<EventKind, 'wedding'>, SampleContent> = {
  'child-dedication': {
    names: ['Baby Zara', ''],
    tagline: 'Daughter of Pastor & Mrs Ibrahim Okoye',
    date: '2027-02-14', time: '11:00',
    venue: 'Grace Chapel', address: '24 Ozumba Mbadiwe Avenue', city: 'Victoria Island, Lagos',
    dressCode: 'Soft pastels', reception: 'Light refreshments and photos after the service.',
    story: 'We prayed for her, and God answered. Come and give thanks with us as we dedicate our little girl to the Lord.',
    second: 'Zara means “blooming flower”. She already lights up every room.',
    third: 'Lord, guide her steps, guard her heart, and let her walk in your favour all her days.',
    gifts: 'Your prayers and love are the best gift.',
  },
  birthday: {
    names: ['Adaeze', ''],
    tagline: 'is turning 30',
    date: '2027-07-24', time: '19:00',
    venue: 'The Rooftop, Eko Hotel', address: 'Adetokunbo Ademola Street', city: 'Victoria Island, Lagos',
    dressCode: 'Glam and gold', reception: 'Dinner, music and dancing until late.',
    story: 'Thirty years, one very good reason to throw a party. Come and celebrate with the people who made them great.',
    second: 'I once ate nine puff-puffs in one sitting. Come and watch me try for ten.',
    third: 'Thank you for being part of my story so far.',
    gifts: 'Your company is the gift. A wish list is shared on request.',
  },
  corporate: {
    names: ['Lagos Innovation Summit', ''],
    tagline: 'Hosted by Northwind Capital',
    date: '2027-05-20', time: '09:00',
    venue: 'Landmark Event Centre', address: '3 Water Corporation Road', city: 'Victoria Island, Lagos',
    dressCode: 'Business formal', reception: '09:00 Registration · 10:00 Keynote · 13:00 Lunch · 15:00 Panels',
    story: 'A one-day gathering of founders, investors and operators shaping what comes next for business in Nigeria.',
    second: 'Founders, investors, product leads and anyone building for the next ten years.',
    third: 'Opening keynote by the Group Managing Director.',
    gifts: 'Parking is available on site. Please bring a valid ID for registration.',
  },
  funeral: {
    names: ['Chief Emmanuel Adewale', ''],
    tagline: '1951 – 2026',
    date: '2027-01-16', time: '10:00',
    venue: 'St. Peter’s Cathedral', address: '8 Marina Road', city: 'Ibadan',
    dressCode: 'White and soft colours', reception: 'Refreshments will be served at the family house after the burial.',
    story: 'A devoted husband, father and friend, he lived with generosity and joy. We invite you to celebrate his life and to comfort one another.',
    second: 'His kindness, his laughter and his unfailing faith.',
    third: 'The Lord is my shepherd; I shall not want.',
    gifts: 'In place of flowers, donations may be made to the Adewale Scholarship Fund.',
  },
}

export function getSampleInvitation(templateId: string): WeddingInvitation | null {
  const template = getTemplateById(templateId)
  if (!template) return null
  const kind = template.category as EventKind
  const c = kind === 'wedding' ? wedding[template.collection] ?? wedding.white : others[kind as Exclude<EventKind, 'wedding'>]
  if (!c) return null
  const colour = getDesign(templateId).colour
  return {
    id: `sample-${templateId}`,
    slug: `sample-${templateId}`,
    templateId,
    eventType: kind,
    brideName: c.names[0],
    groomName: c.names[1],
    tagline: c.tagline,
    weddingDate: c.date,
    weddingTime: c.time,
    venueName: c.venue,
    venueAddress: c.address,
    city: c.city,
    state: '',
    country: 'Nigeria',
    dressCode: c.dressCode,
    receptionInfo: c.reception,
    loveStory: c.story,
    howWeMet: c.second,
    vows: c.third,
    heroImage: sampleArt(colour, 0),
    galleryImages: [
      { id: 'feature', url: sampleArt(colour, 1) },
      { id: 'g1', url: sampleArt(colour, 2) },
      { id: 'g2', url: sampleArt(colour, 3) },
      { id: 'g3', url: sampleArt(colour, 4) },
      { id: 'g4', url: null },
    ],
    giftInformation: c.gifts,
    weddingHashtag: c.hashtag,
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-01T09:00:00.000Z',
    status: 'draft',
    views: 0,
  }
}
