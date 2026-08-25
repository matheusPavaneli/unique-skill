---
name: build-surface
description: Implements a surface against the design contract and the stack record — component structure, state, data, accessibility, states, and the capability integrations (3D scenes, editors, charts, realtime) picked by stack-route. Use when the contract and stack exist and code needs writing, or when integrating a heavy capability into an existing UI.
---

# build-surface

Fourth step of the `unique` pipeline. Turns `.unique/contract.md` + `.unique/stack.md` into
working code. Where `frontend-design` owns the look, this owns the wiring.

## Steps

1. **Load the decisions.** `.unique/contract.md`, `.unique/stack.md`, `.unique/brief.md`.
   Missing contract → run `frontend-design` first. Missing stack record but the surface
   needs a real capability → run `stack-route` first. Do not silently invent either.

2. **Read the codebase before adding to it.** Existing tokens, component library, data
   layer, routing, naming. Match them. A second way of doing something already done here
   is a defect regardless of which way is better.

3. **Structure before style.** Write the semantic markup and the state machine first, in
   plain elements, and confirm it reads correctly with no CSS. Landmarks, headings, labels,
   button-vs-link, form structure. Styling a wrong structure is rework; styling over a
   wrong structure is a permanent accessibility bug.

4. **States before the happy path is finished.** Every asynchronous or data-driven part
   gets loading, empty, and error rendered as real code, not as a TODO. Full matrix in
   `${CLAUDE_PLUGIN_ROOT}/shared/quality/floor.md`. Skeletons match the final layout's
   dimensions or they trade a spinner for layout shift.

5. **Tokens, then the component grammar, then composition.** Every value from the contract's
   token set. No inline hex, no magic spacing, no one-off duration.

   The contract's `## Components` block is the acceptance test for the controls, the way the
   effect spec is for an effect: `CONTROL` sets one control height and every control is sized
   from it, `CORNER` sets the radius per role, `SEPARATION` names the one strategy that
   carries structure — the other two appear only where that line says they do — `FOCUS` is
   the single ring on every focusable thing, and `INTERACTION` is the one answer to a pointer,
   applied identically. Distinctiveness lives in the three to five components `RECOGNIZED`
   names and nowhere else. Pouring a derived token set into default control shapes produces a
   tinted default, which is the failure the block exists to prevent —
   `${CLAUDE_PLUGIN_ROOT}/shared/design/components.md`.

6. **Integrate capabilities behind a boundary.** Anything heavy — a 3D canvas, an editor,
   a chart library, a map, a video player — is:
   - dynamically imported, never in the initial bundle;
   - mounted lazily (below-the-fold, on interaction, or on `IntersectionObserver`);
   - wrapped in an error boundary with the `FALLBACK` the stack record declared;
   - given a static placeholder of the exact final dimensions so it cannot shift layout;
   - disposed on unmount — GPU resources, listeners, workers, observers, sockets.

   For a visual effect, the contract's effect spec (`shared/design/spectacle.md`) is the
   acceptance test: the MAPPING is wired to the real quantity, the INPUT responds within the
   stated time, every DEGRADE path exists as code, and the CUT LINE is measured — an effect
   over its cut line is removed in this step, not carried to the audit.

   Domain-specific rules live in the `shared/stacks/` file that chose it. Read it again at
   integration time; choosing a library and using it correctly are different problems, and
   the performance rules in those files are where most of the value is.

7. **Motion last.** Added to a structure that already works. Compositor properties only.
   Reduced motion honored. `shared/design/craft.md`.

8. **Copy as you go**, not as a pass at the end — `shared/design/copy.md`. No lorem ipsum,
   no invented metrics, testimonials, customers, or logos.

9. **Run it.** Build, load the page, click the thing. Code that has not been executed is a
   draft. Report what actually happened, including failures.

10. **Hand to `ship-audit`.** Do not self-certify quality here.

## Rules

- Stay inside the scope asked. Adjacent code that is ugly but working is not this task.
- No floating promises; `void fn().catch(...)` when fire-and-forget is intended. Preserve
  `cause` on rethrow. Never swallow an error into a silent empty state.
- `strict` TypeScript with `noUncheckedIndexedAccess`. No `any`, no non-null assertion in
  source. Discriminated unions over boolean-plus-string; illegal states unrepresentable.
- Every bug fixed during the build lands with a regression test.
- Server/client boundary as low in the tree as possible; one interactive leaf must not drag
  its page into the client bundle.
- If a decision in the stack record turns out to be wrong once the code exists, say so and
  update the record. Silently substituting a different library is how the record rots.
