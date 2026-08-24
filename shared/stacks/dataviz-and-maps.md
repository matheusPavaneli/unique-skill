# Data visualization, maps, tables at scale

Read when a capability involves charts, dashboards, geography, graphs, or lists large
enough that rendering them all is a problem.

The routing question in this domain is always the same and rarely asked: **how many points,
and does the chart need to be branded?** Answer both before naming a library.

---

## Charts

### Fidelity ladder

**T0 — no library.** A sparkline, a single bar row, a progress ring, a simple donut: SVG
with a `path` you compute, or CSS. Twenty lines, zero bytes, perfectly on-brand, and it
never fights the design system. A surprising share of dashboard "charts" are this.

**T1 — small React chart set.**
- **Recharts** — easiest React API, SVG. Fine to roughly 1k points per series; degrades
  badly past that. Its default look is recognizable, so re-theme it.
- **Chart.js** — canvas, small, sane defaults, framework-agnostic. Good for a handful of
  standard charts in a non-React page.
- **Observable Plot** — grammar-of-graphics, terse, excellent for exploratory and
  statistical charts. Best ratio of expressiveness to code on this list.

**T2 — full charting framework.**
- **Apache ECharts** — the workhorse for real dashboards: canvas rendering, large data
  handling, rich interaction, every chart type. Import from `echarts/core` with explicit
  chart and component registration, otherwise it is very large.

**T3 — bespoke and branded.**
- **visx** — D3 math and scales as React primitives. You compose the chart; it imposes no
  visual opinion. The correct choice when the chart is part of the brand and must not look
  like a library.
- **D3** directly — maximum control, real cost in code and in the mental model. Reach for it
  when the visualization is genuinely novel; use its scales, shapes, and interpolators
  rather than its DOM layer inside React.

**T4 — dense or realtime.**
- **uPlot** — tiny (~50 KB) and extremely fast for time series; hundreds of thousands of
  points, smooth panning. Underused, and the right answer for monitoring and metrics UIs.
- **deck.gl** / **regl** — WebGL when the point count is in the millions or the visual is
  itself GPU-driven.

### Rules
- Every chart needs a non-visual path: a caption or summary, a data table alternative, or
  ARIA description. A chart with no text equivalent is inaccessible by construction.
- Color is never the only encoding. Series need shape, label, or direct annotation too.
- `tabular-nums` on every number in axes, tooltips, and legends.
- Format numbers and dates with `Intl`, and localize.
- Charts are almost always below the fold: dynamic-import them, always.
- Re-theme the defaults. A default Recharts or ECharts palette is a visible admission that
  nobody looked.

---

## Maps

| Need | Choice |
| --- | --- |
| Interactive vector map, own or open tiles | **MapLibre GL JS** — open fork of Mapbox GL, no token, no license question. Default |
| Large geospatial datasets, 3D layers, GPU rendering | **deck.gl**, optionally over MapLibre |
| A few pins on a simple raster map | **Leaflet** — small and unfussy; do not pull in a GL engine for this |
| Vendor features, geocoding, and support matter more than lock-in | **Mapbox GL JS** — price and license it explicitly |
| Static locator image | A static tile image or an SVG. No map runtime at all |

Maps are heavy: dynamic-import, mount lazily, and give the container fixed dimensions so it
cannot shift layout. Keyboard panning and zooming, and a text alternative for the
information the map conveys, are requirements, not extras.

---

## Graphs and node editors

| Need | Choice |
| --- | --- |
| Node-based editor, flows, pipelines, diagrams | **React Flow** (`@xyflow/react`) |
| Large network graphs (thousands of nodes) | **Sigma.js** with graphology, or **Cosmograph** for GPU-scale |
| Small force-directed graph | `d3-force` with your own SVG rendering |
| Hierarchies, trees, org charts | `d3-hierarchy` layouts plus custom rendering |
| Static architecture or sequence diagram | **Mermaid**, rendered at build time where possible |

---

## Tables and long lists

The most common performance failure in product UI, and it is a routing failure: a
hand-rolled `<table>` with client-side sort over 10k rows.

| Rows | Approach |
| --- | --- |
| < 100 | Plain semantic `<table>`. No library |
| 100 – 10k | **TanStack Table** (headless: sorting, filtering, grouping, pagination, column sizing) with your own markup and styles |
| > 10k, or long non-table lists | TanStack Table + **TanStack Virtual**, or server-side pagination. Virtualize, or paginate — rendering them all is not an option |
| Pivot, tree data, Excel export, range selection, enterprise procurement | **AG Grid** — price the bundle and the license deliberately; it is a product decision, not a component choice |

Rules:
- Keep the semantics. A virtualized list still needs correct roles and a keyboard path;
  a `div` soup grid is unusable with a screen reader.
- Sorting and filtering must not lose scroll position or focus.
- Sticky header, and a sticky first column on narrow screens.
- `tabular-nums` on numeric columns; right-align numbers, left-align text.
- Never crush a table into a phone. Horizontal scroll with a sticky identity column, or a
  card transformation.
- Server-side sort, filter, and pagination once the dataset outgrows the client. Decide this
  before building the client version twice.
