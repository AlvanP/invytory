import type { InvitationTemplate, WeddingInvitation } from '@/types'
import { templateRegistry } from '@/templates/registry'
import { WeddingTemplateClassic } from '@/templates/WeddingTemplateClassic'

/**
 * Invitation → receives invitation data → receives a template →
 * renders the matching template component. This is the one place in
 * the app that turns (data, template) into pixels; pages never import
 * a template component directly.
 */
export function InvitationRenderer({
  invitation,
  template,
}: {
  invitation: WeddingInvitation
  template: InvitationTemplate | undefined
}) {
  const Renderer = (template && templateRegistry[template.rendererKey]) || WeddingTemplateClassic
  return <Renderer invitation={invitation} />
}
