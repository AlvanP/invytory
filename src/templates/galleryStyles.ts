/**
 * Which photo gallery each template uses. Four styles are shared around the templates,
 * so designs feel different without every template needing its own gallery.
 *   zoom      one photo at a time; each new photo zooms out into place as the last one zooms in and leaves
 *   spotlight the photo in the middle is large and the ones beside it are small and faded
 *   deck      photos in a pile of prints: swipe or tap to send the top one away
 *   mosaic    all the photos at once in an editorial layout; tap one to see it large
 */
export type GalleryStyle = 'zoom' | 'spotlight' | 'deck' | 'mosaic'

const styles: Record<string, GalleryStyle> = {
  'classic-elegance': 'zoom',
  'garden-romance': 'zoom',
  'royal-door': 'zoom',
  'dedication-golden-grace': 'zoom',
  'birthday-midnight-party': 'zoom',
  'corporate-summit': 'zoom',
  'funeral-life-celebrated': 'zoom',

  'modern-luxury': 'spotlight',
  'african-royal': 'spotlight',
  'dedication-royal-heritage': 'spotlight',
  'birthday-confetti-pop': 'spotlight',
  'corporate-boardroom': 'spotlight',
  'funeral-white-lily': 'spotlight',

  storybook: 'deck',
  'dedication-blush-blessing': 'deck',
  'dedication-little-lamb': 'deck',
  'birthday-golden-hour': 'deck',

  'dedication-heavenly-blue': 'mosaic',
  'corporate-gala': 'mosaic',
  'funeral-serene': 'mosaic',
}

export function galleryStyleFor(templateId: string | undefined): GalleryStyle {
  return styles[(templateId ?? '').toLowerCase()] ?? 'zoom'
}
