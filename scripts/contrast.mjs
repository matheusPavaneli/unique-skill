#!/usr/bin/env node
// WCAG 2.x contrast check over a token pair list.
// Usage: node scripts/contrast.mjs <pairs.json>
// Node builtins only — this runs in the user's project, so it must add no dependency.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** Required ratio per role. `ui` covers boundaries and graphical objects that carry meaning. */
export const THRESHOLDS = Object.freeze({ body: 4.5, large: 3, ui: 3 });

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const OKLCH = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*\)$/i;

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Linear-light channel to gamma-encoded sRGB, 0-255. */
function encode(linear) {
  const v = clamp01(linear);
  const s = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  return Math.round(s * 255);
}

function linearFromOklch(lightness, chroma, hueDeg) {
  const h = (hueDeg * Math.PI) / 180;
  const a = chroma * Math.cos(h);
  const b = chroma * Math.sin(h);

  const l_ = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = lightness - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

const GAMUT_EPSILON = 1e-5;

function inGamut({ r, g, b }) {
  return [r, g, b].every((v) => v >= -GAMUT_EPSILON && v <= 1 + GAMUT_EPSILON);
}

/**
 * Convert oklch() to sRGB, reducing chroma until the color fits the gamut.
 *
 * Clamping each channel independently — which is what encode() alone does — is not what a
 * browser paints. Clipping an overflowing channel changes the luminance, and it changes it
 * in the direction that *inflates* the contrast ratio: a checker whose entire job is to not
 * lie about contrast would report a pass for a pair that fails on screen. Reducing chroma at
 * constant lightness and hue is the cheap approximation of CSS Color 4 gamut mapping, and
 * `mapped` is carried through to the report so the substitution is never silent.
 */
function fromOklch(lightness, chroma, hueDeg) {
  let linear = linearFromOklch(lightness, chroma, hueDeg);
  let mapped = false;

  if (!inGamut(linear)) {
    mapped = true;
    let fits = 0;
    let exceeds = chroma;
    for (let i = 0; i < 24; i += 1) {
      const mid = (fits + exceeds) / 2;
      if (inGamut(linearFromOklch(lightness, mid, hueDeg))) fits = mid;
      else exceeds = mid;
    }
    linear = linearFromOklch(lightness, fits, hueDeg);
  }

  return { r: encode(linear.r), g: encode(linear.g), b: encode(linear.b), mapped };
}

/**
 * oklch(L C H) to 8-bit sRGB with chroma-reduction gamut mapping, exported so the palette
 * generator paints the same colors this checker measures. One conversion, one gamut policy.
 */
export { fromOklch as oklchToSrgb, inGamut as linearInGamut, linearFromOklch };

/**
 * Parse a hex or oklch() color to 8-bit sRGB.
 * Throws rather than defaulting: a color we cannot read is a finding, not black.
 */
export function parseColor(input) {
  if (typeof input !== 'string') {
    throw new TypeError(`color must be a string, got ${typeof input}`);
  }
  const value = input.trim();

  const hex = HEX.exec(value);
  if (hex) {
    const digits = hex[1];
    const full =
      digits.length === 3
        ? digits
            .split('')
            .map((d) => d + d)
            .join('')
        : digits;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
      mapped: false,
    };
  }

  const ok = OKLCH.exec(value);
  if (ok) {
    const raw = Number(ok[1]);
    const lightness = ok[2] === '%' ? raw / 100 : raw;
    return fromOklch(lightness, Number(ok[3]), Number(ok[4]));
  }

  throw new Error(`unrecognized color: ${input} (expected #rgb, #rrggbb or oklch(L C H))`);
}

/** WCAG relative luminance from 8-bit sRGB. */
export function relativeLuminance({ r, g, b }) {
  const lin = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

/**
 * WCAG contrast ratio plus whether either color had to be gamut-mapped to get there.
 * A mapped color is not the color that was written, so the ratio is for the color that
 * would actually be painted — and the caller is told.
 */
export function ratioWithGamut(foreground, background) {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  const a = relativeLuminance(fg);
  const b = relativeLuminance(bg);
  const [hi, lo] = a >= b ? [a, b] : [b, a];
  return { ratio: (hi + 0.05) / (lo + 0.05), mapped: fg.mapped || bg.mapped };
}

/** WCAG contrast ratio, 1 to 21, order-independent. */
export function contrastRatio(foreground, background) {
  return ratioWithGamut(foreground, background).ratio;
}

/**
 * Check a list of { name, fg, bg, size } pairs.
 * Returns one result per entry; an unreadable color becomes a failing result carrying the
 * error, never a silent skip.
 */
export function checkPairs(entries) {
  if (!Array.isArray(entries)) {
    throw new TypeError('expected an array of { name, fg, bg, size } pairs');
  }
  return entries.map((entry, index) => {
    const name = entry?.name ?? `pair ${index + 1}`;
    const size = entry?.size ?? 'body';
    const required = THRESHOLDS[size];

    if (required === undefined) {
      return { name, size, required: null, ratio: null, pass: false, mapped: false,
        error: `unknown size "${size}" (expected ${Object.keys(THRESHOLDS).join(', ')})` };
    }
    try {
      const { ratio, mapped } = ratioWithGamut(entry.fg, entry.bg);
      return { name, size, required, ratio, mapped, pass: ratio >= required, error: null };
    } catch (err) {
      return { name, size, required, ratio: null, mapped: false, pass: false, error: err.message };
    }
  });
}

export function formatResult(result) {
  const ratio = result.ratio === null ? '  —  ' : `${result.ratio.toFixed(2)}:1`;
  const mark = result.pass ? 'pass' : 'FAIL';
  const detail = result.error
    ? ` — ${result.error}`
    : result.pass
      ? ''
      : ` — needs ${result.required}:1 for ${result.size}`;
  const gamut = result.mapped ? '  [gamut-mapped: outside sRGB as written]' : '';
  return `${mark}  ${ratio}  ${result.name}${detail}${gamut}`;
}

export function loadPairs(path) {
  let raw;
  try {
    raw = readFileSync(path, 'utf8');
  } catch (err) {
    throw new Error(`cannot read ${path}`, { cause: err });
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`${path} is not valid JSON`, { cause: err });
  }
}

function main(argv) {
  const path = argv[2];
  if (!path) {
    console.error('usage: node scripts/contrast.mjs <pairs.json>');
    return 2;
  }

  let results;
  try {
    results = checkPairs(loadPairs(path));
  } catch (err) {
    console.error(err.message);
    if (err.cause) console.error(`  cause: ${err.cause.message}`);
    return 2;
  }

  if (results.length === 0) {
    console.error(`${path} contains no pairs — nothing was checked`);
    return 2;
  }

  for (const result of results) console.log(formatResult(result));

  const failures = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failures.length}/${results.length} pairs pass`);
  return failures.length > 0 ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv);
}
