import type { Motif } from '@/templates/designs'

/**
 * The small drawings that make each design feel like itself. All are single-colour line
 * art (they take the colour of the text around them) and kept light, so the page stays clean.
 */

const common = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function Flower({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-5" rx="2.4" ry="4" transform={`rotate(${a})`} />
      ))}
      <circle r="1.4" fill="currentColor" stroke="none" />
    </g>
  )
}

function Leaf({ d }: { d: string }) {
  return <path d={d} />
}

export function MotifDivider({ motif, className }: { motif: Motif; className?: string }) {
  switch (motif) {
    case 'floral':
      return (
        <svg viewBox="0 0 180 30" width="180" height="30" className={className} aria-hidden {...common}>
          <Flower x={90} y={15} s={1.15} />
          <path d="M76 15 C62 15 54 9 38 12 S16 15 4 15" />
          <path d="M104 15 C118 15 126 9 142 12 S164 15 176 15" />
          <Leaf d="M58 11 q-3 -7 -11 -6 q1 7 11 6z" />
          <Leaf d="M42 17 q-3 7 -11 6 q1 -7 11 -6z" />
          <Leaf d="M122 11 q3 -7 11 -6 q-1 7 -11 6z" />
          <Leaf d="M138 17 q3 7 11 6 q-1 -7 -11 -6z" />
          <Flower x={22} y={14} s={0.55} />
          <Flower x={158} y={14} s={0.55} />
        </svg>
      )
    case 'leaf':
      return (
        <svg viewBox="0 0 180 30" width="180" height="30" className={className} aria-hidden {...common}>
          <path d="M10 15 H72 M108 15 H170" />
          <Leaf d="M90 4 C80 8 78 22 90 26 C102 22 100 8 90 4z" />
          <path d="M90 8 V24" />
          <Leaf d="M74 13 C66 10 60 14 58 19 C66 20 72 18 74 13z" />
          <Leaf d="M106 13 C114 10 120 14 122 19 C114 20 108 18 106 13z" />
        </svg>
      )
    case 'uli':
      return (
        <svg viewBox="0 0 180 30" width="180" height="30" className={className} aria-hidden {...common}>
          <path d="M6 15 C 18 4, 30 26, 42 15 S 66 4, 78 15" />
          <path d="M102 15 C 114 4, 126 26, 138 15 S 162 4, 174 15" />
          <circle cx="90" cy="15" r="6" />
          <circle cx="90" cy="15" r="2" fill="currentColor" stroke="none" />
          <circle cx="84" cy="25" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="96" cy="5" r="1.3" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'adire':
      return (
        <svg viewBox="0 0 180 30" width="180" height="30" className={className} aria-hidden {...common}>
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M${34 + i * 28} 15 l 10 -9 l 10 9 l -10 9 z`} />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={44 + i * 28} cy="15" r="1.6" fill="currentColor" stroke="none" />
          ))}
          <path d="M4 15 H28 M152 15 H176" />
        </svg>
      )
    case 'arabesque':
      return (
        <svg viewBox="0 0 180 30" width="180" height="30" className={className} aria-hidden {...common}>
          <path d="M90 3 L95 10 L103 8 L101 16 L109 20 L101 24 L103 27 L95 25 L90 28 L85 25 L77 27 L79 24 L71 20 L79 16 L77 8 L85 10 Z" transform="translate(0 -1)" />
          <circle cx="90" cy="14" r="2.4" fill="currentColor" stroke="none" />
          <path d="M8 15 C 24 5, 40 25, 58 15 L 70 15" />
          <path d="M172 15 C 156 5, 140 25, 122 15 L 110 15" />
        </svg>
      )
    case 'minimal':
    default:
      return (
        <svg viewBox="0 0 60 6" width="60" height="6" className={className} aria-hidden {...common}>
          <path d="M0 3 H60" />
        </svg>
      )
  }
}

/** A branch drawn from a corner. Only floral and leaf designs use corners. */
export function MotifCorner({ motif, className }: { motif: Motif; className?: string }) {
  if (motif !== 'floral' && motif !== 'leaf') return null
  const blossoms = motif === 'floral'
  return (
    <svg viewBox="0 0 120 120" width="120" height="120" className={className} aria-hidden {...common}>
      <path d="M4 6 C 36 10 62 34 74 78" />
      <Leaf d="M24 9 q4 -8 14 -7 q-1 9 -14 7z" />
      <Leaf d="M40 18 q-1 9 -9 14 q-7 -7 9 -14z" />
      <Leaf d="M55 33 q7 -6 15 -3 q-3 9 -15 3z" />
      <Leaf d="M64 52 q-4 8 -13 9 q-1 -9 13 -9z" />
      {blossoms ? (
        <>
          <Flower x={78} y={86} s={0.9} />
          <Flower x={14} y={20} s={0.55} />
        </>
      ) : (
        <Leaf d="M74 78 q8 6 6 16 q-10 -3 -6 -16z" />
      )}
    </svg>
  )
}
