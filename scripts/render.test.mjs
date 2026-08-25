import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  parseArgs,
  resolveViewports,
  shotArgs,
  fileFor,
  pickRunner,
  waitForServer,
  VIEWPORTS,
  COMPLIANCE,
} from './render.mjs';

test('a bare url takes the default out-dir and the full viewport set', () => {
  const parsed = parseArgs(['http://localhost:3000']);
  assert.equal(parsed.url, 'http://localhost:3000');
  assert.equal(parsed.outDir, '.unique/render');
  assert.equal(parsed.widths, null);
  assert.equal(parsed.install, true);
});

test('--widths is accepted in both spellings, and --no-install is honored', () => {
  assert.equal(parseArgs(['u', '--widths', '390,1440']).widths, '390,1440');
  assert.equal(parseArgs(['u', '--widths=390']).widths, '390');
  assert.equal(parseArgs(['u', '--no-install']).install, false);
  assert.equal(parseArgs(['u', '--no-install', 'out']).outDir, 'out');
});

test('the default set covers the three rubric widths plus the two compliance cases', () => {
  const viewports = resolveViewports(null);
  assert.deepEqual(
    viewports.map((v) => v.label),
    [...VIEWPORTS, ...COMPLIANCE].map((v) => v.label),
  );
  assert.ok(viewports.some((v) => v.width === 320), '320 px reflow is not optional');
  assert.ok(viewports.some((v) => v.scale === 2), '200 % zoom is not optional');
});

test('a requested width keeps its known height, and an unknown one still gets captured', () => {
  const [known] = resolveViewports('768');
  assert.deepEqual(known, VIEWPORTS.find((v) => v.width === 768));
  const [unknown] = resolveViewports('900');
  assert.equal(unknown.width, 900);
  assert.ok(unknown.height > 0, 'a width the author asked for is never dropped');
});

test('a --widths list with no usable number is an error, not an empty run', () => {
  assert.throws(() => resolveViewports('wide'), /no usable width/);
  assert.throws(() => resolveViewports('0'), /no usable width/);
});

test('every shot is full-page — a viewport crop hides where the page goes generic', () => {
  const args = shotArgs('http://x', 'a.png', VIEWPORTS[0]);
  assert.ok(args.includes('--full-page'));
  assert.ok(args.includes('--viewport-size=390,844'));
  assert.equal(args.at(-2), 'http://x');
  assert.equal(args.at(-1), 'a.png');
});

test('a scaled viewport passes the device scale factor through', () => {
  const zoom = COMPLIANCE.find((v) => v.scale === 2);
  assert.ok(shotArgs('http://x', 'a.png', zoom).includes('--device-scale-factor=2'));
});

test('screenshots are named by their label', () => {
  assert.match(fileFor('out', VIEWPORTS[2]), /1440\.png$/);
});

test('a local playwright wins over npx, and --no-install with neither is refused', () => {
  assert.deepEqual(pickRunner({ localBinary: '/bin/playwright', allowInstall: true }), {
    command: '/bin/playwright',
    prefix: [],
  });
  assert.deepEqual(pickRunner({ localBinary: null, allowInstall: true }), {
    command: 'npx',
    prefix: ['--yes', 'playwright@latest'],
  });
  assert.equal(pickRunner({ localBinary: null, allowInstall: false }), null);
});

test('waitForServer accepts any non-5xx response — a 404 route still renders', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => ({ status: 404 });
  try {
    assert.deepEqual(await waitForServer('http://x'), { up: true, status: 404 });
  } finally {
    globalThis.fetch = original;
  }
});

test('waitForServer gives up with the last error rather than screenshotting nothing', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error('ECONNREFUSED');
  };
  let clock = 0;
  try {
    const result = await waitForServer('http://x', {
      timeoutMs: 1000,
      now: () => (clock += 400),
      sleep: async () => {},
    });
    assert.equal(result.up, false);
    assert.match(result.error, /ECONNREFUSED/);
  } finally {
    globalThis.fetch = original;
  }
});
