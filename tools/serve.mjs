#!/usr/bin/env node
// KnowledgeAnchor local web UI server (tmp_docs/ka-web-ui-design.md §3).
// Zero-dependency node:http. The filesystem stays the single source of truth:
// every request re-reads claims/, every write goes through handleWrite().
//   Usage: node tools/serve.mjs [--port 4780] [--host 127.0.0.1] [--readonly]
//   --readonly serves the same UI but rejects every write (PUT/POST) with 403.
//   Use it for the phone-facing instance so a tailnet device can only read.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  CLAIM_ID,
  MAX_ID_LENGTH,
  ROOT as DEFAULT_ROOT,
  buildIndex as indexAt,
  loadClaims as loadAt,
  loadClaimsFull as loadFullAt,
  serializeClaim,
  todayString,
  validateClaims as validateAt,
} from './ka-lib.mjs';
import { addDays, reviewCounts } from '../web/review.mjs';
import { listNotes, searchCorpus, resolveResource, relatedClaims, claimSearchText } from './materials.mjs';

const WEB_DIR = path.join(DEFAULT_ROOT, 'web');
const REVIEW_INTERVAL_DAYS = 90;
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 4780;
const EDITABLE_FIELDS = new Set([
  'title', 'scope', 'tags', 'note', 'paper', 'stance',
  'evidence', 'falsifiers', 'review_due', 'related', 'body',
]);

// ------------------------------------------------------------- helpers --

function parseArgs(argv) {
  const args = { host: DEFAULT_HOST, port: DEFAULT_PORT, readonly: false };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const eq = arg.indexOf('=');
    const [rawKey, inlineValue] = eq === -1 ? [arg, null] : [arg.slice(0, eq), arg.slice(eq + 1)];
    if (rawKey === '--readonly' || rawKey === '--read-only') {
      args.readonly = true;
      continue;
    }
    if (rawKey !== '--port' && rawKey !== '--host') {
      console.error(`ERROR: unknown option "${arg}"`);
      process.exit(2);
    }
    const value = inlineValue ?? argv[++i];
    if (value === undefined) {
      console.error(`ERROR: ${rawKey} needs a value`);
      process.exit(2);
    }
    if (rawKey === '--port') {
      const port = Number(value);
      if (!Number.isInteger(port) || port < 1 || port > 65535) {
        console.error(`ERROR: invalid port "${value}"`);
        process.exit(2);
      }
      args.port = port;
    } else {
      args.host = value;
    }
  }
  return args;
}

// Inject only the data root/clock for isolated HTTP tests; production uses this repo.
export function createKnowledgeServer({ root = DEFAULT_ROOT, readonly = false, today = todayString } = {}) {
const ROOT = path.resolve(root);
const CLAIMS_DIR = path.join(ROOT, 'claims');
const args = { readonly };
const loadClaims = () => loadAt(ROOT);
const loadClaimsFull = () => loadFullAt(ROOT);
const validateClaims = (claims) => validateAt(claims, ROOT);
const buildIndex = (claims) => indexAt(claims, ROOT);
const versionOf = (text) => crypto.createHash('sha256').update(text).digest('hex');

function summaryOf(data, rel) {
  return {
    id: data.id,
    title: data.title,
    status: data.status,
    stance: data.stance,
    scope: data.scope,
    tags: data.tags ?? [],
    note: data.note ?? null,
    paper: data.paper ?? null,
    review_due: data.review_due ?? null,
    path: rel,
  };
}

function fullCardOf(claim) {
  return { ...claim.data, body: claim.body, path: claim.rel, version: versionOf(claim.text ?? serializeClaim(claim)) };
}

// All write actions funnel through here (§9): a future auth layer only has
// to wrap this one function.
function handleWrite(actor, action, payload) {
  if (typeof actor !== 'string' || !actor.trim()) {
    return { status: 400, body: { error: 'actor is required for write operations' } };
  }
  const { claims, errors: loadErrors } = loadClaimsFull();
  if (loadErrors.length) {
    return { status: 400, body: { error: 'claims directory failed to load', details: loadErrors } };
  }
  switch (action) {
    case 'edit': return writeEdit(claims, payload);
    case 'create': return writeCreate(claims, payload);
    case 'reviewed': return writeReviewed(claims, payload);
    case 'postpone': return writePostpone(claims, payload);
    case 'today': return writeEdit(claims, { id: payload.id, patch: { review_due: today() } });
    default: return { status: 400, body: { error: `unknown write action "${action}"` } };
  }
}

function normalizeEvidence(value) {
  if (!Array.isArray(value)) return value;
  return value.map((item) => ({
    source: typeof item?.source === 'string' ? item.source : item?.source ?? null,
    locator: typeof item?.locator === 'string' ? item.locator : item?.locator ?? null,
    quote: typeof item?.quote === 'string' ? item.quote : item?.quote ?? null,
    relation: item?.relation,
  }));
}

function normalizeStringList(value) {
  if (!Array.isArray(value)) return value;
  const seen = new Set();
  const items = [];
  for (const entry of value) {
    const text = typeof entry === 'string' ? entry.trim() : entry;
    if (seen.has(text)) continue;
    seen.add(text);
    items.push(text);
  }
  return items;
}

// Apply an edit patch onto a parsed card; returns an error response or null.
function applyPatch(card, patch) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    return { status: 400, body: { error: 'patch must be an object' } };
  }
  for (const key of Object.keys(patch)) {
    if (!EDITABLE_FIELDS.has(key)) {
      return { status: 400, body: { error: `field "${key}" is not editable` } };
    }
  }
  const data = { ...card.data };
  for (const [key, value] of Object.entries(patch)) {
    if (key === 'body') continue;
    if (key === 'evidence') data.evidence = normalizeEvidence(value);
    else if (key === 'falsifiers') data.falsifiers = value;
    else if (key === 'tags' || key === 'related') data[key] = normalizeStringList(value);
    else if ((key === 'note' || key === 'review_due') && (value === '' || value === null)) delete data[key];
    else data[key] = value;
  }
  card.data = data;
  if (patch.body !== undefined) card.body = String(patch.body);
  return null;
}

function validateWholeSet(claims, targetRel, newData) {
  const hypothetical = claims.map((claim) =>
    claim.rel === targetRel ? { file: claim.file, rel: claim.rel, data: newData } : { file: claim.file, rel: claim.rel, data: claim.data }
  );
  if (!claims.some((claim) => claim.rel === targetRel)) {
    hypothetical.push({ file: path.join(ROOT, targetRel), rel: targetRel, data: newData });
  }
  return validateClaims(hypothetical);
}

// Atomic write + index rebuild. Runs inside the write queue.
function commitClaim(card, creating = false) {
  let content;
  try { content = serializeClaim(card); }
  catch (error) { throw Object.assign(new Error(`无法保存：${error.message}`), { statusCode: 400 }); }
  const target = card.file ?? path.join(CLAIMS_DIR, `${card.data.id}.md`);
  const tmp = `${target}.${crypto.randomUUID()}.tmp`;
  try {
    fs.writeFileSync(tmp, content, { encoding: 'utf8', flag: 'wx' });
    if (creating) fs.linkSync(tmp, target); // fails atomically if a file appeared
    else {
      if (card.text !== undefined && fs.readFileSync(target, 'utf8') !== card.text) {
        throw Object.assign(new Error('文件已被其他编辑器修改，请重新读取后合并。'), { statusCode: 409 });
      }
      fs.renameSync(tmp, target);
    }
  } finally { fs.rmSync(tmp, { force: true }); }
  card.text = content;
  try {
    const loaded = loadClaims();
    if (loaded.errors.length) throw new Error(loaded.errors.join('; '));
    buildIndex(loaded.claims);
  } catch (error) {
    throw Object.assign(new Error(`卡片已写入，但索引重建失败：${error.message}。请运行 node tools/ka.mjs index；不要重复创建。`), { statusCode: 500 });
  }
  return content;
}

function writeEdit(claims, { id, patch, version }) {
  const card = claims.find((claim) => claim.data.id === id);
  if (!card) return { status: 404, body: { error: `claim not found: ${id}` } };
  if (card.data.status !== 'asserted') {
    return { status: 403, body: { error: `claim ${id} is ${card.data.status} and read-only` } };
  }
  if (version && version !== versionOf(card.text)) return { status: 409, body: { error: '文件已被其他编辑器修改，请重新读取后合并；当前输入已保留。' } };
  const patchError = applyPatch(card, patch);
  if (patchError) return patchError;
  const validationErrors = validateWholeSet(claims, card.rel, card.data);
  if (validationErrors.length) {
    return { status: 400, body: { error: 'validation failed, nothing written', details: validationErrors } };
  }
  commitClaim(card);
  return { status: 200, body: fullCardOf(card) };
}

function writeCreate(claims, payload) {
  const id = typeof payload.id === 'string' ? payload.id.trim() : '';
  if (!CLAIM_ID.test(id)) {
    return { status: 400, body: { error: 'id must be "claim-" plus a lowercase kebab-case slug' } };
  }
  if (id.length > MAX_ID_LENGTH) {
    return { status: 400, body: { error: `id must be at most ${MAX_ID_LENGTH} characters` } };
  }
  if (claims.some((claim) => claim.data.id === id)) {
    return { status: 409, body: { error: `claim id already exists: ${id}` } };
  }
  if (fs.existsSync(path.join(CLAIMS_DIR, `${id}.md`))) return { status: 409, body: { error: `目标文件已存在：${id}.md` } };
  const data = {
    id,
    title: payload.title ?? '',
    type: 'claim',
    status: 'asserted',
    scope: payload.scope ?? '',
    tags: normalizeStringList(payload.tags ?? []),
    stance: payload.stance ?? 'watch',
    evidence: normalizeEvidence(payload.evidence ?? []),
    falsifiers: payload.falsifiers ?? [],
    signoff: null,
  };
  if (payload.note !== undefined && payload.note !== '') data.note = typeof payload.note === 'string' ? payload.note.trim() : payload.note;
  if (typeof payload.paper === 'string' && payload.paper.trim()) data.paper = payload.paper.trim();
  if (payload.review_due !== '' && payload.review_due !== null) data.review_due = payload.review_due ?? addDays(today(), REVIEW_INTERVAL_DAYS);
  if (payload.related !== undefined) data.related = normalizeStringList(payload.related);
  const card = { data, body: String(payload.body ?? ''), fields: new Map(), tail: undefined };
  const validationErrors = validateWholeSet(claims, `claims/${id}.md`, data);
  if (validationErrors.length) {
    return { status: 400, body: { error: 'validation failed, nothing written', details: validationErrors } };
  }
  commitClaim(card, true);
  return { status: 201, body: { ...data, body: card.body, path: `claims/${id}.md` } };
}

function writeReviewed(claims, { id }) {
  const card = claims.find((claim) => claim.data.id === id);
  if (!card) return { status: 404, body: { error: `claim not found: ${id}` } };
  if (card.data.status !== 'asserted') {
    return { status: 403, body: { error: `claim ${id} is ${card.data.status} and read-only` } };
  }
  card.data = { ...card.data, review_due: addDays(today(), REVIEW_INTERVAL_DAYS) };
  const errors = validateWholeSet(claims, card.rel, card.data);
  if (errors.length) return { status: 400, body: { error: 'validation failed, nothing written', details: errors } };
  commitClaim(card);
  return { status: 200, body: fullCardOf(card) };
}

function writePostpone(claims, { id, days }) {
  const card = claims.find((claim) => claim.data.id === id);
  if (!card) return { status: 404, body: { error: `claim not found: ${id}` } };
  if (card.data.status !== 'asserted') {
    return { status: 403, body: { error: `claim ${id} is ${card.data.status} and read-only` } };
  }
  const count = Number(days);
  if (!Number.isInteger(count) || count < 1 || count > 365) {
    return { status: 400, body: { error: 'days must be an integer between 1 and 365' } };
  }
  card.data = { ...card.data, review_due: addDays(today(), count) };
  const errors = validateWholeSet(claims, card.rel, card.data);
  if (errors.length) return { status: 400, body: { error: 'validation failed, nothing written', details: errors } };
  commitClaim(card);
  return { status: 200, body: fullCardOf(card) };
}

// ------------------------------------------------------------- routing --

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(payload);
}

function sendError(res, status, error, details) {
  sendJson(res, status, details ? { error, details } : { error });
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 5 * 1024 * 1024) {
        reject(Object.assign(new Error('request body too large'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('expected an object');
        resolve(body);
      } catch {
        reject(Object.assign(new Error('request body is not valid JSON'), { statusCode: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function getMeta() {
  const { claims, errors } = loadClaims();
  const counts = { asserted: 0, verified: 0, refuted: 0, stale: 0 };
  const tagCounts = new Map();
  const currentDay = today();
  for (const { data } of claims) {
    counts[data.status] = (counts[data.status] ?? 0) + 1;
    for (const tag of data.tags ?? []) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
  }
  const tags = [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  const reviews = reviewCounts(claims.map((c) => c.data), currentDay);
  return { today: currentDay, total: claims.length, counts, tags, queue: reviews.today, reviews, errors, readonly: args.readonly };
}

function filterClaims(url) {
  const { claims, errors } = loadClaimsFull();
  const params = url.searchParams;
  const statuses = (params.get('status') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const stances = (params.get('stance') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const tag = (params.get('tag') ?? '').trim();
  const q = (params.get('q') ?? '').trim().toLowerCase();
  const sort = params.get('sort') ?? 'id';
  let rows = claims.map((c) => ({ ...summaryOf(c.data, c.rel), search_text: claimSearchText(c) }));
  if (statuses.length) rows = rows.filter((row) => statuses.includes(row.status));
  if (stances.length) rows = rows.filter((row) => stances.includes(row.stance));
  if (tag) rows = rows.filter((row) => (row.tags ?? []).includes(tag));
  if (q) {
    rows = rows.filter((row) => q.split(/\s+/u).every((word) => row.search_text.toLowerCase().includes(word)));
  }
  if (sort === 'due') {
    rows.sort((a, b) => {
      const dueA = a.review_due ?? '9999-99-99';
      const dueB = b.review_due ?? '9999-99-99';
      return dueA.localeCompare(dueB) || a.id.localeCompare(b.id);
    });
  } else {
    rows.sort((a, b) => a.id.localeCompare(b.id));
  }
  return { rows, errors };
}

// Graph payload for the 图谱 view (design doc §10): paper notes as hub nodes
// radiating their claims (status-colored), plus claim↔claim `related` edges.
// Purely derived from claim frontmatter — no filesystem reads.
function buildGraph() {
  const { claims, errors } = loadClaims();
  const nodes = new Map();
  const edges = [];
  const seenEdge = new Set();
  const addClaimNode = (data) => {
    nodes.set(data.id, {
      id: data.id,
      kind: 'claim',
      label: data.title,
      status: data.status,
      stance: data.stance,
      tags: data.tags ?? [],
      paper: data.paper ?? null,
      review_due: data.review_due ?? null,
    });
  };
  for (const { data } of claims) {
    addClaimNode(data);
    if (data.note) {
      const notePath = data.note.split('#', 2)[0];
      const noteId = `note:${notePath}`;
      if (!nodes.has(noteId)) {
        nodes.set(noteId, {
          id: noteId,
          kind: 'note',
          label: notePath.replace(/^library\//, '').replace(/\.md$/, ''),
          path: notePath,
        });
      }
      const edgeKey = `n|${noteId}|${data.id}`;
      if (!seenEdge.has(edgeKey)) {
        seenEdge.add(edgeKey);
        edges.push({ source: noteId, target: data.id, kind: 'note' });
      }
    }
  }
  for (const { data } of claims) {
    for (const relId of data.related ?? []) {
      if (relId === data.id || !nodes.has(relId)) continue;
      const key = `r|${[data.id, relId].sort().join('|')}`;
      if (seenEdge.has(key)) continue;
      seenEdge.add(key);
      edges.push({ source: data.id, target: relId, kind: 'related' });
    }
  }
  const list = [...nodes.values()];
  const degree = new Map();
  for (const edge of edges) {
    for (const id of [edge.source, edge.target]) degree.set(id, (degree.get(id) ?? 0) + 1);
  }
  for (const node of list) node.degree = degree.get(node.id) ?? 0;
  return {
    nodes: list,
    edges,
    counts: {
      claims: list.filter((n) => n.kind === 'claim').length,
      notes: list.filter((n) => n.kind === 'note').length,
      edgesNote: edges.filter((e) => e.kind === 'note').length,
      edgesRelated: edges.filter((e) => e.kind === 'related').length,
    },
    errors,
  };
}

const MIME_TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'], ['.gif', 'image/gif'],
  ['.webp', 'image/webp'], ['.avif', 'image/avif'], ['.bmp', 'image/bmp'],
  ['.pdf', 'application/pdf'], ['.md', 'text/plain; charset=utf-8'],
  ['.woff2', 'font/woff2'], ['.woff', 'font/woff'], ['.ttf', 'font/ttf'],
  ['.ico', 'image/x-icon'],
]);

function serveStatic(res, urlPath) {
  const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const abs = path.resolve(WEB_DIR, decodeURIComponent(rel));
  if (abs !== WEB_DIR && !abs.startsWith(`${WEB_DIR}${path.sep}`)) {
    sendError(res, 404, 'not found');
    return;
  }
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
    sendError(res, 404, 'not found');
    return;
  }
  if (!fs.realpathSync(abs).startsWith(`${fs.realpathSync(WEB_DIR)}${path.sep}`)) { sendError(res, 404, 'not found'); return; }
  const type = MIME_TYPES.get(path.extname(abs)) ?? 'application/octet-stream';
  res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(fs.readFileSync(abs));
}

// ------------------------------------------------------------ dispatch --

async function handleApi(req, res, url) {
  const { pathname } = url;
  const method = req.method;
  if (method === 'GET' && (pathname === '/api/materials' || pathname === '/api/search')) {
    const notes = listNotes(ROOT);
    const { claims, errors } = loadClaimsFull();
    if (errors.length) { sendError(res, 500, 'claims directory failed to load', errors); return; }
    const results = searchCorpus(notes, claims, url.searchParams.get('q') ?? '');
    sendJson(res, 200, { ...results, categories: [...new Set(notes.map((n) => n.category))] });
    return;
  }
  if (method === 'GET' && pathname === '/api/resource') {
    const resolved = resolveResource(ROOT, url.searchParams.get('path'), ['library', 'claims', 'nightshift']);
    if (!resolved) { sendError(res, 404, 'resource not found in allowed directories'); return; }
    res.writeHead(200, { 'content-type': MIME_TYPES.get(path.extname(resolved.abs).toLowerCase()) ?? 'application/octet-stream',
      'cache-control': 'no-store', 'x-content-type-options': 'nosniff',
      'content-security-policy': "sandbox; default-src 'none'; style-src 'unsafe-inline'" });
    res.end(fs.readFileSync(resolved.abs));
    return;
  }

  if (method === 'GET' && pathname === '/api/meta') {
    const meta = getMeta();
    if (meta.errors.length) sendError(res, 500, 'claims directory failed to load', meta.errors);
    else sendJson(res, 200, meta);
    return;
  }

  if (method === 'GET' && pathname === '/api/claims') {
    const { rows, errors } = filterClaims(url);
    if (errors.length) sendError(res, 500, 'claims directory failed to load', errors);
    else sendJson(res, 200, { claims: rows });
    return;
  }

  if (method === 'GET' && pathname === '/api/graph') {
    const graph = buildGraph();
    if (graph.errors.length) sendError(res, 500, 'claims directory failed to load', graph.errors);
    else sendJson(res, 200, { nodes: graph.nodes, edges: graph.edges, counts: graph.counts });
    return;
  }

  const claimMatch = pathname.match(/^\/api\/claims\/([^/]+)$/);
  if (claimMatch && method === 'GET') {
    const id = decodeURIComponent(claimMatch[1]);
    const { claims, errors } = loadClaimsFull();
    if (errors.length) {
      sendError(res, 500, 'claims directory failed to load', errors);
      return;
    }
    const claim = claims.find((entry) => entry.data.id === id);
    if (!claim) {
      sendError(res, 404, `claim not found: ${id}`);
      return;
    }
    sendJson(res, 200, fullCardOf(claim));
    return;
  }

  if (method === 'GET' && pathname === '/api/note') {
    const resolved = resolveResource(ROOT, url.searchParams.get('path') ?? '');
    if (!resolved || !resolved.rel.startsWith('library/') || !resolved.rel.endsWith('.md')) {
      sendError(res, 404, 'note not found under library/');
      return;
    }
    try {
      const content = fs.readFileSync(resolved.abs, 'utf8');
      const { claims, errors } = loadClaims();
      if (errors.length) { sendError(res, 500, 'claims directory failed to load', errors); return; }
      sendJson(res, 200, { path: resolved.rel, anchor: resolved.anchor, content, related: relatedClaims(claims, resolved.rel) });
    } catch (error) {
      sendError(res, 500, `failed to read note: ${error.message}`);
    }
    return;
  }

  if (method === 'PUT' && claimMatch) {
    const id = decodeURIComponent(claimMatch[1]);
    const body = await readJsonBody(req);
    const result = handleWrite(body.actor, 'edit', { id, patch: body.patch, version: body.version });
    sendJson(res, result.status, result.body);
    return;
  }

  if (method === 'POST' && pathname === '/api/claims') {
    const body = await readJsonBody(req);
    const result = handleWrite(body.actor, 'create', body);
    sendJson(res, result.status, result.body);
    return;
  }

  const actionMatch = pathname.match(/^\/api\/claims\/([^/]+)\/(reviewed|postpone|today)$/);
  if (actionMatch && method === 'POST') {
    const id = decodeURIComponent(actionMatch[1]);
    const action = actionMatch[2];
    const body = await readJsonBody(req);
    const result = handleWrite(body.actor, action, action === 'postpone' ? { id, days: body.days } : { id });
    sendJson(res, result.status, result.body);
    return;
  }

  sendError(res, 404, 'not found');
}

// All write requests serialize through this promise chain: one file write at
// a time within this server. External editors use a best-effort version check.
let writeQueue = Promise.resolve();
function enqueueWrite(task) {
  const result = writeQueue.then(task);
  writeQueue = result.then(() => {}, () => {});
  return result;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
    res.setHeader('x-content-type-options', 'nosniff');
    if (!url.pathname.startsWith('/api/resource')) res.setHeader('content-security-policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https: http:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    if (url.pathname.startsWith('/api/')) {
      if (args.readonly && req.method !== 'GET' && req.method !== 'HEAD') {
        sendError(res, 403, 'this server is read-only');
        return;
      }
      if (req.method === 'PUT' || req.method === 'POST') {
        if (req.headers['sec-fetch-site'] === 'cross-site' || (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host)) {
          sendError(res, 403, 'cross-origin writes are not allowed'); return;
        }
        await enqueueWrite(() => handleApi(req, res, url));
      } else {
        await handleApi(req, res, url);
      }
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      sendError(res, 405, 'method not allowed');
      return;
    }
    serveStatic(res, url.pathname);
  } catch (error) {
    if (!res.headersSent) {
      sendError(res, error.statusCode ?? 500, error.message);
    } else {
      res.end();
    }
  }
});
return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
const args = parseArgs(process.argv);
const server = createKnowledgeServer(args);
server.listen(args.port, args.host, () => {
  console.log(`KnowledgeAnchor web UI: http://${args.host}:${args.port}/`);
  console.log(`mode: ${args.readonly ? 'read-only' : 'read-write'}`);
  console.log(`review interval: ${REVIEW_INTERVAL_DAYS} days`);
});
}
