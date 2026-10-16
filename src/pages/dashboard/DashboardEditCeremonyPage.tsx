import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { CeremonyDraft, GalleryImageSlot, WeddingInvitation } from '@/types'
import { ceremonyDisplayName, emptyGallery, setGallerySlot, FEATURE_SLOT_ID } from '@/types'
import { invitationService } from '@/services/invitationService'
import { storageService } from '@/services/storageService'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { formatDate } from '@/utils/format'
import type { CeremonyDetailsUpdate, CoupleDetailsUpdate } from '@/services/supabaseInvitationService'
import { ErrorState } from '@/components/ui/State'
import { InvitationPreviewSkeleton } from '@/components/ui/Skeleton'
import { MusicPicker } from '@/components/wizard/MusicPicker'
import { DressCodeField } from '@/components/wizard/DressCodeField'
import { parseColours, joinColours } from '@/utils/colorTheme'
import { UploadSlot, uploadErrorMessage } from '@/components/wizard/UploadSlot'

const gallerySlotIds = ['g1', 'g2', 'g3', 'g4']

/** The part of a ceremony an owner can change after publishing. */
interface Editable {
  themeColor: string | null
  details: CeremonyDetailsUpdate
  couple: CoupleDetailsUpdate
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
    themeColor: inv.themeColor ?? null,
    details: {
      weddingDate: inv.weddingDate ?? '',
      weddingTime: inv.weddingTime ?? '',
      venueName: inv.venueName ?? '',
      venueAddress: inv.venueAddress ?? '',
      city: inv.city ?? '',
      state: inv.state ?? '',
      dressCode: inv.dressCode ?? '',
      receptionInfo: inv.receptionInfo ?? '',
    },
    couple: {
      brideName: inv.brideName ?? '',
      groomName: inv.groomName ?? '',
      tagline: inv.tagline ?? '',
      loveStory: inv.loveStory ?? '',
      howWeMet: inv.howWeMet ?? '',
      vows: inv.vows ?? '',
      weddingHashtag: inv.weddingHashtag ?? '',
      giftInformation: inv.giftInformation ?? '',
      additionalMessage: inv.additionalMessage ?? '',
    },
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
  const [expiresAt, setExpiresAt] = useState<string | null>(null)

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
          if (found.weddingId) {
            invitationService.getWeddingExpiry(found.weddingId).then((e) => {
              if (!cancelled) setExpiresAt(e)
            })
          } else {
            setExpiresAt(found.expiresAt ?? null)
          }
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
      setEdit((cur) => (cur ? { ...cur, gallery: setGallerySlot(cur.gallery, slotId, url) } : cur))
      setJustSaved(false)
    } catch (err) {
      setUploadError(uploadErrorMessage(err))
    } finally {
      setUploadingKey(null)
    }
  }

  async function save() {
    if (!edit || !saved || !invitation) return
    const { details, couple } = edit
    if (!couple.brideName.trim() || !couple.groomName.trim()) {
      setSaveError("Both names are needed.")
      return
    }
    if (!details.weddingDate || !details.venueName.trim()) {
      setSaveError('The date and venue name are needed.')
      return
    }
    setSaving(true)
    setSaveError(null)
    const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
    // Each part saves on its own, and the saved copy moves forward as each one
    // succeeds, so a failure never loses (or repeats) the parts that went through.
    let done: Editable = saved
    try {
      if (!same(edit.details, saved.details)) {
        await invitationService.updateCeremonyDetails(invitation.id, edit.details)
        done = { ...done, details: edit.details }
        setSaved(done)
      }
      if (edit.themeColor !== saved.themeColor) {
        await invitationService.updateThemeColor(invitation.id, edit.themeColor)
        done = { ...done, themeColor: edit.themeColor }
        setSaved(done)
      }
      if (!same(edit.couple, saved.couple)) {
        await invitationService.updateCoupleDetails(invitation.id, invitation.weddingId, edit.couple)
        done = { ...done, couple: edit.couple }
        setSaved(done)
      }
      const mediaChanged =
        !same(edit.heroImage, saved.heroImage) ||
        !same(edit.gallery, saved.gallery) ||
        edit.rsvpMessage !== saved.rsvpMessage ||
        edit.musicUrl !== saved.musicUrl ||
        edit.musicTitle !== saved.musicTitle ||
        edit.musicSource !== saved.musicSource
      if (mediaChanged) {
        await invitationService.updateMedia(invitation.id, {
          heroImage: edit.heroImage,
          galleryImages: edit.gallery,
          customRsvpMessage: edit.rsvpMessage,
          musicSource: edit.musicSource ?? null,
          musicUrl: edit.musicUrl,
          musicTitle: edit.musicTitle,
        })
        done = edit
        setSaved(done)
      }
      setJustSaved(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save your changes.')
    } finally {
      setSaving(false)
    }
  }

  const setDetails = (p: Partial<CeremonyDetailsUpdate>) => patch({ details: { ...edit.details, ...p } })
  const setCouple = (p: Partial<CoupleDetailsUpdate>) => patch({ couple: { ...edit.couple, ...p } })
  const dateAfterHosting =
    !!expiresAt && !!edit.details.weddingDate && edit.details.weddingDate > expiresAt.slice(0, 10)

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
            {saved?.couple.brideName ?? invitation.brideName} &amp; {saved?.couple.groomName ?? invitation.groomName}
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
        Everything here can be changed any time, and guests see the new version as soon as you save. The invitation
        link never changes, so links you have already sent keep working.
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

        <section className="flex max-w-2xl flex-col gap-4">
          <div>
            <p className="text-sm font-medium text-ink">Details for this ceremony ({name})</p>
            <p className="mt-1 text-xs text-ink-soft/70">Only changes this ceremony&rsquo;s invitation.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Date" type="date" required value={edit.details.weddingDate} onChange={(e) => setDetails({ weddingDate: e.target.value })} />
            <Input label="Time" type="time" optional value={edit.details.weddingTime} onChange={(e) => setDetails({ weddingTime: e.target.value })} />
            <Input label="Venue name" required className="sm:col-span-2" value={edit.details.venueName} onChange={(e) => setDetails({ venueName: e.target.value })} />
            <Input label="Venue address" optional className="sm:col-span-2" value={edit.details.venueAddress} onChange={(e) => setDetails({ venueAddress: e.target.value })} />
            <Input label="City" optional value={edit.details.city} onChange={(e) => setDetails({ city: e.target.value })} />
            <Input label="State" optional value={edit.details.state} onChange={(e) => setDetails({ state: e.target.value })} />
            <Input label="Reception info" optional value={edit.details.receptionInfo} onChange={(e) => setDetails({ receptionInfo: e.target.value })} />
            <DressCodeField
              dressCode={edit.details.dressCode}
              colours={parseColours(edit.themeColor)}
              onChange={(c) => {
                if (c.dressCode !== undefined) setDetails({ dressCode: c.dressCode })
                if (c.colours !== undefined) patch({ themeColor: joinColours(c.colours) })
              }}
            />
          </div>
          {expiresAt && (
            <p className={dateAfterHosting ? 'text-xs text-danger' : 'text-xs text-ink-soft/70'}>
              {dateAfterHosting
                ? `This date is after your hosting ends (${formatDate(expiresAt.slice(0, 10))}). Moving a date does not extend hosting, so the invitation would go offline before the ceremony.`
                : `Your invitation is hosted until ${formatDate(expiresAt.slice(0, 10))}. Moving a date does not change this.`}
            </p>
          )}
        </section>

        <section className="flex max-w-2xl flex-col gap-4 border-t border-ink/10 pt-8">
          <div>
            <p className="text-sm font-medium text-ink">About the couple</p>
            <p className="mt-1 text-xs text-ink-soft/70">
              {invitation.weddingId
                ? 'Shared by every ceremony of this wedding, so saving updates all of them.'
                : 'Shown on your invitation.'}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Bride's name" required value={edit.couple.brideName} onChange={(e) => setCouple({ brideName: e.target.value })} />
            <Input label="Groom's name" required value={edit.couple.groomName} onChange={(e) => setCouple({ groomName: e.target.value })} />
            <Input label="Short phrase" optional className="sm:col-span-2" value={edit.couple.tagline} onChange={(e) => setCouple({ tagline: e.target.value })} />
          </div>
          <Textarea label="Our story" optional value={edit.couple.loveStory} onChange={(e) => setCouple({ loveStory: e.target.value })} />
          <Textarea label="How we met" optional value={edit.couple.howWeMet} onChange={(e) => setCouple({ howWeMet: e.target.value })} />
          <Textarea label="Vows" optional value={edit.couple.vows} onChange={(e) => setCouple({ vows: e.target.value })} />
          <Input label="Wedding hashtag" optional value={edit.couple.weddingHashtag} onChange={(e) => setCouple({ weddingHashtag: e.target.value })} />
          <Textarea label="Gift information" optional value={edit.couple.giftInformation} onChange={(e) => setCouple({ giftInformation: e.target.value })} />
          <Textarea label="Additional message" optional value={edit.couple.additionalMessage} onChange={(e) => setCouple({ additionalMessage: e.target.value })} />
        </section>

        <p className="-mb-4 max-w-2xl border-t border-ink/10 pt-8 text-sm font-medium text-ink">
          Photos, RSVP message and music (this ceremony)
        </p>

        <div>
          <p className="text-sm font-medium text-ink-soft">Hero image</p>
          <p className="mb-2 text-xs text-ink-soft/70">The big photo at the top, with the names written over it.</p>
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
          <p className="text-sm font-medium text-ink-soft">Floating photo</p>
          <p className="mb-2 text-xs text-ink-soft/70">Appears in the middle of the invitation in a light frame that tilts as guests scroll.</p>
          <UploadSlot
            label="Floating photo"
            url={edit.gallery.find((s) => s.id === FEATURE_SLOT_ID)?.url ?? null}
            isUploading={uploadingKey === FEATURE_SLOT_ID}
            disabled={busy}
            onSelect={(file) => uploadGallery(FEATURE_SLOT_ID, file)}
            onRemove={() => {
              setEdit((cur) => (cur ? { ...cur, gallery: setGallerySlot(cur.gallery, FEATURE_SLOT_ID, null) } : cur))
              setJustSaved(false)
            }}
            className="aspect-[4/5] w-40"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-ink-soft">Slider photos (up to 4)</p>
          <p className="mb-2 text-xs text-ink-soft/70">Guests swipe through these to the left. With the hero and floating photo, that makes 6 photos in all.</p>
          <div className="grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {gallerySlotIds.map((slotId, i) => {
              const slot = edit.gallery.find((s) => s.id === slotId)
              return (
                <UploadSlot
                  key={slotId}
                  label={`Slider photo ${i + 1}`}
                  url={slot?.url ?? null}
                  isUploading={uploadingKey === slotId}
                  disabled={busy}
                  onSelect={(file) => uploadGallery(slotId, file)}
                  onRemove={() => {
                    setEdit((cur) => (cur ? { ...cur, gallery: setGallerySlot(cur.gallery, slotId, null) } : cur))
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
