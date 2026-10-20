import type { WeddingInvitation } from '@/types'
import { InvitationSection } from '@/components/invitation/InvitationSection'
import { useDesign } from '@/templates/DesignContext'

/** SECTION 6: Our story. */
export function StorySection({ invitation }: { invitation: WeddingInvitation }) {
  const { event, design } = useDesign()
  const dropCap = design.body === 'editorial'
  return (
    <InvitationSection id="story" eyebrow={event.story.eyebrow} title={event.story.title}>
      <div className="flex flex-col gap-8 text-left text-base leading-relaxed text-[color:var(--iv-ink)]">
        {invitation.loveStory && (
          <p
            className={
              dropCap
                ? 'first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-[color:var(--iv-accent)]'
                : undefined
            }
          >
            {invitation.loveStory}
          </p>
        )}
        {invitation.howWeMet && (
          <div className="border-l-4 border-[color:var(--iv-main)] pl-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--iv-accent)]">{event.storySecond}</p>
            <p>{invitation.howWeMet}</p>
          </div>
        )}
        {invitation.vows && (
          <div className="border-l-4 border-[color:var(--iv-main)] pl-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--iv-accent)]">{event.storyThird}</p>
            <p className="font-display text-xl italic">{invitation.vows}</p>
          </div>
        )}
      </div>
    </InvitationSection>
  )
}
