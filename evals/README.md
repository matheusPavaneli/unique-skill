# Evals

A manual harness, deliberately. There is no runner, no CI job and no scoring service here —
this is a `prototype`-stage plugin with one author, and infrastructure that outlives the
experiment costs more than it returns. What is here is a fixed set of briefs and the sheet
they are scored on, so that two runs months apart are comparable.

## The metric

> **Redesign rate** — of surfaces built at `MODE=marketing` and `ORIGINALITY=signature`, the
> share where the author asks for a visual redo after the first delivery. Target: under 1 in 3.

Everything else recorded below is diagnosis. The redesign judgement is the result.

## Running a case

1. Fresh session, `/clear`. Context bleed between cases invalidates the comparison — a
   second case in the same session inherits the first one's palette instincts.
2. Paste the case's **Brief** verbatim. Nothing else. No clarifications, no nudges, no
   "make it more interesting" — the point is what the plugin produces unassisted.
3. Let it run to the end, including the render pass.
4. Score the five axes from `shared/quality/floor.md` against the *screenshots*, not the code.
5. Record the gate results listed in the case.
6. **Keep the artifacts.** A score with no image behind it cannot be re-read later, and a
   verdict months apart is only comparable if the evidence is:

   ```
   evals/runs/<date>-<commit>-<case>/
     390.png  768.png  1440.png  320.png  1440-zoom200.png   from scripts/render.mjs
     contract.md                                             the .unique/contract.md as delivered
     sheet.md                                                the filled sheet below
   ```

   These are the regression suite. The comparison that matters is not this run against the
   rubric — it is this run's screenshots against the previous run's, for the same brief. Two
   runs that score 4/4/4/3/4 and look like the same page have not diverged, and the numbers
   will not tell you that. The images will.
7. Answer one question: **would I ask for a redo before shipping this?**

To measure a *before* state, run the cases against an older commit:

```bash
git worktree add ../unique-baseline <commit>
```

Point the plugin at that copy, run the cases, then `git worktree remove ../unique-baseline`.

## The sheet

| Field | |
| --- | --- |
| Case | |
| Plugin commit | |
| Date | |
| Composition / Type / Color / Density / Signature | _ / _ / _ / _ / _ |
| Gates | pass / fail per gate listed in the case |
| Rendered? | yes / `not rendered — <reason the script printed>` |
| Contract check | `check-contract.mjs` output: clean / n failures |
| Diverged from the previous run? | yes / no — decided by looking at both sets of screenshots |
| Measured? | which numbers came from a command, which are `not measured` |
| **Redo?** | **yes / no** |
| One-line reason | |

Scoring 3 across the board is the template result. It is the most common outcome and it is
a fail, not a midpoint.

## What these cases cannot tell you

- **Three cases is too few** to separate an effect from run-to-run variance. Treat 3/3 → 0/3
  as signal and anything narrower as noise.
- **The author scores their own plugin.** That is a real bias and there is no correction for
  it here beyond writing the score down before deciding the verdict.
- **A model cannot score its own output** on these axes. The rubric is scored by a person
  looking at images, or it is not scored.
- **`check-contract.mjs` is not a quality signal.** It checks that the decisions were made
  and recorded, not that they were good. A clean run with a boring page is entirely possible
  and is exactly what the rubric is for.

## Cases

| Case | Contract under test | Guards |
| --- | --- | --- |
| `cases/landing-signature.md` | `marketing` / `signature` / `measured` | The case the metric is defined on: originality gates, landing argument, first-screen test |
| `cases/product-surface-quiet.md` | `product-surface` / `native`-ish / `quiet` | The opposite failure — decoration where convention is the feature |
| `cases/effect-earned.md` | `marketing` / `signature` / `loud` | `spectacle.md` gates A–D and the fidelity ladder, against a brief that asks for the expensive answer |

`cases/tokens.sample.json` is not a case. It is the fixture `scripts/contrast.mjs` is
verified against.
