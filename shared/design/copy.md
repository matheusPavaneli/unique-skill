# Copy: words as design material

Words exist in an interface for one reason: to make it easier to understand, and therefore
easier to use. Generic copy makes a design feel templated no matter how good the type is.
Bring the same intentionality here as to spacing and color.

**Write the words before the layout.** Not as a step in the build — as an input to it. The
real headline, the real labels, the real empty state and the real error strings exist before
the grid is set, because "design to the copy, do not cut the copy to fit" is only possible in
that order. A layout built around placeholder-shaped text gets placeholder-shaped proportions,
and no amount of later editing recovers them.

## Before writing

Ask what this screen needs to say, and how it can best be said to help the person navigate.
If the brief has no real content, write real content for the real subject — never lorem
ipsum, never "Lorem Feature", never invented numbers, testimonials, customer names, or
logos presented as real. Fabricated social proof is a defect, not a placeholder.

## Voice

- **Write from the user's side of the screen.** Name things by what people control and
  recognize, not by how the system is built. A person manages notifications, not webhook
  configuration.
- **Active voice, plain verbs.** A control says exactly what happens: "Save changes", not
  "Submit". "Delete project", not "Confirm".
- **Same name through the whole flow.** The button that says "Publish" produces a toast
  that says "Published". Vocabulary is signposting; consistency is how people learn a
  product.
- **Specific beats clever.** "Syncs every 15 minutes" beats "Always up to date".
- **Sentence case** for labels, buttons, headings, and menu items, unless the existing
  system says otherwise. Title Case Everywhere reads as a template.
- **One job per element.** A label labels, an example demonstrates, helper text helps.
  Nothing quietly does double duty.
- No filler, no exclamation marks in system voice, no apologizing errors, no "Oops!".

## Errors and empty states

These are direction, not mood.

- Errors say what happened and what to do next, in the interface's voice. Never a raw
  exception, never "Something went wrong" alone, never blame the user.
- Empty states are an invitation to act: what belongs here, why it is worth having, and the
  control that creates the first one.
- Loading text, when present, says what is loading.
- Success is confirmed in the same words as the action.

## Marketing copy

- The headline makes one claim, concretely. If it would work for a competitor unchanged, it
  is not a headline — apply the swap test from `originality.md`.
- Subhead does the work the headline could not carry; it is not a restatement.
- Feature blocks: what it does, for whom, why it matters. Not three adjectives.
- Verbs from the subject's own vernacular beat generic SaaS verbs (streamline, empower,
  unlock, leverage, seamlessly, revolutionize, game-changing, cutting-edge).
- Length is a design constraint: write to the space, and set the space to the writing.
  Check the longest realistic string, not the one that fits.

## Microcopy checklist

- Buttons: verb + object, ≤ 3 words where possible.
- Placeholders: an example of a valid value, never a substitute label.
- Helper text: persistent when the rule is non-obvious (password rules shown before typing,
  not after failing).
- Tooltips: never the only place information exists.
- Dates and numbers: locale-aware formatting, relative time only where recency is the point,
  absolute time in a title attribute.
- Truncation: cut at a meaningful boundary and expose the full value on hover and focus.
