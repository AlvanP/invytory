import { useState } from 'react'
import { cn } from '@/utils/cn'
import type { CoverTone } from '@/templates/TemplateCover'
import type { EntranceStyle } from '@/templates/entranceConfig'
import { entranceConfig } from '@/templates/entranceConfig'
import { getTemplateArt, pickEntranceStyle } from '@/utils/templateArt'
import { SplitPanelsVariant, BookVariant, EnvelopeVariant } from './EntranceVariants'
import { GatefoldVariant, WaxEnvelopeVariant } from './LayeredEntrance'
import { SceneEntrance } from './scenes/SceneEntrance'
import { entranceDesigns } from './scenes/entranceDesigns'

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

function definedOnly<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>
}

/**
 * The Door Engine's entry point: <DoorEntrance tone="royal" ... />
 * Renders the entrance mechanic that matches the template's tone (see
 * entranceConfig.ts), handles the tap-to-open interaction, and calls
 * `onOpen` once the opening animation finishes.
 */
function LegacyEntrance({
  tone,
  templateId,
  forceStyle,
  brideName,
  groomName,
  onOpen,
  onTap,
}: {
  tone: CoverTone
  /** When this design has its own artwork files, they replace the placeholders. */
  templateId?: string
  /** Used by the preview lab to try a style before any artwork exists. */
  forceStyle?: EntranceStyle
  brideName: string
  groomName: string
  onOpen: () => void
  /** Runs immediately inside the guest's tap, before the opening animation.
   * Browsers only allow sound to start from inside a tap, so music starts here. */
  onTap?: () => void
}) {
  const [triggered, setTriggered] = useState(false)
  const baseConfig = entranceConfig[tone]
  // Artwork files dropped into src/assets/templates/<id>/ win over the defaults.
  const config = {
    ...baseConfig,
    assets: { ...baseConfig.assets, ...definedOnly(getTemplateArt(templateId).entrance) },
  }
  config.style = forceStyle ?? pickEntranceStyle(baseConfig.style, config.assets)

  // Light-coloured designs get dark writing so it can be read on pale artwork.
  const lightDesign = tone === 'garden' || tone === 'storybook' || tone === 'classic'

  const layered = config.style === 'gatefold' || config.style === 'waxenvelope'
  const cardWithArt =
    layered ||
    (config.style === 'book' && !!config.assets.cover) ||
    (config.style === 'envelope' && !!config.assets.envelope)
  const hint =
    config.style === 'gatefold' ? 'Tap the bow to open' : config.style === 'waxenvelope' ? 'Tap the seal to open' : config.hint
  const initials = (groomName.trim() ? `${brideName.trim().charAt(0)}&${groomName.trim().charAt(0)}` : brideName.trim().charAt(0)).toUpperCase()

  function handleOpen() {
    if (triggered) return
    setTriggered(true)
    onTap?.()
    // A tiny buzz on phones that allow it, so the tap feels real.
    try {
      navigator.vibrate?.(18)
    } catch {
      // Not supported: nothing to do.
    }
    // Matches each variant's opening animation, plus a small buffer. The
    // layered styles take longer because they swing and fold in 3D.
    setTimeout(onOpen, layered ? 2500 : 950)
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
          ornament={config.assets.leftPanel ? undefined : diamondOrnament}
        />
      )}
      {config.style === 'gate' && (
        <SplitPanelsVariant
          triggered={triggered}
          leftGradient={gatePalette.from}
          rightGradient={gatePalette.from}
          borderColorClass={gatePalette.border}
          assets={config.assets}
          ornament={config.assets.leftPanel ? undefined : leafOrnament}
        />
      )}
      {config.style === 'book' && <BookVariant triggered={triggered} assets={config.assets} />}
      {config.style === 'envelope' && <EnvelopeVariant triggered={triggered} assets={config.assets} />}
      {config.style === 'gatefold' && <GatefoldVariant triggered={triggered} assets={config.assets} onTrigger={handleOpen} />}
      {config.style === 'waxenvelope' && (
        <WaxEnvelopeVariant triggered={triggered} assets={config.assets} initials={initials} onTrigger={handleOpen} />
      )}

      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-20 flex flex-col items-center px-6 text-center transition-opacity duration-500',
          // A book or envelope sits in the middle of the screen, so the words go
          // above it and the button below it. Doors keep everything centred.
          cardWithArt ? 'justify-between py-[9vh]' : 'justify-center gap-6',
          lightDesign ? 'text-ink' : 'text-ivory',
          triggered && 'pointer-events-none opacity-0'
        )}
      >
        <div className="flex flex-col items-center gap-4">
          <p className="text-xs tracking-[0.3em] text-gold">You Are Invited</p>
          <h1 className="font-display text-3xl sm:text-4xl">
            {brideName}
            {groomName.trim() && (
              <>
                {' '}
                <span className="text-gold">&amp;</span> {groomName}
              </>
            )}
          </h1>
        </div>
        <button
          type="button"
          onClick={handleOpen}
          className={cn('pointer-events-auto rounded-full border border-gold/60 px-6 py-3 text-xs uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold/10', !cardWithArt && 'mt-4')}
        >
          {hint}
        </button>
      </div>
    </div>
  )
}

/**
 * The entrance for a design. Designs with their own opening (see scenes/entranceDesigns.ts) get it,
 * unless the designer has supplied real artwork files, which always win.
 */
export function DoorEntrance(props: Parameters<typeof LegacyEntrance>[0]) {
  const design = props.templateId ? entranceDesigns[props.templateId] : undefined
  const hasArt = Object.values(getTemplateArt(props.templateId).entrance).some(Boolean)
  if (design && !hasArt && !props.forceStyle) {
    return <SceneEntrance design={design} templateId={props.templateId} brideName={props.brideName} groomName={props.groomName} onOpen={props.onOpen} onTap={props.onTap} />
  }
  return <LegacyEntrance {...props} />
}
