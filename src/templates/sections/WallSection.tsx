import type { WeddingInvitation } from '@/types'
import { InvitationSection } from '@/components/invitation/InvitationSection'
import { useDesign } from '@/templates/DesignContext'
import { useWall } from '@/templates/WallContext'

function ago(iso: string): string {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000)
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['day', 86_400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}

/**
 * SECTION 10: The couple's wall. Messages guests chose to leave in public when they RSVP.
 * The list scrolls inside its own box, so many messages never make the invitation long.
 * Nothing is shown until there is at least one message.
 */
export function WallSection(_props: { invitation: WeddingInvitation }) {
  const { messages } = useWall()
  const { event } = useDesign()
  if (messages.length === 0) return null
  return (
    <InvitationSection id="wall" eyebrow={event.wall.eyebrow} title={event.wall.title}>
      <div className="relative">
        <ul
          tabIndex={0}
          aria-label="Messages from guests"
          className="max-h-[22rem] space-y-3 overflow-y-auto rounded-md pr-1 text-left [scrollbar-color:var(--iv-main)_transparent] [scrollbar-width:thin]"
        >
          {messages.map((m) => (
            <li key={m.id} className="rounded-md bg-[color:var(--iv-paper)] p-4 text-[color:var(--iv-ink)] shadow-[0_8px_24px_-16px_rgba(0,0,0,0.35)]">
              <p className="whitespace-pre-line break-words text-base leading-relaxed">{m.message}</p>
              <p className="mt-3 flex items-baseline justify-between gap-3 text-xs">
                <span className="font-display text-base text-[color:var(--iv-accent)]">{m.guestName}</span>
                <span className="opacity-60">{ago(m.createdAt)}</span>
              </p>
            </li>
          ))}
        </ul>
        {messages.length > 3 && (
          <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-[color:var(--iv-ink)] opacity-55">
            {messages.length} messages &middot; scroll to read
          </p>
        )}
      </div>
    </InvitationSection>
  )
}
