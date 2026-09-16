import type { WeddingInvitation } from '@/types'

/** Every template component receives exactly this — never raw template IDs
 * or unrelated app state. This is what keeps templates swappable. */
export interface TemplateRendererProps {
  invitation: WeddingInvitation
}
