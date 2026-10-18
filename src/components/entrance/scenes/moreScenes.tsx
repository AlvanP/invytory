import type { SceneProps } from './types'
import { Motes, vars } from './shared'

/* ───────────────────────── Editorial line split (modern luxury) ───────────────────────── */

export function LineSplitScene({ open, go, d }: SceneProps) {
  return (
    <div className="sc sc-line" data-open={open} style={vars(d)} onClick={go}>
      <div className="sc-bg" />
      <div className="ln-glow" aria-hidden />
      <div className="ln-top" />
      <div className="ln-bottom" />
      <span className="ln-line" />
      <span className="ln-corner ln-c1" /><span className="ln-corner ln-c2" /><span className="ln-corner ln-c3" /><span className="ln-corner ln-c4" />
      <Motes n={10} size={3} />
    </div>
  )
}
