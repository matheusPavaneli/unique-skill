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

**Structural defaults, equally banned unaudited:** hero → logo strip → three feature cards
with icons → alternating image/text → testimonial → pricing table → dark CTA band → fat
footer. That order is fine when the content demands it; it is a template when the content
was fitted to it.

## Gate 1 — The swap test

Take the token set and the layout concept. Ask: would this work unchanged for a different
company in a different industry?

- Yes → it is not derived from this brief. Revise the failing axis.
- No, because of `<specific reason>` → passes.

Run it per axis (color, type, layout, signature), not once for the whole design. Most
failures are one axis riding along generically inside three good ones.

## Gate 2 — Provenance lines

Every one of the four axes gets one line tracing it to a named fact about the subject:

```
COLOR      <palette>  <- <fact about the subject's material world>
TYPE       <faces>    <- <fact>
LAYOUT     <device>   <- <fact>
SIGNATURE  <element>  <- <fact>
```

A fact is concrete: the material an instrument is made of, the notation a discipline uses,
the physical artifact of the trade, the constraint of the environment it is used in, the
vernacular of its audience, the shape of its data. "Modern and trustworthy" is not a fact.
"Feels premium" is not a fact. An axis with no fact behind it is a default in disguise.

## Gate 3 — Collision check

Name three existing real designs this direction resembles. If any is in the registry above,
or is the `benchmark` reference itself, revise. If nothing at all comes to mind, the
direction is probably under-specified rather than original — push it further.

## Gate 4 — Rejection record

Name two directions explored and killed, with the reason. Exploration breadth is not
verifiable from the winner alone; a single-candidate process reliably produces the default.
Do this in thinking; surface one line of it in the plan.

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
