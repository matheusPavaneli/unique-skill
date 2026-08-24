# Engineering: budgets, loading, stack

The cost ledger. Every expressive choice in `../design/craft.md` is paid for here. A design that
misses these numbers is not production-grade, whatever it looks like in a screenshot.

## Budgets (p75, mid-tier mobile on 4G)

| Metric | Target | Fails at |
| --- | --- | --- |
| LCP | ≤ 2.0 s | > 2.5 s |
| INP | ≤ 150 ms | > 200 ms |
| CLS | ≤ 0.05 | > 0.1 |
| Initial JS, marketing | ≤ 100 KB gz | > 170 KB |
| Initial JS, app shell | ≤ 200 KB gz | > 300 KB |
| Fonts, total | ≤ 100 KB | > 150 KB, or > 2 families |
| Hero image | ≤ 150 KB | > 300 KB |
| Main-thread long tasks on load | 0 over 200 ms | any over 300 ms |

Announce the budget in the plan; report actuals at verification. The command that produces
each of these numbers — and what to report when the tool is not installed — is in
`measure.md`.

## Fonts — where distinctive type usually goes wrong

The skill asks for characterful faces. Characterful faces cost bytes and cause layout shift
unless loaded correctly. Both things are true; the loading is the price of the choice.

1. **Self-host.** No third-party font CDN: an extra connection on the critical path, plus a
   privacy and availability dependency.
2. **`woff2` only.** Subset to the glyphs actually used (`pyftsubset`, or `unicode-range`
   splits). A subset display face is often 15–25 KB instead of 200 KB.
3. **Preload the LCP face only**, and only the one weight the hero uses:
   `<link rel="preload" as="font" type="font/woff2" crossorigin href="...">`. Preloading
   everything is the same as preloading nothing.
4. **`font-display: swap`** for body, `optional` for decorative faces where a fallback is
   acceptable. `block` is a blank hero.
5. **Kill the swap shift** with a metric-matched fallback:
   ```css
   @font-face {
     font-family: "Display Fallback"; src: local("Georgia");
     size-adjust: 104%; ascent-override: 90%; descent-override: 22%; line-gap-override: 0%;
   }
   ```
   Then `font-family: "Display", "Display Fallback", serif`. This is the difference between
   CLS 0.14 and CLS 0.00 and it is skipped almost every time.
6. **Variable font** if more than two weights are used. One file beats four.
7. Framework: `next/font/local` does subsetting, self-hosting, and fallback metrics
   automatically — use it on Next.js rather than hand-rolling the above.

## Images and media

- Always `width`+`height` or `aspect-ratio`. No exceptions. This is most CLS.
- AVIF with WebP fallback. `<picture>` with `srcset`/`sizes` for anything that changes size.
- LCP image: `loading="eager"`, `fetchpriority="high"`, no lazy attribute, not inside a
  client-rendered component that mounts late. Everything below the fold `loading="lazy"`
  and `decoding="async"`.
- Never a CSS `background-image` for the LCP element — it is discovered late.
- Video: `preload="metadata"`, `poster` always, `muted playsinline` for autoplay, and
  autoplay only when `prefers-reduced-motion` is not `reduce`.
- Icons inline as SVG (no request, styleable via `currentColor`); sprites for large sets.

## JavaScript

- Ship less. A CSS solution that works is better than a JS one that is nicer to write:
  `:has()`, `popover`, `<dialog>`, `<details>`, CSS scroll-driven animations, anchor
  positioning where support allows.
- Code-split at the route, then at heavy leaves (charts, editors, maps, date pickers).
  `import()` on interaction or on viewport, not at module top level.
- No runtime CSS-in-JS in new work — it costs bundle plus per-render serialization.
  Use CSS Modules, Tailwind, vanilla-extract, or plain custom properties.
- Third-party scripts are the usual INP villain. Defer, or load post-interaction. Every
  analytics/chat/heatmap tag needs a justification.
- Event handlers on scroll or pointer move: passive listeners, `requestAnimationFrame`,
  and never read layout (`offsetHeight`, `getBoundingClientRect`) inside them without
  batching — that is layout thrash.
- Prefer `IntersectionObserver` over scroll handlers, `ResizeObserver` over resize handlers,
  and CSS scroll-driven animation over both.

## Rendering strategy

- Static by default. Server-render what needs data. Client-render only what needs
  interactivity or browser APIs.
- React: keep the `"use client"` boundary as low in the tree as possible — one interactive
  leaf should not drag its page into the client bundle. Pass server-rendered children into
  client shells rather than importing them under the boundary.
- Streaming with meaningful suspense boundaries beats a single full-page spinner. Skeletons
  must match the final layout's dimensions or they trade a spinner for CLS.
- Data: colocate fetching, avoid client waterfalls, parallelize independent requests.
- Optimistic updates need a rollback path and an error surface. An optimistic update that
  silently reverts is a bug.

## Stack notes

- **Tailwind v4**: tokens live in `@theme`; that is the token file. Do not maintain a
  parallel CSS custom property set. Long class strings are fine; extract to a component,
  not to `@apply` soup.
- **shadcn/ui**: a starting point that must be re-tokenized — radius, ramp, type, spacing,
  and the component internals. Shipping the default theme is the most recognizable AI look
  in circulation (see `../design/originality.md`).
- **Headless primitives** (Radix, Ark, React Aria, Base UI) for dialog, menu, combobox,
  tabs, tooltip, popover, select. Hand-rolled versions fail focus management, escape
  handling, typeahead, and screen reader semantics. This is not a preference.
- **Motion (Framer Motion)** for React orchestration; CSS for everything simple. Import it
  lazily if it is only used below the fold.
- **Charts**: pick by bundle size. A hand-drawn SVG or CSS chart beats a 200 KB library for
  three sparklines.

## Verifying, not assuming

Run the build. Read the bundle report. Load the page. Numbers reported without measurement
are fabrications — say "not measured" instead.
