import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { WeddingInvitation, InvitationTemplate, Wedding } from '@/types'
import { invitationService } from '@/services/invitationService'
import { weddingService } from '@/services/weddingService'
import { templateService } from '@/services/templateService'
import { InvitationRenderer } from '@/components/invitation/InvitationRenderer'
import { CeremonySelector } from '@/components/invitation/CeremonySelector'
import { MusicToggle } from '@/components/invitation/MusicToggle'
import { useInvitationMusic } from '@/hooks/useInvitationMusic'
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

  if (lookup.status === 'loading') return <InvitationPreviewSkeleton />

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
  const activeInvitation = selectedCeremony ?? (lookup.status === 'legacy' ? lookup.invitation : null)
  const hasCeremonyList = lookup.status === 'wedding' && lookup.ceremonies.length > 1

  return (
    <>
    <ArrivalScene
      tone={template?.previewTone ?? 'classic'}
      brideName={brideName ?? ''}
      groomName={groomName ?? ''}
      onTap={music.start}
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
    </>
  )
}
