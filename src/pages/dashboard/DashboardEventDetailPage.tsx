import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Eye, Users, Share2, Settings, ExternalLink } from 'lucide-react'
import type { WeddingInvitation, InvitationTemplate } from '@/types'
import { invitationService } from '@/services/invitationService'
import { templateService } from '@/services/templateService'
import { formatDate, formatNumber } from '@/utils/format'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/State'
import { InvitationPreviewSkeleton } from '@/components/ui/Skeleton'
import { ShareModal } from '@/components/dashboard/ShareModal'

export function DashboardEventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const [invitation, setInvitation] = useState<WeddingInvitation | null | undefined>(undefined)
  const [template, setTemplate] = useState<InvitationTemplate | undefined>()
  const [shareOpen, setShareOpen] = useState(false)

  useEffect(() => {
    if (!eventId) return
    invitationService.getById(eventId).then((found) => setInvitation(found ?? null))
  }, [eventId])

  useEffect(() => {
    if (invitation) templateService.getById(invitation.templateId).then(setTemplate)
  }, [invitation])

  if (invitation === undefined) return <InvitationPreviewSkeleton />

  if (invitation === null) {
    return (
      <ErrorState
        title="Invitation not found"
        description="It may have been removed, or the link may be incorrect."
        action={<Link to="/dashboard/events"><Button size="sm">Back to Invitations</Button></Link>}
      />
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.2em] text-gold">Invitation</p>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="font-display text-3xl text-ink">{invitation.brideName} &amp; {invitation.groomName}</h1>
            <Badge tone={invitation.status === 'published' ? 'confirmed' : 'draft'}>{invitation.status}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/invitation/${invitation.slug}`}>
            <Button variant="outline" size="sm" icon={<Eye className="size-4" />}>View</Button>
          </Link>
          <Button variant="outline" size="sm" icon={<Share2 className="size-4" />} onClick={() => setShareOpen(true)}>Share</Button>
          <Link to={`/dashboard/events/${invitation.id}/settings`}>
            <Button variant="outline" size="sm" icon={<Settings className="size-4" />}>Settings</Button>
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-md border border-ink/10 bg-white p-6">
          <p className="text-xs uppercase tracking-wide text-ink-soft/70">Template</p>
          <p className="mt-1 text-sm text-ink">{template?.name ?? 'Unassigned'}</p>

          <p className="mt-4 text-xs uppercase tracking-wide text-ink-soft/70">Wedding Date</p>
          <p className="mt-1 text-sm text-ink">{formatDate(invitation.weddingDate)}</p>

          <p className="mt-4 text-xs uppercase tracking-wide text-ink-soft/70">Venue</p>
          <p className="mt-1 text-sm text-ink">{invitation.venueName || 'Not set'}</p>

          <p className="mt-4 text-xs uppercase tracking-wide text-ink-soft/70">Invitation URL</p>
          <Link to={`/invitation/${invitation.slug}`} className="mt-1 inline-flex items-center gap-1 text-sm text-gold hover:underline">
            /invitation/{invitation.slug} <ExternalLink className="size-3.5" />
          </Link>
        </div>

        <div className="rounded-md border border-ink/10 bg-white p-6">
          <p className="text-xs uppercase tracking-wide text-ink-soft/70">Views</p>
          <p className="mt-1 font-display text-2xl text-ink">{formatNumber(invitation.views)}</p>

          <p className="mt-4 text-xs uppercase tracking-wide text-ink-soft/70">Created</p>
          <p className="mt-1 text-sm text-ink">{formatDate(invitation.createdAt.slice(0, 10))}</p>

          <p className="mt-4 text-xs uppercase tracking-wide text-ink-soft/70">Last Updated</p>
          <p className="mt-1 text-sm text-ink">{formatDate(invitation.updatedAt.slice(0, 10))}</p>

          <Link to={`/dashboard/events/${invitation.id}/guests`} className="mt-6 inline-block">
            <Button variant="outline" size="sm" icon={<Users className="size-4" />}>View Guests</Button>
          </Link>
        </div>
      </div>

      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} slug={invitation.slug} />
    </div>
  )
}
