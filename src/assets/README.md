# Template artwork: drop your files here

Your artwork goes in a **folder named after the design**, inside this folder.
Save the file with the exact slot name below, push, and the site uses it. There is no
code or config to edit. Anything you leave out keeps the built-in placeholder.

```
src/assets/templates/
  igbo-design-1/
    preview.jpg
    entrance-left.png
    entrance-right.png
  yoruba-design-1/
    preview.jpg
    entrance-cover.png
```

## Folder names (must match exactly, all lowercase)

| Collection | Folder names                                          |
| ---------- | ----------------------------------------------------- |
| White      | `garden-romance`, `modern-luxury`, `classic-elegance` |
| Igbo       | `igbo-design-1`, `igbo-design-2`                      |
| Yoruba     | `yoruba-design-1`, `yoruba-design-2`                  |
| Hausa      | `hausa-design-1`, `hausa-design-2`                    |
| Universal  | `royal-door`, `storybook`, `african-royal`            |

A new design gets its folder name from its `id` in `src/data/templates.ts`.

## File names (slots) and sizes

| File name             | Where it shows                                                                     | Size to design at                                               |
| --------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `preview`             | The thumbnail in the template picker, the gallery and the home page                | 600 x 800 px (3:4, portrait)                                    |
| `entrance-left`       | Left half of the doors / gate that open                                            | 540 x 2340 px, seam on its right edge                           |
| `entrance-right`      | Right half of the doors / gate                                                     | 540 x 2340 px, seam on its left edge                            |
| `entrance-cover`      | Book cover, shown on a card in the middle of the screen                            | 800 x 1000 px (4:5)                                             |
| `entrance-envelope`   | The closed envelope, with its fold line at the vertical centre                     | 900 x 600 px (3:2)                                              |
| `entrance-seal`       | Wax seal or emblem in the middle of the envelope                                   | 200 x 200 px, transparent PNG                                   |
| `entrance-background` | Full-screen backdrop behind the entrance                                           | 1080 x 2340 px                                                  |
| `cover-background`    | Backdrop behind the opening section of the invitation (names and photo sit on top) | 1080 x 1600 px; keep the middle calm so the text stays readable |

Allowed formats: PNG, JPG, WEBP or SVG. Use PNG when parts must be see-through.

Phones differ in height, so the picture is trimmed a little at the edges to fill the screen.
Keep anything important (handles, crests, the seam) at least 8% away from the outer edges.
For doors, design ONE full double door at 1080 x 2340 px, then export its left half and right
half as two files of 540 x 2340 px.

## How the opening style is chosen

The opening animation (doors, gate, book or envelope) normally follows the design's look.
If you supply artwork for a different style, the style follows your artwork:

- `entrance-left` **and** `entrance-right` together make doors,
- `entrance-cover` makes a book,
- `entrance-envelope` makes an envelope.

Supply both left and right, never just one. You only design the closed state. The
opening animation is done by the site.

## Tips

- Keep each file under about 500 KB. Entrance art loads before a guest can open the
  invitation, often on mobile data. JPG (quality 80) or WEBP for big photographic art.
- The slot name is not case-sensitive, but spelling is: `entrance-left`, not `entrance_left`.
- Files with other names are ignored, so a typo means "nothing happens", not an error.
- Test on a real phone after pushing: guests see the entrance full screen in portrait.

## When you want a whole new layout, not just images

Images fill slots in the existing layouts. A genuinely new layout (different section
order, fonts, patterns, motion) needs a new template component. Send the finished design
and the template id, name and collection, and I will build it and register it.

## Layered 3D entrances (newer)

The gatefold doors with a bow, and the wax-seal envelope, use extra files: `entrance-bow`,
`entrance-inside`, `entrance-flap`. All the sizes and drawing instructions are in
`docs/ARTWORK-BRIEF.md`. To preview any design on your phone before publishing, open
`/entrance-lab` on the live site.
