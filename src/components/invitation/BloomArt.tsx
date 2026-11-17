import type { CSSProperties } from 'react'
import { cn } from '@/utils/cn'

/**
 * The flowers of the Classic Elegance design. Drawn in SVG, coloured by the couple's colour of the
 * day, and gently moving: garlands sway, blooms breathe and petals drift. Motion stops when the
 * guest's device asks for reduced motion (see styles/index.css).
 */

const LEAF = '#86A07E'
const LEAF_DARK = '#6B8963'

function Bloom({ x, y, s = 1, petals = 6, delay = 0 }: { x: number; y: number; s?: number; petals?: number; delay?: number }) {
  const step = 360 / petals
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="iv-breathe" style={{ animationDelay: `${delay}s` } as CSSProperties}>
        {Array.from({ length: petals }, (_, i) => (
          <ellipse key={i} cx="0" cy="-9" rx="5.2" ry="9" transform={`rotate(${i * step})`} fill="var(--iv-main)" opacity={i % 2 ? 0.55 : 0.75} />
        ))}
        {Array.from({ length: petals }, (_, i) => (
          <ellipse key={`i${i}`} cx="0" cy="-5" rx="2.6" ry="5" transform={`rotate(${i * step + step / 2})`} fill="var(--iv-soft)" opacity="0.9" />
        ))}
        <circle r="3" fill="var(--iv-accent)" />
        <circle r="1.1" fill="#FFF6DD" />
      </g>
    </g>
  )
}

function Leaf({ x, y, r, s = 1, dark }: { x: number; y: number; r: number; s?: number; dark?: boolean }) {
  return <path d="M0 0 C6 -8 18 -8 24 0 C18 8 6 8 0 0z" transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} fill={dark ? LEAF_DARK : LEAF} opacity="0.9" />
}

function Bud({ x, y, r }: { x: number; y: number; r: number }) {
  return <ellipse cx={x} cy={y} rx="3.4" ry="6" transform={`rotate(${r} ${x} ${y})`} fill="var(--iv-main)" opacity="0.7" />
}

/** A garland that hangs from a corner. Mirror it with the `flip` classes to use the other corners. */
export function BloomCorner({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 220 220" className={cn('iv-sway pointer-events-none select-none', className)} style={{ animationDelay: `${delay}s` } as CSSProperties} aria-hidden>
      <path d="M0 8 C48 10 92 22 124 56 S176 120 178 176" fill="none" stroke={LEAF_DARK} strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      <path d="M8 0 C20 44 52 70 88 82 S150 96 196 92" fill="none" stroke={LEAF} strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
      <Leaf x={40} y={14} r={14} />
      <Leaf x={70} y={30} r={40} s={1.1} dark />
      <Leaf x={104} y={46} r={60} />
      <Leaf x={140} y={86} r={82} dark />
      <Leaf x={160} y={128} r={96} />
      <Leaf x={34} y={44} r={-70} />
      <Leaf x={80} y={72} r={-20} dark />
      <Leaf x={128} y={84} r={-10} s={0.9} />
      <Bud x={58} y={52} r={-20} />
      <Bud x={154} y={110} r={20} />
      <Bloom x={22} y={26} s={1.15} delay={delay} />
      <Bloom x={96} y={68} s={1.45} petals={7} delay={delay + 0.8} />
      <Bloom x={176} y={96} s={0.95} delay={delay + 1.6} />
      <Bloom x={176} y={170} s={0.8} petals={5} delay={delay + 2.2} />
    </svg>
  )
}

/** A slim animated line with a bloom in the middle, in place of the usual divider. */
export function BloomDivider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 36" width="220" height="36" className={cn('mx-auto', className)} aria-hidden>
      <path className="iv-draw" d="M8 18 C40 6 66 28 96 18" fill="none" stroke="var(--iv-accent)" strokeWidth="1.2" strokeLinecap="round" pathLength="1" />
      <path className="iv-draw" d="M212 18 C180 6 154 28 124 18" fill="none" stroke="var(--iv-accent)" strokeWidth="1.2" strokeLinecap="round" pathLength="1" />
      <Leaf x={88} y={18} r={200} s={0.7} />
      <Leaf x={132} y={18} r={-20} s={0.7} />
      <Bloom x={110} y={18} s={0.9} delay={0.4} />
    </svg>
  )
}

const PETALS = [
  { left: '6%', size: 12, dur: 14, delay: 0 },
  { left: '19%', size: 9, dur: 17, delay: 4 },
  { left: '33%', size: 14, dur: 15, delay: 8 },
  { left: '48%', size: 10, dur: 19, delay: 2 },
  { left: '62%', size: 13, dur: 16, delay: 6 },
  { left: '77%', size: 9, dur: 18, delay: 10 },
  { left: '90%', size: 12, dur: 15, delay: 3 },
]

/** Petals that drift slowly down across a section. Sits behind the writing. */
export function PetalDrift({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="iv-petal absolute -top-6 block rounded-[60%_0_60%_0] bg-[color:var(--iv-main)]"
          style={{ left: p.left, width: p.size, height: p.size * 1.25, animationDuration: `${p.dur}s`, animationDelay: `-${p.delay}s`, opacity: 0.35 } as CSSProperties}
        />
      ))}
    </div>
  )
}
