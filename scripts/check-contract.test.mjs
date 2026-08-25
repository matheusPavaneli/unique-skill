import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  parseContract,
  parseProvenance,
  parseRubric,
  rubricTotal,
  RUBRIC_AXES,
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
profile: expressive
composition: 5
type: 4
color: 4
density: 4
usability: 4
signature: 5
content: 4
total: 8.6

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
    // Those modes take the functional profile, so the rubric is reweighed with them.
    const contract = VALID.replace('MODE         marketing', `MODE         ${mode}`)
      .replace('profile: expressive', 'profile: functional')
      .replace(/^total: 8\.6$/m, 'total: 8.4');
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
    '## Rubric\nprofile: expressive\ncomposition: 3\ntype: 3\ncolor: 3\ndensity: 3\n' +
      'usability: 3\nsignature: 3\ncontent: 3\ntotal: 6.0 BELOW TARGET\n',
  );
  assert.ok(errors(threes).some((m) => /3 across the board/.test(m)));
});

test('a rubric missing an axis fails, and names the migration', () => {
  const partial = VALID.replace(/^density: 4$/m, '');
  assert.ok(errors(partial).some((m) => /no score for density/.test(m)));

  for (const axis of ['usability', 'content']) {
    const dropped = VALID.replace(new RegExp(`^${axis}: 4$`, 'm'), '');
    assert.ok(
      errors(dropped).some((m) => new RegExp(`no score for ${axis}`).test(m)),
      `a five-axis rubric must fail on the missing ${axis} axis`,
    );
    assert.ok(errors(dropped).some((m) => /five-axis rubric predates/.test(m)));
  }
});

test('rubricTotal weighs the same scores differently under each profile', () => {
  const scores = new Map([
    ['composition', 5],
    ['type', 4],
    ['color', 4],
    ['density', 4],
    ['usability', 4],
    ['signature', 5],
    ['content', 4],
  ]);
  // (5+4+4+4)×0.10 + 4×0.30 + 5×0.20 + 4×0.10 = 4.3
  assert.equal(rubricTotal(scores, 'expressive'), 8.6);
  // The same page read as a product surface: signature stops paying, usability carries it.
  assert.ok(rubricTotal(scores, 'functional') < rubricTotal(scores, 'expressive'));

  const worked = new Map([
    ['composition', 4],
    ['type', 3],
    ['color', 4],
    ['density', 5],
    ['usability', 5],
    ['signature', 2],
    ['content', 4],
  ]);
  // (4+3+4+5)×0.075 + 5×0.45 + 2×0.10 + 4×0.15 = 4.25 — the worked example in floor.md
  assert.equal(rubricTotal(worked, 'functional'), 8.5);
});

test('a total landing exactly on a half rounds up, not down', () => {
  // 0.075 and 0.45 are not binary-representable: accumulated as floats this set lands at
  // 8.249999999999998 and rounds to 8.2, so a contract that wrote the 8.3 floor.md asks for
  // would be failed for not following from its own scores.
  const half = new Map([
    ['composition', 3],
    ['type', 3],
    ['color', 3],
    ['density', 4],
    ['usability', 5],
    ['signature', 3],
    ['content', 4],
  ]);
  assert.equal(rubricTotal(half, 'functional'), 8.3);
});

test('no score set can produce a total the checker would reject as unroundable', () => {
  // Brute force is cheap here (5^7 per profile) and it is the only honest way to claim the
  // arithmetic agrees with a person doing it by hand for every rubric that can be written.
  for (const profile of ['expressive', 'functional']) {
    for (let n = 0; n < 5 ** 7; n += 1) {
      let rest = n;
      const scores = new Map();
      for (const axis of RUBRIC_AXES) {
        scores.set(axis, (rest % 5) + 1);
        rest = Math.floor(rest / 5);
      }
      const total = rubricTotal(scores, profile);
      assert.equal(Math.round(total * 10) / 10, total, `${profile} ${n} produced ${total}`);
    }
  }
});

test('a quiet budget stops paying for the signature axis it told you not to spend on', () => {
  const quiet = new Map([
    ['composition', 4],
    ['type', 4],
    ['color', 4],
    ['density', 4],
    ['usability', 4],
    ['signature', 2],
    ['content', 4],
  ]);
  // Weighed normally this is 7.2 — permanently below target for obeying its own budget.
  assert.equal(rubricTotal(quiet, 'expressive'), 7.2);
  assert.equal(rubricTotal(quiet, 'expressive', 'quiet'), 8);

  // The released weight is moved, never dropped: the weights still sum to 1.
  const fives = new Map(RUBRIC_AXES.map((axis) => [axis, 5]));
  assert.equal(rubricTotal(fives, 'expressive', 'quiet'), 10);
  assert.equal(rubricTotal(fives, 'functional', 'quiet'), 10);
});

test('rubricTotal has no answer for a partial rubric', () => {
  const partial = new Map([['composition', 4]]);
  assert.equal(rubricTotal(partial, 'expressive'), null);
});

test('a rubric with no total fails — nothing to compare the next pass against', () => {
  const noTotal = VALID.replace(/^total: 8\.6$/m, '');
  assert.ok(errors(noTotal).some((m) => /no "total:"/.test(m)));
});

test('a total that does not follow from its own scores fails', () => {
  const inflated = VALID.replace(/^total: 8\.6$/m, 'total: 9.4');
  assert.ok(errors(inflated).some((m) => /does not follow from its own scores/.test(m)));

  const rounded = VALID.replace(/^total: 8\.6$/m, 'total: 8.62');
  assert.deepEqual(errors(rounded), [], 'within 0.05 is the same score written differently');
});

test('a total below target warns unless it is already marked BELOW TARGET', () => {
  const weak = VALID.replace(/^usability: 4$/m, 'usability: 1').replace(/^total: 8\.6$/m, 'total: 6.8');
  assert.deepEqual(errors(weak), [], 'an honest low score is not an error');
  assert.ok(warnings(weak).some((m) => /below the 8\.0 target/.test(m)));

  const declared = weak.replace(/^total: 6\.8$/m, 'total: 6.8 BELOW TARGET');
  assert.equal(
    warnings(declared).some((m) => /below the 8\.0 target/.test(m)),
    false,
    'a score already reported as below target does not need to be told twice',
  );
});

test('the annotation on the template line cannot silence the below-target warning', () => {
  const annotated = VALID.replace(/^usability: 4$/m, 'usability: 1').replace(
    /^total: 8\.6$/m,
    'total: 6.8',
  );
  const kept = annotated.replace(
    'total: 6.8',
    'total: 6.8   (target 8.0; append " BELOW TARGET" when under)',
  );
  assert.ok(
    warnings(kept).some((m) => /below the 8\.0 target/.test(m)),
    'the marker only counts on the total line, not anywhere in the section',
  );
});

test('a rubric profile that contradicts MODE fails', () => {
  const wrong = VALID.replace('profile: expressive', 'profile: functional');
  assert.ok(errors(wrong).some((m) => /contradicts MODE marketing/.test(m)));

  // MODE stays the authority for the recomputation: a contract that records the wrong
  // profile and a total computed under it must not have that total validated as correct.
  const inflated = VALID.replace('MODE         marketing', 'MODE         product-surface');
  assert.ok(errors(inflated).some((m) => /the functional profile gives 8\.4/.test(m)));

  const unknown = VALID.replace('profile: expressive', 'profile: jury');
  assert.ok(errors(unknown).some((m) => /is not expressive \| functional/.test(m)));
});

test('an omitted profile is derived from MODE rather than failing', () => {
  const implied = VALID.replace(/^profile: expressive$/m, '');
  assert.deepEqual(errors(implied), []);
});

test('the rubric parses table rows as well as plain lines', () => {
  const { scores } = parseRubric(['| Composition | 4 |', 'type: 5', 'color | 2']);
  assert.equal(scores.get('composition'), 4);
  assert.equal(scores.get('type'), 5);
  assert.equal(scores.get('color'), 2);
});

test('a high signature score on a product surface is flagged as a defect', () => {
  const product = VALID.replace('MODE         marketing', 'MODE         product-surface')
    .replace('profile: expressive', 'profile: functional')
    .replace(/^total: 8\.6$/m, 'total: 8.4');
  assert.ok(warnings(product).some((m) => /record that as a defect/.test(m)));
});

test('a measured budget with nothing loud is flagged as an unspent budget', () => {
  const flat = VALID.replace(/^signature: 5$/m, 'signature: 2').replace(
    /^total: 8\.6$/m,
    'total: 7.4 BELOW TARGET',
  );
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
