import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { GalleryImageSlot } from '@/types'
import { MORE_SLIDER_SLOT_IDS, SLIDER_SLOT_IDS } from '@/types'
import { UploadSlot } from '@/components/wizard/UploadSlot'

/**
 * The slider photos: four to start with. Once those four are filled, "Add more photos" opens
 * room for four more (eight in all).
 */
export function SliderPhotoGrid({
  gallery,
  uploadingSlot,
  busy,
  onUpload,
  onRemove,
  gridClassName = 'grid grid-cols-2 gap-4 sm:grid-cols-4',
}: {
  gallery: GalleryImageSlot[]
  uploadingSlot: string | null
  busy: boolean
  onUpload: (slotId: string, file: File) => void
  onRemove: (slotId: string) => void
  gridClassName?: string
}) {
  const urlOf = (id: string) => gallery.find((s) => s.id === id)?.url ?? null
  const firstFourFull = SLIDER_SLOT_IDS.every((id) => !!urlOf(id))
  const hasExtra = MORE_SLIDER_SLOT_IDS.some((id) => !!urlOf(id))
  const [opened, setOpened] = useState(false)
  const showMore = hasExtra || opened

  function grid(ids: string[], offset: number) {
    return (
      <div className={gridClassName}>
        {ids.map((slotId, i) => (
          <UploadSlot
            key={slotId}
            label={`Slider photo ${offset + i + 1}`}
            url={urlOf(slotId)}
            isUploading={uploadingSlot === slotId}
            disabled={busy}
            onSelect={(file) => onUpload(slotId, file)}
            onRemove={() => onRemove(slotId)}
            className="aspect-square"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {grid(SLIDER_SLOT_IDS, 0)}
      {showMore && (
        <div>
          <p className="mb-2 text-xs text-ink-soft/70">More slider photos (up to 4 more)</p>
          {grid(MORE_SLIDER_SLOT_IDS, 4)}
        </div>
      )}
      {firstFourFull && !showMore && (
        <button
          type="button"
          onClick={() => setOpened(true)}
          className="flex items-center justify-center gap-2 self-start rounded-xs border border-dashed border-ink/25 px-4 py-2.5 text-sm text-ink-soft transition-colors hover:border-gold hover:text-ink"
        >
          <Plus className="size-4" /> Add more photos
        </button>
      )}
    </div>
  )
}
