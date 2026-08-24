---
name: product-brief
description: Turns a product idea into a written brief — subject, audience, surfaces, and the capability list that stack-route consumes. Use at the start of a new frontend project, a new major surface, or whenever the request is an idea ("a site for X", "an app that does Y") rather than a specific screen.
---

# product-brief

First step of the `unique` pipeline. Output is `.unique/brief.md`. Everything downstream —
stack choices, design contract, audit thresholds — cites it.

Skip this skill only when the brief already exists or the request is a single well-specified
component in an existing codebase.

## Steps

1. **Read what exists.** If `.unique/brief.md` is there, update it rather than replacing it.
   If the repo has code, read `package.json`, the framework config, and any design tokens
   before writing a line — an existing stack constrains everything and is not up for
   relitigation without a reason.

2. **Name the subject.** One concrete thing, not a category. "A rehearsal-scheduling tool
   for chamber ensembles", not "a scheduling app". If the user did not pin it, pin it
   yourself and state the guess. A vague subject produces generic everything downstream —
   this is the single highest-leverage line in the file.

3. **Name the audience and the primary job.** Who opens this, how often, on what device,
   under what pressure. Daily professional use and a once-a-year visit produce opposite
   designs and opposite stacks.

4. **List the surfaces.** Each one gets a type — `marketing`, `product`, `editorial`,
   `auth`, `admin` — because the type decides the design mode later. Mark which surface is
   the first one to build.

5. **Extract capabilities.** The heart of this step. Walk the surfaces and name every
   capability the product actually needs, phrased as a job, not as a library:

   > "particles that react to the cursor and settle into the logo", not "use three.js".

   Cover: visualization, 3D or generative graphics, motion and scroll behavior, text
   editing, drawing or canvas, media (video, audio, image), maps, tables and large lists,
   forms of real complexity, realtime or collaboration, AI streaming UI, offline, auth,
   payments, i18n, notifications, search, file handling, export.

   For each, mark the role — this is what stack-route budgets against:
   - `core` — the product's value depends on it; it is why someone shows up.
   - `supporting` — needed and expected; must be solid, not remarkable.
   - `decorative` — atmosphere; the product works without it.

   Most products have one or two `core` capabilities. Three or more usually means the
   product is not scoped yet — say so.

6. **Record the constraints.** Team and existing stack, target devices and networks,
   browser floor, accessibility obligation (public sector / enterprise procurement raise
   this), SEO need, deploy target, deadline, and anything explicitly forbidden.

7. **Write `.unique/brief.md`.** Format in `${CLAUDE_PLUGIN_ROOT}/shared/artifacts.md`.
   Keep it under a page. Every unknown is written down as an open question rather than
   silently guessed twice.

8. **Hand off.** State the next command: `stack-route` when capabilities need technical
   decisions, `frontend-design` directly when the product is plain CRUD on a known stack.

## Rules

- Guess and state, do not interrogate. One round of clarification at most, and only for
  something that changes the work materially.
- No invented metrics, users, or competitors in the brief. Unknown is a valid value.
- If the user's idea has a real problem — the capability list is impossible on the stated
  budget, the audience contradicts the platform — say it in two sentences and continue.
  Scoping down is their call, not yours.
