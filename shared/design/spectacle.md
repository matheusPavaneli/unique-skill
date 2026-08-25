# Spectacle: when depth, effects and particles earn their place

Read whenever a surface might carry a visual effect — 3D, shader, particles, ambient
motion, scroll choreography — and always before spending a `loud` budget.

`craft.md` sets the timings. `../stacks/3d-and-motion.md` sets the tool and the byte cost.
This file answers the question both of those skip: **should this exist at all, and what
should it be?** A well-built effect that is not about anything is the most expensive kind
of generic there is — it costs 200 KB to look like everyone else.

The current bar in the industry is not "more spectacle". Stripe, Linear and Vercel are the
references everyone cites and none of them ships a decorative 3D hero: monochrome ground,
one accent, brutal contrast, and the loud moment spent on the product itself working. The
2026 pattern is *the hero is the product*, not an illustration of the product. Effects have
moved from "atmosphere on top of the page" to "the mechanism of the thing, rendered".

---

## Gate A — Does it carry meaning?

Every effect must do one of these three jobs. An effect that does none is decoration and
gets cut at plan time, not at audit time.

| Job | It means | Test |
| --- | --- | --- |
| **Reveal** | The effect *shows the subject's mechanism* — how the thing works, what it is made of, what it moves | Remove it: does the person understand the product less? |
| **Response** | The effect *answers the person* — cursor, scroll, input, voice, data, live state | Remove the interaction: is it still interesting? If yes, it was a video |
| **Repay** | The effect *rewards attention* with information — hover reveals the value, scroll unfolds the argument, drag exposes the internals | Does spending 3 more seconds return anything? |

Three failure names, from the most common briefs:

- **Wallpaper** — a shader/particle field that would work for any company. Fails Gate A and
  the swap test in `originality.md` simultaneously.
- **Mascot** — a floating abstract blob or crystal standing in for the product because the
  product is hard to draw. The product is not hard to draw; it was not looked at.
- **Tour** — scroll-jacked sequence explaining what a paragraph explains faster.

## Gate B — Attention economics

Spectacle is paid for with someone's attention, once. Price it by how often they arrive.

| Surface | Visits | Spectacle allowed |
| --- | --- | --- |
| Launch / campaign / brand / portfolio | Once, deliberately | The effect can *be* the page |
| Marketing home, product page | Once or twice, skeptical, often mobile | One moment, ≤1 s to first meaning, never in the LCP element |
| Editorial feature | Once, reading | Effects inside figures only. Never behind or around prose |
| Docs, changelog | Repeatedly, in a hurry | None. Diagrams, not scenes |
| Product surface used daily | 40×/day | Zero ambient motion. Motion only where it explains a state change |
| Onboarding / empty state / success / celebration | Once each, in a product | This is the one place a product surface earns a moment — it is a first or a milestone, not a workspace |

The rule behind the table: **an effect a person sees once can be extravagant; an effect they
see a hundred times must be silent.** Almost every ugly "delightful" product UI is this rule
broken.

## Gate C — Is it the cheapest form of this idea?

From `../stacks/3d-and-motion.md`: T0 CSS depth, T1 Canvas 2D particles, T2 one fragment
shader, T3+ real scene. Write the idea, then ask what the *lowest* tier that expresses it
is. The answer is T2 far more often than briefs assume — one full-screen quad and a
fragment shader is the highest quality-per-byte in the whole domain, and because the output
is code nobody else has, it is also the cheapest place to buy a real signature. A scene
graph is for actual geometry.

If the idea only works at T4/T5, it must be a `core` capability in `stack.md`. An effect
described as atmosphere and priced as core is a mislabelled decision — fix the label or cut
the effect.

## Gate D — Where does the quiet come from?

A loud element only reads as loud against discipline. One signature moment inside a strictly
typographic, tightly-spaced, monochrome page reads as confidence; three moments read as a
template with plugins. Before adding the effect, name what gets *quieter* to pay for it —
usually: palette drops to two colors, motion elsewhere goes to zero, and the section around
it loses its decoration.

---

## Idiom catalog — matching the subject to the form

Pick the idiom from what the subject *is*, never from what looks impressive. Each entry:
what it fits, what it breaks on, and the cheapest tier that does it.

**The product itself, running.** A real interface, live or a faithful reproduction, doing
the actual job — an agent picking up a real issue, a query returning rows, a diff applying.
Fits: any product with a visible surface. Breaks: nothing to look at, or the demo has to
lie. Tier: T0 + real components. The strongest default in 2026 and the one most briefs skip
because it is not "designy".

**Data as the graphic.** The subject's own numbers are the hero — a live series, a real
distribution, the actual graph of the user's account. Fits: analytics, finance, infra,
observability, science. Breaks: pre-launch with no data (do not fake it — see the
non-negotiables). Tier: T0/T1, SVG or Canvas.

**Field / flow.** Particles or lines carrying something from A to B: packets, payments,
requests, molecules, traffic, current. Fits products whose value *is* movement through a
network. This is where particles are genuinely earned, and the count should map to something
real (throughput, nodes, requests) rather than being tuned for prettiness. Breaks: static
subjects — a CRM is not a flow. Tier: T1 Canvas, T2 shader, T5 only if the field is the
product.

**Material and depth.** Real geometry, real light, rotatable, zoomable: hardware, physical
goods, robots, architecture, a device, an instrument. Fits when the person's actual question
is "what is it like". Breaks on software with no body — dressing SaaS in 3D chrome is the
mascot failure. Tier: T3/T4, poster image first, always.

**Assembly / cutaway.** Something builds itself, explodes into parts, or is sliced open as
the person scrolls or drags. Fits complex systems, hardware, pipelines, layered
architectures. This is the strongest form of *Reveal* and it survives a mobile downgrade
well as a stepped diagram. Tier: T0 for layered planes, T3 for real parts.

**Reactive surface.** The ground answers the cursor, the pointer, the mic, the scroll — a
distortion, a ripple, a spotlight, a warp. Fits creative tools, audio, editors, anything
whose value is responsiveness; the effect *is* the demo of latency. Breaks: reading
surfaces, and any page where it becomes a mouse-follow glow blob (see anti-patterns). Tier:
T2, and it must be visibly interactive within one second or it is wallpaper.

**Type as the image.** No graphic at all: display type at a size that is a decision,
set with real optical care, one grid-break, one rule. Fits opinionated products, developer
tools, editorial, anything whose value is a claim. Breaks when the claim is weak — this
idiom exposes bad copy instantly, which is a feature. Tier: T0, 0 KB. Under-used relative to
how often it is the best answer.

**Generative identity.** One system produces every mark on the site — a seeded pattern per
customer, a plotted form per data point, a per-page variant. Fits brands whose story is
systems, individuality at scale, or generation itself. Breaks: needs a real rule; a random
noise field is not a system. Tier: T0 SVG or T2.

**Instrument / notation.** The subject's own visual language — a score, a schematic, a
waveform, a chart of accounts, an anatomical plate, a knitting chart, an aviation checklist.
Almost always the strongest `signature` answer, and it comes straight out of the provenance
line in `originality.md`. Tier: T0/T1.

**Ambient nothing.** Deliberately no effect: pure typography, pure product, pure whitespace.
This is a legitimate and often correct choice for `product-surface`, docs, security, health,
finance, and anything whose value is trust. Choosing it is a decision to state, not an
absence to apologize for.

---

## Effect primitives — what the idioms are made of

The idiom says what the effect *is about*. Below it there is a much smaller vocabulary of
mechanisms that award-level work is actually built from — seven of them cover most of it —
and knowing them is the difference between deriving an effect and reaching for a library that
already packaged one.

Each entry: what it is made of, the parameter that must map to a real quantity of the
subject, the cheapest form that genuinely produces it, and the tier in
`../stacks/3d-and-motion.md` it escalates to when the cheap form actually fails. Escalate on
a measurement, never on ambition — and the cheap form fails far less often than it is assumed
to.

**Displacement.** Sampling a source at coordinates offset by a second field, so an image,
a rule or a body of type is pushed around without being redrawn. Map: the displacement
*amount* to a real magnitude — a load, a deviation, a signal strength — and the field's scale
to a real size. Cheapest: SVG `feDisplacementMap` driven by `feTurbulence` or, better, by a
real greyscale map; `filter: url(#id)` on any element, animated by moving the source. Reads as
material rather than as an effect when the map is real data. Escalates to T2 when it must
respond per-frame to the pointer across a full-viewport surface.

**Flow field.** A vector field sampled per particle per frame, so many small things move along
one coherent invisible geometry. Map: the *count* to a real quantity (nodes, requests, items
in flight) and the field to the real topology — never a count tuned until it looks nice. This
is the difference between an earned particle field and `particles.js`. Cheapest: T1, a few
hundred particles on a 2D canvas with the field computed in closed form. Escalates to T5 only
when the field itself *is* the product and the count is genuinely in the hundreds of
thousands.

**Signed distance field (SDF).** Geometry described as "distance to the nearest surface",
which makes shapes that merge, hollow, outline, repeat and round without any mesh. Map: the
distance threshold to a real tolerance, a radius, a margin, a proximity. Cheapest: for one
static shape, an SVG path or a `mask-image`; for merging blobs, CSS `filter: blur()` plus
`contrast()` (the "gooey" trick) at 0 KB. Escalates to T2 for a real SDF fragment shader —
raymarched 3D included, since raymarching exists precisely so that no mesh is needed and it is
still one full-screen quad. It reaches T3 only when the subject brings real geometry or real
assets, which is a 150 KB step and rarely what an SDF was wanted for.

**Feedback.** Each frame reads the previous frame, so the surface accumulates: trails, decay,
smear, growth, erosion. Map: the *decay rate* to a real half-life — how long the subject's own
signal actually persists. Cheapest: a canvas cleared with a partial-alpha fill instead of
`clearRect`, which is one line and gives trails with real decay. Escalates to T2 with a
ping-pong framebuffer when the accumulation must be per-pixel and physical. This is the
primitive under most "it feels alive" surfaces, and it is nearly free.

**Moiré.** Two regular grids overlaid at a small angle or a small scale difference, producing
a third pattern that is enormously sensitive to both. Map: the *angle or pitch difference* to
a real quantity — a drift, a mismatch, a tolerance, a phase — because moiré's whole
expressive value is that a tiny change in an input makes a large change in the output.
Cheapest: two `repeating-linear-gradient` layers, or two SVG line patterns, one rotated; 0 KB
and it animates on `transform`. Rarely needs to escalate at all.

**Dither.** Quantizing to very few levels while distributing the error, so a gradient survives
at two or four colors instead of banding. Map: the *level count* to something real — the bit
depth of the source instrument, the number of states, the palette actually available.
Cheapest: an ordered (Bayer) matrix as a tiled CSS or SVG mask over a flat field, 0 KB; for
photographs, dither at build time and ship a smaller file than the original. Escalates to T2
only for dithering something that is itself being generated per frame.

**Halftone.** Continuous tone rendered as marks of varying size on a regular grid at a stated
ruling and angle. Map: the *ruling* to the subject's real process — a newsprint line count, a
risograph screen, a fax resolution — and the angle to what that process uses. Cheapest: a
repeating radial-gradient mask, or an SVG pattern of circles scaled by a luminance mask; 0 KB.
Escalates to T2 when the ruling must follow the pointer or the mark shape is not a dot.

Two rules over all seven:

- **A primitive with no mapping is a filter.** If the parameter is tuned by eye until it looks
  good, the effect is decoration and Gate A has not been passed. The mapping line in the
  effect spec is where this is checked.
- **Compose at most two.** Displacement over a halftone, feedback over a flow field: two
  primitives is a mechanism, four is a demo. The same rule as the devices.

---

## Making one: from fact to mechanism

Effects are not chosen from a list of effects. They are derived, in three moves:

1. **Take the provenance facts** from `originality.md` — the material world of the subject.
2. **Find the mechanism.** What actually moves, converts, connects, layers, accumulates,
   decays, or resolves in this subject? Write it as a verb sentence: "requests fan out to
   edges and come back"; "a claim is checked against six sources"; "sound is cut into grains
   and rearranged".
3. **Render that sentence, and nothing else.** The verb is the effect. Its parameters map to
   the subject's real quantities. Its interaction is the person doing the subject's own verb.

Generate **three** candidates by this route, at three different tiers, then kill two on
Gates B–D and record the kills in the contract's `Rejected` block. A single-candidate
process reliably produces wallpaper.

Then specify it precisely enough to build, because "particle field" is not a spec:

```
IDIOM      <from the catalog, or named if new>
PRIMITIVE  <the effect primitive underneath it, or "none — this is T0 composition">
MECHANISM  <the verb sentence>
JOB        reveal | response | repay
MAPPING    <visual parameter> <- <real quantity of the subject>
INPUT      <cursor | scroll | data | input | none> — first meaningful frame in <n> ms
TIER       <T0-T6>  ·  <KB gz>  ·  <main-thread cost>
QUIET      <what gets quieter to pay for this>
DEGRADE    reduced-motion: <...>  ·  no-WebGL / low-power: <...>  ·  mobile: <...>
CUT LINE   <the measurement at which this is removed, not "optimized">
```

`CUT LINE` before building is what stops a blown budget from becoming a negotiation.

---

## Effect anti-patterns (2026)

Each of these is a *stock effect* — recognizable on sight, unattached to any subject, and
therefore incapable of being a signature no matter how well it is executed:

Mouse-follow radial glow · gradient mesh with a noise overlay · iridescent morphing blob
(simplex-displaced sphere) · generic starfield or dot grid with a radial vignette ·
`tsparticles`/`particles.js` with a link-and-bounce config · connected-dots "network" that
represents no network · marquee of greyscale logos · typewriter hero headline · count-up
statistics on scroll · tilt-on-hover applied to every card · blur-and-rise entrance on every
element on the page · Spline embed as a hero · smooth-scroll library on a page that is read ·
autoplaying particles above the fold before LCP · a 3D scene with no keyboard path.

Two structural tells, worse than any single effect: **an effect layer with no interaction**
(it is a video, and a video is 40× cheaper), and **scattered micro-interactions** in place of
one orchestrated moment.

## Never negotiable, even at `loud`

Motion is opt-out via `prefers-reduced-motion` — a frozen composed frame or a poster, never
a spinning scene. The effect never sits in the LCP element. Every effect has a declared
non-WebGL and low-power path. Nothing about it is required to operate the page: if the
canvas fails to mount, the surface still reads, still converts, still passes AA. Spectacle
lives above the usability floor and never through it.
