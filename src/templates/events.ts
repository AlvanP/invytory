import type { SectionId } from './sections'

/**
 * The kinds of event an invitation can be for. Every kind uses the same sections and the same
 * designs; what changes is the wording and which sections apply. To change how an event reads,
 * edit its entry below.
 *
 * Fields are shared between kinds, so for events that are not weddings:
 *   brideName     = the main name (the child, the celebrant, the event title, the person remembered)
 *   groomName     = left empty (a second name only appears if you fill it in)
 *   tagline       = the line under the name (the parents, the age, the company, the dates)
 *   loveStory     = the main text      howWeMet = the second text      vows = the third text
 *   weddingDate / weddingTime = the date and time of the event
 */
export type EventKind = 'wedding' | 'child-dedication' | 'birthday' | 'corporate' | 'funeral'

export const EVENT_KINDS: EventKind[] = ['wedding', 'child-dedication', 'birthday', 'corporate', 'funeral']

interface Heading {
  eyebrow: string
  title: string
}

export interface EventCopy {
  /** Shown in the gallery and on the site. */
  label: string
  /** Short plural, for navigation. */
  plural: string
  /** One line describing the category on the homepage. */
  blurb: string
  /** Small line above the names on the cover. */
  coverEyebrow: string
  /** Small tag under the date on the cover. Weddings show the ceremony name instead. */
  coverTag?: string
  countdown: Heading
  details: Heading
  receptionLabel: string
  venue: Heading
  dresscode: Heading
  story: Heading
  /** Labels on the second and third story texts. */
  storySecond: string
  storyThird: string
  gallery: Heading
  rsvp: Heading
  wall: Heading
  gifts: Heading
  giftLabel: string
  /** Sections this event does not use. */
  skip: SectionId[]
  /** The name of the event in the calendar entry, e.g. "Ada's Birthday". */
  calendarTitle: (name: string, second: string) => string
  footerSign?: string
}

export const eventCopy: Record<EventKind, EventCopy> = {
  wedding: {
    label: 'Wedding',
    plural: 'Weddings',
    blurb: 'White weddings and Igbo, Yoruba and Hausa traditional ceremonies.',
    coverEyebrow: 'Together With Their Families',
    countdown: { eyebrow: 'Save The Date', title: 'Until We Say I Do' },
    details: { eyebrow: 'Details', title: 'Join Us' },
    receptionLabel: 'Reception',
    venue: { eyebrow: 'Getting There', title: 'Venue & Map' },
    dresscode: { eyebrow: 'What To Wear', title: 'Dress Code' },
    story: { eyebrow: 'Our Journey', title: 'Our Story' },
    storySecond: 'How We Met',
    storyThird: 'Our Vows',
    gallery: { eyebrow: 'Gallery', title: 'Moments Together' },
    rsvp: { eyebrow: 'Kindly Respond', title: 'RSVP' },
    wall: { eyebrow: 'From Our Guests', title: 'Messages For The Couple' },
    gifts: { eyebrow: 'A Little More', title: 'Gifts & Notes' },
    giftLabel: 'Gifts',
    skip: [],
    calendarTitle: (a, b) => `${a} & ${b}'s Wedding`,
  },
  'child-dedication': {
    label: 'Child dedication',
    plural: 'Child dedications',
    blurb: 'Naming ceremonies and dedications, soft, prayerful and full of thanks.',
    coverEyebrow: 'The Dedication Of',
    coverTag: 'Child Dedication',
    countdown: { eyebrow: 'Save The Date', title: 'Until The Dedication' },
    details: { eyebrow: 'Details', title: 'Join Us' },
    receptionLabel: 'After The Service',
    venue: { eyebrow: 'Getting There', title: 'Venue & Map' },
    dresscode: { eyebrow: 'What To Wear', title: 'Dress Code' },
    story: { eyebrow: 'A Blessing', title: 'Our Little One' },
    storySecond: 'A Little About Them',
    storyThird: 'Our Prayer For Them',
    gallery: { eyebrow: 'Gallery', title: 'Little Moments' },
    rsvp: { eyebrow: 'Kindly Respond', title: 'Will You Join Us?' },
    wall: { eyebrow: 'From Our Guests', title: 'Blessings For The Little One' },
    gifts: { eyebrow: 'A Little More', title: 'Gifts & Notes' },
    giftLabel: 'Gifts',
    skip: [],
    calendarTitle: (a) => `Dedication of ${a}`,
    footerSign: 'With love and thanksgiving',
  },
  birthday: {
    label: 'Birthday',
    plural: 'Birthdays',
    blurb: 'From first birthdays to milestone parties, loud, bright and personal.',
    coverEyebrow: 'Come Celebrate With Us',
    coverTag: 'Birthday Celebration',
    countdown: { eyebrow: 'Save The Date', title: 'Until The Party' },
    details: { eyebrow: 'Details', title: 'The Plan' },
    receptionLabel: 'The Party',
    venue: { eyebrow: 'Getting There', title: 'Venue & Map' },
    dresscode: { eyebrow: 'What To Wear', title: 'Dress Code' },
    story: { eyebrow: 'The Story So Far', title: 'About The Celebrant' },
    storySecond: 'Fun Fact',
    storyThird: 'A Note From Me',
    gallery: { eyebrow: 'Gallery', title: 'Favourite Moments' },
    rsvp: { eyebrow: 'Will You Be There?', title: 'RSVP' },
    wall: { eyebrow: 'From Our Guests', title: 'Birthday Wishes' },
    gifts: { eyebrow: 'A Little More', title: 'Gifts & Wish List' },
    giftLabel: 'Wish list',
    skip: [],
    calendarTitle: (a) => `${a}'s Birthday`,
    footerSign: 'Can’t wait to celebrate with you',
  },
  corporate: {
    label: 'Corporate event',
    plural: 'Corporate events',
    blurb: 'Launches, galas, summits and dinners, clear, sharp and professional.',
    coverEyebrow: 'You Are Invited To',
    coverTag: 'Corporate Event',
    countdown: { eyebrow: 'Mark Your Calendar', title: 'Until The Event' },
    details: { eyebrow: 'Programme', title: 'Event Details' },
    receptionLabel: 'Programme',
    venue: { eyebrow: 'Getting There', title: 'Venue & Map' },
    dresscode: { eyebrow: 'Attire', title: 'Dress Code' },
    story: { eyebrow: 'About', title: 'About The Event' },
    storySecond: 'Who Should Attend',
    storyThird: 'Keynote',
    gallery: { eyebrow: 'Gallery', title: 'Highlights' },
    rsvp: { eyebrow: 'Register', title: 'Confirm Attendance' },
    wall: { eyebrow: 'Notes', title: 'Notes From Attendees' },
    gifts: { eyebrow: 'More Information', title: 'Good To Know' },
    giftLabel: 'Notes',
    skip: ['wall'],
    calendarTitle: (a) => a,
    footerSign: 'We look forward to seeing you',
  },
  funeral: {
    label: 'Funeral',
    plural: 'Funerals',
    blurb: 'Quiet, dignified invitations that celebrate a life and gather the people who loved it.',
    coverEyebrow: 'In Loving Memory Of',
    coverTag: 'Celebration Of Life',
    countdown: { eyebrow: '', title: '' },
    details: { eyebrow: 'Order Of Service', title: 'Service Details' },
    receptionLabel: 'Refreshments',
    venue: { eyebrow: 'Getting There', title: 'Venue & Map' },
    dresscode: { eyebrow: 'Attire', title: 'What To Wear' },
    story: { eyebrow: 'Tribute', title: 'A Life Remembered' },
    storySecond: 'Remembered For',
    storyThird: 'A Favourite Verse',
    gallery: { eyebrow: 'Gallery', title: 'Cherished Memories' },
    rsvp: { eyebrow: 'Kindly Let Us Know', title: 'Will You Attend?' },
    wall: { eyebrow: 'Condolences', title: 'Words Of Comfort' },
    gifts: { eyebrow: 'Support', title: 'Donations & Notes' },
    giftLabel: 'Donations',
    skip: ['countdown'],
    calendarTitle: (a) => `Funeral service for ${a}`,
    footerSign: 'Forever in our hearts',
  },
}

export function getEventCopy(kind: string | undefined): EventCopy {
  return eventCopy[(kind as EventKind) ?? 'wedding'] ?? eventCopy.wedding
}

/** The wording of the creation steps for each kind of event. */
export interface WizardCopy {
  /** Short names in the progress bar. */
  nameStep: string
  detailsStep: string
  nameTitle: string
  firstLabel: string
  firstPlaceholder: string
  /** Wedding only: the second name. Left out for every other event. */
  secondLabel?: string
  secondPlaceholder?: string
  taglineLabel: string
  taglinePlaceholder: string
  taglineHint: string
  detailsTitle: string
  detailsDescription: string
  storyTitle: string
  storyDescription: string
  storyMain: { label: string; placeholder: string }
  storySecond: { label: string; placeholder: string }
  storyThird: { label: string; placeholder: string }
  /** null = this event has no hashtag field. */
  hashtag: { label: string; placeholder: string } | null
  gift: { label: string; placeholder: string }
}

export const wizardCopy: Record<EventKind, WizardCopy> = {
  wedding: {
    nameStep: 'Couple',
    detailsStep: 'Ceremonies',
    nameTitle: 'Tell us about the couple',
    firstLabel: "Bride's name",
    firstPlaceholder: 'e.g. Ada',
    secondLabel: "Groom's name",
    secondPlaceholder: 'e.g. Michael',
    taglineLabel: 'Short phrase',
    taglinePlaceholder: 'Together with their families',
    taglineHint: 'Appears just above your names on the invitation.',
    detailsTitle: 'Ceremonies',
    detailsDescription: "Add every ceremony that's part of this wedding. They can be on the same day or months apart, each with its own date, venue, and design.",
    storyTitle: 'Your story',
    storyDescription: "Entirely optional. Skip this step if you'd rather keep things simple. Not sure what to write? Try AI Assist under each box.",
    storyMain: { label: 'Our story', placeholder: 'Share the story of your relationship...' },
    storySecond: { label: 'How we met', placeholder: 'Where and how did you two meet?' },
    storyThird: { label: 'Vows', placeholder: "Share a line from your vows, if you'd like." },
    hashtag: { label: 'Wedding hashtag', placeholder: '#AdaAndMichael2027' },
    gift: { label: 'Gift information', placeholder: 'Registry details or a note about gifts' },
  },
  'child-dedication': {
    nameStep: 'Child',
    detailsStep: 'Details',
    nameTitle: 'Tell us about the child',
    firstLabel: 'Child’s name',
    firstPlaceholder: 'e.g. Baby Zara',
    taglineLabel: 'Parents’ names',
    taglinePlaceholder: 'Daughter of Pastor & Mrs Okoye',
    taglineHint: 'Appears under the child’s name on the invitation.',
    detailsTitle: 'Dedication details',
    detailsDescription: 'When and where the dedication takes place. Everything else is optional.',
    storyTitle: 'A word about your child',
    storyDescription: 'Entirely optional. Skip this step if you would rather keep things simple.',
    storyMain: { label: 'Why we are celebrating', placeholder: 'Share what this day means to your family...' },
    storySecond: { label: 'A little about them', placeholder: 'What their name means, or a sweet detail.' },
    storyThird: { label: 'Our prayer for them', placeholder: 'A prayer or scripture for your child.' },
    hashtag: { label: 'Event hashtag', placeholder: '#ZaraDedication' },
    gift: { label: 'Gift information', placeholder: 'Gift ideas or a note about gifts' },
  },
  birthday: {
    nameStep: 'Celebrant',
    detailsStep: 'Details',
    nameTitle: 'Tell us about the celebrant',
    firstLabel: 'Celebrant’s name',
    firstPlaceholder: 'e.g. Adaeze',
    taglineLabel: 'Age or a short line',
    taglinePlaceholder: 'is turning 30',
    taglineHint: 'Appears under the name on the invitation.',
    detailsTitle: 'Party details',
    detailsDescription: 'When and where the party is. Everything else is optional.',
    storyTitle: 'About the celebrant',
    storyDescription: 'Entirely optional. Skip this step if you would rather keep things simple.',
    storyMain: { label: 'The story so far', placeholder: 'A few lines about the celebrant and the occasion...' },
    storySecond: { label: 'Fun fact', placeholder: 'Something your guests will smile at.' },
    storyThird: { label: 'A note from me', placeholder: 'A short, personal message to your guests.' },
    hashtag: { label: 'Party hashtag', placeholder: '#Adaeze30' },
    gift: { label: 'Gifts & wish list', placeholder: 'A wish list link, or a note about gifts' },
  },
  corporate: {
    nameStep: 'Event',
    detailsStep: 'Details',
    nameTitle: 'Tell us about the event',
    firstLabel: 'Event title',
    firstPlaceholder: 'e.g. Lagos Innovation Summit',
    taglineLabel: 'Host or company',
    taglinePlaceholder: 'Hosted by Northwind Capital',
    taglineHint: 'Appears under the event title on the invitation.',
    detailsTitle: 'Event details',
    detailsDescription: 'When and where the event takes place. Add the programme in the box below.',
    storyTitle: 'About the event',
    storyDescription: 'Entirely optional. Skip this step if the basics are enough.',
    storyMain: { label: 'About the event', placeholder: 'What the event is, and why it matters...' },
    storySecond: { label: 'Who should attend', placeholder: 'The people this event is for.' },
    storyThird: { label: 'Keynote or special guest', placeholder: 'Who is speaking or presenting.' },
    hashtag: { label: 'Event hashtag', placeholder: '#LISummit2027' },
    gift: { label: 'Good to know', placeholder: 'Parking, registration, what to bring' },
  },
  funeral: {
    nameStep: 'Loved one',
    detailsStep: 'Service',
    nameTitle: 'Tell us about your loved one',
    firstLabel: 'Full name',
    firstPlaceholder: 'e.g. Chief Emmanuel Adewale',
    taglineLabel: 'Dates',
    taglinePlaceholder: '1951 – 2026',
    taglineHint: 'Appears under the name on the invitation.',
    detailsTitle: 'Service details',
    detailsDescription: 'When and where the service takes place. Everything else is optional.',
    storyTitle: 'A tribute',
    storyDescription: 'Entirely optional. Skip this step if you would rather keep things simple.',
    storyMain: { label: 'A tribute', placeholder: 'A few words about their life...' },
    storySecond: { label: 'Remembered for', placeholder: 'What they will be remembered for.' },
    storyThird: { label: 'A favourite verse', placeholder: 'A scripture or saying they loved.' },
    hashtag: null,
    gift: { label: 'Donations & notes', placeholder: 'Where donations may be sent, or a note for guests' },
  },
}

export function getWizardCopy(kind: string | undefined): WizardCopy {
  return wizardCopy[(kind as EventKind) ?? 'wedding'] ?? wizardCopy.wedding
}
