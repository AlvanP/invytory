import { useState } from 'react'
import { useWizard } from '@/hooks/useWizard'
import { ceremonyDisplayName } from '@/types'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { AiAssist } from '@/components/wizard/AiAssist'
import { CeremonyTabs } from '@/components/wizard/CeremonyTabs'
import { getWizardCopy, AI_ASSIST_EVENTS } from '@/templates/events'
import { WizardStepShell } from './WizardStepShell'

export function StepOptions() {
  const { draft, updateDraft, updateCeremony } = useWizard()
  const [activeId, setActiveId] = useState(draft.ceremonies[0].id)
  const active = draft.ceremonies.find((c) => c.id === activeId) ?? draft.ceremonies[0]
  const multiple = draft.ceremonies.length > 1
  const copy = getWizardCopy(draft.eventType)
  const ai = AI_ASSIST_EVENTS.includes(draft.eventType)

  return (
    <WizardStepShell
      eyebrow="Step 6 of 7"
      title="A few extra details"
      description={ai ? 'All optional. Add what feels useful to your guests. AI Assist can help with the wording.' : 'All optional. Add what feels useful to your guests.'}
      backTo="/create/photos"
      nextTo="/create/preview"
      skippable
    >
      <div className="flex flex-col gap-6">
        {copy.hashtag && (
          <div className="flex flex-col gap-2">
            <Input
              label={copy.hashtag.label}
              optional
              value={draft.weddingHashtag ?? ''}
              onChange={(e) => updateDraft({ weddingHashtag: e.target.value })}
              placeholder={copy.hashtag.placeholder}
            />
            {ai && (
              <AiAssist
                field="hashtag"
                currentValue={draft.weddingHashtag}
                onUse={(text) => updateDraft({ weddingHashtag: text })}
              />
            )}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Textarea
            label={copy.gift.label}
            optional
            value={draft.giftInformation ?? ''}
            onChange={(e) => updateDraft({ giftInformation: e.target.value })}
            placeholder={copy.gift.placeholder}
          />
          {ai && (
            <AiAssist
              field="giftInformation"
              currentValue={draft.giftInformation}
              onUse={(text) => updateDraft({ giftInformation: text })}
            />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Textarea
            label="Additional message"
            optional
            value={draft.additionalMessage ?? ''}
            onChange={(e) => updateDraft({ additionalMessage: e.target.value })}
            placeholder="Anything else your guests should know"
          />
          {ai && (
            <AiAssist
              field="additionalMessage"
              currentValue={draft.additionalMessage}
              onUse={(text) => updateDraft({ additionalMessage: text })}
            />
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-ink/10 pt-5">
          <CeremonyTabs ceremonies={draft.ceremonies} activeId={active.id} onChange={setActiveId} />
          <Input
            key={active.id}
            label={multiple ? `RSVP message: ${ceremonyDisplayName(active)}` : 'Custom RSVP message'}
            optional
            value={active.customRsvpMessage ?? ''}
            onChange={(e) => updateCeremony(active.id, { customRsvpMessage: e.target.value })}
            placeholder="Kindly respond by..."
          />
          {/* Keyed by ceremony so switching tabs starts a fresh panel. */}
          {ai && (
            <AiAssist
              key={`rsvp-${active.id}`}
              field="rsvpMessage"
              onlyCeremonyId={active.id}
              currentValue={active.customRsvpMessage}
              onUse={(text) => updateCeremony(active.id, { customRsvpMessage: text })}
            />
          )}
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
