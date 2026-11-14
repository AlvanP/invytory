/**
 * Templates whose entrance is a real video, played when the guest taps. The files live in
 * public/entrance/ and are named after the template: public/entrance/<template id>.mp4.
 * A template without its file (or with a broken one) quietly uses its built-in entrance.
 *
 * To give another template a video, add its id here and drop `<id>.mp4` in public/entrance/.
 */
export const VIDEO_ENTRANCE_IDS = ['classic-elegance', 'garden-romance', 'modern-luxury', 'birthday-golden-hour'] as const

export function videoEntranceSrc(templateId?: string): string | null {
  if (!templateId || !(VIDEO_ENTRANCE_IDS as readonly string[]).includes(templateId)) return null
  return `/entrance/${templateId}.mp4`
}
