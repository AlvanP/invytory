import { useCallback, useEffect, useState } from 'react'
import { contactService, type ContactMessage } from '@/services/contactService'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

/** Admin: messages sent from the Contact us page. */
export function AdminMessagesTab() {
  const [items, setItems] = useState<ContactMessage[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setItems(await contactService.list())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load messages.')
      setItems([])
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function toggle(m: ContactMessage) {
    await contactService.setRead(m.id, !m.isRead).catch(() => undefined)
    await load()
  }
  async function remove(m: ContactMessage) {
    if (!window.confirm('Delete this message?')) return
    await contactService.remove(m.id).catch(() => undefined)
    await load()
  }

  if (items === null) return <p className="text-sm text-ink-soft">Loading…</p>
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      {error && <p className="text-sm text-danger">{error} (Has docs/sql/contact.sql been run in Supabase?)</p>}
      {!error && items.length === 0 && <p className="text-sm text-ink-soft">No messages yet.</p>}
      {items.map((m) => (
        <article key={m.id} className={cn('rounded-md border bg-white p-5', m.isRead ? 'border-ink/10' : 'border-wine/40')}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-medium text-ink">
              {m.name} <span className="font-normal text-ink-soft">&middot; {m.topic ?? 'General'}</span>
            </p>
            <p className="text-xs text-ink-soft">{new Date(m.createdAt).toLocaleString('en-GB')}</p>
          </div>
          <a href={`mailto:${m.email}`} className="text-sm text-wine underline-offset-2 hover:underline">{m.email}</a>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink">{m.message}</p>
          <div className="mt-4 flex gap-2">
            <a href={`mailto:${m.email}?subject=Re: your message to Invytory`}><Button size="sm" variant="outline">Reply</Button></a>
            <Button size="sm" variant="ghost" onClick={() => toggle(m)}>{m.isRead ? 'Mark unread' : 'Mark read'}</Button>
            <Button size="sm" variant="ghost" onClick={() => remove(m)}>Delete</Button>
          </div>
        </article>
      ))}
    </div>
  )
}
