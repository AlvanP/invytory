import type { CSSProperties } from 'react'

export type EmblemKind = 'wedding' | 'dedication' | 'birthday' | 'corporate' | 'funeral'

/** A small drawn crest that tells guests, before anything opens, what kind of occasion this is. */
export function Emblem({ kind, initials, open }: { kind: EmblemKind; initials: string; open: boolean }) {
  const stroke = { fill: 'none', stroke: 'var(--a)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
  return (
    <div className="sc-emblem" data-open={open} aria-hidden>
      <svg viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="74" {...stroke} strokeWidth="1.2" strokeOpacity="0.6" />
        <circle cx="80" cy="80" r="68" {...stroke} strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="1 5" />
        {kind === 'wedding' && (
          <g>
            {/* two rings, interlocked */}
            <circle cx="66" cy="76" r="22" {...stroke} strokeWidth="3.2" />
            <circle cx="94" cy="76" r="22" {...stroke} strokeWidth="3.2" />
            <path d="M80 56a22 22 0 0 1 0 40" {...stroke} strokeWidth="3.2" stroke="var(--b1)" strokeOpacity="0.9" />
            <path d="M80 56a22 22 0 0 1 0 40" {...stroke} strokeWidth="1.6" />
            {/* diamond */}
            <path d="M80 42l6 7-6 8-6-8z" fill="var(--a)" />
            {/* laurel */}
            {[-1, 1].map((s) => (
              <g key={s} transform={s < 0 ? 'translate(160 0) scale(-1 1)' : undefined}>
                <path d="M30 108C24 90 28 70 44 56" {...stroke} />
                {[0, 1, 2, 3, 4].map((i) => (
                  <ellipse key={i} cx={30 + i * 1.5} cy={100 - i * 11} rx="3.2" ry="7" fill="var(--a)" fillOpacity="0.85" transform={`rotate(${-35 + i * 8} ${30 + i * 1.5} ${100 - i * 11})`} />
                ))}
              </g>
            ))}
            <text x="80" y="124" textAnchor="middle" fontFamily="var(--font-display)" fontSize="17" fill="var(--a)" letterSpacing="2">{initials}</text>
          </g>
        )}
        {kind === 'dedication' && (
          <g>
            {/* dove carrying an olive branch, above a small star */}
            <path d="M74 88C70 62 86 44 116 40C104 54 100 70 98 90Z" fill="var(--a)" fillOpacity="0.55" transform="translate(-6 -4)" />
            <path d="M50 94C58 82 84 78 100 84l6 4c-8 14-30 22-50 12z" fill="var(--a)" />
            <path d="M52 92L28 104l8-12-8-6 26 2z" fill="var(--a)" />
            <path d="M76 90C70 62 88 44 118 42C106 56 102 72 100 92Z" fill="var(--a)" fillOpacity="0.9" stroke="var(--b1)" strokeOpacity="0.35" strokeWidth="1" />
            <circle cx="108" cy="80" r="9" fill="var(--a)" />
            <path d="M116 78l12 3-12 4z" fill="var(--a)" />
            <circle cx="110" cy="78" r="1.6" fill="var(--b1)" />
            <path d="M126 82c8 4 12 12 12 22" {...stroke} />
            {[0, 1, 2].map((i) => (
              <ellipse key={i} cx={131 + i * 2} cy={86 + i * 7} rx="3" ry="6" fill="var(--a)" fillOpacity="0.85" transform={`rotate(${-55 + i * 25} ${131 + i * 2} ${86 + i * 7})`} />
            ))}
            <path d="M80 28l2.6 6 6.4.6-4.8 4.3 1.5 6.3L80 42l-5.7 3.2 1.5-6.3-4.8-4.3 6.4-.6z" fill="var(--a)" />
            <path d="M54 122h52M64 130h32" {...stroke} strokeWidth="1.2" strokeOpacity="0.7" />
          </g>
        )}
        {kind === 'birthday' && (
          <g>
            {/* cake with three candles and sparkles */}
            <rect x="46" y="86" width="68" height="34" rx="5" fill="var(--a)" fillOpacity="0.9" />
            <path d="M46 98q8 8 17 0t17 0 17 0 17 0" fill="none" stroke="var(--b1)" strokeWidth="3" strokeOpacity="0.55" />
            <rect x="56" y="70" width="48" height="18" rx="4" fill="var(--a)" fillOpacity="0.6" />
            {[66, 80, 94].map((x) => (
              <g key={x}>
                <rect x={x - 2} y="52" width="4" height="18" fill="var(--a)" />
                <path d={`M${x} 40c4 5 4 9 0 11-4-2-4-6 0-11z`} fill="var(--a)" />
              </g>
            ))}
            {[[34, 52], [126, 56], [30, 100], [130, 104]].map(([x, y], i) => (
              <path key={i} d={`M${x} ${y - 6}v12M${x - 6} ${y}h12`} {...stroke} strokeWidth="1.8" />
            ))}
          </g>
        )}
        {kind === 'corporate' && (
          <g>
            <path d="M80 32l40 23v46l-40 23-40-23V55z" {...stroke} strokeWidth="2.4" />
            <path d="M80 44l30 17v34l-30 17-30-17V61z" {...stroke} strokeWidth="1" strokeOpacity="0.6" />
            <path d="M40 55l40 23 40-23M80 78v46" {...stroke} strokeWidth="1" strokeOpacity="0.45" />
            <text x="80" y="92" textAnchor="middle" fontFamily="var(--font-display)" fontSize="30" fill="var(--a)">{(initials[0] ?? 'I')}</text>
          </g>
        )}
        {kind === 'funeral' && (
          <g>
            {/* calla lily on a stem with two leaves */}
            <path d="M80 138V84" {...stroke} strokeWidth="2.4" />
            <path d="M80 128C60 124 46 110 44 96c16 2 30 12 36 32z" fill="var(--a)" fillOpacity="0.55" />
            <path d="M80 118c18-2 30-12 34-24-14 0-28 8-34 24z" fill="var(--a)" fillOpacity="0.4" />
            <path d="M80 84c-22-6-30-30-18-48 6 10 14 14 22 14 8-4 16-14 14-24 16 16 8 52-18 58z" fill="var(--a)" fillOpacity="0.92" />
            <path d="M80 84c-2-14 0-26 6-36" {...stroke} stroke="var(--b1)" strokeOpacity="0.35" strokeWidth="1.4" />
            <ellipse cx="84" cy="62" rx="2.6" ry="12" fill="var(--b1)" fillOpacity="0.5" />
          </g>
        )}
      </svg>
    </div>
  )
}

/** Fine botanical line art used on the paper scenes (white weddings). */
export function Sprig({ style, flip }: { style?: CSSProperties; flip?: boolean }) {
  return (
    <svg className="sc-sprig" viewBox="0 0 200 260" style={{ ...style, transform: `${style?.transform ?? ''} ${flip ? 'scaleX(-1)' : ''}` }} aria-hidden>
      <g fill="none" stroke="var(--a)" strokeWidth="1.4" strokeLinecap="round">
        <path d="M10 250C40 200 30 140 70 100S130 60 190 10" />
        {[[34, 206], [46, 168], [64, 134], [92, 106], [124, 80], [156, 52]].map(([x, y], i) => (
          <g key={i} transform={`rotate(${i % 2 ? -50 : 40} ${x} ${y})`}>
            <path d={`M${x} ${y}c10-14 22-14 28-4-10 10-22 12-28 4z`} />
            <path d={`M${x} ${y}l20-6`} strokeWidth="0.8" />
          </g>
        ))}
        {/* rose */}
        <g transform="translate(112 118)">
          <circle r="22" strokeOpacity="0.9" />
          <path d="M0 -20c14 2 20 14 10 22-10 6-22-2-18-12 4-8 16-6 16 2 0 6-8 6-8 2" />
          <path d="M-18 6c2 12 16 18 28 12" />
          <path d="M18 -6c4 14-4 24-18 24" />
        </g>
        <g transform="translate(52 150) scale(.7)">
          <circle r="22" />
          <path d="M0 -20c14 2 20 14 10 22-10 6-22-2-18-12 4-8 16-6 16 2 0 6-8 6-8 2" />
          <path d="M-18 6c2 12 16 18 28 12" />
        </g>
        <circle cx="168" cy="40" r="2" fill="var(--a)" />
        <circle cx="150" cy="22" r="1.6" fill="var(--a)" />
        <circle cx="26" cy="120" r="1.8" fill="var(--a)" />
      </g>
    </svg>
  )
}
