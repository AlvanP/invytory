import { useWizard } from '@/hooks/useWizard'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { WizardStepShell } from './WizardStepShell'

export function StepOptions() {
  const { draft, updateDraft } = useWizard()

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
        <Input
          label="Custom RSVP message"
          optional
          value={draft.customRsvpMessage ?? ''}
          onChange={(e) => updateDraft({ customRsvpMessage: e.target.value })}
          placeholder="Kindly respond by..."
        />
      </div>
    </WizardStepShell>
  )
}
