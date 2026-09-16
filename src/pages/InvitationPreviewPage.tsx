import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { WeddingInvitation, InvitationTemplate } from '@/types'
import { invitationService } from '@/services/invitationService'
import { templateService } from '@/services/templateService'
import { InvitationRenderer } from '@/components/invitation/InvitationRenderer'
import { InvitationPreviewSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/State'
import { Button } from '@/components/ui/Button'

export function InvitationPreviewPage() {
  const { slug } = useParams<{ slug: string }>()
  const [invitation, setInvitation] = useState<WeddingInvitation | null | undefined>(undefined)
  const [template, setTemplate] = useState<InvitationTemplate | undefined>()

  useEffect(() => {
    if (!slug) return
    invitationService.getBySlug(slug).then((found) => setInvitation(found ?? null))
  }, [slug])

  useEffect(() => {
    if (invitation) templateService.getById(invitation.templateId).then(setTemplate)
  }, [invitation])

  if (invitation === undefined) return <InvitationPreviewSkeleton />

  if (invitation === null) {
    return (
      <div className="mx-auto max-w-md px-6 py-24">
        <ErrorState
          title="This invitation could not be found."
          description="The link may be mistyped, or the invitation may no longer be available."
          action={<Link to="/create"><Button size="sm">Create an Invitation</Button></Link>}
        />
      </div>
    )
  }

  return <InvitationRenderer invitation={invitation} template={template} />
}
