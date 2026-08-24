# Editors, canvas, and media

Read when a capability involves text editing, drawing, images, video, audio, or documents.

Two rules govern this whole domain:

1. **Never hand-roll `contentEditable`.** Selection, IME composition, paste sanitization,
   undo history, and mobile keyboards will consume months and still be wrong. Use a
   framework that owns the document model.
2. **Every one of these is heavy.** Dynamic-import without exception, and reserve the exact
   final dimensions so the mount cannot shift layout.

---

## Rich text

| Choice | When | Notes |
| --- | --- | --- |
| **Tiptap** (ProseMirror) | Default for document-style editing | Best extension ecosystem, schema-first, real collaboration via Y.js (Hocuspocus). Some extensions are commercial — check before promising a feature |
| **Lexical** (Meta) | Comments, chat, captions, constrained inputs | Fast, small core, excellent mobile and IME handling. Steeper: more is built by you |
| **Plate** (Slate) | React-heavy product wanting batteries-included UI | Rich preset components; inherits Slate's rough edges |
| **Slate** raw | Genuinely novel document model | Only with the budget to handle its edge cases |
| **Quill 2** | A simple, self-contained editor | Small and stable; less extensible |
| A `<textarea>` plus markdown preview | Notes, descriptions, issue bodies | Frequently the honest answer. Zero bytes, full accessibility, no paste bugs |

For markdown authoring specifically, a textarea with a preview beats a WYSIWYG for most
technical audiences and costs nothing.

## Code editing

| Choice | When |
| --- | --- |
| **CodeMirror 6** | Default. Modular, small, extensible, works on mobile, accessible |
| **Monaco** | A real IDE surface where VS Code parity is the requirement. Very large (~1 MB+), poor on mobile |
| **Shiki** | Read-only syntax highlighting — highlight at build time and ship HTML, not a highlighter |

Never ship a runtime highlighter for static code blocks.

## Canvas and drawing

| Need | Choice |
| --- | --- |
| Whiteboard, diagramming, infinite canvas | **tldraw** — complete, polished, licensed; read the license before committing |
| Sketch-style diagrams, embeddable | **Excalidraw** |
| 2D scene graph with shapes, layers, hit-testing, in React | **Konva** / `react-konva` |
| Image-editor style manipulation (crop, filters, layers, export) | **Fabric.js** |
| Signature pad, freehand annotation | `perfect-freehand` plus your own canvas — small and better-looking than a library |
| A drawing that is generated, not manipulated | Raw Canvas 2D or an SVG you emit |

## Images

- Server-side processing: **sharp**. Framework primitive first (`next/image`) — it handles
  format negotiation, sizing, and the `srcset` you would otherwise get wrong.
- Cropping: `react-easy-crop` or `cropperjs`. Compress before upload with
  `browser-image-compression` — it is far cheaper than a bigger upload endpoint.
- Delivery: AVIF with WebP fallback, `srcset` plus `sizes`, dimensions or `aspect-ratio`
  always, `loading="lazy"` below the fold, `fetchpriority="high"` on the LCP image.
- Never a CSS `background-image` for an LCP element — it is discovered late.

## Video

| Need | Choice |
| --- | --- |
| A short decorative loop | `<video muted playsinline loop preload="metadata" poster>` with an MP4/WebM. Never a GIF — an equivalent video is an order of magnitude smaller |
| Product video with a real player UI | **Vidstack** or **Mux Player** — accessible, themeable, modern |
| HLS/DASH streaming | **hls.js** where the browser lacks native HLS |
| Legacy or plugin-heavy needs | **Video.js** — mature, heavy, dated API |

Autoplay only when muted, and never under `prefers-reduced-motion: reduce`. Captions are
not optional for anything with speech. A poster frame at the correct aspect ratio prevents
the layout shift a video otherwise guarantees.

## Audio

| Need | Choice |
| --- | --- |
| Synthesis, sequencing, effects, music | **Tone.js** |
| Waveform display, regions, trimming | **WaveSurfer.js** |
| Level metering, FFT, driving a visual from sound | Web Audio `AnalyserNode` directly — no library, and it is the correct input for an audio-reactive 3D scene |
| Simple playback | `<audio controls>` |

Audio contexts require a user gesture to start; design the first interaction around that
rather than fighting it. Provide a visible mute and respect the OS reduced-motion signal for
anything that also animates.

## Documents

| Need | Choice |
| --- | --- |
| Viewing a PDF | **pdf.js** / `react-pdf`. Or `<embed>` and the browser's own viewer, which is free and accessible |
| Generating a structured document | `@react-pdf/renderer` server-side |
| Pixel-faithful print of an existing page | Headless Chromium (Puppeteer/Playwright) server-side |
| Spreadsheet import/export | **SheetJS**, on a worker — parsing a large workbook on the main thread freezes the tab |
| CSV | **PapaParse** with worker mode, or a hand-written parser for known-shape data |

Anything that parses a user-supplied file goes on a Web Worker, has a size cap, and has a
failure state. A file parser is an untrusted border: validate with zod after parsing.
