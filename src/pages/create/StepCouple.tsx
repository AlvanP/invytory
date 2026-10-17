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
        {draft.eventType === 'child-dedication' && !draft.tagline?.trim() && (
          <div className="-mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
            Start with:
            {['Son of ', 'Daughter of ', 'Children of '].map((start) => (
              <button
                key={start}
                type="button"
                onClick={() => updateDraft({ tagline: start })}
                className="rounded-full border border-wine/25 px-3 py-1 text-wine hover:border-wine"
              >
                {start.trim()}
              </button>
            ))}
          </div>
        )}
      </div>
    </WizardStepShell>
  )
}
