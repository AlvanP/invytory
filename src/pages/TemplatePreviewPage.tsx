import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { InvitationTemplate } from '@/types'
import { templateService } from '@/services/templateService'
import { templatesForCategory } from '@/data/templates'
import { PhoneMockup } from '@/components/brand/PhoneMockup'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/State'
import { InvitationPreviewSkeleton } from '@/components/ui/Skeleton'
import { getDesign } from '@/templates/designs'
import { eventCopy, type EventKind } from '@/templates/events'

export function TemplatePreviewPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const [template, setTemplate] = useState<InvitationTemplate | null | undefined>(undefined)

  useEffect(() => {
    if (!templateId) return
    templateService.getById(templateId).then((t) => setTemplate(t ?? null))
  }, [templateId])

  if (template === undefined) return <InvitationPreviewSkeleton />

  if (template === null) {
    return (
      <ErrorState
        title="Template not found"
        description="This template may have been renamed or retired."
        action={<Link to="/templates"><Button size="sm">Back to templates</Button></Link>}
      />
    )
  }

  const kind = template.category as EventKind
  const copy = eventCopy[kind] ?? eventCopy.wedding
  const soon = template.status === 'coming-soon'
  const scratch = !!getDesign(template.id).scratchDate
  const siblings = templatesForCategory(template.category).filter((t) => t.id !== template.id).slice(0, 5)

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <Link to={`/templates${kind === 'wedding' ? '' : `?category=${kind}`}`} className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-wine">
        <ArrowLeft className="size-4" /> {copy.plural}
      </Link>

      <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-24">
        <div className="max-w-md">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-brand text-5xl leading-tight text-wine sm:text-6xl">{template.name}</h1>
            {template.isPremium && <Badge tone="premium">Premium</Badge>}
          </div>
          <p className="mt-4 text-base leading-relaxed text-ink-soft">{template.description}</p>
          <p className="mt-3 text-sm text-ink-soft">
            {scratch ? 'Scroll through the sample, and scratch the gold to reveal the date.' : 'Scroll through the sample on the phone.'}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {soon ? (
              <p className="rounded-full bg-ivory-deep px-5 py-3 text-sm text-ink-soft">Creating {copy.label.toLowerCase()} invitations opens soon.</p>
            ) : (
              <Link to={`/create?template=${template.id}`}>
                <Button size="lg">Use this template</Button>
              </Link>
            )}
          </div>

          {siblings.length > 0 && (
            <div className="mt-12">
              <p className="text-sm font-medium text-wine">More {copy.plural.toLowerCase()}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {siblings.map((t) => (
                  <Link key={t.id} to={`/templates/${t.id}`} className="rounded-full border border-wine/25 px-4 py-1.5 text-sm text-wine hover:border-wine">
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mx-auto w-[18rem] sm:w-[21rem]">
          <PhoneMockup key={template.id} templateId={template.id} interactive scratch={scratch} />
        </div>
      </div>
    </div>
  )
}
