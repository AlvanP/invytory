import { useState } from 'react'
import { useWizard } from '@/hooks/useWizard'
import { Input } from '@/components/ui/Input'
import { getWizardCopy, childNames, joinChildNames } from '@/templates/events'
import { WizardStepShell } from './WizardStepShell'

/** Step 2: the names. A wedding has two; every other event has one. */
export function StepCouple() {
  const { draft, updateDraft } = useWizard()
  const copy = getWizardCopy(draft.eventType)
  const isWedding = draft.eventType === 'wedding'
  const isChild = draft.eventType === 'child-dedication'

  // Twins, triplets: one box per child, saved together as "Ada, Ben & Chi".
  const saved = childNames(draft.brideName)
  const [count, setCount] = useState(Math.min(3, Math.max(1, saved.length)))
  const [kids, setKids] = useState<string[]>([saved[0] ?? '', saved[1] ?? '', saved[2] ?? ''])
  function setKid(i: number, value: string) {
    const next = kids.map((k, j) => (j === i ? value : k))
    setKids(next)
    updateDraft({ brideName: joinChildNames(next.slice(0, count)) })
  }
  function chooseCount(n: number) {
    setCount(n)
    updateDraft({ brideName: joinChildNames(kids.slice(0, n)) })
  }

  return (
    <WizardStepShell
      eyebrow="Step 2 of 7"
      title={copy.nameTitle}
      backTo="/create"
      nextTo="/create/ceremonies"
      onNext={() => !!draft.brideName?.trim() && (!isWedding || !!draft.groomName?.trim())}
    >
      <div className="flex flex-col gap-5">
        {isChild ? (
          <>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink-soft">How many children?</span>
              <div className="flex gap-2">
                {[
                  [1, 'One child'],
                  [2, 'Twins'],
                  [3, 'Triplets'],
                ].map(([n, label]) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => chooseCount(n as number)}
                    aria-pressed={count === n}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${count === n ? 'border-wine bg-wine text-ivory' : 'border-wine/25 text-wine hover:border-wine'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {Array.from({ length: count }).map((_, i) => (
              <Input
                key={i}
                label={count === 1 ? copy.firstLabel : `Child ${i + 1}’s name`}
                value={kids[i]}
                onChange={(e) => setKid(i, e.target.value)}
                placeholder={i === 0 ? copy.firstPlaceholder : 'e.g. Baby Zane'}
                required={i === 0}
              />
            ))}
          </>
        ) : (
          <Input
            label={copy.firstLabel}
            value={draft.brideName ?? ''}
            onChange={(e) => updateDraft({ brideName: e.target.value })}
            placeholder={copy.firstPlaceholder}
            required
          />
        )}
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
            {(count > 1 ? ['Twins of ', 'Children of ', 'Sons of ', 'Daughters of '] : ['Son of ', 'Daughter of ', 'Children of ']).map((start) => (
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
