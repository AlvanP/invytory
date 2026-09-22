import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { WeddingInvitation, InvitationTemplate, Wedding } from '@/types'
import { invitationService } from '@/services/invitationService'
import { weddingService } from '@/services/weddingService'
import { templateService } from '@/services/templateService'
import { InvitationRenderer } from '@/components/invitation/InvitationRenderer'
import { CeremonySelector } from '@/components/invitation/CeremonySelector'
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
  const [lookup, setLookup] = useState<LookupState>({ status: 'loading' })
  const [selectedCeremony, setSelectedCeremony] = useState<WeddingInvitation | null>(null)
  const [template, setTemplate] = useState<InvitationTemplate | undefined>()

  useEffect(() => {
    if (!slug) return
    let cancelled = false

    async function load() {
      const weddingResult = await weddingService.getBySlugWithCeremonies(slug!)
      if (cancelled) return

      if (weddingResult) {
        setLookup({ status: 'wedding', wedding: weddingResult.wedding, ceremonies: weddingResult.ceremonies })
        if (weddingResult.ceremonies.length === 1) setSelectedCeremony(weddingResult.ceremonies[0])
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

  useEffect(() => {
    const templateId =
      lookup.status === 'legacy' ? lookup.invitation.templateId
      : lookup.status === 'wedding' ? lookup.ceremonies[0]?.templateId
      : undefined
    if (templateId) templateService.getById(templateId).then(setTemplate)
  }, [lookup])

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

  return (
    <ArrivalScene tone={template?.previewTone ?? 'classic'} brideName={brideName ?? ''} groomName={groomName ?? ''}>
      {lookup.status === 'wedding' && lookup.ceremonies.length > 1 && !selectedCeremony ? (
        <CeremonySelector
          brideName={brideName ?? ''}
          groomName={groomName ?? ''}
          ceremonies={lookup.ceremonies}
          onSelect={setSelectedCeremony}
        />
      ) : (
        activeInvitation && <InvitationRenderer invitation={activeInvitation} template={template} />
      )}
    </ArrivalScene>
  )
}