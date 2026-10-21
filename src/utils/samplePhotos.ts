/**
 * Drop-in photographs for the sample invitations (phone mockups, template previews)
 * and for the guest-album phone on the home page. See src/assets/samples/README.md.
 * A missing file is fine: the drawn picture is used instead.
 */
const sampleFiles = import.meta.glob('../assets/samples/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const albumFiles = import.meta.glob('../assets/landing/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

function index(files: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [path, url] of Object.entries(files)) {
    const m = path.match(/\/([^/]+)\.[a-z]+$/i)
    if (m) out[m[1].toLowerCase()] = url
  }
  return out
}

const samples = index(sampleFiles)
const album = index(albumFiles)

/**
 * Looks for `<name>` for this design first (e.g. `igbo-design-1-hero`), then for its
 * ceremony family (`igbo-hero`), then for its event kind (`wedding-hero`).
 */
export function samplePhoto(name: 'hero' | 'gallery-1' | 'gallery-2' | 'gallery-3' | 'gallery-4', templateId: string, collection: string, kind: string): string | undefined {
  return (
    samples[`${templateId}-${name}`.toLowerCase()] ??
    (kind === 'wedding' ? samples[`${collection}-${name}`] : undefined) ??
    samples[`${kind}-${name}`]
  )
}

/** `album-1` to `album-6`: the photos shown on the phone in the guest-album section. */
export function albumPhoto(n: number): string | undefined {
  return album[`album-${n}`]
}
