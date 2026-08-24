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

## Tokens
color    <4-6 named values>
type     display <face> · body <face> · utility <face>
scale    <spacing> · <radius> · <elevation> · <motion durations>

## Provenance          (signature and benchmark only)
COLOR      <palette>   <- <fact about the subject>
TYPE       <faces>     <- <fact>
LAYOUT     <device>    <- <fact>
SIGNATURE  <element>   <- <fact>

## Borrowed / invented  (benchmark only)
BORROWED   <craft invariant> from <reference>
INVENTED   <axis>, from <provenance fact>

## Rejected
- <direction> — <why>
```

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
layout device)` triple within the same project.
