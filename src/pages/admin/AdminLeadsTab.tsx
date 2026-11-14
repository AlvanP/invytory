import { useEffect, useState } from 'react'
import { Mail, Trash2 } from 'lucide-react'
import { leadService, type Lead } from '@/services/leadService'

/** Admin: people who typed their email while creating an invitation. Reach out to the ones who did not publish. */
export function AdminLeadsTab() {
  const [leads, setLeads] = useState<Lead[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [onlyOpen, setOnlyOpen] = useState(true)

  const load = () => leadService.list().then(setLeads).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load. Has docs/sql/pack46.sql been run?'))
  useEffect(() => {
    void load()
  }, [])

  const shown = (leads ?? []).filter((l) => !onlyOpen || !l.has_published)
  return (
    <div>
      <p className="mb-3 text-sm text-ink-soft">People who entered their email while creating an invitation. Those who have not published yet are shown first, so you can write to them.</p>
      <label className="mb-3 flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} /> Only people who have not published
      </label>
      {error && <p className="mb-3 rounded-xs bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {!leads && !error && <p className="py-8 text-center text-sm text-ink-soft">Loading…</p>}
      {leads && shown.length === 0 && <p className="py-8 text-center text-sm text-ink-soft">Nobody here yet.</p>}
      <ul className="divide-y divide-ink/10 rounded-sm border border-ink/10 bg-white">
        {shown.map((l) => (
          <li key={l.email} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{l.email}</p>
              <p className="text-xs text-ink-soft">
                {[l.event_type, l.names, l.template_id, l.plan].filter(Boolean).join(' · ') || 'No details'} · {new Date(l.last_seen).toLocaleString()}
                {l.tries > 1 ? ` · ${l.tries} tries` : ''}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs ${l.has_published ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
              {l.has_published ? 'Published' : 'Not published'}
            </span>
            <a
              href={`mailto:${l.email}?subject=${encodeURIComponent('Your Invytory invitation')}&body=${encodeURIComponent(`Hello${l.names ? ` ${l.names}` : ''},\n\nWe noticed you started creating an invitation on Invytory and wanted to see if we can help you finish it.\n\n`)}`}
              className="inline-flex items-center gap-1 text-sm text-gold-deep"
            >
              <Mail className="size-4" /> Email
            </a>
            <button
              type="button"
              aria-label="Remove"
              className="text-ink-soft hover:text-red-700"
              onClick={() => leadService.remove(l.email).then(load).catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))}
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
