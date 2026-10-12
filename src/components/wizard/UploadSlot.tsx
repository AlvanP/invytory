import { Camera, Loader2, X } from 'lucide-react'
import { cn } from '@/utils/cn'

/** Shows the real reason an upload failed, not a generic message. */
export function uploadErrorMessage(err: unknown): string {
  const detail = err instanceof Error && err.message ? err.message : 'Unknown error.'
  return `Upload failed: ${detail}`
}

export function UploadSlot({
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