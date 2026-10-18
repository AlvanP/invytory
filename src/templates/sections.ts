/**
 * THE SECTION MAP. Every invitation, in every design, is these sections in this order.
 * A section is simply skipped when the couple has nothing to show in it (for example no
 * dress code, or no photos). Each section has its own file in src/templates/sections/.
 *
 * Artwork is assigned section by section: for each section id below, a design can
 * supply `<id>-bg`, `<id>-divider` and `<id>-corner` images (see src/assets/templates/README.md).
 */
export const SECTION_IDS = [
  'cover',
  'countdown',
  'details',
  'venue',
  'dresscode',
  'story',
  'moment',
  'gallery',
  'rsvp',
  'wall',
  'gifts',
  'footer',
] as const

export type SectionId = (typeof SECTION_IDS)[number]

export interface SectionInfo {
  /** Short name, used in docs and in artwork file names. */
  label: string
  /** What it shows. */
  shows: string
  /** Where the information comes from in the wizard. */
  from: string
}

export const SECTION_INFO: Record<SectionId, SectionInfo> = {
  cover: {
    label: 'Cover & summary',
    shows: 'The couple’s names, date, time and venue over the hero photo',
    from: 'Names, date, time, venue, hero photo',
  },
  countdown: {
    label: 'Date & countdown',
    shows: 'The date in large type (scratch-to-reveal in some designs), the countdown and Save the Date buttons',
    from: 'Date, time',
  },
  details: {
    label: 'Programme & reception',
    shows: 'Date, time and reception information in cards',
    from: 'Date, time, reception info',
  },
  venue: {
    label: 'Venue & map',
    shows: 'The venue, its address and an Open in Maps button',
    from: 'Venue name, address, city, map link',
  },
  dresscode: {
    label: 'Dress code',
    shows: 'The dress code with the colour of the day',
    from: 'Dress code, colour of the day',
  },
  story: {
    label: 'Our story',
    shows: 'How they met, their story and their vows',
    from: 'Love story, how we met, vows',
  },
  moment: {
    label: 'Floating photo',
    shows: 'One photo in a minimal frame that tilts as guests scroll',
    from: 'Floating photo',
  },
  gallery: {
    label: 'Photo gallery',
    shows: 'Up to four photos, shown in a moving or layered style that changes with the design',
    from: 'Slider photos',
  },
  rsvp: {
    label: 'RSVP',
    shows: 'Yes / no, name, guests and a message',
    from: 'RSVP message',
  },
  wall: {
    label: 'Guest messages',
    shows: 'Messages guests chose to leave in public when they RSVP, in a box that scrolls',
    from: 'Guests\u2019 RSVP messages (only the ones they tick to share)',
  },
  gifts: {
    label: 'Gifts & notes',
    shows: 'Gift information and any additional message',
    from: 'Gift information, additional message',
  },
  footer: {
    label: 'Footer',
    shows: 'The names, the wedding hashtag and the sign-off',
    from: 'Names, hashtag',
  },
}

/** The artwork pieces a section can take. File name = `<sectionId>-<piece>`. */
export const SECTION_ART_PIECES = ['bg', 'divider', 'corner'] as const
export type SectionArtPiece = (typeof SECTION_ART_PIECES)[number]
