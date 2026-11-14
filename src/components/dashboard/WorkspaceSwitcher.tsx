import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useWorkspace } from '@/hooks/useWorkspace'
import { weddingService } from '@/services/weddingService'
import { namesTitle } from '@/utils/format'

interface Option {
  id: string
  label: string
}

/** Only shown to people who manage someone else's invitation: pick which event the dashboard shows. */
export function WorkspaceSwitcher() {
  const { user } = useAuth()
  const [workspace, setWorkspace] = useWorkspace()
  const [options, setOptions] = useState<Option[]>([])
  const [hasShared, setHasShared] = useState(false)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    weddingService.listByOwner(user.id).then(async (list) => {
      const rows = await Promise.all(
        list.map(async (w) => {
          const cs = await weddingService.getCeremoniesById(w.id).catch(() => [])
          const names = cs[0] ? namesTitle(cs[0].brideName, cs[0].groomName) : 'Invitation'
          return { id: w.id, label: w.ownerId === user.id ? names : `${names} (shared with you)`, shared: w.ownerId !== user.id }
        })
      )
      if (cancelled) return
      setOptions(rows.map(({ id, label }) => ({ id, label })))
      setHasShared(rows.some((r) => r.shared))
    })
    return () => {
      cancelled = true
    }
  }, [user])

  if (!hasShared) return null
  return (
    <div className="px-3 pb-3">
      <label className="block px-3 pb-1 text-[11px] tracking-[0.15em] text-ink-soft">SHOWING</label>
      <select
        value={workspace}
        onChange={(e) => setWorkspace(e.target.value)}
        className="w-full rounded-xs border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
      >
        <option value="">All my events</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
