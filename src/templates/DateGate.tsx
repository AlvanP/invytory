import { createContext, useContext, useState, type ReactNode } from 'react'

interface DateGateValue {
  /** True while the date is still hidden under the scratch layer. */
  hidden: boolean
  reveal: () => void
}

const DateGateContext = createContext<DateGateValue>({ hidden: false, reveal: () => {} })

/**
 * For designs where the date is scratched off. While it is hidden, the cover, the date
 * card and the countdown hold back the date so it is a real surprise. Designs without
 * a scratch layer never hide anything (the default value above).
 */
export function DateGateProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <DateGateContext.Provider value={{ hidden: enabled && !revealed, reveal: () => setRevealed(true) }}>
      {children}
    </DateGateContext.Provider>
  )
}

export function useDateGate(): DateGateValue {
  return useContext(DateGateContext)
}
