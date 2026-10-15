import type { ComponentType } from 'react'
import type { TemplateRendererProps } from './types'
import { DesignedInvitation } from './DesignedInvitation'

/**
 * The template engine's lookup table. Every template now uses the one `designed`
 * renderer, which builds the invitation from the shared sections (see sections.ts) and
 * the template's own design (see designs.ts).
 */
export const templateRegistry: Record<string, ComponentType<TemplateRendererProps>> = {
  designed: DesignedInvitation,
}
