import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Inbox } from 'lucide-react'

interface StateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

function StateShell({ icon, title, description, action }: StateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      {icon}
      <h3 className="font-display text-xl text-ink">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-soft">{description}</p>}
      {action}
    </div>
  )
}

export function EmptyState(props: StateProps) {
  return <StateShell icon={<Inbox className="size-8 text-gold" strokeWidth={1.5} />} {...props} />
}

export function ErrorState(props: StateProps) {
  return <StateShell icon={<AlertCircle className="size-8 text-danger" strokeWidth={1.5} />} {...props} />
}

export function SuccessState(props: StateProps) {
  return <StateShell icon={<CheckCircle2 className="size-8 text-success" strokeWidth={1.5} />} {...props} />
}
