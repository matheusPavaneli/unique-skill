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
shared/design/    modes · landing · originality · devices · spectacle · craft · copy
shared/quality/   engineering · measure · floor
```

`shared/design/landing.md` is read whenever MODE is `marketing`. A landing page is an
argument — claim, mechanism, proof, objection, action — written before any layout, with the
hero picked from what the subject is rather than from a template, proof that is real or
absent, and the tightest performance budget in the plugin.

`shared/design/devices.md` is the positive repertoire. A blacklist alone lowers the floor
without raising the ceiling: a rejected default leaves a gap that the next-nearest default
fills. It names composition, type, color and detail devices with the condition each one
needs and what it breaks on — to derive a replacement from, never to pick from.

`shared/design/spectacle.md` decides whether depth, a shader, particles or ambient motion
belong at all: every effect must reveal a mechanism, respond to the person, or repay
attention, priced by how often the surface is visited, derived from the subject's own verb
rather than picked from a list, and specified with a parameter mapping, a degrade path and a
cut line before any code.

`shared/quality/engineering.md` holds the budgets everything is measured against, and the
loading details that expressive choices depend on — including the metric-matched font
fallback that is the difference between CLS 0.14 and CLS 0.00, and is skipped almost every
time. `shared/quality/measure.md` holds the command that produces each of those numbers, and
what to report when the tool is not installed.

## The render pass

Design is not verifiable from source. A surface read as code is judged against what the
reader expects code to produce — which is the same distribution the banned defaults came
from. So `frontend-design` and `ship-audit` both stop, serve the surface, screenshot
390 / 768 / 1440, and score it on five axes against the *images*: composition, type, color,
density and rhythm, signature. The lowest axis is fixed, the page re-rendered, and the loop
stops at two passes.

Scoring 3 across the board is the template result. It is the most common outcome and it is a
fail, not a midpoint. MODE decides what a good score means: on a product surface, scoring
high on signature is a defect and is recorded as one.

With no browser tool in the environment, the report says `not rendered` and `not scored` —
never a design described as verified. Same rule as every other measurement here.

## Scripts

Two dependency-free checks, Node builtins only, run against the project being audited:

```
node scripts/contrast.mjs <pairs.json>   # WCAG ratios over a token pair list, hex or oklch
node scripts/check-refs.mjs .            # every reference a skill points at exists
```

`node --test scripts/contrast.test.mjs scripts/check-refs.test.mjs` runs their tests.

## Evals

`evals/` holds three fixed briefs and the sheet they are scored on — a landing page at
`signature`, a work surface at `quiet` where distinctiveness is the defect, and a brief that
asks for particles by name. Manual, deliberately: one author, no runner, no CI.

## Install

```
/plugin marketplace add matheusPavaneli/unique-skill
/plugin install unique@unique
```

## The rule that makes the audit worth running

A number that was not measured is reported as "not measured", never estimated as fact.

## License

MIT
