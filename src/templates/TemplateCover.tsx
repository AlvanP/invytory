import { useId, type CSSProperties, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import type { WeddingInvitation } from '@/types'
import { ceremonyDisplayName } from '@/types'
import { formatDate, formatTime } from '@/utils/format'
import { cn } from '@/utils/cn'
import { getTemplateArt } from '@/utils/templateArt'
import { useRevealed } from '@/hooks/useRevealed'

export type CoverTone = 'royal' | 'garden' | 'storybook' | 'modern' | 'heritage' | 'classic'

/** A faint repeating pattern behind the cover, drawn in the cover's own text colour. */
function CoverPattern({ tone }: { tone: CoverTone }) {
  const id = useId()
  const dots = tone === 'garden' || tone === 'storybook' || tone === 'classic'
  return (
    <svg aria-hidden className="absolute inset-0 h-full w-full opacity-[0.09]" fill="none">
      <defs>
        <pattern id={id} width="48" height="48" patternUnits="userSpaceOnUse">
          {dots ? (
            <>
              <circle cx="24" cy="24" r="3" fill="currentColor" />
              <circle cx="0" cy="0" r="2" fill="currentColor" />
              <circle cx="48" cy="0" r="2" fill="currentColor" />
              <circle cx="0" cy="48" r="2" fill="currentColor" />
              <circle cx="48" cy="48" r="2" fill="currentColor" />
            </>
          ) : (
            <path d="M24 4 L44 24 L24 44 L4 24 Z M24 14 L34 24 L24 34 L14 24 Z" stroke="currentColor" strokeWidth="1" />
          )}
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
function AnimatedName({ text, revealed, startIndex }: { text: string; revealed: boolean; startIndex: number }) {
  return (
    <span aria-label={text} className="block">
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
      {Array.from(text).map((ch, i) => {
        const n = startIndex + i
        return (
          <span
            key={i}
            aria-hidden
            className={cn(
              'iv-letter transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
              revealed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            )}
            style={{
              transitionDelay: revealed ? `${700 + n * 70}ms` : '0ms',
              animationDelay: `${3 + n * 0.07}s`,
            }}
          >
            {ch}
          </span>
        )
      })}
    </span>
  )
}

function ArchPlaceholder({ bride, groom }: { bride: string; groom: string }) {
  return (
    <div
      className="flex size-full flex-col items-center justify-center gap-1 font-display"
      style={{ backgroundColor: 'color-mix(in srgb, var(--iv-on-main) 12%, transparent)' }}
    >
      <span className="text-5xl">{bride.trim().charAt(0).toUpperCase()}</span>
      <span className="text-xl opacity-70">&amp;</span>
      <span className="text-5xl">{groom.trim().charAt(0).toUpperCase()}</span>
    </div>
  )
}

/**
 * The opening section of an invitation. Its colours come from the couple's
 * colour of the day (CSS variables set by InvitationRenderer), and the writing
 * on it is always the readable one of white or near-black.
 */
export function TemplateCover({
  invitation,
  tone,
  eyebrow,
  children,
}: {
  invitation: WeddingInvitation
  tone: CoverTone
  eyebrow: string
  children?: ReactNode
}) {
  const revealed = useRevealed()
  const coverBackground = getTemplateArt(invitation.templateId).coverBackground
  const line = 'color-mix(in srgb, var(--iv-on-main) 35%, transparent)'

  // Each piece rises into place a little after the one before it.
  const rise = (index: number): { className: string; style: CSSProperties } => ({
    className: cn(
      'transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]',
      revealed ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
    ),
    style: { transitionDelay: revealed ? `${200 + index * 180}ms` : '0ms' },
  })

  const when = [formatDate(invitation.weddingDate), formatTime(invitation.weddingTime)].filter(Boolean).join('  ·  ')

  return (
    <div
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-[color:var(--iv-main)] bg-cover bg-center px-6 py-20 text-center text-[color:var(--iv-on-main)]"
      style={coverBackground ? { backgroundImage: `url(${coverBackground})` } : undefined}
    >
      {!coverBackground && <CoverPattern tone={tone} />}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.18), transparent 60%)' }}
      />
      <div aria-hidden className="absolute inset-3 border" style={{ borderColor: line }} />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <p {...rise(0)} className={cn('text-xs font-medium uppercase tracking-[0.3em]', rise(0).className)}>
          {eyebrow}
        </p>

        <div {...rise(1)} className={cn('rounded-t-full border p-2', rise(1).className)} style={{ ...rise(1).style, borderColor: line }}>
          <div className="aspect-[3/4] w-52 overflow-hidden rounded-t-full sm:w-60">
            {invitation.heroImage ? (
              <img src={invitation.heroImage} alt="" className="size-full object-cover" />
            ) : (
              <ArchPlaceholder bride={invitation.brideName} groom={invitation.groomName} />
            )}
          </div>
        </div>

        <div>
          <h1 className="font-display text-5xl leading-tight sm:text-6xl">
            <AnimatedName text={invitation.brideName} revealed={revealed} startIndex={0} />
            <span className="my-1 block text-3xl opacity-80">&amp;</span>
            <AnimatedName text={invitation.groomName} revealed={revealed} startIndex={invitation.brideName.length} />
          </h1>
          {invitation.tagline && (
            <p
              className={cn('mt-3 text-sm opacity-85 transition-opacity duration-1000', !revealed && '!opacity-0')}
              style={{ transitionDelay: revealed ? '1800ms' : '0ms' }}
            >
              {invitation.tagline}
            </p>
          )}
        </div>

        <div {...rise(3)} className={cn('flex flex-col items-center gap-2', rise(3).className)}>
          <span className="rounded-full border px-5 py-2 text-xs uppercase tracking-[0.25em]" style={{ borderColor: line }}>
            {when}
          </span>
          <span className="text-xs uppercase tracking-[0.25em] opacity-80">{ceremonyDisplayName(invitation)}</span>
        </div>

        {children}
      </div>

      <ChevronDown aria-hidden className="absolute bottom-6 left-1/2 size-6 -translate-x-1/2 animate-bounce opacity-70" />
    </div>
  )
}