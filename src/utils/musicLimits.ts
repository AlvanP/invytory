/**
 * The music rules in one place. Change a number here and every part of
 * the app (upload checks, wording, the player) follows.
 *
 * The upload size limit is ALSO set on the storage bucket itself in
 * docs/sql/music.sql (15728640 bytes). If you change MUSIC_MAX_BYTES,
 * change the bucket's limit to match.
 */

/** Largest music file a couple can upload: 15 MB (~8 min at 256 kbps). */
export const MUSIC_MAX_BYTES = 15 * 1024 * 1024

/** Playback length cap. A longer track plays only this much, then fades
 * out and starts again from the beginning. The file itself is not cut. */
export const MUSIC_MAX_SECONDS = 8 * 60

/** How long the fade-out lasts at the end of a track or at the cap. */
export const MUSIC_END_FADE_SECONDS = 3

/** How long a fade-in lasts when a track starts or restarts. */
export const MUSIC_START_FADE_SECONDS = 1.5

/** Playback volume, 0 to 1. Kept below full so guests can talk over it. */
export const MUSIC_VOLUME = 0.6

/** File types a couple may upload, with the type we tell storage about. */
export const MUSIC_TYPES_BY_EXTENSION: Record<string, string> = {
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
}

export function formatMusicMegabytes(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))} MB`
}

/** 480 -> "8:00" */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(s / 60)
  const seconds = s % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
