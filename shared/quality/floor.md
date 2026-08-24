# Quality floor: accessibility, states, verification

Applies in every mode. This is the part that separates "renders" from "ships".

## Accessibility — WCAG 2.2 AA

**Semantics first.** A native `button`, `a`, `input`, `dialog`, `details`, or `table`
carries behavior, focus, and semantics for free. Reach for ARIA only to describe something
HTML cannot express; ARIA that duplicates native semantics makes things worse.

- One `h1`. Heading levels never skip. Landmarks: `header`, `nav`, `main`, `footer`.
  `<html lang>` set.
- Skip-to-content link, first in tab order, visible on focus.
- Every interactive element reachable and operable by keyboard, in visual order. No
  positive `tabindex`. No keyboard traps.
- Focus visible with ≥3:1 contrast against both the element and its surroundings. Style
  `:focus-visible`; never `outline: none` without a replacement.
- Overlays: focus moves in, is trapped while open, `Escape` closes, focus returns to the
  trigger, background is `inert` or `aria-hidden`. Use a headless primitive.
- Client-side route change: move focus to the new `h1` or a live region announces it.
- Target size ≥ 24×24 CSS px (2.2 AA); use 44×44 for anything touch-primary. Spacing counts
  toward the exemption but do not rely on it.
- Forms: every input has a persistent visible `<label>`. Placeholder is not a label.
  Errors are text, linked with `aria-describedby`, and announced. Group with `fieldset`.
  Set `autocomplete` tokens and `inputmode`. Never validate on every keystroke before first
  blur; validate on blur and on submit, clear errors as they are fixed.
- Async: `aria-live="polite"` for results and toasts, `assertive` only for errors that
  block. Loading states announced, not just spun.
- Images: meaningful ones get real alt text describing function, decorative ones get
  `alt=""`. Icon-only controls get an accessible name.
- Color is never the sole carrier of meaning. Motion is never the sole carrier.
- Content reflows at 320 px width and at 200 % zoom with no horizontal scroll and no loss.
- Test `forced-colors: active` if the UI depends on background colors for meaning.

## The state matrix

Anything that renders data or accepts input needs every applicable row designed, not just
the happy path. Missing states are the most common gap between an AI-built UI and a shipped
one.

| State | Requirement |
| --- | --- |
| First run / empty | Explains what goes here and offers the action that fills it. Never just "No data." |
| Loading | Skeleton matching the final layout's dimensions. Spinner only for < ~300 ms or unknown shape. |
| Partial / streaming | Content appears progressively without reflowing what is already read. |
| Error | What failed, in the interface's voice, plus a retry or a way forward. Never a raw stack trace or a bare "Something went wrong." |
| Offline | Detected and surfaced if the feature depends on the network. |
| Unauthorized / forbidden | Distinct from "not found" and from "error". Says what access is needed. |
| One item | Layouts built for grids often break with a single card. Check it. |
| Many items | > 100 rows: pagination or virtualization. Sorting and filtering keep scroll and focus sane. |
| Long content | Longest realistic string in every label, name, and cell. Truncate deliberately with a title/tooltip, never with an unhandled overflow. |
| Missing media | Broken or absent image, missing avatar, no thumbnail. |
| Slow network | Throttle and look. Perceived latency is a design problem. |
| Disabled | Explain why. A disabled control with no explanation is a dead end — prefer enabled-with-validation. |
| Destructive | Confirmation proportional to reversibility. Undo beats a modal where possible. |
| RTL | Logical properties make this nearly free. Check icon direction and number formatting. |

## Responsive

- Design at 390 px first for anything public; check 390 / 768 / 1440 minimum, plus 320 px
  and 200 % zoom for compliance.
- Container queries for components, media queries for page layout.
- `dvh` not `vh` for full-height on mobile. `env(safe-area-inset-*)` for notches and home
  indicators on any fixed bottom element.
- Hover-dependent affordances need a non-hover path: `@media (hover: hover)` to gate hover
  effects, and a tap path for anything they reveal.
- Tables on narrow screens: horizontal scroll with a sticky first column, or a card
  transformation. Never a crushed table.

## Verification checklist — run before saying done

1. **Build clean.** Compiles, no type errors, no console errors or React key warnings.
2. **Render and look.** Required, not optional — see *The render pass* below. Serve the
   surface, screenshot 390 / 768 / 1440, and read the images. Check 320 px and 200 % zoom.
3. **Keyboard only.** Tab through the whole surface. Every control reachable, focus always
   visible, order matches the visual order, overlays trap and restore, `Escape` works.
4. **Contrast.** Body text, muted text, placeholder, disabled text, text over images and
   gradients, borders, focus ring, and the accent on its own background.
5. **Reduced motion.** Toggle it. Nothing moves; the page still communicates.
6. **Dark mode**, if the surface is themed. Check borders, shadows, images with baked-in
   white, and code blocks.
7. **State matrix.** Force empty, error, and loading. Actually render them.
8. **Perf.** Build size against the budget in `engineering.md`. Fonts subset and preloaded.
   Images sized. LCP element identified. Report actual numbers or say "not measured".
9. **Content.** No lorem ipsum, no invented metrics or testimonials, no placeholder logos
   presented as real. Copy passes `../design/copy.md`.
10. **Subtract one.** Remove the least load-bearing decorative element and confirm the
    design is better for it. Name what was removed.

Report honestly. A failed check named is worth more than a checklist claimed. If a step
could not run in this environment, say which and why.

## The render pass

Design is not verifiable from source. A surface read as code is judged against what the
reader expects code to produce, which is the same distribution the banned defaults in
`../design/originality.md` came from. The only way out is to look at the pixels.

**The loop, run before the subtract-one rule:**

1. **Serve it.** The real dev server or a static build. Not a fragment in isolation.
2. **Screenshot 390 / 768 / 1440.** Full page, not the viewport crop.
3. **Score the rubric below against the images**, not against the code. Write the five
   numbers down; an unwritten score is a vibe.
4. **Fix the lowest axis only.** One axis per pass. Fixing three at once makes it
   impossible to tell which change helped.
5. **Re-render and re-score.** Two passes maximum, then stop and report the remaining
   score. A third pass is thrash, not craft.

**Tools, in order of preference:** the project's own Playwright or Puppeteer if it has one ·
a browser MCP server · `npx playwright screenshot` · a headless Chrome invocation.

**When there is no browser available at all:** report `not rendered — no browser tool in
this environment` as a finding, alongside the rubric line `not scored`. Never skip it
silently, never score the rubric from source, and never describe the design as verified.
The surface is delivered as unverified, and the report says so in those words.

## The rubric

Five axes, 1–5, scored against the screenshot.

| Axis | 1 | 5 |
| --- | --- | --- |
| **Composition** | Stacked full-width bands, everything centred, one rhythm from top to bottom | A structure with a reason — an asymmetry, an anchor, a deliberate break — and the eye lands where the job of the screen is |
| **Type** | One size for headings, one for body, default tracking, ragged measure | A scale that is visible as a scale; display set with optical care; measure held; the face carries the subject |
| **Color** | Grey on white with an accent applied to everything actionable and decorative alike | A dominant ground, one accent that means "act", supports that stay support; contrast is structural, not incidental |
| **Density and rhythm** | Uniform padding everywhere; nothing groups; the page is a list | Space groups related things and separates unrelated ones; the section rhythm comes from the type scale |
| **Signature** | Nothing here would be missed if it were another company's page | One element a person could describe from memory, and it traces to a provenance fact |

Read the axis descriptions as the failure and the target, not as a grading curve. Scoring a
3 across the board is the template result — it is the most common outcome and it is a fail,
not a pass.

**MODE changes what a good score means, and never lowers the floor.** On `product-surface`
and `native`, Signature scoring high is a *defect* — record it as such rather than
congratulating it, and read the axis as "one element of the small stuff done unusually well"
instead. On `quiet` budget, expect 2 on Signature and demand 4+ on Density and rhythm.

Report the five numbers in the response. Three numbers and an adjective is not a score.
