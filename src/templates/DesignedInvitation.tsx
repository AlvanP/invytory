import { useMemo } from 'react'
import type { TemplateRendererProps } from './types'
import { SECTION_IDS } from './sections'
import { sectionRegistry } from './sections/index'
import { DesignContext, makeDesignContext } from './DesignContext'
import { DateGateProvider } from './DateGate'

/**
 * The one renderer for every template. It lays out the same sections, in the same order, for
 * all designs, skipping the ones the couple left empty. What makes each template look
 * different lives in designs.ts (colour, cover, lettering, motif) and in its artwork.
 */
export function DesignedInvitation({ invitation }: TemplateRendererProps) {
  const ctx = useMemo(() => makeDesignContext(invitation.templateId), [invitation.templateId])
  return (
    <DesignContext.Provider value={ctx}>
      <DateGateProvider enabled={!!ctx.design.scratchDate}>
        <div>
          {SECTION_IDS.filter((id) => sectionRegistry[id].has(invitation)).map((id) => {
            const { Component } = sectionRegistry[id]
            return <Component key={id} invitation={invitation} />
          })}
        </div>
      </DateGateProvider>
    </DesignContext.Provider>
  )
}
