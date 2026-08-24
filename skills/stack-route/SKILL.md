---
name: stack-route
description: Picks the best technology for each capability a product needs — 3D and particles, data visualization, maps, rich text and canvas editors, media, tables at scale, realtime and collaboration, AI streaming UI, forms, state, framework and styling — against a shared byte and main-thread budget, with a platform-primitive-first gate and a required fallback for every choice. Use when deciding what to build a feature with, when a brief names a capability like "3D particle hero" or "collaborative editor", or when auditing an existing stack.
---

# stack-route

Second step of the `unique` pipeline. Output is `.unique/stack.md`: a decision record, one
entry per capability, with costs summed against one budget.

The failure this skill exists to prevent is not picking a bad library. It is picking six
individually reasonable libraries that together ship 900 KB and a 400 ms INP.

## Steps

1. **Load the capability list.** From `.unique/brief.md`. No brief? Extract the
   capabilities from the request in one pass and say you are working without one.

2. **Read the existing stack, if any.** `package.json`, lockfile, framework config,
   `.unique/stack.md`. An installed library that already covers a capability wins by
   default; replacing it needs a stated reason stronger than preference. Two libraries
   doing the same job is a defect to report, not a choice to make.

3. **Set the budget before choosing anything.** From `${CLAUDE_PLUGIN_ROOT}/shared/quality/engineering.md`,
   adjusted for the brief's audience and devices. Write the numbers into the record first;
   choosing first and rationalizing the total afterwards is how the 900 KB happens.

4. **Route each capability.** Read only the reference file the capability needs:

   | Capability | File |
   | --- | --- |
   | Framework, rendering, styling, components, state, data, forms, routing | `shared/stacks/core.md` |
   | 3D, particles, shaders, generative graphics, motion, scroll, physics | `shared/stacks/3d-and-motion.md` (+ `shared/design/spectacle.md` first, to confirm the effect is earned and to fix its fidelity tier) |
   | Charts, dashboards, large datasets, maps, graphs, tables at scale | `shared/stacks/dataviz-and-maps.md` |
   | Rich text, code, whiteboard, canvas, image, video, audio, PDF | `shared/stacks/editors-and-media.md` |
   | Websockets, collaboration, presence, AI streaming UI, agents | `shared/stacks/realtime-and-ai.md` |
   | Deploy, auth, database, i18n, offline, analytics, testing | `shared/stacks/platform.md` |

   Paths are relative to `${CLAUDE_PLUGIN_ROOT}`.

5. **Apply the rubric, in this order.** Stop at the first tier that genuinely satisfies the
   requirement — not the first that could be argued into satisfying it.

   1. **Platform primitive.** Can CSS, SVG, Canvas 2D, the native element, a Web API, or
      the framework's own capability do this? `<dialog>`, `popover`, `:has()`, CSS
      scroll-driven animations, View Transitions, `IntersectionObserver`, Web Audio,
      `Intl`, native form validation, container queries. Zero bytes, zero maintenance,
      no upgrade treadmill. Rejecting this tier requires a named missing feature.
   2. **Small focused library** that does one thing well.
   3. **Full framework for the domain** — earned only by a `core` capability, or by three
      or more supporting needs it covers at once.
   4. **Hosted service / designer runtime** — earned when authoring speed by non-engineers
      is the actual constraint. Price the runtime bytes and the vendor lock explicitly.

6. **Gate the visual effects.** Before routing any 3D, shader, particle or ambient-motion
   capability, run the gates in `shared/design/spectacle.md`. An effect that carries no
   reveal, response or repay is cut here — not budgeted, not downgraded. An effect labelled
   `decorative` whose idea only exists at T4/T5 is a mislabelled `core`: relabel it or drop
   it, never quietly pay for it.

7. **Match fidelity to role.** `core` capabilities get best-in-class and pay real bytes.
   `supporting` gets the cheapest thing that is solid. `decorative` gets a platform
   primitive or is cut. A decorative capability that costs more than a supporting one is
   inverted — fix it or drop it. Reference files carry a fidelity ladder per domain; name
   the tier, do not skip to the top of the ladder because it is more interesting.

8. **Write one entry per capability.**

   ```
   CAPABILITY  <the job, in the brief's words>
   ROLE        core | supporting | decorative
   TIER        <rubric tier 1-4> / <domain fidelity tier, if the ladder has one>
   CHOICE      <package@major, or "platform: <api>">
   COST        <KB gz added> · <main-thread risk> · <build/maintenance complexity>
   WHY         <one line, tied to a line of the brief>
   REJECTED    <the strongest alternative> — <why it lost, in this brief>
   FALLBACK    <no WebGL / low-power / reduced-motion / offline / JS disabled>
   ```

   `REJECTED` is mandatory and must name a real contender. A choice with no rejected
   alternative was not a decision, it was a reflex — and reflexes are how every project
   ends up on the same five libraries.

   `FALLBACK` is mandatory for anything touching GPU, media, network, or motion. "It
   breaks" is an answer only if the brief accepts it.

9. **Sum the ledger.** Total added KB against the budget from step 3. Over budget, cut in
   this order: decorative, then supporting, then downgrade a core capability's fidelity
   tier — never the accessibility floor, never the fallbacks. Report the total either way,
   including when it fits.

10. **Verify before pinning versions.** Package versions in the reference files age. Check
   the registry or docs for anything being installed for the first time, and note anything
   that has moved. Never invent a version number; if unchecked, say `latest, unverified`.

11. **Write `.unique/stack.md`** and state what to run next: `frontend-design` for the
    visual contract, or `build-surface` if the contract already exists.

## Rules

- Every dependency is justified in the record or it does not get installed. The record is
  the justification — no separate explaining.
- No library named because it is popular. Popularity is a tiebreaker between two choices
  that already fit, never a reason.
- One library per job across the whole project. Two chart libraries is a bug.
- Node 24+, ESM only, no CJS. Prefer built-ins to dependencies. `zod` at untrusted borders.
- Anything that cannot be measured is reported as unmeasured, not estimated as fact.
