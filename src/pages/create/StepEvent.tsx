import { useWizard } from '@/hooks/useWizard'
import { Input } from '@/components/ui/Input'
import { WizardStepShell } from './WizardStepShell'

export function StepEvent() {
  const { draft, updateDraft } = useWizard()

  return (
    <WizardStepShell
      eyebrow="Step 3 of 7"
      title="Wedding details"
      backTo="/create/couple"
      nextTo="/create/story"
      onNext={() => !!draft.weddingDate && !!draft.venueName}
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          label="Wedding date"
          type="date"
          value={draft.weddingDate ?? ''}
          onChange={(e) => updateDraft({ weddingDate: e.target.value })}
          required
        />
        <Input
          label="Wedding time"
          type="time"
          value={draft.weddingTime ?? ''}
          onChange={(e) => updateDraft({ weddingTime: e.target.value })}
          optional
        />
        <Input
          label="Venue name"
          className="sm:col-span-2"
          value={draft.venueName ?? ''}
          onChange={(e) => updateDraft({ venueName: e.target.value })}
          placeholder="e.g. The Terrace at Harborview"
          required
        />
        <Input
          label="Venue address"
          className="sm:col-span-2"
          value={draft.venueAddress ?? ''}
          onChange={(e) => updateDraft({ venueAddress: e.target.value })}
          optional
        />
        <Input
          label="City"
          value={draft.city ?? ''}
          onChange={(e) => updateDraft({ city: e.target.value })}
          optional
        />
        <Input
          label="State"
          value={draft.state ?? ''}
          onChange={(e) => updateDraft({ state: e.target.value })}
          optional
        />
        <Input
          label="Country"
          value={draft.country ?? ''}
          onChange={(e) => updateDraft({ country: e.target.value })}
          optional
        />
        <Input
          label="Dress code"
          value={draft.dressCode ?? ''}
          onChange={(e) => updateDraft({ dressCode: e.target.value })}
          optional
        />
        <Input
          label="Google Maps URL"
          className="sm:col-span-2"
          value={draft.mapUrl ?? ''}
          onChange={(e) => updateDraft({ mapUrl: e.target.value })}
          optional
          placeholder="https://maps.google.com/..."
        />
        <Input
          label="Reception information"
          className="sm:col-span-2"
          value={draft.receptionInfo ?? ''}
          onChange={(e) => updateDraft({ receptionInfo: e.target.value })}
          optional
        />
      </div>
    </WizardStepShell>
  )
}
