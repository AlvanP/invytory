import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function WizardStepShell({
  eyebrow,
  title,
  description,
  children,
  backTo,
  nextTo,
  onNext,
  nextLabel = 'Continue',
  skippable,
}: {
  eyebrow: string
  title: string
  description?: string
  children: ReactNode
  backTo?: string
  nextTo: string
  onNext?: () => boolean | void
  nextLabel?: string
  skippable?: boolean
}) {
  const navigate = useNavigate()

  function handleNext() {
    const result = onNext?.()
    if (result === false) return
    navigate(nextTo)
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs tracking-[0.2em] text-gold">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl text-ink">{title}</h1>
        {description && <p className="mt-2 text-sm text-ink-soft">{description}</p>}
      </div>

      {children}

      <div className="flex items-center justify-between border-t border-ink/10 pt-6">
        {backTo ? (
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="size-4" />} onClick={() => navigate(backTo)}>
            Back
          </Button>
        ) : <span />}

        <div className="flex items-center gap-3">
          {skippable && (
            <button type="button" onClick={() => navigate(nextTo)} className="text-sm text-ink-soft hover:text-ink">
              Skip for now
            </button>
          )}
          <Button size="sm" onClick={handleNext}>
            {nextLabel}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
