import type { InvitationTemplate, WeddingInvitation } from '@/types'
import { templateRegistry } from '@/templates/registry'
import { DesignedInvitation } from '@/templates/DesignedInvitation'
import { getDesign } from '@/templates/designs'
import { parseColours, themeStyle } from '@/utils/colorTheme'

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
  const Renderer = (template && templateRegistry[template.rendererKey]) || DesignedInvitation
  // The couple's colour of the day, or the design's own colour. Every piece of the
  // invitation reads its colours from these variables.
  const colour = parseColours(invitation.themeColor)[0] ?? getDesign(invitation.templateId).colour
  return (
    <div style={themeStyle(colour)} className="bg-[color:var(--iv-paper)] text-[color:var(--iv-ink)]">
      <Renderer invitation={invitation} />
    </div>
  )
}
