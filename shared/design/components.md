# Components: deriving the control grammar

Read with `craft.md`, after the tokens exist and before the layout is built, at every
ORIGINALITY level including `native`.

`craft.md` derives numbers: a palette, a scale, a rhythm unit, a radius, an elevation set.
Then the derivation stops, and something has to turn those numbers into a button, a field, a
card, a table row, a tab. That step is where a page is actually recognized — nobody sees a
token, everybody sees a control — and it is the step most often left to whatever the model
already knows a button looks like. A derived palette applied to the default component shapes
produces a tinted version of the default, which is the default.

**Enter through the provenance fact, the same route as everything else.** The fact says what
the subject's own objects are made of, and objects have a grammar: how tall a thing is, how
its edges are cut, how one part is told from the next, how it answers a touch. A ledger, a
control panel, a specimen label and a schedule card are four different grammars, and the
difference between them is not the palette.

---

## The component block

Six lines, written into the contract before any component CSS, and built to:

```
RECOGNIZED  <the three to five places this system is recognizable — named>
INTERACTION <the one signature every control shares, and what it does>
CONTROL     <control height in px, the density it sets, and what it applies to>
CORNER      <radius in px per role, and the fact it derives from>
SEPARATION  border | ground | shadow — which one carries structure, and where the others stop
FOCUS       <ring: color token, width, offset, and the ratio it holds against both sides>
```

`RECOGNIZED` and `INTERACTION` come first for the same reason `PATH` and `DENSITY` do in the
grid block: measurements do not decide what a control feels like to operate, and a grammar
recorded only as numbers is a component library with no opinion in it.

`check-contract.mjs` fails a contract with no components block, in every MODE. At `native`
the block records the grammar being **inherited** — the existing control height, the existing
radius, the existing focus ring, named — because "we match the app" without naming what the
app does is how a fifth grammar enters an app that already had four. At `prototype` it is
required precisely because a prototype is where an unexamined default enters a codebase and
never leaves.

---

## Deriving each line

### CONTROL — height and density

One control height, chosen against how the surface is actually used, and every interactive
element sized from it or from a deliberate second step.

| The subject is… | Control height | Because |
| --- | --- | --- |
| Operated all day, keyboard-first, dense data | 28–32 px, one compact step | Rows per screen is the job; a 44 px row in a table is twelve rows lost |
| Touched, occasional, consequential | 44–48 px | The target size is the floor and the surface has room to sit above it |
| Read, with a few actions | 36–40 px | The controls are punctuation in a document, not the document |
| Mixed — a dense table inside a read page | One step, plus one declared register shift | The register shift in `devices.md`, applied to controls |

Rules that make it a grammar rather than a number:

- **Density is a decision, and it is stated once.** Compact and comfortable are a *token
  pair*, not a per-component judgement call. A form where the select is 40 px and the input
  beside it is 36 px is not denser, it is unfinished.
- **Height sets the padding, not the reverse.** Derive `padding-block` from the height and the
  line height, so a button with an icon and a button with two words are the same height
  without a hand-typed value.
- **Target size is a floor and never a variable.** 24 px minimum per WCAG 2.2 AA, with the
  pointer target extended by padding or a pseudo-element wherever the visual control is
  smaller than the hit area. `../quality/floor.md`.
- **One control height.** A second step exists only as a declared register shift — a dense
  table inside a read page — named on the `CONTROL` line and used nowhere else. The
  counter-rule in `originality.md` holds: control height is not one of the three places
  variance is spent, and an undeclared second height is the unfinished component library.

### CORNER — the edge treatment

Radius is the most legible component-level tell there is, and the default is 8 px on
everything because that is what the starter theme ships.

- **Derive it from the subject's objects.** A subject whose material world is cut, milled,
  printed or ruled has square corners; one whose objects are moulded, tumbled, bottled or worn
  has real radius; one with a *specific* corner — a punched card, a photographic print, a
  shipping label, a rounded instrument face — has that corner and no other.
- **Radius is proportional, not constant.** A 32 px control and a 400 px panel do not share a
  radius. Derive the larger from the smaller (`--radius-panel: calc(var(--radius) * 2)`) or
  state both, and hold the *nesting rule*: an inner radius is the outer radius minus the
  padding between them, or the corners visibly disagree.
- **Zero is a decision available to you.** Fully square is a strong, cheap, under-used grammar,
  and it is the one that most exposes weak alignment — which is why it reads as confident.
- **It never varies for variety.** Per the counter-rule in `originality.md`: radius is spent
  once, at the system level, and then held.

### SEPARATION — border, ground, or shadow

Three ways to say "this ends and that begins". Choosing one to carry the structure is what
gives a system a consistent surface; using all three everywhere is the default look.

**Border-carried.** Hairline rules and 1 px borders do the dividing, grounds stay flat, and
shadow is absent or reserved for one real overlay. Needs a disciplined rule weight and one
border token. Reads precise, documentary, dense. Cheapest at every ratio and the best
survivor under `forced-colors`. Pairs with the rule as structure in `devices.md`.

**Ground-carried.** Depth from stacked grounds — a panel a step lighter, a field a step
darker — with borders reserved for inputs and no shadows at all. Needs a lightness ramp with
enough steps to stay legible at every nesting depth. Reads solid, material, calm. Survives
dark mode intact, which shadow does not.

**Shadow-carried.** Elevation does the separating, using the elevation tokens `craft.md`
already derived — three or four, layered — applied to things that genuinely float: a menu, a
dialog, a dragged item. Needs restraint, and it needs the shadow to mean *height*. Breaks the
moment a static card is elevated, which is the one-24px-blur-on-everything default.

Rules:

- **One carries structure; the others are exceptions with a named job.** "Borders for inputs,
  shadow for what genuinely floats, ground for everything else" is a grammar. All three
  everywhere is a starter theme.
- **A card is not a component.** It is a decision to separate something, made once, on this
  line. When the content is a list, a list with rules is usually right and a grid of elevated
  rounded rectangles is usually the reflex.
- **Dark mode changes which one works.** Shadow is close to invisible on a dark ground; a
  ground-carried system dark-modes by swapping layer 2 and nothing else. Decide with both
  grounds on screen.

### FOCUS — the ring

Free, required anyway, and one of the few details read as care by exactly the people most
likely to notice it. `devices.md`, focus as part of the design.

- One ring, one token, every control, no exceptions — custom controls, table rows, cards that
  are links, and anything carrying `tabindex` included.
- 3:1 minimum against **both** the control and the surface behind it. Two-tone — an outer dark
  and an inner light, or `outline` plus `outline-offset` over a contrasting ground — is what
  makes one ring work on every ground you have.
- `:focus-visible`, not `:focus`, so a mouse press does not ring. Never `outline: none`
  without a replacement in the same rule.
- The offset is part of the design: 2 px of offset reads as deliberate, 0 reads as a browser
  default, and a ring clipped by `overflow: hidden` reads as a bug.
- Distinctiveness is not allowed to live here. The ring may be *your* color; it may not be
  thinner, dimmer, or absent. `originality.md`, where distinctiveness is not allowed to live.

### INTERACTION — the one signature

Every control on the surface answers a pointer the same way, and that answer is a design
decision made once. This is the component-level form of "one orchestrated moment": a single
interaction idea applied consistently is a signature, and five different hover effects are an
unfinished library.

Pick one, derive it from the fact, hold it:

- **Reveal.** Hover exposes information that was abbreviated — the full value, the unit, the
  source, the timestamp. Strongest on data and reference subjects, and the only one of the
  four that is useful rather than decorative. Needs a non-hover path for touch and keyboard.
- **Weight.** The control gains ink — the border darkens, the weight steps up, the ground
  moves toward the accent — and nothing moves. Cheap, works under `forced-colors`, and cannot
  cause layout shift.
- **Displacement, once.** A single axis of movement: 1 px down on press, an underline sliding,
  an inset that reads as the control taking the press. Physical, and the same physics
  everywhere.
- **Mark.** A persistent mark appears — a rule beneath the item, a notch, a bracket, a caret
  drawn from the subject's own notation — rather than a color wash.

Rules: state changes run on compositor properties only at the state-change duration
`craft.md` set, and the hover state is never the only way to reach the information. A control that translates upward on hover *and*
gains a shadow *and* changes color has made three decisions where one was needed.

---

## The component signature rule

**A design system is recognizable in three to five places. Name them, and hold everything
else conventional.**

This is the component-level form of the whole doctrine: distinctiveness is concentrated, not
distributed. Spread across every control it becomes texture, then noise, then a maintenance
problem. Concentrated in a few places it becomes a grammar someone can describe from memory.

The places worth spending it on are the ones a person touches most or looks at longest:

- the primary control — its shape, its weight, its press
- the input — its separation strategy, its label position, its filled state
- the row or the item — the unit the subject is actually made of
- the current state — the mark that says "you are here"
- one structural component the subject demands: the schedule row, the specimen label, the
  ledger line, the queue item

Everything else — checkbox, radio, tooltip, disclosure, menu, scrollbar, date field — is built
to convention, sized from `CONTROL`, cornered from `CORNER`, separated by `SEPARATION`.
Conventional is not a compromise here; it is what makes the three to five places legible as
decisions.

**The test.** Describe the system's components to someone who has not seen the surface, in
three sentences. If it takes more, the distinctiveness is distributed and the surface will
read as busy. If it takes fewer, nothing was spent and the derived tokens are wearing a
starter theme.

---

## The state matrix, as design

The states are usually met as a checklist in `../quality/floor.md` — the audit that catches a
loading state nobody drew. That is the floor. The design question comes first and is
different: **which state is the one the person actually lives in**, and is that the state that
got designed?

- **Empty is often the most-seen screen**, and it is the strongest device available on a
  product surface at a `quiet` budget. It is a real screen with a real first action in the
  subject's own vernacular, not an icon, a grey sentence and a button. `devices.md`, the empty
  state as the best screen.
- **Loading is a shape, not a spinner.** Skeletons that match the real layout's measure and
  rhythm; a spinner only where the wait is genuinely unbounded. A skeleton whose proportions
  do not match what arrives is a layout shift you drew yourself.
- **Error is copy first.** What happened, in the subject's terms, and what to do next. The
  component work is making sure it has a designed place to appear that is not a toast which
  disappears before it can be read. `copy.md`.
- **Partial is the state that gets skipped** — some rows loaded, one field invalid, a stale
  value refreshing. It is also the state a real product is in most of the time.
- **Disabled is a decision about explanation.** A disabled control with no reason attached is
  a dead end: either say why, or do not show it.

Design them in the same pass as the default state, with the same tokens, at the same time. A
state drawn later is drawn from priors, and priors are where the grey box with the centred
icon comes from.

---

## Anti-patterns — the default component look

The component-layer equivalent of the banned-default registry in `originality.md`. Each is
allowed only when the brief names it or a provenance line earns it:

1. **The starter grammar**: 8 px radius on everything, a 1 px neutral border *and* a soft
   shadow *and* a raised ground, 40 px controls, `Inter`, a card grid. Recognizable on sight,
   and it is banned default #4 arriving one layer lower.
2. **Nested rounded rectangles**: a rounded card holding a rounded panel holding a rounded
   input, all at one radius, the corners visibly disagreeing.
3. **Elevation as decoration**: static content on an elevated card. Shadow means height; if
   nothing floats, nothing is elevated.
4. **Lift-on-hover, everywhere**: `translateY(-2px)` and a bigger shadow on every card and
   tile. The tilt-on-hover tell from `spectacle.md`, wearing a smaller hat.
5. **The colored left edge**: a thin accent bar down the side of a card, panel or callout.
   Registry #14, and one of the most specific tells there is.
6. **Icon in a tinted rounded square**, repeated per feature, three to six across a row.
7. **Three control heights and two radii**, arrived at by building each component when it was
   needed instead of deriving the grammar once.
8. **The pill by default**: `border-radius: 999px` on every button because it reads friendly.
   That is a claim about the subject's objects, not a mood.
9. **Focus removed and never replaced**, or a focus style that only works on one ground.
10. **A component library adopted whole, left at its defaults, and re-themed** with a derived
    palette. The palette is derived; the grammar is still the library's, and the grammar is
    what gets recognized.

---

## Checking it

- **The swap test, per component.** Would this button — at this height, this corner, this
  separation strategy — be right for a different subject in a different industry? If yes, the
  grammar was inherited rather than derived. `originality.md`, Gate 1.
- **The three-sentence test** above, for the signature rule.
- **Count the grammar.** One control height (two with a reason), one radius scale, one
  separation strategy, one focus ring, one interaction signature. Any count above that is the
  unfinished-library tell — and it is a statistic rather than a taste judgement, which is what
  makes it worth counting.
- **Both grounds, both modes.** The separation strategy is checked on the dark ground and
  under `forced-colors: active` before it is called done, because that is where a
  shadow-carried system quietly stops having any structure at all.
