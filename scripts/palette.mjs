#!/usr/bin/env node
// Derive a palette from one provenance fact and emit it as tokens, gamut-mapped and
// contrast-checked before a line of CSS is written.
//
// shared/design/craft.md gives the six-step derivation, and the model was executing it in
// its head: inventing oklch() values, guessing whether an accent cleared 4.5:1, and quietly
// landing outside sRGB. Guessed colors converge on the colors the model has seen most,
// which is banned default #4 under a new name. This runs the procedure arithmetically —
// the only judgement left is step 1, the fact.
//
// Usage: node scripts/palette.mjs <spec.json> [--css]
// Node builtins only.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import {
  oklchToSrgb,
  parseColor,
  checkPairs,
  formatResult,
  contrastRatio,
  linearFromOklch,
  linearInGamut,
} from './contrast.mjs';

/**
 * Ground lightness per scheme, from craft.md step 2. A ground outside these bands is either
 * a white page or a mid-grey; both read as "no decision was made".
 */
export const GROUND = Object.freeze({
  light: Object.freeze({ lightness: 0.975, ink: 0.19 }),
  dark: Object.freeze({ lightness: 0.15, ink: 0.94 }),
});

/** Ground and ink carry the fact's hue at low chroma. Above this the tint stops being a tint. */
export const GROUND_CHROMA_MAX = 0.02;

/** Perceptual ramp stops. Even lightness steps, because OKLCH lightness is perceptual. */
export const RAMP = Object.freeze([0.97, 0.92, 0.85, 0.75, 0.64, 0.54, 0.44, 0.34, 0.24, 0.16]);

const toHex = ({ r, g, b }) =>
  `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;

/** oklch(L C H) as a CSS string, rounded to what is worth writing down. */
export function oklch(lightness, chroma, hue) {
  const l = Math.round(lightness * 1000) / 10;
  const c = Math.round(chroma * 10000) / 10000;
  const h = Math.round(((((hue % 360) + 360) % 360) * 10)) / 10;
  return `oklch(${l}% ${c} ${h})`;
}

export function hex(lightness, chroma, hue) {
  return toHex(oklchToSrgb(lightness, chroma, hue));
}

/**
 * Accent hue from the ground hue by angle, never by taste (craft.md step 4).
 * `related` sits a step around the wheel; `contrast` sits across it. Both are derived from
 * the ground, so the accent belongs to the same world as the page it acts on.
 */
export const ACCENT_ANGLE = Object.freeze({ related: 45, contrast: 180 });

/**
 * Search the lightness that clears a required ratio against *every* ground the color can
 * sit on, keeping hue and chroma. Returns the first lightness at or past the requested one
 * that passes all of them, or null when the chroma is simply too high to ever measure.
 *
 * All grounds, not the nearest one: a focus ring fitted to the page ground and then painted
 * on a card disappears exactly where overlays put it, and that is the case nobody screenshots.
 */
export function fitLightness({ hue, chroma, grounds, required, prefer, scheme }) {
  const against = Array.isArray(grounds) ? grounds : [grounds];
  const direction = scheme === 'dark' ? 1 : -1;
  for (let step = 0; step <= 60; step += 1) {
    const lightness = prefer + direction * step * 0.01;
    if (lightness <= 0.06 || lightness >= 0.99) break;
    const candidate = hex(lightness, chroma, hue);
    if (against.every((ground) => contrastRatio(candidate, ground) >= required)) return lightness;
  }
  return null;
}

/**
 * The most chroma sRGB will actually paint at this lightness and hue.
 *
 * craft.md says to set the accent's chroma "as high as the palette will carry", and the
 * ceiling is a real number, not a preference: ask for more and the browser paints something
 * else, which quietly changes the contrast the checker just approved. Clamping here means
 * the written token and the painted color are the same color.
 */
export function maxChroma(lightness, hue) {
  let fits = 0;
  let exceeds = 0.4;
  for (let i = 0; i < 20; i += 1) {
    const mid = (fits + exceeds) / 2;
    if (linearInGamut(linearFromOklch(lightness, mid, hue))) fits = mid;
    else exceeds = mid;
  }
  return Math.round(fits * 1000) / 1000;
}

export function normalizeSpec(raw) {
  if (raw === null || typeof raw !== 'object') {
    throw new TypeError('spec must be an object');
  }
  const { fact, hue, scheme = 'light', accent = 'related', chroma, accentChroma } = raw;
  if (typeof fact !== 'string' || fact.trim() === '') {
    throw new Error('spec.fact is required — the palette derives from a fact, not a mood');
  }
  if (!Number.isFinite(hue)) {
    throw new Error('spec.hue is required: the OKLCH hue of the thing the fact names');
  }
  if (!(scheme in GROUND)) throw new Error(`spec.scheme must be light or dark, got "${scheme}"`);
  const angle = typeof accent === 'number' ? accent : ACCENT_ANGLE[accent];
  if (!Number.isFinite(angle)) {
    throw new Error('spec.accent must be "related", "contrast", or an angle in degrees');
  }
  const groundChroma = Number.isFinite(chroma) ? chroma : 0.012;
  if (groundChroma > GROUND_CHROMA_MAX) {
    throw new Error(
      `spec.chroma ${groundChroma} exceeds ${GROUND_CHROMA_MAX} — a ground that saturated is a brand color, not a ground`,
    );
  }
  return {
    fact: fact.trim(),
    hue,
    scheme,
    angle,
    chroma: groundChroma,
    accentChroma: Number.isFinite(accentChroma) ? accentChroma : 0.16,
  };
}

/**
 * Run craft.md steps 2-6 over a normalized spec.
 * Ground and ink share the fact's hue; the accent is placed by angle and then moved in
 * lightness until it measures, rather than being picked and hoped for.
 */
export function derivePalette(rawSpec) {
  const spec = normalizeSpec(rawSpec);
  const band = GROUND[spec.scheme];

  const ground = { l: band.lightness, c: spec.chroma, h: spec.hue };
  const ink = { l: band.ink, c: Math.min(spec.chroma * 1.6, GROUND_CHROMA_MAX), h: spec.hue };
  const groundHex = hex(ground.l, ground.c, ground.h);
  const accentHue = spec.hue + spec.angle;
  const raised = {
    l: spec.scheme === 'dark' ? band.lightness + 0.05 : band.lightness - 0.035,
    c: spec.chroma,
    h: spec.hue,
  };
  // Both grounds, because a boundary token is painted on both.
  const bothGrounds = [groundHex, hex(raised.l, raised.c, raised.h)];

  const textLightness = fitLightness({
    hue: accentHue,
    chroma: spec.accentChroma,
    grounds: bothGrounds,
    required: 4.5,
    prefer: spec.scheme === 'dark' ? 0.62 : 0.55,
    scheme: spec.scheme,
  });
  const boundaryLightness = fitLightness({
    hue: accentHue,
    chroma: spec.accentChroma,
    grounds: bothGrounds,
    required: 3,
    prefer: spec.scheme === 'dark' ? 0.68 : 0.62,
    scheme: spec.scheme,
  });

  const warnings = [];
  if (textLightness === null) {
    warnings.push(
      `accent at chroma ${spec.accentChroma} never clears 4.5:1 on this ground — lower the chroma or move the ground`,
    );
  }

  const accentL = textLightness ?? (spec.scheme === 'dark' ? 0.85 : 0.35);
  const accent = {
    l: accentL,
    c: Math.min(spec.accentChroma, maxChroma(accentL, accentHue)),
    h: accentHue,
  };
  const accentUiL = boundaryLightness ?? accent.l;
  const accentUi = {
    l: accentUiL,
    c: Math.min(spec.accentChroma, maxChroma(accentUiL, accentHue)),
    h: accentHue,
  };

  const muted = {
    l: spec.scheme === 'dark' ? 0.72 : 0.42,
    c: Math.min(spec.chroma * 1.2, GROUND_CHROMA_MAX),
    h: spec.hue,
  };
  const borderChroma = Math.min(spec.chroma, GROUND_CHROMA_MAX);
  const borderLightness = fitLightness({
    hue: spec.hue,
    chroma: borderChroma,
    grounds: bothGrounds,
    required: 3,
    prefer: spec.scheme === 'dark' ? 0.36 : 0.78,
    scheme: spec.scheme,
  });
  if (borderLightness === null) {
    warnings.push('no border lightness on this hue clears 3:1 — carry structure with ground steps, not rules');
  }
  // Two border tokens, because there are two jobs. A hairline that separates two areas is
  // decorative and may be quiet; a boundary that carries meaning — an input edge, a selected
  // state, a table rule people read across — is a graphical object and owes 3:1. Emitting
  // one token for both is how the meaningful case silently ships at 1.4:1.
  const border = {
    l: spec.scheme === 'dark' ? 0.32 : 0.87,
    c: borderChroma,
    h: spec.hue,
  };
  const borderStrong = {
    l: borderLightness ?? (spec.scheme === 'dark' ? 0.36 : 0.78),
    c: borderChroma,
    h: spec.hue,
  };

  return {
    spec,
    warnings,
    tokens: { ground, raised, ink, muted, border, borderStrong, accent, accentUi },
    ramp: {
      ground: RAMP.map((l) => ({ l, c: spec.chroma, h: spec.hue })),
      accent: RAMP.map((l) => ({ l, c: spec.accentChroma, h: accentHue })),
    },
  };
}

/**
 * A categorical set: constant lightness, constant chroma, even hue intervals.
 *
 * Picked one at a time, category colors drift in weight and saturation until one of them
 * reads as the accent and the set stops meaning anything. Holding L and C constant is what
 * makes them read as peers; spacing the hues evenly is what keeps any two of them apart.
 * The set is rotated off the accent hue so a category never impersonates "act".
 */
export function deriveCategorical(palette, count) {
  if (!Number.isInteger(count) || count < 2) {
    throw new Error('a categorical set needs at least 2 members');
  }
  if (count > 8) {
    throw new Error(
      `${count} categories is past what anyone reads as a set — group them and drill down instead`,
    );
  }
  const { spec, tokens } = palette;
  const lightness = spec.scheme === 'dark' ? 0.74 : 0.5;
  const step = 360 / count;
  // Half a step off the accent, so no member lands on it.
  const origin = tokens.accent.h + step / 2;

  return Array.from({ length: count }, (unused, index) => {
    const hue = origin + index * step;
    return { l: lightness, c: Math.min(spec.accentChroma, maxChroma(lightness, hue)), h: hue };
  });
}

const ROLE_NAMES = Object.freeze({
  ground: '--surface',
  raised: '--surface-raised',
  ink: '--text',
  muted: '--text-muted',
  border: '--border',
  borderStrong: '--border-strong',
  accent: '--accent',
  accentUi: '--accent-ui',
});

export function toCss(palette) {
  const lines = [`/* derived from: ${palette.spec.fact} */`, ':root {', '  color-scheme: light dark;'];
  for (const [role, value] of Object.entries(palette.tokens)) {
    lines.push(
      `  ${ROLE_NAMES[role]}: ${oklch(value.l, value.c, value.h)};  /* ${hex(value.l, value.c, value.h)} */`,
    );
  }
  const focus = palette.tokens.accentUi;
  lines.push(`  --focus: ${oklch(focus.l, focus.c, focus.h)};`);
  lines.push('}');
  return lines.join('\n');
}

/**
 * The pairs that must pass before the palette is allowed into a build. Muted text and the
 * focus ring are here because they are where designs quietly fail, not because they are
 * interesting.
 */
export function requiredPairs({ tokens }) {
  const asHex = (v) => hex(v.l, v.c, v.h);
  return [
    { name: 'body text on ground', fg: asHex(tokens.ink), bg: asHex(tokens.ground), size: 'body' },
    { name: 'body text on raised', fg: asHex(tokens.ink), bg: asHex(tokens.raised), size: 'body' },
    { name: 'muted text on ground', fg: asHex(tokens.muted), bg: asHex(tokens.ground), size: 'body' },
    { name: 'accent text on ground', fg: asHex(tokens.accent), bg: asHex(tokens.ground), size: 'body' },
    {
      name: 'ground on accent (button label)',
      fg: asHex(tokens.ground),
      bg: asHex(tokens.accent),
      size: 'body',
    },
    {
      name: 'meaningful boundary on ground',
      fg: asHex(tokens.borderStrong),
      bg: asHex(tokens.ground),
      size: 'ui',
    },
    {
      name: 'meaningful boundary on raised',
      fg: asHex(tokens.borderStrong),
      bg: asHex(tokens.raised),
      size: 'ui',
    },
    { name: 'focus ring on ground', fg: asHex(tokens.accentUi), bg: asHex(tokens.ground), size: 'ui' },
    { name: 'focus ring on raised', fg: asHex(tokens.accentUi), bg: asHex(tokens.raised), size: 'ui' },
  ];
}

/**
 * APCA lightness contrast (Lc), the readability layer above the WCAG floor.
 *
 * WCAG 2's luminance ratio ignores size and weight and is a poor predictor at the dark end,
 * which is why a dark theme can pass AA everywhere and still read badly. APCA is a candidate
 * for WCAG 3, not an adopted standard, so it never overrides the floor — it catches the pairs
 * that are legal and hard to read. Constants are APCA-W3 0.1.9.
 */
export function apcaLc(textHex, backgroundHex) {
  const luminance = (color) => {
    const { r, g, b } = parseColor(color);
    return (
      0.2126729 * (r / 255) ** 2.4 + 0.7151522 * (g / 255) ** 2.4 + 0.072175 * (b / 255) ** 2.4
    );
  };
  const clampBlack = (y) => (y > 0.022 ? y : y + (0.022 - y) ** 1.414);

  const text = clampBlack(luminance(textHex));
  const bg = clampBlack(luminance(backgroundHex));
  if (Math.abs(bg - text) < 0.0005) return 0;

  const contrast =
    bg > text
      ? (bg ** 0.56 - text ** 0.57) * 1.14 // normal polarity: dark text on a light ground
      : (bg ** 0.65 - text ** 0.62) * 1.14; // reverse polarity: light text on a dark ground

  const offset = bg > text ? 0.027 : -0.027;
  const output = Math.abs(contrast) < 0.1 ? 0 : contrast - offset;
  return Math.round(output * 100 * 10) / 10;
}

/** Rough APCA targets per role. Advisory: the WCAG floor still decides shippability. */
export const LC_TARGET = Object.freeze({ body: 75, large: 60, ui: 45 });

function main(argv) {
  const path = argv[2];
  if (!path) {
    console.error('usage: node scripts/palette.mjs <spec.json> [--css] [--categorical <n>]');
    return 2;
  }

  let palette;
  try {
    palette = derivePalette(JSON.parse(readFileSync(path, 'utf8')));
  } catch (err) {
    console.error(err.message);
    return 2;
  }

  console.log(toCss(palette));

  const categoricalFlag = argv.indexOf('--categorical');
  let categorical = [];
  if (categoricalFlag !== -1) {
    try {
      categorical = deriveCategorical(palette, Number(argv[categoricalFlag + 1]));
    } catch (err) {
      console.error(err.message);
      return 2;
    }
    console.log('\n/* categorical set — constant lightness and chroma, even hue intervals */');
    console.log(':root {');
    categorical.forEach((value, index) => {
      console.log(
        `  --cat-${index + 1}: ${oklch(value.l, value.c, value.h)};  /* ${hex(value.l, value.c, value.h)} */`,
      );
    });
    console.log('}');
    console.log('/* hue is never the sole carrier: pair each with a shape, icon or label */');
  }

  if (argv.includes('--css')) return 0;

  const groundHex = hex(palette.tokens.ground.l, palette.tokens.ground.c, palette.tokens.ground.h);
  const pairs = [
    ...requiredPairs(palette),
    ...categorical.map((value, index) => ({
      name: `category ${index + 1} on ground`,
      fg: hex(value.l, value.c, value.h),
      bg: groundHex,
      size: 'ui',
    })),
  ];

  console.log('');
  const results = checkPairs(pairs);
  results.forEach((result, index) => {
    const pair = pairs[index];
    const lc = apcaLc(pair.fg, pair.bg);
    const target = LC_TARGET[pair.size];
    const thin =
      Math.abs(lc) < target ? `  [Lc ${lc} — under the Lc ${target} readability target]` : '';
    console.log(`${formatResult(result)}${thin}`);
  });
  for (const warning of palette.warnings) console.error(`WARN  ${warning}`);

  const failures = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failures.length}/${results.length} required pairs pass`);
  console.log('WCAG is the floor and decides shippability; Lc is the readability ceiling above it');
  return failures.length > 0 || palette.warnings.length > 0 ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv);
}
