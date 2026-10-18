import type { CSSProperties } from 'react'
import type { SceneProps } from './types'
import { Motes, Burst, rnd, vars } from './shared'

/* ───────────────────────── Sky: parting clouds and a dove ───────────────────────── */

function Dove() {
  return (
    <svg viewBox="0 0 130 90" className="sky-dove-svg" aria-hidden>
      <g className="dove-wing dove-wing-back"><path d="M58 46C50 22 70 6 100 2C88 16 82 30 80 48Z" fill="#fff" fillOpacity="0.75" /></g>
      <path d="M18 56C30 42 56 38 72 42C80 30 94 28 102 36C97 38 95 41 97 45C90 55 72 64 48 64C36 64 24 62 18 56Z" fill="#fff" />
      <path d="M20 56L2 68L24 62Z" fill="#fff" />
      <circle cx="94" cy="38" r="1.8" fill="#556" />
      <path d="M102 36l9 3-9 3z" fill="#E8B47A" />
      <g className="dove-wing"><path d="M54 48C44 22 68 4 102 0C88 16 82 32 80 50Z" fill="#fff" stroke="#DDE6F0" strokeWidth="1" /></g>
    </svg>
  )
}

function Cloud({ className, style }: { className: string; style?: CSSProperties }) {
  return (
    <div className={`sky-cloud ${className}`} style={style} aria-hidden>
      <span style={{ left: '0%', width: '46%', height: '70%', bottom: 0 }} />
      <span style={{ left: '22%', width: '56%', height: '100%', bottom: 0 }} />
      <span style={{ left: '52%', width: '48%', height: '75%', bottom: 0 }} />
      <span style={{ left: '8%', width: '84%', height: '45%', bottom: 0, borderRadius: 40 }} />
    </div>
  )
}

export function SkyScene({ open, go, d }: SceneProps) {
  return (
    <div className="sc sc-sky" data-open={open} style={vars(d)} onClick={go}>
      <div className="sc-bg sky-bg" />
      <div className="sky-rays" aria-hidden />
      <div className="sky-dove"><Dove /></div>
      <Cloud className="sky-c1" />
      <Cloud className="sky-c2" />
      <div className="sky-gate-l"><Cloud className="sky-row sky-row1" /><Cloud className="sky-row sky-row2" /><Cloud className="sky-row sky-row3" /></div>
      <div className="sky-gate-r"><Cloud className="sky-row sky-row3" /><Cloud className="sky-row sky-row2" /><Cloud className="sky-row sky-row1" /></div>
      <Motes n={16} color="#fff" size={5} />
    </div>
  )
}

/* ───────────────────────── Bloom: a flower opens ───────────────────────── */

export function BloomScene({ open, go, d }: SceneProps) {
  const n = d.petals ?? 8
  return (
    <div className="sc sc-bloom" data-open={open} style={vars(d)} onClick={go}>
      <div className="sc-bg" />
      <div className="bl-fall" aria-hidden>
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} style={{ left: `${rnd(i) * 100}%`, animationDelay: `${-rnd(i, 2) * 16}s`, animationDuration: `${12 + rnd(i, 3) * 10}s`, width: 10 + rnd(i, 4) * 10, height: 14 + rnd(i, 4) * 12 }} />
        ))}
      </div>
      <div className="bl-flower">
        {Array.from({ length: n }, (_, i) => (
          <i key={i} className="bl-petal" style={{ '--r': `${(360 / n) * i}deg`, '--i': i } as CSSProperties} />
        ))}
        {Array.from({ length: n }, (_, i) => (
          <i key={`b${i}`} className="bl-petal bl-inner" style={{ '--r': `${(360 / n) * i + 180 / n}deg`, '--i': i } as CSSProperties} />
        ))}
        <b className="bl-core" />
      </div>
    </div>
  )
}

/* ───────────────────────── Dawn: light breaks ───────────────────────── */

export function DawnScene({ open, go, d }: SceneProps) {
  return (
    <div className="sc sc-dawn" data-open={open} style={vars(d)} onClick={go}>
      <div className="sc-bg" />
      <div className="dw-rays" aria-hidden />
      <div className="dw-sun" aria-hidden />
      <div className="dw-stars" aria-hidden>
        {Array.from({ length: 26 }, (_, i) => (
          <span key={i} style={{ left: `${rnd(i) * 100}%`, top: `${rnd(i, 2) * 70}%`, animationDelay: `${-rnd(i, 3) * 4}s`, transform: `scale(${0.5 + rnd(i, 4)})` }} />
        ))}
      </div>
      <div className="dw-flash" aria-hidden />
    </div>
  )
}

/* ───────────────────────── Meadow: a little lamb on the hill ───────────────────────── */

export function MeadowScene({ open, go, d }: SceneProps) {
  return (
    <div className="sc sc-meadow" data-open={open} style={vars(d)} onClick={go}>
      <div className="sc-bg" />
      <div className="md-sun" aria-hidden />
      <div className="sky-cloud md-cloud md-cl1"><span style={{ left: '0', width: '50%', height: '80%', bottom: 0 }} /><span style={{ left: '28%', width: '60%', height: '100%', bottom: 0 }} /><span style={{ left: '55%', width: '45%', height: '70%', bottom: 0 }} /></div>
      <div className="sky-cloud md-cloud md-cl2"><span style={{ left: '0', width: '50%', height: '80%', bottom: 0 }} /><span style={{ left: '28%', width: '60%', height: '100%', bottom: 0 }} /><span style={{ left: '55%', width: '45%', height: '70%', bottom: 0 }} /></div>
      <svg className="md-hill md-h1" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden><path d="M0 90C80 40 160 60 240 80S360 50 400 70V200H0Z" fill="#B9D4A3" /></svg>
      <svg className="md-hill md-h2" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden><path d="M0 70C70 90 150 30 230 50S350 90 400 60V200H0Z" fill="#9CC088" /></svg>
      <div className="md-lamb">
        <svg viewBox="0 0 130 100" aria-hidden>
          <g fill="#4B3F3A"><rect x="46" y="68" width="6" height="26" rx="3" /><rect x="60" y="70" width="6" height="24" rx="3" /><rect x="78" y="70" width="6" height="24" rx="3" /><rect x="90" y="68" width="6" height="26" rx="3" /></g>
          <g fill="#FFFAF0" stroke="#EADFCB" strokeWidth="1.5">
            <circle cx="40" cy="52" r="18" /><circle cx="58" cy="42" r="22" /><circle cx="80" cy="44" r="22" /><circle cx="92" cy="56" r="17" /><circle cx="60" cy="62" r="18" /><circle cx="78" cy="64" r="16" />
          </g>
          <ellipse cx="108" cy="44" rx="12" ry="14" fill="#4B3F3A" transform="rotate(12 108 44)" />
          <ellipse cx="98" cy="32" rx="9" ry="5" fill="#4B3F3A" transform="rotate(-30 98 32)" />
          <circle cx="111" cy="41" r="1.6" fill="#fff" />
          <circle cx="104" cy="30" r="9" fill="#FFFAF0" />
        </svg>
      </div>
      <svg className="md-hill md-h3" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden><path d="M0 120C90 80 170 130 260 100S360 90 400 110V200H0Z" fill="#7FAE6F" /></svg>
      <Motes n={10} color="#fff" size={5} />
    </div>
  )
}

/* ───────────────────────── Balloons ───────────────────────── */

export function BalloonsScene({ open, go, d }: SceneProps) {
  const colors = [d.c.a, d.c.s ?? '#ffd166', '#ffffff', '#4cc9f0', '#f72585', '#7bd389', '#f4a259']
  const items = Array.from({ length: 13 }, (_, i) => i)
  return (
    <div className="sc sc-balloons" data-open={open} style={vars(d)} onClick={go}>
      <div className="sc-bg" />
      <div className="bn-dots" aria-hidden />
      {items.map((i) => {
        const left = 6 + (i / 12) * 88 + (rnd(i) - 0.5) * 6
        const size = 62 + rnd(i, 2) * 40
        return (
          <div
            key={i}
            className="bn"
            style={{ left: `${left}%`, bottom: `${-4 + rnd(i, 3) * 26}%`, width: size, '--c': colors[i % colors.length], '--dl': `${rnd(i, 4) * 0.55}s`, '--sw': `${3 + rnd(i, 5) * 2.5}s` } as CSSProperties}
          >
            <span className="bn-body" />
            <span className="bn-knot" />
            <span className="bn-string" />
          </div>
        )
      })}
      <Burst open={open} n={46} colors={[d.c.a, '#fff', '#4cc9f0', '#f72585', '#ffd166']} shape="rect" />
    </div>
  )
}

/* ───────────────────────── Gift box ───────────────────────── */

export function GiftScene({ open, go, d }: SceneProps) {
  return (
    <div className="sc sc-gift" data-open={open} style={vars(d)} onClick={go}>
      <div className="sc-bg" />
      <div className="gf-glow" aria-hidden />
      <div className="gf-wrap">
        <div className="gf-lid">
          <span className="gf-lid-body" />
          <span className="gf-ribbon-v" />
          <svg className="gf-bow" viewBox="0 0 160 90" aria-hidden>
            <path d="M80 60C40 52 6 30 14 12 24-4 66 20 80 56Z" fill="var(--a)" />
            <path d="M80 60C120 52 154 30 146 12 136-4 94 20 80 56Z" fill="var(--a)" />
            <path d="M80 60C60 50 36 36 30 18" fill="none" stroke="#000" strokeOpacity="0.15" strokeWidth="3" />
            <path d="M80 60C100 50 124 36 130 18" fill="none" stroke="#000" strokeOpacity="0.15" strokeWidth="3" />
            <path d="M74 62L52 88 70 84 80 68ZM86 62L108 88 90 84 80 68Z" fill="var(--a)" />
            <circle cx="80" cy="58" r="11" fill="var(--a)" stroke="#000" strokeOpacity="0.15" />
          </svg>
        </div>
        <div className="gf-box"><span className="gf-ribbon-v" /></div>
      </div>
      <div className="gf-stars" aria-hidden>
        {Array.from({ length: 22 }, (_, i) => (
          <i key={i} style={{ '--x': `${(rnd(i) - 0.5) * 120}vw`, '--y': `${-30 - rnd(i, 2) * 70}vh`, '--dl': `${rnd(i, 3) * 0.3}s` } as CSSProperties} />
        ))}
      </div>
      <Burst open={open} n={40} colors={[d.c.a, '#fff', d.c.s ?? '#f72585']} shape="rect" />
    </div>
  )
}

/* ───────────────────────── Spotlights and a mirror ball ───────────────────────── */

export function SpotlightScene({ open, go, d }: SceneProps) {
  return (
    <div className="sc sc-spot" data-open={open} style={vars(d)} onClick={go}>
      <div className="sc-bg" />
      <div className="sp-stars" aria-hidden>
        {Array.from({ length: 40 }, (_, i) => (
          <span key={i} style={{ left: `${rnd(i) * 100}%`, top: `${rnd(i, 2) * 100}%`, animationDelay: `${-rnd(i, 3) * 5}s` }} />
        ))}
      </div>
      <div className="sp-beams" aria-hidden>
        <i className="sp-b1" /><i className="sp-b2" /><i className="sp-b3" /><i className="sp-b4" />
      </div>
      <div className="sp-ball">
        <span className="sp-string" />
        <svg viewBox="0 0 100 100" aria-hidden>
          <defs>
            <radialGradient id="ballG" cx="38%" cy="32%"><stop offset="0" stopColor="#fff" /><stop offset="0.5" stopColor="#c9cde8" /><stop offset="1" stopColor="#4a4f7a" /></radialGradient>
            <clipPath id="ballC"><circle cx="50" cy="50" r="46" /></clipPath>
          </defs>
          <circle cx="50" cy="50" r="46" fill="url(#ballG)" />
          <g clipPath="url(#ballC)" stroke="#1d2147" strokeOpacity="0.35" strokeWidth="1">
            {[18, 30, 42, 54, 66, 78].map((y) => <path key={y} d={`M0 ${y}Q50 ${y + 8} 100 ${y}`} fill="none" />)}
            {[12, 28, 44, 56, 72, 88].map((x) => <path key={x} d={`M${x} 0Q${50 + (x - 50) * 0.2} 50 ${x} 100`} fill="none" />)}
          </g>
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x={20 + rnd(i) * 55} y={14 + rnd(i, 2) * 70} width="5" height="5" fill="#fff" className="sp-glint" style={{ animationDelay: `${rnd(i, 3) * 2}s` }} />)}
        </svg>
      </div>
      <div className="sp-flash" aria-hidden />
      <Motes n={18} color="var(--a)" size={5} />
    </div>
  )
}

/* ───────────────────────── Shutters (corporate) ───────────────────────── */

export function ShutterScene({ open, go, d }: SceneProps) {
  const slats = Array.from({ length: 14 }, (_, i) => i)
  return (
    <div className="sc sc-shutter" data-open={open} style={vars(d)} onClick={go}>
      <div className="sc-bg" />
      <div className="st-light" aria-hidden />
      <div className="st-slats">
        {slats.map((i) => (
          <i key={i} style={{ '--dl': `${i * 0.07}s` } as CSSProperties}><b /></i>
        ))}
      </div>
      <span className="st-rule" aria-hidden />
    </div>
  )
}

/* ───────────────────────── Mountains at sunrise (corporate) ───────────────────────── */

export function MountainScene({ open, go, d }: SceneProps) {
  return (
    <div className="sc sc-mount" data-open={open} style={vars(d)} onClick={go}>
      <div className="sc-bg mt-sky" />
      <div className="mt-sun" aria-hidden />
      <div className="sky-cloud mt-cloud"><span style={{ left: '0', width: '50%', height: '70%', bottom: 0 }} /><span style={{ left: '30%', width: '60%', height: '100%', bottom: 0 }} /><span style={{ left: '60%', width: '40%', height: '60%', bottom: 0 }} /></div>
      <svg className="mt-ridge mt-r1" viewBox="0 0 400 220" preserveAspectRatio="none" aria-hidden><path d="M0 120L50 70 90 105 150 40 210 100 270 55 340 105 400 75V220H0Z" fill="#fff" fillOpacity="0.28" /></svg>
      <svg className="mt-ridge mt-r2" viewBox="0 0 400 220" preserveAspectRatio="none" aria-hidden><path d="M0 130L70 80 120 118 190 60 260 120 320 82 400 125V220H0Z" fill="var(--b1)" fillOpacity="0.55" /></svg>
      <svg className="mt-ridge mt-r3" viewBox="0 0 400 220" preserveAspectRatio="none" aria-hidden><path d="M0 150L60 110 130 145 200 95 280 150 350 115 400 140V220H0Z" fill="var(--b1)" /></svg>
    </div>
  )
}

/* ───────────────────────── Candle ───────────────────────── */

export function CandleScene({ open, go, d }: SceneProps) {
  return (
    <div className="sc sc-candle" data-open={open} style={vars(d)} onClick={go}>
      <div className="sc-bg" />
      <div className="cd-glow" aria-hidden />
      <div className="cd-wrap">
        <div className="cd-flame"><i /><b /></div>
        <span className="cd-wick" />
        <div className="cd-body"><span className="cd-drip" /></div>
      </div>
      <Motes n={14} color="#ffdca8" size={4} />
      <div className="cd-wash" aria-hidden />
    </div>
  )
}

/* ───────────────────────── Falling leaves ───────────────────────── */

export function LeavesScene({ open, go, d }: SceneProps) {
  return (
    <div className="sc sc-leaves" data-open={open} style={vars(d)} onClick={go}>
      <div className="sc-bg" />
      <div className="lv-sun" aria-hidden />
      <div className="lv-layer">
      {Array.from({ length: 26 }, (_, i) => (
        <i
          key={i}
          className="lv"
          style={{ left: `${rnd(i) * 100}%`, '--sz': `${16 + rnd(i, 2) * 22}px`, '--dl': `${-rnd(i, 3) * 14}s`, '--du': `${10 + rnd(i, 4) * 9}s`, '--h': `${(rnd(i, 5) - 0.5) * 30}`, '--g': i % 3 === 0 ? '#C9D8A8' : i % 3 === 1 ? '#9DB77E' : '#E3C58A' } as CSSProperties}
        />
      ))}
      </div>
      <div className="lv-wash" aria-hidden />
    </div>
  )
}
