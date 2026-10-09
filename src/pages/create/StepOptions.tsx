import { useState } from 'react'
import { useWizard } from '@/hooks/useWizard'
import { ceremonyDisplayName } from '@/types'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { CeremonyTabs } from '@/components/wizard/CeremonyTabs'
import { WizardStepShell } from './WizardStepShell'

export function StepOptions() {
  const { draft, updateDraft, updateCeremony } = useWizard()
  const [activeId, setActiveId] = useState(draft.ceremonies[0].id)
  const active = draft.ceremonies.find((c) => c.id === activeId) ?? draft.ceremonies[0]
  const multiple = draft.ceremonies.length > 1

  return (
    <WizardStepShell
      eyebrow="Step 6 of 7"
      title="A few extra details"
      description="All optional — add what feels useful to your guests."
      backTo="/create/photos"
      nextTo="/create/preview"
      skippable
    >
      <div className="flex flex-col gap-5">
        <Input
          label="Wedding hashtag"
          optional
          value={draft.weddingHashtag ?? ''}
          onChange={(e) => updateDraft({ weddingHashtag: e.target.value })}
          placeholder="#AdaAndMichael2027"
        />
        <Textarea
          label="Gift information"
          optional
          value={draft.giftInformation ?? ''}
          onChange={(e) => updateDraft({ giftInformation: e.target.value })}
          placeholder="Registry details or a note about gifts"
        />
        <Textarea
          label="Additional message"
          optional
          value={draft.additionalMessage ?? ''}
          onChange={(e) => updateDraft({ additionalMessage: e.target.value })}
          placeholder="Anything else your guests should know"
        />

        <div className="flex flex-col gap-3 border-t border-ink/10 pt-5">
          <CeremonyTabs ceremonies={draft.ceremonies} activeId={active.id} onChange={setActiveId} />
          <Input
            key={active.id}
            label={multiple ? `RSVP message — ${ceremonyDisplayName(active)}` : 'Custom RSVP message'}
            optional
            value={active.customRsvpMessage ?? ''}
            onChange={(e) => updateCeremony(active.id, { customRsvpMessage: e.target.value })}
            placeholder="Kindly respond by..."
          />
          {multiple && (
            <p className="text-xs text-ink-soft/70">
              Each ceremony can have its own RSVP message, such as a different reply-by date.
            </p>
          )}
        </div>
      </div>
    </WizardStepShell>
  )
}
