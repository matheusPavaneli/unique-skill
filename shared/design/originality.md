# Originality protocol

Read when ORIGINALITY is `signature` or `benchmark`. "Looks generic" is not a usable test.
These are.

## The banned-default registry

Not a blacklist of names — a list of *unearned* choices. Any of these is allowed **only**
when the brief names it, or when a provenance line (below) justifies it for this subject.
Reaching for one because it looks good is the failure.

**Current AI-design clusters (2026):**
1. Warm cream ground (~`#F4F1EA`), high-contrast serif display, terracotta accent.
2. Near-black ground, one acid green / vermilion accent, thin mono labels.
3. Broadsheet: hairline rules, zero radius, dense columns, tiny caps eyebrows.
4. Untouched shadcn/ui: default radius, default zinc ramp, default `Inter`, default card
   grid. Shipping the starter theme is now the single most recognizable AI look.
5. Violet-to-blue gradient on white; gradient text headline.
6. Glassmorphism cards floating on a gradient mesh; noise overlay as default texture.
7. Bento grid used where the content is not actually heterogeneous.
8. Skewed floating dashboard screenshot with a soft glow beneath it.
9. Greyscale "Trusted by" logo marquee, infinite scroll.
10. `01 / 02 / 03` numbered markers on content that is not a sequence.
11. Dark hero with starfield or grid-lines and a radial vignette.
12. The pairing reflex: whatever geometric-display + neutral-body combination has been used
    on the last five outputs. Names rotate; the reflex is the problem.

13. Even distribution as a texture: identical padding on every section, one radius on every
    corner, every card the same height, every gap the same gap. This is the newest and most
    reliable tell — not a style, a *statistic*. See "the variance rule" below.
14. A thin colored accent bar down the left edge of a card, panel or callout. Currently one
    of the most specific tells of a generated interface.
15. The same entrance animation on every element: fade-and-rise, staggered by index, applied
    to the whole page. Motion applied uniformly is motion that explains nothing.
16. Smooth, symmetrical, plastic illustration — the AI-image look — used as the page's
    imagery. Also: an illustration style chosen because the subject was hard to photograph.

**Structural defaults, equally banned unaudited:** hero → logo strip → three feature cards
with icons → alternating image/text → testimonial → pricing table → dark CTA band → fat
footer. That order is fine when the content demands it; it is a template when the content
was fitted to it.

## The trend press is not an input

Search "web design trends" for the current year and the results describe, item for item, the
list above: bento grids, glassmorphism, saturated "dopamine" palettes, kinetic type,
"controlled imbalance", subtle 3D. This is not a coincidence and it is not a reason to think
the registry is wrong. A trend list is a description of **the mean of the distribution** —
which is exactly the thing a design has to leave in order to be recognizable.

So: never derive an axis from a trend roundup, a "top 10 sites" listicle, or a style name in
current circulation. They are legitimate for one purpose only — checking whether a direction
you already derived has since become common, which is Gate 3. Read them to know what to
avoid, never to know what to do.

The same applies to the reference set as a whole. Studio work is worth reading for *method*
— how a decision was reached — never for surface.

## The variance rule

Uniformity is the tell, and uniformity is what a generated page defaults to because every
value is applied by rule and nothing is applied by judgement. A page where every section has
the same padding, every card the same height, and every element the same entrance has no
hierarchy — it has a stylesheet.

Three places to spend deliberate unevenness, and they cost nothing:

- **Density.** At least one section is denser than the rest, and at least one is emptier.
  Rhythm is variation *over* the unit in `craft.md`'s grid block, not repetition of it.
- **Scale.** The type scale has a step nothing else uses — the display moment — and the gap
  between it and the next step is a decision. An even ladder from 14 px to 48 px reads as
  generated because it was.
- **Motion.** One orchestrated sequence, not one effect distributed. If the entrance is on
  everything, it is on nothing.

The counter-rule matters just as much: unevenness is spent in those three places and nowhere
else. Radius, stroke weight, icon grid, control height and focus ring stay ruthlessly
uniform. Varying *those* is not art direction, it is an unfinished component library.

**A blacklist alone lowers the floor without raising the ceiling.** A rejected default
leaves a gap, and the gap gets filled by the next-nearest default. `devices.md` is the
positive repertoire — named composition, type, color and detail devices with the condition
each one needs — to derive the replacement from instead. Read it at layout time, after the
provenance lines below exist, never before: a device chosen from a list is a default with a
longer name.

## Gate 1 — The swap test

Take the token set and the layout concept. Ask: would this work unchanged for a different
company in a different industry?

- Yes → it is not derived from this brief. Revise the failing axis.
- No, because of `<specific reason>` → passes.

Run it per axis (color, type, layout, signature), not once for the whole design. Most
failures are one axis riding along generically inside three good ones.

## Finding the facts

Everything downstream hangs on the provenance lines, and the failure that produces generic
output is not a bad fact — it is a **remembered** one. Asked for a ceramics studio, a model
reaches for terracotta because "ceramics" and "terracotta" are near each other in its priors,
not because it looked at what is actually on a studio bench. The result is a page about the
*idea* of the subject, which is the same page everyone else generates about that idea.

**Look the subject up before designing it.** If a web search, a document in the repo, or the
user's own brief can tell you what the real artifact looks like — do that first. A researched
fact beats a recalled one every time, and it is the single cheapest quality gain available
here. Where nothing can be looked up, say the fact is inferred rather than presenting it as
observed.

Eight wells to draw from. Two or three yield something for almost any subject; a well that
yields nothing is a well, not a failure:

| Well | The question | Yields |
| --- | --- | --- |
| **Material** | What is the thing physically made of, or made on? | Ground, texture, dark |
| **Notation** | How does this field write itself down? | Type class, a graphic system |
| **Instrument** | What tool does the work? What does its face look like? | Signature, layout |
| **Environment** | Where is this used — light, noise, pressure, hands busy? | Density, contrast, target size |
| **Constraint** | What is the hard limit of the trade — time, heat, tolerance, law? | The argument, the signature |
| **Vernacular** | What words do practitioners use with each other? | Copy, labels, eyebrows |
| **Artifact of the trade** | What piece of paper or object exists only in this field? | The strongest layout devices |
| **Shape of the data** | What does this subject's information actually look like? | Composition, the hero |

Two tests on a candidate fact, before it becomes a provenance line:

- **Would a practitioner recognize it?** A fact that only reads as true to an outsider is a
  cliché with a specific noun in it.
- **Does it have a *shape*?** "Potters use kilns" is a fact and is useless. "A pyrometric cone
  bends over at a known temperature, and you read the firing by how far it bent" has a shape,
  a color, a sequence and a signature in it.

## Gate 2 — Provenance lines

Every one of the four axes gets one line tracing it to a named fact about the subject:

```
COLOR      <palette>  <- <fact about the subject's material world>
TYPE       <faces>    <- <fact>
LAYOUT     <device>   <- <fact>
SIGNATURE  <element>  <- <fact>
```

Then build each axis from its line: the COLOR fact goes into
`${CLAUDE_PLUGIN_ROOT}/scripts/palette.mjs` as a hue, the TYPE fact selects a face class in
`craft.md`, and the LAYOUT fact selects a row of the index in `devices.md`. An axis whose
line never reaches the token file was a sentence, not a decision.

A fact is concrete: the material an instrument is made of, the notation a discipline uses,
the physical artifact of the trade, the constraint of the environment it is used in, the
vernacular of its audience, the shape of its data. "Modern and trustworthy" is not a fact.
"Feels premium" is not a fact. An axis with no fact behind it is a default in disguise.

## Gate 3 — Collision check

Name three existing real designs this direction resembles. If any is in the registry above,
or is the `benchmark` reference itself, revise. If nothing at all comes to mind, the
direction is probably under-specified rather than original — push it further.

## Gate 4 — Three directions, two killed

The rejection record used to be written after the winner existed, which made it a
justification rather than an exploration. A single-candidate process reliably produces the
default, and no amount of refining rescues it — refinement improves a direction, it does not
replace one.

So generate **three whole directions before any tokens**, and kill two on a stated criterion.
Each is four lines, one per axis, and each starts from a **different fact** — three readings
of one fact is one direction with three coats of paint.

```
A  <name>   COLOR <-<fact>  ·  TYPE <-<fact>  ·  LAYOUT <-<fact>  ·  SIGNATURE <-<fact>
B  <name>   ...
C  <name>   ...
KILL B — <the reason, in the brief's terms>
KILL C — <the reason>
```

What makes this worth the tokens rather than theatre:

- **Different wells.** If all three come out of the *material* well, go back to the table
  above; the spread across wells is what makes the three genuinely different.
- **One of them is the obvious one.** Name it, keep it in the running honestly, and if it
  wins, it wins — a direction rejected only for being obvious is a fashion decision.
- **Kill on the brief, not on taste.** "Too safe for a launch page", "the audience reads this
  on a phone in a workshop", "the proof we have does not support that argument". "Less
  interesting" is not a criterion.
- **The three go in the contract**, under `## Directions`, with the two kill lines. That is
  the record; `check-contract.mjs` requires it at `signature` and `benchmark`.

## Gate 5 — Divergence log

If `.unique/log.md` exists, read it before planning. Never repeat a previous entry's
`(palette family, display face, layout device)` triple within the same project.

Append after shipping:

```
## <date> — <surface>
contract: <MODE> / <ORIGINALITY> / <BUDGET>
palette: <family, e.g. desaturated clay + ink>
display: <face>
layout device: <e.g. offset two-column with a bleeding rule>
signature: <one line>
rejected: <one line>
```

Six lines. It costs nothing and it is the only mechanism that makes successive generations
actually diverge instead of converging on a house style.

`node ${CLAUDE_PLUGIN_ROOT}/scripts/check-contract.mjs .unique` enforces gates 2, 4 and 5:
a fact per axis (a mood fails), two rejected directions, and no repeated triple across the
log. Gates 1 and 3 stay judgement — nothing can check a swap test for you — but a run that
skipped every gate used to read exactly like one that ran them all, and that is the failure
mode this closes.

## For `benchmark` specifically

Additional gate: write one line naming what is borrowed and what is invented.

```
BORROWED  <craft invariant> from <reference>
INVENTED  <palette / type / layout / signature>, from <provenance fact>
```

If `INVENTED` is empty, this is a clone, not a benchmark. If `BORROWED` names a color, a
typeface, or a section order, it is the wrong kind of borrowing — replace it with the
principle underneath.

## The risk clause

Taking no risk is itself a risk. `measured` and `loud` briefs require one choice that could
plausibly be argued against — a type size that is too big, a color that is not safe, a
composition that ignores a convention that did not need obeying. Be able to justify it in
one sentence from the provenance line. An indefensible risk is noise; an unrisked design at
`loud` budget is a missed brief.

## Where distinctiveness is not allowed to live

Even at `loud`: not in the focus ring, not in contrast, not in target size, not in the
semantics of a control, not in scroll behavior, not in the cursor, not in the meaning of
standard iconography. Originality operates above the usability floor, never through it.
