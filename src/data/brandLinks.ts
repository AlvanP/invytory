/**
 * Invytory's own social pages. Change the handles here and every footer updates.
 * Delete a line to hide that button.
 */
export const BRAND_LINKS = {
  website: 'https://www.invytory.com',
  instagram: 'https://www.instagram.com/invytory',
  facebook: 'https://www.facebook.com/invytory',
  tiktok: 'https://www.tiktok.com/@invytory',
  x: 'https://x.com/invytory',
  whatsapp: 'https://wa.me/2340000000000',
} as const

export type BrandLinkKey = keyof typeof BRAND_LINKS
