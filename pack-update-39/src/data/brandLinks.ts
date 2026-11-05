/**
 * Invytory's own social pages. Change the handles here and every footer updates.
 * Delete a line to hide that button.
 */
export const BRAND_LINKS: { website: string } & Partial<Record<'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'x' | 'whatsapp', string>> = {
  website: 'https://www.invytory.com',
  instagram: 'https://www.instagram.com/useinvytory/',
  tiktok: 'https://www.tiktok.com/@invytory',
  linkedin: 'https://www.linkedin.com/company/146876628/',
  // facebook: 'https://www.facebook.com/...',  <- remove the two slashes and paste your page when it is ready
}

export type BrandLinkKey = keyof typeof BRAND_LINKS
