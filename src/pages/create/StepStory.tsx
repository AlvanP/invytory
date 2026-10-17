import { useWizard } from '@/hooks/useWizard'
import { Textarea } from '@/components/ui/Textarea'
import { AiAssist } from '@/components/wizard/AiAssist'
import { getWizardCopy } from '@/templates/events'
import { WizardStepShell } from './WizardStepShell'

/** Step 4: the writing. The three boxes mean different things for each kind of event. */
export function StepStory() {
  const { draft, updateDraft } = useWizard()
  const copy = getWizardCopy(draft.eventType)
  // AI Assist writes wedding wording, so it only appears for weddings.
  const ai = draft.eventType === 'wedding'

  return (
    <WizardStepShell
      eyebrow="Step 4 of 7"
      title={copy.storyTitle}
      description={copy.storyDescription}
      backTo="/create/ceremonies"
      nextTo="/create/photos"
      skippable
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Textarea
            label={copy.storyMain.label}
            optional
            value={draft.loveStory ?? ''}
            onChange={(e) => updateDraft({ loveStory: e.target.value })}
            placeholder={copy.storyMain.placeholder}
          />
          {ai && <AiAssist field="loveStory" currentValue={draft.loveStory} onUse={(text) => updateDraft({ loveStory: text })} />}
        </div>
        <div className="flex flex-col gap-2">
          <Textarea
            label={copy.storySecond.label}
            optional
            value={draft.howWeMet ?? ''}
            onChange={(e) => updateDraft({ howWeMet: e.target.value })}
            placeholder={copy.storySecond.placeholder}
          />
          {ai && <AiAssist field="howWeMet" currentValue={draft.howWeMet} onUse={(text) => updateDraft({ howWeMet: text })} />}
        </div>
        <div className="flex flex-col gap-2">
          <Textarea
            label={copy.storyThird.label}
            optional
            value={draft.vows ?? ''}
            onChange={(e) => updateDraft({ vows: e.target.value })}
            placeholder={copy.storyThird.placeholder}
          />
          {ai && <AiAssist field="vows" currentValue={draft.vows} onUse={(text) => updateDraft({ vows: text })} />}
        </div>
      </div>
    </WizardStepShell>
  )
}
