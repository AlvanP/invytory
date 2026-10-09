import { useEffect, useState } from 'react'
import type { InvitationTemplate } from '@/types'
import { templateService } from '@/services/templateService'
import { TemplateCard } from '@/components/templates/TemplateCard'
import { CollectionTabs, type CollectionFilter } from '@/components/templates/CollectionTabs'
import { TemplateCardSkeleton } from '@/components/ui/Skeleton'
import { groupTemplates } from '@/utils/templateCollections'

export function TemplateGalleryPage() {
  const [templates, setTemplates] = useState<InvitationTemplate[] | null>(null)
  const [filter, setFilter] = useState<CollectionFilter>(null)

  useEffect(() => {
    templateService.list().then(setTemplates)
  }, [])

  // A collection tab shows that collection's designs, then the designs
  // that suit any ceremony. "All" shows everything.
  const visible = templates
    ? (() => {
        const g = groupTemplates(templates, filter)
        return [...g.primary, ...g.universal]
      })()
    : null

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-xs tracking-[0.2em] text-gold">Templates</p>
      <h1 className="mt-2 font-display text-4xl text-ink">Wedding Invitation Templates</h1>
      <p className="mt-3 max-w-xl text-sm text-ink-soft">
        Starting points for every kind of ceremony, each with its own character. More arrive as our library grows.
      </p>

      <div className="mt-8">
        <CollectionTabs value={filter} onChange={setFilter} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {!visible
          ? Array.from({ length: 6 }).map((_, i) => <TemplateCardSkeleton key={i} />)
          : visible.map((t) => <TemplateCard key={t.id} template={t} />)}
      </div>

      {visible && visible.length === 0 && (
        <p className="mt-10 text-sm text-ink-soft">No designs in this collection yet.</p>
      )}
    </div>
  )
}
