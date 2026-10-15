import type { WeddingInvitation } from '@/types'
import { InvitationSection } from '@/components/invitation/InvitationSection'

/** SECTION 5: Dress code, shown with the colour of the day. */
export function DressCodeSection({ invitation }: { invitation: WeddingInvitation }) {
  return (
    <InvitationSection id="dresscode" eyebrow="What To Wear" title="Dress Code">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center" aria-hidden>
          <span className="size-20 rounded-full border-4 border-[color:var(--iv-paper)] bg-[color:var(--iv-main)] shadow-md" />
          <span className="-ml-5 size-14 rounded-full border-4 border-[color:var(--iv-paper)] bg-[color:var(--iv-accent)] shadow-md" />
          <span className="-ml-4 size-10 rounded-full border-4 border-[color:var(--iv-paper)] bg-[color:var(--iv-soft)] shadow-md" />
        </div>
        <p className="font-display text-3xl text-[color:var(--iv-ink)]">{invitation.dressCode}</p>
        <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--iv-accent)]">Our colour of the day</p>
      </div>
    </InvitationSection>
  )
}
