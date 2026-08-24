import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { parseColor, contrastRatio, checkPairs, loadPairs, THRESHOLDS } from './contrast.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const script = join(here, 'contrast.mjs');

test('six-digit hex parses to its channels', () => {
  assert.deepEqual(parseColor('#767676'), { r: 0x76, g: 0x76, b: 0x76 });
});

test('three-digit hex expands to the same color as its six-digit form', () => {
  assert.deepEqual(parseColor('#fff'), parseColor('#ffffff'));
});

test('oklch parses to the same ratio as its hex equivalent', () => {
  const fromHex = contrastRatio('#000000', '#ffffff');
  const fromOklch = contrastRatio('#000000', 'oklch(100% 0 0)');
  assert.ok(
    Math.abs(fromHex - fromOklch) < 0.05,
    `expected oklch white to match hex white, got ${fromOklch} vs ${fromHex}`,
  );
});

test('oklch accepts a unitless lightness as well as a percentage', () => {
  assert.deepEqual(parseColor('oklch(1 0 0)'), parseColor('oklch(100% 0 0)'));
});

test('an unreadable color throws rather than defaulting to black', () => {
  assert.throws(() => parseColor('rebeccapurple'), /unrecognized color: rebeccapurple/);
  assert.throws(() => parseColor(null), TypeError);
  // the failure mode this guards: silently reading as #000 would make any pair look passing
  assert.notDeepEqual(
    (() => {
      try {
        return parseColor('rebeccapurple');
      } catch {
        return { r: -1, g: -1, b: -1 };
      }
    })(),
    { r: 0, g: 0, b: 0 },
  );
});

test('#767676 on white passes the 4.5:1 body threshold', () => {
  const [result] = checkPairs([{ name: 'muted', fg: '#767676', bg: '#ffffff', size: 'body' }]);
  assert.equal(result.pass, true);
  assert.ok(result.ratio >= THRESHOLDS.body, `ratio was ${result.ratio}`);
});

test('#999999 on white fails the 4.5:1 body threshold', () => {
  const [result] = checkPairs([{ name: 'muted', fg: '#999999', bg: '#ffffff', size: 'body' }]);
  assert.equal(result.pass, false);
  assert.ok(result.ratio < THRESHOLDS.body, `ratio was ${result.ratio}`);
  assert.equal(result.error, null);
});

test('a pair between 3:1 and 4.5:1 passes as large and fails as body', () => {
  const pair = { name: 'heading', fg: '#949494', bg: '#ffffff' };
  const [asLarge] = checkPairs([{ ...pair, size: 'large' }]);
  const [asBody] = checkPairs([{ ...pair, size: 'body' }]);
  assert.equal(asLarge.pass, true);
  assert.equal(asBody.pass, false);
});

test('ui boundaries use the 3:1 threshold', () => {
  const [result] = checkPairs([{ name: 'border', fg: '#949494', bg: '#ffffff', size: 'ui' }]);
  assert.equal(result.required, 3);
  assert.equal(result.pass, true);
});

test('size defaults to body when omitted', () => {
  const [result] = checkPairs([{ name: 'text', fg: '#999999', bg: '#ffffff' }]);
  assert.equal(result.size, 'body');
  assert.equal(result.pass, false);
});

test('an unknown size is a failing result naming the allowed values', () => {
  const [result] = checkPairs([{ name: 'x', fg: '#000', bg: '#fff', size: 'huge' }]);
  assert.equal(result.pass, false);
  assert.match(result.error, /unknown size "huge"/);
});

test('an unreadable color inside a pair fails that pair and carries the reason', () => {
  const [result] = checkPairs([{ name: 'brand', fg: 'not-a-color', bg: '#ffffff' }]);
  assert.equal(result.pass, false);
  assert.equal(result.ratio, null);
  assert.match(result.error, /unrecognized color/);
});

test('a non-array input is rejected rather than silently producing no findings', () => {
  assert.throws(() => checkPairs({ name: 'x' }), TypeError);
});

test('a missing input file names the path and preserves the cause', () => {
  try {
    loadPairs(join(here, 'does-not-exist.json'));
    assert.fail('expected loadPairs to throw');
  } catch (err) {
    assert.match(err.message, /does-not-exist\.json/);
    assert.ok(err.cause, 'expected the underlying fs error to be preserved as cause');
  }
});

test('the CLI exits non-zero when the input file is missing', () => {
  assert.throws(
    () => execFileSync(process.execPath, [script, join(here, 'nope.json')], { stdio: 'pipe' }),
    (err) => err.status === 2,
  );
});

test('the CLI exits 1 when a pair fails and 0 when none do', () => {
  const failing = join(tmpdir(), `contrast-fail-${process.pid}.json`);
  const passing = join(tmpdir(), `contrast-pass-${process.pid}.json`);
  writeFileSync(failing, JSON.stringify([{ name: 'muted', fg: '#999999', bg: '#ffffff' }]));
  writeFileSync(passing, JSON.stringify([{ name: 'text', fg: '#000000', bg: '#ffffff' }]));
  try {
    assert.throws(
      () => execFileSync(process.execPath, [script, failing], { stdio: 'pipe' }),
      (err) => err.status === 1,
    );
    const out = execFileSync(process.execPath, [script, passing], { encoding: 'utf8' });
    assert.match(out, /1\/1 pairs pass/);
  } finally {
    rmSync(failing, { force: true });
    rmSync(passing, { force: true });
  }
});

test('running the shipped fixture reports every pair as passing', () => {
  const results = checkPairs(loadPairs(join(here, '..', 'evals', 'cases', 'tokens.sample.json')));
  const failures = results.filter((r) => !r.pass);
  assert.deepEqual(
    failures.map((f) => f.name),
    [],
    'the fixture is the verify command; a failing pair in it would break verification',
  );
});
