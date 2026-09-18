md

# Roadmap: Multi-Ceremony Wedding Engine

> **Status: Not implemented. Documentation only.**
> This document captures a confirmed future direction for Invytory. No
> code, routes, database tables, or UI described here exist yet. Do not
> build against this document until explicitly instructed to begin.
> Until then, the app continues to operate on the current model: one
> invitation = one ceremony, one date, one venue.

## Why this exists

Invytory is built specifically for Nigerian weddings, where a single
wedding almost never means a single event. A couple may hold:

- White Wedding only
- Traditional Wedding only
- White + Traditional Wedding
- White + multiple Traditional ceremonies (e.g. separate Igbo and
  Yoruba ceremonies for a mixed-heritage couple)
- A Reception treated as its own ceremony

These ceremonies may happen on the same day, weeks apart, or months
apart. The system must never assume all ceremonies of one wedding
share a date, venue, or dress code — each is independent.

## Core relationship

The target data model is one **Wedding** owning many **Ceremonies**:

Wedding
├── Ceremony 1 (e.g. Igbo Traditional)
├── Ceremony 2 (e.g. White Wedding)
└── Ceremony 3 (e.g. Reception — optional)

- One organizer dashboard per **Wedding**.
- Each **Ceremony** has its own fully independent set of details: date,
  time, venue, address, dress code, gallery, story (optional), RSVP
  (optional), and design template.
- A Wedding can have as few as one Ceremony (today's model is really
  just the single-ceremony case of this).

## Ceremony types (v1 scope)

- White Wedding
- Igbo Traditional Wedding
- Yoruba Traditional Wedding
- Hausa Traditional Wedding
- Custom Traditional Ceremony (for other Nigerian ethnic traditions not
  yet named individually)

## Design Collections (replaces the current flat template list)

Templates stop being one flat list (Royal Door, Garden Romance, etc.)
and become organized into **Collections**, each tied to a ceremony
type:

1. White Wedding Collection
2. Igbo Traditional Collection
3. Yoruba Traditional Collection
4. Hausa Traditional Collection

Each Collection will eventually hold multiple premium templates,
designed by the product owner, differing in entrance style, decorative
assets, typography, motion language, layout, and cultural aesthetic.
Illustrative direction already given:

- **Igbo** → coral, Isi Agu pattern, royal motifs
- **Yoruba** → Aso-Oke, gold, palace elegance
- **Hausa** → Northern geometric luxury
- **White** → cathedral, floral, modern luxury

This extends — not replaces — the existing template engine
architecture (`src/templates/registry.ts`, `entranceConfig.ts`,
`toneStyles.ts`). The same "shared body + swappable renderer" pattern
applies; templates simply get grouped under a `collection` field
alongside their existing `category`.

## Guest experience

Guests still receive **one invitation link only**, regardless of how
many ceremonies the wedding has. After the opening entrance animation:

- If the wedding has exactly one ceremony: behaves exactly like today
  — straight into that ceremony's invitation content.
- If the wedding has multiple ceremonies: guests see a **ceremony
  selector** before the invitation content, e.g.:

Celebrate With Us

Igbo Traditional Wedding — 8 Aug 2027
White Wedding — 22 Aug 2027

Selecting a ceremony opens that specific ceremony's full invitation
experience (its own hero, story, gallery, venue, and RSVP).

- Each ceremony may have its own RSVP, independently tracked, while
  still rolling up under the same Wedding in the organizer's dashboard.

## What this changes about today's architecture (future work, not now)

When this is eventually built, expect these areas to be touched:

- **Database**: introduce a `weddings` table and a `ceremonies` table;
  today's single `invitations` table effectively becomes `ceremonies`
  scoped under a parent `weddings` row. Existing single-ceremony
  invitations migrate as a Wedding with exactly one Ceremony.
- **Types**: a new `Wedding` type wrapping one or more `Ceremony`
  entries; `WeddingInvitation` as it exists today becomes closer to
  today's shape but scoped per-ceremony.
- **Guest-facing route**: `/invitation/:slug` gains a ceremony-selector
  screen inserted between the entrance (`ArrivalScene`) and the
  invitation body, only shown when a wedding has more than one
  ceremony.
- **Creation wizard**: gains a step to add/manage multiple ceremonies
  per wedding, each going through its own template/details/photos
  flow.
- **Dashboard**: one wedding-level overview, with ceremony-level detail
  views nested underneath (similar in spirit to today's
  events → guests drill-down).
- **Template engine**: templates gain a `collection` field; the
  gallery and creation wizard filter/group by collection.

None of this is scheduled yet. This document exists so the current
single-ceremony architecture keeps this future shape in mind (e.g. not
naming things in a way that would be painful to generalize later), but
no ceremony-related code should be written until explicitly requested.
