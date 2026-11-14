/**
 * The one song that plays while a template is being previewed on the public pages. A preview asks for
 * its song while it is on screen and lets go when it scrolls away, and the song stops. Browsers only
 * allow sound after the visitor has touched the page, so a song asked for earlier starts at the first touch.
 */
type Listener = () => void

const MUTE_KEY = 'invytory:preview-muted'
const wants = new Map<string, string>() // preview id -> song url, in the order they asked
const listeners = new Set<Listener>()
let audio: HTMLAudioElement | null = null
let playingUrl: string | null = null
let blocked = false
let muted = false
try {
  muted = localStorage.getItem(MUTE_KEY) === '1'
} catch {
  // not available: sound stays on
}

const notify = () => listeners.forEach((l) => l())
const currentWant = () => Array.from(wants.values()).pop() ?? null

function sync() {
  const url = currentWant()
  if (!url || muted) {
    if (audio) audio.pause()
    playingUrl = null
    notify()
    return
  }
  if (!audio) {
    audio = new Audio()
    audio.loop = true
    audio.preload = 'auto'
  }
  if (playingUrl !== url) {
    audio.src = url
    playingUrl = url
  }
  audio.volume = 0.6
  audio
    .play()
    .then(() => {
      blocked = false
      notify()
    })
    .catch(() => {
      blocked = true
      notify()
    })
}

function unlock() {
  if (blocked && currentWant() && !muted) sync()
}
if (typeof window !== 'undefined') {
  for (const ev of ['pointerdown', 'touchstart', 'keydown', 'click']) window.addEventListener(ev, unlock, { passive: true })
}

export const previewMusic = {
  /** A preview came on screen and wants this song. */
  request(id: string, url: string) {
    wants.delete(id)
    wants.set(id, url)
    sync()
  },
  /** A preview left the screen. */
  release(id: string) {
    if (!wants.delete(id)) return
    sync()
  },
  toggleMute() {
    muted = !muted
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
    } catch {
      // fine
    }
    sync()
  },
  /** For the sound button: is there a song, is it muted, is it waiting for a first touch. */
  state: () => ({ active: currentWant() !== null, muted, waiting: blocked && !muted }),
  subscribe(l: Listener) {
    listeners.add(l)
    return () => void listeners.delete(l)
  },
}
