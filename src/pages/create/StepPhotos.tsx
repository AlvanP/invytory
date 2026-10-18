import { useState } from 'react'
import { useWizard, useReportUploading } from '@/hooks/useWizard'
import { storageService } from '@/services/storageService'
import type { CeremonyDraft } from '@/types'
import { ceremonyDisplayName, emptyGallery, setGallerySlot, FEATURE_SLOT_ID } from '@/types'
import { CeremonyTabs } from '@/components/wizard/CeremonyTabs'
import { MusicPicker } from '@/components/wizard/MusicPicker'
import { UploadSlot, uploadErrorMessage } from '@/components/wizard/UploadSlot'
import { WizardStepShell } from './WizardStepShell'

const gallerySlotIds = ['g1', 'g2', 'g3', 'g4']

function hasPhotos(c: CeremonyDraft): boolean {
  return !!c.heroImage || (c.galleryImages ?? []).some((s) => !!s.url)
}

export function StepPhotos() {
  const { draft, updateCeremony } = useWizard()
  const [activeId, setActiveId] = useState(draft.ceremonies[0].id)
  // Key is `${ceremonyId}:${slot}` so a spinner only shows on the right tab.
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Ceremonies the couple chose to make without any photos.
  const [noPhotos, setNoPhotos] = useState<Record<string, boolean>>({})

  const active = draft.ceremonies.find((c) => c.id === activeId) ?? draft.ceremonies[0]
  const gallery = active.galleryImages ?? emptyGallery()
  const copySources = draft.ceremonies.filter((c) => c.id !== active.id && hasPhotos(c))
  const busy = uploadingKey !== null
  useReportUploading('photos', busy)
  const skipped = !!noPhotos[active.id]

  function setSkipped(on: boolean) {
    if (on && hasPhotos(active) && !window.confirm('This removes the photos you added for this ceremony. Continue?')) return
    if (on) updateCeremony(active.id, { heroImage: null, galleryImages: emptyGallery() })
    setNoPhotos((cur) => ({ ...cur, [active.id]: on }))
  }

  async function handleHeroUpload(file: File) {
    const ceremonyId = active.id
    setUploadingKey(`${ceremonyId}:hero`)
    setError(null)
    try {
      const url = await storageService.uploadImage(file, 'hero')
      updateCeremony(ceremonyId, { heroImage: url })
    } catch (err) {
      setError(uploadErrorMessage(err))
    } finally {
      setUploadingKey(null)
    }
  }

  async function handleGalleryUpload(slotId: string, file: File) {
    const ceremonyId = active.id
    const current = gallery
    setUploadingKey(`${ceremonyId}:${slotId}`)
    setError(null)
    try {
      const url = await storageService.uploadImage(file, 'gallery')
      updateCeremony(ceremonyId, { galleryImages: setGallerySlot(current, slotId, url) })
    } catch (err) {
      setError(uploadErrorMessage(err))
    } finally {
      setUploadingKey(null)
    }
  }

  function removeHero() {
    updateCeremony(active.id, { heroImage: null })
  }

  function removeGallery(slotId: string) {
    updateCeremony(active.id, {
      galleryImages: setGallerySlot(gallery, slotId, null),
    })
  }

  function copyPhotosFrom(source: CeremonyDraft) {
    updateCeremony(active.id, {
      heroImage: source.heroImage ?? null,
      galleryImages: (source.galleryImages ?? emptyGallery()).map((s) => ({ ...s })),
    })
  }

  return (
    <WizardStepShell
      eyebrow="Step 5 of 7"
      title="Photos & music"
      description="Add photos and, if you like, music for each ceremony. Photos can be JPG or PNG, up to a few MB each."
      backTo="/create/story"
      nextTo="/create/options"
      skippable
    >
      <CeremonyTabs ceremonies={draft.ceremonies} activeId={active.id} onChange={setActiveId} />

      {draft.ceremonies.length > 1 && (
        <p className="text-xs text-ink-soft/70">
          These photos are for the {ceremonyDisplayName(active)} invitation only.
        </p>
      )}

      <label className="flex items-start gap-3 rounded-md border border-ink/10 bg-white p-4 text-sm text-ink">
        <input type="checkbox" checked={skipped} disabled={busy} onChange={(e) => setSkipped(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[color:var(--color-gold)]" />
        <span>
          I don&rsquo;t want any photos on this invitation
          <span className="block text-xs text-ink-soft/70">Your invitation is made without photos and has no empty picture spaces. You can change this any time.</span>
        </span>
      </label>

      {!skipped && copySources.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {copySources.map((source) => (
            <button
              key={source.id}
              type="button"
              disabled={busy}
              onClick={() => copyPhotosFrom(source)}
              className="text-ink-soft underline-offset-2 hover:text-ink hover:underline disabled:opacity-50"
            >
              Copy photos from {ceremonyDisplayName(source)}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <div key={active.id} className="flex flex-col gap-10">
        {!skipped && (
        <>
        <div>
          <p className="text-sm font-medium text-ink-soft">Hero image</p>
          <p className="mb-2 text-xs text-ink-soft/70">The big photo at the top, with the names written over it. A portrait or landscape photo of the couple works well.</p>
          <UploadSlot
            label="Hero image"
            url={active.heroImage ?? null}
            isUploading={uploadingKey === `${active.id}:hero`}
            disabled={busy}
            onSelect={handleHeroUpload}
            onRemove={removeHero}
            className="aspect-video w-full"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-ink-soft">Floating photo</p>
          <p className="mb-2 text-xs text-ink-soft/70">Appears in the middle of the invitation in a light frame that tilts as guests scroll.</p>
          <UploadSlot
            label="Floating photo"
            url={gallery.find((s) => s.id === FEATURE_SLOT_ID)?.url ?? null}
            isUploading={uploadingKey === `${active.id}:${FEATURE_SLOT_ID}`}
            disabled={busy}
            onSelect={(file) => handleGalleryUpload(FEATURE_SLOT_ID, file)}
            onRemove={() => removeGallery(FEATURE_SLOT_ID)}
            className="aspect-[4/5] w-40"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-ink-soft">Slider photos (up to 4)</p>
          <p className="mb-2 text-xs text-ink-soft/70">Guests swipe through these to the left. With the hero and floating photo, that makes 6 photos in all.</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {gallerySlotIds.map((slotId, i) => {
              const slot = gallery.find((s) => s.id === slotId)
              return (
                <UploadSlot
                  key={slotId}
                  label={`Slider photo ${i + 1}`}
                  url={slot?.url ?? null}
                  isUploading={uploadingKey === `${active.id}:${slotId}`}
                  disabled={busy}
                  onSelect={(file) => handleGalleryUpload(slotId, file)}
                  onRemove={() => removeGallery(slotId)}
                  className="aspect-square"
                />
              )
            })}
          </div>
        </div>

        </>
        )}

        <div className={skipped ? undefined : 'border-t border-ink/10 pt-8'}>
          <MusicPicker ceremony={active} onChange={(patch) => updateCeremony(active.id, patch)} />
        </div>
      </div>
    </WizardStepShell>
  )
}
