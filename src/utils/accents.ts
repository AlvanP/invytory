import type { EventKind } from '@/templates/events'

/** One accent colour per kind of event, used on the home page to tell the occasions apart. */
export const ACCENTS: Record<EventKind, string> = {
  wedding: '#D9577A',
  'child-dedication': '#4A90C2',
  birthday: '#F2A93B',
  corporate: '#1F8A8A',
  funeral: '#6B8F71',
}

/** A soft tint of a colour on ivory, for section backgrounds. */
export const tint = (hex: string, percent = 14) => `color-mix(in srgb, ${hex} ${percent}%, #FAF6F3)`
