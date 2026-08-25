---
description: Run the full unique pipeline on a product idea — brief, stack routing, design contract, build, audit.
argument-hint: "[product idea, surface, or 'audit']"
---

Run the `unique` pipeline for: $ARGUMENTS

Resolve where to start from what already exists in the project, and say which step you are
entering and why:

- No `.unique/brief.md`, and the request is an idea rather than a screen → **product-brief**.
- Brief exists but `.unique/stack.md` does not, or the request names a capability that needs
  a technical decision (3D, particles, charts, editor, realtime, AI UI, large tables) →
  **stack-route**.
- Stack settled, no `.unique/contract.md` for this surface → **frontend-design**.
- Contract and stack exist, code needs writing → **build-surface**.
- The request is "is this ready", "audit", "review before shipping", or code already exists
  → **ship-audit**.

Run the steps in order from there, carrying each artifact forward. Do not skip a step
silently; if one is skipped, say which and why in one line.

## The canonical flow

Every surface this plugin touches comes out of this flow and carries its artifacts. That is
the whole claim, and it only holds if each step leaves something behind: a decision that
left no trace is indistinguishable from one that was never made, which is the rule the rest
of the plugin is built on. Applied to the pipeline itself, it means **the artifact is the
step** — a step whose file does not exist did not run, whatever the transcript says.

| Step | Runs when | Leaves | Gate before the next step |
| --- | --- | --- | --- |
| 1 · `product-brief` | The request is an idea, not a screen | `.unique/brief.md` | Subject, audience, surfaces and the capability list are written |
| 2 · `stack-route` | A capability needs a technical decision | `.unique/stack.md` | Every capability has a choice, a rejected alternative, a fallback, and a byte cost inside one shared budget |
| 3 · `frontend-design` | A surface needs a look | `.unique/contract.md` | The five contract lines, the grid block in numbers, the components block, and — at `signature` or `benchmark` — a provenance fact per axis and two killed directions |
| 4 · `build-surface` | The contract exists and code has to be written | The code | Semantics and states before the happy path; every value from a token; heavy capabilities behind a lazy boundary |
| 5 · `ship-audit` | Anything is about to be called done | The audit report and the scored rubric in `contract.md` | Seven rubric numbers and a total against the *rendered page*, plus the budgets and the floor in `quality/floor.md` |
| 6 · record | The surface ships | The `.unique/log.md` entry | The `(palette, display face, layout device)` triple is not a repeat |

Then, before saying done:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/check-contract.mjs" .unique
```

Three properties this flow is meant to have, and each one fails quietly if it is not held:

- **One door.** Entering at step 3 with no brief is legitimate — the user supplied the
  subject — but entering at step 3 *because the brief was tedious* is how a surface ends up
  designed for a subject nobody wrote down. Say which step you entered and what supplied the
  input the earlier step would have.
- **The gate runs before the next step, not after the build.** Rework at step 3 is a
  paragraph. The same rework discovered at step 5 is the surface.
- **The log is the only thing that makes successive surfaces diverge.** A surface that ships
  without its entry is invisible to the next run, which will then repeat it.

## The short path

Not every change reopens the pipeline. A short path exists, and it is bounded — it is a
**re-entry into an existing contract**, never an exit from the pipeline. It is available
only when *all* of these hold:

1. `.unique/contract.md` already exists **for this surface**.
2. The change alters no token, no line of the grid block, no line of the components block,
   and not the signature.
3. It introduces no capability from `stack-route`'s list — no 3D, particles, charts, editor,
   realtime, AI UI or large table.
4. It is one surface, and the diff stays inside components that already exist.

Then: make the change, hold it to the non-negotiables in the `frontend-design` skill, re-run
`check-contract.mjs`, and say in one line which of the four conditions made it eligible.

If **any** condition fails, the short path is not available, and the entry point is the step
that owns the missing artifact: a new token or a changed grid is step 3, a new capability is
step 2, a surface with no contract is step 3 regardless of how small the change looks.

"It's a small change" is not one of the four conditions. Small is what the diff looks like
afterwards; the conditions are about what the change *touches*, which is knowable before it
is made.
