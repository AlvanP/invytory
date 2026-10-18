import type { CSSProperties } from 'react'
import type { EntranceDesign } from './types'

/** A steady pseudo-random number from an index, so scenes look the same on every render. */
export function rnd(i: number, salt = 1): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

export function vars(d: EntranceDesign): CSSProperties {
  return {
    '--a': d.c.a,
    '--b1': d.c.b1,
    '--b2': d.c.b2,
    '--p': d.c.p ?? '#FBF6EE',
    '--s': d.c.s ?? d.c.a,
  } as CSSProperties
}

/** Little specks of light that drift upwards. */
export function Motes({ n = 18, color = 'var(--a)', size = 4 }: { n?: number; color?: string; size?: number }) {
  return (
    <div className="sc-motes" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${rnd(i) * 100}%`,
            width: size * (0.5 + rnd(i, 2)),
            height: size * (0.5 + rnd(i, 2)),
            background: color,
            animationDelay: `${-rnd(i, 3) * 14}s`,
            animationDuration: `${9 + rnd(i, 4) * 10}s`,
          }}
        />
      ))}
    </div>
  )
}

/** Confetti or petals thrown outward from the middle when `open` turns true. */
export function Burst({ n = 36, colors, open, shape = 'rect' }: { n?: number; colors: string[]; open: boolean; shape?: 'rect' | 'circle' | 'petal' }) {
  return (
    <div className="sc-burst" data-open={open} aria-hidden>
      {Array.from({ length: n }, (_, i) => {
        const ang = rnd(i, 5) * Math.PI * 2
        const dist = 90 + rnd(i, 6) * 260
        return (
          <span
            key={i}
            className={`sc-burst-${shape}`}
            style={
              {
                '--dx': `${Math.cos(ang) * dist}px`,
                '--dy': `${Math.sin(ang) * dist - 80}px`,
                '--r': `${rnd(i, 7) * 720 - 360}deg`,
                background: colors[i % colors.length],
                animationDelay: `${rnd(i, 8) * 0.25}s`,
              } as CSSProperties
            }
          />
        )
      })}
    </div>
  )
}
