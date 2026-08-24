---
description: Pick the best technology for each capability against one shared byte and main-thread budget, with a rejected alternative and a fallback per choice.
argument-hint: "[capability, or blank to route the whole brief]"
---

Use the `stack-route` skill for: $ARGUMENTS

If `.unique/brief.md` exists, route the capabilities it lists. Otherwise route what the
argument names. Write the result to `.unique/stack.md`, including the summed budget ledger.
A choice with no rejected alternative is a reflex, not a decision — record both.
