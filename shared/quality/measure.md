# Measure: the commands behind the numbers

`engineering.md` sets the budgets. This file is how each number is actually produced, so
that "report actuals at verification" is a command rather than an intention.

**The rule this file exists to serve:** a number that was not measured is reported as
`not measured`, never estimated as fact. Every section below ends with what to report when
the tool is not available. Reporting `not measured` is a pass; guessing is not.

Nothing here is a dependency of the plugin. These are `npx` invocations and platform tools
run against the *user's* project, in the user's environment, at audit time.

---

## Screenshots — the render pass

Required by `floor.md` before the rubric can be scored.

```bash
# preferred: the project's own runner, if it has Playwright or Puppeteer
npx playwright screenshot --viewport-size=390,844  --full-page http://localhost:3000 shot-390.png
npx playwright screenshot --viewport-size=768,1024 --full-page http://localhost:3000 shot-768.png
npx playwright screenshot --viewport-size=1440,900 --full-page http://localhost:3000 shot-1440.png
```

First run needs `npx playwright install chromium`. A browser MCP server (Chrome DevTools MCP
or similar) is equivalent and preferable when present, because it can also drive state.

Zoom and reflow are checked in a real browser, not by screenshot: 200 % zoom at 1280 px
wide, and 320 px width.

**Not available:** report `not rendered — no browser tool in this environment` and score the
rubric `not scored`. Never score from source.

---

## Bundle size

Read the build output first; it is free and it is usually enough.

```bash
# Next.js — the route table printed at the end of the build is the number
npx next build

# Vite / Rollup — sizes are printed per chunk, gzip included
npx vite build

# any dist directory, gzipped bytes for one file
gzip -c dist/assets/index-*.js | wc -c
```

To find *what* is in a chunk:

```bash
npx source-map-explorer 'dist/assets/*.js'          # needs source maps in the build
ANALYZE=true npx next build                          # with @next/bundle-analyzer configured
npx vite-bundle-visualizer                           # Vite, no config needed
```

To hold the number in CI:

```bash
npx size-limit                                       # needs a .size-limit.json
```

Report: initial JS per route in KB gzipped, against the budget in `engineering.md`, plus the
largest three modules in the initial chunk.

**Not available:** report the raw byte size of the built assets and say gzip was not
measured. Never convert one to the other by ratio.

---

## Core Web Vitals — lab

```bash
npx lighthouse http://localhost:3000 \
  --only-categories=performance \
  --form-factor=mobile --throttling-method=simulate \
  --output=json --output-path=./lh.json --quiet --chrome-flags="--headless"
```

Read `audits['largest-contentful-paint'].numericValue`,
`audits['cumulative-layout-shift'].numericValue`, `audits['total-blocking-time']`. Lighthouse
reports TBT, not INP — TBT is the lab proxy and is reported as such, never relabelled INP.

Long tasks and layout thrash come from a trace, not from a score: DevTools Performance panel,
or a browser MCP that can capture one. Throttle CPU 4× and look again.

**Not available:** report `LCP / CLS / TBT not measured — no Lighthouse in this environment`
and list what would have been measured. A design-level LCP finding ("the LCP element is a
client-rendered hero") is still reportable from the code and is labelled as an inspection,
not a measurement.

## Core Web Vitals — field

Lab numbers are not the budget; the budget is p75 on real devices. If the project ships
`web-vitals`, the attribution build names the element responsible:

```js
import { onLCP, onINP, onCLS } from 'web-vitals/attribution';
onCLS(m => console.log(m.value, m.attribution.largestShiftTarget));
```

Report field numbers when they exist, and say plainly when the only numbers available are
lab ones.

---

## Accessibility

```bash
npx @axe-core/cli http://localhost:3000 --exit          # exits non-zero on violations
npx pa11y http://localhost:3000                         # alternative, WCAG 2.1 AA by default
```

In a test suite, `@axe-core/playwright` runs the same engine per state, which is the only
way to check the empty, loading and error states.

**Automated tools catch roughly a third of WCAG failures.** The keyboard pass in `floor.md`
is not optional because axe was clean, and an audit that reports only an axe result has
reported a third of an accessibility audit. Say which parts were manual.

**Not available:** the manual pass in `floor.md` still runs — keyboard traversal, focus
order and visibility, overlay trap and restore, contrast, labels, target size, reflow. Report
`axe not run` alongside the manual findings.

---

## Contrast

Every text pair, boundary pair and the focus ring, against the ratios in `../design/craft.md`.
The plugin ships a dependency-free checker for a token pair list:

```bash
node scripts/contrast.mjs tokens.json
```

`tokens.json` is a list of `{ name, fg, bg, size }` entries; `fg` and `bg` accept hex or
`oklch()`. `size` is `body` (4.5:1), `large` (3:1) or `ui` (3:1 for boundaries and graphical
objects). The command exits non-zero and names every failing pair.

This checks the tokens, not the rendered page. Text over an image or a gradient is checked
at its *worst* pixel in the screenshot, by hand.

---

## Layout stability

CLS is almost never mysterious. Check the four causes directly:

```bash
grep -rn "<img" src | grep -v -E "width=|aspect-ratio|fill"   # images without dimensions
grep -rn "size-adjust\|ascent-override" src                    # metric-matched fallback present?
```

Then confirm in the browser: late-mounting embeds, skeletons whose dimensions differ from
their content, and fonts swapping without a matched fallback. `engineering.md` has the
`@font-face` block that takes CLS from 0.14 to 0.00.

---

## Fonts

```bash
ls -la public/fonts/                                    # total bytes against the 100 KB budget
npx glyphhanger --subset=path/to/font.ttf --formats=woff2   # subsetting, if not already done
pyftsubset font.ttf --unicodes=U+0000-00FF --flavor=woff2    # fonttools, more control
```

Report total font bytes, the number of families, whether the LCP face is preloaded, and
whether a metric-matched fallback exists. Four numbers, all cheap.

---

## Reporting

Every measurement lands in the audit as: **what was measured, with what command, and the
number**. Every non-measurement lands as: **what could not be measured, and why**.

```
LCP        1.6 s      lighthouse, mobile simulate, localhost
INP        not measured — no field data; TBT 210 ms in lab
CLS        0.00       lighthouse
Initial JS 88 KB gz   next build route table, /
axe        0 violations on the default state; empty and error states not run
Contrast   2 failures — scripts/contrast.mjs, see findings
Rubric     4 / 3 / 4 / 3 / 2   (composition / type / color / density / signature)
```

Localhost numbers are not production numbers. Say `localhost` next to them.
