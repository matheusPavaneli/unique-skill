# Realtime, collaboration, and AI interfaces

Read when a capability involves live updates, presence, multiplayer editing, or an LLM
streaming into the UI.

---

## Transport: pick the weakest one that works

| Need | Transport | Note |
| --- | --- | --- |
| Server pushes, client only listens (notifications, progress, token streams, live counters) | **SSE** (`text/event-stream`) | Plain HTTP, auto-reconnect, no upgrade dance, works through every proxy. Works on the default Node runtime — streaming has never required an edge runtime |
| Bidirectional, low latency (chat, cursors, multiplayer) | **WebSocket** | Supported on Vercel Functions with Fluid Compute; standard `ws` or Socket.IO. Needs its own reconnect, heartbeat, and backoff |
| Peer media or very low latency between clients | **WebRTC** | Only for media or true peer-to-peer; it brings signalling and NAT traversal with it |
| Occasional freshness | Polling with backoff, or query invalidation | Genuinely fine below a few requests a minute. Do not build a socket layer for a dashboard that refreshes every 30 s |

Whatever the transport: exponential backoff with jitter, a visible connection state,
buffered outbound messages while disconnected, and reconciliation on reconnect. A realtime
UI that silently stops updating is worse than one that never claimed to be live.

## Collaboration

| Need | Choice |
| --- | --- |
| Multiplayer text or structured document editing | **Y.js** — the default CRDT. Pair with Tiptap or Lexical bindings |
| Y.js backend | **Hocuspocus** (self-hosted, Tiptap-native), **y-websocket** (minimal), **Liveblocks** or **PartyKit** (hosted) |
| Presence, cursors, comments, notifications with minimal backend work | **Liveblocks** — presence-first; price the vendor dependency explicitly |
| Deep history, branching, offline-first sync of structured data | **Automerge** |
| Local-first application data | **ElectricSQL**, **Zero**, or a sync engine — an architecture decision, not a component |
| Simple shared state (a poll, a queue, a board) | The database plus SSE. A CRDT for non-concurrent edits is over-engineering |

Concurrent editing is a `core` capability by definition. If the brief lists it as
supporting, the brief is wrong — say so.

## AI interfaces

**AI SDK v6** is the default layer: `streamText`, `useChat`, tool calls, structured output,
and generative UI. Route models through **Vercel AI Gateway** with plain `"provider/model"`
strings rather than provider-specific packages, unless the user explicitly wants direct
wiring.

Runtime: the default Node runtime. Streaming and SSE do not need an edge runtime, and the
edge runtime costs Node APIs and duration for nothing.

### What actually makes an AI UI good

The model is not the product. These are:

- **Reserve the space.** Streaming text that grows a container reflows everything below it.
  Fix a minimum height or stream into a container that is already sized.
- **Stream markdown safely.** A partial token stream is invalid markdown most of the time.
  Use a parser tolerant of incomplete input, and never `dangerouslySetInnerHTML` model
  output without sanitizing.
- **Abort is a first-class control.** `AbortController` wired to a visible Stop, and the
  partial result is kept, not discarded.
- **Show the state machine**, not a spinner: queued, thinking, calling a tool, streaming,
  done, failed. Tool calls in particular need a visible surface — an interface that goes
  quiet for eight seconds during a tool call reads as broken.
- **Errors are recoverable.** Rate limit, context length, and refusal are different states
  with different actions. Never a raw provider error string.
- **Resumable streams** if a session can outlive a page — otherwise a refresh loses work.
- **Scroll behavior**: follow the stream only while the user is at the bottom. Auto-scroll
  that fights the reader is the most-reported defect in chat UIs.
- **Latency is a design problem.** Optimistic echo of the user's message, a skeleton for the
  first token, and a real time-to-first-token budget.
- **Reduced motion** applies to token-by-token animation and typewriter effects too.
- Never present generated content as verified fact in the UI's own voice. Attribution and
  citations are interface elements.

### Agent-shaped products

When the product is an agent rather than a chat box, the interface needs a run timeline
(steps, tools, inputs, outputs), interruption and resumption, and durable state that
survives a reload. **Eve** is Vercel's filesystem-first framework for durable agents —
sessions, tools, skills, sandboxes, subagents, schedules, evals — and is worth proposing
before scaffolding a bespoke agent runtime. Propose it; do not install it unannounced.

Code execution from a model goes in a sandbox (**Vercel Sandbox** or equivalent), never in
the app process.

## Notifications and background work

- In-app: SSE or WebSocket into a toast and a notification centre with read state.
- Web Push: `PushManager`, a service worker, and explicit opt-in requested *after* the user
  has a reason — never on first paint.
- Durable event streaming and fan-out: **Vercel Queues** or an equivalent broker. Not a
  `setTimeout` on a serverless function.
- Long jobs: return a job id, stream progress over SSE, and make the result addressable by
  URL so a reload does not lose it.
