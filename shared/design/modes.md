# Modes, originality, and expression budget

Three independent axes. Set all three in the contract. Getting MODE right matters more
than any other decision in this skill, because it decides whether distinctiveness is the
goal or the failure.

## Axis 1 — MODE (what kind of surface)

### `product-surface`
Dashboards, settings, forms, tables, admin, editors, checkout, onboarding, internal tools,
anything a person uses repeatedly to get work done.

Convention is a feature. A person who has used one product should be able to operate this
one without reading. The win is speed, legibility, and the absence of surprise.

- Do: density control, clear hierarchy, generous hit targets, immediate feedback,
  keyboard paths, sensible defaults, state coverage, boring-but-perfect tables and forms.
- Do not: asymmetric grids, diagonal flow, grid-breaking elements, custom cursors, scroll
  hijack, entrance animations on data, display faces in UI chrome, decorative backgrounds
  behind content, novel controls where a native one exists.
- Distinctiveness lives in: type scale and rhythm, color used semantically rather than
  decoratively, motion that explains change (an item moving to its new position), empty
  states that actually help, one restrained accent, quality of the small stuff.
- Font: a legible UI face or the system stack. `Inter` here is a legitimate engineering
  choice, not a failure. Long-form data reads better with tabular figures.

### `marketing`
Landing pages, product pages, pricing, launch pages, campaign sites. A person arrives, is
persuaded or not, and leaves. Expression pays.

- Do: a hero that is a thesis, strong type, orchestrated page-load, scroll reveals,
  atmosphere, one signature moment.
- Do not: bury the action, sacrifice LCP for a decorative hero, animate above-the-fold
  content into existence so slowly the message arrives late.

### `editorial`
Docs, blogs, long-form, changelogs, case studies, reports. Reading is the job.

- Do: measure of 60–75 characters, a real reading face at 17–20 px with 1.6–1.75 line
  height, clear heading hierarchy, footnotes and captions styled deliberately, tables and
  code blocks treated as first-class.
- Do not: full-bleed decoration competing with text, animation on scroll through body copy,
  low-contrast "elegant" grey text.

### `native`
Adding to an existing product with an existing design system.

- Read the system first: tokens, spacing scale, component library, existing patterns.
  Cite the files. Match them exactly.
- Extend the system only when nothing fits, and then in the system's own idiom.
- Never introduce a second token system, a second icon set, a second font, or a one-off hex.
- This mode overrides every aesthetic instruction elsewhere in this skill.

### `prototype`
Throwaway: a spike, a concept, a screenshot for a deck.

- Speed wins. Fake data allowed if clearly labeled as fake. Real states optional.
- The non-negotiables in SKILL.md still hold. A prototype that traps keyboard focus is
  still broken.

## Axis 2 — ORIGINALITY (where the identity comes from)

### `native`
Identity is inherited. Originality budget zero. See MODE `native`.

### `benchmark(<reference>)`
The user named a bar: "as good as Stripe", "Linear-quality", "feels like Vercel".

The reference supplies **invariants of craft**, never surface:

| Take from the reference | Never take |
| --- | --- |
| Spacing rhythm and density | Palette |
| Motion durations and easing | Typeface pairing |
| Contrast and hierarchy discipline | Hero composition |
| State and edge-case coverage | Illustration or graphic style |
| Copy density and tone | Logo shape, iconography |
| Perceived latency handling | Section order as a template |

State explicitly in the plan what invariant is being borrowed and what is being invented.
A deliverable that could be mistaken for the reference has failed the brief, not met it.

Common invariants worth naming: Stripe — dense information at high contrast, documentation
as a product surface, restrained gradient used once. Linear — motion under 200 ms,
keyboard-first, near-zero chrome. Vercel — monochrome plus a single accent, strong type
scale, ruthless emptiness. Extract the principle, then discard the example.

### `signature`
The user wants something unique, original, unmistakable, "not like everything else".

The AI-default cluster and the obvious references are forbidden inputs. Palette, type, and
layout must trace to the subject's own material world. Run every gate in
`originality.md` before writing code.

Ambiguity rule: "make it beautiful / modern / clean" is **not** `signature`. It is
`benchmark(category leader)` at `measured` budget. Reserve `signature` for briefs that ask
for identity, memorability, or difference.

## Axis 3 — BUDGET (how much of the page is allowed to be loud)

A loud element is one that breaks the page's own rules: an oversized type moment, a
grid-break, a custom-drawn graphic, an ambient animation, a full-bleed treatment, an
unusual interaction.

| Budget | Loud elements allowed | Typical pairing |
| --- | --- | --- |
| `quiet` | 0 | product-surface, native, editorial docs |
| `measured` | 1 | most marketing, editorial features, product marketing pages |
| `loud` | 3+ | portfolio, launch, campaign, brand site, art-directed editorial |

Deciding *what* the loud element is — and whether an effect, 3D or particles belongs at
all — is `spectacle.md`. Budget says how much; that file says whether and which.

Rules:
- Spend the budget in one place. Everything around the signature stays disciplined.
- Loud costs are paid from the perf and a11y budget in `../quality/engineering.md`. A
  budget of `loud` does not buy a 3 s LCP.
- Under-spending is also a failure. `measured` with zero loud elements is a template.

## Resolving conflicts

1. Explicit user instruction beats everything.
2. Existing design system beats aesthetic preference.
3. Non-negotiables in SKILL.md beat expression.
4. MODE beats BUDGET — a `loud` budget on `product-surface` means loud *within* what
   product surfaces permit: type and color, not scroll hijack.
5. When two readings of the brief lead to materially different work, build the more
   conservative one and name the alternative in one sentence.
