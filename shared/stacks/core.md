# Core: framework, styling, components, state, data, forms

Read for the foundational choices every project makes once. These decisions are expensive to
reverse, so they get the most scrutiny and the least novelty.

An existing choice in the repo wins by default. Migrating a framework, styling system, or
state library is a project, not a step — never propose one as part of building a feature.

---

## Framework and rendering

| Situation | Choice | Why |
| --- | --- | --- |
| Product with marketing, SEO, auth, and server data | **Next.js App Router** | Server components, streaming, image and font primitives, one deploy story |
| Application behind a login, no SEO need | **Vite + React Router** (or **TanStack Router** for typed routes) | No server framework tax; fastest dev loop; a SPA is the correct shape for an app shell |
| Content-heavy site, mostly static, sprinkles of interactivity | **Astro** with islands | Ships near-zero JS by default; the right answer for docs, blogs, and most marketing sites, and routinely passed over for Next out of habit |
| Team is Vue or Svelte | **Nuxt** / **SvelteKit** | Team fluency beats any argument in this table |
| Static docs | **Astro Starlight** or the docs framework the repo already has | Do not build a docs site by hand |

Rendering: static by default, server-rendered when it needs request data, client-rendered
only for interactivity or browser APIs. Keep the `"use client"` boundary as low in the tree
as possible — one interactive leaf must not drag its page into the client bundle. Pass
server-rendered children into client shells instead of importing them under the boundary.

Streaming with meaningful Suspense boundaries beats one full-page spinner. Skeletons must
match final dimensions.

## Styling

| Choice | When |
| --- | --- |
| **Tailwind v4** | Default. Tokens live in `@theme` — that *is* the token file, do not maintain a parallel custom-property set. Extract repetition into components, not into `@apply` |
| **CSS Modules** + custom properties | Bespoke design system meant to live for years; when the CSS is itself part of the craft and the team writes real CSS |
| **vanilla-extract** | Typed tokens with zero runtime, in a TypeScript-heavy codebase |
| Plain CSS with custom properties and `@layer` | Small surfaces, embeds, and anything that must not carry a build step |

No runtime CSS-in-JS in new work: bundle cost plus per-render serialization, and it fights
server components. Modern CSS removes most of the reasons it existed — nesting, `:has()`,
custom properties, container queries, `@layer`, `color-mix()`.

## Component base

| Choice | When |
| --- | --- |
| **Headless primitives** — Radix, Base UI, React Aria, Ark | Default for any bespoke design system. They own focus management, keyboard behavior, typeahead, collision detection, and ARIA; you own every pixel |
| **shadcn/ui** | A scaffold to own and re-tokenize — radius, ramp, type, spacing, and component internals. Shipping the default theme is the single most recognizable AI look in circulation |
| **Mantine** / **MUI** | Internal tools and admin panels where speed beats identity and brand is not a differentiator. Accept that the product will look like the library |
| Hand-rolled overlay, menu, combobox, or dialog | Effectively never. This is where accessibility fails hardest and least visibly |

## State

| Kind of state | Choice |
| --- | --- |
| Server data (fetch, cache, revalidate, mutate) | **TanStack Query**, or the framework's own loader/action layer |
| Small global client state | **Zustand** |
| Fine-grained derived atoms | **Jotai** |
| Large app, big team, strict conventions | **Redux Toolkit** — only when the discipline is the point |
| Genuinely stateful flows: wizards, players, editors, uploads | **XState** — when "which state are we in" has more than four answers |
| URL-shaped state: filters, tabs, pagination | The URL. `nuqs` or the router's own search params |

Most "we need global state" is server state in disguise. Solve it with a query cache before
reaching for a store. React's own `useState` plus context handles more than people expect;
context is a delivery mechanism, not a state manager, and re-renders accordingly.

## Data layer

- Fetch on the server where the framework allows it. Colocate. Parallelize independent
  requests; a client waterfall is the most common cause of a slow-feeling app.
- Validate at untrusted borders with **zod** — API responses, form input, URL params, env.
- Optimistic updates need a rollback path and a visible error surface. One that silently
  reverts is a bug.
- Bound external payloads: size, depth, and regex complexity. Timeout every outbound call
  with `AbortSignal.timeout()`.

## Forms

| Choice | When |
| --- | --- |
| **React Hook Form** + `@hookform/resolvers` + zod | Default for anything with more than three fields or real validation |
| Native form + server action | Simple server-rendered forms; less JS, works before hydration |
| **TanStack Form** | Framework-agnostic and type-first; worth it in a codebase already on TanStack |

Validate on blur and on submit, never on every keystroke before first blur. Errors are
text, linked with `aria-describedby`, and announced. Persistent visible labels — a
placeholder is not a label. Set `autocomplete` tokens and `inputmode`. Full requirements in
`../quality/floor.md`.

## Icons, dates, utilities

- Icons: **Lucide** or **Phosphor**, imported per icon — never a barrel import, which pulls
  the whole set into the bundle. One set, one stroke weight.
- Dates: `Intl.DateTimeFormat` and `Temporal` where available; **date-fns** per-function if
  needed. Never `moment`. Never a whole library for one `format` call.
- IDs: `crypto.randomUUID()`. Clone: `structuredClone()`. Neither needs a dependency.
- Class merging: `clsx` plus `tailwind-merge` on Tailwind. That is the whole utility layer.

## Testing and CI gates

- **Vitest** + Testing Library for units and components. Test behavior, not implementation.
- **Playwright** for end-to-end and visual regression on the surfaces that matter.
- **axe-core** in CI on key routes — automated checks catch roughly a third of
  accessibility defects and cost nothing per run.
- Bundle-size budget enforced in CI, not observed in a review.
- Lint, format, and typecheck belong in hooks and CI, not in prompts.
- Every bug fix lands with its regression test. Pure logic tests always run;
  infrastructure-dependent tests are gated on env and run in CI.
