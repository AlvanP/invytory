import { useState } from 'react'
import { Camera, Loader2, X } from 'lucide-react'
import { useWizard } from '@/hooks/useWizard'
import { storageService } from '@/services/storageService'
import { WizardStepShell } from './WizardStepShell'
import { cn } from '@/utils/cn'

const gallerySlotIds = ['g1', 'g2', 'g3', 'g4']

export function StepPhotos() {
  const { draft, updateDraft } = useWizard()
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleHeroUpload(file: File) {
    setUploadingSlot('hero')
    setError(null)
    try {
      const url = await storageService.uploadImage(file, 'hero')
      updateDraft({ heroImage: url })
    } catch {
      setError('Upload failed. Please try a different image.')
    } finally {
      setUploadingSlot(null)
    }
  }

  async function handleGalleryUpload(slotId: string, file: File) {
    setUploadingSlot(slotId)
    setError(null)
    try {
      const url = await storageService.uploadImage(file, 'gallery')
      const current = draft.galleryImages ?? []
      const next = current.map((slot) => (slot.id === slotId ? { ...slot, url } : slot))
      updateDraft({ galleryImages: next })
    } catch {
      setError('Upload failed. Please try a different image.')
    } finally {
      setUploadingSlot(null)
    }
  }

  function removeHero() {
    updateDraft({ heroImage: null })
  }

  function removeGallery(slotId: string) {
    const current = draft.galleryImages ?? []
    updateDraft({ galleryImages: current.map((slot) => (slot.id === slotId ? { ...slot, url: null } : slot)) })
  }

  return (
    <WizardStepShell
      eyebrow="Step 5 of 7"
      title="Photos"
      description="Upload a few photos of the two of you. JPG or PNG, up to a few MB each."
      backTo="/create/story"
      nextTo="/create/options"
      skippable
    >
      {error && <p className="text-sm text-danger">{error}</p>}

      <div>
        <p className="mb-2 text-sm font-medium text-ink-soft">Hero image</p>
        <UploadSlot
          label="Hero image"
          url={draft.heroImage ?? null}
          isUploading={uploadingSlot === 'hero'}
          onSelect={handleHeroUpload}
          onRemove={removeHero}
          className="aspect-video w-full"
        />
      </div>

      <div>
        <p className="mb-2 mt-6 text-sm font-medium text-ink-soft">Gallery photos</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {gallerySlotIds.map((slotId, i) => {
            const slot = draft.galleryImages?.find((s) => s.id === slotId)
            return (
              <UploadSlot
                key={slotId}
                label={`Gallery image ${i + 1}`}
                url={slot?.url ?? null}
                isUploading={uploadingSlot === slotId}
                onSelect={(file) => handleGalleryUpload(slotId, file)}
                onRemove={() => removeGallery(slotId)}
                className="aspect-square"
              />
            )
          })}
        </div>
      </div>
    </WizardStepShell>
  )
}

function UploadSlot({
  label,
  url,
  isUploading,
  onSelect,
  onRemove,
  className,
}: {
  label: string
  url: string | null
  isUploading: boolean
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
        <label className="flex cursor-pointer flex-col items-center gap-2 px-3 text-center">
          <Camera className="size-5 opacity-50" strokeWidth={1.5} />
          <span className="text-xs">{label}</span>
          <span className="text-[10px] text-ink-soft/60">Tap to upload</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
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