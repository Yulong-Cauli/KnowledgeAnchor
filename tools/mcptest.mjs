#!/usr/bin/env node
// Isolated fixtures + actual stdio subprocess. No production cards are written.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { serializeClaim } from './ka-lib.mjs';
import { createKnowledgeTools, TOOL_DEFINITIONS } from './ka-mcp-tools.mjs';
import { createMcpSession, PROTOCOL_VERSIONS } from './mcp.mjs';

const TODAY = '2026-11-04';
const NOTE = 'library/中文 空格/笔记.md';
const SERVER = fileURLToPath(new URL('./mcp.mjs', import.meta.url));
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ka-mcptest-'));
  fs.mkdirSync(path.join(root, 'claims'));
  fs.mkdirSync(path.join(root, 'index'));
  fs.mkdirSync(path.join(root, 'library/中文 空格'), { recursive: true });
  fs.mkdirSync(path.join(root, 'library/assets/raw'), { recursive: true });
  fs.writeFileSync(path.join(root, NOTE), '# 笔记\n\n## 章节\n正文独有 Needle\n\n## 章节\nSecond heading\n');
  fs.writeFileSync(path.join(root, 'library/assets/raw/conversion.md'), '# RawExcludedNeedle');
  fs.writeFileSync(path.join(root, 'library/README.md'), '# DirectoryExcludedNeedle');
  fs.writeFileSync(path.join(root, 'index/claims.jsonl'), 'untouched-index\n');
  const rows = [
    ['a', 'asserted', 'watch', null, ['claim-fixture-b']],
    ['b', 'verified', 'trial', null, []],
    ['c', 'verified', 'adopt', TODAY, []],
    ['d', 'refuted', 'avoid', null, ['claim-fixture-a']],
    ['e', 'stale', 'watch', null, []],
  ];
  for (const [suffix, status, stance, due, related] of rows) {
    const data = { id: `claim-fixture-${suffix}`, title: `Needle fixture ${suffix}`, type: 'claim', status, stance,
      scope: '仅限夹具配置 ScopeOnlyNeedle', tags: ['fixture'], ...(suffix === 'b' ? {} : { note: NOTE + '#章节' }),
      evidence: [{ source: NOTE, locator: '测试章节', quote: '正文独有 Needle', relation: 'supports' }],
      falsifiers: ['相同条件下观察到反例'], related, ...(due ? { review_due: due } : {}),
      signoff: status === 'verified' ? { by: 'test-fixture-only', at: '2026-01-01',
        ...(suffix === 'c' ? { method: 'read', evidence_hash: 'fixture-not-user-signature' } : {}) } : null };
    fs.writeFileSync(path.join(root, `claims/${data.id}.md`), serializeClaim({ data, body: '## 正文\nClaimBodyOnlyNeedle', fields: new Map() }));
  }
  return root;
}
function cleanup(root) {
  const temp = path.resolve(os.tmpdir());
  const resolved = path.resolve(root);
  assert.equal(path.dirname(resolved), temp);
  assert.ok(path.basename(resolved).startsWith('ka-mcptest-'));
  fs.rmSync(resolved, { recursive: true, force: true });
}
function snapshot(root) {
  const out = {};
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) out[path.relative(root, full)] = fs.readFileSync(full).toString('base64');
    }
  }
  walk(root); return out;
}
function withFixture(fn) {
  const root = fixture();
  try { return fn(createKnowledgeTools({ root, today: () => TODAY }), root); }
  finally { cleanup(root); }
}

test('search retains trust metadata, scope, versions; supports full text and paging', () => withFixture((k, root) => {
  const before = snapshot(root);
  const result = k.call('search_knowledge', { query: 'Needle', limit: 2 });
  assert.equal(result.total, 6);
  assert.equal(result.items.length, 2);
  assert.equal(result.next_offset, 2);
  const all = k.call('search_knowledge', { query: 'Needle', limit: 30 });
  for (const row of all.items.filter((item) => item.kind === 'claim')) {
    assert.ok(row.scope && row.status && row.stance && row.path && row.version);
    assert.equal(row.usage.evidence_revalidated, false);
  }
  assert.equal(k.call('search_knowledge', { query: '正文独有', limit: 30 }).total, 6);
  assert.equal(k.call('search_knowledge', { query: 'ClaimBodyOnlyNeedle' }).total, 5);
  assert.equal(k.call('search_knowledge', { query: 'ScopeOnlyNeedle' }).total, 5);
  assert.equal(k.call('search_knowledge', { query: 'RawExcludedNeedle' }).total, 0);
  assert.equal(k.call('search_knowledge', { query: 'DirectoryExcludedNeedle' }).total, 0);
  assert.equal(k.call('search_knowledge', { query: 'Needle missing' }).total, 0);
  assert.deepEqual(snapshot(root), before);
}));

test('decision search includes signed claims regardless of legacy review dates and never falls back', () => withFixture((k) => {
  const result = k.call('search_knowledge', { query: 'Needle', mode: 'decision' });
  assert.deepEqual(result.items.map((item) => item.id), ['claim-fixture-b', 'claim-fixture-c']);
  assert.equal(result.items[1].usage.review_due_now, false);
  assert.equal(result.items[0].stance, 'trial'); // A candidate is not an adoption recommendation.
  const empty = k.call('search_knowledge', { query: 'claim-fixture-a', mode: 'decision' });
  assert.equal(empty.total, 0); assert.match(empty.notice, /不得回退/u);
}));

test('full card preserves evidence, falsifiers, signoff and body; disk edits are visible', () => withFixture((k, root) => {
  const card = k.call('read_claim', { id: 'claim-fixture-b' });
  assert.equal(card.evidence[0].quote, '正文独有 Needle');
  assert.ok(card.falsifiers.length && card.signoff.by && card.body.includes('ClaimBodyOnlyNeedle'));
  const target = path.join(root, 'claims/claim-fixture-a.md');
  const first = k.call('read_claim', { id: 'claim-fixture-a' });
  fs.appendFileSync(target, '\nManual update\n');
  const second = k.call('read_claim', { id: 'claim-fixture-a' });
  assert.notEqual(first.version, second.version);
  assert.match(second.body, /Manual update/u);
}));

test('note pages preserve line citations; Unicode paths and duplicate section anchors work', () => withFixture((k, root) => {
  const before = snapshot(root);
  const result = k.call('read_note', { path: 'library/' + encodeURIComponent('中文 空格') + '/笔记.md#章节', max_lines: 2 });
  assert.equal(result.start_line, 3); assert.equal(result.end_line, 4); assert.equal(result.next_line, 5);
  assert.equal(result.status, 'L1'); assert.equal(result.stance, null);
  assert.equal(result.citation.path, NOTE);
  assert.equal(k.call('read_note', { path: NOTE + '#章节-1' }).start_line, 6);
  assert.throws(() => k.call('read_note', { path: NOTE + '#missing' }), /anchor not found/u);
  assert.throws(() => k.call('read_note', { path: NOTE + '#章节', start_line: 3 }), /not both/u);
  assert.deepEqual(snapshot(root), before);
}));

test('related results include reverse links and evidence-only note references, deduplicated', () => withFixture((k) => {
  const byId = k.call('list_related_claims', { id: 'claim-fixture-a' });
  assert.deepEqual(byId.items.map((row) => row.id), ['claim-fixture-b', 'claim-fixture-d']);
  assert.deepEqual(byId.items[1].relations, ['incoming_related']);
  const byNote = k.call('list_related_claims', { note_path: NOTE, limit: 30 });
  assert.equal(byNote.total, 5);
  assert.deepEqual(byNote.items.find((row) => row.id === 'claim-fixture-b').relations, ['evidence_source']);
  assert.throws(() => k.call('list_related_claims', {}), /exactly one/u);
  assert.throws(() => k.call('list_related_claims', { id: 'claim-fixture-a', note_path: NOTE }), /exactly one/u);
}));

test('rejects invalid arguments, escaped paths and invalid claim corpus', () => withFixture((k, root) => {
  for (const value of ['../AGENTS.md', 'library/../../outside.md', 'library/%2e%2e/../outside.md', 'C:/outside.md', 'https://example.com/file.md', 'claims/claim-fixture-a.md']) {
    assert.throws(() => k.call('read_note', { path: value }), /note not found/u);
  }
  assert.throws(() => k.call('search_knowledge', { query: 'Needle', limit: 0 }), /limit/u);
  assert.throws(() => k.call('search_knowledge', { query: 'Needle', limit: '10' }), /limit/u);
  assert.throws(() => k.call('search_knowledge', { query: ' ', mode: 'research' }), /query/u);
  assert.throws(() => k.call('read_claim', { id: 'claim-fixture-a', signoff: {} }), /unknown argument/u);
  assert.throws(() => k.call('write_claim', {}), /unknown tool/u);
  fs.writeFileSync(path.join(root, 'claims/broken.md'), 'not a claim');
  assert.throws(() => k.call('search_knowledge', { query: 'Needle' }), /failed to load|validation failed/u);
}));

test('symlink/junction outside library cannot be read or searched', () => withFixture((k, root) => {
  fs.mkdirSync(path.join(root, 'private'));
  fs.writeFileSync(path.join(root, 'private/secret.md'), '# PrivateOnlyNeedle');
  fs.symlinkSync(path.join(root, 'private'), path.join(root, 'library/escaped'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => k.call('read_note', { path: 'library/escaped/secret.md' }), /note not found/u);
  assert.equal(k.call('search_knowledge', { query: 'PrivateOnlyNeedle' }).total, 0);
}));

test('MCP negotiation, notifications, errors, capabilities and read-only tools', () => withFixture((k) => {
  for (const requested of [...PROTOCOL_VERSIONS, 'unknown-version']) {
    const dispatch = createMcpSession(k);
    assert.equal(dispatch({ jsonrpc: '2.0', id: 1, method: 'tools/list' }).error.code, -32002);
    const init = dispatch({ jsonrpc: '2.0', id: 'init', method: 'initialize', params: {
      protocolVersion: requested, clientInfo: { name: 'test', version: '1' }, capabilities: {} } });
    assert.equal(init.result.protocolVersion, PROTOCOL_VERSIONS.includes(requested) ? requested : PROTOCOL_VERSIONS[0]);
    assert.deepEqual(Object.keys(init.result.capabilities), ['tools']);
    assert.equal(dispatch({ jsonrpc: '2.0', method: 'notifications/initialized' }), null);
    assert.equal(dispatch({ jsonrpc: '2.0', method: 'notifications/cancelled', params: { requestId: 9 } }), null);
    assert.equal(dispatch({ jsonrpc: '2.0', id: 2, method: 'tools/list' }).result.tools.length, 4);
    assert.equal(dispatch({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'read_claim', arguments: { id: 'missing' } } }).result.isError, true);
    assert.equal(dispatch({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'verify' } }).error.code, -32602);
    assert.equal(dispatch({ jsonrpc: '2.0', id: 5, method: 'nonexistent' }).error.code, -32601);
    assert.equal(dispatch([]).error.code, -32600);
  }
  for (const definition of TOOL_DEFINITIONS) assert.equal(definition.annotations.readOnlyHint, true);
}));

test('real subprocess stdio: handshake, all four calls, errors, fragmented UTF-8, clean EOF and no writes', async () => {
  const root = fixture(), before = snapshot(root);
  const child = spawn(process.execPath, [SERVER, '--root', root], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true, cwd: os.tmpdir() });
  let stdout = '', stderr = '';
  child.stdout.setEncoding('utf8').on('data', (text) => { stdout += text; });
  child.stderr.setEncoding('utf8').on('data', (text) => { stderr += text; });
  const closed = once(child, 'close');
  const timer = setTimeout(() => child.kill(), 15000);
  try {
    const messages = [
      { jsonrpc: '2.0', id: 0, method: 'initialize', params: { protocolVersion: PROTOCOL_VERSIONS[0], capabilities: {}, clientInfo: { name: 'fixture-client', version: '1' } } },
      { jsonrpc: '2.0', method: 'notifications/initialized' },
      { jsonrpc: '2.0', id: 1, method: 'tools/list' },
      ...[
        ['search_knowledge', { query: '正文独有', limit: 30 }],
        ['read_claim', { id: 'claim-fixture-a' }],
        ['read_note', { path: NOTE }],
        ['list_related_claims', { note_path: NOTE }],
      ].map(([name, args], i) => ({ jsonrpc: '2.0', id: i + 2, method: 'tools/call', params: { name, arguments: args } })),
    ];
    const buffer = Buffer.from(messages.map((message) => JSON.stringify(message)).join('\n') + '\n{bad json}\n');
    const split = buffer.indexOf(Buffer.from('正文')) + 1; // Split inside a multibyte Chinese character.
    child.stdin.write(buffer.subarray(0, split));
    child.stdin.end(buffer.subarray(split));
    const [exitCode] = await closed;
    assert.equal(exitCode, 0, stderr); assert.equal(stderr, '');
    const replies = stdout.trim().split('\n').map((line) => JSON.parse(line));
    assert.equal(replies.length, 7); // Six requests plus parse error, no notification reply.
    assert.equal(replies[1].result.tools.length, 4);
    for (const reply of replies.slice(2, 6)) {
      assert.equal(reply.result.isError, false);
      assert.deepEqual(JSON.parse(reply.result.content[0].text), reply.result.structuredContent);
    }
    assert.equal(replies[2].result.structuredContent.total, 6);
    assert.equal(replies.at(-1).error.code, -32700);
    assert.deepEqual(snapshot(root), before);
  } finally { clearTimeout(timer); if (child.exitCode === null) { child.kill(); await closed; } cleanup(root); }
});
