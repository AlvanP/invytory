import { useState } from 'react'
import { Plus, Pencil, Trash2, MapPin, Calendar } from 'lucide-react'
import { useWizard } from '@/hooks/useWizard'
import type { CeremonyDraft } from '@/types'
import { ceremonyDisplayName } from '@/types'
import { formatDate, formatTime } from '@/utils/format'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { CeremonyFormFields } from '@/components/wizard/CeremonyForm'
import { WizardStepShell } from './WizardStepShell'

function makeCeremonyId(): string {
  return `c_${Math.random().toString(36).slice(2, 9)}`
}

function blankCeremony(): CeremonyDraft {
  return { id: makeCeremonyId(), ceremonyType: 'white' }
}

export function StepCeremonies() {
  const { draft, addCeremony, updateCeremony, removeCeremony } = useWizard()
  const [editing, setEditing] = useState<CeremonyDraft | null>(null)
  const [isNew, setIsNew] = useState(false)

  const allComplete = draft.ceremonies.every((c) => !!c.weddingDate && !!c.venueName)

  function openAdd() {
    setEditing(blankCeremony())
    setIsNew(true)
  }

  function openEdit(ceremony: CeremonyDraft) {
    setEditing({ ...ceremony })
    setIsNew(false)
  }

  function handleSave() {
    if (!editing) return
    if (isNew) {
      addCeremony(editing)
    } else {
      updateCeremony(editing.id, editing)
    }
    setEditing(null)
  }

  return (
    <WizardStepShell
      eyebrow="Step 3 of 7"
      title="Ceremonies"
      description="Add every ceremony that's part of this wedding — they can be on the same day or months apart, each with its own date and venue."
      backTo="/create/couple"
      nextTo="/create/story"
      onNext={() => allComplete}
    >
      <div className="flex flex-col gap-4">
        {draft.ceremonies.map((ceremony) => (
          <div key={ceremony.id} className="flex flex-col gap-3 rounded-md border border-ink/10 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg text-ink">{ceremonyDisplayName(ceremony)}</p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {ceremony.weddingDate
                    ? `${formatDate(ceremony.weddingDate)}${ceremony.weddingTime ? ` · ${formatTime(ceremony.weddingTime)}` : ''}`
                    : 'Date not set'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {ceremony.venueName || 'Venue not set'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" icon={<Pencil className="size-3.5" />} onClick={() => openEdit(ceremony)}>
                Edit
              </Button>
              {draft.ceremonies.length > 1 && (
                <Button variant="ghost" size="sm" icon={<Trash2 className="size-3.5" />} onClick={() => removeCeremony(ceremony.id)}>
                  Remove
                </Button>
              )}
            </div>
          </div>
        ))}

        <Button variant="outline" size="sm" icon={<Plus className="size-4" />} onClick={openAdd} className="w-fit">
          Add Another Ceremony
        </Button>

        {!allComplete && (
          <p className="text-xs text-ink-soft/70">Give each ceremony at least a date and venue to continue.</p>
        )}
      </div>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title={isNew ? 'Add a ceremony' : 'Edit ceremony'}>
        {editing && (
          <div className="flex flex-col gap-5">
            <CeremonyFormFields value={editing} onChange={(patch) => setEditing({ ...editing, ...patch })} />
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!editing.weddingDate || !editing.venueName}
            >
              {isNew ? 'Add Ceremony' : 'Save Changes'}
            </Button>
          </div>
        )}
      </Modal>
    </WizardStepShell>
  )
}