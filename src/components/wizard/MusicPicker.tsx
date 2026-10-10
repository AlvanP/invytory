import { useEffect, useRef, useState } from 'react'
import { Loader2, Music, Pause, Play, Upload } from 'lucide-react'
import type { CeremonyDraft } from '@/types'
import { musicService, type MusicTrack } from '@/services/musicService'
import { collectionForCeremonyType, COLLECTION_LABELS } from '@/utils/templateCollections'
import {
  MUSIC_MAX_BYTES,
  MUSIC_MAX_SECONDS,
  formatDuration,
  formatMusicMegabytes,
} from '@/utils/musicLimits'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

/**
 * Music for ONE ceremony: pick a track from our library, or upload your
 * own. Used inside the Photos & music step, which supplies the ceremony
 * and saves whatever this reports through `onChange`.
 */
export function MusicPicker({
  ceremony,
  onChange,
}: {
  ceremony: CeremonyDraft
  onChange: (patch: Partial<CeremonyDraft>) => void
}) {
  const [tracks, setTracks] = useState<MusicTrack[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [longNotice, setLongNotice] = useState<string | null>(null)
  const [rightsConfirmed, setRightsConfirmed] = useState(false)
  const previewRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    let cancelled = false
    musicService
      .listLibrary()
      .then((list) => {
        if (!cancelled) setTracks(list)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setLoadError(err instanceof Error ? err.message : 'Could not load the music library.')
        setTracks([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Stop any preview when leaving this ceremony's tab or the step.
  useEffect(() => {
    return () => {
      previewRef.current?.pause()
      previewRef.current = null
    }
  }, [])

  function stopPreview() {
    previewRef.current?.pause()
    setPreviewId(null)
  }

  function togglePreview(track: MusicTrack) {
    if (previewId === track.id) {
      stopPreview()
      return
    }
    previewRef.current?.pause()
    // A fresh element per preview, so an old one's events can't affect this one.
    const audio = new Audio(track.url)
    previewRef.current = audio
    audio.onended = () => setPreviewId(null)
    audio.onerror = () => {
      setPreviewId(null)
      setPreviewError('That track could not be played. Please try another.')
    }
    setPreviewError(null)
    audio
      .play()
      .then(() => setPreviewId(track.id))
      .catch(() => setPreviewId(null))
  }

  function chooseLibraryTrack(track: MusicTrack) {
    stopPreview()
    setLongNotice(null)
    setUploadError(null)
    onChange({ musicSource: 'library', musicUrl: track.url, musicTitle: track.title })
  }

  function removeMusic() {
    stopPreview()
    setLongNotice(null)
    onChange({ musicSource: null, musicUrl: null, musicTitle: null })
  }

  async function handleUpload(file: File) {
    stopPreview()
    setUploadError(null)
    setLongNotice(null)

    const problem = musicService.validateFile(file)
    if (problem) {
      setUploadError(problem)
      return
    }

    setUploading(true)
    try {
      const uploaded = await musicService.uploadMusic(file)
      onChange({ musicSource: 'upload', musicUrl: uploaded.url, musicTitle: uploaded.title })
      if (uploaded.durationSeconds && uploaded.durationSeconds > MUSIC_MAX_SECONDS) {
        setLongNotice(
          `This track is ${formatDuration(uploaded.durationSeconds)} long. Guests will hear the first ${formatDuration(MUSIC_MAX_SECONDS)}, then it fades out and starts again from the beginning.`
        )
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // Same idea as the template picker: this ceremony's own collection first,
  // then tracks that suit any ceremony, with the rest behind a toggle.
  const collection = collectionForCeremonyType(ceremony.ceremonyType)
  const all = tracks ?? []
  const primary = collection ? all.filter((t) => t.collection === collection) : all
  const universal = collection ? all.filter((t) => t.collection === 'universal') : []
  const others =
    collection && showAll ? all.filter((t) => t.collection !== collection && t.collection !== 'universal') : []

  function renderTrack(track: MusicTrack) {
    const selected = ceremony.musicUrl === track.url
    const playing = previewId === track.id
    return (
      <li
        key={track.id}
        className={cn(
          'flex items-center gap-3 rounded-sm border px-3 py-2',
          selected ? 'border-gold bg-gold/5' : 'border-ink/10 bg-white'
        )}
      >
        <button
          type="button"
          onClick={() => togglePreview(track)}
          aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink-soft hover:border-gold hover:text-ink"
        >
          {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-ink">{track.title}</p>
          <p className="truncate text-xs text-ink-soft">
            {[track.mood, track.durationSeconds ? formatDuration(track.durationSeconds) : null, track.artistCredit]
              .filter(Boolean)
              .join(' · ') || ' '}
          </p>
        </div>
        {selected ? (
          <Badge tone="confirmed">Selected</Badge>
        ) : (
          <Button type="button" size="sm" variant="outline" onClick={() => chooseLibraryTrack(track)}>
            Use
          </Button>
        )}
      </li>
    )
  }

  const hasSelection = !!ceremony.musicUrl

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium text-ink-soft">Music</p>
        <p className="mt-1 text-xs text-ink-soft/70">
          Plays softly when guests open this ceremony&rsquo;s invitation. Guests can mute it.
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-sm border border-ink/10 bg-white px-4 py-3">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <Music className="size-4 shrink-0 text-gold" />
          {hasSelection ? (
            <span className="truncate text-ink">
              {ceremony.musicTitle || 'Selected track'}
              <span className="text-ink-soft">
                {ceremony.musicSource === 'upload' ? ' · your upload' : ' · from our library'}
              </span>
            </span>
          ) : (
            <span className="text-ink-soft">No music for this ceremony</span>
          )}
        </div>
        {hasSelection && (
          <button
            type="button"
            onClick={removeMusic}
            className="shrink-0 text-xs text-ink-soft underline underline-offset-2 hover:text-ink"
          >
            Remove
          </button>
        )}
      </div>

      {longNotice && <p className="text-xs text-ink-soft">{longNotice}</p>}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs tracking-[0.15em] text-ink-soft">OUR LIBRARY</p>
          {collection && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="text-xs text-ink-soft underline-offset-2 hover:text-ink hover:underline"
            >
              {showAll ? `Show only ${COLLECTION_LABELS[collection]} music` : 'Show all music'}
            </button>
          )}
        </div>

        {!tracks && (
          <p className="flex items-center gap-2 text-xs text-ink-soft">
            <Loader2 className="size-3.5 animate-spin" /> Loading the library&hellip;
          </p>
        )}
        {loadError && <p className="text-xs text-danger">{loadError}</p>}
        {previewError && <p className="text-xs text-danger">{previewError}</p>}
        {tracks && tracks.length === 0 && !loadError && (
          <p className="text-xs text-ink-soft">
            Our music library is being prepared. You can upload your own song below.
          </p>
        )}

        {primary.length > 0 && <ul className="flex flex-col gap-2">{primary.map(renderTrack)}</ul>}

        {universal.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] tracking-[0.15em] text-ink-soft">WORKS WITH ANY CEREMONY</p>
            <ul className="flex flex-col gap-2">{universal.map(renderTrack)}</ul>
          </div>
        )}

        {others.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] tracking-[0.15em] text-ink-soft">OTHER COLLECTIONS</p>
            <ul className="flex flex-col gap-2">{others.map(renderTrack)}</ul>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-ink/10 pt-4">
        <p className="text-xs tracking-[0.15em] text-ink-soft">OR UPLOAD YOUR OWN</p>

        <label className="flex items-start gap-2 text-xs text-ink-soft">
          <input
            type="checkbox"
            checked={rightsConfirmed}
            onChange={(e) => setRightsConfirmed(e.target.checked)}
            className="mt-0.5"
          />
          <span>I own this music or have the right to use it in my invitation.</span>
        </label>

        <label
          className={cn(
            'inline-flex w-fit items-center gap-2 rounded-xs border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink transition-colors',
            rightsConfirmed && !uploading ? 'cursor-pointer hover:border-gold' : 'cursor-not-allowed opacity-50'
          )}
        >
          {uploading ? <Loader2 className="size-4 animate-spin text-gold" /> : <Upload className="size-4 text-gold" />}
          {uploading ? 'Uploading…' : 'Choose an MP3 or M4A file'}
          <input
            type="file"
            accept=".mp3,.m4a,.aac,audio/mpeg,audio/mp4,audio/x-m4a,audio/aac"
            className="hidden"
            disabled={!rightsConfirmed || uploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleUpload(file)
              e.target.value = ''
            }}
          />
        </label>

        <p className="text-xs text-ink-soft/70">
          Up to {formatMusicMegabytes(MUSIC_MAX_BYTES)}. Only the first {formatDuration(MUSIC_MAX_SECONDS)} plays; a longer
          song fades out and starts again.
        </p>

        {uploadError && <p className="text-sm text-danger">{uploadError}</p>}
      </div>
    </div>
  )
}
