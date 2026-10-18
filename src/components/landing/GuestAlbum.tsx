import { useMemo } from 'react'
import { Download, Camera } from 'lucide-react'
import { Link } from 'react-router-dom'
import { sampleArt } from '@/data/sampleInvitations'
import { RevealOnScroll } from '@/components/animation/RevealOnScroll'

/** A stand-in QR code (not scannable), drawn the same way every time. */
function FakeQr() {
  const cells = useMemo(() => {
    const n = 21
    const out: [number, number][] = []
    let seed = 7
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const inFinder = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)
        if (inFinder) continue
        seed = (seed * 9301 + 49297) % 233280
        if (seed / 233280 > 0.52) out.push([x, y])
      }
    return out
  }, [])
  const finder = (x: number, y: number) => (
    <g transform={`translate(${x} ${y})`}>
      <rect width="7" height="7" fill="#2A1B1E" />
      <rect x="1" y="1" width="5" height="5" fill="#fff" />
      <rect x="2" y="2" width="3" height="3" fill="#2A1B1E" />
    </g>
  )
  return (
    <svg viewBox="0 0 21 21" className="size-full" aria-hidden shapeRendering="crispEdges">
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#2A1B1E" />
      ))}
      {finder(0, 0)}
      {finder(14, 0)}
      {finder(0, 14)}
    </svg>
  )
}

const tiles = [
  { c: '#B9788A', s: 0, h: 'h-28' },
  { c: '#4F7FA6', s: 1, h: 'h-20' },
  { c: '#946F27', s: 2, h: 'h-20' },
  { c: '#6E8F78', s: 3, h: 'h-28' },
  { c: '#D2452A', s: 4, h: 'h-24' },
  { c: '#2F3E73', s: 2, h: 'h-24' },
]

/** The guest album: the feature that follows the event. Dark section, so it stands apart. */
export function GuestAlbum() {
  return (
    <section id="album" className="bg-wine text-ivory">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <div className="order-2 lg:order-1">
          <h2 className="max-w-md font-brand text-4xl leading-tight sm:text-5xl">Every photo from the day, in one album</h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ivory/80">
            Guests tap the invitation, or scan the QR code on the table card, and add the photos they took. No app and no sign-up.
          </p>
          <ul className="mt-8 flex max-w-md flex-col gap-4 text-base">
            <li className="flex gap-3">
              <Camera className="mt-1 size-5 shrink-0 text-amber" strokeWidth={1.5} />
              <span>One tap to upload, from any phone.</span>
            </li>
            <li className="flex gap-3">
              <Download className="mt-1 size-5 shrink-0 text-amber" strokeWidth={1.5} />
              <span>You find them all in one album, and download a single photo or the whole album in full quality.</span>
            </li>
          </ul>
          <p className="mt-8 text-sm text-ivory/70">
            Included in the Signature plan.{' '}
            <Link to="/pricing" className="underline decoration-ivory/40 underline-offset-4 hover:decoration-ivory">
              See pricing
            </Link>
          </p>
        </div>

        <RevealOnScroll className="order-1 lg:order-2">
          <div className="relative mx-auto h-[26rem] w-full max-w-md">
            {/* the table card */}
            <div className="absolute left-0 top-10 w-44 -rotate-6 rounded-md bg-ivory p-4 text-center text-ink shadow-2xl sm:w-48">
              <p className="font-brand text-xl leading-tight text-wine">Share your photos with us</p>
              <div className="mx-auto mt-3 aspect-square w-28 rounded-sm border border-wine/15 bg-white p-2">
                <FakeQr />
              </div>
              <p className="mt-3 text-xs text-ink-soft">Scan. Tap. Done.</p>
            </div>
            {/* the album on a phone */}
            <div className="absolute right-0 top-0 w-52 rotate-3 rounded-[2rem] bg-[#1d1214] p-[5px] shadow-2xl sm:w-56">
              <div className="overflow-hidden rounded-[1.7rem] bg-ivory px-3 pb-4 pt-7 text-ink">
                <p className="font-brand text-lg leading-tight text-wine">Mirabel and Gabriel</p>
                <p className="text-xs text-ink-soft">128 photos from your guests</p>
                <div className="mt-3 grid grid-cols-2 items-start gap-2">
                  {tiles.map((t, i) => (
                    <img key={i} src={sampleArt(t.c, t.s)} alt="" className={`w-full rounded-md object-cover ${t.h}`} />
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-wine py-2 text-xs font-medium text-ivory">
                  <Download className="size-3.5" /> Download all
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
