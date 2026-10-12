# Invytory build plan

Last updated: 12 Oct 2026. This is the working order of what gets built next.
Reorder freely; each item says what it depends on.

## Done and live

- Multi-ceremony weddings (wizard, hosting rules, one payment, ceremony selector).
- Per-ceremony template, photos and RSVP message.
- Design Collections (white / igbo / yoruba / hausa / universal) with tabbed pickers.
- Photo uploads (shrunk in the browser before upload; real error messages).
- Guest RSVP (anonymous guests can submit; the row is not read back).
- Duplicate-RSVP safeguard (per device), guest-list summary, ceremony "back" navigation.
- Edit-ceremony typing fix (modal no longer steals focus).
- Music: library + uploads per ceremony, tap-to-start player, 8:00 cap with fade and restart.
- Dashboard polish: guest CSV export, all-ceremonies guest list with ceremony filter,
  editing photos / music / RSVP message after publishing, lazy-loaded pages, unused mock files removed.

## Build order

### 1. Verify the current build on the live site (you)

Regression-test `tina-and-greg`, `ada-and-michael`, `mary-and-gregory`, then a fresh
two-ceremony wedding end to end, including a guest RSVP from a private window.

### 2. Music: BUILT, waiting for your database script and a phone test

Spec and decisions below. To switch it on:

1. Run `docs/sql/music.sql` once in the Supabase SQL Editor.
2. Add your tracks (see "Adding library tracks").
3. Test on a real iPhone and a real Android phone.

### 3. AI Wedding Assistant: BUILT, waiting for a free key in Vercel

"AI Assist" under Our Story, How We Met, Vows, Hashtag, Gift Information, Additional
Message and the per-ceremony RSVP message. Flow: add optional details, get a suggestion,
then Use text / Regenerate / Edit (hashtags: tap one of six).

- Free only. `api/ai-assist.ts` tries Groq first, then Google Gemini, using whichever
  free keys you add. See `docs/AI-SETUP.md` for the exact steps.
- Keys live only in Vercel settings. Model names are settings too (`GROQ_MODEL`,
  `GEMINI_MODEL`), so a retired model is fixed without a code change.
- Protection for the free quota: short prompts and answers, 6 requests a minute and 40 an
  hour per visitor, only our own website may call it. The limiter is best effort (each
  server instance counts separately).
- Hashtags still work with no AI at all (name-based suggestions).
- Gemini's free tier says content may be used to improve Google's products, so Groq is
  first and Gemini is the backup. Check both services' terms before launch.

### 4. Real Design Collection artwork

Your own designs replace the placeholder entries in `src/data/templates.ts`.

### 5. Dashboard polish: BUILT

Left over: editing names, dates and venues after publishing, and a settings page for
ceremony ids (the Settings page is still the old placeholder).

### 6. Entrance artwork integration

Your door/gate/book/envelope files go into the asset slots described in
`src/assets/entrances/README.md`.

### 7. Wholesale / planner accounts

The pricing table exists; no functionality yet.

### Standing reminders

- Rotate the Paystack test secret key before going live.
- Known gap: if payment succeeds but saving ceremonies fails, an empty wedding row can remain.
- RSVP duplicate safeguard is per device. A database rule on (invitation, name, phone)
  would also stop repeats from a second device.
- Anyone can upload to the `invitation-music` bucket (the wizard works before sign-in).
  Each file is capped at 15 MB and must be MP3/M4A/AAC. If abuse appears, change the
  upload policy to signed-in users only (note in `docs/sql/music.sql`).

---

## Music: what was decided

### Rules (all set in `src/utils/musicLimits.ts`)

- **Upload size limit: 15 MB.** (8 MB only holds about 3.5 minutes at 320 kbps, which is too
  tight for long traditional songs. 15 MB holds about 8 minutes at 256 kbps.) The same limit
  is set on the storage bucket in `docs/sql/music.sql`; change both together.
- **Playback cap: 8:00.** A longer track is not cut. The player plays the first 8:00, fades
  out over 3 seconds, and restarts from the beginning, for as long as the guest stays.
  Tracks shorter than 8:00 fade out near their end and restart too.
- Allowed uploads: MP3, M4A, AAC.
- Library: about 10 tracks per collection (white, igbo, yoruba, hausa), supplied by you.
- A guest's mute choice carries across ceremonies for the rest of the visit.

### What the couple sees

In the **Photos & music** step, each ceremony tab has a Music section:
no music, a track from the library (this ceremony's collection first, a "Show all music"
toggle for the rest, with a play button to preview), or their own upload (with a tick-box
confirming they have the right to use the music).

### What the guest hears

- Music starts when the guest taps the entrance, with a 1.5 second fade-in.
- A small speaker button (bottom right) mutes and unmutes.
- Opening a ceremony switches to that ceremony's track (fade out, fade in). The same track
  carries on without restarting. A ceremony with no music is silent.
- The ceremony list plays the first ceremony's track.
- It pauses while the browser tab is hidden.
- iPhone Safari ignores volume changes from websites, so on iPhones the fades are instant.
  Everything else (cap, restart, mute) behaves the same.

### Where it lives

- `invitations` gets `music_source`, `music_url`, `music_title` (one row per ceremony).
- `music_tracks` table: your library. Couples can read it; only you can change it.
- Buckets: `music-library` (yours) and `invitation-music` (couples' uploads), both public-read.

### Adding library tracks

1. Supabase > Storage > `music-library`: create folders `white`, `igbo`, `yoruba`, `hausa`,
   and upload your MP3/M4A files (about 128 kbps keeps them quick on mobile data).
2. Supabase > Table Editor > `music_tracks` > Insert > Import data from CSV. Use
   `docs/sql/music_tracks_template.csv` as the starting point: one row per track, with
   `collection` one of `white`, `igbo`, `yoruba`, `hausa`, `universal`, and `url` set to the
   file's public address:
   `https://<your project>.supabase.co/storage/v1/object/public/music-library/<folder>/<file>.mp3`
3. Set `is_active` to false to hide a track without deleting it. `sort_order` controls the
   order inside a collection.

### Things to keep in mind

- **Licensing.** Tracks you put in the library must be ones you are licensed to distribute.
  For uploads, the couple confirms they have the right to use the file; consider adding this
  to your terms of service. This is not legal advice.
- **Bandwidth.** Every guest who opens an invitation streams its track. The browser only
  downloads what it plays, so a long file is not fully downloaded. Check your Supabase
  plan's storage and bandwidth limits as the library and guest numbers grow.
- **Not in v1:** music preview inside the wizard's final Preview step; editing music after
  publishing (now done from Dashboard > Edit).
