import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { wallService, type WallMessage } from '@/services/wallService'

/**
 * The messages guests left on the couple's wall. Anyone can add one, so the owner
 * can remove anything they do not want everyone to see.
 */
export function WallModeration({ invitationIds, ceremonyNames }: { invitationIds: string[]; ceremonyNames?: Record<string, string> }) {
  const [messages, setMessages] = useState<WallMessage[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const key = invitationIds.join(',')

  useEffect(() => {
    let cancelled = false
    wallService
      .listByInvitations(invitationIds)
      .then((list) => !cancelled && setMessages(list))
      .catch(() => !cancelled && setError('Could not load the wall messages.'))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  async function remove(m: WallMessage) {
    if (!window.confirm(`Remove ${m.guestName}'s message from the wall? Everyone will stop seeing it.`)) return
    try {
      await wallService.remove(m.id)
      setMessages((cur) => (cur ? cur.filter((x) => x.id !== m.id) : cur))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove the message.')
    }
  }

  if (!messages || messages.length === 0) {
    return error ? <p className="mt-10 text-sm text-danger">{error}</p> : null
  }

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl text-ink">Messages on the wall</h2>
      <p className="mt-1 text-sm text-ink-soft">Guests chose to share these publicly. Remove any you do not want everyone to see.</p>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      <ul className="mt-4 max-h-96 space-y-3 overflow-y-auto">
        {messages.map((m) => (
          <li key={m.id} className="flex items-start justify-between gap-4 rounded-md border border-ink/10 bg-white p-4">
            <div className="min-w-0">
              <p className="whitespace-pre-line break-words text-sm text-ink">{m.message}</p>
              <p className="mt-2 text-xs text-ink-soft">
                {m.guestName}
                {ceremonyNames?.[m.invitationId] ? ` · ${ceremonyNames[m.invitationId]}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(m)}
              className="shrink-0 rounded-sm p-2 text-ink-soft hover:bg-danger/10 hover:text-danger"
              aria-label={`Remove message from ${m.guestName}`}
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
