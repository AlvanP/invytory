import type { CeremonyType } from '@/types/wedding'
import type { InvitationTemplate, TemplateCollection } from '@/types/template'

/** The collections shown as tabs, in display order. */
export const COLLECTION_TABS: TemplateCollection[] = ['white', 'igbo', 'yoruba', 'hausa']

export const COLLECTION_LABELS: Record<TemplateCollection, string> = {
  white: 'White',
  igbo: 'Igbo',
  yoruba: 'Yoruba',
  hausa: 'Hausa',
  universal: 'Any ceremony',
}

/**
 * Which collection a ceremony type should browse first.
 * 'custom' (Custom Traditional) has no collection of its own, so it
 * returns null — callers show every design.
 */
export function collectionForCeremonyType(type: CeremonyType): TemplateCollection | null {
  switch (type) {
    case 'white':
      return 'white'
    case 'igbo':
      return 'igbo'
    case 'yoruba':
      return 'yoruba'
    case 'hausa':
      return 'hausa'
    default:
      return null
  }
}

/** The reverse: the ceremony type a collection implies, or null if it implies none. */
export function ceremonyTypeForCollection(collection: TemplateCollection): CeremonyType | null {
  switch (collection) {
    case 'white':
      return 'white'
    case 'igbo':
      return 'igbo'
    case 'yoruba':
      return 'yoruba'
    case 'hausa':
      return 'hausa'
    default:
      return null
  }
}

export interface TemplateGroups {
  /** Templates in the chosen collection. */
  primary: InvitationTemplate[]
  /** Universal templates that suit any ceremony. */
  universal: InvitationTemplate[]
  /** Everything else (only filled when `includeOthers` is true). */
  others: InvitationTemplate[]
}

/**
 * Splits templates into display groups for a collection.
 * collection === null means "no filter": everything is primary.
 */
export function groupTemplates(
  templates: InvitationTemplate[],
  collection: TemplateCollection | null,
  includeOthers = false
): TemplateGroups {
  if (collection === null) {
    return { primary: templates, universal: [], others: [] }
  }
  const primary = templates.filter((t) => t.collection === collection)
  const universal =
    collection === 'universal' ? [] : templates.filter((t) => t.collection === 'universal')
  const others = includeOthers
    ? templates.filter((t) => t.collection !== collection && t.collection !== 'universal')
    : []
  return { primary, universal, others }
}