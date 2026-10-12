import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { CeremonyDraft, GalleryImageSlot, WeddingInvitation } from '@/types'
import { ceremonyDisplayName, emptyGallery } from '@/types'
import { invitationService } from '@/services/invitationService'
import { storageService } from '@/services/storageService'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { ErrorState } from '@/components/ui/State'
import { InvitationPreviewSkeleton } from '@/components/ui/Skeleton'
import { MusicPicker } from '@/components/wizard/MusicPicker'
import { UploadSlot, uploadErrorMessage } from '@/components/wizard/UploadSlot'

const gallerySlotIds = ['g1', 'g2', 'g3', 'g4']

/** The part of a ceremony an owner can change after publishing. */
interface Editable {
  heroImage: string | null
  gallery: GalleryImageSlot[]
  rsvpMessage: string
  musicSource: CeremonyDraft['musicSource']
  musicUrl: string | null
  musicTitle: string | null
}

function toEditable(inv: WeddingInvitation): Editable {
  const base = emptyGallery()
  const gallery = base.map((slot) => inv.galleryImages?.find((g) => g.id === slot.id) ?? slot)
  return {
    heroImage: inv.heroImage ?? null,
    gallery,
    rsvpMessage: inv.customRsvpMessage ?? '',
    musicSource: inv.musicSource ?? null,
    musicUrl: inv.musicUrl ?? null,
    musicTitle: inv.musicTitle ?? null,
  }
}

export function DashboardEditCeremonyPage() {
  const { ceremonyId } = useParams<{ ceremonyId: string }>()
  const [invitation, setInvitation] = useState<WeddingInvitation | null | undefined>(undefined)
  const [edit, setEdit] = useState<Editable | null>(null)
  const [saved, setSaved] = useState<Editable | null>(null)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    if (!ceremonyId) return
    let cancelled = false
    invitationService
      .getById(ceremonyId)
      .then((found) => {
        if (cancelled) return
        setInvitation(found ?? null)
        if (found) {
          setEdit(toEditable(found))
          setSaved(toEditable(found))
        }
      })
      .catch(() => {
        if (!cancelled) setInvitation(null)
      })
    return () => {
      cancelled = true
    }
  }, [ceremonyId])

  const dirty = useMemo(() => !!edit && !!saved && JSON.stringify(edit) !== JSON.stringify(saved), [edit, saved])

  // Leaving with unsaved changes asks first (closing the tab or refreshing).
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  if (invitation === undefined) return <InvitationPreviewSkeleton />

  if (invitation === null || !edit) {
    return (
      <ErrorState
        title="Invitation not found"
        description="It may have been removed, or the link may be incorrect."
        action={<Link to="/dashboard/events"><Button size="sm">Back to Invitations</Button></Link>}
      />
    )
  }

  const busy = uploadingKey !== null || saving
  const patch = (p: Partial<Editable>) => {
    setEdit((cur) => (cur ? { ...cur, ...p } : cur))
    setJustSaved(false)
  }

  async function uploadHero(file: File) {
    setUploadingKey('hero')
    setUploadError(null)
    try {
      patch({ heroImage: await storageService.uploadImage(file, 'hero') })
    } catch (err) {
      setUploadError(uploadErrorMessage(err))
    } finally {
      setUploadingKey(null)
    }
  }

  async function uploadGallery(slotId: string, file: File) {
    setUploadingKey(slotId)
    setUploadError(null)
    try {
      const url = await storageService.uploadImage(file, 'gallery')
      setEdit((cur) =>
        cur ? { ...cur, gallery: cur.gallery.map((s) => (s.id === slotId ? { ...s, url } : s)) } : cur
      )
      setJustSaved(false)
    } catch (err) {
      setUploadError(uploadErrorMessage(err))
    } finally {
      setUploadingKey(null)
    }
  }

  async function save() {
    if (!edit || !invitation) return
    setSaving(true)
    setSaveError(null)
    try {
      await invitationService.updateMedia(invitation.id, {
        heroImage: edit.heroImage,
        galleryImages: edit.gallery,
        customRsvpMessage: edit.rsvpMessage,
        musicSource: edit.musicSource ?? null,
        musicUrl: edit.musicUrl,
        musicTitle: edit.musicTitle,
      })
      setSaved(edit)
      setJustSaved(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save your changes.')
    } finally {
      setSaving(false)
    }
  }

  // MusicPicker works on the wizard's ceremony shape, so give it that.
  const pickerCeremony: CeremonyDraft = {
    id: invitation.id,
    ceremonyType: invitation.ceremonyType ?? 'white',
    ceremonyLabel: invitation.ceremonyLabel,
    musicSource: edit.musicSource,
    musicUrl: edit.musicUrl,
    musicTitle: edit.musicTitle,
  }

  const name = ceremonyDisplayName(invitation)
  const viewPath = invitation.weddingId ? undefined : `/invitation/${invitation.slug}`

  return (
    <div>
      <Link to="/dashboard/events" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" /> Back to your events
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.2em] text-gold">Edit</p>
          <h1 className="mt-2 font-display text-3xl text-ink">
            {invitation.brideName} &amp; {invitation.groomName}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">{name}</p>
        </div>
        <div className="flex items-center gap-3">
          {viewPath && (
            <Link to={viewPath} className="text-sm text-ink-soft underline underline-offset-2 hover:text-ink">
              View invitation
            </Link>
          )}
          <Button onClick={save} disabled={!dirty || busy} isLoading={saving}>
            Save changes
          </Button>
        </div>
      </div>

      <p className="mt-4 text-xs text-ink-soft/70">
        Photos, music and the RSVP message can be changed any time. Guests see the new version as soon as you save.
        Names, dates and venue are not editable here yet.
      </p>

      {justSaved && !dirty && (
        <p role="status" className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Saved. Your invitation is updated.
        </p>
      )}
      {saveError && <p role="alert" className="mt-4 text-sm text-danger">{saveError}</p>}
      {dirty && !saving && <p className="mt-4 text-xs text-gold">You have unsaved changes.</p>}

      <div className="mt-8 flex flex-col gap-10">
        {uploadError && <p className="text-sm text-danger">{uploadError}</p>}

        <div>
          <p className="mb-2 text-sm font-medium text-ink-soft">Hero image</p>
          <UploadSlot
            label="Hero image"
            url={edit.heroImage}
            isUploading={uploadingKey === 'hero'}
            disabled={busy}
            onSelect={uploadHero}
            onRemove={() => patch({ heroImage: null })}
            className="aspect-video w-full max-w-2xl"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-ink-soft">Gallery photos</p>
          <div className="grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {gallerySlotIds.map((slotId, i) => {
              const slot = edit.gallery.find((s) => s.id === slotId)
              return (
                <UploadSlot
                  key={slotId}
                  label={`Gallery image ${i + 1}`}
                  url={slot?.url ?? null}
                  isUploading={uploadingKey === slotId}
                  disabled={busy}
                  onSelect={(file) => uploadGallery(slotId, file)}
                  onRemove={() => {
                    setEdit((cur) =>
                      cur ? { ...cur, gallery: cur.gallery.map((s) => (s.id === slotId ? { ...s, url: null } : s)) } : cur
                    )
                    setJustSaved(false)
                  }}
                  className="aspect-square"
                />
              )
            })}
          </div>
        </div>

        <div className="max-w-2xl border-t border-ink/10 pt-8">
          <Textarea
            label="RSVP message"
            optional
            rows={3}
            value={edit.rsvpMessage}
            onChange={(e) => patch({ rsvpMessage: e.target.value })}
            placeholder="Kindly respond by..."
          />
        </div>

        <div className="max-w-2xl border-t border-ink/10 pt-8">
          <MusicPicker
            ceremony={pickerCeremony}
            onChange={(p) =>
              patch({
                ...(p.musicSource !== undefined ? { musicSource: p.musicSource } : {}),
                ...(p.musicUrl !== undefined ? { musicUrl: p.musicUrl } : {}),
                ...(p.musicTitle !== undefined ? { musicTitle: p.musicTitle } : {}),
              })
            }
          />
        </div>

        <div className="pb-6">
          <Button onClick={save} disabled={!dirty || busy} isLoading={saving}>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  )
}