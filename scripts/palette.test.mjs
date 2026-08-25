import { test } from 'node:test';
import assert from 'node:assert/strict';

import { contrastRatio } from './contrast.mjs';
import {
  derivePalette,
  normalizeSpec,
  fitLightness,
  requiredPairs,
  toCss,
  oklch,
  hex,
  GROUND_CHROMA_MAX,
  maxChroma,
  deriveCategorical,
  apcaLc,
  LC_TARGET,
} from './palette.mjs';

const clay = { fact: 'unfired earthenware body', hue: 55, scheme: 'light', accent: 'contrast' };

test('a spec without a fact is refused — the palette derives from a fact, not a mood', () => {
  assert.throws(() => normalizeSpec({ hue: 55 }), /fact is required/);
  assert.throws(() => normalizeSpec({ fact: '  ', hue: 55 }), /fact is required/);
});

test('a spec without a hue is refused', () => {
  assert.throws(() => normalizeSpec({ fact: 'clay' }), /hue is required/);
});

test('a ground chroma above the tint ceiling is refused', () => {
  assert.throws(
    () => normalizeSpec({ ...clay, chroma: GROUND_CHROMA_MAX + 0.01 }),
    /brand color, not a ground/,
  );
});

test('named accent angles and numeric angles both resolve', () => {
  assert.equal(normalizeSpec({ ...clay, accent: 'related' }).angle, 45);
  assert.equal(normalizeSpec({ ...clay, accent: 'contrast' }).angle, 180);
  assert.equal(normalizeSpec({ ...clay, accent: 210 }).angle, 210);
  assert.throws(() => normalizeSpec({ ...clay, accent: 'warm' }), /related.*contrast/);
});

test('ground and ink share the fact hue, so the page reads as one world', () => {
  const { tokens } = derivePalette(clay);
  assert.equal(tokens.ground.h, 55);
  assert.equal(tokens.ink.h, 55);
  assert.equal(tokens.border.h, 55);
});

test('the accent sits at the requested angle from the ground hue', () => {
  const { tokens } = derivePalette(clay);
  assert.equal(tokens.accent.h, 55 + 180);
});

test('a boundary is fitted against every ground it can be painted on', () => {
  const palette = derivePalette({ fact: 'phosphor terminal glass', hue: 150, scheme: 'dark' });
  const { borderStrong, ground, raised } = palette.tokens;
  const boundary = hex(borderStrong.l, borderStrong.c, borderStrong.h);
  assert.ok(contrastRatio(boundary, hex(ground.l, ground.c, ground.h)) >= 3);
  assert.ok(contrastRatio(boundary, hex(raised.l, raised.c, raised.h)) >= 3);
});

test('every required pair passes for a light palette', () => {
  const palette = derivePalette(clay);
  for (const pair of requiredPairs(palette)) {
    const required = pair.size === 'body' ? 4.5 : 3;
    const ratio = contrastRatio(pair.fg, pair.bg);
    assert.ok(ratio >= required, `${pair.name} measured ${ratio.toFixed(2)}:1, needs ${required}:1`);
  }
  assert.deepEqual(palette.warnings, []);
});

test('every required pair passes for a dark palette', () => {
  const palette = derivePalette({ fact: 'phosphor terminal glass', hue: 150, scheme: 'dark' });
  for (const pair of requiredPairs(palette)) {
    const required = pair.size === 'body' ? 4.5 : 3;
    assert.ok(contrastRatio(pair.fg, pair.bg) >= required, `${pair.name} fails`);
  }
});

test('every hue produces a palette whose text pairs measure', () => {
  for (let hue = 0; hue < 360; hue += 15) {
    for (const scheme of ['light', 'dark']) {
      const palette = derivePalette({ fact: 'a real material', hue, scheme });
      const text = requiredPairs(palette).filter((pair) => pair.size === 'body');
      for (const pair of text) {
        assert.ok(
          contrastRatio(pair.fg, pair.bg) >= 4.5,
          `hue ${hue} ${scheme}: ${pair.name} fails`,
        );
      }
    }
  }
});

test('an accent chroma beyond sRGB is clamped to what will be painted', () => {
  const palette = derivePalette({ ...clay, accentChroma: 0.4 });
  const { accent } = palette.tokens;
  assert.ok(accent.c < 0.4, 'the written chroma must be the paintable one');
  assert.ok(accent.c <= maxChroma(accent.l, accent.h) + 1e-9);
  for (const pair of requiredPairs(palette).filter((p) => p.size === 'body')) {
    assert.ok(contrastRatio(pair.fg, pair.bg) >= 4.5, `${pair.name} fails after clamping`);
  }
});

test('maxChroma finds a chroma in gamut and rejects the next step up', () => {
  const ceiling = maxChroma(0.55, 235);
  assert.ok(ceiling > 0, 'some chroma must fit');
  assert.equal(hex(0.55, ceiling, 235), hex(0.55, ceiling, 235));
  assert.ok(maxChroma(0.99, 235) < maxChroma(0.55, 235), 'near-white carries less chroma');
});

test('the decorative border is quieter than the meaningful one', () => {
  const { tokens } = derivePalette(clay);
  assert.ok(
    tokens.border.l > tokens.borderStrong.l,
    'on a light ground the hairline must be lighter than the 3:1 boundary',
  );
});

test('fitLightness returns null rather than a failing lightness', () => {
  const impossible = fitLightness({
    hue: 55,
    chroma: 0.012,
    grounds: ['#ffffff'],
    required: 21,
    prefer: 0.5,
    scheme: 'light',
  });
  assert.equal(impossible, null);
});

test('oklch() rounds to what is worth writing and normalizes the hue', () => {
  assert.equal(oklch(0.975, 0.012, 55), 'oklch(97.5% 0.012 55)');
  assert.equal(oklch(0.5, 0.16, 415), 'oklch(50% 0.16 55)');
  assert.equal(oklch(0.5, 0.16, -45), 'oklch(50% 0.16 315)');
});

test('hex output is a six-digit sRGB color', () => {
  assert.match(hex(0.5, 0.1, 55), /^#[0-9a-f]{6}$/);
});

test('the css carries the fact it was derived from', () => {
  const css = toCss(derivePalette(clay));
  assert.match(css, /derived from: unfired earthenware body/);
  assert.match(css, /--surface:/);
  assert.match(css, /--focus:/);
  assert.match(css, /color-scheme: light dark/);
});

test('a categorical set holds one lightness and even hue intervals', () => {
  const palette = derivePalette(clay);
  const set = deriveCategorical(palette, 5);
  assert.equal(set.length, 5);
  assert.ok(set.every((c) => c.l === set[0].l), 'equal lightness is what makes them read as peers');
  for (let i = 1; i < set.length; i += 1) {
    assert.ok(Math.abs(set[i].h - set[i - 1].h - 360 / 5) < 1e-9, 'hue steps must be even');
  }
});

test('no category lands on the accent hue', () => {
  const palette = derivePalette(clay);
  for (const member of deriveCategorical(palette, 4)) {
    const gap = Math.abs(((member.h - palette.tokens.accent.h) % 360 + 360) % 360);
    assert.ok(Math.min(gap, 360 - gap) > 20, 'a category must not impersonate "act"');
  }
});

test('every category member is in gamut and measures against the ground', () => {
  for (const scheme of ['light', 'dark']) {
    const palette = derivePalette({ ...clay, scheme });
    const ground = hex(palette.tokens.ground.l, palette.tokens.ground.c, palette.tokens.ground.h);
    for (const member of deriveCategorical(palette, 6)) {
      assert.ok(member.c <= maxChroma(member.l, member.h) + 1e-9, 'chroma must be paintable');
      const ratio = contrastRatio(hex(member.l, member.c, member.h), ground);
      assert.ok(ratio >= 3, `${scheme} category measured ${ratio.toFixed(2)}:1`);
    }
  }
});

test('a set too small to be a set, or too large to read, is refused', () => {
  const palette = derivePalette(clay);
  assert.throws(() => deriveCategorical(palette, 1), /at least 2/);
  assert.throws(() => deriveCategorical(palette, 9), /group them and drill down/);
  assert.throws(() => deriveCategorical(palette, 2.5), /at least 2/);
});

test('APCA matches the published reference values', () => {
  assert.equal(apcaLc('#000000', '#ffffff'), 106);
  assert.equal(apcaLc('#888888', '#ffffff'), 63.1);
  assert.equal(apcaLc('#ffffff', '#000000'), -107.9);
});

test('APCA is zero for a pair with no difference', () => {
  assert.equal(apcaLc('#777777', '#777777'), 0);
});

test('APCA carries polarity, so light-on-dark is negative', () => {
  assert.ok(apcaLc('#aaaaaa', '#000000') < 0);
  assert.ok(apcaLc('#333333', '#ffffff') > 0);
});

test('body text clears the readability ceiling as well as the WCAG floor', () => {
  for (const scheme of ['light', 'dark']) {
    const palette = derivePalette({ ...clay, scheme });
    const body = requiredPairs(palette).find((pair) => pair.name === 'body text on ground');
    const lc = Math.abs(apcaLc(body.fg, body.bg));
    assert.ok(lc >= LC_TARGET.body, `${scheme} body text is Lc ${lc}, under ${LC_TARGET.body}`);
  }
});
