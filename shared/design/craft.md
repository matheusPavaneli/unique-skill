# Craft: tokens, type, color, space, motion, layout

Numbers, not adjectives. Every value in the build comes from a token; a one-off hex or a
`0.3s` typed inline is a defect.

## Token architecture

Three layers, in this order. Skipping the middle layer is why themes break.

```css
/* 1. primitive — raw scale, no meaning */
--clay-50: oklch(97% 0.012 60);   --clay-500: oklch(62% 0.09 55);
--clay-900: oklch(28% 0.05 50);   --ink-900: oklch(18% 0.02 250);

/* 2. semantic — role, referenced by components */
--surface: var(--clay-50);        --surface-raised: #fff;
--text: var(--ink-900);           --text-muted: oklch(48% 0.02 250);
--accent: var(--clay-500);        --accent-contrast: var(--clay-50);
--border: oklch(88% 0.01 250);    --focus: oklch(55% 0.19 250);

/* 3. component — only when a component genuinely deviates */
--btn-primary-bg: var(--accent);
```

Dark mode swaps layer 2 only. Set `color-scheme: light dark` so form controls and
scrollbars follow. Never invert with `filter`.

Use OKLCH for palettes: lightness is perceptual, so a ramp stays even and hover/active
states are a lightness delta (`calc()` or a second token), not a hand-picked new hex.
Test every ramp against `forced-colors: active` — decorative color disappears there.

## Type

- Two faces is the default; three is a decision; four is a bug. Roles: display, body,
  and optionally utility (captions, data, code).
- Set a scale, do not improvise sizes. A 1.2 ratio suits dense product UI; 1.25–1.333 suits
  marketing; go larger only at the display step. Write it as tokens.
- Fluid type: `clamp(1rem, 0.9rem + 0.5vw, 1.25rem)`. Always keep a `rem` term in the middle
  so browser zoom still scales it — a pure `vw` middle term breaks 200 % zoom (WCAG 1.4.4).
- Body: 16 px minimum in product UI, 17–20 px in editorial, line height 1.5–1.75, measure
  60–75 characters via `max-inline-size: 65ch`.
- Display: line height 0.9–1.1, negative tracking (`-0.02em` to `-0.04em`) at large sizes,
  positive tracking on small caps and eyebrows. Optical sizing matters more than weight.
- Numbers in tables and dashboards: `font-variant-numeric: tabular-nums`. Non-negotiable.
- `text-wrap: balance` on headings, `text-wrap: pretty` on body. Cheap, immediately visible.
- Variable fonts: one file, many weights. Prefer them; subset them.
- The display face carries the personality. Choosing it is a `signature` decision — see
  `originality.md`. The body face is chosen for reading, not for character.

### Deriving the scale

The scale is derived per surface, not inherited. Six steps, in order:

1. **Body size first**, from MODE: 16 px minimum for product UI, 17–20 px for editorial.
   Everything else is computed from it, so this is the only number chosen by judgement.
2. **Measure**, from the content: `max-inline-size` in `ch`, 60–75 for prose, narrower for
   a column that sits beside something.
3. **Line height**, from the measure and the face: longer measure and larger x-height both
   want more leading. This fixes the vertical rhythm unit for the whole page.
4. **Ratio**, from MODE and density: 1.2 for dense product UI, 1.25–1.333 for marketing.
   Generate the steps; do not type sizes by hand.
5. **Display step**, chosen separately. The display size is a composition decision from
   `devices.md`, not the top rung of the ratio — the ladder gets you to the largest *text*
   size, and the display moment usually sits above it.
6. **Optical corrections per role**: tracking negative at display sizes, positive on small
   caps and eyebrows; optical size axis set if the family has one.

Write the result as tokens before writing a component. A scale that exists only in the
components is not a scale.

## Color

- Build the palette as 4–6 named values, not a spectrum. One dominant ground, one text,
  one accent, one or two supports. Dominant-plus-sharp-accent beats an even distribution.
- Accent means "the thing to act on". If three things are accent-colored, none are.
- Semantic states (success / warning / danger) must not rely on hue alone — pair with icon,
  text, or shape. ~8 % of men cannot separate your green from your red.
- Contrast: 4.5:1 body text, 3:1 for ≥24 px or ≥19 px bold, 3:1 for UI boundaries and
  graphical objects that carry meaning. Check text over images and gradients at the worst
  pixel, not the average.
- Muted text is where designs quietly fail. `#999` on white is 2.8:1. Not shippable.

### Deriving the palette

**No starter palette ships with this plugin, and that is deliberate.** Shipped values become
the values every output starts from, which is banned default #4 in `originality.md` —
"shipping the starter theme is now the single most recognizable AI look" — reproduced under
a different name. What ships is the procedure.

Six steps, from the provenance fact to the token file:

1. **Take the COLOR provenance line** from `originality.md`: a fact about the subject's
   material world, not a mood. The fact names a real thing with a real color — a material,
   a substrate, an instrument, a notation, an environment.
2. **Fix the ground.** Convert that thing's color to OKLCH and take it as the ground:
   lightness 96–99 % for a light ground, 12–18 % for a dark one, chroma low (0.005–0.02).
   The tint is what stops the page reading as default white or default near-black.
3. **Fix the ink** as the same hue at the opposite end of the lightness range, chroma still
   low. Ground and ink sharing a hue is most of what "considered" looks like.
4. **Choose the accent hue by angle from the ground hue**, not by taste. Roughly 30–60°
   apart reads as related; 150–210° reads as deliberate contrast. Set its chroma as high as
   the palette will carry and its lightness so it clears 4.5:1 on the ground for text and
   3:1 for boundaries — measure this, do not eyeball it. `../quality/measure.md`.
5. **Generate the ramps** by stepping lightness at even perceptual intervals. Because OKLCH
   lightness is perceptual, hover and active states become a lightness delta rather than a
   hand-picked hex, and the ramp stays even without correction.
6. **Add at most two supports**, and only for a job that exists: a semantic set for
   success/warning/danger, or one neutral for borders. A color with no job is deleted.

Then verify before building: every text pair, every boundary pair and the focus ring,
against the ratios above. Run `forced-colors: active` and confirm meaning survives without
color at all.

The swap test applies to the result. If the palette would suit any product in the category,
step 1 produced a mood rather than a fact — go back to it, not to step 4.

## Space and layout

- One spacing scale, geometric-ish: 4 8 12 16 24 32 48 64 96 128. Every gap comes from it.
- Space belongs to the container (`gap`, flow spacing), not to the child's margin. Owl
  selectors or `gap` over per-element margins — it is what stops the specificity collisions
  where `.section` and `.cta` cancel each other's padding.
- Use logical properties throughout (`padding-inline`, `margin-block`, `inset-inline-start`).
  Free RTL support, and it is not retrofittable cheaply.
- Container queries for components that appear in more than one column width. Media queries
  for page-level layout only. A card should not care about the viewport.
- Grid for two-dimensional layout, flex for one. `grid-template-areas` when the layout
  reflows to a different shape rather than just narrowing.
- Vertical rhythm: relate section padding to the type scale rather than picking round
  numbers per section.
- Elevation: define 3–4 shadow tokens and stop. Layered shadows (a tight dark one plus a
  wide soft one) read as real; a single large blur reads as a default.
- Z-index: a token scale (`--z-base: 0; --z-dropdown: 100; --z-overlay: 200; --z-toast: 300`).
  Prefer `dialog`, popover API, or a portal over stacking-context fights.

## Motion

Durations: 100–160 ms for state change (hover, press), 200–300 ms for enter/exit,
300–500 ms for a layout or route transition, 600–1000 ms total for one orchestrated
page-load sequence with staggered delays.

Easing: entrances decelerate (`cubic-bezier(0.16, 1, 0.3, 1)`), exits accelerate and are
shorter than entrances, movement between two on-screen states uses a standard curve
(`cubic-bezier(0.2, 0, 0, 1)`). Linear only for continuous ambient motion and progress.

- Animate `transform`, `opacity`, `filter`, `clip-path`. Nothing else is free.
- Never animate `height`/`width` — use `grid-template-rows: 0fr → 1fr`, `clip-path`, or
  `interpolate-size: allow-keywords` where support allows.
- Purpose: motion explains a change of state or position. Decoration that explains nothing
  is the first thing cut at step 4.
- One orchestrated moment beats scattered micro-interactions. Scattered micro-interactions
  are themselves an AI tell.
- Reduced motion is a floor, not a toggle: keep opacity and color transitions, remove
  movement, parallax, autoplay, and long sequences.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important; animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important; scroll-behavior: auto !important;
  }
}
```

Library and technique choices for motion, scroll choreography, 3D and particles live in
`../stacks/3d-and-motion.md`. This file sets the timings and the intent; that one sets the
tool and the byte cost. Whether an effect should exist at all, and what it should be about,
is `spectacle.md` — decide that first.

Blanket-killing every transition is acceptable and safe. Selectively preserving opacity
fades is better. Never leave movement in.

## Backgrounds and texture

Atmosphere beats flat fills — but each technique has a bill (see `../quality/engineering.md`):

- Cheap: layered `linear-gradient`/`radial-gradient`, `background-image` SVG patterns,
  `box-shadow` depth, borders, `mask-image` for fades.
- Costly: `backdrop-filter` (repaints on scroll, expensive on mobile), full-page noise PNGs
  (bytes), large blurred elements, `filter` on scrolling content.
- Free and underused: `color-mix()`, `mask-image` gradients, `mix-blend-mode` on small
  areas, `background-attachment` alternatives, `@supports` progressive enhancement.

Texture applies to the ground and to decorative layers. Never behind body text.

## Iconography

One set, one grid, one stroke weight. Mixing filled and outline is a decision to make once,
globally. Decorative icons get `aria-hidden="true"`; meaningful ones get an accessible name.
Icon-only buttons always get a `title` or visually hidden label plus a tooltip.
