import type { WeddingInvitation } from '@/types'
import { InvitationSection } from '@/components/invitation/InvitationSection'
import { parseColours, swatchName } from '@/utils/colorTheme'
import { useDesign } from '@/templates/DesignContext'

export const hasDressCodeContent = (i: WeddingInvitation) => !!i.dressCode?.trim() || parseColours(i.themeColor).length > 0

const SIZES = ['size-20', 'size-16', 'size-12']

/**
 * SECTION 5: Our colour of the day. The colours (up to three) come first, then the
 * Dress Code heading with whatever the couple wrote. Whatever was left empty is not shown.
 */
export function DressCodeSection({ invitation }: { invitation: WeddingInvitation }) {
  const { event } = useDesign()
  const colours = parseColours(invitation.themeColor)
  const dressCode = invitation.dressCode?.trim()
  const title = colours.length === 0 ? event.dresscode.title : colours.length === 1 ? 'Our Colour Of The Day' : 'Our Colours Of The Day'

  return (
    <InvitationSection id="dresscode" eyebrow={event.dresscode.eyebrow} title={title}>
      <div className="flex flex-col items-center gap-8">
        {colours.length > 0 && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center" aria-hidden>
              {colours.map((hex, i) => (
                <span
                  key={hex}
                  className={`${SIZES[i]} ${i > 0 ? '-ml-4' : ''} rounded-full border-4 border-[color:var(--iv-paper)] shadow-md`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
            {colours.some((c) => swatchName(c)) && (
              <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--iv-ink)] opacity-70">
                {colours.map((c) => swatchName(c) ?? c).join('  ·  ')}
              </p>
            )}
          </div>
        )}
        {dressCode && colours.length > 0 && (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-[color:var(--iv-accent)]">Dress Code</p>
            <p className="mt-3 font-display text-3xl text-[color:var(--iv-ink)]">{dressCode}</p>
          </div>
        )}
        {dressCode && colours.length === 0 && <p className="font-display text-3xl text-[color:var(--iv-ink)]">{dressCode}</p>}
      </div>
    </InvitationSection>
  )
}
