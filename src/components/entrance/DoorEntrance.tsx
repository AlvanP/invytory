import { useState } from 'react'
import { cn } from '@/utils/cn'
import type { CoverTone } from '@/templates/TemplateCover'
import { entranceConfig } from '@/templates/entranceConfig'
import { SplitPanelsVariant, BookVariant, EnvelopeVariant } from './EntranceVariants'

const doorPalette = {
  from: 'linear-gradient(135deg, #5C2435 0%, #3B1522 100%)',
  border: 'border-gold/30',
}
const gatePalette = {
  from: 'linear-gradient(135deg, #DCE3CD 0%, #8FA37E 100%)',
  border: 'border-sage/40',
}

const leafOrnament = (
  <svg width="56" height="24" viewBox="0 0 36 16" className="text-ivory" fill="none">
    <path d="M18 2C11 2 4 6 2 8C4 10 11 14 18 14C25 14 32 10 34 8C32 6 25 2 18 2Z" stroke="currentColor" strokeWidth="1" />
  </svg>
)

const diamondOrnament = (
  <svg width="20" height="20" viewBox="0 0 20 20" className="text-gold" fill="currentColor">
    <rect x="4" y="4" width="12" height="12" transform="rotate(45 10 10)" />
  </svg>
)

/**
 * The Door Engine's entry point: <DoorEntrance tone="royal" ... />
 * Renders the entrance mechanic that matches the template's tone (see
 * entranceConfig.ts), handles the tap-to-open interaction, and calls
 * `onOpen` once the opening animation finishes.
 */
export function DoorEntrance({
  tone,
  brideName,
  groomName,
  onOpen,
}: {
  tone: CoverTone
  brideName: string
  groomName: string
  onOpen: () => void
}) {
  const [triggered, setTriggered] = useState(false)
  const config = entranceConfig[tone]

  function handleOpen() {
    if (triggered) return
    setTriggered(true)
    // Matches each variant's ~900ms opening animation, plus a small buffer.
    setTimeout(onOpen, 950)
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-ink">
      {config.assets?.background && (
        <img src={config.assets.background} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}

      {config.style === 'doors' && (
        <SplitPanelsVariant
          triggered={triggered}
          leftGradient={doorPalette.from}
          rightGradient={doorPalette.from}
          borderColorClass={doorPalette.border}
          assets={config.assets}
          ornament={diamondOrnament}
        />
      )}
      {config.style === 'gate' && (
        <SplitPanelsVariant
          triggered={triggered}
          leftGradient={gatePalette.from}
          rightGradient={gatePalette.from}
          borderColorClass={gatePalette.border}
          assets={config.assets}
          ornament={leafOrnament}
        />
      )}
      {config.style === 'book' && <BookVariant triggered={triggered} assets={config.assets} />}
      {config.style === 'envelope' && <EnvelopeVariant triggered={triggered} assets={config.assets} />}

      <div
        className={cn(
          'absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-6 text-center text-ivory transition-opacity duration-500',
          triggered && 'pointer-events-none opacity-0'
        )}
      >
        <p className="text-xs tracking-[0.3em] text-gold">You Are Invited</p>
        <h1 className="font-display text-3xl sm:text-4xl">
          {brideName} <span className="text-gold">&amp;</span> {groomName}
        </h1>
        <button
          type="button"
          onClick={handleOpen}
          className="mt-4 rounded-full border border-gold/60 px-6 py-3 text-xs uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold/10"
        >
          {config.hint}
        </button>
      </div>
    </div>
  )
}