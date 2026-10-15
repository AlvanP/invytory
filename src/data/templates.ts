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
 * ORDER MATTERS: the landing page features the first three entries.
 * Each design's colours, cover, lettering and motif live in src/templates/designs.ts,
 * under the same id. Every template is built from the same sections (src/templates/sections.ts).
 */
export const templates: InvitationTemplate[] = [
  // ── White wedding ────────────────────────────────────────
  {
    id: 'classic-elegance',
    name: 'Classic Elegance',
    description: 'Champagne gold, a flowing script and a gold scratch-off that hides the date until your guests reveal it.',
    category: 'wedding',
    collection: 'white',
    rendererKey: 'designed',
    previewTone: 'classic',
    isPremium: false,
    status: 'available',
  },
  {
    id: 'garden-romance',
    name: 'Garden Romance',
    description: 'A full-width photo, soft sage green and fine leaf linework, for an outdoor or spring celebration.',
    category: 'wedding',
    collection: 'white',
    rendererKey: 'designed',
    previewTone: 'garden',
    isPremium: false,
    status: 'available',
  },
  {
    id: 'modern-luxury',
    name: 'Modern Luxury',
    description: 'Clean charcoal, wide-spaced capitals and lots of white space. Minimal and confident.',
    category: 'wedding',
    collection: 'white',
    rendererKey: 'designed',
    previewTone: 'modern',
    isPremium: true,
    status: 'available',
  },
  // ── Igbo ────────────────────────────────────────
  {
    id: 'igbo-design-1',
    name: 'Coral Crown',
    description: 'Warm coral and clay with uli-inspired linework and a full-width photo.',
    category: 'wedding',
    collection: 'igbo',
    rendererKey: 'designed',
    previewTone: 'heritage',
    isPremium: true,
    status: 'available',
  },
  {
    id: 'igbo-design-2',
    name: 'Mahogany Gold',
    description: 'Deep mahogany, an arched photo and fine uli curves, with a rich, regal feel.',
    category: 'wedding',
    collection: 'igbo',
    rendererKey: 'designed',
    previewTone: 'royal',
    isPremium: true,
    status: 'available',
  },
  {
    id: 'african-royal',
    name: 'Ozo Regalia',
    description: 'Bold red, strong capitals and uli patterns, with heritage at the centre.',
    category: 'wedding',
    collection: 'igbo',
    rendererKey: 'designed',
    previewTone: 'heritage',
    isPremium: true,
    status: 'available',
  },
  // ── Yoruba ────────────────────────────────────────
  {
    id: 'yoruba-design-1',
    name: 'Aso-Oke Blue',
    description: 'Royal blue with adire-style diamond patterns and a full-width photo.',
    category: 'wedding',
    collection: 'yoruba',
    rendererKey: 'designed',
    previewTone: 'heritage',
    isPremium: true,
    status: 'available',
  },
  {
    id: 'yoruba-design-2',
    name: 'Gele Purple',
    description: 'Rich purple, flowing script and an arched photo, with adire diamonds.',
    category: 'wedding',
    collection: 'yoruba',
    rendererKey: 'designed',
    previewTone: 'classic',
    isPremium: false,
    status: 'available',
  },
  {
    id: 'royal-door',
    name: 'Palace Navy',
    description: 'Midnight navy, elegant serif lettering and adire diamonds, with a palace-gate opening.',
    category: 'wedding',
    collection: 'yoruba',
    rendererKey: 'designed',
    previewTone: 'royal',
    isPremium: true,
    status: 'available',
  },
  // ── Hausa ────────────────────────────────────────
  {
    id: 'hausa-design-1',
    name: 'Emerald Arabesque',
    description: 'Emerald green with an eight-point arabesque motif and a full-width photo.',
    category: 'wedding',
    collection: 'hausa',
    rendererKey: 'designed',
    previewTone: 'heritage',
    isPremium: true,
    status: 'available',
  },
  {
    id: 'hausa-design-2',
    name: 'Crimson Sands',
    description: 'Deep crimson, flowing script and an arched photo, with fine arabesque lines.',
    category: 'wedding',
    collection: 'hausa',
    rendererKey: 'designed',
    previewTone: 'modern',
    isPremium: false,
    status: 'available',
  },
  {
    id: 'storybook',
    name: 'Storybook',
    description: 'Teal and gold-toned pages that unfold your story, with arabesque details.',
    category: 'wedding',
    collection: 'hausa',
    rendererKey: 'designed',
    previewTone: 'storybook',
    isPremium: true,
    status: 'available',
  },
]

export function getTemplateById(id: string | undefined): InvitationTemplate | undefined {
  return templates.find((t) => t.id === id)
}
