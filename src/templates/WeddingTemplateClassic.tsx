import type { TemplateRendererProps } from './types'
import { TemplateCover } from './TemplateCover'
import { InvitationBody } from './InvitationBody'

/**
 * Classic template. A placeholder visual identity for v0.1 — swap the
 * cover treatment or add bespoke sections here later without touching
 * InvitationBody, which every template shares.
 */
export function WeddingTemplateClassic({ invitation }: TemplateRendererProps) {
  return (
    <div>
      <TemplateCover invitation={invitation} tone="classic" eyebrow="Together With Their Families" />
      <InvitationBody invitation={invitation} />
    </div>
  )
}
