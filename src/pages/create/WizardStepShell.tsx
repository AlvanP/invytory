import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useWizard } from '@/hooks/useWizard'

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
  const { uploading } = useWizard()

  function handleNext() {
    if (uploading) return
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

      {uploading && (
        <p role="status" className="flex items-center gap-2 text-sm text-ink-soft">
          <Loader2 className="size-4 animate-spin text-gold" /> Finishing your upload. Please keep this page open.
        </p>
      )}

      <div className="flex items-center justify-between border-t border-ink/10 pt-6">
        {backTo ? (
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="size-4" />} onClick={() => navigate(backTo)} disabled={uploading}>
            Back
          </Button>
        ) : <span />}

        <div className="flex items-center gap-3">
          {skippable && (
            <button type="button" disabled={uploading} onClick={() => navigate(nextTo)} className="text-sm text-ink-soft hover:text-ink disabled:opacity-50">
              Skip for now
            </button>
          )}
          <Button size="sm" onClick={handleNext} disabled={uploading}>
            {nextLabel}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
