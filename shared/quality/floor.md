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

11. **Contract holds.** `node ${CLAUDE_PLUGIN_ROOT}/scripts/check-contract.mjs .unique` — the
    five contract lines, the grid block in numbers, the components block in every MODE with a
    value on every key, a provenance fact per axis, two rejected directions, the seven rubric
    scores with their profile and total, and no repeated triple in `log.md`. It checks that
    the decisions were made and recorded, not that they were good ones; a clean run is the
    floor, not the ceiling.

Report honestly. A failed check named is worth more than a checklist claimed. If a step
could not run in this environment, say which and why.

## The render pass

Design is not verifiable from source. A surface read as code is judged against what the
reader expects code to produce, which is the same distribution the banned defaults in
`../design/originality.md` came from. The only way out is to look at the pixels.

**The loop, run before the subtract-one rule:**

1. **Serve it.** The real dev server or a static build. Not a fragment in isolation.
2. **Screenshot 390 / 768 / 1440.** Full page, not the viewport crop.
3. **Score the rubric below against the images**, not against the code. Write the seven
   numbers and the total down; an unwritten score is a vibe.
4. **Fix the axis with the largest weighted shortfall.** One axis per pass — and weighted,
   not raw: on the `functional` profile a 3 on usability costs 0.45 of the mean and a 3 on
   type costs 0.075, so the lowest raw number is often not the one worth a pass. Fixing
   three at once makes it impossible to tell which change helped.
5. **Re-render and re-score.** Two passes maximum, then stop and report the remaining
   score. A third pass is thrash, not craft.

**Run it with the plugin's own script.** It resolves the browser itself, so "no browser
tool" is no longer a reason to skip the step:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/render.mjs http://localhost:3000 .unique/render
```

It waits for the server, prefers the project's own Playwright, falls back to fetching it
through `npx`, and captures 390 / 768 / 1440 full-page **plus** 320 px and 1440-at-200 %-zoom
— the two compliance cases that fail silently when nobody looks at them. Then read the PNGs.

Other acceptable tools, if the project already has one: its own Playwright or Puppeteer
script, or a browser MCP server. A tool that produces a viewport crop instead of a full page
is not acceptable — the part of a page that goes generic is below the fold.

**This step is blocking.** A surface with no seven numbers written down is not done, and the
rubric is never scored from source. There are exactly two legitimate outcomes:

- Seven numbers and a total, scored against the images and the evidence named below.
- `not rendered — <the specific reason the script failed>`, quoted from its output, plus the
  rubric line `not scored`, plus the words "delivered unverified" in the report.

"No browser tool in this environment" is no longer one of those reasons on its own: say what
`render.mjs` actually reported — nothing served at that URL, the network refused the install,
the build never started. A vague unavailability is the escape hatch this step exists to
close, because it is also the cheapest path and it was becoming the default one.

## The rubric

Seven axes, 1–5, weighted into one 0–10 total.

The rubric used to be five axes, all of them visual, all of them weighed the same — which
made the plugin's self-assessment a design score and nothing else. A page can be beautifully
composed and hard to use, and the version of this rubric that could not say so was scoring
the easy half. The axes below split the way a jury actually splits: **design, usability,
creativity, content**, with usability and content carrying real weight rather than sitting
in a pass/fail checklist above the score.

### The axes

**The design group** — four axes, scored against the screenshots.

| Axis | 1 | 5 |
| --- | --- | --- |
| **Composition** | Stacked full-width bands, everything centred, one rhythm from top to bottom | A structure with a reason — an asymmetry, an anchor, a deliberate break — and the eye lands where the job of the screen is |
| **Type** | One size for headings, one for body, default tracking, ragged measure | A scale that is visible as a scale; display set with optical care; measure held; the face carries the subject |
| **Color** | Grey on white with an accent applied to everything actionable and decorative alike | A dominant ground, one accent that means "act", supports that stay support; contrast is structural, not incidental |
| **Density and rhythm** | Uniform padding everywhere; nothing groups; the page is a list | Space groups related things and separates unrelated ones; the section rhythm comes from the type scale |

**The three that carry the rest.**

| Axis | 1 | 5 |
| --- | --- | --- |
| **Usability** | The next action is not obvious; targets are small; 320 px or 200 % zoom loses content; states are the happy path and a spinner | The next action is obvious without reading; targets and focus survive 320 px and 200 % zoom; every async thing has a real loading, empty and error state; nothing needs a second look to operate |
| **Signature** | Nothing here would be missed if it were another company's page | One element a person could describe from memory, and it traces to a provenance fact |
| **Content** | Placeholder headline, `Submit` / `Learn more`, an empty state that says "No data", errors that say "Something went wrong" | Real copy in the subject's vernacular; the headline makes the argument; empty states say what to do next; errors say what happened and what to do |

### What the two new axes are scored against

Neither is scored from source, and neither is scored from intent — the same rule the four
visual axes already hold.

- **Usability** is scored against the render set — 390 / 768 / 1440 plus the 320 px and
  200 % zoom captures — together with the state matrix and the verification checklist
  already completed above in this file. Both exist before the render pass runs, so this is
  scoring evidence already gathered, not a new investigation.
- **Content** is scored against the real copy as it appears in the render: the headline,
  the labels, the empty states and the error strings. `../design/copy.md` is the standard.
  Copy that only exists in the plan and not on the page scores what is on the page.

### The two weight profiles

MODE selects the profile. Record the profile name in the contract, so the total is
reproducible by anyone reading it.

| Profile | MODE | Design group | Usability | Signature | Content |
| --- | --- | --- | --- | --- | --- |
| **expressive** | `marketing`, `editorial` | 40 % | 30 % | 20 % | 10 % |
| **functional** | `product-surface`, `native`, `prototype` | 30 % | 45 % | 10 % | 15 % |

`expressive` is the published Awwwards jury split — design 40, usability 30, creativity 20,
content 10 — and it is the right split for a page whose job is to be looked at and
remembered.

`functional` is not a jury's split, because no jury looks at a settings screen. It says what
this plugin already said in prose: on a product surface a high Signature score is a defect,
not a win, so Signature is worth 10 % there; the screen is operated rather than admired, so
Usability takes 45 %; and the labels and empty states *are* the product, so Content rises to
15 %.

The design group's weight is split evenly across its four axes — 10 % each on `expressive`,
7.5 % each on `functional`.

**BUDGET `quiet` releases the Signature weight.** A quiet budget declines to spend on a
signature on purpose, and this file already tells the scorer to expect a 2 there. Leaving
Signature weighted would then hold every honestly-scored quiet surface permanently below
target for doing exactly what its budget asked. So at `quiet` the axis stops being paid for:
Signature goes to 0, half its weight moves to Usability and half is spread across the design
group — where a quiet surface is supposed to be winning. On `expressive` that reads 12.5 %
per design axis, usability 40 %, content 10 %. Still score the axis and still write the
number down; it just no longer costs a surface the target.

### The total

```
total = (Σ score × weight) × 2      rounded to one decimal, 0–10
```

A total landing exactly on a half — 8.25, 8.35 — rounds **up**. `check-contract.mjs`
accumulates the weights as integers so it rounds the same way a person reading this line
does, and it accepts anything within 0.05 of its own result.

Target is **8.0**. Worked both ways, same seven scores where they overlap:

```
expressive   composition 5 · type 4 · color 4 · density 4 · usability 4 · signature 5 · content 4
             (5+4+4+4)×0.10 + 4×0.30 + 5×0.20 + 4×0.10  =  4.3   ->  8.6

functional   composition 4 · type 3 · color 4 · density 5 · usability 5 · signature 2 · content 4
             (4+3+4+5)×0.075 + 5×0.45 + 2×0.10 + 4×0.15  =  4.25  ->  8.5
```

**The weights change what a good score means and never lower the floor.** Everything above
this section — WCAG 2.2 AA, the state matrix, 320 px, 200 % zoom, the non-negotiables — stays
pass/fail and stays *above* the rubric. A 5 on Usability does not buy a failed contrast
check, and an 8.6 total on a surface that fails the floor is an 8.6 that does not ship.

Scoring 3 across the board is still the template result — the most common outcome and a
fail, not a pass. `check-contract.mjs` treats it as one.

### When two passes are not enough

The loop stops at two passes. If the total is still below 8.0 after the second:

1. Write the real number. Do not round it up to the target and do not re-score more kindly.
2. Mark the contract's total line `BELOW TARGET`, directly after the number —
   `total: 7.4 BELOW TARGET`. The checker reads the marker there and nowhere else, so that
   it cannot be satisfied by a leftover template annotation.
3. Name the axis with the largest **weighted** shortfall — `(5 − score) × weight` — because
   that is the one a third pass would have been spent on.
4. Ship, and say all three of those things in the report.

A third pass is thrash. An honest 7.4 with the weakest axis named is worth more than an 8.0
produced by scoring the same page twice with a softer eye.

### Recording it

Write the seven numbers, the profile and the total into `.unique/contract.md` under
`## Rubric`, one axis per line. A score that lives only in the response cannot be compared
against the next pass, which is the only thing that tells you whether the work is improving.

**MODE still changes how an axis is read, not only how it is weighed.** On `product-surface`
and `native`, Signature scoring high is a *defect* — record it as such rather than
congratulating it, and read the axis as "one element of the small stuff done unusually well"
instead. On `quiet` budget, expect 2 on Signature and demand 4+ on Density and rhythm.

Report the seven numbers and the total in the response. Three numbers and an adjective is
not a score.
