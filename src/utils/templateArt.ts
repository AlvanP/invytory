import type { EntranceAssets, EntranceStyle } from '@/templates/entranceConfig'
import { SECTION_IDS, SECTION_ART_PIECES, type SectionId, type SectionArtPiece } from '@/templates/sections'

/**
 * Drop-in artwork. Put image files in
 *   src/assets/templates/<template-id>/<slot>.<png|jpg|webp|svg>
 * and they are picked up automatically: no code or config changes.
 * See src/assets/templates/README.md for every slot name and size.
 */
const files = import.meta.glob('../assets/templates/*/*.{png,jpg,jpeg,webp,svg,PNG,JPG,JPEG,WEBP,SVG}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

export interface TemplateArt {
  /** Thumbnail shown in the template pickers, gallery and landing page (3:4). */
  preview?: string
  /** Background image behind the invitation's opening section. */
  coverBackground?: string
  /** Pieces for the opening animation (doors, gate, book, envelope). */
  entrance: EntranceAssets
  /** Extra cover pieces: a frame laid over the cover photo, ornaments above and below the writing, an emblem. */
  cover: { photoFrame?: string; ornamentTop?: string; ornamentBottom?: string; emblem?: string }
  /** Section-by-section artwork: `<section>-bg`, `<section>-divider`, `<section>-corner`. */
  sections: Partial<Record<SectionId, Partial<Record<SectionArtPiece, string>>>>
}

const SLOT_NAMES = [
  'preview',
  'cover-background',
  'cover-photo-frame',
  'cover-ornament-top',
  'cover-ornament-bottom',
  'cover-emblem',
  'entrance-left',
  'entrance-right',
  'entrance-cover',
  'entrance-envelope',
  'entrance-seal',
  'entrance-background',
  'entrance-bow',
  'entrance-flap',
  'entrance-inside',
  ...SECTION_IDS.flatMap((id) => SECTION_ART_PIECES.map((piece) => `${id}-${piece}`)),
] as const

/** template id -> slot name -> url. Built once when the site loads. */
const byTemplate: Record<string, Record<string, string>> = {}

for (const [path, url] of Object.entries(files)) {
  const match = path.match(/\/assets\/templates\/([^/]+)\/([^/]+)\.[a-z]+$/i)
  if (!match) continue
  const id = match[1].toLowerCase()
  const slot = match[2].toLowerCase()
  if (!(SLOT_NAMES as readonly string[]).includes(slot)) continue
  byTemplate[id] ??= {}
  byTemplate[id][slot] = url
}

const EMPTY: TemplateArt = { entrance: {}, cover: {}, sections: {} }

export function getTemplateArt(templateId: string | undefined): TemplateArt {
  const slots = templateId ? byTemplate[templateId.toLowerCase()] : undefined
  if (!slots) return EMPTY
  const sections: TemplateArt['sections'] = {}
  for (const id of SECTION_IDS) {
    for (const piece of SECTION_ART_PIECES) {
      const url = slots[`${id}-${piece}`]
      if (url) (sections[id] ??= {})[piece] = url
    }
  }
  return {
    sections,
    preview: slots['preview'],
    coverBackground: slots['cover-background'],
    cover: {
      photoFrame: slots['cover-photo-frame'],
      ornamentTop: slots['cover-ornament-top'],
      ornamentBottom: slots['cover-ornament-bottom'],
      emblem: slots['cover-emblem'],
    },
    entrance: {
      leftPanel: slots['entrance-left'],
      rightPanel: slots['entrance-right'],
      cover: slots['entrance-cover'],
      envelope: slots['entrance-envelope'],
      seal: slots['entrance-seal'],
      background: slots['entrance-background'],
      bow: slots['entrance-bow'],
      flap: slots['entrance-flap'],
      // Reuse the invitation's own backdrop behind the doors when no special one is given.
      inside: slots['entrance-inside'] ?? slots['cover-background'],
    },
  }
}

/**
 * Chooses the opening style. The template's usual style wins when its own
 * artwork exists; otherwise the style follows whichever artwork was supplied
 * (left+right panels -> doors, cover -> book, envelope -> envelope).
 */
export function pickEntranceStyle(base: EntranceStyle, a: EntranceAssets): EntranceStyle {
  const split = !!(a.leftPanel && a.rightPanel)
  // The two layered styles are chosen by the extra pieces that make them work.
  if (split && a.bow) return 'gatefold'
  if (a.envelope && a.flap) return 'waxenvelope'
  if ((base === 'doors' || base === 'gate') && split) return base
  if (base === 'book' && a.cover) return base
  if (base === 'envelope' && a.envelope) return base
  if (split) return 'doors'
  if (a.cover) return 'book'
  if (a.envelope) return 'envelope'
  return base
}
