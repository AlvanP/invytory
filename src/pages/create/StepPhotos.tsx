import { Camera } from 'lucide-react'
import { useWizard } from '@/hooks/useWizard'
import { WizardStepShell } from './WizardStepShell'

const slots = [
  { key: 'hero', label: 'Hero image' },
  { key: 'g1', label: 'Gallery image 1' },
  { key: 'g2', label: 'Gallery image 2' },
  { key: 'g3', label: 'Gallery image 3' },
  { key: 'g4', label: 'Gallery image 4' },
]

export function StepPhotos() {
  useWizard() // reserved for wiring real uploads into the draft later

  return (
    <WizardStepShell
      eyebrow="Step 5 of 7"
      title="Photos"
      description="Real photo uploads arrive in a future version. For now, here's where they'll go."
      backTo="/create/story"
      nextTo="/create/options"
      skippable
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {slots.map((slot) => (
          <div
            key={slot.key}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-gold/40 bg-ivory-deep text-ink-soft"
          >
            <Camera className="size-5 opacity-50" strokeWidth={1.5} />
            <span className="px-3 text-center text-xs">{slot.label}</span>
            <span className="text-[10px] text-ink-soft/60">Photo will appear here</span>
          </div>
        ))}
      </div>
    </WizardStepShell>
  )
}
