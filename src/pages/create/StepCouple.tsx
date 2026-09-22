import { useWizard } from '@/hooks/useWizard'
import { Input } from '@/components/ui/Input'
import { WizardStepShell } from './WizardStepShell'

export function StepCouple() {
  const { draft, updateDraft } = useWizard()

  return (
    <WizardStepShell
      eyebrow="Step 2 of 7"
      title="Tell us about the couple"
      backTo="/create"
      nextTo="/create/ceremonies"
      onNext={() => !!draft.brideName && !!draft.groomName}
    >
      <div className="flex flex-col gap-5">
        <Input
          label="Bride's name"
          value={draft.brideName ?? ''}
          onChange={(e) => updateDraft({ brideName: e.target.value })}
          placeholder="e.g. Ada"
          required
        />
        <Input
          label="Groom's name"
          value={draft.groomName ?? ''}
          onChange={(e) => updateDraft({ groomName: e.target.value })}
          placeholder="e.g. Michael"
          required
        />
        <Input
          label="Short phrase"
          optional
          value={draft.tagline ?? ''}
          onChange={(e) => updateDraft({ tagline: e.target.value })}
          placeholder="Together with their families"
          hint="Appears just above your names on the invitation."
        />
      </div>
    </WizardStepShell>
  )
}
