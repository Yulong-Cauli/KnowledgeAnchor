#!/usr/bin/env node
// Real HTTP handlers with a disposable data root; never writes production cards.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { test } from 'node:test';
import { createKnowledgeServer } from './serve.mjs';
import { serializeClaim, parseClaimFile } from './ka-lib.mjs';
import { reviewCounts, addDays } from '../web/review.mjs';

const TODAY = '2026-12-31';
function data(id, status = 'asserted', due) {
  return { id: `claim-fixture-${id}`, title: `Fixture ${id}`, type: 'claim', status, scope: '测试限定条件', stance: 'watch',
    note: 'library/中文 空格/笔记.md#章节', tags: ['test'], evidence: [{ source: 'library/中文 空格/笔记.md', locator: '§1', quote: '来源原文 EvidenceOnlyNeedle', relation: 'supports' }],
    falsifiers: ['限定条件内出现反例'], ...(due ? { review_due: due } : {}),
    signoff: status === 'verified' ? { by: 'fixture-user', at: '2026-01-01', method: 'read', evidence_hash: 'fixture-only' } : null };
}
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ka-webtest-'));
  fs.mkdirSync(path.join(root, 'claims'));
  fs.mkdirSync(path.join(root, 'index'));
  fs.mkdirSync(path.join(root, 'library/中文 空格'), { recursive: true });
  fs.mkdirSync(path.join(root, 'library/assets/raw'), { recursive: true });
  fs.mkdirSync(path.join(root, 'nightshift'));
  fs.writeFileSync(path.join(root, 'nightshift/LOG.md'), '# Fixture evidence log');
  fs.writeFileSync(path.join(root, 'library/中文 空格/笔记.md'), '# 测试笔记\n\n## 章节\n\nBodyOnlyNeedle 中文检索。\n');
  fs.writeFileSync(path.join(root, 'library/assets/raw/full.md'), '# RawOnlyNeedle');
  const rows = [data('past', 'asserted', '2026-12-30'), data('today', 'asserted', TODAY), data('future', 'asserted', '2027-01-01'),
    data('no-date'), data('verified-due', 'verified', TODAY), data('verified-future', 'verified', '2027-01-01'), data('stale', 'stale'), data('refuted', 'refuted')];
  for (const d of rows) fs.writeFileSync(path.join(root, `claims/${d.id}.md`), serializeClaim({ data: d, body: '## 正文\nClaimBodyNeedle', fields: new Map() }));
  fs.writeFileSync(path.join(root, 'index/claims.jsonl'), 'original-index\n');
  return { root, rows };
}
async function start(options) {
  const server = createKnowledgeServer(options);
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}
function snapshot(root) {
  return Object.fromEntries(['claims', 'index'].flatMap((dir) => fs.readdirSync(path.join(root, dir)).map((f) => [dir + '/' + f, fs.readFileSync(path.join(root, dir, f), 'utf8')])));
}
async function request(url, endpoint, method = 'GET', body) {
  const res = await fetch(url + endpoint, { method, headers: { 'content-type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const payload = await res.json();
  return { status: res.status, body: payload };
}

test('create/edit validation, exact preservation, conflict and protection through real HTTP', async (t) => {
  const { root } = fixture();
  const { server, url } = await start({ root, today: () => TODAY });
  t.after(() => { server.closeAllConnections(); server.close(); fs.rmSync(root, { recursive: true, force: true }); });
  const valid = { ...data('created'), actor: 'local', body: 'new body' };
  const before = snapshot(root);
  for (const patch of [{ title: '' }, { title: '  ' }, { title: [] }, { scope: '' }, { scope: '\t ' }, { evidence: [] }, { evidence: [''] },
    { evidence: [{ ...valid.evidence[0], quote: '  ' }] }, { evidence: [{ ...valid.evidence[0], source: 'library/missing.md' }] },
    { evidence: [{ ...valid.evidence[0], source: 'javascript:alert(1)' }] }, { falsifiers: [] }, { falsifiers: [''] }, { falsifiers: [null] },
    { review_due: '2026-02-30' }, { related: ['claim-unknown'] }, { related: [null] }, { note: null }, { tags: [null] },
    { note: 'library/../README.md' }, { note: 'library/中文 空格' }, { id: 'claim-fixture-past' }]) {
    const r = await request(url, '/api/claims', 'POST', { ...valid, ...patch });
    assert.ok([400, 409].includes(r.status), JSON.stringify({ patch, r }));
    assert.deepEqual(snapshot(root), before, 'rejected create leaves cards and index unchanged');
  }
  const conflict = path.join(root, 'claims/claim-fixture-conflict.md');
  fs.writeFileSync(conflict, serializeClaim({ data: data('elsewhere'), body: '', fields: new Map() }));
  const conflictedBefore = snapshot(root);
  assert.equal((await request(url, '/api/claims', 'POST', { ...valid, id: 'claim-fixture-conflict' })).status, 409);
  assert.deepEqual(snapshot(root), conflictedBefore);
  fs.rmSync(conflict);
  const created = await request(url, '/api/claims', 'POST', { ...valid, status: 'verified', signoff: { by: 'malicious' } });
  assert.equal(created.status, 201); assert.equal(created.body.status, 'asserted'); assert.equal(created.body.signoff, null);
  const file = path.join(root, 'claims/claim-fixture-created.md');
  assert.equal(parseClaimFile(fs.readFileSync(file, 'utf8')).data.id, valid.id);
  assert.match(fs.readFileSync(path.join(root, 'index/claims.jsonl'), 'utf8'), /claim-fixture-created/);
  const card = (await request(url, '/api/claims/' + valid.id)).body;
  const beforeEdit = snapshot(root);
  for (const patch of [{ id: 'claim-renamed' }, { type: 'note' }, { status: 'verified' }, { signoff: null }, { title: ' ' }]) {
    assert.equal((await request(url, '/api/claims/' + valid.id, 'PUT', { actor: 'local', patch })).status, 400);
    assert.deepEqual(snapshot(root), beforeEdit);
  }
  const edited = await request(url, '/api/claims/' + valid.id, 'PUT', { actor: 'local', version: card.version, patch: { title: 'Changed' } });
  assert.equal(edited.status, 200);
  const oldText = beforeEdit['claims/' + valid.id + '.md'];
  const newText = fs.readFileSync(file, 'utf8');
  assert.equal(newText.replace('title: "Changed"', 'title: "Fixture created"'), oldText);
  for (const [name, text] of Object.entries(beforeEdit)) if (name.startsWith('claims/') && !name.endsWith(valid.id + '.md')) assert.equal(fs.readFileSync(path.join(root, name), 'utf8'), text);
  assert.equal((await request(url, '/api/claims/' + valid.id, 'PUT', { actor: 'local', version: card.version, patch: { title: 'Stale edit' } })).status, 409);
  for (const id of ['verified-due', 'stale', 'refuted']) {
    for (const action of ['', '/reviewed', '/postpone', '/today']) assert.equal((await request(url, '/api/claims/claim-fixture-' + id + action, action ? 'POST' : 'PUT', { actor: 'local', patch: { title: 'Bad' }, days: 30 })).status, 403);
  }
  // Invalid pre-existing corpus prevents creating another card.
  fs.writeFileSync(path.join(root, 'claims/bad.md'), '---\nid: claim-bad\n---\n');
  const brokenBefore = snapshot(root);
  assert.equal((await request(url, '/api/claims', 'POST', { ...valid, id: 'claim-fixture-other' })).status, 400);
  assert.deepEqual(snapshot(root), brokenBefore);
});

test('review scheduling counts survive reload, protected files and signoff are byte-identical', async (t) => {
  const { root, rows } = fixture(); const { server, url } = await start({ root, today: () => TODAY });
  t.after(() => { server.closeAllConnections(); server.close(); fs.rmSync(root, { recursive: true, force: true }); });
  const before = snapshot(root);
  assert.deepEqual(reviewCounts(rows, TODAY), { today: 2, future: 1, unscheduled: 1, asserted: 4, manual: 2 });
  assert.deepEqual((await request(url, '/api/meta')).body.reviews, reviewCounts(rows, TODAY));
  await request(url, '/api/claims'); await request(url, '/api/note?path=' + encodeURIComponent(rows[0].note));
  assert.deepEqual(snapshot(root), before, 'browsing never writes');
  assert.equal((await request(url, '/api/claims/claim-fixture-past/reviewed', 'POST', { actor: 'local' })).body.review_due, '2027-03-31');
  assert.equal((await request(url, '/api/claims/claim-fixture-today/postpone', 'POST', { actor: 'local', days: 30 })).body.review_due, '2027-01-30');
  assert.equal((await request(url, '/api/meta')).body.queue, 0);
  assert.equal((await request(url, '/api/meta')).body.reviews.future, 3);
  for (const d of rows) {
    const after = fs.readFileSync(path.join(root, `claims/${d.id}.md`), 'utf8');
    const original = before[`claims/${d.id}.md`];
    if (d.status !== 'asserted') assert.equal(after, original);
    assert.equal(parseClaimFile(after).fields.get('signoff').raw, parseClaimFile(original).fields.get('signoff').raw);
    assert.equal(parseClaimFile(after).data.stance, d.stance);
  }
  assert.equal(addDays('2024-02-28', 1), '2024-02-29'); assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  await request(url, '/api/claims/claim-fixture-future/today', 'POST', { actor: 'local' });
  assert.equal((await request(url, '/api/meta')).body.queue, 1);
});

test('full text search, links, deduplication, refresh, allowed resources and traversal protection', async (t) => {
  const { root } = fixture(); const { server, url } = await start({ root, today: () => TODAY });
  t.after(() => { server.closeAllConnections(); server.close(); fs.rmSync(root, { recursive: true, force: true }); });
  const search = async (q) => (await request(url, '/api/search?q=' + encodeURIComponent(q))).body;
  const notes = await search('bodyonlyneedle 中文检索');
  assert.equal(notes.notes.length, 1); assert.match(notes.notes[0].snippet, /BodyOnlyNeedle/); assert.equal(notes.notes[0].anchor, '章节');
  assert.equal((await search('RawOnlyNeedle')).notes.length, 0);
  assert.equal((await search('EvidenceOnlyNeedle')).claims.length, 8);
  assert.equal((await search('ClaimBodyNeedle')).claims[0].stance, 'watch');
  assert.equal((await request(url, '/api/claims?q=ClaimBodyNeedle')).body.claims.length, 8);
  const noteUrl = '/api/note?path=' + encodeURIComponent('library/中文 空格/笔记.md#章节');
  assert.equal((await request(url, noteUrl)).body.related.length, 8);
  await request(url, '/api/claims/claim-fixture-past', 'PUT', { actor: 'local', patch: { note: '' } });
  const related = (await request(url, noteUrl)).body.related;
  assert.equal(related.length, 8); assert.equal(related.find((r) => r.id === 'claim-fixture-past').primary, false);
  fs.appendFileSync(path.join(root, 'library/中文 空格/笔记.md'), '\nFreshEditNeedle');
  assert.equal((await search('FreshEditNeedle')).notes.length, 1);
  assert.equal((await fetch(url + '/api/resource?path=' + encodeURIComponent('library/中文%20空格/笔记.md'))).status, 200);
  assert.equal((await fetch(url + '/api/resource?path=nightshift/LOG.md')).status, 200);
  assert.equal((await request(url, '/api/note?path=nightshift/LOG.md')).status, 404, 'evidence log is not presented as an L1 note');
  for (const unsafe of ['library/../../README.md', 'library/%2e%2e/%2e%2e/README.md', 'library/..\\..\\README.md', 'C:/Windows/win.ini', 'library/%00.md', 'claims/../index/claims.jsonl', 'library/assets/no.js', 'library/%zz']) {
    assert.equal((await request(url, '/api/resource?path=' + encodeURIComponent(unsafe))).status, 404, unsafe);
  }
  // Junctions are available without symlink privileges on Windows.
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'ka-outside-'));
  t.after(() => fs.rmSync(outside, { recursive: true, force: true }));
  fs.writeFileSync(path.join(outside, 'secret.md'), 'secret');
  fs.symlinkSync(outside, path.join(root, 'library/escape'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.equal((await request(url, '/api/resource?path=library/escape/secret.md')).status, 404);
});

test('readonly HTTP rejects all writes; disk/index failure is not reported as a complete save', async (t) => {
  const { root } = fixture(); const ro = await start({ root, readonly: true, today: () => TODAY });
  const rw = await start({ root, today: () => TODAY });
  t.after(() => { for (const s of [ro.server, rw.server]) { s.closeAllConnections(); s.close(); } fs.rmSync(root, { recursive: true, force: true }); });
  const before = snapshot(root);
  assert.equal((await request(ro.url, '/api/claims', 'POST', { ...data('new'), actor: 'local' })).status, 403);
  assert.equal((await request(ro.url, '/api/claims/claim-fixture-past', 'PUT', { actor: 'local', patch: { title: 'Bad' } })).status, 403);
  assert.equal((await request(ro.url, '/api/claims/claim-fixture-past/reviewed', 'POST', { actor: 'local' })).status, 403);
  assert.equal((await request(ro.url, '/api/claims/claim-fixture-past/today', 'POST', { actor: 'local' })).status, 403);
  assert.deepEqual(snapshot(root), before);
  // Block the temp index path to exercise partial persistence reporting.
  fs.mkdirSync(path.join(root, 'index/claims.jsonl.tmp'));
  const failed = await request(rw.url, '/api/claims/claim-fixture-past', 'PUT', { actor: 'local', patch: { title: 'Written before index failure' } });
  assert.equal(failed.status, 500); assert.match(failed.body.error, /卡片已写入.*索引重建失败/);
  assert.equal(fs.readFileSync(path.join(root, 'index/claims.jsonl'), 'utf8'), before['index/claims.jsonl']);
});
