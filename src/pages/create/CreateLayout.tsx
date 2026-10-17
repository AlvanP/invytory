import { Logo } from '@/components/brand/Logo'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { CreateWizardProvider } from '@/hooks/useWizard'
import { ProgressSteps } from '@/components/ui/ProgressSteps'
import { getWizardCopy } from '@/templates/events'
import { useWizard } from '@/hooks/useWizard'

const baseSteps = [
  { key: 'template', label: 'Template', path: '/create' },
  { key: 'couple', label: 'Couple', path: '/create/couple' },
  { key: 'event', label: 'Ceremonies', path: '/create/ceremonies' },
  { key: 'story', label: 'Story', path: '/create/story' },
  { key: 'photos', label: 'Photos', path: '/create/photos' },
  { key: 'options', label: 'Extras', path: '/create/options' },
  { key: 'preview', label: 'Preview', path: '/create/preview' },
]

/** The progress bar, with the second and third steps named for the kind of event. */
function WizardProgress() {
  const location = useLocation()
  const { draft } = useWizard()
  const copy = getWizardCopy(draft.eventType)
  const steps = baseSteps.map((s) => (s.key === 'couple' ? { ...s, label: copy.nameStep } : s.key === 'event' ? { ...s, label: copy.detailsStep } : s))
  const currentIndex = Math.max(0, steps.findIndex((s) => s.path === location.pathname))
  return <ProgressSteps steps={steps} currentIndex={currentIndex} />
}

export function CreateLayout() {
  return (
    <CreateWizardProvider>
      <div className="min-h-screen bg-ivory">
        <div className="border-b border-ink/10 bg-white/70 px-6 py-4 backdrop-blur-sm">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-6">
            <Link to="/" className="shrink-0"><Logo /></Link>
            <WizardProgress />
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-6 py-12">
          <Outlet />
        </div>
      </div>
    </CreateWizardProvider>
  )
}
