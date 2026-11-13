import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Camera } from 'lucide-react'
import type { WeddingInvitation, InvitationTemplate, Wedding } from '@/types'
import { invitationService } from '@/services/invitationService'
import { weddingService } from '@/services/weddingService'
import { templateService } from '@/services/templateService'
import { getTemplateById } from '@/data/templates'
import { InvitationRenderer } from '@/components/invitation/InvitationRenderer'
import { CeremonySelector } from '@/components/invitation/CeremonySelector'
import { MusicToggle } from '@/components/invitation/MusicToggle'
import { useInvitationMusic } from '@/hooks/useInvitationMusic'
import { inviteeService, INVITE_PARAM } from '@/services/inviteeService'
import { AlbumContext } from '@/templates/AlbumContext'
import { albumHasOpened, earliestEventDate } from '@/utils/albumDate'
import { InviteeContext, type Invitee } from '@/templates/InviteeContext'
import { ArrivalScene } from '@/components/entrance/ArrivalScene'
import { InvitationPreviewSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/State'
import { Button } from '@/components/ui/Button'

type LookupState =
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'wedding'; wedding: Wedding; ceremonies: WeddingInvitation[] }
  | { status: 'legacy'; invitation: WeddingInvitation }

export function InvitationPreviewPage() {
  const { slug } = useParams<{ slug: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const [lookup, setLookup] = useState<LookupState>({ status: 'loading' })
  const [template, setTemplate] = useState<InvitationTemplate | undefined>()
  // A personal link looks like /invitation/<slug>?to=<code>. The code is read once, so the name
  // stays even after the guest opens a ceremony (which changes the address).
  const [searchParams] = useSearchParams()
  const [code] = useState(() => (searchParams.get(INVITE_PARAM) ?? '').trim().slice(0, 20))
  const [invitee, setInvitee] = useState<Invitee | null>(null)
  const [inviteeChecked, setInviteeChecked] = useState(!code)

  useEffect(() => {
    if (!slug) return
    let cancelled = false

    async function load() {
      const weddingResult = await weddingService.getBySlugWithCeremonies(slug!)
      if (cancelled) return

      if (weddingResult) {
        setLookup({ status: 'wedding', wedding: weddingResult.wedding, ceremonies: weddingResult.ceremonies })
        return
      }

      const legacy = await invitationService.getBySlug(slug!)
      if (cancelled) return
      setLookup(legacy ? { status: 'legacy', invitation: legacy } : { status: 'notFound' })
    }

    load()
    return () => {
      cancelled = true
    }
  }, [slug])

  // Look up whose link this is, as soon as we know which wedding the page is for.
  const weddingId = lookup.status === 'wedding' ? lookup.wedding.id : undefined
  useEffect(() => {
    if (!code || lookup.status === 'loading') return
    if (!weddingId) {
      setInviteeChecked(true)
      return
    }
    let cancelled = false
    inviteeService.lookup(code).then((found) => {
      if (cancelled) return
      // A link only counts for the event it was made for.
      if (found && found.weddingId === weddingId) {
        setInvitee({ name: found.name, code })
        try {
          if (!sessionStorage.getItem(`invytory:opened:${code}`)) {
            sessionStorage.setItem(`invytory:opened:${code}`, '1')
            void inviteeService.trackOpen(code)
          }
        } catch {
          void inviteeService.trackOpen(code)
        }
      }
      setInviteeChecked(true)
    })
    return () => {
      cancelled = true
    }
  }, [code, lookup.status, weddingId])

  // Which ceremony is open is kept in the URL hash (#<ceremony id>), not in
  // component state. That makes the phone's Back button return a guest to
  // the ceremony list, and lets a specific ceremony be linked to directly.
  // A wedding with a single ceremony skips the list entirely.
  const selectedCeremony: WeddingInvitation | null =
    lookup.status !== 'wedding'
      ? null
      : lookup.ceremonies.length === 1
        ? lookup.ceremonies[0]
        : (lookup.ceremonies.find((c) => c.id === location.hash.slice(1)) ?? null)

  // Always start a newly opened ceremony (or the list) at the top.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.hash])

  useEffect(() => {
    // Before a ceremony is chosen (or there's only one), use the first
    // ceremony's template for the entrance's look. Once a ceremony is
    // selected, switch to THAT ceremony's own template — each ceremony
    // can have a completely different design.
    const templateId =
      lookup.status === 'legacy' ? lookup.invitation.templateId
      : lookup.status === 'wedding' ? (selectedCeremony?.templateId ?? lookup.ceremonies[0]?.templateId)
      : undefined
    if (templateId) templateService.getById(templateId).then(setTemplate)
  }, [lookup, selectedCeremony])

  // Which track should be playing right now. On the ceremony list it is the
  // first ceremony's; once a ceremony is open it is that ceremony's own, and
  // silence if that ceremony has none. (Must run before any early return.)
  const wantedMusicUrl =
    lookup.status === 'legacy'
      ? (lookup.invitation.musicUrl ?? null)
      : lookup.status === 'wedding'
        ? selectedCeremony
          ? (selectedCeremony.musicUrl ?? null)
          : (lookup.ceremonies[0]?.musicUrl ?? null)
        : null
  const music = useInvitationMusic(wantedMusicUrl)

  if (lookup.status === 'loading' || !inviteeChecked) return <InvitationPreviewSkeleton />

  if (lookup.status === 'notFound') {
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

  const expiresAt = lookup.status === 'wedding' ? lookup.wedding.expiresAt : lookup.invitation.expiresAt
  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false
  const currentStatus = lookup.status === 'wedding' ? lookup.wedding.status : lookup.invitation.status
  const isSuspended = currentStatus === 'archived'
  const isDraft = currentStatus === 'draft'

  if (isDraft) {
    return (
      <div className="mx-auto max-w-md px-6 py-24">
        <ErrorState
          title="This invitation is not published yet."
          description="Please check back soon, or ask the host for an updated link."
        />
      </div>
    )
  }

  if (isSuspended) {
    return (
      <div className="mx-auto max-w-md px-6 py-24">
        <ErrorState
          title="This invitation is not available right now."
          description="Please reach out to the host directly for details."
        />
      </div>
    )
  }

  if (isExpired) {
    return (
      <div className="mx-auto max-w-md px-6 py-24">
        <ErrorState
          title="This invitation is no longer available."
          description="Its hosting period has ended. Please reach out to the couple directly for details."
        />
      </div>
    )
  }

  const brideName = lookup.status === 'wedding' ? lookup.ceremonies[0]?.brideName : lookup.invitation.brideName
  const groomName = lookup.status === 'wedding' ? lookup.ceremonies[0]?.groomName : lookup.invitation.groomName
  // Worked out straight from the invitation (no waiting), so the right entrance shows from the very first frame.
  const entranceTemplateId =
    lookup.status === 'legacy' ? lookup.invitation.templateId : (selectedCeremony?.templateId ?? lookup.ceremonies[0]?.templateId)
  const entranceTemplate = getTemplateById(entranceTemplateId)
  const activeInvitation = selectedCeremony ?? (lookup.status === 'legacy' ? lookup.invitation : null)
  const hasCeremonyList = lookup.status === 'wedding' && lookup.ceremonies.length > 1

  // The guest album is part of the Signature plan: open while the invitation is live.
  const albumOpen = lookup.status === 'wedding' && lookup.wedding.status === 'published' && lookup.wedding.plan === 'gold'
  // The album opens on the first day of the event; before that the section shows but explains.
  const albumOpensOn = lookup.status === 'wedding' ? earliestEventDate(lookup.ceremonies.map((c) => c.weddingDate)) : null
  const albumValue = albumOpen ? { path: `/album/${lookup.wedding.slug}`, opensOn: albumOpensOn } : null
  // From the day of the event, a small button stays on screen so guests can add photos at any moment.
  const eventStarted = albumHasOpened(albumOpensOn)

  return (
    <InviteeContext.Provider value={invitee}>
    <AlbumContext.Provider value={albumValue}>
    <ArrivalScene
      tone={entranceTemplate?.previewTone ?? 'classic'}
      templateId={entranceTemplate?.id}
      brideName={brideName ?? ''}
      groomName={groomName ?? ''}
      onTap={music.start}
      inviteeName={invitee?.name}
    >
      {hasCeremonyList && !selectedCeremony ? (
        <CeremonySelector
          brideName={brideName ?? ''}
          groomName={groomName ?? ''}
          ceremonies={lookup.ceremonies}
          onSelect={(ceremony) => navigate({ hash: ceremony.id })}
        />
      ) : (
        activeInvitation && (
          <>
            {hasCeremonyList && (
              <button
                type="button"
                onClick={() => navigate({ hash: '' })}
                className="fixed left-4 top-4 z-40 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-xs text-ink shadow-lift backdrop-blur transition-colors hover:bg-white"
              >
                <ArrowLeft className="size-3.5" />
                All ceremonies
              </button>
            )}
            {/* Keyed by id so each ceremony starts fresh (e.g. its own RSVP
                form), rather than inheriting the previous ceremony's state. */}
            <InvitationRenderer key={activeInvitation.id} invitation={activeInvitation} template={template} />
          </>
        )
      )}
    </ArrivalScene>
    {music.visible && <MusicToggle muted={music.muted} needsTap={music.needsTap} onToggle={music.toggle} />}
    {albumValue && eventStarted && activeInvitation && (
      <Link
        to={albumValue.path}
        className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-xs font-medium text-ink shadow-lift backdrop-blur transition-colors hover:bg-white"
      >
        <Camera className="size-4" /> Add photos
      </Link>
    )}
    </AlbumContext.Provider>
    </InviteeContext.Provider>
  )
}
