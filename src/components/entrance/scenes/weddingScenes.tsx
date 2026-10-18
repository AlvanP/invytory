import type { SceneProps } from './types'
import { Motes, Burst, rnd, vars } from './shared'

/* ───────────────────────── Wax-sealed envelope ───────────────────────── */

export function EnvelopeScene({ open, go, d, initials, names }: SceneProps) {
  return (
    <div className="sc sc-env" data-open={open} style={vars(d)} onClick={go}>
      <div className="sc-bg" />
      <Motes n={16} />
      <div className="env-wrap">
        <div className="env-back" />
        <div className="env-card">
          <span className="env-card-line" />
          <p className="env-card-kicker">Together with their families</p>
          <p className="env-card-names">{names}</p>
          <span className="env-card-line" />
        </div>
        <svg className="env-front" viewBox="0 0 300 200" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="envSide" x1="0" x2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
              <stop offset="1" stopColor="#000" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <path d="M0 0 L150 112 L0 200Z" fill="var(--p)" />
          <path d="M300 0 L150 112 L300 200Z" fill="var(--p)" />
          <path d="M0 200 L150 92 L300 200Z" fill="var(--p)" />
          <path d="M0 0 L150 112 L0 200Z M300 0 L150 112 L300 200Z M0 200 L150 92 L300 200Z" fill="url(#envSide)" />
          <path d="M0 200 L150 92 L300 200 M0 0 L150 112 L300 0" fill="none" stroke="var(--a)" strokeOpacity="0.35" />
        </svg>
        <div className="env-flap">
          <svg viewBox="0 0 300 110" preserveAspectRatio="none" aria-hidden>
            <path d="M0 0 H300 L150 110Z" fill="var(--p)" />
            <path d="M0 0 H300 L150 110Z" fill="#000" fillOpacity="0.05" />
            <path d="M0 0 L150 110 L300 0" fill="none" stroke="var(--a)" strokeOpacity="0.45" />
          </svg>
        </div>
        <button type="button" className="env-seal" aria-label="Open the invitation">
          {[0, 1].map((half) => (
            <span key={half} className={`seal-half seal-${half ? 'r' : 'l'}`}>
              <svg viewBox="0 0 80 80" aria-hidden>
                <defs>
                  <radialGradient id={`wax${half}`} cx="35%" cy="30%">
                    <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
                    <stop offset="0.5" stopColor="var(--s)" />
                    <stop offset="1" stopColor="#000" stopOpacity="0.35" />
                  </radialGradient>
                </defs>
                <path d="M40 3c9 0 13 6 20 8 8 3 14 9 14 18 0 8-5 11-5 18 0 8 5 12 1 20-4 8-14 8-22 10-8 2-14 7-22 4C16 77 6 70 5 60c-1-8 5-13 4-21C8 29 5 22 12 14 20 5 31 3 40 3Z" fill={`url(#wax${half})`} />
                <circle cx="40" cy="40" r="24" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.4" />
                <text x="40" y="49" textAnchor="middle" fontFamily="Bodoni Moda, Georgia, serif" fontSize={initials.length > 1 ? 22 : 28} fill="#fff" fillOpacity="0.9">{initials}</text>
              </svg>
            </span>
          ))}
        </button>
      </div>
      <Burst open={open} n={30} colors={['#fff', 'var(--a)']} shape="circle" />
    </div>
  )
}

/* ───────────────────────── Garden gate ───────────────────────── */

function GateLeaf({ side }: { side: 'l' | 'r' }) {
  const bars = Array.from({ length: 7 }, (_, i) => 12 + i * 15)
  const leaves = Array.from({ length: 16 }, (_, i) => i)
  return (
    <div className={`gate-leaf gate-${side}`}>
      <svg viewBox="0 0 120 320" preserveAspectRatio="none" aria-hidden className="gate-svg">
        <path d={side === 'l' ? 'M0 320V60Q0 0 120 0V320Z' : 'M120 320V60Q120 0 0 0V320Z'} fill="rgba(255,255,255,0.05)" stroke="var(--a)" strokeWidth="3" />
        {bars.map((x) => (
          <g key={x}>
            <line x1={x} y1="30" x2={x} y2="320" stroke="var(--a)" strokeWidth="2.5" />
            <path d={`M${x} 18 l-4 14 h8z`} fill="var(--a)" />
          </g>
        ))}
        <line x1="0" y1="110" x2="120" y2="110" stroke="var(--a)" strokeWidth="3" />
        <line x1="0" y1="230" x2="120" y2="230" stroke="var(--a)" strokeWidth="3" />
        <circle cx={side === 'l' ? 100 : 20} cy="170" r="14" fill="none" stroke="var(--a)" strokeWidth="2.5" />
        <circle cx={side === 'l' ? 100 : 20} cy="170" r="4" fill="var(--a)" />
        {/* ivy winding up the bars */}
        <path d={side === 'l' ? 'M4 320C30 250 6 200 40 150S20 70 62 30' : 'M116 320C90 250 114 200 80 150S100 70 58 30'} fill="none" stroke="#5E7E55" strokeWidth="3" />
        {leaves.map((i) => {
          const t = i / leaves.length
          const y = 310 - t * 280
          const x = (side === 'l' ? 10 + Math.sin(t * 9) * 26 + t * 40 : 110 - Math.sin(t * 9) * 26 - t * 40)
          return (
            <ellipse key={i} cx={x} cy={y} rx="8" ry="4.5" fill={i % 3 === 0 ? '#7A9A6B' : '#5E7E55'} transform={`rotate(${rnd(i) * 120 - 60} ${x} ${y})`} />
          )
        })}
        {[0.2, 0.42, 0.66, 0.85].map((t, i) => {
          const x = side === 'l' ? 14 + t * 60 : 106 - t * 60
          const y = 300 - t * 250
          return (
            <g key={i}>
              {[0, 72, 144, 216, 288].map((r) => (
                <ellipse key={r} cx={x} cy={y - 6} rx="3.4" ry="6" fill={i % 2 ? '#F6D9DD' : '#fff'} transform={`rotate(${r} ${x} ${y})`} />
              ))}
              <circle cx={x} cy={y} r="2.6" fill="#E3B25B" />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function GateScene({ open, go, d }: SceneProps) {
  return (
    <div className="sc sc-gate" data-open={open} style={vars(d)} onClick={go}>
      <div className="sc-bg" />
      <div className="gate-garden" aria-hidden>
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} style={{ left: `${rnd(i) * 100}%`, top: `${20 + rnd(i, 2) * 60}%`, width: 30 + rnd(i, 3) * 80, height: 30 + rnd(i, 3) * 80, animationDelay: `${-rnd(i, 4) * 6}s` }} />
        ))}
      </div>
      <Motes n={14} color="#fff" size={5} />
      <div className="gate-frame">
        <GateLeaf side="l" />
        <GateLeaf side="r" />
      </div>
      <Burst open={open} n={34} colors={['#fff', '#F6D9DD', '#F3E3A3']} shape="petal" />
    </div>
  )
}

/* ───────────────────────── Carved doors (and palace portal) ───────────────────────── */

function PatternDefs({ kind }: { kind: NonNullable<SceneProps['d']['pattern']> }) {
  if (kind === 'uli') {
    // Uli: bold curves, dots and spirals, as drawn on Igbo walls and bodies.
    return (
      <pattern id="pat-uli" width="64" height="64" patternUnits="userSpaceOnUse">
        <path d="M8 32c0-14 20-14 20 0s-12 10-12 2" fill="none" stroke="var(--a)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M56 32c0 14-20 14-20 0s12-10 12-2" fill="none" stroke="var(--a)" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="32" cy="6" r="2.6" fill="var(--a)" />
        <circle cx="32" cy="58" r="2.6" fill="var(--a)" />
        <path d="M32 14v10M32 40v10" stroke="var(--a)" strokeWidth="2" strokeLinecap="round" />
      </pattern>
    )
  }
  if (kind === 'adire') {
    // Adire: resist-dyed rings and cross shapes.
    return (
      <pattern id="pat-adire" width="56" height="56" patternUnits="userSpaceOnUse">
        <circle cx="28" cy="28" r="18" fill="none" stroke="var(--a)" strokeWidth="1.6" />
        <circle cx="28" cy="28" r="11" fill="none" stroke="var(--a)" strokeWidth="1.6" />
        <circle cx="28" cy="28" r="4" fill="var(--a)" />
        <path d="M0 0l8 8M56 0l-8 8M0 56l8-8M56 56l-8-8" stroke="var(--a)" strokeWidth="1.6" />
      </pattern>
    )
  }
  if (kind === 'stripe') {
    return (
      <pattern id="pat-stripe" width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="6" fill="var(--a)" fillOpacity="0.55" />
        <rect y="14" width="40" height="2" fill="var(--a)" fillOpacity="0.8" />
        <path d="M0 28l5 -5 5 5 5 -5 5 5 5 -5 5 5 5 -5 5 5" fill="none" stroke="var(--a)" strokeWidth="1.4" />
      </pattern>
    )
  }
  return (
    <pattern id="pat-star" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M24 4l5 14 14 6-14 6-5 14-5-14-14-6 14-6z" fill="none" stroke="var(--a)" strokeWidth="1.4" />
    </pattern>
  )
}

function DoorLeaf({ side, d }: { side: 'l' | 'r'; d: SceneProps['d'] }) {
  const kind = d.pattern ?? 'uli'
  return (
    <div className={`door-leaf door-${side}${d.arch ? ' door-arch' : ''}`}>
      <svg viewBox="0 0 200 400" preserveAspectRatio="none" className="door-svg" aria-hidden>
        <defs>
          <PatternDefs kind={kind} />
          <linearGradient id={`wood${side}`} x1={side === 'l' ? '0' : '1'} x2={side === 'l' ? '1' : '0'}>
            <stop offset="0" stopColor="var(--b2)" />
            <stop offset="1" stopColor="var(--b1)" />
          </linearGradient>
        </defs>
        <rect width="200" height="400" fill={`url(#wood${side})`} />
        <rect x="14" y="14" width="172" height="372" fill="none" stroke="var(--a)" strokeOpacity="0.8" strokeWidth="2.5" />
        <rect x="26" y="26" width="148" height="150" fill={`url(#pat-${kind})`} fillOpacity="0.9" stroke="var(--a)" strokeOpacity="0.6" />
        <rect x="26" y="196" width="148" height="178" fill={`url(#pat-${kind})`} fillOpacity="0.9" stroke="var(--a)" strokeOpacity="0.6" />
        {[40, 90, 140].map((y) => <circle key={y} cx={side === 'l' ? 12 : 188} cy={y * 2.4} r="3" fill="var(--a)" />)}
        <circle cx={side === 'l' ? 172 : 28} cy="200" r="12" fill="none" stroke="var(--a)" strokeWidth="4" />
        <circle cx={side === 'l' ? 172 : 28} cy="200" r="4.5" fill="var(--a)" />
        <rect width="200" height="400" fill="url(#doorShade)" opacity="0.5" />
      </svg>
    </div>
  )
}

export function DoorsScene({ open, go, d }: SceneProps) {
  return (
    <div className="sc sc-doors" data-open={open} style={vars(d)} onClick={go}>
      <div className="sc-bg" />
      <div className="door-light" aria-hidden />
      <svg width="0" height="0" aria-hidden>
        <defs>
          <linearGradient id="doorShade" x1="0" x2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0.5" />
            <stop offset="0.5" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.5" />
          </linearGradient>
        </defs>
      </svg>
      <div className="door-frame">
        <DoorLeaf side="l" d={d} />
        <DoorLeaf side="r" d={d} />
      </div>
      <Motes n={12} />
    </div>
  )
}

/* ───────────────────────── Fabric curtains ───────────────────────── */

export function CurtainScene({ open, go, d }: SceneProps) {
  const tassel = (side: 'l' | 'r') => (
    <svg className={`cur-tassel cur-tassel-${side}`} viewBox="0 0 30 90" aria-hidden>
      <path d="M15 0v30" stroke="var(--a)" strokeWidth="3" />
      <circle cx="15" cy="34" r="8" fill="var(--a)" />
      <path d="M7 42h16l3 40h-22z" fill="var(--a)" fillOpacity="0.9" />
      {[9, 13, 17, 21].map((x) => <line key={x} x1={x} y1="44" x2={x - 1} y2="82" stroke="#000" strokeOpacity="0.25" />)}
    </svg>
  )
  return (
    <div className={`sc sc-curtain pat-${d.pattern ?? 'plain'}`} data-open={open} style={vars(d)} onClick={go}>
      <div className="sc-bg cur-stage" />
      <div className="cur-spot" aria-hidden />
      <div className="cur-half cur-l"><span className="cur-folds" /><span className="cur-trim" /></div>
      <div className="cur-half cur-r"><span className="cur-folds" /><span className="cur-trim" /></div>
      <div className="cur-valance" aria-hidden>
        <svg viewBox="0 0 400 60" preserveAspectRatio="none">
          <path d="M0 0H400V30Q375 62 350 30Q325 62 300 30Q275 62 250 30Q225 62 200 30Q175 62 150 30Q125 62 100 30Q75 62 50 30Q25 62 0 30Z" fill="var(--b1)" />
          <path d="M0 30Q25 62 50 30Q75 62 100 30Q125 62 150 30Q175 62 200 30Q225 62 250 30Q275 62 300 30Q325 62 350 30Q375 62 400 30" fill="none" stroke="var(--a)" strokeWidth="3" />
        </svg>
      </div>
      {tassel('l')}
      {tassel('r')}
      <Motes n={14} />
    </div>
  )
}

/* ───────────────────────── Hausa lattice screens ───────────────────────── */

export function LatticeScene({ open, go, d }: SceneProps) {
  return (
    <div className="sc sc-lattice" data-open={open} style={vars(d)} onClick={go}>
      <div className="sc-bg" />
      <div className="lat-glow" aria-hidden />
      <div className="lat-dunes" aria-hidden>
        <svg viewBox="0 0 400 120" preserveAspectRatio="none">
          <path d="M0 120V70C60 40 120 90 200 60S340 30 400 70V120Z" fill="var(--a)" fillOpacity="0.25" />
          <path d="M0 120V92C80 70 140 110 220 84S340 70 400 96V120Z" fill="var(--a)" fillOpacity="0.4" />
        </svg>
      </div>
      {(['l', 'r'] as const).map((side) => (
        <div key={side} className={`lat-screen lat-${side}`}>
          <svg className="lat-svg" aria-hidden>
            <defs>
              <pattern id={`mash-${side}`} width="72" height="72" patternUnits="userSpaceOnUse">
                <path d="M36 4 L46 26 L68 36 L46 46 L36 68 L26 46 L4 36 L26 26Z" fill="none" stroke="var(--a)" strokeWidth="2" />
                <circle cx="36" cy="36" r="5" fill="var(--a)" />
                <path d="M0 0h8M64 0h8M0 72h8M64 72h8" stroke="var(--a)" strokeWidth="2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#mash-${side})`} />
          </svg>
          <span className="lat-edge" />
        </div>
      ))}
      <Motes n={14} />
    </div>
  )
}

/* ───────────────────────── Storybook ───────────────────────── */

export function BookScene({ open, go, d, names }: SceneProps) {
  return (
    <div className="sc sc-book" data-open={open} style={vars(d)} onClick={go}>
      <div className="sc-bg" />
      <Motes n={18} color="#fff" size={4} />
      <div className="book-wrap">
        <div className="book-pages">
          <span className="book-orn" />
          <p>Once upon a time&hellip;</p>
        </div>
        <div className="book-cover">
          <div className="book-face">
            <span className="book-frame" />
            <svg viewBox="0 0 80 40" className="book-crest" aria-hidden>
              <path d="M40 4c-4 8-14 8-18 14 6 0 10-2 14-2 0 6-6 10-6 18 4-4 8-4 10-10 2 6 6 6 10 10 0-8-6-12-6-18 4 0 8 2 14 2-4-6-14-6-18-14z" fill="var(--a)" />
            </svg>
            <p className="book-title">{names}</p>
            <p className="book-sub">a love story</p>
          </div>
          <div className="book-back" />
        </div>
      </div>
    </div>
  )
}
