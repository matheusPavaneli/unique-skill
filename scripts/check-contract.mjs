#!/usr/bin/env node
// Validate `.unique/contract.md` and `.unique/log.md` before a surface is called done.
//
// The originality gates were prose, and prose gates leave no trace: a run that skipped the
// provenance lines, never wrote a grid, and scored the rubric from source is textually
// indistinguishable from one that did all three. That is the failure this checks for. It
// does not judge taste — it checks that the decisions which prevent the default were
// actually made, written down, and traced to something.
//
// Usage: node scripts/check-contract.mjs [.unique-dir]
// Node builtins only.

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const MODES = ['product-surface', 'marketing', 'editorial', 'native', 'prototype'];
export const BUDGETS = ['quiet', 'measured', 'loud'];
export const AXES = ['COLOR', 'TYPE', 'LAYOUT', 'SIGNATURE'];
export const RUBRIC_AXES = ['composition', 'type', 'color', 'density', 'signature'];
export const COMPONENT_KEYS = ['RECOGNIZED', 'INTERACTION', 'CONTROL', 'CORNER', 'SEPARATION', 'FOCUS'];

/**
 * Phrases that are not facts. The provenance line exists to stop "modern and trustworthy"
 * from standing in for a fact about the subject's material world, and it only stops it if
 * something checks.
 */
export const NON_FACTS = [
  'modern', 'clean', 'premium', 'sleek', 'trustworthy', 'professional', 'minimal',
  'elegant', 'bold', 'friendly', 'innovative', 'cutting-edge', 'sophisticated',
  'feels ', 'vibe', 'aesthetic', 'tbd', 'n/a', 'todo',
];

/**
 * Literal tells from the banned-default registry in shared/design/originality.md.
 * Matching one is not a failure on its own — the registry allows any of them when the brief
 * names it or a provenance line earns it — so these are warnings that demand a sentence,
 * not errors. Hex values are matched exactly because those are the ones that keep recurring.
 */
export const DEFAULT_TELLS = [
  { pattern: /#f4f1ea/i, note: 'the cream ground of AI-design cluster #1' },
  { pattern: /\bglassmorphism\b/i, note: 'banned default #6' },
  { pattern: /\bbento\b/i, note: 'banned default #7 unless the content is genuinely heterogeneous' },
  { pattern: /gradient text/i, note: 'banned default #5' },
  { pattern: /\bmesh gradient\b/i, note: 'banned default #6' },
  { pattern: /\bstarfield\b/i, note: 'banned default #11' },
  { pattern: /\bshadcn\b/i, note: 'banned default #4 — the starter theme is the recognizable look' },
  { pattern: /\bnoise overlay\b/i, note: 'banned default #6' },
];

/** Faces that are legitimate as body or UI, and a tell as the display face carrying identity. */
export const DEFAULT_DISPLAY_FACES = [/\binter\b/i, /\bgeist\b/i, /\bmanrope\b/i, /\bspace grotesk\b/i];

const FIELD = /^(SUBJECT|MODE|ORIGINALITY|BUDGET|SIGNATURE)\s+(.+?)\s*$/;

export function parseContract(text) {
  const fields = {};
  const sections = new Map();
  let current = null;

  for (const line of text.split(/\r?\n/)) {
    const heading = /^##\s+(.+?)\s*$/.exec(line);
    if (heading) {
      current = heading[1].toLowerCase().split(/\s+\(/)[0].trim();
      sections.set(current, []);
      continue;
    }
    if (current === null) {
      const field = FIELD.exec(line);
      if (field) fields[field[1]] = field[2].trim();
    } else {
      sections.get(current).push(line);
    }
  }
  return { fields, sections };
}

/** Every provenance line is `AXIS  <value>  <- <fact>`. Both halves have to exist. */
export function parseProvenance(lines) {
  const found = new Map();
  for (const line of lines) {
    const match = /^(COLOR|TYPE|LAYOUT|SIGNATURE)\s+(.*?)\s*<-\s*(.*)$/.exec(line.trim());
    if (match) found.set(match[1], { value: match[2].trim(), fact: match[3].trim() });
  }
  return found;
}

export function parseRubric(lines) {
  const scores = new Map();
  let notScored = false;
  for (const line of lines) {
    if (/not scored/i.test(line)) notScored = true;
    const match = /^\s*\|?\s*([A-Za-z][A-Za-z\s]*?)\s*\|?\s*[:|]\s*([1-5])\s*(?:\/\s*5)?\s*\|?\s*$/.exec(
      line,
    );
    if (match) {
      const axis = RUBRIC_AXES.find((a) => match[1].trim().toLowerCase().startsWith(a));
      if (axis) scores.set(axis, Number(match[2]));
    }
  }
  return { scores, notScored };
}

const normalize = (value) => (value ?? '').toLowerCase().replace(/\s+/g, ' ').trim();

const isNonFact = (fact) => {
  const lower = fact.toLowerCase();
  return fact.length < 12 || NON_FACTS.some((word) => lower.includes(word));
};

export function checkContract(text) {
  const findings = [];
  const fail = (message) => findings.push({ level: 'error', message });
  const warn = (message) => findings.push({ level: 'warn', message });

  const { fields, sections } = parseContract(text);

  for (const key of ['SUBJECT', 'MODE', 'ORIGINALITY', 'BUDGET', 'SIGNATURE']) {
    if (!fields[key]) fail(`contract.md: missing ${key} line`);
  }
  const mode = fields.MODE;
  const budget = fields.BUDGET;
  const originality = fields.ORIGINALITY ?? '';

  if (mode && !MODES.includes(mode)) fail(`contract.md: MODE "${mode}" is not one of ${MODES.join(' | ')}`);
  if (budget && !BUDGETS.includes(budget)) {
    fail(`contract.md: BUDGET "${budget}" is not one of ${BUDGETS.join(' | ')}`);
  }

  const isSignature = /^signature$/i.test(originality);
  const isBenchmark = /^benchmark\(.+\)$/i.test(originality);
  if (originality && !isSignature && !isBenchmark && !/^native$/i.test(originality)) {
    fail(`contract.md: ORIGINALITY "${originality}" is not native | benchmark(<reference>) | signature`);
  }

  for (const required of ['Tokens', 'Grid', 'Components']) {
    if (!sections.has(required.toLowerCase())) fail(`contract.md: missing "## ${required}" section`);
  }

  // Grid is where layout stops being an adjective. Without numbers the layout axis is the
  // only one with nothing to check, and it is reliably the most generic one in the output.
  // PATH and DENSITY come first because measurements do not decide what a page does to a
  // reader's eye, and uniform density is the most reliable tell of a generated page.
  const grid = (sections.get('grid') ?? []).join('\n');
  if (sections.has('grid')) {
    for (const key of ['PATH', 'DENSITY', 'COLUMNS', 'MEASURE', 'RHYTHM', 'BLEED']) {
      if (!new RegExp(`^\\s*${key}\\b`, 'm').test(grid)) {
        fail(`contract.md: grid section has no ${key} line`);
      }
    }
    if (!/\d/.test(grid)) fail('contract.md: grid section contains no numbers — that is a mood, not a grid');
  }

  // Components is the layer the tokens get spent on, and it was the one axis with nothing to
  // check: a derived palette poured into the default control shapes is a tinted default, and
  // it is textually indistinguishable from a derived grammar. Required in every MODE —
  // `native` records the grammar it inherited by name, and `prototype` is precisely where an
  // unrecorded default enters and never leaves.
  const components = (sections.get('components') ?? []).join('\n');
  if (sections.has('components')) {
    for (const key of COMPONENT_KEYS) {
      const line = new RegExp(`^\\s*${key}\\b[ \\t]*(.*)$`, 'm').exec(components);
      if (!line) fail(`contract.md: components section has no ${key} line`);
      else if (line[1].trim() === '') {
        fail(`contract.md: components ${key} has no value — a key with nothing after it is a heading, not a decision`);
      }
    }
    if (!/\d/.test(components)) {
      fail('contract.md: components section contains no numbers — control height, radius and the focus ring are measurements');
    }
  }

  const tokens = (sections.get('tokens') ?? []).join('\n');
  if (sections.has('tokens') && !/oklch\(/i.test(tokens)) {
    warn('contract.md: tokens are not in oklch() — ramps and states drift without a perceptual space');
  }

  if (isSignature || isBenchmark) {
    const provenance = parseProvenance(sections.get('provenance') ?? []);
    if (!sections.has('provenance')) {
      fail(`contract.md: ORIGINALITY is ${originality} and there is no "## Provenance" section`);
    }
    for (const axis of AXES) {
      const line = provenance.get(axis);
      if (!line) fail(`contract.md: provenance has no ${axis} line`);
      else if (line.fact === '') fail(`contract.md: provenance ${axis} names no fact`);
      else if (isNonFact(line.fact)) {
        fail(`contract.md: provenance ${axis} fact "${line.fact}" is a mood, not a fact about the subject`);
      }
    }
    const typeLine = provenance.get('TYPE');
    if (typeLine && DEFAULT_DISPLAY_FACES.some((face) => face.test(typeLine.value))) {
      warn(
        `contract.md: display face in "${typeLine.value}" is a current default — legitimate as body or UI, a tell as the face carrying identity`,
      );
    }
    // Three whole directions before tokens. A single-candidate process reliably produces the
    // default, and a rejection written after the winner exists is a justification, not an
    // exploration.
    const directions = sections.get('directions') ?? [];
    if (!sections.has('directions')) {
      fail(`contract.md: ORIGINALITY is ${originality} and there is no "## Directions" section`);
    } else {
      const routes = directions.filter((line) => /^\s*[A-C]\s+\S/.test(line));
      const kills = directions.filter((line) => /^\s*KILL\b/i.test(line));
      if (routes.length < 3) {
        fail(
          `contract.md: ${routes.length} direction(s) recorded — three are explored, two are killed`,
        );
      }
      if (kills.length < 2) fail('contract.md: fewer than two KILL lines in the directions block');
      for (const kill of kills) {
        const reason = kill.replace(/^\s*KILL\s*\S*\s*(—|-|:)?\s*/i, '').trim();
        if (isNonFact(reason)) {
          fail(`contract.md: kill reason "${reason}" is taste, not a reason from the brief`);
        }
      }
      // Three readings of one fact is one direction with three coats of paint.
      const facts = directions
        .flatMap((line) => line.split('<-').slice(1))
        .map((part) => normalize(part.split('·')[0]))
        .filter((fact) => fact !== '');
      if (facts.length >= 3 && new Set(facts).size < facts.length - 1) {
        warn('contract.md: the directions repeat facts — three readings of one fact is one direction');
      }
    }

    if (!sections.has('rejected')) {
      fail('contract.md: missing "## Rejected" section — a single-candidate process produces the default');
    } else if ((sections.get('rejected') ?? []).filter((l) => /^\s*[-*]\s+\S/.test(l)).length < 2) {
      fail('contract.md: fewer than two rejected directions recorded');
    }
  }

  if (isBenchmark) {
    const borrowed = (sections.get('borrowed / invented') ?? sections.get('borrowed') ?? []).join('\n');
    if (!/^\s*BORROWED\b/m.test(borrowed) || !/^\s*INVENTED\b/m.test(borrowed)) {
      fail('contract.md: benchmark contract has no BORROWED / INVENTED block');
    } else if (/^\s*INVENTED\s*$/m.test(borrowed)) {
      fail('contract.md: INVENTED is empty — this is a clone, not a benchmark');
    }
  }

  const rubric = parseRubric(sections.get('rubric') ?? []);
  if (!sections.has('rubric')) {
    fail('contract.md: missing "## Rubric" section — the render pass writes five numbers here');
  } else if (rubric.notScored && rubric.scores.size === 0) {
    warn('contract.md: rubric is "not scored" — the surface is delivered unverified and must be reported as such');
  } else {
    for (const axis of RUBRIC_AXES) {
      if (!rubric.scores.has(axis)) fail(`contract.md: rubric has no score for ${axis}`);
    }
    const values = [...rubric.scores.values()];
    if (values.length === RUBRIC_AXES.length && values.every((v) => v === 3)) {
      fail('contract.md: 3 across the board is the template result — floor.md calls that a fail, not a pass');
    }
    // Signature scoring high on a surface whose job is invisibility is a defect, per floor.md.
    const signatureScore = rubric.scores.get('signature');
    if (signatureScore >= 4 && (mode === 'product-surface' || mode === 'native')) {
      warn(`contract.md: signature scored ${signatureScore} on ${mode} — record that as a defect, not a win`);
    }
    if (budget === 'measured' && signatureScore !== undefined && signatureScore <= 2) {
      warn('contract.md: measured budget with a signature of 2 or less is an unspent budget, which is a template');
    }
  }

  // Scanned without the rejected section: naming a default as the thing you killed is the
  // process working, and warning about it trains the author to stop writing the record.
  const scanned = text.split(/^##\s+Rejected\s*$/im)[0];
  for (const tell of DEFAULT_TELLS) {
    if (tell.pattern.test(scanned)) {
      warn(`contract.md: "${tell.pattern.source}" — ${tell.note}; earn it in a provenance line or replace it`);
    }
  }

  return findings;
}

/** One log entry: the triple that must not repeat, plus the heading it came from. */
export function parseLog(text) {
  const entries = [];
  let current = null;
  for (const line of text.split(/\r?\n/)) {
    const heading = /^##\s+(.+?)\s*$/.exec(line);
    if (heading) {
      current = { heading: heading[1].trim(), palette: null, display: null, layout: null };
      entries.push(current);
      continue;
    }
    if (current === null) continue;
    const field = /^(palette|display|layout device|signature|rejected|contract):\s*(.+?)\s*$/i.exec(line);
    if (!field) continue;
    const key = field[1].toLowerCase();
    if (key === 'palette') current.palette = field[2];
    else if (key === 'display') current.display = field[2];
    else if (key === 'layout device') current.layout = field[2];
  }
  return entries;
}

/**
 * The divergence rule: no two entries in one project share a (palette, display, layout)
 * triple. It is the only mechanism that makes successive generations diverge instead of
 * converging on a house style, and it is worthless unless something reads it.
 */
export function checkLog(text) {
  const findings = [];
  const seen = new Map();
  for (const entry of parseLog(text)) {
    const missing = ['palette', 'display', 'layout'].filter((key) => !entry[key]);
    if (missing.length > 0) {
      findings.push({
        level: 'error',
        message: `log.md: entry "${entry.heading}" has no ${missing.join(', ')} line`,
      });
      continue;
    }
    const triple = [entry.palette, entry.display, entry.layout].map(normalize).join(' | ');
    if (seen.has(triple)) {
      findings.push({
        level: 'error',
        message: `log.md: "${entry.heading}" repeats the triple from "${seen.get(triple)}" — ${triple}`,
      });
    } else {
      seen.set(triple, entry.heading);
    }
  }
  return findings;
}

export function check(dir) {
  const contractPath = join(dir, 'contract.md');
  if (!existsSync(contractPath)) {
    return [{ level: 'error', message: `${contractPath} does not exist — the contract is written before code, not after` }];
  }
  const findings = checkContract(readFileSync(contractPath, 'utf8'));
  const logPath = join(dir, 'log.md');
  if (existsSync(logPath)) findings.push(...checkLog(readFileSync(logPath, 'utf8')));
  else findings.push({ level: 'warn', message: 'log.md does not exist — the next pass has nothing to diverge from' });
  return findings;
}

function main(argv) {
  const dir = resolve(argv[2] ?? '.unique');
  const findings = check(dir);

  for (const finding of findings) {
    const line = `${finding.level === 'error' ? 'FAIL' : 'WARN'}  ${finding.message}`;
    if (finding.level === 'error') console.error(line);
    else console.log(line);
  }

  const errors = findings.filter((f) => f.level === 'error');
  console.log(
    errors.length === 0
      ? `contract holds${findings.length > 0 ? ` (${findings.length} warning(s))` : ''}`
      : `${errors.length} contract failure(s)`,
  );
  return errors.length > 0 ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv);
}
