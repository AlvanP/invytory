import { useCallback, useEffect, useState } from 'react'
import {
  MUSIC_END_FADE_SECONDS,
  MUSIC_MAX_SECONDS,
  MUSIC_START_FADE_SECONDS,
  MUSIC_VOLUME,
} from '@/utils/musicLimits'

/** What the page needs to know to draw the mute button. */
interface MusicView {
  /** The guest has tapped the entrance, so sound is allowed. */
  started: boolean
  muted: boolean
  /** The browser refused to start sound; the button starts it instead. */
  needsTap: boolean
  /** The track could not be loaded or played. */
  failed: boolean
}

const INITIAL_VIEW: MusicView = { started: false, muted: false, needsTap: false, failed: false }

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}

function ignore() {
  // Intentionally empty: used for play() promises we don't need to await.
}

/**
 * Plays the background track for the guest page. A plain class rather
 * than React state, because timing (fades, restarts) has to carry on
 * between renders without being reset by them.
 *
 * Rules it follows:
 * - Sound only starts inside the guest's tap on the entrance (browsers
 *   block it otherwise, iPhones most strictly).
 * - A track plays at most MUSIC_MAX_SECONDS. Near that point, or near
 *   the natural end of a shorter track, it fades out and starts again
 *   from the beginning, for as long as the guest stays.
 * - When the wanted track changes (the guest opens another ceremony) the
 *   old one fades out and the new one fades in. The same track just
 *   keeps playing.
 * - The mute choice applies to every track for the rest of the visit.
 * - It pauses while the browser tab is hidden.
 * - Browsers that ignore the volume setting (iPhone Safari) skip the
 *   fades but follow every other rule.
 */
class MusicController {
  private audio: HTMLAudioElement | null = null
  private view: MusicView = INITIAL_VIEW
  private fadeTimer: number | null = null
  /** The track the guest should be hearing (set by the page). */
  private wantedUrl: string | null = null
  /** The track we have committed to play, which may still be fading in. */
  private targetUrl: string | null = null
  /** Bumped on every change so a stale fade callback can tell it is stale. */
  private token = 0
  private ending = false
  private started = false
  private resumeOnVisible = false

  private readonly notify: (view: MusicView) => void

  constructor(notify: (view: MusicView) => void) {
    this.notify = notify
  }

  // ---- called by the hook -------------------------------------------------

  /** Call from inside the guest's tap. */
  start = () => {
    if (this.started) return
    this.started = true
    this.update({ started: true })
    if (this.wantedUrl) {
      this.targetUrl = this.wantedUrl
      this.playTrack(this.wantedUrl)
    }
  }

  setUrl(url: string | null) {
    this.wantedUrl = url
    if (!this.started) return
    if (url === this.targetUrl) return

    this.targetUrl = url
    const token = ++this.token
    const audio = this.audio

    if (!url) {
      this.fadeTo(0, 0.8, () => {
        if (token === this.token) audio?.pause()
      })
      return
    }
    if (audio && !audio.paused) {
      this.fadeTo(0, 0.7, () => {
        if (token === this.token) this.playTrack(url)
      })
    } else {
      this.playTrack(url)
    }
  }

  toggle = () => {
    if (this.view.needsTap) {
      // The browser had blocked sound. This click is a real gesture, so retry.
      this.setMuted(false)
      if (this.targetUrl) this.playTrack(this.targetUrl)
      return
    }
    this.setMuted(!this.view.muted)
  }

  onVisibility = () => {
    const audio = this.audio
    if (!audio || !this.started) return
    if (document.hidden) {
      if (!audio.paused) {
        this.resumeOnVisible = true
        audio.pause()
      }
    } else if (this.resumeOnVisible) {
      this.resumeOnVisible = false
      audio.play().catch(ignore)
    }
  }

  /** Stops everything. Safe to call and then use again (React dev mode does). */
  destroy() {
    this.clearFade()
    this.token++
    if (this.audio) {
      this.audio.removeEventListener('timeupdate', this.onTimeUpdate)
      this.audio.removeEventListener('ended', this.onEnded)
      this.audio.removeEventListener('error', this.onError)
      this.audio.pause()
      this.audio.removeAttribute('src')
      this.audio.load()
      this.audio = null
    }
    this.started = false
    this.targetUrl = null
    this.ending = false
    this.resumeOnVisible = false
    this.view = { ...INITIAL_VIEW, muted: this.view.muted }
  }

  // ---- internals ----------------------------------------------------------

  private update(patch: Partial<MusicView>) {
    this.view = { ...this.view, ...patch }
    this.notify(this.view)
  }

  private setMuted(muted: boolean) {
    if (this.audio) this.audio.muted = muted
    this.update({ muted })
  }

  private getAudio(): HTMLAudioElement {
    if (!this.audio) {
      const audio = new Audio()
      audio.preload = 'auto'
      audio.addEventListener('timeupdate', this.onTimeUpdate)
      audio.addEventListener('ended', this.onEnded)
      audio.addEventListener('error', this.onError)
      this.audio = audio
    }
    return this.audio
  }

  private clearFade() {
    if (this.fadeTimer !== null) {
      window.clearInterval(this.fadeTimer)
      this.fadeTimer = null
    }
  }

  private fadeTo(target: number, seconds: number, done?: () => void) {
    this.clearFade()
    const audio = this.audio
    if (!audio) return
    const from = audio.volume
    if (seconds <= 0 || from === target) {
      audio.volume = clamp01(target)
      done?.()
      return
    }
    const startedAt = performance.now()
    this.fadeTimer = window.setInterval(() => {
      const progress = Math.min(1, (performance.now() - startedAt) / (seconds * 1000))
      audio.volume = clamp01(from + (target - from) * progress)
      if (progress >= 1) {
        this.clearFade()
        done?.()
      }
    }, 50)
  }

  private playTrack(url: string) {
    const audio = this.getAudio()
    this.token++
    this.ending = false
    this.clearFade()
    this.update({ failed: false })

    audio.src = url
    audio.currentTime = 0
    audio.volume = 0
    audio.muted = this.view.muted

    audio
      .play()
      .then(() => {
        this.update({ needsTap: false })
        this.fadeTo(MUSIC_VOLUME, MUSIC_START_FADE_SECONDS)
      })
      .catch((err: unknown) => {
        const name = err instanceof DOMException ? err.name : ''
        // AbortError just means a newer track replaced this one.
        if (name === 'NotAllowedError') this.update({ needsTap: true })
        else if (name !== 'AbortError') this.update({ failed: true })
      })
  }

  /** Start the current track again from the beginning, fading in. */
  private restart() {
    const audio = this.audio
    if (!audio || !this.targetUrl) return
    this.ending = false
    this.clearFade()
    audio.currentTime = 0
    audio.volume = 0
    audio
      .play()
      .then(() => this.fadeTo(MUSIC_VOLUME, MUSIC_START_FADE_SECONDS))
      .catch(ignore)
  }

  private onTimeUpdate = () => {
    const audio = this.audio
    if (!audio || audio.paused) return

    // A track longer than the cap is treated as ending at the cap. If the
    // browser can't tell the length yet, the cap alone decides.
    const length = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : Infinity
    const end = Math.min(MUSIC_MAX_SECONDS, length)
    const remaining = end - audio.currentTime

    if (remaining <= 0.25) {
      this.restart()
      return
    }
    if (!this.ending && remaining <= MUSIC_END_FADE_SECONDS) {
      this.ending = true
      this.fadeTo(0, Math.max(0.5, remaining - 0.1))
    }
  }

  private onEnded = () => {
    this.restart()
  }

  private onError = () => {
    console.warn('[music] the track could not be loaded')
    this.update({ failed: true })
  }
}

export interface InvitationMusic {
  /** Pass to the entrance so it runs inside the guest's tap. */
  start: () => void
  /** Whether to show the mute button. */
  visible: boolean
  muted: boolean
  /** True when the browser blocked sound and the button should start it. */
  needsTap: boolean
  toggle: () => void
}

/**
 * Background music for the guest page. Give it the URL that should be
 * playing right now (or null for silence); it handles the rest.
 */
export function useInvitationMusic(url: string | null): InvitationMusic {
  const [view, setView] = useState<MusicView>(INITIAL_VIEW)
  // Created once; the controller then lives as long as the page does.
  const [controller] = useState(() => new MusicController(setView))

  useEffect(() => {
    controller.setUrl(url)
  }, [controller, url])

  useEffect(() => {
    document.addEventListener('visibilitychange', controller.onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', controller.onVisibility)
      controller.destroy()
    }
  }, [controller])

  const start = useCallback(() => controller.start(), [controller])
  const toggle = useCallback(() => controller.toggle(), [controller])

  return {
    start,
    toggle,
    visible: view.started && !!url && !view.failed,
    muted: view.muted,
    needsTap: view.needsTap,
  }
}
