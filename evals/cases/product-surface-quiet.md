# Case: product surface, quiet

The opposite failure. `originality.md` catches generic output; nothing catches an expressive
answer to a surface where convention is the feature. This case exists because decorating a
work tool is the more common and more expensive mistake.

## Brief

Paste verbatim, nothing added:

> Build the queue screen for our claims team. Each adjuster works a list of open claims —
> claim number, policy holder, type, amount, days open, current owner, status. They filter
> by status and type, sort by days open, open a claim, reassign one to someone else, and
> flag one for review. A busy adjuster has this on screen most of the working day and
> handles maybe two hundred claims a week. Make it good.

## Expected contract

`MODE product-surface` · `ORIGINALITY benchmark(<a dense work tool>)` · `BUDGET quiet`.

"Make it good" is the ambiguity rule's `benchmark` case, not `signature`. A contract that
reads `signature` here has failed at step 1 and everything downstream is wrong regardless of
how it looks.

## Gates

| Gate | Passes when |
| --- | --- |
| Mode routing | Resolves to `product-surface` at `quiet`. Zero loud elements. |
| Table craft | `tabular-nums` on every numeric column. Amounts right-aligned. Longest realistic name and status handled deliberately, not by overflow. |
| Density | A working density with a control, not a spacious marketing table. Two hundred rows a week means the screen is read, not admired. |
| State matrix | Empty, loading (skeleton at the final dimensions), error, one item, many items, long strings, unauthorized. Rendered as real code, not described. |
| Keyboard | The whole flow — filter, sort, open, reassign, flag — operable from the keyboard, focus visible, order matching the visual order. |
| Reassign control | A native `select` or a headless accessible primitive. A hand-rolled `div` dropdown is a blocking defect. |
| Motion | Nothing enters. Nothing ambient. Motion only where it explains a state change — a row moving to its new position after a reassignment. |
| Rubric | Signature scoring high is a **defect** here and is recorded as one. Density and rhythm must score 4+. |

## Known failure modes to watch for

- Entrance animations on data. A staggered fade-up on a claims queue is a daily tax.
- A display face in UI chrome, or a marketing type scale on a work surface.
- Card grid instead of a table, because cards look more designed.
- Colored status pills carrying meaning by hue alone.
- Decorative gradient or texture behind the rows.
- Filters that lose scroll position or focus when applied.
