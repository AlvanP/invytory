import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import type { InvitationTemplate } from '@/types'
import { templateService } from '@/services/templateService'
import { getTemplateById } from '@/data/templates'
import { useWizard } from '@/hooks/useWizard'
import { TemplatePreviewPlaceholder } from '@/components/ui/Placeholder'
import { Badge } from '@/components/ui/Badge'
import { TemplateCardSkeleton } from '@/components/ui/Skeleton'
import { CollectionTabs, type CollectionFilter } from '@/components/templates/CollectionTabs'
import { ceremonyTypeForCollection, groupTemplates } from '@/utils/templateCollections'
import { WizardStepShell } from './WizardStepShell'
import { cn } from '@/utils/cn'
import { eventCopy, EVENT_KINDS, type EventKind } from '@/templates/events'

export function StepTemplate() {
  const { draft, updateDraft, updateCeremony } = useWizard()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<InvitationTemplate[] | null>(null)
  const [filter, setFilter] = useState<CollectionFilter>(null)
  const askedEvent = params.get('event')
  const [kind, setKind] = useState<EventKind>(
    EVENT_KINDS.includes(askedEvent as EventKind) ? (askedEvent as EventKind) : draft.eventType
  )

  useEffect(() => {
    templateService.listAll().then(setTemplates)
  }, [])

  /**
   * Picking a design here sets the wedding's starting template. If the
   * wedding still has just one ceremony, that ceremony also takes the
   * template, and takes the ceremony type the design's collection
   * implies (an Igbo design makes the first ceremony Igbo Traditional).
   * With several ceremonies already set up, we only change the default
   * so nothing the couple already chose is overwritten.
   */
  function applyTemplate(template: InvitationTemplate) {
    const eventType = template.category as EventKind
    if (eventType !== 'wedding') {
      // Every other kind of event is a single occasion: one date, one place, one design.
      updateDraft({
        templateId: template.id,
        eventType,
        ceremonies: draft.ceremonies.slice(0, 1).map((c) => ({ ...c, templateId: template.id, ceremonyType: 'custom' as const })),
      })
      return
    }
    updateDraft({ templateId: template.id, eventType })
    if (draft.eventType !== 'wedding') {
      // Coming back to a wedding from another event: the first ceremony is a wedding ceremony again.
      updateCeremony(draft.ceremonies[0].id, { templateId: template.id, ceremonyType: ceremonyTypeForCollection(template.collection) ?? 'white' })
    } else if (draft.ceremonies.length === 1) {
      const first = draft.ceremonies[0]
      const impliedType = ceremonyTypeForCollection(template.collection)
      updateCeremony(first.id, {
        templateId: template.id,
        ...(impliedType ? { ceremonyType: impliedType } : {}),
      })
    }
  }

  useEffect(() => {
    const preselected = params.get('template')
    // Arriving with a template already chosen (e.g. "Use Template" from
    // the gallery) — skip the picker entirely and go straight into the
    // form flow, rather than making them see and re-confirm the same
    // templates they just picked from.
    if (preselected && !draft.templateId) {
      const template = getTemplateById(preselected)
      if (template) {
        applyTemplate(template)
      } else {
        updateDraft({ templateId: preselected })
      }
      navigate('/create/couple')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const ofKind = templates ? templates.filter((t) => t.category === kind) : null
  const groups = ofKind ? groupTemplates(ofKind, kind === 'wedding' ? filter : null) : null

  function renderCard(t: InvitationTemplate) {
    const selected = draft.templateId === t.id
    return (
      <button
        key={t.id}
        type="button"
        onClick={() => applyTemplate(t)}
        className={cn(
          'flex flex-col gap-2 rounded-md p-2 text-left transition-all',
          selected ? 'ring-2 ring-gold' : 'ring-1 ring-ink/10 hover:ring-ink/30'
        )}
      >
        <TemplatePreviewPlaceholder tone={t.previewTone} templateId={t.id} />
        <div className="flex items-center justify-between px-1 pb-1">
          <span className="text-sm font-medium text-ink">{t.name}</span>
          {t.isPremium && <Badge tone="premium">Premium</Badge>}
        </div>
      </button>
    )
  }

  return (
    <WizardStepShell
      eyebrow="Step 1 of 7"
      title="Choose a template"
      description={
        kind === 'wedding'
          ? 'Pick a starting point. Each ceremony can have its own design later, and you can change this without losing your details.'
          : 'Pick a design for your event. You can change it later without losing your details.'
      }
      nextTo="/create/couple"
      onNext={() => !!draft.templateId}
    >
      <div role="tablist" aria-label="Event types" className="flex flex-wrap gap-2">
        {EVENT_KINDS.map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={k === kind}
            onClick={() => {
              setKind(k)
              setFilter(null)
            }}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm transition-colors',
              k === kind ? 'border-wine bg-wine text-ivory' : 'border-wine/25 text-wine hover:border-wine'
            )}
          >
            {eventCopy[k].plural}
          </button>
        ))}
      </div>
      {kind === 'wedding' && <CollectionTabs value={filter} onChange={setFilter} />}

      {!groups ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <TemplateCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.primary.length > 0 && (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              {groups.primary.map(renderCard)}
            </div>
          )}

          {groups.universal.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs tracking-[0.15em] text-ink-soft">WORKS WITH ANY CEREMONY</p>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                {groups.universal.map(renderCard)}
              </div>
            </div>
          )}

          {groups.primary.length === 0 && groups.universal.length === 0 && (
            <p className="text-sm text-ink-soft">No designs in this collection yet.</p>
          )}
        </div>
      )}

      {!draft.templateId && (
        <p className="text-xs text-ink-soft/70">Select a template above to continue.</p>
      )}
    </WizardStepShell>
  )
}
