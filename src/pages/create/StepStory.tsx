import { useWizard } from '@/hooks/useWizard'
import { Textarea } from '@/components/ui/Textarea'
import { WizardStepShell } from './WizardStepShell'

export function StepStory() {
  const { draft, updateDraft } = useWizard()

  return (
    <WizardStepShell
      eyebrow="Step 4 of 7"
      title="Your story"
      description="Entirely optional — skip this step if you'd rather keep things simple."
      backTo="/create/event"
      nextTo="/create/photos"
      skippable
    >
      <div className="flex flex-col gap-5">
        <Textarea
          label="Our story"
          optional
          value={draft.loveStory ?? ''}
          onChange={(e) => updateDraft({ loveStory: e.target.value })}
          placeholder="Share the story of your relationship..."
        />
        <Textarea
          label="How we met"
          optional
          value={draft.howWeMet ?? ''}
          onChange={(e) => updateDraft({ howWeMet: e.target.value })}
          placeholder="Where and how did you two meet?"
        />
        <Textarea
          label="Vows"
          optional
          value={draft.vows ?? ''}
          onChange={(e) => updateDraft({ vows: e.target.value })}
          placeholder="Share a line from your vows, if you'd like."
        />
      </div>
    </WizardStepShell>
  )
}
