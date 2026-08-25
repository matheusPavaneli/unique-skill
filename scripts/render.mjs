#!/usr/bin/env node
// Screenshot a served surface at the three widths the rubric is scored against.
//
// The render pass in shared/quality/floor.md is the step that separates this plugin from a
// prompt, and it had one escape hatch — "no browser tool in this environment" — which was
// also the cheapest path, so it became the default path. Design read as source is judged
// against what the reader expects source to produce, which is the same distribution the
// banned defaults came from. This script removes the excuse: Playwright is fetched on
// demand through npx, so "no browser" means "the network refused", not "nobody looked".
//
// Usage: node scripts/render.mjs <url> [out-dir] [--widths 390,768,1440] [--no-install]
// Node builtins only.

import { spawnSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/** The three widths the rubric is scored at. Changing these changes the rubric. */
export const VIEWPORTS = Object.freeze([
  Object.freeze({ label: '390', width: 390, height: 844 }),
  Object.freeze({ label: '768', width: 768, height: 1024 }),
  Object.freeze({ label: '1440', width: 1440, height: 900 }),
]);

/** Compliance widths from floor.md. Captured too — 320 and 200 % zoom fail silently otherwise. */
export const COMPLIANCE = Object.freeze([
  Object.freeze({ label: '320', width: 320, height: 844 }),
  Object.freeze({ label: '1440-zoom200', width: 720, height: 900, scale: 2 }),
]);

export function parseArgs(argv) {
  const rest = [];
  let widths = null;
  let install = true;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--widths') {
      widths = argv[i + 1] ?? '';
      i += 1;
    } else if (arg.startsWith('--widths=')) {
      widths = arg.slice('--widths='.length);
    } else if (arg === '--no-install') {
      install = false;
    } else {
      rest.push(arg);
    }
  }
  return { url: rest[0] ?? null, outDir: rest[1] ?? '.unique/render', widths, install };
}

/**
 * Resolve a --widths list against the known viewports, keeping their heights.
 * An unknown width gets a 16:9-ish height rather than being dropped: a width the author
 * asked for and did not get is a silent hole in the evidence.
 */
export function resolveViewports(spec) {
  if (!spec) return [...VIEWPORTS, ...COMPLIANCE];
  const wanted = spec
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (wanted.length === 0) throw new Error(`--widths "${spec}" contains no usable width`);
  return wanted.map((width) => {
    const known = [...VIEWPORTS, ...COMPLIANCE].find((v) => v.width === width && !v.scale);
    return known ?? { label: String(width), width, height: Math.round(width * 0.62) + 400 };
  });
}

/**
 * Build the Playwright CLI arguments for one shot.
 * `--full-page` is not optional: the rubric scores composition and section rhythm, and a
 * viewport crop hides exactly the part that goes generic below the fold.
 */
export function shotArgs(url, file, viewport) {
  const args = [
    'screenshot',
    '--full-page',
    `--viewport-size=${viewport.width},${viewport.height}`,
  ];
  if (viewport.scale) args.push(`--device-scale-factor=${viewport.scale}`);
  args.push('--wait-for-timeout=1200', url, file);
  return args;
}

export function fileFor(outDir, viewport) {
  return join(outDir, `${viewport.label}.png`);
}

/**
 * How to invoke Playwright, in the order of preference floor.md states: the project's own
 * install first, so the version under test is the version already pinned.
 */
export function pickRunner({ localBinary, allowInstall }) {
  if (localBinary) return { command: localBinary, prefix: [] };
  if (allowInstall) return { command: 'npx', prefix: ['--yes', 'playwright@latest'] };
  return null;
}

function localPlaywright(cwd) {
  const bin = process.platform === 'win32' ? 'playwright.cmd' : 'playwright';
  const path = resolve(cwd, 'node_modules', '.bin', bin);
  return existsSync(path) ? path : null;
}

/** A dev server that is not up yet produces three screenshots of an error page. */
export async function waitForServer(url, { timeoutMs = 20000, now = () => Date.now(), sleep } = {}) {
  const pause = sleep ?? ((ms) => new Promise((done) => setTimeout(done, ms)));
  const deadline = now() + timeoutMs;
  let lastError = 'no attempt made';
  while (now() < deadline) {
    try {
      const response = await fetch(url, { redirect: 'follow' });
      if (response.status < 500) return { up: true, status: response.status };
      lastError = `HTTP ${response.status}`;
    } catch (err) {
      lastError = err.message;
    }
    await pause(500);
  }
  return { up: false, status: null, error: lastError };
}

export function render(url, outDir, viewports, runner) {
  mkdirSync(outDir, { recursive: true });
  const shots = [];
  for (const viewport of viewports) {
    const file = fileFor(outDir, viewport);
    const result = spawnSync(runner.command, [...runner.prefix, ...shotArgs(url, file, viewport)], {
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
    });
    const failure =
      result.error?.message ??
      (result.status === 0 ? null : (result.stderr || '').trim() || `exit ${result.status}`);
    shots.push({ label: viewport.label, file, ok: failure === null, error: failure });
  }
  return shots;
}

async function main(argv) {
  const { url, outDir, widths, install } = parseArgs(argv.slice(2));
  if (!url) {
    console.error('usage: node scripts/render.mjs <url> [out-dir] [--widths 390,768,1440]');
    return 2;
  }

  let viewports;
  try {
    viewports = resolveViewports(widths);
  } catch (err) {
    console.error(err.message);
    return 2;
  }

  const runner = pickRunner({ localBinary: localPlaywright(process.cwd()), allowInstall: install });
  if (runner === null) {
    console.error('not rendered — no local playwright and --no-install was passed');
    return 3;
  }

  const server = await waitForServer(url);
  if (!server.up) {
    console.error(`not rendered — nothing served at ${url} (${server.error})`);
    return 3;
  }

  const shots = render(url, resolve(outDir), viewports, runner);
  for (const shot of shots) {
    console.log(shot.ok ? `${shot.label}  ${shot.file}` : `${shot.label}  FAILED — ${shot.error}`);
  }

  const failed = shots.filter((shot) => !shot.ok);
  if (failed.length === shots.length) {
    console.error('not rendered — playwright could not produce a single screenshot');
    return 3;
  }
  console.log(
    `\n${shots.length - failed.length}/${shots.length} rendered — now score the rubric ` +
      'against these images, not against the source',
  );
  return failed.length > 0 ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main(process.argv);
}
