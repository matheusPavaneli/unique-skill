import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  parseContract,
  parseProvenance,
  parseRubric,
  parseLog,
  checkContract,
  checkLog,
} from './check-contract.mjs';

const VALID = `# kiln — design contract

SUBJECT      a scheduling tool for small ceramics studios
MODE         marketing
ORIGINALITY  signature
BUDGET       measured
SIGNATURE    the firing schedule rendered as a cone chart

## Tokens
color    --surface oklch(97.5% 0.012 55) · --accent oklch(54% 0.16 235)
type     display Fraunces · body Source Serif

## Directions
A  cone chart   COLOR <- cobalt oxide wash · TYPE <- glaze recipe cards · LAYOUT <- firing schedule · SIGNATURE <- pyrometric cones
B  wheel        COLOR <- wet slip grey · TYPE <- studio inventory tags · LAYOUT <- throwing sequence · SIGNATURE <- centred spiral
C  shelf map    COLOR <- shelf plywood · TYPE <- kiln manual · LAYOUT <- kiln shelf packing · SIGNATURE <- packing diagram
KILL B — the studio books the kiln, not the wheel; the sequence they schedule is the firing
KILL C — packing is done at the kiln, not on a phone, and this is a phone-first booking flow

## Grid
PATH     the cone chart, then the next firing slot, then the book action
DENSITY  the schedule table is dense; the hero and the confirmation are near-empty
COLUMNS  9/3 asymmetric, held for the whole page
MEASURE  66ch body, 38ch sidenotes
RHYTHM   28px baseline unit, section padding 4x and 8x
BLEED    the cone chart only, full viewport above 768px

## Components
RECOGNIZED  the schedule row, the cone gauge, the book control
INTERACTION reveal — hovering a slot shows the firing curve and the hold time
CONTROL     44px, comfortable; the schedule table drops to a 32px row
CORNER      0px — kiln shelves and pyrometric cones are cut, not moulded
SEPARATION  border — hairline rules divide, grounds stay flat, nothing is elevated
FOCUS       --focus, 2px wide at 2px offset, 3:1 against both the row and the ground

## Provenance
COLOR      clay + oxide blue   <- unfired earthenware against a cobalt oxide wash
TYPE       Fraunces + Source Serif   <- the glaze recipe cards pinned above the wheel
LAYOUT     anchored spine   <- a firing schedule is a sequence with fixed hold points
SIGNATURE  cone chart   <- pyrometric cones bend at a known temperature

## Rubric
composition: 4
type: 4
color: 4
density: 3
signature: 4

## Rejected
- dark ground with an acid accent — registry #2, and unfired clay is not dark
- a grid of feature tiles — the content is one sequence, not six parts
`;

const errors = (text) => checkContract(text).filter((f) => f.level === 'error').map((f) => f.message);
const warnings = (text) => checkContract(text).filter((f) => f.level === 'warn').map((f) => f.message);
const without = (section) => VALID.replace(new RegExp(`## ${section}[\\s\\S]*?(?=\\n## |$)`), '');

test('a complete signature contract passes with no errors', () => {
  assert.deepEqual(errors(VALID), []);
});

test('the five contract lines are parsed out of the header, not the sections', () => {
  const { fields, sections } = parseContract(VALID);
  assert.equal(fields.MODE, 'marketing');
  assert.equal(fields.ORIGINALITY, 'signature');
  assert.equal(fields.BUDGET, 'measured');
  assert.ok(sections.has('grid'));
  assert.ok(sections.has('provenance'));
});

test('a missing contract line is a failure', () => {
  const missing = VALID.replace(/^BUDGET.*$/m, '');
  assert.ok(errors(missing).some((m) => /missing BUDGET/.test(m)));
});

test('an out-of-vocabulary mode or budget is a failure', () => {
  assert.ok(errors(VALID.replace('marketing', 'landing')).some((m) => /MODE "landing"/.test(m)));
  assert.ok(errors(VALID.replace('measured', 'medium')).some((m) => /BUDGET "medium"/.test(m)));
});

test('a contract with no grid section fails — layout is the axis with nothing to check', () => {
  assert.ok(errors(without('Grid')).some((m) => /missing "## Grid" section/.test(m)));
});

test('a grid section missing any of its six lines fails', () => {
  const noMeasure = VALID.replace(/^MEASURE.*$/m, '');
  assert.ok(errors(noMeasure).some((m) => /no MEASURE line/.test(m)));
});

test('a grid with no reading path or density map fails', () => {
  assert.ok(errors(VALID.replace(/^PATH.*$/m, '')).some((m) => /no PATH line/.test(m)));
  assert.ok(errors(VALID.replace(/^DENSITY.*$/m, '')).some((m) => /no DENSITY line/.test(m)));
});

test('a contract with no components section fails — the tokens land on a default grammar', () => {
  assert.ok(errors(without('Components')).some((m) => /missing "## Components" section/.test(m)));
});

test('a components section missing any of its six lines fails', () => {
  const noCorner = VALID.replace(/^CORNER.*$/m, '');
  assert.ok(errors(noCorner).some((m) => /no CORNER line/.test(m)));
  const noSeparation = VALID.replace(/^SEPARATION.*$/m, '');
  assert.ok(errors(noSeparation).some((m) => /no SEPARATION line/.test(m)));
});

test('a components key with nothing after it is a heading, not a decision', () => {
  const empty = VALID.replace(/^FOCUS.*$/m, 'FOCUS');
  assert.ok(errors(empty).some((m) => /components FOCUS has no value/.test(m)));

  const blank = VALID.replace(/^INTERACTION.*$/m, 'INTERACTION   ');
  assert.ok(errors(blank).some((m) => /components INTERACTION has no value/.test(m)));
});

test('a components block with no measurements in it fails, like a grid with no numbers', () => {
  const vague = VALID.replace(
    /## Components[\s\S]*?(?=\n## )/,
    [
      '## Components',
      'RECOGNIZED  the schedule row, the cone gauge, the book control',
      'INTERACTION reveal — hovering a slot shows the firing curve',
      'CONTROL     comfortable',
      'CORNER      soft',
      'SEPARATION  border',
      'FOCUS       a clearly visible ring',
      '',
    ].join('\n'),
  );
  assert.ok(errors(vague).some((m) => /components section contains no numbers/.test(m)));
});

test('the components gate is not scoped by mode — native and prototype fail too', () => {
  for (const mode of ['native', 'prototype']) {
    const contract = without('Components').replace('MODE         marketing', `MODE         ${mode}`);
    assert.ok(
      errors(contract).some((m) => /missing "## Components" section/.test(m)),
      `${mode} should still require the components block`,
    );
  }
});

test('a complete components block passes, at every mode', () => {
  assert.deepEqual(errors(VALID), []);
  for (const mode of ['native', 'prototype']) {
    const contract = VALID.replace('MODE         marketing', `MODE         ${mode}`);
    assert.deepEqual(errors(contract), []);
  }
});

test('a signature contract with no directions section fails', () => {
  assert.ok(errors(without('Directions')).some((m) => /no "## Directions" section/.test(m)));
});

test('fewer than three directions is a single-candidate process', () => {
  const two = VALID.replace(/^C  shelf map.*$/m, '');
  assert.ok(errors(two).some((m) => /2 direction\(s\) recorded/.test(m)));
});

test('fewer than two kill lines fails', () => {
  const one = VALID.replace(/^KILL C.*$/m, '');
  assert.ok(errors(one).some((m) => /fewer than two KILL lines/.test(m)));
});

test('a kill made on taste rather than on the brief fails', () => {
  const taste = VALID.replace(/^KILL B.*$/m, 'KILL B — less elegant');
  assert.ok(errors(taste).some((m) => /is taste, not a reason from the brief/.test(m)));
});

test('three readings of one fact is warned as one direction', () => {
  const same = VALID.replace(/^B  wheel.*$/m, 'B  wheel   COLOR <- cobalt oxide wash · TYPE <- cobalt oxide wash · LAYOUT <- cobalt oxide wash · SIGNATURE <- cobalt oxide wash');
  assert.ok(warnings(same).some((m) => /repeat facts/.test(m)));
});

test('a grid with no numbers in it is a mood, not a grid', () => {
  const vague = VALID.replace(
    /## Grid[\s\S]*?(?=\n## )/,
    '## Grid\nCOLUMNS  asymmetric\nMEASURE  comfortable\nRHYTHM  generous\nBLEED  where it helps\n',
  );
  assert.ok(errors(vague).some((m) => /contains no numbers/.test(m)));
});

test('a signature contract with no provenance section fails', () => {
  assert.ok(errors(without('Provenance')).some((m) => /no "## Provenance" section/.test(m)));
});

test('a provenance fact that is a mood fails, per axis', () => {
  const mood = VALID.replace(
    '<- unfired earthenware against a cobalt oxide wash',
    '<- feels premium and trustworthy',
  );
  assert.ok(errors(mood).some((m) => /provenance COLOR fact .* is a mood/.test(m)));
});

test('a provenance line with no fact at all fails', () => {
  const empty = VALID.replace('<- pyrometric cones bend at a known temperature', '<-');
  assert.ok(errors(empty).some((m) => /provenance SIGNATURE names no fact/.test(m)));
});

test('provenance parses the axis, the value and the fact separately', () => {
  const found = parseProvenance(['COLOR  clay + oxide  <- a cobalt wash on raw clay']);
  assert.deepEqual(found.get('COLOR'), { value: 'clay + oxide', fact: 'a cobalt wash on raw clay' });
});

test('a default display face carrying identity is a warning, not a failure', () => {
  const inter = VALID.replace('Fraunces + Source Serif', 'Inter + Inter');
  assert.deepEqual(errors(inter), []);
  assert.ok(warnings(inter).some((m) => /is a current default/.test(m)));
});

test('fewer than two rejected directions fails — one candidate produces the default', () => {
  const one = VALID.replace(/- a grid of feature tiles.*\n/, '');
  assert.ok(errors(one).some((m) => /fewer than two rejected/.test(m)));
  assert.ok(errors(without('Rejected')).some((m) => /missing "## Rejected"/.test(m)));
});

test('a benchmark contract needs a borrowed / invented block with something invented', () => {
  const benchmark = VALID.replace('ORIGINALITY  signature', 'ORIGINALITY  benchmark(Stripe)');
  assert.ok(errors(benchmark).some((m) => /no BORROWED \/ INVENTED block/.test(m)));

  const withBlock = `${benchmark}\n## Borrowed / invented\nBORROWED   density at high contrast from Stripe\nINVENTED   palette, from the cobalt oxide wash\n`;
  assert.deepEqual(errors(withBlock), []);

  const clone = withBlock.replace(/^INVENTED.*$/m, 'INVENTED');
  assert.ok(errors(clone).some((m) => /clone, not a benchmark/.test(m)));
});

test('a missing rubric fails, and "not scored" is a warning that must be reported', () => {
  assert.ok(errors(without('Rubric')).some((m) => /missing "## Rubric"/.test(m)));

  const unscored = VALID.replace(
    /## Rubric[\s\S]*?(?=\n## )/,
    '## Rubric\nnot scored — no browser tool in this environment\n',
  );
  assert.deepEqual(errors(unscored), []);
  assert.ok(warnings(unscored).some((m) => /delivered unverified/.test(m)));
});

test('3 across the board is recorded as the template result it is', () => {
  const threes = VALID.replace(
    /## Rubric[\s\S]*?(?=\n## )/,
    '## Rubric\ncomposition: 3\ntype: 3\ncolor: 3\ndensity: 3\nsignature: 3\n',
  );
  assert.ok(errors(threes).some((m) => /3 across the board/.test(m)));
});

test('a rubric missing an axis fails', () => {
  const partial = VALID.replace(/^density: 3$/m, '');
  assert.ok(errors(partial).some((m) => /no score for density/.test(m)));
});

test('the rubric parses table rows as well as plain lines', () => {
  const { scores } = parseRubric(['| Composition | 4 |', 'type: 5', 'color | 2']);
  assert.equal(scores.get('composition'), 4);
  assert.equal(scores.get('type'), 5);
  assert.equal(scores.get('color'), 2);
});

test('a high signature score on a product surface is flagged as a defect', () => {
  const product = VALID.replace('MODE         marketing', 'MODE         product-surface');
  assert.ok(warnings(product).some((m) => /record that as a defect/.test(m)));
});

test('a measured budget with nothing loud is flagged as an unspent budget', () => {
  const flat = VALID.replace(/^signature: 4$/m, 'signature: 2');
  assert.ok(warnings(flat).some((m) => /unspent budget/.test(m)));
});

test('a banned-default tell is a warning, but naming one as rejected is not', () => {
  const glass = VALID.replace('color    --surface', 'color    glassmorphism cards\ncolor    --surface');
  assert.ok(warnings(glass).some((m) => /banned default #6/.test(m)));
  assert.equal(
    warnings(VALID).some((m) => /banned default/.test(m)),
    false,
    'the rejected section names defaults on purpose and must not warn',
  );
});

const LOG = `## 2026-08-01 — landing
contract: marketing / signature / measured
palette: clay + oxide blue
display: Fraunces
layout device: anchored spine
signature: cone chart
rejected: dark ground

## 2026-08-20 — pricing
contract: marketing / signature / measured
palette: slip white + iron
display: Redaction
layout device: oversized index
signature: kiln log table
rejected: bento
`;

test('two entries with different triples diverge, and the log passes', () => {
  assert.deepEqual(checkLog(LOG), []);
  assert.equal(parseLog(LOG).length, 2);
});

test('a repeated triple is the convergence the log exists to catch', () => {
  const repeated = LOG.replace('palette: slip white + iron', 'palette: clay + oxide blue')
    .replace('display: Redaction', 'display: Fraunces')
    .replace('layout device: oversized index', 'layout device: anchored spine');
  const findings = checkLog(repeated);
  assert.equal(findings.length, 1);
  assert.match(findings[0].message, /repeats the triple/);
});

test('the triple comparison ignores case and spacing', () => {
  const spaced = LOG.replace('palette: slip white + iron', 'palette:  Clay  +  Oxide Blue')
    .replace('display: Redaction', 'display: FRAUNCES')
    .replace('layout device: oversized index', 'layout device: Anchored   Spine');
  assert.equal(checkLog(spaced).length, 1);
});

test('an incomplete log entry fails rather than passing by omission', () => {
  const partial = LOG.replace('display: Redaction\n', '');
  assert.ok(checkLog(partial).some((f) => /has no display line/.test(f.message)));
});
