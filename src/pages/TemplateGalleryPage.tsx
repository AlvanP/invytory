import { useEffect, useState } from 'react'
import type { InvitationTemplate } from '@/types'
import { templateService } from '@/services/templateService'
import { TemplateCard } from '@/components/templates/TemplateCard'
import { TemplateCardSkeleton } from '@/components/ui/Skeleton'

export function TemplateGalleryPage() {
  const [templates, setTemplates] = useState<InvitationTemplate[] | null>(null)

  useEffect(() => {
    templateService.list().then(setTemplates)
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-xs tracking-[0.2em] text-gold">Templates</p>
      <h1 className="mt-2 font-display text-4xl text-ink">Wedding Invitation Templates</h1>
      <p className="mt-3 max-w-xl text-sm text-ink-soft">
        Six starting points, each with its own character. More arrive as our library grows.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {!templates
          ? Array.from({ length: 6 }).map((_, i) => <TemplateCardSkeleton key={i} />)
          : templates.map((t) => <TemplateCard key={t.id} template={t} />)}
      </div>
    </div>
  )
}
