import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

interface Step {
  key: string
  label: string
}

export function ProgressSteps({ steps, currentIndex }: { steps: Step[]; currentIndex: number }) {
  return (
    <nav aria-label="Creation progress" className="w-full overflow-x-auto">
      <ol className="flex min-w-max items-center gap-1 sm:gap-2">
        {steps.map((step, i) => {
          const isComplete = i < currentIndex
          const isCurrent = i === currentIndex
          return (
            <li key={step.key} className="flex items-center gap-1 sm:gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors',
                    isComplete && 'border-gold bg-gold text-ivory',
                    isCurrent && 'border-ink bg-ink text-ivory',
                    !isComplete && !isCurrent && 'border-ink/20 text-ink-soft/60'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isComplete ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    'hidden text-xs sm:inline',
                    (isCurrent || isComplete) ? 'text-ink' : 'text-ink-soft/50'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && <div className="h-px w-4 bg-ink/15 sm:w-8" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
