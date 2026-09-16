import { Link } from 'react-router-dom'
import type { InvitationTemplate } from '@/types'
import { TemplatePreviewPlaceholder } from '@/components/ui/Placeholder'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export function TemplateCard({ template }: { template: InvitationTemplate }) {
  return (
    <div className="group flex flex-col gap-4">
      <Link to={`/templates/${template.id}`} className="block">
        <TemplatePreviewPlaceholder
          tone={template.previewTone}
          className="transition-transform duration-300 group-hover:scale-[1.01]"
        />
      </Link>

      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-xl text-ink">{template.name}</h3>
          <p className="mt-1 text-sm text-ink-soft">{template.description}</p>
        </div>
        {template.isPremium && <Badge tone="premium">Premium</Badge>}
      </div>

      <div className="flex gap-2">
        <Link to={`/templates/${template.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">Preview</Button>
        </Link>
        <Link to={`/create?template=${template.id}`} className="flex-1">
          <Button size="sm" className="w-full">Use Template</Button>
        </Link>
      </div>
    </div>
  )
}
