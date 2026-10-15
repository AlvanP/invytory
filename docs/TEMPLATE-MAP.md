# Template map

Every invitation, in every design, is built from the **same 11 sections in the same order**. A section is skipped when the couple has nothing for it (no dress code, no photos...). What makes each template different is its **colour, cover, lettering, motif and section rhythm**, plus the artwork you add.

This file is the map for designing artwork section by section. The code lives in `src/templates/`: `sections.ts` (the list), `sections/` (one file per section), `designs.ts` (each template's look).

## 1. The sections

| # | Section id | Shows | Comes from | Optional? |
|---|---|---|---|---|
| 1 | `cover` | The couple’s names, date, time and venue over the hero photo | Names, date, time, venue, hero photo | Always shown |
| 2 | `countdown` | The date in large type (scratch-to-reveal in some designs), the countdown and Save the Date buttons | Date, time | Always shown |
| 3 | `details` | Date, time and reception information in cards | Date, time, reception info | Always shown |
| 4 | `venue` | The venue, its address and an Open in Maps button | Venue name, address, city, map link | Skipped when empty |
| 5 | `dresscode` | The dress code with the colour of the day | Dress code, colour of the day | Skipped when empty |
| 6 | `story` | How they met, their story and their vows | Love story, how we met, vows | Skipped when empty |
| 7 | `moment` | One photo in a minimal frame that tilts as guests scroll | Floating photo | Skipped when empty |
| 8 | `gallery` | Up to four photos that guests swipe through to the left | Slider photos | Skipped when empty |
| 9 | `rsvp` | Yes / no, name, guests and a message | RSVP message | Always shown |
| 10 | `gifts` | Gift information and any additional message | Gift information, additional message | Skipped when empty |
| 11 | `footer` | The names, the wedding hashtag and the sign-off | Names, hashtag | Always shown |

### Photos (6 at most)
1. **Hero photo** — the big photo in the cover (section 1). Dark overlay with names over it in the full-width and stacked covers.
2. **Floating photo** — one photo in a thin offset frame that tilts as guests scroll (section 7, `moment`).
3. **Slider photos (up to 4)** — guests swipe these to the left (section 8, `gallery`).

## 2. The templates, by collection

### White wedding

| Template id | Name | Colour | Cover | Names | Motif | Notes |
|---|---|---|---|---|---|---|
| `classic-elegance` | Classic Elegance | #9A7B4A | Photo in an arch | Flowing script | Floral sprigs | Date is scratched off to reveal Free |
| `garden-romance` | Garden Romance | #6F8A5F | Full-width photo, dark overlay | Flowing script | Leaf sprigs |  Free |
| `modern-luxury` | Modern Luxury | #2A2623 | Photo on top, names on colour | Spaced capitals | Plain line |  Premium |

### Igbo

| Template id | Name | Colour | Cover | Names | Motif | Notes |
|---|---|---|---|---|---|---|
| `igbo-design-1` | Coral Crown | #C4472D | Full-width photo, dark overlay | Flowing script | Uli curves |  Premium |
| `igbo-design-2` | Mahogany Gold | #5A2A1C | Photo in an arch | Elegant serif | Uli curves |  Premium |
| `african-royal` | Ozo Regalia | #A3201F | Photo on top, names on colour | Spaced capitals | Uli curves |  Premium |

### Yoruba

| Template id | Name | Colour | Cover | Names | Motif | Notes |
|---|---|---|---|---|---|---|
| `yoruba-design-1` | Aso-Oke Blue | #1F3FA6 | Full-width photo, dark overlay | Flowing script | Adire diamonds |  Premium |
| `yoruba-design-2` | Gele Purple | #5B2A86 | Photo in an arch | Flowing script | Adire diamonds |  Free |
| `royal-door` | Palace Navy | #14264F | Photo on top, names on colour | Elegant serif | Adire diamonds |  Premium |

### Hausa

| Template id | Name | Colour | Cover | Names | Motif | Notes |
|---|---|---|---|---|---|---|
| `hausa-design-1` | Emerald Arabesque | #0B6B4B | Full-width photo, dark overlay | Elegant serif | Arabesque star |  Premium |
| `hausa-design-2` | Crimson Sands | #8E1B34 | Photo in an arch | Flowing script | Arabesque star |  Free |
| `storybook` | Storybook | #12727A | Photo on top, names on colour | Elegant serif | Arabesque star |  Premium |

## 3. Which sections are colour blocks in each template

B = a block of the couple's colour, s = a soft tint of it, p = plain paper.

| Template | cover | countdown | details | venue | dresscode | story | moment | gallery | rsvp | gifts | footer |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Classic Elegance | B | s | p | s | p | s | p | s | B | p | B |
| Garden Romance | B | p | s | p | s | s | p | s | B | p | B |
| Modern Luxury | B | p | s | p | s | p | s | p | B | p | B |
| Coral Crown | B | B | p | s | p | s | p | s | B | p | B |
| Mahogany Gold | B | s | s | p | s | s | p | s | B | p | B |
| Ozo Regalia | B | B | p | s | p | p | s | p | B | p | B |
| Aso-Oke Blue | B | B | p | s | p | s | p | s | B | p | B |
| Gele Purple | B | s | s | p | s | s | p | s | B | p | B |
| Palace Navy | B | B | p | s | p | p | s | p | B | p | B |
| Emerald Arabesque | B | B | p | s | p | s | p | s | B | p | B |
| Crimson Sands | B | s | s | p | s | s | p | s | B | p | B |
| Storybook | B | s | p | s | p | p | s | p | B | p | B |

## 4. Artwork, section by section

Put image files in `src/assets/templates/<template-id>/`. The name is the **section id + a dash + the piece**. No code changes: the site picks them up by name. Any piece you do not supply keeps the drawn version.

| Piece | File name | What it is | Size | Format |
|---|---|---|---|---|
| Background | `<section>-bg` | Fills the whole section behind its writing | 1080 x 1600 px | JPG or PNG |
| Divider | `<section>-divider` | Replaces the small drawing above the section title | 600 x 100 px, transparent | PNG or SVG |
| Corner | `<section>-corner` | A flourish for the top-left corner (the same image is turned round for the bottom-right) | 400 x 400 px, transparent | PNG or SVG |

Example: `src/assets/templates/classic-elegance/venue-divider.png` replaces the floral divider in the Venue & map section of Classic Elegance only.

The cover keeps its own pieces: `cover-background` (behind the cover when there is no hero photo) and the entrance files (see `ARTWORK-BRIEF.md`).

**Keep backgrounds quiet.** Text sits straight on a background, so use pale, low-contrast artwork, or keep the busy part to the edges. A section's text is dark on light sections and automatically light or dark on colour blocks.

Section ids you can use: `cover`, `countdown`, `details`, `venue`, `dresscode`, `story`, `moment`, `gallery`, `rsvp`, `gifts`, `footer`.
