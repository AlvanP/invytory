import { Heart } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { EntranceAssets } from '@/templates/entranceConfig'

const EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]'
const DURATION = 'duration-[900ms]'

/** Two panels sliding apart. Used by "doors" and "gate" (different
 * colors/ornament per tone, same mechanic). If real panel artwork is
 * provided, it's used as a background-image instead of the gradient —
 * see src/assets/entrances/README.md for exact panel dimensions. */
export function SplitPanelsVariant({
  triggered,
  leftGradient,
  rightGradient,
  borderColorClass,
  assets,
  ornament,
}: {
  triggered: boolean
  leftGradient: string
  rightGradient: string
  borderColorClass: string
  assets?: EntranceAssets
  ornament?: React.ReactNode
}) {
  return (
    <>
      <div
        className={cn(
          'absolute inset-y-0 left-0 w-1/2 border-r bg-cover bg-center transition-transform',
          DURATION, EASE, borderColorClass,
          triggered && '-translate-x-full'
        )}
        style={{
          backgroundImage: assets?.leftPanel ? `url(${assets.leftPanel})` : leftGradient,
        }}
      />
      <div
        className={cn(
          'absolute inset-y-0 right-0 w-1/2 border-l bg-cover bg-center transition-transform',
          DURATION, EASE, borderColorClass,
          triggered && 'translate-x-full'
        )}
        style={{
          backgroundImage: assets?.rightPanel ? `url(${assets.rightPanel})` : rightGradient,
        }}
      />
      {ornament && (
        <div
          className={cn(
            'absolute left-1/2 top-1/2 z-[5] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500',
            triggered && 'opacity-0'
          )}
        >
          {ornament}
        </div>
      )}
    </>
  )
}

/** A cover that scales down and fades away, as if opening to a first page. */
export function BookVariant({ triggered, assets }: { triggered: boolean; assets?: EntranceAssets }) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center bg-[#F3EDE1] transition-all',
        DURATION, EASE,
        triggered && 'scale-95 opacity-0'
      )}
    >
      <div
        className="flex h-2/3 w-2/3 max-w-xs flex-col items-center justify-center gap-3 rounded-sm border-4 border-double border-gold/50 bg-ivory bg-cover bg-center shadow-lift"
        style={assets?.cover ? { backgroundImage: `url(${assets.cover})` } : undefined}
      >
        {!assets?.cover && (
          <>
            <div className="h-px w-12 bg-gold/50" />
            <p className="font-display text-lg italic text-ink">Our Story Begins</p>
            <div className="h-px w-12 bg-gold/50" />
          </>
        )}
      </div>
    </div>
  )
}

/** An envelope flap that lifts open, revealing a seal that fades out. */
export function EnvelopeVariant({ triggered, assets }: { triggered: boolean; assets?: EntranceAssets }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="relative h-48 w-72 max-w-[80vw] rounded-sm bg-cover bg-center shadow-lift"
        style={{
          backgroundImage: assets?.envelope ? `url(${assets.envelope})` : undefined,
          backgroundColor: assets?.envelope ? undefined : 'var(--color-ivory-deep)',
        }}
      >
        <div
          className={cn('absolute inset-x-0 top-0 h-1/2 bg-linen transition-all', DURATION, EASE, triggered && '-translate-y-6 opacity-0')}
          style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
        />
        <div
          className={cn(
            'absolute left-1/2 top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-ivory shadow-soft transition-opacity duration-300',
            triggered && 'opacity-0'
          )}
        >
          <Heart className="size-4" fill="currentColor" strokeWidth={0} />
        </div>
      </div>
    </div>
  )
}