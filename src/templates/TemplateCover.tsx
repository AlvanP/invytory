import { useId, type CSSProperties } from 'react'
import { ChevronDown } from 'lucide-react'
import type { WeddingInvitation } from '@/types'
import { ceremonyDisplayName } from '@/types'
import { formatDate, formatTime } from '@/utils/format'
import { cn } from '@/utils/cn'
import { useRevealed } from '@/hooks/useRevealed'
import { useDesign } from '@/templates/DesignContext'
import { useDateGate } from '@/templates/DateGate'
import type { NameStyle } from '@/templates/designs'

export type CoverTone = 'royal' | 'garden' | 'storybook' | 'modern' | 'heritage' | 'classic'

/** SECTION 1: Cover & summary. Names, date, time and venue over the hero photo. */

const SCRIPT = "'Great Vibes', 'Cormorant Garamond', cursive"

function CoverPattern() {
  const id = useId()
  return (
    <svg aria-hidden className="absolute inset-0 h-full w-full opacity-[0.08]" fill="none">
      <defs>
        <pattern id={id} width="56" height="56" patternUnits="userSpaceOnUse">
          <circle cx="28" cy="28" r="2.5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

/**
 * A name written letter by letter. Each letter rises in after the one before it, then a
 * soft sheen passes along the name every few seconds. The sheen only dims and restores
 * the letter, so the name stays readable on any colour.
 */
function AnimatedName({ text, revealed, startIndex, style }: { text: string; revealed: boolean; startIndex: number; style: NameStyle }) {
  const font: CSSProperties =
    style === 'script' ? { fontFamily: SCRIPT } : style === 'caps' ? { letterSpacing: '0.18em' } : {}
  return (
    <span aria-label={text} className="block" style={font}>
      <style>{`
        @keyframes ivSheen { 0% { background-position: 100% 0 } 30%, 100% { background-position: 0% 0 } }
        .iv-letter {
          display: inline-block; white-space: pre; color: transparent;
          background-image: linear-gradient(100deg, var(--iv-on-main) 40%, color-mix(in srgb, var(--iv-on-main) 35%, transparent) 50%, var(--iv-on-main) 60%);
          background-size: 300% 100%; -webkit-background-clip: text; background-clip: text;
          animation: ivSheen 6s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) { .iv-letter { animation: none; color: var(--iv-on-main); background: none; } }
      `}</style>
      {Array.from(style === 'caps' ? text.toUpperCase() : text).map((ch, i) => {
        const n = startIndex + i
        return (
          <span
            key={i}
            aria-hidden
            className={cn(
              'iv-letter transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
              revealed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            )}
            style={{ transitionDelay: revealed ? `${700 + n * 70}ms` : '0ms', animationDelay: `${3 + n * 0.07}s` }}
          >
            {ch}
          </span>
        )
      })}
    </span>
  )
}

export function TemplateCover({ invitation }: { invitation: WeddingInvitation }) {
  const revealed = useRevealed()
  const { design, art } = useDesign()
  const gate = useDateGate()
  const coverBackground = art.coverBackground
  const hasPhoto = !!invitation.heroImage
  const line = 'color-mix(in srgb, var(--iv-on-main) 35%, transparent)'

  const rise = (index: number): { className: string; style: CSSProperties } => ({
    className: cn(
      'transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]',
      revealed ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
    ),
    style: { transitionDelay: revealed ? `${200 + index * 180}ms` : '0ms' },
  })

  // Subtle intro for the photo: it eases from slightly zoomed in to its resting size.
  const photoIntro = cn(
    'transition-transform duration-[3600ms] ease-out',
    revealed ? 'scale-100' : 'scale-[1.14]'
  )

  const eyebrow = 'Together With Their Families'
  const place = [invitation.venueName, invitation.city].filter(Boolean).join(' · ')
  const when = gate.hidden
    ? 'The date is waiting below'
    : [formatDate(invitation.weddingDate), formatTime(invitation.weddingTime)].filter(Boolean).join('  ·  ')

  const nameClass =
    design.names === 'script'
      ? 'text-[4.5rem] leading-[0.95] sm:text-[6rem]'
      : design.names === 'caps'
        ? 'font-body text-3xl font-semibold leading-snug sm:text-5xl'
        : 'font-display text-5xl leading-tight sm:text-6xl'

  const names = (
    <>
      <h1 className={nameClass}>
        <AnimatedName text={invitation.brideName} revealed={revealed} startIndex={0} style={design.names} />
        <span className={cn('block opacity-80', design.names === 'script' ? 'my-0 text-4xl' : 'my-1 text-2xl')} style={design.names === 'script' ? { fontFamily: SCRIPT } : undefined}>
          &amp;
        </span>
        <AnimatedName text={invitation.groomName} revealed={revealed} startIndex={invitation.brideName.length} style={design.names} />
      </h1>
      {invitation.tagline && (
        <p
          className={cn('mt-4 text-sm opacity-90 transition-opacity duration-1000', !revealed && '!opacity-0')}
          style={{ transitionDelay: revealed ? '1800ms' : '0ms' }}
        >
          {invitation.tagline}
        </p>
      )}
    </>
  )

  const summary = (
    <div {...rise(3)} className={cn('flex flex-col items-center gap-2', rise(3).className)}>
      <span className="rounded-full border px-5 py-2 text-xs uppercase tracking-[0.22em]" style={{ borderColor: line }}>
        {when}
      </span>
      {place && <span className="max-w-xs text-xs uppercase tracking-[0.22em] opacity-90">{place}</span>}
      <span className="text-[11px] uppercase tracking-[0.3em] opacity-75">{ceremonyDisplayName(invitation)}</span>
    </div>
  )

  const eyebrowEl = (
    <p {...rise(0)} className={cn('text-[11px] font-medium uppercase tracking-[0.32em]', rise(0).className)}>
      {eyebrow}
    </p>
  )

  const chevron = <ChevronDown aria-hidden className="absolute bottom-6 left-1/2 size-6 -translate-x-1/2 animate-bounce opacity-80" />

  // ── Full-width photo with a dark overlay and the names over it ─────────────
  if (design.cover === 'full') {
    const overPhoto = hasPhoto ? ({ '--iv-on-main': '#FFFFFF' } as CSSProperties) : undefined
    return (
      <div
        className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-[color:var(--iv-main)] bg-cover bg-center px-6 py-24 text-center text-[color:var(--iv-on-main)]"
        style={{ ...overPhoto, ...(coverBackground && !hasPhoto ? { backgroundImage: `url(${coverBackground})` } : {}) }}
      >
        {hasPhoto ? (
          <>
            <img src={invitation.heroImage ?? ''} alt="" className={cn('absolute inset-0 size-full object-cover', photoIntro)} />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70" />
          </>
        ) : (
          !coverBackground && <CoverPattern />
        )}
        <div aria-hidden className="absolute inset-4 border" style={{ borderColor: line }} />
        <div className="relative z-10 flex flex-col items-center gap-8">
          {eyebrowEl}
          <div {...rise(1)} className={rise(1).className}>
            {names}
          </div>
          {summary}
        </div>
        {chevron}
      </div>
    )
  }

  // ── Photo on top, names on a block of colour below ─────────────────────────
  if (design.cover === 'stacked') {
    return (
      <div className="relative flex min-h-[100svh] flex-col bg-[color:var(--iv-main)] text-center text-[color:var(--iv-on-main)]">
        <div className="relative h-[52svh] overflow-hidden">
          {hasPhoto ? (
            <img src={invitation.heroImage ?? ''} alt="" className={cn('size-full object-cover', photoIntro)} />
          ) : (
            <div
              className="relative size-full"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--iv-on-main) 12%, var(--iv-main))',
                backgroundImage: coverBackground ? `url(${coverBackground})` : undefined,
                backgroundSize: 'cover',
              }}
            >
              {!coverBackground && <CoverPattern />}
            </div>
          )}
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[color:var(--iv-main)] to-transparent" />
        </div>
        <div className="relative flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-16 pt-2">
          {eyebrowEl}
          <div {...rise(1)} className={rise(1).className}>
            {names}
          </div>
          {summary}
        </div>
        {chevron}
      </div>
    )
  }

  // ── Photo in an arch (default) ──────────────────────────────────────────────
  return (
    <div
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-[color:var(--iv-main)] bg-cover bg-center px-6 py-20 text-center text-[color:var(--iv-on-main)]"
      style={coverBackground ? { backgroundImage: `url(${coverBackground})` } : undefined}
    >
      {!coverBackground && <CoverPattern />}
      <div aria-hidden className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.18), transparent 60%)' }} />
      <div aria-hidden className="absolute inset-3 border" style={{ borderColor: line }} />
      <div className="relative z-10 flex flex-col items-center gap-6">
        {eyebrowEl}
        <div {...rise(1)} className={cn('rounded-t-full border p-2', rise(1).className)} style={{ ...rise(1).style, borderColor: line }}>
          <div className="aspect-[3/4] w-48 overflow-hidden rounded-t-full sm:w-56">
            {hasPhoto ? (
              <img src={invitation.heroImage ?? ''} alt="" className={cn('size-full object-cover', photoIntro)} />
            ) : (
              <div
                className="flex size-full flex-col items-center justify-center font-display"
                style={{ backgroundColor: 'color-mix(in srgb, var(--iv-on-main) 12%, transparent)' }}
              >
                <span className="text-5xl">{invitation.brideName.trim().charAt(0).toUpperCase()}</span>
                <span className="text-xl opacity-70">&amp;</span>
                <span className="text-5xl">{invitation.groomName.trim().charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>
        <div>{names}</div>
        {summary}
      </div>
      {chevron}
    </div>
  )
}
