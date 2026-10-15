import type { ComponentType } from 'react'
import type { WeddingInvitation } from '@/types'
import type { SectionId } from '../sections'
import { TemplateCover } from '../TemplateCover'
import { CountdownSection } from './CountdownSection'
import { DetailsSection } from './DetailsSection'
import { VenueSection } from './VenueSection'
import { DressCodeSection } from './DressCodeSection'
import { StorySection } from './StorySection'
import { MomentSection, featurePhoto } from './MomentSection'
import { GallerySection, sliderPhotos } from './GallerySection'
import { RsvpSection } from './RsvpSection'
import { GiftsSection } from './GiftsSection'
import { FooterSection } from './FooterSection'

interface SectionEntry {
  Component: ComponentType<{ invitation: WeddingInvitation }>
  /** False when the couple has nothing for this section, so it is skipped. */
  has: (i: WeddingInvitation) => boolean
}

/** Section id -> its component and the rule for when it appears. The order lives in ../sections.ts. */
export const sectionRegistry: Record<SectionId, SectionEntry> = {
  cover: { Component: TemplateCover, has: () => true },
  countdown: { Component: CountdownSection, has: () => true },
  details: { Component: DetailsSection, has: () => true },
  venue: { Component: VenueSection, has: (i) => !!(i.venueName || i.venueAddress || i.city) },
  dresscode: { Component: DressCodeSection, has: (i) => !!i.dressCode?.trim() },
  story: { Component: StorySection, has: (i) => !!(i.loveStory || i.howWeMet || i.vows) },
  moment: { Component: MomentSection, has: (i) => !!featurePhoto(i) },
  gallery: { Component: GallerySection, has: (i) => sliderPhotos(i).length > 0 },
  rsvp: { Component: RsvpSection, has: () => true },
  gifts: { Component: GiftsSection, has: (i) => !!(i.giftInformation || i.additionalMessage) },
  footer: { Component: FooterSection, has: () => true },
}
