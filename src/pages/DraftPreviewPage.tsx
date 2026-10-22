import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { InvitationTemplate } from '@/types'
import { peekActiveDraft } from '@/hooks/useWizard'
import { draftToPreviewInvitation } from '@/utils/draftToPreviewInvitation'
import { templateService } from '@/services/templateService'
import { getTemplateById } from '@/data/templates'
import { InvitationRenderer } from '@/components/invitation/InvitationRenderer'
import { ArrivalScene } from '@/components/entrance/ArrivalScene'
import { MusicToggle } from '@/components/invitation/MusicToggle'
import { useInvitationMusic } from '@/hooks/useInvitationMusic'

/**
 * The invitation being created, shown exactly as a guest will see it: the entrance first, then
 * the invitation, with its music. It lives on its own page so it can sit inside a phone-sized
 * frame in the wizard's Preview step (a frame has its own screen size, so nothing is squeezed).
 * It reads the saved draft; ?c=<ceremony id> picks the ceremony.
 */
export function DraftPreviewPage() {
  const [params] = useSearchParams()
  const draft = useMemo(() => peekActiveDraft(), [])
  const ceremony = draft.ceremonies.find((c) => c.id === params.get('c')) ?? draft.ceremonies[0]
  const invitation = useMemo(() => draftToPreviewInvitation(draft, ceremony), [draft, ceremony])
  const templateId = ceremony.templateId || draft.templateId
  const [template, setTemplate] = useState<InvitationTemplate | undefined>()
  useEffect(() => {
    if (templateId) templateService.getById(templateId).then(setTemplate)
  }, [templateId])
  const entranceTemplate = getTemplateById(templateId)
  const music = useInvitationMusic(ceremony.musicUrl ?? null)

  return (
    <>
      <ArrivalScene
        tone={entranceTemplate?.previewTone ?? 'classic'}
        templateId={entranceTemplate?.id}
        brideName={invitation.brideName}
        groomName={invitation.groomName}
        onTap={music.start}
      >
        <InvitationRenderer invitation={invitation} template={template} />
      </ArrivalScene>
      {music.visible && <MusicToggle muted={music.muted} needsTap={music.needsTap} onToggle={music.toggle} />}
    </>
  )
}
