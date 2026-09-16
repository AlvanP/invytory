import { ImageIcon, MapPin, QrCode, DoorOpen, Sparkles } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * A shared family of tasteful placeholder surfaces. These stand in for
 * real photography, maps, and animation until final assets are ready.
 */

function Base({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center gap-2 overflow-hidden',
        'border border-dashed border-gold/40 bg-[linear-gradient(135deg,var(--color-ivory-deep)_0%,var(--color-linen)_100%)]',
        'text-ink-soft',
        className
      )}
    >
      {children}
    </div>
  )
}

/** Shows the real photo if one has been uploaded (`src`), otherwise falls
 * back to the placeholder box. Used for both hero and gallery slots. */
export function ImagePlaceholder({
  label = 'Photo will appear here',
  src,
  className,
}: {
  label?: string
  src?: string | null
  className?: string
}) {
  if (src) {
    return <img src={src} alt="" className={cn('rounded-sm object-cover', className)} />
  }
  return (
    <Base className={cn('rounded-sm min-h-40', className)}>
      <ImageIcon className="size-6 opacity-50" strokeWidth={1.5} />
      <span className="text-xs tracking-wide">{label}</span>
    </Base>
  )
}

export function HeroInvitationPlaceholder({ className }: { className?: string }) {
  return (
    <Base className={cn('rounded-md aspect-[3/4] p-8 shadow-soft', className)}>
      <Sparkles className="size-6 text-gold" strokeWidth={1.5} />
      <p className="font-display text-2xl text-ink">Your Invitation</p>
      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft/70">Animated preview coming soon</p>
      <div className="mt-4 h-px w-16 bg-gold/50" />
    </Base>
  )
}

export function DoorPlaceholder({ className }: { className?: string }) {
  return (
    <Base className={cn('rounded-md aspect-[3/4]', className)}>
      <DoorOpen className="size-8 text-gold" strokeWidth={1.25} />
      <span className="text-xs tracking-wide">Door reveal will animate here</span>
    </Base>
  )
}

export function MapPlaceholder({ className }: { className?: string }) {
  return (
    <Base className={cn('rounded-sm min-h-48', className)}>
      <MapPin className="size-6 text-gold" strokeWidth={1.5} />
      <span className="text-xs tracking-wide">Map will appear here</span>
    </Base>
  )
}

export function QrPlaceholder({ className }: { className?: string }) {
  return (
    <Base className={cn('rounded-sm size-28 shrink-0', className)}>
      <QrCode className="size-8 text-gold" strokeWidth={1.25} />
    </Base>
  )
}

export function TemplatePreviewPlaceholder({ tone, className }: { tone: string; className?: string }) {
  const toneGradients: Record<string, string> = {
    royal: 'linear-gradient(160deg, #3B1522 0%, #5C2435 60%, #B08D57 100%)',
    garden: 'linear-gradient(160deg, #EFEFE2 0%, #DCE3CD 60%, #8FA37E 100%)',
    storybook: 'linear-gradient(160deg, #F3EDE1 0%, #E4D3C4 60%, #B08D57 100%)',
    modern: 'linear-gradient(160deg, #1F1C19 0%, #3A3530 60%, #B08D57 100%)',
    heritage: 'linear-gradient(160deg, #3B1F0E 0%, #8A3A1E 55%, #D9A441 100%)',
    classic: 'linear-gradient(160deg, #F8F5EE 0%, #E7DFCF 60%, #B08D57 100%)',
  }
  return (
    <div
      className={cn('relative flex items-end justify-center overflow-hidden rounded-md aspect-[3/4]', className)}
      style={{ backgroundImage: toneGradients[tone] ?? toneGradients.classic }}
    >
      <div className="absolute inset-6 border border-white/30" />
      <div className="relative pb-8 text-center text-white/90">
        <p className="font-display italic text-sm tracking-wide">Preview</p>
      </div>
    </div>
  )
}