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

If the request is a small, well-specified change to an existing surface, do not open the
pipeline. Make the change, hold it to the non-negotiables in the `frontend-design` skill,
and say that the pipeline was not needed.
