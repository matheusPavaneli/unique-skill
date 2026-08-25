# The `.unique/` artifacts

Four files in the project root, written by the pipeline and read by every later session.
They exist so that a decision is made once, with its reasoning attached, instead of being
re-derived differently each time a new session opens.

Keep them short. A record nobody reads is worse than no record. Commit them.

```
.unique/
  brief.md      product-brief   what this is and what it needs
  stack.md      stack-route     what it is built with and what it costs
  contract.md   frontend-design what it looks like and why
  log.md        frontend-design what has already been tried, so the next pass diverges
```

---

## `brief.md`

```markdown
# <product name>

SUBJECT   <one concrete sentence: what it is, not the category>
AUDIENCE  <who opens it, how often, on what device, under what pressure>
JOB       <the one thing this product must make easy>

## Surfaces
- <name> · <marketing | product | editorial | auth | admin> · <one line> [FIRST]

## Capabilities
- <capability as a job, not a library> · core | supporting | decorative
- ...

## Constraints
stack: <existing or none>   devices: <...>   browsers: <floor>
a11y: <AA default, or a stated obligation>   seo: <yes/no>
deploy: <target>   deadline: <...>   forbidden: <...>

## Open questions
- <written down rather than guessed twice>
```

## `stack.md`

```markdown
# Stack decisions

BUDGET  initial JS <n> KB gz · LCP <n> s · INP <n> ms · CLS <n> · fonts <n> KB
        (audience: <from brief>)

## <capability>
ROLE      core | supporting | decorative
TIER      <rubric 1-4> / <domain fidelity tier>
CHOICE    <package@major | platform: <api>>
COST      <KB gz> · <main-thread risk> · <complexity>
WHY       <one line, tied to the brief>
REJECTED  <strongest alternative> — <why it lost here>
FALLBACK  <no WebGL | low-power | reduced-motion | offline | no JS>

## Ledger
<capability>  <KB>
...
TOTAL         <KB>  vs budget <KB>   <under | over by n>
```

`REJECTED` and `FALLBACK` are not optional. A choice with no rejected alternative was a
reflex, not a decision.

## `contract.md`

```markdown
# <surface> — design contract

SUBJECT      <what it is, who uses it, the one job of this screen>
MODE         product-surface | marketing | editorial | native | prototype
ORIGINALITY  native | benchmark(<reference>) | signature
BUDGET       quiet | measured | loud
SIGNATURE    <the one thing a person remembers, or "none, this is plumbing">

## Directions        (signature and benchmark only — three, from three different facts)
A  <name>   COLOR <- <fact> · TYPE <- <fact> · LAYOUT <- <fact> · SIGNATURE <- <fact>
B  <name>   ...
C  <name>   ...
KILL <B> — <reason, in the brief's terms>
KILL <C> — <reason>

## Tokens
color    <4-6 named values, in oklch(), from scripts/palette.mjs>
type     display <face> · body <face> · utility <face>
scale    <spacing> · <radius> · <elevation> · <motion durations>

## Grid
PATH     <where the eye lands, then goes — three or four stops>
DENSITY  <which sections are dense, which are near-empty>
COLUMNS  <count and ratio, and whether it holds or alternates>
MEASURE  <max-inline-size in ch, per content role>
RHYTHM   <baseline unit in px, section padding as multiples of it>
BLEED    <exactly which elements break the measure, and above which width>

## Components
RECOGNIZED  <the three to five places this system is recognizable — named>
INTERACTION <the one signature every control shares, and what it does>
CONTROL     <control height in px, the density it sets, and what it applies to>
CORNER      <radius in px per role, and the fact it derives from>
SEPARATION  border | ground | shadow — which one carries structure, and where the others stop
FOCUS       <ring: color token, width, offset, and the ratio it holds against both sides>

## Effect spec         (only if the surface carries 3D, a shader, particles or ambient motion)
IDIOM      <from the spectacle catalog>
PRIMITIVE  <the effect primitive underneath it, or "none — this is T0 composition">
MECHANISM  <the subject's verb sentence being rendered>
JOB        reveal | response | repay
MAPPING    <visual parameter> <- <real quantity>
INPUT      <cursor | scroll | data | input | none> — first meaningful frame in <n> ms
TIER       <T0-T6> · <KB gz> · <main-thread cost>
QUIET      <what gets quieter to pay for it>
DEGRADE    reduced-motion / no-WebGL / low-power / mobile
CUT LINE   <the measurement at which it is removed>

## Provenance          (signature and benchmark only)
COLOR      <palette>   <- <fact about the subject>
TYPE       <faces>     <- <fact>
LAYOUT     <device>    <- <fact>
SIGNATURE  <element>   <- <fact>

## Borrowed / invented  (benchmark only)
BORROWED   <craft invariant> from <reference>
INVENTED   <axis>, from <provenance fact>

## Rubric            (the five numbers from the render pass, scored against the screenshots)
composition: <1-5>
type: <1-5>
color: <1-5>
density: <1-5>
signature: <1-5>

## Rejected
- <direction> — <why>
- <direction> — <why>
```

Validate it with `node ${CLAUDE_PLUGIN_ROOT}/scripts/check-contract.mjs .unique` before
calling the surface done. `## Grid`, `## Components`, `## Rubric` and — at `signature` or
`benchmark` — the provenance and rejected sections are required, because a decision that left
no trace is indistinguishable from one that was never made.

`## Components` is required in every MODE, `native` and `prototype` included: at `native` it
records which existing grammar was inherited, and `prototype` is precisely where an
unrecorded default enters a codebase and never leaves. A key with no value fails, and so does
a block with no numbers in it — `CONTROL`, `CORNER` and `FOCUS` are px and ratios, the same
way the grid block is. `design/components.md`.

## `log.md`

Append-only. Six lines per entry. It is the only mechanism that makes successive
generations diverge instead of converging on a house style.

```markdown
## <date> — <surface>
contract: <MODE> / <ORIGINALITY> / <BUDGET>
palette: <family, e.g. desaturated clay + ink>
display: <face>
layout device: <e.g. offset two-column with a bleeding rule>
signature: <one line>
rejected: <one line>
```

Read it before planning. Never repeat a previous entry's `(palette family, display face,
layout device)` triple within the same project — `check-contract.mjs` fails the run when two
entries share one.
