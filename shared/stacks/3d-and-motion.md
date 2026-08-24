# 3D, particles, shaders, motion

Read when a capability involves depth, generative graphics, particles, shaders, physics,
scroll choreography, or orchestrated animation.

Sizes are gzipped and approximate; verify before pinning. The ordering and the reasoning
age much slower than the numbers.

This file answers *how* and *how much*. It does not answer whether the effect is earned or
what it should be about — that is `../design/spectacle.md`, and it is read first. A
flawlessly built effect that is not about the subject is the most expensive way to look
generic.

---

## The 3D fidelity ladder

Pick the lowest tier that genuinely does the job. Skipping to T4 because it is more
interesting is the most common and most expensive mistake in this domain — a decorative
background does not need a scene graph, and a marketing hero that ships 400 KB of runtime
to draw a floating blob has traded its own LCP for atmosphere.

### T0 — Depth without a scene · 0 KB
CSS `transform` with `perspective` and `transform-style: preserve-3d`, layered gradients,
`mask-image`, SVG with a fake vanishing point, parallax via CSS scroll-driven animation.

Use when 3D is *flavor*: a tilting card, a stacked-plane hero, a rotating logo, depth on
scroll. Composited on the GPU, no JS, works everywhere, fails at nothing.

### T1 — 2D particle field · 0–15 KB
Hand-written Canvas 2D. A few hundred lines: a typed array of positions and velocities, one
`requestAnimationFrame` loop, `ctx.fillRect` or a sprite. Comfortable to ~3–5k particles at
60 fps, more with `ImageData` writes.

Beyond that, or when per-particle blending and size matter, drop to WebGL point sprites via
**OGL** (~15 KB) — a thin WebGL wrapper with no scene-graph overhead. 50k+ points, one
shader, a fraction of three.js.

Avoid `tsparticles` / `particles.js` for anything but a throwaway. Large, config-driven,
poor performance ceiling, and instantly recognizable as a stock effect — a signature
element it cannot be.

### T2 — One custom shader · 15–25 KB
A single full-screen quad and a fragment shader: animated gradient, fluid, distortion,
noise field, dithered ground, text warp, cursor-reactive ripple.

Raw WebGL or OGL. No scene graph, no camera rig, no loaders. This is the highest
quality-per-byte tier in the whole domain and it is badly underused — most "we need
three.js" briefs are actually this. It is also where a genuinely original visual signature
is cheapest to buy, because the output is code nobody else has.

### T3 — Real scene, no React · ~150 KB
**three.js** vanilla. Meshes, cameras, lights, loaders, controls, materials.

Use when there is real geometry, or the host page is not React. Import from `three/webgpu`
or the modular entry points; a namespace import of everything defeats tree-shaking.

Alternative: **Babylon.js** when the brief is closer to a game or a simulation — physics,
audio positioning, an inspector, and a scene-graph-first API. Heavier; earns it only there.

### T4 — Real scene inside React · +30 KB over three.js
**@react-three/fiber** with **@react-three/drei**. Declarative scenes that participate in
React state, plus drei's loaders, controls, environments, and helpers.

- Import drei components individually, not from the barrel.
- **@react-three/postprocessing** for bloom, depth of field, SSAO — each pass is a
  full-screen render; two is a choice, five is a mobile frame-rate problem.
- **@react-three/rapier** for physics (Rust/WASM, fast) over cannon-es or ammo.
- Never `setState` inside `useFrame`. Mutate refs; React renders are not a per-frame budget.
- Allocate nothing per frame — hoist vectors, quaternions, matrices out of the loop.

### T5 — GPU-simulated particles · 100k to millions
Two paths. Pick by audience, not by novelty.

**WebGL2 GPGPU (broad support, proven).** Simulation state lives in floating-point
textures; a ping-pong pair of render targets advances position and velocity in a fragment
shader; a `THREE.Points` vertex shader reads the position texture. `GPUComputationRenderer`
from three's examples is the standard base. Millions of particles, works on essentially
every device that has WebGL2.

**WebGPU compute via TSL (modern, simpler).** three.js `WebGPURenderer` with node materials
and `three/tsl` compute shaders writing to storage buffers. Dramatically less ceremony than
FBO ping-pong, real compute, and TSL compiles down to WebGL2 as a fallback — but compute
nodes themselves need a declared path when WebGPU is absent. Choose this when the audience
is modern desktop and the effect *is* the product; verify current API shape before writing,
this area moves fast.

Effects that live here: cursor-attracted fields, curl-noise flow, particles sampled from a
texture or SDF to form a logo or word, morphing between two point clouds, audio-reactive
fields driven by an `AnalyserNode`.

Budget honestly: a 1M-particle scene is a `core` capability. If the brief calls it
atmosphere, the answer is T1.

### T6 — Authored, not coded
**Rive** — interactive 2D vector with a state machine, tiny runtime, excellent for
characters, icons, and reactive illustration. The best value on this list when the asset is
2D and someone can author it.
**Lottie** (`@lottiefiles/dotlottie-web`) — After Effects export. Fine for short vector
loops, bad for anything with many layers; check the JSON size, it is often the real cost.
**Spline** — designer-authored 3D scenes. The runtime is heavy (hundreds of KB) and the
scene is opaque to optimization. Justified when a non-engineer owns and iterates the scene;
never as a shortcut to "we want 3D on the hero".

---

## Asset pipeline (T3 and up)

- **glTF/GLB only.** Not FBX, not OBJ, not a Blender file.
- **Meshopt** compression by default (fast decode, small runtime); **Draco** when geometry
  dominates and the extra decode cost is acceptable.
- **KTX2 / Basis textures.** This is the biggest win most scenes never take: GPU-compressed
  textures cut VRAM several-fold and stop mobile from thrashing. Mandatory past ~1 MB of
  texture data.
- `gltf-transform` CLI to prune, weld, resize, and compress. `gltfjsx` to generate a typed
  R3F component from a GLB.
- Budget: under ~2 MB total for a web hero scene. Textures 2048 px maximum, 1024 px where
  it will not be noticed. Draw calls under ~100.

## Performance rules that decide whether a 3D surface ships

- **Clamp device pixel ratio.** `dpr={[1, 2]}`, and 1.5 on mobile. Uncapped DPR on a
  high-density phone renders four times the pixels for no perceptible gain.
- **Stop rendering when nothing moves.** `frameloop="demand"` plus `invalidate()`, or a
  manual loop gated on state. A static scene rendering 60 fps is a battery bug.
- **Instance and merge.** `InstancedMesh` for repeats, merged buffer geometry for static
  sets. Draw calls, not triangles, are usually the ceiling.
- **Keep it out of LCP.** Never mount a canvas above the fold when LCP matters: ship a
  poster image at the exact final dimensions, lazy-load the whole 3D bundle behind
  `IntersectionObserver`, then cross-fade. This one rule is the difference between a 1.4 s
  and a 4 s hero.
- **Pause off-screen.** `IntersectionObserver` and `document.visibilitychange`.
- **Dispose.** Geometries, materials, textures, render targets, and event listeners. R3F
  disposes declarative objects; anything created imperatively is yours.
- **Handle context loss.** `webglcontextlost` fires on mobile under memory pressure. Without
  a handler the canvas goes black permanently.
- **Detect and downgrade.** No WebGL2, `deviceMemory` low, or `hardwareConcurrency` small →
  fewer particles, no postprocessing, or the poster image. Declare this as the `FALLBACK`.
- **Reduced motion** freezes the scene at a composed frame or swaps the poster. It never
  just keeps spinning.
- **Test throttled.** 4x CPU slowdown, and on a real mid-range phone if one exists.

## Anti-patterns

Three.js loaded eagerly on a marketing page · Spline embed as a hero · a 15 MB GLB · five
postprocessing passes on mobile · `useFrame` allocating a `new Vector3()` every frame ·
per-frame React state · a particle library configured to look like every other particle
library · scroll-jacked 3D with no keyboard path · autoplaying motion under
`prefers-reduced-motion`.

---

## Motion and scroll

| Need | Choice | Note |
| --- | --- | --- |
| Component enter/exit, layout, gestures in React | **Motion** (`motion`, ex-Framer Motion) | Layout animations and the spring model are the reason; lazy-load if only used below the fold |
| Complex timelines, scroll storytelling, SVG morph, text splitting | **GSAP** + ScrollTrigger | Still the strongest timeline model; free including plugins since 2025 |
| Scroll-linked reveal or progress, no JS | **CSS scroll-driven animations** (`animation-timeline: view()` / `scroll()`) | Zero bytes, runs off the main thread, degrades to "already visible". First choice when supported |
| Route and element transitions | **View Transitions API** | Native, cheap, works cross-document; a real alternative to a JS transition layer |
| Smooth/inertial scrolling | **Lenis** | Use sparingly. It replaces native scrolling: costs accessibility, scroll anchoring, and find-in-page behavior. Never on a reading or product surface |
| Art-directed keyframe sequencing of a 3D scene | **Theatre.js** | GUI-authored camera and object timelines; strip the studio bundle in production |
| Number, text, and unit interpolation | Web Animations API or a 1 KB tween | Not a library |

Rules: compositor properties only (`transform`, `opacity`, `filter`, `clip-path`). One
orchestrated moment beats scattered micro-interactions — scattered micro-interactions are
themselves an AI tell. Timings and easing curves in `../design/craft.md`. Reduced motion is
a floor, not a toggle.
