import { useMemo } from 'react'
import type { TemplateRendererProps } from './types'
import { SECTION_IDS } from './sections'
import { sectionRegistry } from './sections/index'
import { DesignContext, makeDesignContext } from './DesignContext'
import { DateGateProvider } from './DateGate'
import { WallProvider } from './WallContext'

/**
 * The one renderer for every template. It lays out the same sections, in the same order, for
 * all designs, skipping the ones the couple left empty. What makes each template look
 * different lives in designs.ts (colour, cover, lettering, motif) and in its artwork.
 */
export function DesignedInvitation({ invitation, noScratch }: TemplateRendererProps) {
  const ctx = useMemo(() => {
    const base = makeDesignContext(invitation.templateId, invitation.eventType)
    return noScratch ? { ...base, design: { ...base.design, scratchDate: false } } : base
  }, [invitation.templateId, invitation.eventType, noScratch])
  return (
    <DesignContext.Provider value={ctx}>
      <DateGateProvider enabled={!!ctx.design.scratchDate}>
        <WallProvider invitationId={invitation.id} published={invitation.status === 'published'}>
        <div>
          {SECTION_IDS.filter((id) => !ctx.event.skip.includes(id) && sectionRegistry[id].has(invitation)).map((id) => {
            const { Component } = sectionRegistry[id]
            return <Component key={id} invitation={invitation} />
          })}
        </div>
        </WallProvider>
      </DateGateProvider>
    </DesignContext.Provider>
  )
}
