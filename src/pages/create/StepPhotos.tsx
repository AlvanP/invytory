import { useState } from 'react'
import { Camera, Loader2, X } from 'lucide-react'
import { useWizard } from '@/hooks/useWizard'
import { storageService } from '@/services/storageService'
import type { CeremonyDraft } from '@/types'
import { ceremonyDisplayName, emptyGallery } from '@/types'
import { CeremonyTabs } from '@/components/wizard/CeremonyTabs'
import { WizardStepShell } from './WizardStepShell'
import { cn } from '@/utils/cn'

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

  const active = draft.ceremonies.find((c) => c.id === activeId) ?? draft.ceremonies[0]
  const gallery = active.galleryImages ?? emptyGallery()
  const copySources = draft.ceremonies.filter((c) => c.id !== active.id && hasPhotos(c))
  const busy = uploadingKey !== null

  async function handleHeroUpload(file: File) {
    const ceremonyId = active.id
    setUploadingKey(`${ceremonyId}:hero`)
    setError(null)
    try {
      const url = await storageService.uploadImage(file, 'hero')
      updateCeremony(ceremonyId, { heroImage: url })
    } catch {
      setError('Upload failed. Please try a different image.')
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
      const next = current.map((slot) => (slot.id === slotId ? { ...slot, url } : slot))
      updateCeremony(ceremonyId, { galleryImages: next })
    } catch {
      setError('Upload failed. Please try a different image.')
    } finally {
      setUploadingKey(null)
    }
  }

  function removeHero() {
    updateCeremony(active.id, { heroImage: null })
  }

  function removeGallery(slotId: string) {
    updateCeremony(active.id, {
      galleryImages: gallery.map((slot) => (slot.id === slotId ? { ...slot, url: null } : slot)),
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
      title="Photos"
      description="Upload a few photos for each ceremony. JPG or PNG, up to a few MB each."
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

      {copySources.length > 0 && (
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

      <div key={active.id}>
        <div>
          <p className="mb-2 text-sm font-medium text-ink-soft">Hero image</p>
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
          <p className="mb-2 mt-6 text-sm font-medium text-ink-soft">Gallery photos</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {gallerySlotIds.map((slotId, i) => {
              const slot = gallery.find((s) => s.id === slotId)
              return (
                <UploadSlot
                  key={slotId}
                  label={`Gallery image ${i + 1}`}
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
      </div>
    </WizardStepShell>
  )
}

function UploadSlot({
  label,
  url,
  isUploading,
  disabled,
  onSelect,
  onRemove,
  className,
}: {
  label: string
  url: string | null
  isUploading: boolean
  /** True while any upload is running, so two uploads can't overwrite each other. */
  disabled: boolean
  onSelect: (file: File) => void
  onRemove: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-sm border border-dashed border-gold/40 bg-ivory-deep text-ink-soft',
        className
      )}
    >
      {url ? (
        <>
          <img src={url} alt={label} className="absolute inset-0 h-full w-full object-cover" />
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${label}`}
            className="absolute right-2 top-2 rounded-full bg-ink/70 p-1 text-ivory hover:bg-ink"
          >
            <X className="size-3.5" />
          </button>
        </>
      ) : isUploading ? (
        <Loader2 className="size-5 animate-spin text-gold" />
      ) : (
        <label
          className={cn(
            'flex flex-col items-center gap-2 px-3 text-center',
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          )}
        >
          <Camera className="size-5 opacity-50" strokeWidth={1.5} />
          <span className="text-xs">{label}</span>
          <span className="text-[10px] text-ink-soft/60">Tap to upload</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={disabled}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onSelect(file)
              e.target.value = ''
            }}
          />
        </label>
      )}
    </div>
  )
}
