import { useWizard } from '@/hooks/useWizard'
import { Input } from '@/components/ui/Input'
import { getWizardCopy } from '@/templates/events'
import { WizardStepShell } from './WizardStepShell'

/** Step 2: the names. A wedding has two; every other event has one. */
export function StepCouple() {
  const { draft, updateDraft } = useWizard()
  const copy = getWizardCopy(draft.eventType)
  const isWedding = draft.eventType === 'wedding'

  return (
    <WizardStepShell
      eyebrow="Step 2 of 7"
      title={copy.nameTitle}
      backTo="/create"
      nextTo="/create/ceremonies"
      onNext={() => !!draft.brideName?.trim() && (!isWedding || !!draft.groomName?.trim())}
    >
      <div className="flex flex-col gap-5">
        <Input
          label={copy.firstLabel}
          value={draft.brideName ?? ''}
          onChange={(e) => updateDraft({ brideName: e.target.value })}
          placeholder={copy.firstPlaceholder}
          required
        />
        {isWedding && (
          <Input
            label={copy.secondLabel ?? "Groom's name"}
            value={draft.groomName ?? ''}
            onChange={(e) => updateDraft({ groomName: e.target.value })}
            placeholder={copy.secondPlaceholder}
            required
          />
        )}
        <Input
          label={copy.taglineLabel}
          optional
          value={draft.tagline ?? ''}
          onChange={(e) => updateDraft({ tagline: e.target.value })}
          placeholder={copy.taglinePlaceholder}
          hint={copy.taglineHint}
        />
      </div>
    </WizardStepShell>
  )
}
