# Landing pages: the argument, the hero, the proof, the ask

Read when MODE is `marketing`. `modes.md` says expression pays here; this file says what it
is spent on. `spectacle.md` decides whether an effect belongs; `copy.md` sets the voice;
`devices.md` supplies the compositional vocabulary. This one is about the page's *job*.

A landing page has one job: move a specific person from *not knowing* to *acting*, once. It
is the only surface in the plugin whose success is measurable by someone else, and the only
one where a beautiful page that does not persuade is a failure.

## The argument comes before the sections

A landing page is an argument, not a stack of components. Write the argument in five lines
before touching layout. Every line is one sentence, in the subject's own vocabulary:

```
CLAIM      <the one thing this product does, stated so a competitor could not reuse it>
MECHANISM  <why it is true — how the thing actually works>
PROOF      <the evidence a skeptic would accept, that we actually have>
OBJECTION  <the strongest reason this person would not act, answered>
ACTION     <the single next step, and what happens after they take it>
```

Rules that make this worth writing:

- **CLAIM fails the swap test → nothing downstream can save the page.** Run it here, not at
  the end. "The fastest way to ship" is a category, not a claim.
- **MECHANISM is the section most pages skip**, and it is the one that converts a technical
  audience. If the mechanism is genuinely the interesting part, it is also the hero — see
  the idiom catalog in `spectacle.md`.
- **PROOF we do not have is not written.** No invented logos, metrics, testimonials or
  counts. If the honest answer is "pre-launch, none", the page argues from mechanism and
  says so; that is more persuasive than fabricated social proof and it is a hard rule from
  the non-negotiables, not a preference.
- **OBJECTION is a section**, not a FAQ accordion at the bottom where nobody reads it. Price,
  lock-in, migration cost, trust, "we already have one" — answer the real one, in place.
- **ACTION is one action.** Two equal buttons is a page that could not decide. A secondary
  path is allowed at lower visual weight (docs, a demo), never at equal weight.

The section order then falls out of the argument. The banned structural default in
`originality.md` — hero, logo strip, three feature cards, alternating image/text,
testimonial, pricing, dark CTA band, fat footer — is what you get when the argument was
never written and the components were arranged instead.

## The first screen

At 390 px and at 1440 px, before any scroll, a person must be able to answer:

1. What is this?
2. Is it for me?
3. What do I do next?

If a screenshot of the first screen cannot answer all three, nothing below it matters. This
is the single most common failure in AI-built landing pages: an atmospheric hero that is
beautiful and answers none of the three.

**Time to first meaning ≤ 1 s.** The claim is in the DOM at first paint. Text that animates
in over 800 ms has a claim that arrives at 800 ms.

## Hero taxonomy

Pick from what the subject *is*. Each of these is a full page-scale answer, and each maps to
an idiom in `spectacle.md`:

| Hero | Fits | Fails when | Cost |
| --- | --- | --- | --- |
| **The product, running** | Anything with a visible surface doing a real job | The demo has to lie, or the product has no surface | Real components, T0 |
| **The claim as type** | Opinionated products, dev tools, anything whose value is a position | The claim is weak — this exposes it instantly, which is a feature | 0 KB |
| **Real data** | Analytics, infra, finance, observability, science | Pre-launch with nothing real to show | T0/T1 |
| **The mechanism, drawn** | Complex systems, pipelines, hardware, layered architecture | The mechanism is boring or is the same as everyone's | SVG, T0 |
| **A single artifact** | One photographed or rendered object that *is* the product | Software with no body — this becomes the mascot failure | Image budget |
| **Nothing** | Trust-first categories: security, health, finance, infrastructure | Never a failure; it is a decision to state, not an absence to apologize for | 0 KB |

The default in 2026 is *the product, running*. It is skipped most often because it is not
"designy", and it out-converts every alternative for products that have a surface.

The hero is never the LCP problem: whatever the idiom, the LCP element is text or one
optimized image, and anything expensive mounts after it. `../quality/engineering.md`.

## Headline mechanics

- One claim, concrete, ≤ 12 words where possible. The subhead does the work the headline
  could not carry — it is not a restatement and it is not a list of adjectives.
- Write the longest realistic headline and the shortest, and set the type so both work.
  Design to the copy; do not cut the copy to fit a `clamp()`.
- The eyebrow above the headline earns its place by naming the audience or the category, or
  it is deleted. "Introducing" is not an eyebrow.
- `text-wrap: balance` on the headline, and check the break points at 390 / 768 / 1440. A
  headline that breaks after "the" reads as careless at exactly the moment attention is
  highest.

## Proof, without the marquee

The greyscale infinite logo marquee is banned in `originality.md`. What actually persuades,
in rough order of strength:

1. **A number the reader can check** — an ingested volume, a p99, a customer's own published
   figure. Cited, linked, and real.
2. **A named person saying a specific thing.** One real quote with a name, role and company
   beats twelve anonymous cards. If there is no real quote, there is no quote section.
3. **The work itself** — a live output, an open repository, a public status page, a running
   demo. Strongest for technical audiences and almost never used.
4. **Static, legible customer marks**, if they exist and permission exists: a quiet row, no
   animation, correct contrast, alt text with the company name.

Never: fabricated counts ("Trusted by 10,000+ teams"), invented star ratings, stock-photo
faces attached to invented quotes, a testimonial carousel that autoplays.

## Pricing

Pricing is a comparison table doing a decision job, and it is where craft is most visible.

- **Name the plans by who they are for**, not by metal. "Team" beats "Gold".
- **Anchor deliberately.** One plan is recommended and says why in one line. Three plans is
  the useful maximum on a landing page; more belongs on a dedicated page.
- **The differences carry the emphasis, not the shared rows.** A table where every row is
  ticked in every column is a table nobody reads.
- **Show the real price**, including what the units mean and what happens at the limit.
  "Contact us" for a self-serve tier is a conversion leak.
- **Responsive**: the table becomes stacked cards under ~700 px, never a crushed grid and
  never a horizontal scroll on the primary comparison. `../quality/floor.md`.
- Annual/monthly toggle: it is a control, so it is a real `button` or `input`, keyboard
  operable, with the saving stated in currency and not only in percent.

## Scroll choreography

Scroll is a reading device, not a stage. The budget for movement on a landing page is spent
on *one* orchestrated sequence, and `craft.md`'s timings apply throughout.

- **Reveal on scroll is a 200–300 ms opacity and 8–16 px translate, once, per group** —
  never per element, never on every card in a grid, never repeated on scroll-back.
- **Native first.** `animation-timeline: view()` and `scroll()` run off the main thread and
  cost 0 KB; `IntersectionObserver` with a CSS class is the fallback. A scroll library on a
  page that is read is in the anti-pattern list.
- **View Transitions** for a route change within the site — one API, no library.
- **Never hijack the scroll.** No pinned sections that eat five screens to say one sentence,
  no smooth-scroll override, no scroll-driven video scrub above the fold.
- `prefers-reduced-motion`: content is present and composed at rest. Not "animations play
  faster" — present, at rest, correct.

The failure to watch for: every section fading up as it enters is not choreography, it is
the same effect applied fourteen times, and it reads as a template on sight.

## The ask

- **One primary CTA**, repeated verbatim wherever it appears. Same words, same color, same
  meaning. `copy.md`: the button that says "Start building" leads to a page that says
  "Start building".
- **Say what happens next.** "No card required", "You'll be building in about two minutes",
  "We reply within a day" — one line under the button, and it must be true.
- **The form is the conversion**, so it gets the same craft as any product surface: real
  labels, `autocomplete` tokens, `inputmode`, validation on blur, errors as text linked with
  `aria-describedby`, a submit state that cannot be double-fired, and a success state that
  is a page, not a toast that disappears. Full matrix in `../quality/floor.md`.
- **Every field costs conversions.** Ask for what is needed to deliver the next step and
  nothing else. A field that exists for a CRM is a field that costs signups.
- The CTA is reachable by keyboard as the first meaningful stop after the skip link.

## Metadata is part of the design

The first impression is usually not the page — it is a link preview in a chat.

- `<title>`: the claim, not the company name repeated.
- `meta description`: the subhead, written for a person, not for a crawler.
- Open Graph image: 1200×630, real, legible at 300 px wide in a chat sidebar. Generate it
  from the same tokens as the page. An unset OG image is a grey box with a URL in it.
- `og:title`, `og:description`, `twitter:card=summary_large_image`, canonical URL, favicon
  and apple-touch-icon, `theme-color` for both schemes.
- One `h1`, and it is the claim.

## Performance shape

Landing pages have the tightest budget in the plugin because the visitor is on mobile, on a
cold cache, and unconvinced. From `../quality/engineering.md`: LCP ≤ 2.0 s, initial JS ≤ 100
KB gz, fonts ≤ 100 KB total.

- Above the fold ships as HTML and CSS. Anything below it is deferred, lazy, or both.
- Static or prerendered by default. A landing page that needs a client render to show its
  claim has already lost the argument it was about to make.
- One display face, subset to the glyphs the headline uses, with the metric-matched
  fallback. A 200 KB display face on a page whose job is one sentence is the most common
  self-inflicted budget breach here.

## Anti-structures

Beyond the banned defaults in `originality.md`, these are landing-page-specific:

- **The feature list as a page.** Six cards with icons, each naming a capability, none
  naming a person or a job. Features are evidence for a claim, not a substitute for one.
- **The tour.** A pinned scroll sequence explaining what one paragraph and one screenshot
  explain faster.
- **The wall of trust.** Logos, ratings, badges and counts stacked to substitute for a
  mechanism nobody explained.
- **The dark CTA band.** A full-bleed inverted section at the bottom, present because every
  template has one, saying "Ready to get started?" — which is not a claim, an objection, or
  an action.
- **Two equal primary buttons.** The page could not decide, so the visitor does not either.
- **The FAQ as a graveyard.** The real objection buried in an accordion at position eleven.

## Before calling it done

Beyond `../quality/floor.md`:

- The five argument lines exist and CLAIM passes the swap test.
- A screenshot of the first screen at 390 px answers what / for me / next.
- Every number, quote, logo and count on the page is real and attributable.
- One primary action, one wording, everywhere.
- The form has been submitted, including with an error, and the success state was seen.
- Link preview checked: title, description and OG image rendered at chat size.
- Rubric scored on the rendered page, not the source — `../quality/floor.md`.
