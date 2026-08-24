#!/usr/bin/env node
// Every reference file a skill points at must exist. A dangling reference is invisible at
// author time and silently degrades the skill at run time — the model reads nothing and
// falls back to its priors, which is the exact failure this plugin exists to prevent.
//
// Usage: node scripts/check-refs.mjs [repo-root]
// Node builtins only.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

/** Paths written at run time in the user's project, not in this repository. */
export const RUNTIME_PREFIXES = ['.unique/', '.workflow/'];

const PLUGIN_ROOT_TOKEN = '${CLAUDE_PLUGIN_ROOT}/';

/** Any backticked token containing a slash and ending in .md. */
const CANDIDATE = /`([^`\n]*\/[^`\n]*\.md)`/g;

export function collectMarkdown(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.git')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...collectMarkdown(full));
    else if (entry.endsWith('.md')) out.push(full);
  }
  return out;
}

export function extractRefs(text) {
  const refs = [];
  for (const match of text.matchAll(CANDIDATE)) refs.push(match[1]);
  return refs;
}

export function isRuntimePath(ref) {
  const bare = ref.startsWith(PLUGIN_ROOT_TOKEN) ? ref.slice(PLUGIN_ROOT_TOKEN.length) : ref;
  return RUNTIME_PREFIXES.some((prefix) => bare.startsWith(prefix));
}

/**
 * Resolve a reference the way a skill would read it. A reference is satisfied if any of the
 * four bases finds it: the plugin root token, the repo root, the referring file's directory,
 * or shared/ — which is the base the skills declare for their read-when tables.
 */
export function resolveRef(ref, fromFile, root) {
  const bare = ref.startsWith(PLUGIN_ROOT_TOKEN) ? ref.slice(PLUGIN_ROOT_TOKEN.length) : ref;
  return [
    resolve(root, bare),
    resolve(dirname(fromFile), bare),
    resolve(root, 'shared', bare),
  ].find((candidate) => existsSync(candidate)) ?? null;
}

export function checkRefs(root) {
  const findings = [];
  const files = [
    ...collectMarkdown(join(root, 'skills')),
    ...collectMarkdown(join(root, 'shared')),
    ...collectMarkdown(join(root, 'commands')),
  ];

  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const ref of extractRefs(text)) {
      if (isRuntimePath(ref)) continue;
      if (resolveRef(ref, file, root) === null) {
        findings.push({ file: relative(root, file).split(sep).join('/'), ref });
      }
    }
  }
  return findings;
}

function main(argv) {
  const root = resolve(argv[2] ?? '.');
  const findings = checkRefs(root);

  for (const finding of findings) {
    console.error(`${finding.file}: missing reference ${finding.ref}`);
  }
  console.log(
    findings.length === 0
      ? 'all references resolve'
      : `${findings.length} dangling reference(s)`,
  );
  return findings.length > 0 ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv);
}
