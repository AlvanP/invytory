import type { InvitationTemplate } from '@/types'

/**
 * Placeholder wedding templates, grouped into Design Collections
 * (`collection`: white | igbo | yoruba | hausa | universal).
 *
 * Each `rendererKey` maps to an entry in `src/templates/registry.ts` —
 * swap in a real design later by registering a new renderer under the
 * same key, no other file changes. To add a real collection design,
 * add an entry here with the right `collection` and your own rendererKey.
 *
 * ORDER MATTERS: the landing page features the first three entries, so
 * keep the original six first and append new designs after them.
 */
export const templates: InvitationTemplate[] = [
  // ── Original six ────────────────────────────────────────────────
  {
    id: 'royal-door',
    name: 'Royal Door',
    description: 'A ceremonial opening door reveal, rendered in deep wine and gold leaf.',
    category: 'wedding',
    collection: 'universal',
    rendererKey: 'royal',
    previewTone: 'royal',
    isPremium: true,
    status: 'available',
  },
  {
    id: 'garden-romance',
    name: 'Garden Romance',
    description: 'Soft botanical linework on ivory, for an outdoor or spring celebration.',
    category: 'wedding',
    collection: 'white',
    rendererKey: 'garden',
    previewTone: 'garden',
    isPremium: false,
    status: 'available',
  },
  {
    id: 'storybook',
    name: 'Storybook',
    description: 'A page-turning narrative layout that unfolds your story chapter by chapter.',
    category: 'wedding',
    collection: 'universal',
    rendererKey: 'storybook',
    previewTone: 'storybook',
    isPremium: true,
    status: 'available',
  },
  {
    id: 'modern-luxury',
    name: 'Modern Luxury',
    description: 'Sharp type, generous whitespace, and a minimal monochrome palette.',
    category: 'wedding',
    collection: 'white',
    rendererKey: 'modern',
    previewTone: 'modern',
    isPremium: true,
    status: 'available',
  },
  {
    id: 'african-royal',
    name: 'African Royal',
    description: 'Bold pattern work and regalia-inspired color, for a celebration with heritage at its center.',
    category: 'wedding',
    collection: 'universal',
    rendererKey: 'african',
    previewTone: 'heritage',
    isPremium: true,
    status: 'available',
  },
  {
    id: 'classic-elegance',
    name: 'Classic Elegance',
    description: 'Timeless serif typography and a restrained palette that never dates.',
    category: 'wedding',
    collection: 'white',
    rendererKey: 'classic',
    previewTone: 'classic',
    isPremium: false,
    status: 'available',
  },

  // ── Traditional collections (PLACEHOLDERS) ──────────────────────
  // Each reuses an existing renderer until the real artwork arrives.
  // Replace by registering your own rendererKey and editing the entry.
  {
    id: 'igbo-design-1',
    name: 'Igbo Design 1',
    description: 'Placeholder for the Igbo collection. Replace with your own design.',
    category: 'wedding',
    collection: 'igbo',
    rendererKey: 'african',
    previewTone: 'heritage',
    isPremium: true,
    status: 'available',
  },
  {
    id: 'igbo-design-2',
    name: 'Igbo Design 2',
    description: 'Placeholder for the Igbo collection. Replace with your own design.',
    category: 'wedding',
    collection: 'igbo',
    rendererKey: 'royal',
    previewTone: 'royal',
    isPremium: true,
    status: 'available',
  },
  {
    id: 'yoruba-design-1',
    name: 'Yoruba Design 1',
    description: 'Placeholder for the Yoruba collection. Replace with your own design.',
    category: 'wedding',
    collection: 'yoruba',
    rendererKey: 'african',
    previewTone: 'heritage',
    isPremium: true,
    status: 'available',
  },
  {
    id: 'yoruba-design-2',
    name: 'Yoruba Design 2',
    description: 'Placeholder for the Yoruba collection. Replace with your own design.',
    category: 'wedding',
    collection: 'yoruba',
    rendererKey: 'classic',
    previewTone: 'classic',
    isPremium: false,
    status: 'available',
  },
  {
    id: 'hausa-design-1',
    name: 'Hausa Design 1',
    description: 'Placeholder for the Hausa collection. Replace with your own design.',
    category: 'wedding',
    collection: 'hausa',
    rendererKey: 'african',
    previewTone: 'heritage',
    isPremium: true,
    status: 'available',
  },
  {
    id: 'hausa-design-2',
    name: 'Hausa Design 2',
    description: 'Placeholder for the Hausa collection. Replace with your own design.',
    category: 'wedding',
    collection: 'hausa',
    rendererKey: 'modern',
    previewTone: 'modern',
    isPremium: false,
    status: 'available',
  },
]

export function getTemplateById(id: string): InvitationTemplate | undefined {
  return templates.find((t) => t.id === id)
}