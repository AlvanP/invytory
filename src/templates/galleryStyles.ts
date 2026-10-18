/**
 * Which photo gallery each template uses. Seven styles are shared around the templates,
 * so designs feel different without every template needing its own gallery.
 *   slider    the classic: photos in a row that guests swipe through
 *   zoom      one photo at a time; each new photo zooms out into place as the last one zooms in and leaves
 *   spotlight the photo in the middle is large and the ones beside it are small and faded
 *   deck      photos in a pile of prints: swipe or tap to send the top one away
 *   mosaic    all the photos at once in an editorial layout; tap one to see it large
 *   frames    a column of framed photos, each rising into place with the next stacking below
 *   cascade   prints pinned one over another as you scroll down
 */
export type GalleryStyle = 'slider' | 'zoom' | 'spotlight' | 'deck' | 'mosaic' | 'frames' | 'cascade'

const styles: Record<string, GalleryStyle> = {
  'classic-elegance': 'frames',
  'garden-romance': 'zoom',
  'modern-luxury': 'spotlight',
  'african-royal': 'slider',
  'royal-door': 'cascade',
  storybook: 'deck',

  'dedication-heavenly-blue': 'mosaic',
  'dedication-blush-blessing': 'deck',
  'dedication-golden-grace': 'frames',
  'dedication-little-lamb': 'slider',
  'dedication-royal-heritage': 'spotlight',

  'birthday-confetti-pop': 'cascade',
  'birthday-golden-hour': 'zoom',
  'birthday-midnight-party': 'slider',

  'corporate-boardroom': 'spotlight',
  'corporate-summit': 'zoom',
  'corporate-gala': 'mosaic',

  'funeral-serene': 'frames',
  'funeral-life-celebrated': 'slider',
  'funeral-white-lily': 'cascade',
}

export function galleryStyleFor(templateId: string | undefined): GalleryStyle {
  return styles[(templateId ?? '').toLowerCase()] ?? 'slider'
}
