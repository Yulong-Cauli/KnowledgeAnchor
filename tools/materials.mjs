// Derived on each request. No cache to invalidate after a manual file edit.
import fs from 'node:fs';
import path from 'node:path';

export function normalizeSource(value, layers = ['library', 'claims']) {
  if (typeof value !== 'string') return null;
  const hash = value.indexOf('#');
  let clean, anchor;
  try {
    clean = decodeURIComponent(hash < 0 ? value : value.slice(0, hash));
    anchor = decodeURIComponent(hash < 0 ? '' : value.slice(hash + 1));
  } catch { return null; }
  if (/[\\\x00-\x1f:]/u.test(clean) || !layers.includes(clean.split('/')[0])) return null;
  const normalized = path.posix.normalize(clean);
  if (normalized.split('/')[0] !== clean.split('/')[0]) return null;
  return { path: normalized, anchor };
}

export function resolveResource(root, rawPath, layers = ['library', 'claims']) {
  const source = normalizeSource(rawPath, layers);
  if (!source) return null;
  const base = path.join(root, source.path.split('/')[0]);
  const abs = path.resolve(root, source.path);
  try {
    const realBase = fs.realpathSync(base);
    const real = fs.realpathSync(abs);
    if (!real.startsWith(`${realBase}${path.sep}`) || !fs.statSync(real).isFile()) return null;
    if (!/\.(md|pdf|png|jpe?g|gif|webp|svg|avif|bmp)$/iu.test(real)) return null;
    if (!source.path.startsWith('library/') && !source.path.endsWith('.md')) return null;
    return { ...source, rel: source.path, abs: real };
  } catch { return null; }
}

export function slugify(text) {
  return String(text).toLowerCase().trim().replace(/\s+/gu, '-').replace(/[^\p{L}\p{N}_-]/gu, '');
}

function headingText(text) { return text.replace(/[*`_$]/gu, '').trim(); }

export function listNotes(root) {
  const notes = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      // Do not traverse links, raw converted papers, or private hidden folders.
      if (entry.isSymbolicLink() || entry.name.startsWith('.')) continue;
      const abs = path.join(dir, entry.name);
      const rel = path.relative(root, abs).split(path.sep).join('/');
      if (entry.isDirectory() && rel !== 'library/assets') walk(abs);
      else if (entry.isFile() && entry.name.endsWith('.md')) {
        const content = fs.readFileSync(abs, 'utf8');
        const title = headingText(content.match(/^#\s+(.+)$/mu)?.[1] ?? entry.name.replace(/\.md$/u, ''));
        const kind = entry.name.toLowerCase() === 'readme.md' ? 'directory' : 'note';
        notes.push({ path: rel, title, category: rel.split('/').slice(1, -1).join('/') || '目录', kind, content });
      }
    }
  }
  walk(path.join(root, 'library'));
  return notes.sort((a, b) => a.path.localeCompare(b.path));
}

export function claimSearchText(card) {
  const d = card.data;
  return [d.id, d.title, ...(d.tags ?? []), d.scope, d.note, d.paper,
    ...(d.evidence ?? []).flatMap((e) => [e.source, e.locator, e.quote]), card.body].join('\n');
}

export function relatedClaims(claims, notePath) {
  return claims.flatMap((card) => {
    const primary = normalizeSource(card.data.note)?.path === notePath;
    const evidence = (card.data.evidence ?? []).some((e) => normalizeSource(e.source)?.path === notePath);
    return primary || evidence ? [{ id: card.data.id, title: card.data.title, status: card.data.status,
      stance: card.data.stance, scope: card.data.scope, primary, evidence }] : [];
  });
}

function snippetOf(text, terms) {
  const lower = text.toLowerCase();
  const positions = terms.map((term) => lower.indexOf(term)).filter((i) => i >= 0);
  const hit = positions.length ? Math.min(...positions) : 0;
  const start = Math.max(0, hit - 65);
  return { snippet: `${start ? '…' : ''}${text.slice(start, start + 230).replace(/\s+/gu, ' ')}${text.length > start + 230 ? '…' : ''}`, hit };
}

function headingAt(content, offset) {
  let anchor = '';
  let fenced = false;
  const used = new Map();
  let position = 0;
  for (const line of content.split('\n')) {
    if (position > offset) break;
    position += line.length + 1;
    if (/^\s*(```|~~~)/u.test(line)) fenced = !fenced;
    if (fenced) continue;
    const m = line.match(/^#{1,6}\s+(.+)$/u);
    if (!m) continue;
    const slug = slugify(headingText(m[1]));
    const count = used.get(slug) ?? 0;
    used.set(slug, count + 1);
    anchor = count ? `${slug}-${count}` : slug;
  }
  return anchor;
}

export function searchCorpus(notes, claims, query) {
  const terms = query.trim().toLowerCase().split(/\s+/u).filter(Boolean);
  const matches = (text) => terms.every((term) => text.toLowerCase().includes(term));
  const noteRows = notes.filter((n) => matches([n.title, n.path, n.content].join('\n'))).map((n) => {
    const { snippet, hit } = snippetOf(n.content, terms);
    return { ...n, content: undefined, snippet, anchor: headingAt(n.content, hit), layer: 'L1' };
  });
  const claimRows = claims.filter((c) => matches(claimSearchText(c))).map((c) => {
    const { snippet } = snippetOf([c.body, ...(c.data.evidence ?? []).map((e) => e.quote), c.data.scope].join('\n'), terms);
    return { id: c.data.id, title: c.data.title, path: c.rel, note: c.data.note, status: c.data.status,
      stance: c.data.stance, tags: c.data.tags ?? [], snippet, layer: 'claim' };
  });
  return { notes: noteRows, claims: claimRows, rule: '多个关键词以空白分隔，全部命中；不区分英文大小写。' };
}
