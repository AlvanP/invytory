/**
 * All event categories the platform will eventually support.
 * Only 'wedding' is buildable in v0.1 — the rest exist so routes,
 * filters and data shapes don't need to be redesigned when they launch.
 */
export type EventCategory =
  | 'wedding'
  | 'birthday'
  | 'child-dedication'
  | 'corporate'
  | 'funeral'
  | 'engagement'
  | 'anniversary'
  | 'other'

export const SUPPORTED_EVENT_CATEGORIES: EventCategory[] = ['wedding']

export interface InvitationTemplate {
  id: string
  name: string
  description: string
  category: EventCategory
  /** key used to look up the React renderer in the template registry */
  rendererKey: string
  previewTone: 'royal' | 'garden' | 'storybook' | 'modern' | 'heritage' | 'classic'
  isPremium: boolean
  status: 'available' | 'coming-soon'
}
