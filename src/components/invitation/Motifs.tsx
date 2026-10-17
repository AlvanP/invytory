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
    case 'dove':
      return (
        <svg viewBox="0 0 180 30" width="180" height="30" className={className} aria-hidden {...common}>
          <path d="M8 15 H68 M112 15 H172" />
          <path d="M80 20 C77 20 74 17 75 13 C78 14 81 14 83 13 C85 8 91 6 96 8 C93 9 92 11 93 13 C97 12 101 13 104 15 C99 15 98 18 93 20 C90 22 86 22 80 20z" />
          <path d="M84 13 C83 8 80 5 76 4 C77 8 80 11 84 13z" />
          <circle cx="94" cy="10" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'star':
      return (
        <svg viewBox="0 0 180 30" width="180" height="30" className={className} aria-hidden {...common}>
          <path d="M8 15 H62 M118 15 H172" />
          <path d="M90 2 Q91.5 13.5 103 15 Q91.5 16.5 90 28 Q88.5 16.5 77 15 Q88.5 13.5 90 2z" />
          <path d="M70 15 q1 -4 5 -5 q-4 -1 -5 -5 q-1 4 -5 5 q4 1 5 5z" transform="translate(-2 3) scale(0.8)" />
          <path d="M70 15 q1 -4 5 -5 q-4 -1 -5 -5 q-1 4 -5 5 q4 1 5 5z" transform="translate(116 3) scale(0.8)" />
        </svg>
      )
    case 'confetti':
      return (
        <svg viewBox="0 0 180 30" width="180" height="30" className={className} aria-hidden {...common}>
          <circle cx="14" cy="10" r="2.4" />
          <path d="M30 20 l6 -5" />
          <path d="M48 8 l4 6 l-7 1z" />
          <circle cx="66" cy="21" r="1.6" fill="currentColor" stroke="none" />
          <rect x="80" y="8" width="5" height="5" transform="rotate(20 82 10)" />
          <path d="M92 22 q4 -8 8 0" />
          <circle cx="110" cy="9" r="1.8" fill="currentColor" stroke="none" />
          <path d="M122 20 l6 -4" />
          <path d="M138 9 l5 5 m0 -5 l-5 5" />
          <circle cx="156" cy="20" r="2.4" />
          <path d="M166 8 l4 6 l-7 1z" />
        </svg>
      )
    case 'lines':
      return (
        <svg viewBox="0 0 180 30" width="180" height="30" className={className} aria-hidden {...common}>
          <path d="M6 15 H78 M102 15 H174" />
          <rect x="85" y="10" width="10" height="10" transform="rotate(45 90 15)" />
          <path d="M6 11 H40 M140 19 H174" opacity="0.6" />
        </svg>
      )
    case 'lily':
      return (
        <svg viewBox="0 0 180 30" width="180" height="30" className={className} aria-hidden {...common}>
          <path d="M8 15 H70 M110 15 H172" />
          <path d="M90 3 C83 9 83 18 90 24 C97 18 97 9 90 3z" />
          <path d="M90 24 C80 22 72 16 70 8 C80 9 87 15 90 24z" />
          <path d="M90 24 C100 22 108 16 110 8 C100 9 93 15 90 24z" />
          <path d="M90 24 V28" />
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
