import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import type { InvitationTemplate } from '@/types'
import { templateService } from '@/services/templateService'
import { useWizard } from '@/hooks/useWizard'
import { TemplatePreviewPlaceholder } from '@/components/ui/Placeholder'
import { Badge } from '@/components/ui/Badge'
import { TemplateCardSkeleton } from '@/components/ui/Skeleton'
import { WizardStepShell } from './WizardStepShell'
import { cn } from '@/utils/cn'

export function StepTemplate() {
  const { draft, updateDraft } = useWizard()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<InvitationTemplate[] | null>(null)

  useEffect(() => {
    templateService.list().then(setTemplates)
  }, [])

  useEffect(() => {
    const preselected = params.get('template')
    // Arriving with a template already chosen (e.g. "Use Template" from
    // the gallery) — skip the picker entirely and go straight into the
    // form flow, rather than making them see and re-confirm the same
    // six templates they just picked from.
    if (preselected && !draft.templateId) {
      updateDraft({ templateId: preselected })
      navigate('/create/couple')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  return (
    <WizardStepShell
      eyebrow="Step 1 of 7"
      title="Choose a template"
      description="Pick a starting point — you can change this later without losing your details."
      nextTo="/create/couple"
      onNext={() => !!draft.templateId}
    >
      {!templates ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <TemplateCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {templates.map((t) => {
            const selected = draft.templateId === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => updateDraft({ templateId: t.id })}
                className={cn(
                  'flex flex-col gap-2 rounded-md p-2 text-left transition-all',
                  selected ? 'ring-2 ring-gold' : 'ring-1 ring-ink/10 hover:ring-ink/30'
                )}
              >
                <TemplatePreviewPlaceholder tone={t.previewTone} />
                <div className="flex items-center justify-between px-1 pb-1">
                  <span className="text-sm font-medium text-ink">{t.name}</span>
                  {t.isPremium && <Badge tone="premium">Premium</Badge>}
                </div>
              </button>
            )
          })}
        </div>
      )}
      {!draft.templateId && (
        <p className="text-xs text-ink-soft/70">Select a template above to continue.</p>
      )}
    </WizardStepShell>
  )
}