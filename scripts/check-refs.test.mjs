import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkRefs, extractRefs, isRuntimePath, collectMarkdown } from './check-refs.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), 'check-refs-'));
  for (const [path, content] of Object.entries(files)) {
    const full = join(root, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content);
  }
  return root;
}

test('extracts backticked .md tokens with or without a directory part', () => {
  const refs = extractRefs('see `design/craft.md` and `devices.md` and `shared/x` and `a/b.md`');
  assert.deepEqual(refs, ['design/craft.md', 'devices.md', 'a/b.md']);
});

test('a token with a space in it is not a path', () => {
  assert.deepEqual(extractRefs('the `read this.md` line'), []);
});

test('runtime artifact paths are not repository references', () => {
  assert.equal(isRuntimePath('.unique/contract.md'), true);
  assert.equal(isRuntimePath('${CLAUDE_PLUGIN_ROOT}/.unique/log.md'), true);
  assert.equal(isRuntimePath('shared/design/craft.md'), false);
});

test('bare artifact names the skills write at run time are not repository references', () => {
  // `.unique/stack.md` is referred to as `stack.md` in prose; the file never exists here
  for (const name of ['brief.md', 'stack.md', 'contract.md', 'log.md']) {
    assert.equal(isRuntimePath(name), true, name);
  }
  assert.equal(isRuntimePath('devices.md'), false);
});

test('a same-directory reference resolves', () => {
  const root = fixture({
    'shared/design/devices.md': '# devices',
    'shared/design/originality.md': 'the repertoire is `devices.md`',
  });
  try {
    assert.deepEqual(checkRefs(root), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('a dangling same-directory reference is reported', () => {
  const root = fixture({ 'shared/design/originality.md': 'see `devicez.md`' });
  try {
    assert.deepEqual(checkRefs(root), [
      { file: 'shared/design/originality.md', ref: 'devicez.md' },
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('an existing reference produces no finding', () => {
  const root = fixture({
    'shared/design/craft.md': '# craft',
    'skills/a/SKILL.md': 'read `${CLAUDE_PLUGIN_ROOT}/shared/design/craft.md` first',
  });
  try {
    assert.deepEqual(checkRefs(root), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('a reference relative to shared/ resolves, as the read-when tables write it', () => {
  const root = fixture({
    'shared/design/modes.md': '# modes',
    'skills/a/SKILL.md': '| `design/modes.md` | always |',
  });
  try {
    assert.deepEqual(checkRefs(root), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('a reference relative to the referring file resolves', () => {
  const root = fixture({
    'shared/quality/floor.md': '# floor',
    'shared/design/craft.md': 'see `../quality/floor.md`',
  });
  try {
    assert.deepEqual(checkRefs(root), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('a dangling reference is reported with its file and the missing path', () => {
  const root = fixture({
    'skills/a/SKILL.md': 'read `${CLAUDE_PLUGIN_ROOT}/shared/design/nope.md`',
  });
  try {
    assert.deepEqual(checkRefs(root), [
      { file: 'skills/a/SKILL.md', ref: '${CLAUDE_PLUGIN_ROOT}/shared/design/nope.md' },
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('a path inside a fenced code block is still checked', () => {
  const root = fixture({
    'shared/design/a.md': ['```', 'points at `design/gone.md`', '```'].join('\n'),
  });
  try {
    assert.deepEqual(checkRefs(root), [{ file: 'shared/design/a.md', ref: 'design/gone.md' }]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('a directory with no markdown files yields no findings', () => {
  const root = fixture({ 'skills/a/notes.txt': 'points at `design/gone.md`' });
  try {
    assert.deepEqual(collectMarkdown(join(root, 'skills')), []);
    assert.deepEqual(checkRefs(root), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('a missing directory is not an error', () => {
  const root = fixture({ 'shared/design/a.md': '# a' });
  try {
    assert.deepEqual(collectMarkdown(join(root, 'skills')), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('this repository has no dangling references', () => {
  // regression guard for the read-when rows added for landing.md and devices.md: a skill
  // pointing at a file that does not exist degrades silently at run time
  assert.deepEqual(checkRefs(repoRoot), []);
});
