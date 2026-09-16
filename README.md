# Evermore — Wedding Invitation Platform (v0.1)

A premium, modular digital invitation platform. **Version 0.1 supports weddings only**, but the entire app is architected so that new event categories (birthdays, corporate events, etc.) can be added later without a rebuild.

This is a **system-first build**: every photo, door animation, and illustration you see is an elegant placeholder. The plumbing — routing, data model, template engine, RSVP flow, dashboard — is real and working. Real artwork slots in later without touching the architecture.

---

## 1. What this project is

- A React + TypeScript single-page app for creating, previewing, and sharing digital wedding invitations
- A 7-step creation wizard (template → couple → details → story → photos → extras → preview/publish)
- A reusable **template engine**: six visual "templates" all share one data-rendering core (`InvitationBody`), so adding a 7th template later doesn't mean duplicating the app
- A guest-facing invitation page with a live RSVP form
- An organizer dashboard with stats, a guest list (search/filter/sort), and per-event management
- No backend yet. All data is mock data living in memory. The code is structured so a real backend (Supabase) can be swapped in without rewriting components — see [Section 10](#10-future-supabase-integration).

---

## 2. Technology stack

| Layer | Choice |
|---|---|
| Build tool | Vite |
| Framework | React 19 + TypeScript |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`, CSS-first `@theme` tokens — no `tailwind.config.js` needed) |
| Icons | lucide-react |
| Routing | React Router v7 |
| State | React Context + `useState` (no external state library) |
| Data | Local mock data + a service-abstraction layer |
| Database | None yet — architected for Supabase/PostgreSQL later |
| Auth | None yet — placeholder UI only |
| Payments | None yet — simulated payment step only |
| Hosting target | Vercel |

---

## 3. Folder structure

```
src/
  components/
    ui/           Design-system primitives: Button, Input, Textarea, Select,
                   Badge, Card, Modal, Skeleton, State (empty/error/success),
                   Placeholder (photo/door/map/QR placeholders), ProgressSteps
    layouts/       SiteHeader, SiteFooter, PublicLayout, DashboardSidebar, DashboardLayout
    templates/     TemplateCard (data-driven, reusable)
    landing/       Landing page sections (Hero, Featured, How-it-works, Features, etc.)
    invitation/    RsvpForm, CountdownDisplay, InvitationSection, InvitationRenderer
    dashboard/     StatCard, GuestTable, ShareModal
  pages/
    LandingPage.tsx, TemplateGalleryPage.tsx, TemplatePreviewPage.tsx,
    InvitationPreviewPage.tsx (guest-facing /invitation/:slug), NotFoundPage.tsx
    create/         The 7-step wizard: CreateLayout + StepTemplate, StepCouple,
                     StepEvent, StepStory, StepPhotos, StepOptions, StepPreview
    dashboard/       DashboardOverviewPage, DashboardEventsPage,
                      DashboardEventDetailPage, DashboardGuestsPage, DashboardSettingsPage
  templates/         THE TEMPLATE ENGINE — see Section 7
    types.ts             Shared prop contract for every template
    InvitationBody.tsx   Shared sections every template renders (data -> UI)
    TemplateCover.tsx    Shared opening cover, styled per "tone"
    WeddingTemplateRoyal.tsx, WeddingTemplateGarden.tsx, WeddingTemplateStorybook.tsx,
    WeddingTemplateModern.tsx, WeddingTemplateAfrican.tsx, WeddingTemplateClassic.tsx
    registry.ts          Maps a template's `rendererKey` to its component
  data/               Mock data, separate from UI (see Section 8)
    templates.ts, mockWedding.ts, mockGuests.ts, mockDashboard.ts
  services/           Data-access abstraction (see Section 10)
    invitationService.ts, guestService.ts, templateService.ts
  types/              TypeScript types (invitation.ts, template.ts, guest.ts, dashboard.ts)
  hooks/              useWizard.tsx — creation-wizard state via React Context
  utils/              format.ts, cn.ts, draftToPreviewInvitation.ts
  styles/             index.css (design tokens), fonts.css
```

---

## 4. How to install and run this locally in VS Code

You said you're new to local development, so here is every step in order. Don't skip any.

### Step-by-step

1. **Install Node.js.** Go to nodejs.org and download the "LTS" version. Run the installer, clicking "Next" through the defaults.
2. **Confirm it installed.** Open a terminal (Mac: the "Terminal" app; Windows: "Command Prompt", or use the one built into VS Code in step 5). Type `node -v` and press Enter. You should see something like `v22.x.x`. If you see "command not found," restart your computer and try again.
3. **Get the project folder onto your computer.** Unzip the file I gave you into a folder — for example `Documents/evermore`.
4. **Open the folder in VS Code.** Open VS Code, then `File -> Open Folder...`, and select the `evermore` folder (the one containing `package.json`).
5. **Open the built-in terminal.** In VS Code: `Terminal -> New Terminal`. A panel opens at the bottom — this is where you'll type commands.
6. **Install dependencies.** In that terminal, type:
   ```
   npm install
   ```
   Press Enter and wait. This downloads everything the project needs into a `node_modules` folder. It can take a minute or two. A lot of text will scroll by — that's normal.
7. **Start the app.** Type:
   ```
   npm run dev
   ```
   You'll see output that includes a line like:
   ```
   ➜  Local:   http://localhost:5173/
   ```
8. **Open it in your browser.** Cmd-click (Mac) or Ctrl-click (Windows) that link, or copy it into your browser's address bar.
9. **You should see the landing page.** If you do, everything worked.

### Stopping the app

Click into the terminal and press `Ctrl + C`. That stops the local server.

### Running it again later

You only need to run `npm install` once (or again if dependencies change). Every other time, just open the folder in VS Code and run `npm run dev`.

### Building for production

When you're ready to deploy (e.g. to Vercel):
```
npm run build
```
This checks the whole project for TypeScript errors and, if there are none, produces an optimized version in a `dist/` folder. If this command fails, copy the error text to your AI assistant — see Section 12.

---

## 5. Route map

| Route | Page |
|---|---|
| `/` | Landing page |
| `/templates` | Template gallery |
| `/templates/:templateId` | Template preview |
| `/create` | Wizard — choose template |
| `/create/couple` | Wizard — couple info |
| `/create/event` | Wizard — wedding details |
| `/create/story` | Wizard — story (optional) |
| `/create/photos` | Wizard — photo placeholders |
| `/create/options` | Wizard — optional extras |
| `/create/preview` | Wizard — preview & publish |
| `/dashboard` | Dashboard overview (stats) |
| `/dashboard/events` | List of invitations |
| `/dashboard/events/:eventId` | Single invitation management |
| `/dashboard/events/:eventId/guests` | Guest list |
| `/dashboard/events/:eventId/settings` | Event settings (placeholder auth/billing) |
| `/invitation/:slug` | Guest-facing invitation + RSVP |
| any other path | Custom 404 |

There's one seeded example invitation at **`/invitation/ada-and-michael`** — visit it directly to see a fully-populated invitation.

---

## 6. Data model

The core type is `WeddingInvitation` in `src/types/invitation.ts`. It holds the couple's names, wedding date/time/venue, optional story fields, photo slots, optional extras (gift info, hashtag, custom RSVP message), and system fields (`id`, `slug`, `status`, `views`, timestamps).

`EventCategory` (in `src/types/template.ts`) lists every event type the platform will eventually support (`wedding`, `birthday`, `child-dedication`, `corporate`, `funeral`, `engagement`, `anniversary`, `other`), but `SUPPORTED_EVENT_CATEGORIES` currently only contains `'wedding'`. When a second category is ready, add it there — templates and routes already read from this list rather than hardcoding "wedding" everywhere they can avoid it.

---

## 7. The template engine (how the 6 templates work)

The spec asked for six templates *without* six separate invitation apps. Here's how that works:

- **`src/templates/InvitationBody.tsx`** is the shared core. It takes a `WeddingInvitation` and renders every data-driven section: names, details, story, gallery, countdown, RSVP form, map, footer. All six templates use this exact component.
- **`src/templates/TemplateCover.tsx`** is a shared "opening" component that changes its color palette and choice of placeholder (door vs. hero card) based on a `tone` prop.
- **`src/templates/WeddingTemplateRoyal.tsx`** (and its five siblings) are thin wrapper components — each just renders a `TemplateCover` with its tone, then the shared `InvitationBody`. This is intentionally the extension point: give a template a genuinely different layout later by changing what it renders here, without touching `InvitationBody`.
- **`src/templates/registry.ts`** maps a template's `rendererKey` (from the mock template data) to its component.
- **`src/components/invitation/InvitationRenderer.tsx`** is the single entry point every page uses: give it `(invitation, template)`, it looks up the right renderer and renders it. No page ever imports a `WeddingTemplate*` component directly.

### How to add a 7th template

1. Add an entry to `src/data/templates.ts` with a new `id`, `name`, `description`, and a `rendererKey` (e.g. `'minimalist'`).
2. Create `src/templates/WeddingTemplateMinimalist.tsx`, following the same two-line pattern as the existing six.
3. Register it in `src/templates/registry.ts`: add `minimalist: WeddingTemplateMinimalist`.

That's it — the gallery, preview page, and creation wizard all pick it up automatically because they read from `templateService`, not a hardcoded list.

---

## 8. How to modify mock invitation data

All mock data lives in `src/data/`, separate from components, so you (or an AI assistant) can edit content without touching UI code:

- **`src/data/templates.ts`** — the six template records shown in the gallery.
- **`src/data/mockWedding.ts`** — the seeded example invitation (`ada-and-michael`). Edit any field here to change what appears on the demo invitation and template previews.
- **`src/data/mockGuests.ts`** — 20 generated example guests, used by the dashboard's guest table.
- **`src/data/mockDashboard.ts`** — computes dashboard stats from the mock guest list; you generally won't need to touch this directly.

Nothing in `src/components` or `src/pages` imports these files directly — they go through `src/services/*Service.ts` instead. That indirection is what lets us replace mock data with real Supabase queries later without rewriting any page or component.

---

## 9. How to modify design tokens

All colors, fonts, and radii are defined in **`src/styles/index.css`** inside a Tailwind v4 `@theme` block:

```css
@theme {
  --color-ivory: #FBF8F2;
  --color-gold: #B08D57;
  --color-wine: #5C2435;
  --font-display: "Cormorant Garamond", serif;
  --font-body: "Manrope", sans-serif;
  --radius-md: 6px;
  /* ...etc */
}
```

Changing a value here updates it everywhere, because components use Tailwind utility classes generated from these tokens (`bg-ink`, `text-gold`, `font-display`, `rounded-md`, `shadow-soft`, and so on) rather than one-off hex codes. There is no separate `tailwind.config.js` to keep in sync — Tailwind v4 reads the tokens straight from this CSS file.

Fonts are pulled from Google Fonts in `src/styles/fonts.css`. To change the typeface, edit the `@import url(...)` there and update `--font-display` / `--font-body` in `index.css` to match.

---

## 10. Future Supabase integration

Nothing is connected yet, but the seam is already in place. Each file in `src/services/` (`invitationService.ts`, `guestService.ts`, `templateService.ts`) exports one object with async methods (`list`, `getBySlug`, `submitRsvp`, etc.) that currently read from the mock data files.

When you're ready to connect Supabase:

1. `npm install @supabase/supabase-js`
2. Create `src/services/supabaseClient.ts` with your Supabase URL/key.
3. Create `src/services/supabaseInvitationService.ts` (and equivalents for guests/templates) implementing the **exact same method names and return shapes** as the mock services.
4. In each service file, swap the export at the bottom from the mock implementation to the Supabase one.

No component, page, or hook needs to change, because they all import `invitationService` / `guestService` / `templateService` — never the mock data directly.

---

## 11. Future payment integration

The wizard's final step (`src/pages/create/StepPreview.tsx`) currently simulates a payment with a timed delay, then calls `invitationService.publish()`. To connect Paystack later:

1. Replace the simulated delay with a real Paystack checkout call.
2. Only call `invitationService.publish(draft)` after Paystack confirms success.
3. Everything downstream (the success modal, the dashboard, the guest-facing page) is already wired to whatever `publish()` returns, so it needs no changes.

---

## 12. When something breaks

If you run `npm run dev` or `npm run build` and see red error text:

1. **Copy the entire error message** — including the file path and line number VS Code or the terminal shows.
2. **Paste it to your AI coding assistant** along with: "here's the error I'm seeing, what should I do?"
3. A good assistant response should tell you: what the error means, why it happened, which exact file to open, and either the corrected code or an exact prompt you can use to fix it — never just "fix the error."

Common early hiccups:
- **`npm: command not found`** → Node.js isn't installed correctly; revisit steps 1–2 above.
- **A wall of red text after `npm install`** → usually safe to ignore if it ends with something like `added 250 packages`. If it says `npm ERR!` at the very end, copy that final block and send it over.
- **Port 5173 already in use** → another instance of the dev server is already running; close that terminal tab, or just use the URL Vite prints (it may pick a different port automatically).

---

## 13. What's intentionally NOT in this version

Per the v0.1 scope, none of these are implemented — but the codebase is structured so each can be added without a rebuild:

Supabase, real authentication, Paystack, transactional email, WhatsApp/Facebook sharing (buttons are placeholders), real QR code generation, real image uploads/cloud storage, real-time RSVP updates, analytics, custom domains, additional event categories (birthdays, corporate, etc.), AI invitation generation, cinematic door/animation (GSAP/Lottie), background music, guest check-in.
