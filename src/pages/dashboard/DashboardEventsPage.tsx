import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Users, Share2, Settings, ScrollText } from 'lucide-react'
import type { WeddingInvitation, InvitationTemplate } from '@/types'
import { invitationService } from '@/services/invitationService'
import { templateService } from '@/services/templateService'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, formatNumber } from '@/utils/format'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/State'
import { DashboardCardSkeleton } from '@/components/ui/Skeleton'
import { ShareModal } from '@/components/dashboard/ShareModal'

export function DashboardEventsPage() {
  const { user } = useAuth()
  const [invitations, setInvitations] = useState<WeddingInvitation[] | null>(null)
  const [templates, setTemplates] = useState<Record<string, InvitationTemplate>>({})
  const [shareSlug, setShareSlug] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    invitationService.list(user.id).then(setInvitations)
    templateService.list().then((list) => {
      setTemplates(Object.fromEntries(list.map((t) => [t.id, t])))
    })
  }, [user])

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs tracking-[0.2em] text-gold">My Invitations</p>
          <h1 className="mt-2 font-display text-3xl text-ink">Your Events</h1>
        </div>
        <Link to="/create">
          <Button size="sm">Create Invitation</Button>
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {!invitations ? (
          Array.from({ length: 2 }).map((_, i) => <DashboardCardSkeleton key={i} />)
        ) : invitations.length === 0 ? (
          <EmptyState
            title="No invitations yet"
            description="Create your first wedding invitation to see it here."
            action={<Link to="/create"><Button size="sm">Create Invitation</Button></Link>}
          />
        ) : (
          invitations.map((inv) => {
            const template = templates[inv.templateId]
            return (
              <div key={inv.id} className="flex flex-col gap-4 rounded-md border border-ink/10 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-xl text-ink">{inv.brideName} &amp; {inv.groomName}</h3>
                    <Badge tone={inv.status === 'published' ? 'confirmed' : 'draft'}>{inv.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">
                    {template?.name ?? 'Template'} &middot; {formatDate(inv.weddingDate)}
                  </p>
                  <div className="mt-3 flex gap-6 text-xs text-ink-soft/70">
                    <span>{formatNumber(inv.views)} views</span>
                    <span>Created {formatDate(inv.createdAt.slice(0, 10))}</span>
                    <span>Updated {formatDate(inv.updatedAt.slice(0, 10))}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link to={`/invitation/${inv.slug}`}>
                    <Button variant="outline" size="sm" icon={<Eye className="size-4" />}>View</Button>
                  </Link>
                  <Link to={`/dashboard/events/${inv.id}`}>
                    <Button variant="outline" size="sm" icon={<ScrollText className="size-4" />}>Manage</Button>
                  </Link>
                  <Link to={`/dashboard/events/${inv.id}/guests`}>
                    <Button variant="outline" size="sm" icon={<Users className="size-4" />}>Guests</Button>
                  </Link>
                  <Button variant="outline" size="sm" icon={<Share2 className="size-4" />} onClick={() => setShareSlug(inv.slug)}>
                    Share
                  </Button>
                  <Link to={`/dashboard/events/${inv.id}/settings`}>
                    <Button variant="ghost" size="sm" icon={<Settings className="size-4" />}>Settings</Button>
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>

      {shareSlug && <ShareModal isOpen={!!shareSlug} onClose={() => setShareSlug(null)} slug={shareSlug} />}
    </div>
  )
}