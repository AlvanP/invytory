import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/utils/cn'
import type { EntranceAssets } from '@/templates/entranceConfig'

/**
 * The two "layered" entrances, built from separate transparent pictures that the
 * code moves in 3D (see docs/ARTWORK-BRIEF.md):
 *
 *  - Gatefold: two door leaves hinged at the outer edges, tied with a ribbon bow.
 *    The guest taps the bow, it pops away, the doors swing open and shade lifts
 *    off the invitation waiting behind them.
 *  - Wax envelope: a closed envelope whose top flap hinges open once the guest
 *    taps the wax seal.
 *
 * Every picture is optional: without art, simple drawn placeholders are shown so
 * the motion can still be tested.
 */

const EASE_HINGE = 'cubic-bezier(0.55, 0, 0.2, 1)'

/** All pieces live on one 1080 x 2340 canvas that always covers the screen, so
 * layers line up with each other on every phone shape. */
function Stage({ children }: { children: ReactNode }) {
  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        width: 'max(100vw, calc(100dvh * 1080 / 2340))',
        aspectRatio: '1080 / 2340',
        perspective: '1800px',
      }}
    >
      {children}
    </div>
  )
}

const keyframes = `
@keyframes ivSway { 0%,100% { transform: translate(-50%,-50%) rotate(-1.5deg); } 50% { transform: translate(-50%,-50%) rotate(1.5deg); } }
@keyframes ivPulse { 0%,100% { transform: translate(-50%,-50%) scale(1); } 50% { transform: translate(-50%,-50%) scale(1.06); } }
@media (prefers-reduced-motion: reduce) { .iv-idle { animation: none !important; } }
`

function BowPlaceholder() {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full drop-shadow-[0_6px_8px_rgba(0,0,0,0.25)]">
      <path d="M100 60 C60 5 5 15 10 55 C14 90 70 85 100 60Z" fill="#F6E7EA" stroke="#D9B8C0" strokeWidth="2" />
      <path d="M100 60 C140 5 195 15 190 55 C186 90 130 85 100 60Z" fill="#F6E7EA" stroke="#D9B8C0" strokeWidth="2" />
      <path d="M96 66 L60 118 L84 112 L100 78Z" fill="#EBD3D8" />
      <path d="M104 66 L140 118 L116 112 L100 78Z" fill="#EBD3D8" />
      <rect x="86" y="46" width="28" height="28" rx="10" fill="#F9EEF0" stroke="#D9B8C0" strokeWidth="2" />
    </svg>
  )
}

export function GatefoldVariant({
  triggered,
  assets,
  onTrigger,
}: {
  triggered: boolean
  assets?: EntranceAssets
  onTrigger: () => void
}) {
  const doorBase: CSSProperties = {
    backfaceVisibility: 'hidden',
    transition: `transform 1700ms ${EASE_HINGE} 420ms`,
    willChange: 'transform',
  }
  const doorPaper =
    'linear-gradient(90deg, rgba(0,0,0,0.04), rgba(255,255,255,0.10) 18%, rgba(0,0,0,0.03) 50%, rgba(255,255,255,0.12) 82%, rgba(0,0,0,0.06)), linear-gradient(180deg, #F3DDD8, #EAC9C3)'

  return (
    <>
      <style>{keyframes}</style>
      <Stage>
        {/* What the doors hide */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: assets?.inside ? `url(${assets.inside})` : 'linear-gradient(180deg, #FBF3EE, #F1E1DA)',
          }}
        />
        {/* Shade over the inside that lifts as the doors open, like light entering */}
        <div
          className="absolute inset-0 bg-black transition-opacity"
          style={{ opacity: triggered ? 0 : 0.5, transitionDuration: '1400ms', transitionDelay: '600ms' }}
        />

        {/* Left leaf, hinged on the left edge, swings away from the guest */}
        <div
          className="absolute inset-y-0 left-0 w-1/2 bg-cover bg-right"
          style={{
            ...doorBase,
            transformOrigin: 'left center',
            transform: triggered ? 'rotateY(112deg)' : 'rotateY(0deg)',
            backgroundImage: assets?.leftPanel ? `url(${assets.leftPanel})` : doorPaper,
          }}
        >
          {!assets?.leftPanel && (
            <div className="absolute inset-x-0 top-[47%] h-[5%] bg-gradient-to-b from-white/70 via-white/40 to-white/70" />
          )}
          <div
            className="absolute inset-0 bg-black transition-opacity"
            style={{ opacity: triggered ? 0.55 : 0, transitionDuration: '1700ms', transitionDelay: '420ms' }}
          />
        </div>

        {/* Right leaf, mirror image */}
        <div
          className="absolute inset-y-0 right-0 w-1/2 bg-cover bg-left"
          style={{
            ...doorBase,
            transformOrigin: 'right center',
            transform: triggered ? 'rotateY(-112deg)' : 'rotateY(0deg)',
            backgroundImage: assets?.rightPanel ? `url(${assets.rightPanel})` : doorPaper,
          }}
        >
          {!assets?.rightPanel && (
            <div className="absolute inset-x-0 top-[47%] h-[5%] bg-gradient-to-b from-white/70 via-white/40 to-white/70" />
          )}
          <div
            className="absolute inset-0 bg-black transition-opacity"
            style={{ opacity: triggered ? 0.55 : 0, transitionDuration: '1700ms', transitionDelay: '420ms' }}
          />
        </div>

        {/* The bow: the guest taps it. It lifts, turns and fades away. */}
        <button
          type="button"
          onClick={onTrigger}
          aria-label="Untie the ribbon to open the invitation"
          className={cn('iv-idle absolute left-1/2 top-1/2 z-10 aspect-[5/3] w-[42%]', !triggered && 'animate-[ivSway_3.4s_ease-in-out_infinite]')}
          style={{
            transform: triggered ? 'translate(-50%, -62%) scale(1.3) rotate(-10deg)' : undefined,
            opacity: triggered ? 0 : 1,
            transition: 'transform 700ms ease-out, opacity 600ms ease-out',
          }}
        >
          {assets?.bow ? <img src={assets.bow} alt="" className="h-full w-full object-contain" draggable={false} /> : <BowPlaceholder />}
        </button>
      </Stage>
    </>
  )
}

function SealPlaceholder({ initials }: { initials: string }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-full font-display text-[clamp(14px,5vw,26px)] tracking-wide text-[#8B5A62]"
      style={{
        background: 'radial-gradient(circle at 35% 30%, #F3D3D6, #D9A3AB 70%, #C98E97)',
        boxShadow: '0 6px 14px rgba(80,30,40,0.35), inset 0 2px 4px rgba(255,255,255,0.5)',
      }}
    >
      {initials}
    </div>
  )
}

export function WaxEnvelopeVariant({
  triggered,
  assets,
  initials,
  onTrigger,
}: {
  triggered: boolean
  assets?: EntranceAssets
  initials: string
  onTrigger: () => void
}) {
  return (
    <>
      <style>{keyframes}</style>
      <Stage>
        {/* Envelope body */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: assets?.envelope
              ? `url(${assets.envelope})`
              : 'linear-gradient(180deg, #EBD3C8, #E2C4B8)',
          }}
        >
          {!assets?.envelope && (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              <path d="M0 100 L50 55 L100 100" fill="none" stroke="rgba(120,70,60,0.18)" strokeWidth="0.25" />
              <path d="M0 0 L50 55 L100 0" fill="none" stroke="rgba(120,70,60,0.12)" strokeWidth="0.25" />
            </svg>
          )}
        </div>

        {/* Top flap: hinged on the top edge, folds up and away. Its tip meets the seal at 55% height. */}
        <div
          className="absolute left-0 top-0 w-full"
          style={{
            height: '55%',
            transformOrigin: 'top center',
            transformStyle: 'preserve-3d',
            transform: triggered ? 'rotateX(-175deg)' : 'rotateX(0deg)',
            transition: `transform 1500ms ${EASE_HINGE} 350ms`,
            willChange: 'transform',
          }}
        >
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
            {assets?.flap ? (
              <img
                src={assets.flap}
                alt=""
                className="h-full w-full drop-shadow-[0_8px_10px_rgba(60,30,25,0.28)]"
                draggable={false}
              />
            ) : (
              <div
                className="h-full w-full"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  background: 'linear-gradient(180deg, #F2DDD3, #E8CDC2)',
                  filter: 'drop-shadow(0 8px 8px rgba(60,30,25,0.3))',
                }}
              />
            )}
          </div>
          {/* Underside of the flap, seen once it has turned over */}
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}>
            {assets?.flap ? (
              <img src={assets.flap} alt="" className="h-full w-full" style={{ filter: 'brightness(0.92)' }} draggable={false} />
            ) : (
              <div
                className="h-full w-full"
                style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)', background: 'linear-gradient(180deg, #E4C9BE, #D9B9AD)' }}
              />
            )}
          </div>
        </div>

        {/* Wax seal: the tap target. It presses, cracks and fades. */}
        <button
          type="button"
          onClick={onTrigger}
          aria-label="Break the seal to open the invitation"
          className={cn('iv-idle absolute left-1/2 z-10 aspect-square w-[24%]', !triggered && 'animate-[ivPulse_2.4s_ease-in-out_infinite]')}
          style={{
            top: '55%',
            transform: triggered ? 'translate(-50%, -50%) scale(1.35)' : undefined,
            opacity: triggered ? 0 : 1,
            transition: 'transform 520ms ease-out, opacity 480ms ease-out',
            filter: 'drop-shadow(0 0 14px rgba(255,214,150,0.55))',
          }}
        >
          {assets?.seal ? <img src={assets.seal} alt="" className="h-full w-full object-contain" draggable={false} /> : <SealPlaceholder initials={initials} />}
        </button>
      </Stage>
    </>
  )
}