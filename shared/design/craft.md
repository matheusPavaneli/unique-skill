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

**Layer 3 is where the derivation would otherwise stop.** This file derives the values —
radius, elevation, control height, motion durations, the spacing scale. It does not decide
what a button, a field, a row or a card is *made of*, and a derived palette poured into the
default component shapes produces a tinted default. That layer is `components.md`: the control
height and density, the corner treatment, whether structure is carried by border, ground or
shadow, the focus ring, the one interaction signature, the three-to-five places the system is
recognizable, and the state matrix as a design surface rather than as an audit. Read it after
the tokens exist and before the layout is built. The split is numbers here, grammar there:
where `components.md` restates an elevation set, a state-change duration or a contrast ratio,
this file is the source and that one is the point of use.

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

### Deriving the typeface

The palette gets six steps and the face got one sentence, so the face was the axis chosen by
reflex — and the reflex reaches for whatever geometric-display-plus-neutral-body pairing has
been used most, which is banned default #12. Five steps, same shape as the palette.

1. **Take the TYPE provenance line** from `originality.md`. Same rule as color: a fact about
   the subject's material world, not a mood. The fact usually names either the subject's own
   notation (what the field writes in) or its paperwork (what it prints on).
2. **Read the fact for a class**, not a name. The classes and what each one needs:

   | Class | The fact that earns it | Reads as |
   | --- | --- | --- |
   | Transitional / old-style serif | The subject predates the screen, or is about reading, record and authority | Considered, editorial, slow |
   | Modern / didone | High contrast is literally in the subject — engraving, fashion plate, masthead | Sharp, formal, fragile at small sizes |
   | Slab | Industrial, printed-on-the-object, catalogue and specification | Sturdy, plain-spoken |
   | Grotesque (19th c.) | Signage, transit, wayfinding, notice boards | Public, matter-of-fact |
   | Neo-grotesque | The subject is a system, an interface, an instrument panel | Neutral by design — and it is the class the defaults live in |
   | Humanist sans | Written by hand before it was typed; teaching, care, service | Warm, legible, unshowy |
   | Geometric sans | Bauhaus-adjacent, drawn from circles, industrial design | Constructed — and heavily overused |
   | Monospace | The field's real notation is fixed-width: code, logs, tables, telemetry | Technical when true, costume when not |
   | Display / one-off | The subject has a single strong artifact — a sign, a label, a title | The whole identity, at one size only |
   | Text with real provenance | A face historically tied to this field, trade or place | Unfakeable, when the tie is genuine |

3. **Name three candidates in that class**, from families you can actually load — check the
   licence and the file before committing. Then kill two, in writing, on fit rather than
   taste: what the face does at the display size shipped, whether it holds at 14 px, whether
   it has the features the content needs (tabular figures, small caps, an optical size axis).
4. **Decide one face or two.** Two faces need two facts — the material *and* its notation,
   the craft *and* its paperwork. One fact means one face; carry the range with optical size,
   weight, width and case instead. `devices.md`, "one face, many registers".
5. **Price it.** Weights and axes actually used, subset, `KB` gz, `font-display: swap`, and
   the metric-matched fallback that holds the layout. `../quality/engineering.md`. A face
   that costs more than the budget allows is a cut face, not a caveat.

**Where to look, once the class is decided.** The class table above is useless if the only
family names in reach are the four defaults, which is exactly why they keep winning. Go to a
source and read specimens rather than recalling names:

| Source | What it is good for |
| --- | --- |
| Google Fonts (variable filter) | 500+ variable families, all self-hostable, safe licences |
| Fontshare (Indian Type Foundry) | Contemporary display and text families, free for commercial use |
| Velvetyne | Libre, deliberately rough and sharp — the antidote to a neutral grotesque |
| Etcetera Type Co | Libre, unusually strong variable display work |
| The League of Moveable Type | The original libre foundry; plain, sturdy text faces |
| Fontsource | Not a foundry — the packaging layer for self-hosting any of the above |

Check three things before committing, in this order: the licence permits the use, the file
has the axes and features the content needs, and the face still works at the smallest size it
will be set. Then subset and self-host as WOFF2 — a subsetted local file beats a CDN request.

**Parametric axes are how one face carries a whole page.** A family with `opsz`, `wght`,
`wdth` and `GRAD` (Roboto Flex is the widest example) gives display, body, caption and label
registers from one download, with optical corrections that a scaled single master cannot
produce. This is what makes "one face, many registers" in `devices.md` a real option and often
the cheapest one on the page.

Two guardrails:

- **The body face is chosen for reading, not for character.** It may be conventional. It may
  even be the system stack. The display face is the `signature` decision.
- **In `product-surface` and `native`, a default UI face is the right answer**, and none of
  the above applies to UI chrome. `Inter` on a dashboard is an engineering choice, not a
  failure. The tell is a default face carrying *identity* on a page whose job is to be
  unmistakable.

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

**Run the procedure, do not perform it.** `${CLAUDE_PLUGIN_ROOT}/scripts/palette.mjs` does
steps 2–6 arithmetically from a spec naming the fact and its hue:

```bash
echo '{"fact":"unfired earthenware body","hue":55,"scheme":"light","accent":"contrast"}' > .unique/palette.json
node ${CLAUDE_PLUGIN_ROOT}/scripts/palette.mjs .unique/palette.json
```

It emits the token block and then measures every pair that matters — body, muted, accent
text, the button label, both boundaries and the focus ring on both grounds — exiting non-zero
if one fails. Chroma is clamped to what sRGB will actually paint, so the token written is the
color painted. Colors invented in the head converge on the colors seen most, which is banned
default #4 wearing a different name; the only judgement this leaves is step 1, the fact.

Then verify before building: every text pair, every boundary pair and the focus ring,
against the ratios above. Run `forced-colors: active` and confirm meaning survives without
color at all.

The swap test applies to the result. If the palette would suit any product in the category,
step 1 produced a mood rather than a fact — go back to it, not to step 4.

### How much of each color

A correct palette still reads generic when it is spread evenly. Distribution is the part that
shows in the screenshot:

- **Ground carries the page.** The dominant ground plus its one step (`--surface-raised`) is
  most of the pixels. If a page has four background colors, it has none.
- **Ink does the work.** Hierarchy comes from lightness and weight on the ink, not from
  reaching for another hue. `devices.md`, "ink weight instead of hue".
- **The accent is measured in square centimetres, not in percent.** On a full page it should
  be the primary action, and at most one or two other marks. Three accent-colored things and
  the accent means nothing. `devices.md`, "accent by frequency, not by area".
- **Supports stay support.** Semantic states appear only in states. A color with no job is
  deleted — that is step 6, and it is the step most often skipped.

Depth comes from stacked grounds before it comes from shadow: a section on `--surface-raised`,
an inset panel a step down, a recessed field. It costs 0 KB, it survives dark mode and
`forced-colors` intact, and it is what stops the "cards with a 24 px blur on white" default.

Two colors and a ground, held exactly, beats six colors used approximately. If the page needs
more, it usually needs less content per screen instead.

### When you genuinely need many hues

Categories, series, states, provenance — a set where each hue *means* something. Do not pick
them one at a time; that is where a considered palette turns into a bag of colors. OKLCH makes
the rule arithmetic:

- **Same lightness across the set** → equal visual weight, so no category shouts.
- **Same chroma across the set** → unified saturation, so no category looks like the accent.
- **Even hue intervals** → `360 / n`, rotated so the set does not collide with the accent.

`node ${CLAUDE_PLUGIN_ROOT}/scripts/palette.mjs <spec.json> --categorical <n>` emits the set
and measures each member against both grounds. Then, because hue alone is not a carrier of
meaning: pair every category with a shape, an icon or a label, and check the set holds when
two members land side by side. Six is about the ceiling for a categorical set people can
actually read; beyond that, group and drill down.

Semantic states are the same procedure with fixed hues instead of even ones — success,
warning, danger sit where convention puts them — but they still take the set's lightness and
chroma, which is what stops the danger red from reading as a brand color.

### The floor is WCAG; the ceiling is APCA

WCAG 2 contrast is a luminance ratio, and it is the compliance requirement — 4.5:1 body,
3:1 large and boundaries, non-negotiable, and what `contrast.mjs` measures. It is also known
to be a poor predictor of *readability*: it ignores font size and weight, and it is unreliable
at the dark end, which is why a dark theme can pass AA everywhere and still read badly. WCAG 3
has not adopted a replacement; APCA is a candidate, not a standard.

So run both layers, and never confuse them:

- **Floor — WCAG 2 AA.** Ship-blocking. A pair that fails is not shippable, whatever APCA says.
- **Ceiling — APCA `Lc`.** Advisory, and most useful exactly where WCAG is weakest: muted text
  in dark mode, thin weights, small labels, and text over a tinted ground. As rough targets:
  `Lc 90` for small body text, `Lc 75` for larger body, `Lc 60` for large or bold headlines,
  `Lc 45` for non-text boundaries that carry meaning, and below `Lc 30` treat it as invisible.
  `palette.mjs` prints `Lc` beside every ratio.

The practical rule: if a pair clears AA but its `Lc` is well under the target for its role,
the color is legal and hard to read. Fix it — usually by moving lightness, not by adding
weight.

## Space and layout

### Before the grid: the path and the density map

A grid is a set of measurements, and measurements do not decide what the page *does* to a
person's eye. Two lines, written before the grid block, and both are about the content rather
than the container:

```
PATH     <where the eye lands, then goes, then goes — three or four stops, no more>
DENSITY  <which sections are dense · which are near-empty · where the page holds its breath>
```

- **PATH is not the DOM order.** It is what the composition makes unavoidable: the display
  moment, then the thing that proves it, then the action. If every section has equal weight,
  there is no path and the reader supplies their own, which is scrolling.
- **DENSITY is where the variance rule lands.** At least one dense section and at least one
  empty one — see `originality.md`. A page with uniform density has a stylesheet, not a
  hierarchy, and uniform density is the most reliable tell of a generated page in 2026.

These two lines are what turn `COLUMNS 9/3` from a nice ratio into a composition; without
them the same grid holds the same generic content in a more elegant frame.

### The grid block

Type and color get derived in numbers; layout was getting derived in adjectives, which is why
layout is reliably the most generic axis in the output. Write these six lines into the
contract's `## Grid` section before any CSS, and build to them — the first two come from the
subsection above, and `check-contract.mjs` requires all six in that one section:

```
PATH     <where the eye lands, then goes — three or four stops>
DENSITY  <which sections are dense, which are near-empty>
COLUMNS  <count and ratio, and whether it holds or alternates>
MEASURE  <max-inline-size in ch, per content role>
RHYTHM   <baseline unit in px, and section padding as multiples of it>
BLEED    <exactly which elements break the measure, and above which width>
```

Rules that make the block worth writing:

- **The ratio is a decision, not a default.** `7/5`, `8/4`, `9/3` — and it holds down the page
  rather than alternating sides, unless the content genuinely alternates. Two equal columns is
  the answer only when both sides carry equal weight.
- **The rhythm unit comes from the type scale** — the body line height, or a clean multiple of
  it — so section padding is `4×` and `8×` that unit rather than round numbers picked per
  section. This is what "density and rhythm" scores on the rubric.
- **BLEED names elements, not a vibe.** If everything bleeds, the page is just wide; the
  contrast between a held measure and one full-width element is where the effect lives.
- **A grid with no numbers in it is a mood.** `check-contract.mjs` fails the contract for it.

**What stays uniform.** The variance is spent on density, scale and the one motion moment —
nothing else. Radius, stroke weight, icon grid, control height, focus ring and the spacing
scale itself stay ruthlessly consistent — one control height, with at most one second step
declared as a register shift in the components block. `components.md`. Varying those is not art direction; it is an
unfinished component library, and it reads as one.

**Native masonry** (`display: grid-lanes`) is shipping unevenly as of 2026 — Safari first,
elsewhere behind flags. Treat it as progressive enhancement over a column layout that already
works, never as the device a composition depends on.

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

### Choreography, not a reveal on everything

The same entrance animation applied to every element, staggered by index, is banned default
#15. It is what motion looks like when it is a rule instead of a decision, and it is the most
common motion failure in generated pages by a wide margin.

What replaces it is a **sequence with a subject**: name the one thing the page's motion is
*about* — the claim landing, the mechanism assembling, a value arriving — and choreograph two
to four elements around it over 600–1000 ms. Everything else on the page is already in place
at first paint. Write it down before building:

```
MOMENT   <what the motion is about, in one sentence>
ORDER    <element> <n>ms → <element> <n>ms → <element> <n>ms
DRIVER   load | scroll | interaction | data
REST     <what is static: everything not listed above>
```

`REST` is the load-bearing line. If it is short, this is a reveal on everything wearing a
plan.

### The 2026 toolkit

Most page-level motion no longer needs a library, and dropping one is 30–70 KB and measurable
LCP:

- **`animation-timeline: view()`** — enter/exit tied to an element's own visibility. This is
  the correct tool for a genuine reveal, and it degrades to "already visible" where absent.
- **`animation-timeline: scroll()`** — progress bars, reading indicators, parallax that is
  actually tied to the scroller. Runs off the main thread.
- **Named timelines** (`view-timeline-name` / `timeline-scope`) — one element's position
  drives a *different* element: a section marking itself active in an index, a spine filling
  as the page advances. This is the cross-element choreography that used to require an
  intersection-observer chain, and it is where the device in `devices.md` — the anchored
  spine — becomes cheap.
- **`animation-composition: add`** — stack a scroll-driven translate and a scroll-driven
  rotate without one overwriting the other.
- **View Transitions API** — route and element transitions, including cross-document.

Gate all of it behind `@supports (animation-timeline: scroll())` and design the no-support
state as the finished state, never as the hidden one. Support is broad but not universal, and
an element that starts at `opacity: 0` waiting for a timeline that never runs is an invisible
page.
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
