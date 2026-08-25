---
name: ship-audit
description: Audits a frontend surface against real budgets before it is called done — Core Web Vitals and bundle size, WCAG 2.2 AA, the state matrix, responsive behavior down to 320px and 200% zoom, and the fallbacks the stack record promised. Use before shipping, before a PR, or when asked whether an interface is production-ready.
---

# ship-audit

Last step of the `unique` pipeline, and usable standalone on any frontend. Produces a
findings report, not a pass stamp.

The rule that makes this skill worth running: **a number that was not measured is reported
as "not measured", never estimated as fact.**

## Steps

1. **Load the promises.** `.unique/stack.md` (budgets, fallbacks), `.unique/contract.md`
   (mode, non-negotiables), `.unique/brief.md` (audience, devices, accessibility
   obligation). No artifacts? Audit against the defaults in
   `${CLAUDE_PLUGIN_ROOT}/shared/quality/engineering.md` and say so.

2. **Build.** Must compile clean: no type errors, no console errors, no React key warnings,
   no unhandled rejections. A warning treated as noise here is a bug found in production.

3. **Render and score.** `node ${CLAUDE_PLUGIN_ROOT}/scripts/render.mjs <url> .unique/render`
   — it resolves the browser itself and shoots 390 / 768 / 1440 plus 320 px and 200 % zoom.
   Score the five-axis rubric in `${CLAUDE_PLUGIN_ROOT}/shared/quality/floor.md` against the
   images and report the five numbers. An audit that never looked at the page audited a
   build, not a design. If the script genuinely fails → report `not rendered — <its reason>`
   and `not scored` as findings, the same way any other unrunnable check is reported here.
   Never score from source.

   Then `node ${CLAUDE_PLUGIN_ROOT}/scripts/check-contract.mjs .unique`: a surface whose
   contract has no grid block, no components block, no provenance fact per axis, or no rubric
   scores was not audited against a design decision, because none was recorded. The components
   block is required in every MODE — a contract written before that gate existed fails here
   until the grammar it shipped is written down.

4. **Bundle.** Read the build output. Initial JS per route against the budget. Find what is
   in the initial chunk that should not be — a chart library, an editor, a 3D runtime, a
   date library, a barrel icon import, a namespace import of a large module. Report actual
   KB, not an impression. Commands per stack:
   `${CLAUDE_PLUGIN_ROOT}/shared/quality/measure.md`.

5. **Runtime performance.** Load the page. Identify the LCP element and confirm nothing
   defers it. Check for long tasks on load, layout thrash in scroll or pointer handlers,
   per-frame allocations, and re-render storms. Throttle CPU 4x and look again. On any GPU
   surface: draw calls, DPR clamping, and whether the frame loop keeps running when nothing
   is moving. Lab and field commands: `${CLAUDE_PLUGIN_ROOT}/shared/quality/measure.md`.

6. **Layout stability.** Fonts (metric-matched fallback present?), images (dimensions or
   `aspect-ratio` on every one?), skeletons (same dimensions as their content?), late-
   mounting embeds. CLS is almost never mysterious; it is one of those four.

7. **Accessibility.** The full pass in `${CLAUDE_PLUGIN_ROOT}/shared/quality/floor.md`:
   keyboard-only traversal, focus visibility and order, overlay focus trap and restore,
   contrast including muted text and text over images, labels and error association, target
   size, landmark and heading structure, live regions, reduced motion, 200 % zoom, 320 px
   reflow. Run `axe` if available; automated tools catch roughly a third — the keyboard
   pass catches the rest. `axe` and contrast commands:
   `${CLAUDE_PLUGIN_ROOT}/shared/quality/measure.md`.

8. **State matrix.** Force each state and look at it: empty, loading, error, offline,
   unauthorized, one item, many items, longest realistic string, missing media. A state
   that cannot be forced by hand gets a story, a fixture, or a flag.

9. **Fallbacks.** Every `FALLBACK` the stack record declared, actually exercised: no WebGL,
   reduced motion, slow network, no JS where it matters, permission denied. A declared
   fallback that was never run is not a fallback.

10. **Effect spec.** If `.unique/contract.md` carries an effect spec, audit it as promises,
   not as decoration: the MAPPING is wired to a real quantity rather than tuned constants,
   the INPUT responds within its stated time, the effect is outside the LCP element, every
   DEGRADE path was exercised by hand, and the measured cost is inside the CUT LINE. Over
   the cut line is **blocking** — the spec already decided it gets removed.

11. **Content.** No lorem ipsum, no placeholder logos, no invented metrics or testimonials
   presented as real, no raw exception text shown to a user.

12. **Report.** Findings ordered by severity, each with `file:line` and a concrete fix.
    Separate **blocking** (accessibility failure, budget breach, broken state, missing
    fallback) from **should fix** from **noted**. Include the five rubric numbers from step
    3. State plainly which checks could not run in this environment and why. Then name the
    one thing worth removing.

## Rules

- Report failures. A clean audit that took no measurements is worse than no audit.
- Do not fix while auditing unless asked — findings first, so the user chooses scope.
- Severity is about user impact, not effort to fix.
- Skip nothing silently. An unrunnable check is a reported line, not an omission.
