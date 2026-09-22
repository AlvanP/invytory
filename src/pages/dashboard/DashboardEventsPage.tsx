import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Users, Share2, Settings, ScrollText } from 'lucide-react'
import type { WeddingInvitation, InvitationTemplate, Wedding } from '@/types'
import { ceremonyDisplayName } from '@/types'
import { invitationService } from '@/services/invitationService'
import { weddingService } from '@/services/weddingService'
import { templateService } from '@/services/templateService'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, formatNumber } from '@/utils/format'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/State'
import { DashboardCardSkeleton } from '@/components/ui/Skeleton'
import { ShareModal } from '@/components/dashboard/ShareModal'

interface WeddingWithCeremonies {
  wedding: Wedding
  ceremonies: WeddingInvitation[]
}

export function DashboardEventsPage() {
  const { user } = useAuth()
  const [weddings, setWeddings] = useState<WeddingWithCeremonies[] | null>(null)
  const [legacyInvitations, setLegacyInvitations] = useState<WeddingInvitation[] | null>(null)
  const [templates, setTemplates] = useState<Record<string, InvitationTemplate>>({})
  const [shareSlug, setShareSlug] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    templateService.list().then((list) => {
      setTemplates(Object.fromEntries(list.map((t) => [t.id, t])))
    })

    invitationService.listLegacyByOwner(user.id).then(setLegacyInvitations)

    weddingService.listByOwner(user.id).then(async (list) => {
      const withCeremonies = await Promise.all(
        list.map(async (wedding) => {
          const result = await weddingService.getBySlugWithCeremonies(wedding.slug)
          return { wedding, ceremonies: result?.ceremonies ?? [] }
        })
      )
      setWeddings(withCeremonies)
    })
  }, [user])

  const loading = weddings === null || legacyInvitations === null
  const isEmpty = !loading && weddings!.length === 0 && legacyInvitations!.length === 0

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
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => <DashboardCardSkeleton key={i} />)
        ) : isEmpty ? (
          <EmptyState
            title="No invitations yet"
            description="Create your first wedding invitation to see it here."
            action={<Link to="/create"><Button size="sm">Create Invitation</Button></Link>}
          />
        ) : (
          <>
            {weddings!.map(({ wedding, ceremonies }) => {
              const first = ceremonies[0]
              const template = first ? templates[first.templateId] : undefined
              return (
                <div key={wedding.id} className="flex flex-col gap-4 rounded-md border border-ink/10 bg-white p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-display text-xl text-ink">
                          {first ? `${first.brideName} & ${first.groomName}` : 'Untitled Wedding'}
                        </h3>
                        <Badge tone={wedding.status === 'published' ? 'confirmed' : 'draft'}>{wedding.status}</Badge>
                        {wedding.plan && <Badge tone="premium">{wedding.plan === 'gold' ? 'Gold' : 'Silver'}</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-ink-soft">
                        {template?.name ?? 'Template'} &middot; {ceremonies.length} {ceremonies.length === 1 ? 'ceremony' : 'ceremonies'}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-6 text-xs text-ink-soft/70">
                        <span>{formatNumber(wedding.views)} views</span>
                        <span>Created {formatDate(wedding.createdAt.slice(0, 10))}</span>
                        {wedding.expiresAt && <span>Hosted until {formatDate(wedding.expiresAt.slice(0, 10))}</span>}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link to={`/invitation/${wedding.slug}`}>
                        <Button variant="outline" size="sm" icon={<Eye className="size-4" />}>View</Button>
                      </Link>
                      <Button variant="outline" size="sm" icon={<Share2 className="size-4" />} onClick={() => setShareSlug(wedding.slug)}>
                        Share
                      </Button>
                    </div>
                  </div>

                  {ceremonies.length > 0 && (
                    <div className="flex flex-col gap-2 border-t border-ink/10 pt-4">
                      {ceremonies.map((c) => (
                        <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                          <span className="text-ink-soft">
                            {ceremonyDisplayName(c)} &middot; {formatDate(c.weddingDate)}
                          </span>
                          <Link to={`/dashboard/events/${c.id}/guests`}>
                            <Button variant="ghost" size="sm" icon={<Users className="size-3.5" />}>Guests</Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {legacyInvitations!.map((inv) => {
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
            })}
          </>
        )}
      </div>

      {shareSlug && <ShareModal isOpen={!!shareSlug} onClose={() => setShareSlug(null)} slug={shareSlug} />}
    </div>
  )
}