# unique

A frontend plugin for Claude Code that generates visuals belonging to *this* product — not
to a template, not to whatever the last five sites looked like — and builds them on the
stack that job actually calls for.

Two halves, and most tools have neither. It decides **what to build the thing with** before
it decides **what the thing looks like**, derives the look from the subject's own world
instead of from a house style, and refuses to call either half done without measuring.

## The three ideas

**1. Capability routing, not library reflexes.** A brief that says "particles that settle
into the logo" gets a decision, not a habit. The routing rubric always starts at the
platform primitive and stops at the first tier that genuinely satisfies the requirement:

```
1  platform primitive   CSS, SVG, Canvas 2D, a Web API, the framework's own capability
2  small focused library
3  domain framework     earned by a core capability, or three supporting needs at once
4  hosted / authored    earned when non-engineer authoring speed is the real constraint
```

Every domain carries a fidelity ladder. For 3D it runs from CSS transforms (0 KB) through
a hand-written Canvas 2D field, a single WebGL fragment shader, three.js, React Three
Fiber, GPU-simulated particles via WebGL2 FBO or WebGPU compute, up to designer-authored
runtimes — with the byte cost, the failure mode, and the required fallback at each rung.
The most common and most expensive mistake in the domain is skipping to the top rung
because it is more interesting; the ladder exists to make that visible.

Each decision is written down with a **rejected alternative** and a **fallback**. A choice
with no rejected alternative was a reflex, not a decision. And every choice lands in one
ledger, because the real failure is not a bad library — it is six reasonable libraries that
together ship 900 KB and a 400 ms INP.

**2. "Unique" and "as good as Stripe" are different jobs.** Conflating them is the most
expensive mistake in AI-assisted design. The contract separates them explicitly:

| ORIGINALITY | Means | The reference supplies |
| --- | --- | --- |
| `native` | Match our existing system | Everything. Originality budget zero; success is invisibility |
| `benchmark(X)` | As good as X | The **bar**: spacing rhythm, motion timing, state coverage, copy density, contrast discipline. Never the palette, typeface, or hero composition |
| `signature` | Genuinely unmistakable | Nothing. The reference set is forbidden input; palette, type and layout derive from the subject's own material world |

`signature` is enforced with falsifiable gates rather than vibes: a per-axis swap test, a
provenance line tracing every axis to a concrete fact about the subject, a collision check
against a registry of current AI-design defaults, a rejection record, and a divergence log
so successive passes on the same project diverge instead of converging on a house style.

Before any of that, two things the gates depend on. **Facts are looked up, not recalled** —
eight named wells (material, notation, instrument, environment, constraint, vernacular, the
artifact of the trade, the shape of the data), and the instruction to go find what the real
artifact looks like rather than reaching for what the word is near in a model's priors. That
substitution is the actual root of generic output: a page about the *idea* of a subject is
the same page everyone generates about that idea. And **three whole directions are generated
before any tokens**, each from a different fact, two killed on the brief's terms — because
refining one candidate improves a direction, it never replaces one.

One rule that runs against the grain: **the trend press is not an input.** Search "web design
trends" for the current year and the results describe, item for item, the registry of banned
defaults. That is not a coincidence — a trend list is a description of the mean, which is the
thing a design has to leave. They are read to know what to avoid, never what to do.

**3. Product surfaces and expressive surfaces have opposite goals.** A settings page and a
launch page are not the same problem, and the failure mode of treating them the same runs
in both directions. `MODE` routes between them, `BUDGET` caps how much of a page is allowed
to be loud, and the accessibility and performance floor holds in every mode — including
`prototype`, including "just make it quick".

## Skills

| Skill | Does |
| --- | --- |
| `product-brief` | Idea → subject, audience, surfaces, and the capability list, each marked core / supporting / decorative |
| `stack-route` | Capabilities → one technology decision each, with cost, rejected alternative, fallback, and a summed ledger |
| `frontend-design` | The binding design contract, the token system, the visual craft, and whether an effect is earned |
| `build-surface` | Implementation against contract and stack: semantics first, states before the happy path, heavy capabilities behind a lazy boundary |
| `ship-audit` | Core Web Vitals, bundle, WCAG 2.2 AA, the state matrix, 320 px and 200 % zoom, and every promised fallback actually exercised |

`/unique <idea>` resolves which step to enter from what already exists and runs from there.

### The canonical flow

Each step leaves an artifact, and the artifact *is* the step: one that left no file did not
run, whatever the transcript says. `brief.md` → `stack.md` → `contract.md` → the code → the
audit and the scored rubric → the `log.md` entry, with a gate before each step rather than
after the build.

There is a short path for a change that touches no token, no grid line, no component line,
no signature and no new capability, on a surface that already has a contract — but it is a
re-entry into that contract, not an exit from the pipeline: it still holds the
non-negotiables, still re-runs `check-contract.mjs`, and still says which condition made it
eligible. "It's a small change" is not one of the conditions. The full flow, its gates and
the four conditions are in `commands/unique.md`, which is the authority.

## Commands

| Command | Runs |
| --- | --- |
| `/unique <idea>` | The full pipeline, entered at the right step |
| `/product-brief <idea>` | `product-brief` alone |
| `/stack-route <capability>` | `stack-route` alone |
| `/frontend-design <surface>` | `frontend-design` alone |
| `/build-surface <surface>` | `build-surface` alone |
| `/ship-audit [path]` | `ship-audit` alone |

Skills also load on their own when the work calls for them — the commands are for entering
a single step directly.

## Artifacts

Decisions are written to `.unique/` in the project — `brief.md`, `stack.md`,
`contract.md`, `log.md` — so a later session inherits them instead of re-deciding
differently. Commit them.

## Reference library

Loaded on demand, never all at once:

```
shared/stacks/    core · 3d-and-motion · dataviz-and-maps · editors-and-media
                  realtime-and-ai · platform
shared/design/    modes · landing · originality · devices · spectacle · craft · components
                  copy
shared/quality/   engineering · measure · floor
```

`shared/design/landing.md` is read whenever MODE is `marketing`. A landing page is an
argument — claim, mechanism, proof, objection, action — written before any layout, with the
hero picked from what the subject is rather than from a template, proof that is real or
absent, and the tightest performance budget in the plugin.

`shared/design/devices.md` is the positive repertoire. A blacklist alone lowers the floor
without raising the ceiling: a rejected default leaves a gap that the next-nearest default
fills. It names devices on five axes — composition, type, color and material, motion and
interaction, surface and material — plus the free details, each with the condition it needs
and what it breaks on, and it is indexed **by fact** rather than alphabetically — a
sequence implies a spine, a catalog implies an index, a material implies a ground — so the
route in is the provenance line, never a browse.

`shared/design/craft.md` derives the numbers rather than asserting them: a six-step palette
derivation from the COLOR fact, harmony rules for categorical sets (constant lightness,
constant chroma, even hue intervals) and APCA as a readability ceiling above the WCAG floor —
the layer that catches dark-mode text which is legal and still hard to read; a five-step
typeface derivation from the TYPE fact with a class table and the libre foundries to resolve
it against, instead of the four family names every model already has; a rule for how much of
the page each color is allowed to occupy; a motion choreography block, because the same
entrance on every element is what motion looks like when it is a rule instead of a decision;
and the composition sequence — a reading `PATH` and a `DENSITY` map, then `COLUMNS` /
`MEASURE` / `RHYTHM` / `BLEED` — because layout was the only axis being decided in adjectives,
and it was reliably the most generic one in the output.

`shared/design/components.md` is the layer between the tokens and the page. `craft.md` derives
the values; nobody sees a token and everybody sees a control, and a derived palette poured
into the default component shapes is a tinted default. So the component grammar is derived
from the same provenance fact and recorded in six lines — the three-to-five places the system
is recognizable, the one interaction signature every control shares, the control height and
the density it sets, the corner treatment, whether structure is carried by border, ground or
shadow, and the focus ring — with the state matrix treated as a design surface rather than as
an audit, because empty is usually the most-seen screen. `check-contract.mjs` requires the
block in every MODE: at `native` it records the grammar being inherited by name, and
`prototype` is precisely where an unexamined default enters a codebase and never leaves.

**Uniformity is the tell.** The most reliable sign of a generated page in 2026 is not a style,
it is a statistic: identical padding on every section, one radius everywhere, every card the
same height, the same fade-and-rise on every element. So the variance rule says where
unevenness is spent — density, scale, and one motion moment — and, just as firmly, where it
never is: radius, stroke weight, icon grid, control height, focus ring.

`shared/design/spectacle.md` decides whether depth, a shader, particles or ambient motion
belong at all: every effect must reveal a mechanism, respond to the person, or repay
attention, priced by how often the surface is visited, derived from the subject's own verb
rather than picked from a list, and specified with a parameter mapping, a degrade path and a
cut line before any code. Under the idiom catalog it names the seven primitives the idioms are
actually built from — displacement, flow field, SDF, feedback, moiré, dither, halftone — each
with the quantity its parameter must map to, its cheapest CSS or SVG form, and the fidelity
tier it escalates to when that form genuinely fails.

`shared/quality/engineering.md` holds the budgets everything is measured against, and the
loading details that expressive choices depend on — including the metric-matched font
fallback that is the difference between CLS 0.14 and CLS 0.00, and is skipped almost every
time. `shared/quality/measure.md` holds the command that produces each of those numbers, and
what to report when the tool is not installed.

## The render pass

Design is not verifiable from source. A surface read as code is judged against what the
reader expects code to produce — which is the same distribution the banned defaults came
from. So `frontend-design` and `ship-audit` both stop, serve the surface, screenshot
390 / 768 / 1440, and score it on seven axes against the *images*: composition, type, color,
density and rhythm, usability, signature, content. The axis with the largest weighted
shortfall is fixed, the page re-rendered, and the loop stops at two passes.

The seven axes are weighted into one 0–10 total, because a rubric of five visual axes was
scoring the easy half — a page can be beautifully composed and hard to use, and that rubric
could not say so. MODE picks the profile:

| Profile | MODE | Design group | Usability | Signature | Content |
| --- | --- | --- | --- | --- | --- |
| `expressive` | `marketing`, `editorial` | 40 % | 30 % | 20 % | 10 % |
| `functional` | `product-surface`, `native`, `prototype` | 30 % | 45 % | 10 % | 15 % |

`expressive` is the published Awwwards jury split. `functional` is not a jury's split,
because no jury looks at a settings screen: usability carries it, signature is worth little
because a loud product surface is a defect, and the labels and empty states are the product.
Target is 8.0. Below it after two passes, the number is written as it is, marked
`BELOW TARGET` with the weakest weighted axis named — never a third pass and never a kinder
re-score.

Scoring 3 across the board is the template result. It is the most common outcome and it is a
fail, not a midpoint. The weights change what a good score means and never lower the floor:
WCAG 2.2 AA, the state matrix, 320 px and 200 % zoom stay pass/fail *above* the rubric, so an
8.6 on a surface that fails the floor is an 8.6 that does not ship.

The step is blocking, and it ships with its own browser resolution — `scripts/render.mjs`
waits for the server, prefers the project's Playwright, otherwise fetches one through `npx`,
and captures the three rubric widths plus 320 px and 200 % zoom. "No browser tool in this
environment" was true often enough to become the default path, and a design judged only as
text converges on exactly the defaults the plugin bans. When the script genuinely fails, the
report says `not rendered — <the reason it printed>` and `not scored` — never a design
described as verified. Same rule as every other measurement here.

## Scripts

Dependency-free, Node builtins only, run against the project being audited:

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/palette.mjs"        <spec.json>
node "${CLAUDE_PLUGIN_ROOT}/scripts/render.mjs"         <url> [out-dir]
node "${CLAUDE_PLUGIN_ROOT}/scripts/check-contract.mjs" [.unique-dir]
node "${CLAUDE_PLUGIN_ROOT}/scripts/contrast.mjs"       <pairs.json>
node "${CLAUDE_PLUGIN_ROOT}/scripts/check-refs.mjs"     <repo>
```

They exist because a doctrine executed in the head is indistinguishable from one that was
skipped, and colors, screenshots and gates invented rather than produced converge on exactly
what the plugin is trying to avoid.

`palette.mjs` takes one provenance fact and its hue and runs the derivation arithmetically:
ground and ink on the fact's hue, accent placed by angle and then moved in lightness until it
*measures*, chroma clamped to what sRGB will actually paint, and every pair that matters —
body, muted, accent text, button label, both boundaries, focus ring on both grounds — checked
before the tokens are allowed into a build. `--categorical <n>` derives a peer set by OKLCH
harmony, and every pair is reported with its APCA `Lc` beside its WCAG ratio: the ratio decides
whether it ships, the `Lc` tells you whether anyone can read it.

`render.mjs` is the render pass: it waits for the server, resolves a browser, and captures
390 / 768 / 1440 full-page plus 320 px and 200 % zoom.

`check-contract.mjs` reads `.unique/contract.md` and `log.md` and fails on a missing contract
line, a grid block with no numbers in it, a missing components block, one of its six keys
left with no value or a components block with no measurements in it, a provenance "fact" that
is a mood, fewer than two
rejected directions, a missing rubric, a rubric missing an axis, a rubric with no total or a
total that does not follow from its own scores under the profile MODE implies, a straight-3
rubric, and any `log.md` entry repeating
an earlier `(palette, display face, layout device)` triple. It checks that the decisions were
made and recorded — not that they were good ones. That is what the rubric is for.

`contrast.mjs` computes WCAG ratios over a token pair list, hex or `oklch()`, gamut-mapping
anything outside sRGB the way a browser would rather than clipping it into a ratio that
flatters. `check-refs.mjs` verifies every reference file a skill points at exists — a
dangling one degrades a skill silently at run time.

The paths are plugin-relative because these run against the project being audited, not from
inside this repository.

`node --test scripts/*.test.mjs` runs their tests.

## Evals

`evals/` holds three fixed briefs and the sheet they are scored on — a landing page at
`signature`, a work surface at `quiet` where distinctiveness is the defect, and a brief that
asks for particles by name. Manual, deliberately: one author, no runner, no CI.

Each run keeps its screenshots and its delivered contract under `evals/runs/`, because the
comparison that matters is not this run against the rubric — it is this run's images against
the last run's, for the same brief. Two runs that both score 4/4/4/3/4 and look like the same
page have not diverged, and the numbers will not tell you that.

## Install

```
/plugin marketplace add matheusPavaneli/unique-skill
/plugin install unique@unique
```

## The rule that makes the audit worth running

A number that was not measured is reported as "not measured", never estimated as fact.

## License

MIT
