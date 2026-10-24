/**
 * Invytory's own social pages. Change the handles here and every footer updates.
 * Delete a line to hide that button.
 */
export const BRAND_LINKS: { website: string } & Partial<Record<'instagram' | 'facebook' | 'tiktok' | 'x' | 'whatsapp', string>> = {
  website: 'https://www.invytory.com',
  instagram: 'https://www.instagram.com/useinvytory/',
  tiktok: 'https://www.tiktok.com/@invytory',
}

export type BrandLinkKey = keyof typeof BRAND_LINKS
