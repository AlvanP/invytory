import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Monitor, Smartphone, ArrowLeft } from 'lucide-react'
import type { InvitationTemplate } from '@/types'
import { templateService } from '@/services/templateService'
import { mockWeddings } from '@/data/mockWedding'
import { InvitationRenderer } from '@/components/invitation/InvitationRenderer'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/State'
import { InvitationPreviewSkeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'

export function TemplatePreviewPage() {
  const { templateId } = useParams<{ templateId: string }>()
  const [template, setTemplate] = useState<InvitationTemplate | null | undefined>(undefined)
  const [device, setDevice] = useState<'desktop' | 'mobile'>('mobile')

  useEffect(() => {
    if (!templateId) return
    templateService.getById(templateId).then((t) => setTemplate(t ?? null))
  }, [templateId])

  const sampleInvitation = { ...mockWeddings[0], templateId: templateId ?? mockWeddings[0].templateId }

  if (template === undefined) {
    return <InvitationPreviewSkeleton />
  }

  if (template === null) {
    return (
      <ErrorState
        title="Template not found"
        description="This template may have been renamed or retired."
        action={<Link to="/templates"><Button size="sm">Back to Templates</Button></Link>}
      />
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Link to="/templates" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" /> Back to Templates
      </Link>

      <div className="mt-6 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl text-ink">{template.name}</h1>
            {template.isPremium && <Badge tone="premium">Premium</Badge>}
          </div>
          <p className="mt-2 max-w-lg text-sm text-ink-soft">{template.description}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-xs border border-ink/15 p-1">
            <button
              onClick={() => setDevice('mobile')}
              className={cn('flex items-center gap-1.5 rounded-xs px-3 py-1.5 text-xs', device === 'mobile' ? 'bg-ink text-ivory' : 'text-ink-soft')}
            >
              <Smartphone className="size-3.5" /> Mobile
            </button>
            <button
              onClick={() => setDevice('desktop')}
              className={cn('flex items-center gap-1.5 rounded-xs px-3 py-1.5 text-xs', device === 'desktop' ? 'bg-ink text-ivory' : 'text-ink-soft')}
            >
              <Monitor className="size-3.5" /> Desktop
            </button>
          </div>
          <Link to={`/create?template=${template.id}`}>
            <Button size="sm">Use This Template</Button>
          </Link>
        </div>
      </div>

      <div className="mt-10 flex justify-center rounded-md bg-ivory-deep p-4 sm:p-10">
        <div
          className={cn(
            'overflow-hidden rounded-md bg-ivory shadow-lift transition-all duration-300',
            device === 'mobile' ? 'w-full max-w-sm' : 'w-full'
          )}
        >
          <div className="max-h-[75vh] overflow-y-auto">
            <InvitationRenderer invitation={sampleInvitation} template={template} />
          </div>
        </div>
      </div>
    </div>
  )
}
