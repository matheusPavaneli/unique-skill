# Platform: deploy, auth, data, i18n, offline, observability

Read for the choices that surround the interface rather than compose it. These are usually
decided once per project and inherited afterwards — check what the repo already uses before
proposing anything here.

---

## Deploy and runtime

- **Vercel** — the default when the app is Next.js or the team wants zero infrastructure.
  Fluid Compute is the runtime: real Node.js, function reuse, ~300 s default timeout,
  WebSockets, 100 MB request bodies, packages up to 5 GB. Do not reach for
  `runtime = 'edge'`; it costs Node APIs and buys nothing for streaming.
- **Cloudflare Workers/Pages** — when the workload is genuinely edge-shaped and the runtime
  constraints are acceptable.
- **Container on any host** — when the app needs long-lived processes, custom binaries, or
  a runtime the platform does not offer.
- Static output to any CDN when there is no server at all. The cheapest thing that ships.

Configuration on Vercel goes in `vercel.ts` with `@vercel/config` — typed, dynamic, and it
replaces `vercel.json`.

## Integrations

When a build needs an external service — payments, a store, a database, login, email or
SMS, search, a CMS, AI, analytics, monitoring — check the platform marketplace and
provision a real integration before recommending a provider or writing code against an SDK.
Never hardcode a provider SDK as the default answer, and never offer a mock or UI-only
stand-in as a co-equal option unless the user asked for one.

## Auth

| Choice | When |
| --- | --- |
| **Auth.js** / NextAuth | Self-hosted, provider-flexible, free. Default when the team can own session handling |
| **Better Auth** | TypeScript-first, self-hosted, batteries included |
| **Clerk** | Speed matters and hosted UI is acceptable; per-user pricing is the tradeoff |
| **WorkOS** | Enterprise SSO, SCIM, directory sync — buy this rather than build it |
| Platform-native (Supabase Auth, etc.) | Already on that platform |

Session in an httpOnly, Secure, SameSite cookie. Authorization checks on the server, always
— a hidden button is not access control. Never put a token in `localStorage`.

## Database and data access

- **Postgres** unless something specific rules it out — Neon, Supabase, or managed
  elsewhere. SQLite (Turso, LiteFS) for small, read-heavy, or local-first.
- **Drizzle** for a thin, typed, SQL-shaped layer; **Prisma** when the team wants the
  higher-level model and the migration workflow.
- Redis-compatible KV for cache, rate limiting, and sessions.
- Object storage (Vercel Blob, S3, R2) for user files, with signed uploads direct from the
  client rather than through the app server.

## Internationalization

| Choice | When |
| --- | --- |
| **next-intl** | Next.js App Router; routing, formatting, and messages together |
| **i18next** / react-i18next | Framework-agnostic, mature, large ecosystem |
| **Paraglide** | Compile-time, tree-shaken messages; smallest runtime |
| `Intl` directly | Dates, numbers, currency, plurals, relative time, list formatting, collation. Most of what people install a library for |

Design for it from the start even when shipping one language: logical CSS properties, no
concatenated sentence fragments, no text baked into images, room for strings 30–50 % longer
than English, and locale-aware sorting and formatting. Retrofitting RTL and text expansion
is expensive; both are nearly free if the CSS used logical properties from day one.

## Offline and PWA

- **Serwist** (the maintained successor to Workbox) for service worker caching in Next.js.
- **idb** for a thin IndexedDB wrapper; **Dexie** when queries get real.
- TanStack Query persistence for offline-tolerant reads.
- Offline is a feature with a UI: connection state, queued mutations, conflict resolution,
  and a sync indicator. A service worker alone is a caching layer, not offline support.
- Install prompts only after the product has earned them.

## Observability

- **Core Web Vitals from the field**, not only from a lab run: Vercel Speed Insights, or
  `web-vitals` reporting to your own endpoint. Lab numbers hide the devices that matter.
- **Sentry** for errors and traces, with source maps uploaded. An error report without a
  readable stack is noise.
- **PostHog** for product analytics and session replay when behavior questions are real.
- Structured logging with **pino**. Never log secrets or personal data.
- CI gates: bundle size budget, Lighthouse CI on key routes, axe on key routes. A budget
  that is not enforced by a gate is a preference.

## Runtime hygiene

- Node 24+ LTS, ESM only, no CJS. `node:` prefix on builtins.
- Built-ins before dependencies: `fetch`, `FormData`, `crypto.randomUUID()`,
  `AbortSignal.timeout()`, `structuredClone`, `node:test`, `--watch`, `--env-file`.
- Handle `unhandledRejection` and `uncaughtException`; graceful SIGTERM.
- Committed lockfile, exact versions in production, dependency audit in CI.
- I/O at the edges; pure logic in the middle, where it can be tested without infrastructure.
