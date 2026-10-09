import { useEffect, useState } from 'react'
import type { CeremonyDraft, InvitationTemplate } from '@/types'
import { CEREMONY_TYPE_LABELS } from '@/types'
import { templateService } from '@/services/templateService'
import { collectionForCeremonyType, groupTemplates, COLLECTION_LABELS } from '@/utils/templateCollections'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { TemplatePreviewPlaceholder } from '@/components/ui/Placeholder'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

export function CeremonyFormFields({
  value,
  onChange,
}: {
  value: CeremonyDraft
  onChange: (patch: Partial<CeremonyDraft>) => void
}) {
  const [templates, setTemplates] = useState<InvitationTemplate[] | null>(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    templateService.list().then(setTemplates)
  }, [])

  // Which collection this ceremony type browses first. Custom Traditional
  // has none, so it simply shows every design.
  const collection = collectionForCeremonyType(value.ceremonyType)
  const groups = templates ? groupTemplates(templates, collection, showAll) : null

  // A template the couple already chose is never hidden by the filter:
  // if it sits outside the visible groups, pin it at the top.
  let pinned: InvitationTemplate | undefined
  if (groups && templates && value.templateId) {
    const visible = [...groups.primary, ...groups.universal, ...groups.others]
    if (!visible.some((t) => t.id === value.templateId)) {
      pinned = templates.find((t) => t.id === value.templateId)
    }
  }

  function renderCard(t: InvitationTemplate) {
    const selected = value.templateId === t.id
    return (
      <button
        key={t.id}
        type="button"
        onClick={() => onChange({ templateId: t.id })}
        className={cn(
          'flex flex-col gap-1 rounded-sm p-1 text-left transition-all',
          selected ? 'ring-2 ring-gold' : 'ring-1 ring-ink/10 hover:ring-ink/30'
        )}
      >
        <TemplatePreviewPlaceholder tone={t.previewTone} />
        <div className="flex items-center gap-1 px-0.5">
          <span className="truncate text-[11px] text-ink">{t.name}</span>
          {t.isPremium && <Badge tone="premium">Pro</Badge>}
        </div>
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-ink-soft">Template for this ceremony</p>
          {collection && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="text-xs text-ink-soft underline-offset-2 hover:text-ink hover:underline"
            >
              {showAll ? `Show only ${COLLECTION_LABELS[collection]} designs` : 'Show all designs'}
            </button>
          )}
        </div>

        {collection && (
          <p className="text-xs text-ink-soft/70">
            {showAll
              ? 'Showing every collection.'
              : `Showing ${COLLECTION_LABELS[collection]} designs first.`}
          </p>
        )}

        {pinned && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] tracking-[0.15em] text-ink-soft">CURRENTLY CHOSEN</p>
            <div className="grid grid-cols-3 gap-3">{renderCard(pinned)}</div>
          </div>
        )}

        {groups && groups.primary.length > 0 && (
          <div className="grid grid-cols-3 gap-3">{groups.primary.map(renderCard)}</div>
        )}

        {groups && groups.universal.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] tracking-[0.15em] text-ink-soft">WORKS WITH ANY CEREMONY</p>
            <div className="grid grid-cols-3 gap-3">{groups.universal.map(renderCard)}</div>
          </div>
        )}

        {groups && groups.others.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] tracking-[0.15em] text-ink-soft">OTHER COLLECTIONS</p>
            <div className="grid grid-cols-3 gap-3">{groups.others.map(renderCard)}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Ceremony type"
          className="sm:col-span-2"
          value={value.ceremonyType}
          onChange={(e) => {
            setShowAll(false)
            onChange({ ceremonyType: e.target.value as CeremonyDraft['ceremonyType'] })
          }}
        >
          {Object.entries(CEREMONY_TYPE_LABELS).map(([v, label]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </Select>

        {value.ceremonyType === 'custom' && (
          <Input
            label="Ceremony name"
            className="sm:col-span-2"
            value={value.ceremonyLabel ?? ''}
            onChange={(e) => onChange({ ceremonyLabel: e.target.value })}
            placeholder="e.g. Edo Traditional Wedding"
          />
        )}

        <Input
          label="Date"
          type="date"
          value={value.weddingDate ?? ''}
          onChange={(e) => onChange({ weddingDate: e.target.value })}
          required
        />
        <Input
          label="Time"
          type="time"
          optional
          value={value.weddingTime ?? ''}
          onChange={(e) => onChange({ weddingTime: e.target.value })}
        />
        <Input
          label="Venue name"
          className="sm:col-span-2"
          value={value.venueName ?? ''}
          onChange={(e) => onChange({ venueName: e.target.value })}
          required
        />
        <Input
          label="Venue address"
          className="sm:col-span-2"
          optional
          value={value.venueAddress ?? ''}
          onChange={(e) => onChange({ venueAddress: e.target.value })}
        />
        <Input
          label="City"
          optional
          value={value.city ?? ''}
          onChange={(e) => onChange({ city: e.target.value })}
        />
        <Input
          label="State"
          optional
          value={value.state ?? ''}
          onChange={(e) => onChange({ state: e.target.value })}
        />
        <Input
          label="Dress code"
          optional
          value={value.dressCode ?? ''}
          onChange={(e) => onChange({ dressCode: e.target.value })}
        />
        <Input
          label="Reception info"
          optional
          value={value.receptionInfo ?? ''}
          onChange={(e) => onChange({ receptionInfo: e.target.value })}
        />
      </div>
    </div>
  )
}
