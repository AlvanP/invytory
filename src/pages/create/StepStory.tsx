import { useWizard } from '@/hooks/useWizard'
import { Textarea } from '@/components/ui/Textarea'
import { AiAssist } from '@/components/wizard/AiAssist'
import { WizardStepShell } from './WizardStepShell'

export function StepStory() {
  const { draft, updateDraft } = useWizard()

  return (
    <WizardStepShell
      eyebrow="Step 4 of 7"
      title="Your story"
      description="Entirely optional — skip this step if you'd rather keep things simple. Not sure what to write? Try AI Assist under each box."
      backTo="/create/ceremonies"
      nextTo="/create/photos"
      skippable
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Textarea
            label="Our story"
            optional
            value={draft.loveStory ?? ''}
            onChange={(e) => updateDraft({ loveStory: e.target.value })}
            placeholder="Share the story of your relationship..."
          />
          <AiAssist field="loveStory" currentValue={draft.loveStory} onUse={(text) => updateDraft({ loveStory: text })} />
        </div>
        <div className="flex flex-col gap-2">
          <Textarea
            label="How we met"
            optional
            value={draft.howWeMet ?? ''}
            onChange={(e) => updateDraft({ howWeMet: e.target.value })}
            placeholder="Where and how did you two meet?"
          />
          <AiAssist field="howWeMet" currentValue={draft.howWeMet} onUse={(text) => updateDraft({ howWeMet: text })} />
        </div>
        <div className="flex flex-col gap-2">
          <Textarea
            label="Vows"
            optional
            value={draft.vows ?? ''}
            onChange={(e) => updateDraft({ vows: e.target.value })}
            placeholder="Share a line from your vows, if you'd like."
          />
          <AiAssist field="vows" currentValue={draft.vows} onUse={(text) => updateDraft({ vows: text })} />
        </div>
      </div>
    </WizardStepShell>
  )
}
