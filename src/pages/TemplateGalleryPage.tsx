import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { InvitationTemplate } from '@/types'
import { templateService } from '@/services/templateService'
import { TemplateCard } from '@/components/templates/TemplateCard'
import { CollectionTabs, type CollectionFilter } from '@/components/templates/CollectionTabs'
import { TemplateCardSkeleton } from '@/components/ui/Skeleton'
import { eventCopy, EVENT_KINDS, type EventKind } from '@/templates/events'
import { cn } from '@/utils/cn'

export function TemplateGalleryPage() {
  const [templates, setTemplates] = useState<InvitationTemplate[] | null>(null)
  const [params, setParams] = useSearchParams()
  const [collection, setCollection] = useState<CollectionFilter>(null)

  const asked = params.get('category')
  const kind: EventKind = EVENT_KINDS.includes(asked as EventKind) ? (asked as EventKind) : 'wedding'

  useEffect(() => {
    templateService.listAll().then(setTemplates)
  }, [])

  const ofKind = templates?.filter((t) => t.category === kind) ?? null
  const visible = ofKind && kind === 'wedding' && collection ? ofKind.filter((t) => t.collection === collection) : ofKind

  return (
    <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
      <h1 className="max-w-xl font-brand text-5xl leading-tight text-wine sm:text-6xl">Templates</h1>
      <p className="mt-3 max-w-md text-base text-ink-soft">Every design is made for its event, with the right sections and the right words. Open one to scroll through it.</p>

      <div role="tablist" aria-label="Event types" className="mt-8 flex flex-wrap gap-2">
        {EVENT_KINDS.map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={k === kind}
            onClick={() => {
              setParams(k === 'wedding' ? {} : { category: k })
              setCollection(null)
            }}
            className={cn(
              'rounded-full border px-5 py-2 text-sm transition-colors',
              k === kind ? 'border-wine bg-wine text-ivory' : 'border-wine/25 text-wine hover:border-wine'
            )}
          >
            {eventCopy[k].plural}
          </button>
        ))}
      </div>

      {kind === 'wedding' && (
        <div className="mt-4">
          <CollectionTabs value={collection} onChange={setCollection} />
        </div>
      )}

      <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {!visible
          ? Array.from({ length: 6 }).map((_, i) => <TemplateCardSkeleton key={i} />)
          : visible.map((t) => <TemplateCard key={t.id} template={t} />)}
      </div>

      {visible && visible.length === 0 && <p className="mt-10 text-sm text-ink-soft">No designs here yet.</p>}
    </div>
  )
}
