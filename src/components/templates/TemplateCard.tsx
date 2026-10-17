import { Link } from 'react-router-dom'
import type { InvitationTemplate } from '@/types'
import { PhoneMockup } from '@/components/brand/PhoneMockup'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export function TemplateCard({ template }: { template: InvitationTemplate }) {
  const soon = template.status === 'coming-soon'
  return (
    <div className="group flex flex-col">
      <Link to={`/templates/${template.id}`} className="block rounded-[2.6rem] bg-ivory-deep px-8 pb-8 pt-9" aria-label={`Preview ${template.name}`}>
        <div className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5">
          <PhoneMockup templateId={template.id} auto={false} className="mx-auto w-full max-w-[12.5rem]" />
        </div>
      </Link>

      <div className="mt-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-brand text-2xl leading-tight text-wine">{template.name}</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{template.description}</p>
        </div>
        {template.isPremium && <Badge tone="premium">Premium</Badge>}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Link to={`/templates/${template.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">Preview</Button>
        </Link>
        {soon ? (
          <span className="flex-1 rounded-full bg-ivory-deep px-4 py-2 text-center text-sm text-ink-soft">Opens soon</span>
        ) : (
          <Link to={`/create?template=${template.id}`} className="flex-1">
            <Button size="sm" className="w-full">Use template</Button>
          </Link>
        )}
      </div>
    </div>
  )
}
