import type { WeddingInvitation } from '@/types'
import { InvitationSection } from '@/components/invitation/InvitationSection'

/** SECTION 6: Our story. */
export function StorySection({ invitation }: { invitation: WeddingInvitation }) {
  return (
    <InvitationSection id="story" eyebrow="Our Journey" title="Our Story">
      <div className="flex flex-col gap-8 text-left text-base leading-relaxed text-[color:var(--iv-ink)]">
        {invitation.loveStory && <p>{invitation.loveStory}</p>}
        {invitation.howWeMet && (
          <div className="border-l-4 border-[color:var(--iv-main)] pl-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--iv-accent)]">How We Met</p>
            <p>{invitation.howWeMet}</p>
          </div>
        )}
        {invitation.vows && (
          <div className="border-l-4 border-[color:var(--iv-main)] pl-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--iv-accent)]">Our Vows</p>
            <p className="font-display text-xl italic">{invitation.vows}</p>
          </div>
        )}
      </div>
    </InvitationSection>
  )
}
