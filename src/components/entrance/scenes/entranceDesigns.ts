import type { EntranceDesign } from './types'

/**
 * One entrance per design. The scene is the opening move; colours, pattern and wording make each
 * one its own. To change how a design opens, edit its line here.
 */
export const entranceDesigns: Record<string, EntranceDesign> = {
  // ── White wedding ───────────────────────────────────────────────
  'classic-elegance': { scene: 'envelope', ink: 'light', layout: 'hintonly', hint: 'Tap the seal to open', ms: 2500, c: { a: '#B8975A', b1: '#2B2118', b2: '#5A4531', p: '#F6EBDD', s: '#9C2F3A' } },
  'garden-romance': { scene: 'gate', ink: 'dark', layout: 'split', hint: 'Tap to open the gate', ms: 2300, c: { a: '#3F5A39', b1: '#BFD3B0', b2: '#F1F5E4' } },
  'modern-luxury': { scene: 'linesplit', ink: 'light', layout: 'center', hint: 'Tap to enter', ms: 2100, c: { a: '#C9A961', b1: '#0E0D0C', b2: '#201D1A' } },

  // ── Igbo ────────────────────────────────────────────────────────
  'igbo-design-1': { scene: 'doors', ink: 'light', layout: 'split', hint: 'Tap to open the doors', ms: 2500, pattern: 'uli', c: { a: '#F0B79A', b1: '#7E2616', b2: '#C4472D' } },
  'igbo-design-2': { scene: 'curtain', ink: 'light', layout: 'split', hint: 'Tap to draw the curtains', ms: 2400, pattern: 'uli', c: { a: '#E1B76A', b1: '#2E150C', b2: '#6B3320' } },
  'african-royal': { scene: 'doors', ink: 'light', layout: 'split', hint: 'Tap to enter the palace', ms: 2500, pattern: 'star', arch: true, c: { a: '#E8C46A', b1: '#4A0D0E', b2: '#A3201F' } },

  // ── Yoruba ──────────────────────────────────────────────────────
  'yoruba-design-1': { scene: 'curtain', ink: 'light', layout: 'split', hint: 'Tap to unveil', ms: 2400, pattern: 'stripe', c: { a: '#E9C46A', b1: '#0E1F5E', b2: '#2A52C4' } },
  'yoruba-design-2': { scene: 'envelope', ink: 'light', layout: 'hintonly', hint: 'Tap the seal to open', ms: 2500, c: { a: '#D9B56B', b1: '#2A1040', b2: '#5B2A86', p: '#F4EAF7', s: '#7A2F9E' } },
  'royal-door': { scene: 'doors', ink: 'light', layout: 'split', hint: 'Tap to open the doors', ms: 2500, pattern: 'adire', arch: true, c: { a: '#D9B56B', b1: '#0B1A3A', b2: '#1F3A78' } },

  // ── Hausa ───────────────────────────────────────────────────────
  'hausa-design-1': { scene: 'lattice', ink: 'light', layout: 'split', hint: 'Tap to open', ms: 2400, c: { a: '#E6CC84', b1: '#043A28', b2: '#0B6B4B' } },
  'hausa-design-2': { scene: 'lattice', ink: 'light', layout: 'split', hint: 'Tap to open', ms: 2400, c: { a: '#F0C98B', b1: '#4C0A1A', b2: '#8E1B34' } },
  storybook: { scene: 'book', ink: 'light', layout: 'hintonly', hint: 'Tap to open the book', ms: 2500, c: { a: '#E7C874', b1: '#0A4A50', b2: '#1E8D93' } },

  // ── Child dedication ────────────────────────────────────────────
  'dedication-heavenly-blue': { scene: 'sky', ink: 'dark', layout: 'split', hint: 'Tap to part the clouds', ms: 2500, c: { a: '#FFFFFF', b1: '#8DB8E6', b2: '#EAF4FF' } },
  'dedication-blush-blessing': { scene: 'bloom', ink: 'dark', layout: 'split', hint: 'Tap to bloom', ms: 2500, petals: 9, c: { a: '#E48CA5', b1: '#F3C9D3', b2: '#FFF3F2' } },
  'dedication-golden-grace': { scene: 'dawn', ink: 'light', layout: 'split', hint: 'Tap to let the light in', ms: 2400, c: { a: '#F3C45A', b1: '#2A1A06', b2: '#8A5A12' } },
  'dedication-little-lamb': { scene: 'meadow', ink: 'dark', layout: 'split', hint: 'Tap to meet the lamb', ms: 2400, c: { a: '#FFE08A', b1: '#CFE8F7', b2: '#F7FBEF' } },
  'dedication-royal-heritage': { scene: 'doors', ink: 'light', layout: 'split', hint: 'Tap to open the doors', ms: 2500, pattern: 'adire', arch: true, c: { a: '#E3C277', b1: '#101A44', b2: '#2F3E73' } },

  // ── Birthday ────────────────────────────────────────────────────
  'birthday-confetti-pop': { scene: 'balloons', ink: 'light', layout: 'split', hint: 'Tap to pop', ms: 2400, c: { a: '#FFD23F', s: '#FF5A5F', b1: '#C9341C', b2: '#FF7A45' } },
  'birthday-golden-hour': { scene: 'gift', ink: 'dark', layout: 'split', hint: 'Tap to open your gift', ms: 2300, c: { a: '#C69A2E', s: '#7A1E2E', b1: '#F3D58A', b2: '#FFF3D3' } },
  'birthday-midnight-party': { scene: 'spotlight', ink: 'light', layout: 'center', hint: 'Tap to start the party', ms: 2200, c: { a: '#FFD36A', b1: '#090C27', b2: '#1D2147' } },

  // ── Corporate ───────────────────────────────────────────────────
  'corporate-boardroom': { scene: 'shutter', ink: 'light', layout: 'center', hint: 'Tap to open', ms: 2100, c: { a: '#7FA6E8', b1: '#121B30', b2: '#2B3C63' } },
  'corporate-summit': { scene: 'mountain', ink: 'light', layout: 'split', hint: 'Tap to begin the ascent', ms: 2400, c: { a: '#FFD08A', b1: '#0B3B3A', b2: '#3F9B8E' } },
  'corporate-gala': { scene: 'curtain', ink: 'light', layout: 'split', hint: 'Tap to raise the curtain', ms: 2400, pattern: 'plain', c: { a: '#D9B56B', b1: '#0C0B0A', b2: '#2E2A26' } },

  // ── Funeral ─────────────────────────────────────────────────────
  'funeral-serene': { scene: 'candle', ink: 'light', layout: 'split', hint: 'Tap to enter', ms: 2300, c: { a: '#FFD9A0', b1: '#12161C', b2: '#3A4452' } },
  'funeral-life-celebrated': { scene: 'leaves', ink: 'dark', layout: 'split', hint: 'Tap to enter', ms: 2300, c: { a: '#7B9A6A', b1: '#E8EFD9', b2: '#FBF7EC' } },
  'funeral-white-lily': { scene: 'sky', ink: 'dark', layout: 'split', hint: 'Tap to enter', ms: 2600, c: { a: '#FFFFFF', b1: '#C9CFDA', b2: '#F5F6FA' } },
}
