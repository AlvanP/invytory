import type { ComponentType } from 'react'
import type { TemplateRendererProps } from './types'
import { WeddingTemplateRoyal } from './WeddingTemplateRoyal'
import { WeddingTemplateGarden } from './WeddingTemplateGarden'
import { WeddingTemplateStorybook } from './WeddingTemplateStorybook'
import { WeddingTemplateModern } from './WeddingTemplateModern'
import { WeddingTemplateAfrican } from './WeddingTemplateAfrican'
import { WeddingTemplateClassic } from './WeddingTemplateClassic'

/**
 * The template engine's lookup table. `InvitationRenderer` (in
 * `src/components/invitation/InvitationRenderer.tsx`) reads a template's
 * `rendererKey` and pulls the matching component from here. Adding a
 * seventh template later means: build the component, add one line below.
 */
export const templateRegistry: Record<string, ComponentType<TemplateRendererProps>> = {
  royal: WeddingTemplateRoyal,
  garden: WeddingTemplateGarden,
  storybook: WeddingTemplateStorybook,
  modern: WeddingTemplateModern,
  african: WeddingTemplateAfrican,
  classic: WeddingTemplateClassic,
}
