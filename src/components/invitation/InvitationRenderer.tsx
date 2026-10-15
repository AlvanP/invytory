import type { InvitationTemplate, WeddingInvitation } from '@/types'
import { templateRegistry } from '@/templates/registry'
import { WeddingTemplateClassic } from '@/templates/WeddingTemplateClassic'
import { DEFAULT_THEME_COLOUR, isHexColour, themeStyle } from '@/utils/colorTheme'

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
  // The couple's colour of the day, or the design's own colour. Every piece of the
  // invitation reads its colours from these variables.
  const colour = isHexColour(invitation.themeColor)
    ? invitation.themeColor
    : (DEFAULT_THEME_COLOUR[template?.previewTone ?? 'classic'] ?? DEFAULT_THEME_COLOUR.classic)
  return (
    <div style={themeStyle(colour)} className="bg-[color:var(--iv-paper)] text-[color:var(--iv-ink)]">
      <Renderer invitation={invitation} />
    </div>
  )
}