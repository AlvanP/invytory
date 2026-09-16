import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { InvitationTemplate } from '@/types'
import { templateService } from '@/services/templateService'
import { TemplatePreviewPlaceholder } from '@/components/ui/Placeholder'
import { TemplateCardSkeleton } from '@/components/ui/Skeleton'

export function FeaturedTemplatesSection() {
  const [templates, setTemplates] = useState<InvitationTemplate[] | null>(null)

  useEffect(() => {
    templateService.list().then((all) => setTemplates(all.slice(0, 3)))
  }, [])

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-gold">Featured</p>
          <h2 className="mt-2 font-display text-3xl text-ink">A few of our templates</h2>
        </div>
        <Link to="/templates" className="hidden text-sm text-ink-soft hover:text-ink sm:block">
          View all templates
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {!templates
          ? Array.from({ length: 3 }).map((_, i) => <TemplateCardSkeleton key={i} />)
          : templates.map((t) => (
              <Link key={t.id} to={`/templates/${t.id}`} className="group flex flex-col gap-3">
                <TemplatePreviewPlaceholder
                  tone={t.previewTone}
                  className="transition-transform duration-300 group-hover:scale-[1.01]"
                />
                <span className="font-display text-lg text-ink">{t.name}</span>
              </Link>
            ))}
      </div>
    </section>
  )
}
