import type { InvitationTemplate } from '@/types'

/**
 * Six placeholder wedding templates. Each `rendererKey` maps to an entry
 * in `src/templates/registry.ts` — swap in a real design later by
 * registering a new renderer under the same key, no other file changes.
 */
export const templates: InvitationTemplate[] = [
  {
    id: 'royal-door',
    name: 'Royal Door',
    description: 'A ceremonial opening door reveal, rendered in deep wine and gold leaf.',
    category: 'wedding',
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
    rendererKey: 'classic',
    previewTone: 'classic',
    isPremium: false,
    status: 'available',
  },
]

export function getTemplateById(id: string): InvitationTemplate | undefined {
  return templates.find((t) => t.id === id)
}
