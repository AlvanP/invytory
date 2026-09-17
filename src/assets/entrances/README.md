# Entrance Assets — Replacement Guide

This is where your real artwork (doors, gates, envelopes, seals, textures)
gets dropped in later. Nothing here is required for the app to work —
every entrance currently renders as a CSS/SVG placeholder. When you're
ready to swap in real art, follow this guide exactly and **no code
changes are needed** — only the config in `src/templates/entranceConfig.ts`.

## How the swap works

Each entrance style has optional "asset slots" defined in
`src/templates/entranceConfig.ts`. Right now every slot is empty, so
`DoorEntrance` falls back to the built-in placeholder. Fill in a slot
with a file path, and that piece of artwork is used automatically —
nothing else in the codebase needs to change.

Put your exported files in this folder (`src/assets/entrances/`), in a
subfolder per template, then reference them from `entranceConfig.ts`.
Example folder layout:

src/assets/entrances/
royal/
left-door.png
right-door.png
garden/
left-gate.png
right-gate.png
storybook/
cover.png
modern/
envelope.png
seal.png

Then in `entranceConfig.ts`, for example:

royal: {
style: 'doors',
hint: 'Tap to Open the Doors',
assets: {
leftPanel: new URL('../assets/entrances/royal/left-door.png', import.meta.url).href,
rightPanel: new URL('../assets/entrances/royal/right-door.png', import.meta.url).href,
},
},

## Exact dimensions to design against

The entrance fills the full mobile screen (portrait). Design at these
sizes so your art lines up correctly at any phone width:

| Style                | Slot         | Recommended size                     | Notes                                                                                                                            |
| -------------------- | ------------ | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **doors** / **gate** | `leftPanel`  | 540 × 1170 px (portrait, half-width) | Covers the left 50% of the screen edge-to-edge. Design the "seam" edge at the right side of this image.                          |
| **doors** / **gate** | `rightPanel` | 540 × 1170 px                        | Mirror of the left — seam edge on the left side of this image.                                                                   |
| **book**             | `cover`      | 800 × 1000 px (4:5)                  | Fills a centered card, not the full screen — leave some breathing room in the design, it's placed inside a bordered frame.       |
| **envelope**         | `envelope`   | 900 × 600 px (3:2)                   | The closed envelope body. The flap fold-line should sit at the vertical center.                                                  |
| any                  | `background` | 1080 × 1920 px (9:16, full screen)   | Optional full-bleed background behind everything else — use for texture/gradient backdrops.                                      |
| any                  | `seal`       | 200 × 200 px (square)                | Not yet wired into code — reserved for a future wax-seal interaction detail. Tell your developer when you have this asset ready. |

## File format

PNG with transparency where the shape isn't a full rectangle (e.g. a
seal, an ornament). JPG is fine for full-bleed rectangular backgrounds.
Keep individual files under ~500KB where possible — these load before
the guest can open the invitation, so smaller is a better experience,
especially on mobile data.

## What NOT to worry about

You do not need to build the opening _animation_ into your exported
images — sliding, fading, and scaling are handled entirely by code.
Just design the static "closed" state of each entrance; the code
animates it open.
