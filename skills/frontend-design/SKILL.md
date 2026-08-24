---
name: frontend-design
description: Commits a surface to a binding design contract and builds it at senior product-engineering quality. Separates "make it unique" from "make it as good as Stripe" from "match our existing system", and routes between product-surface work (convention and usability win) and expressive work (identity and memorability win). Use when building or reshaping UI. Do not use for a localized bug fix, a copy change, or backend work that happens to live in a UI file.
---

# frontend-design

Third step of the `unique` pipeline, and usable standalone. Output is `.unique/contract.md`.

Two failure modes, not one. Generic AI slop is the famous one. The other — decorating a
settings page, shipping a 400 KB display face on a dashboard, asymmetric grids on a data
table — is just as bad and far more common. This skill decides which risk it is running
before writing a line of code.

Read only the reference the decision needs. All paths under `${CLAUDE_PLUGIN_ROOT}/shared/`.

| File | Read when |
| --- | --- |
| `design/modes.md` | Always, at step 1 — routing and expression budget |
| `design/landing.md` | MODE is `marketing` — the page's argument, hero, proof, pricing, conversion |
| `design/originality.md` | ORIGINALITY is `signature` or `benchmark` |
| `design/devices.md` | With `design/originality.md`, at layout and composition time — what to move *to* once a default is rejected |
| `design/craft.md` | Any visual decision: type, color, space, motion, layout |
| `design/spectacle.md` | Any 3D, shader, particle, ambient-motion or scroll-choreography idea — and always before spending a `loud` budget |
| `design/copy.md` | Any user-visible words get written |
| `quality/engineering.md` | Any code ships — perf, fonts, images, budgets |
| `quality/floor.md` | Before "done" — a11y, state matrix, verification |

## Step 1 — Write the contract

Never skip. Five lines, in the response, before any code. Guessing is preferred over
asking; state the guess so the user corrects one line instead of re-briefing.

```
SUBJECT      <what it is, who uses it, the ONE job of this screen>
MODE         product-surface | marketing | editorial | native | prototype
ORIGINALITY  native | benchmark(<named reference>) | signature
BUDGET       quiet | measured | loud
SIGNATURE    <one sentence: the thing a person remembers — or "none, this is plumbing">
```

If `.unique/brief.md` exists, SUBJECT and MODE come from it, not from a fresh guess.

**The distinction that matters most.** Conflating these is the most expensive mistake here:

- **`benchmark(Stripe)`** — "as good as X". X supplies the *bar*, never the *look*: spacing
  rhythm, motion timing, state coverage, copy density, contrast discipline. Copying X's
  palette, typeface, or hero composition fails the brief. The result must sit beside X
  without reading as derivative.
- **`signature`** — "make it unique". The reference set is *forbidden input*. Palette, type
  and layout derive from the subject's own material world and must clear every gate in
  `design/originality.md`.
- **`native`** — "match our app". The existing token system outranks every aesthetic
  instruction in this skill. Originality budget is zero. Success is invisibility.

A brief that pins an axis wins outright. Spend freedom only where the brief left freedom.

## Step 2 — Plan before code

In thinking, held against the contract:

1. **Tokens** — 4–6 named colors, 2–3 type roles, spacing scale, radius, elevation, motion
   durations. `design/craft.md`.
2. **Layout** — one-sentence concept plus an ASCII wireframe. Compare at least two.
3. **Signature** — where the budget is spent, and what stays quiet around it. If it
   involves depth, an effect, particles or ambient motion, run `design/spectacle.md`:
   derive the idiom from the subject's mechanism, generate three candidates at three
   fidelity tiers, kill two, and write the effect spec block before any code.
4. **Cost ledger** — every expressive choice priced against `quality/engineering.md` and
   against `.unique/stack.md` if it exists. Unpaid cost is a cut choice, not a caveat.
5. **Gate** — `signature` or `benchmark` runs `design/originality.md` now, and revises
   before code, not after.

Show the user ideas only at higher confidence.

## Step 3 — Build

Follow the plan exactly. Every value comes from a token; a one-off hex or an inline `0.3s`
is a defect. Order: semantics and states first, then tokens, then composition, then motion.
Motion is added to a structure that already reads correctly, never to rescue one that does
not.

Watch CSS specificity collisions — a type selector (`.section`) and an element selector
(`.cta`) cancelling each other's padding is the most common self-inflicted bug here.

For a surface with real capabilities behind it, `build-surface` carries the implementation
loop; this skill owns the contract and the visual craft.

## Step 4 — Render, score, then subtract

**Look at it before judging it.** Serve the surface, screenshot 390 / 768 / 1440, and score
the five-axis rubric in `quality/floor.md` against the images. Fix the lowest axis, re-render,
re-score. Two passes maximum. No browser tool in the environment → report `not rendered` and
`not scored` as findings; never score from source and never call the design verified.

This is the step that separates this skill from a prompt. Everything above it is a plan; a
plan judged only as text converges on the defaults `design/originality.md` bans.

Then run the rest of the checklist in `quality/floor.md`, and Chanel's rule: remove one
accessory and name what was removed.

## Step 5 — Record

Write `.unique/contract.md` and append the direction to `.unique/log.md`, so the next
surface diverges instead of repeating. Format in `${CLAUDE_PLUGIN_ROOT}/shared/artifacts.md`.

## Non-negotiables

Hold in every mode, including `prototype` and including "just make it quick":

- Keyboard operable, visible focus, WCAG 2.2 AA contrast, `prefers-reduced-motion` honored.
- No layout shift from fonts or images. Explicit dimensions or `aspect-ratio` on every image.
- Real loading, empty, and error states for anything asynchronous.
- A native element or a headless accessible primitive for every overlay, menu, and control.
  Hand-rolled `div` dropdowns and modals are a defect, not a shortcut.
- Responsive to 390 px and to 200 % browser zoom without loss of content.
- No invented content presented as real data, metrics, testimonials, or logos.
