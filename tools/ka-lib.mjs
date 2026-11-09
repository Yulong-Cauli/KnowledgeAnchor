// KnowledgeAnchor shared library.
// Extracted verbatim from ka.mjs so that serve.mjs reuses the exact same
// parsing / validation / indexing logic as the CLI, plus a frontmatter
// serializer for the write pipeline (see tmp_docs/ka-web-ui-design.md §3).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CLAIMS_DIR = path.join(ROOT, 'claims');
export const LIBRARY_DIR = path.join(ROOT, 'library');
export const INDEX_DIR = path.join(ROOT, 'index');
export const STATUSES = new Set(['asserted', 'verified', 'refuted', 'stale']);
export const STANCES = new Set(['adopt', 'trial', 'watch', 'avoid']);
export const METHODS = new Set(['read', 'reproduced', 'cross-checked']);
export const RELATIONS = new Set(['supports', 'contradicts']);
export const CLAIM_ID = /^claim-[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
export const MAX_ID_LENGTH = 80;

// Canonical frontmatter field order (templates/claim.md order).
export const FIELD_ORDER = [
  'id', 'title', 'type', 'status', 'scope', 'tags', 'note', 'paper',
  'stance', 'evidence', 'falsifiers', 'review_due', 'related', 'signoff',
];

// ---------------------------------------------------------------- parsing --

function splitFrontmatter(text) {
  const lines = text.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') return null;
  const end = lines.findIndex((line, i) => i > 0 && line.trim() === '---');
  if (end === -1) return null;
  return lines.slice(1, end);
}

function tokenize(lines) {
  const tokens = [];
  lines.forEach((raw, index) => {
    if (!raw.trim() || raw.trim().startsWith('#')) return;
    const indent = raw.match(/^ */)[0].length;
    tokens.push({ indent, text: raw.trim(), line: index + 2 });
  });
  return tokens;
}

function splitKeyValue(text) {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === ':' && !inSingle && !inDouble) {
      return [text.slice(0, i).trim(), text.slice(i + 1).trim()];
    }
  }
  return null;
}

function splitInline(text) {
  const parts = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  for (const ch of text) {
    if (ch === '"' && !inSingle) inDouble = !inSingle;
    else if (ch === "'" && !inDouble) inSingle = !inSingle;
    if (ch === ',' && !inSingle && !inDouble) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function unquote(text) {
  const quote = text[0];
  let value = text.slice(1, -1);
  value = value.replaceAll(`\\${quote}`, quote);
  value = value.replaceAll('\\\\', '\\');
  return value;
}

function parseScalar(text) {
  const value = text.trim();
  if (!value || value === 'null' || value === '~') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value.startsWith('[') && value.endsWith(']')) {
    const inner = value.slice(1, -1).trim();
    return inner ? splitInline(inner).map(parseScalar) : [];
  }
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return unquote(value);
  }
  return value;
}

function parseMap(tokens, start, indent) {
  const obj = {};
  let i = start;
  while (i < tokens.length) {
    const token = tokens[i];
    if (token.indent < indent) break;
    if (token.indent > indent) throw new Error(`unexpected indentation at line ${token.line}`);
    if (token.text.startsWith('- ')) break;
    const pair = splitKeyValue(token.text);
    if (!pair) throw new Error(`expected "key: value" at line ${token.line}`);
    const [key, rawValue] = pair;
    if (rawValue !== '') {
      obj[key] = parseScalar(rawValue);
      i += 1;
      continue;
    }
    if (i + 1 < tokens.length && tokens[i + 1].indent > indent) {
      const [child, next] = parseNode(tokens, i + 1, tokens[i + 1].indent);
      obj[key] = child;
      i = next;
    } else {
      obj[key] = null;
      i += 1;
    }
  }
  return [obj, i];
}

function parseArray(tokens, start, indent) {
  const arr = [];
  let i = start;
  while (i < tokens.length) {
    const token = tokens[i];
    if (token.indent < indent) break;
    if (token.indent !== indent || !token.text.startsWith('-')) break;
    const content = token.text.slice(1).trim();
    if (!content) {
      if (i + 1 < tokens.length && tokens[i + 1].indent > indent) {
        const [child, next] = parseNode(tokens, i + 1, tokens[i + 1].indent);
        arr.push(child);
        i = next;
      } else {
        arr.push(null);
        i += 1;
      }
      continue;
    }
    const isMapItem = /^[A-Za-z_][A-Za-z0-9_-]*\s*:/.test(content);
    if (!isMapItem) {
      arr.push(parseScalar(content));
      i += 1;
      continue;
    }
    const pair = splitKeyValue(content);
    if (!pair) throw new Error(`expected "key: value" at line ${token.line}`);
    const obj = {};
    obj[pair[0]] = pair[1] === '' ? null : parseScalar(pair[1]);
    i += 1;
    if (i < tokens.length && tokens[i].indent > indent) {
      const childIndent = tokens[i].indent;
      while (i < tokens.length && tokens[i].indent === childIndent) {
        if (tokens[i].text.startsWith('-')) {
          throw new Error(`nested arrays are not supported at line ${tokens[i].line}`);
        }
        const childPair = splitKeyValue(tokens[i].text);
        if (!childPair) throw new Error(`expected "key: value" at line ${tokens[i].line}`);
        const [key, rawValue] = childPair;
        if (rawValue !== '') {
          obj[key] = parseScalar(rawValue);
          i += 1;
        } else if (i + 1 < tokens.length && tokens[i + 1].indent > childIndent) {
          const [child, next] = parseNode(tokens, i + 1, tokens[i + 1].indent);
          obj[key] = child;
          i = next;
        } else {
          obj[key] = null;
          i += 1;
        }
      }
    }
    arr.push(obj);
  }
  return [arr, i];
}

function parseNode(tokens, start, indent) {
  if (start >= tokens.length) return [null, start];
  return tokens[start].text.startsWith('- ') ? parseArray(tokens, start, indent) : parseMap(tokens, start, indent);
}

export function parseFrontmatter(text) {
  const lines = splitFrontmatter(text);
  if (!lines) throw new Error('missing YAML frontmatter');
  const tokens = tokenize(lines);
  if (tokens.length === 0) throw new Error('empty frontmatter');
  if (tokens[0].indent !== 0) throw new Error('frontmatter must start at column 0');
  const [value, next] = parseNode(tokens, 0, 0);
  if (next !== tokens.length) throw new Error(`unparsed frontmatter at line ${tokens[next].line}`);
  return value;
}

export function splitBody(text) {
  const lines = text.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') return '';
  const end = lines.findIndex((line, i) => i > 0 && line.trim() === '---');
  if (end === -1) return '';
  return lines.slice(end + 1).join('\n').trim();
}

// -------------------------------------------------- detailed parse (raw) --

const TOP_KEY_RE = /^[A-Za-z_][A-Za-z0-9_-]*:/;

function valuesEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Like parseFrontmatter + splitBody, but also captures the exact source text
// of every top-level field so that serializeClaim() can write untouched
// fields back byte-for-byte (minimal git diffs, round-trip fidelity).
export function parseClaimFile(text) {
  const lines = text.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') throw new Error('missing YAML frontmatter');
  let end = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i].trim() === '---') { end = i; break; }
  }
  if (end === -1) throw new Error('missing closing ---');
  const fmLines = lines.slice(1, end);
  const data = parseFrontmatter(text);
  const fields = new Map();
  const starts = [];
  fmLines.forEach((line, i) => {
    if (TOP_KEY_RE.test(line)) starts.push(i);
  });
  starts.forEach((start, index) => {
    const stop = index + 1 < starts.length ? starts[index + 1] : fmLines.length;
    const key = splitKeyValue(fmLines[start])[0];
    fields.set(key, { raw: fmLines.slice(start, stop).join('\n'), value: data[key] });
  });
  return {
    data,
    body: splitBody(text),
    body0: splitBody(text),
    fields,
    tail: lines.slice(end + 1).join('\n'),
  };
}

// ------------------------------------------------------------- loading --

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

export function loadClaims(root = ROOT) {
  const claimsDir = path.join(root, 'claims');
  const errors = [];
  const claims = [];
  if (!fs.existsSync(claimsDir)) {
    return { claims, errors: ['claims/ does not exist'] };
  }
  const files = walk(claimsDir).filter((file) => file.endsWith('.md'));
  for (const file of files) {
    const rel = path.relative(root, file).split(path.sep).join('/');
    try {
      const data = parseFrontmatter(fs.readFileSync(file, 'utf8'));
      claims.push({ file, rel, data });
    } catch (error) {
      errors.push(`${rel}: ${error.message}`);
    }
  }
  return { claims, errors };
}

// Same as loadClaims but keeps raw field capture and body for the serializer.
export function loadClaimsFull(root = ROOT) {
  const claimsDir = path.join(root, 'claims');
  const errors = [];
  const claims = [];
  if (!fs.existsSync(claimsDir)) {
    return { claims, errors: ['claims/ does not exist'] };
  }
  const files = walk(claimsDir).filter((file) => file.endsWith('.md'));
  for (const file of files) {
    const rel = path.relative(root, file).split(path.sep).join('/');
    try {
      const text = fs.readFileSync(file, 'utf8');
      const parsed = parseClaimFile(text);
      claims.push({ file, rel, text, ...parsed });
    } catch (error) {
      errors.push(`${rel}: ${error.message}`);
    }
  }
  return { claims, errors };
}

// ---------------------------------------------------------- validation --

function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function checkRepoPath(value, label, errors, root) {
  if (typeof value !== 'string') return;
  if (/^https?:\/\/\S+$/i.test(value)) return;
  let clean;
  try { clean = decodeURIComponent(value.split('#')[0]); }
  catch { errors.push(`${label}: invalid path encoding`); return; }
  const layer = clean.split('/')[0];
  if (!['library', 'claims', 'nightshift'].includes(layer) || /[\\\x00-\x1f:]/.test(clean)) {
    errors.push(`${label}: expected a repository source path or http(s) URL`);
    return;
  }
  const abs = path.resolve(root, clean);
  const base = path.resolve(root, layer);
  if (abs !== base && !abs.startsWith(`${base}${path.sep}`)) {
    errors.push(`${label}: path escapes its layer: ${clean}`);
    return;
  }
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) errors.push(`${label}: file not found: ${clean}`);
  else {
    const real = fs.realpathSync(abs);
    const realBase = fs.realpathSync(base);
    if (!real.startsWith(`${realBase}${path.sep}`)) errors.push(`${label}: source escapes its layer`);
  }
}

export function validateClaims(claims, root = ROOT) {
  const errors = [];
  const ids = new Set();
  for (const claim of claims) {
    const { data, rel } = claim;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      errors.push(`${rel}: frontmatter must be a map`);
      continue;
    }
    const required = ['id', 'title', 'type', 'status', 'scope', 'stance', 'evidence'];
    for (const key of required) {
      if (data[key] === undefined || data[key] === null || (typeof data[key] === 'string' && !data[key].trim())) {
        errors.push(`${rel}: missing ${key}`);
      }
    }
    for (const key of ['title', 'scope']) {
      if (typeof data[key] !== 'string') errors.push(`${rel}: ${key} must be text`);
    }
    if (data.type !== 'claim') errors.push(`${rel}: type must be "claim"`);
    const id = typeof data.id === 'string' ? data.id : '';
    if (!CLAIM_ID.test(id)) {
      errors.push(
        `${rel}: id must be "claim-" plus a lowercase kebab-case slug, e.g. claim-qwt-r2-gate-nonregression`
      );
    } else if (id.length > MAX_ID_LENGTH) {
      errors.push(`${rel}: id must be at most ${MAX_ID_LENGTH} characters`);
    }
    if (path.basename(claim.file, '.md') !== data.id) {
      errors.push(`${rel}: filename must equal id`);
    }
    if (ids.has(data.id)) errors.push(`${rel}: duplicate id ${data.id}`);
    ids.add(data.id);
    if (!STATUSES.has(data.status)) errors.push(`${rel}: invalid status "${data.status}"`);
    if (!STANCES.has(data.stance)) errors.push(`${rel}: invalid stance "${data.stance}"`);
    if (!Array.isArray(data.evidence) || data.evidence.length === 0) {
      errors.push(`${rel}: evidence must be a non-empty array`);
    } else {
      data.evidence.forEach((item, index) => {
        for (const key of ['source', 'locator', 'quote', 'relation']) {
          if (typeof item?.[key] !== 'string' || !item[key].trim()) errors.push(`${rel}: evidence[${index}].${key} must be non-blank text`);
        }
        if (!RELATIONS.has(item?.relation)) {
          errors.push(`${rel}: evidence[${index}].relation must be supports or contradicts`);
        }
        checkRepoPath(item?.source, `${rel}: evidence[${index}].source`, errors, root);
      });
    }
    if (data.falsifiers !== undefined) {
      if (!Array.isArray(data.falsifiers)) {
        errors.push(`${rel}: falsifiers must be an array when provided`);
      } else if (data.falsifiers.some((v) => typeof v !== 'string' || !v.trim())) {
        errors.push(`${rel}: falsifiers entries must be non-blank text`);
      }
    }
    if (data.tags !== undefined && !Array.isArray(data.tags)) {
      errors.push(`${rel}: tags must be an array`);
    } else if (Array.isArray(data.tags) && data.tags.some((v) => typeof v !== 'string')) {
      errors.push(`${rel}: tags entries must be text`);
    }
    if (data.note !== undefined) {
      if (typeof data.note !== 'string' || !data.note.startsWith('library/')) {
        errors.push(`${rel}: note must start with library/`);
      } else {
        checkRepoPath(data.note, `${rel}: note`, errors, root);
      }
    }
    if (data.review_due !== undefined && !isDate(data.review_due)) {
      errors.push(`${rel}: review_due must be a valid YYYY-MM-DD date`);
    }
    if (data.status === 'verified') {
      const signoff = data.signoff;
      if (!signoff || typeof signoff !== 'object' || Array.isArray(signoff)) {
        errors.push(`${rel}: verified claim requires signoff`);
      } else {
        for (const key of ['by', 'at']) {
          if (!signoff[key]) errors.push(`${rel}: signoff.${key} is required`);
        }
        if (!isDate(signoff.at)) errors.push(`${rel}: signoff.at must be a valid date`);
        if (signoff.method !== undefined && !METHODS.has(signoff.method)) {
          errors.push(`${rel}: signoff.method must be read, reproduced, or cross-checked`);
        }
      }
    }
    if (data.related !== undefined && !Array.isArray(data.related)) {
      errors.push(`${rel}: related must be an array`);
    } else if (Array.isArray(data.related) && data.related.some((v) => typeof v !== 'string' || !v.trim())) {
      errors.push(`${rel}: related entries must be non-blank ids`);
    }
  }
  for (const claim of claims) {
    if (Array.isArray(claim.data?.related)) {
      for (const id of claim.data.related) {
        if (!ids.has(id)) errors.push(`${claim.rel}: related claim not found: ${id}`);
      }
    }
  }
  return errors;
}

// ---------------------------------------------------------------- index --

export function buildIndex(claims, root = ROOT) {
  const indexDir = path.join(root, 'index');
  fs.mkdirSync(indexDir, { recursive: true });
  const rows = claims
    .map(({ rel, data }) => ({
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
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  const output = path.join(indexDir, 'claims.jsonl');
  const temporary = `${output}.tmp`;
  try {
    fs.writeFileSync(temporary, `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`, 'utf8');
    fs.renameSync(temporary, output);
  } finally {
    fs.rmSync(temporary, { force: true });
  }
  console.log(`wrote ${rows.length} claim(s) to ${path.relative(root, output)}`);
  return rows;
}

export function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

// ----------------------------------------------------------- serializer --

const ALWAYS_DOUBLE_QUOTED = new Set(['title', 'scope', 'paper', 'locator', 'quote']);
const SIGNOFF_ORDER = ['by', 'at', 'method', 'evidence_hash'];

// Plain scalars are safe for this repo's YAML subset unless they are empty,
// carry leading/trailing whitespace, or contain quotes / ASCII colons /
// " #" comment sequences / a leading YAML indicator character.
function needsQuotes(value) {
  if (value === '') return true;
  if (typeof value !== 'string') return false;
  if (/^\s|\s$/.test(value)) return true;
  if (/["':]/.test(value)) return true;
  if (value.includes(' #')) return true;
  if (/^[-?:,[\]{}#&*!|>%@`~]/.test(value)) return true;
  if (/^(null|~|true|false)$/i.test(value)) return true;
  return false;
}

function escapeDoubleQuoted(value) {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

// Reject values this YAML subset cannot round-trip on a single line.
function assertOneLine(value, label) {
  if (/[\r\n]/.test(value)) {
    throw new Error(`${label}: multi-line strings are not supported in frontmatter`);
  }
}

function renderInlineScalar(value, { forceQuote = false } = {}) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  const text = String(value);
  if (forceQuote || needsQuotes(text)) return `"${escapeDoubleQuoted(text)}"`;
  return text;
}

function renderField(key, value) {
  if (value === null || value === undefined) return `${key}: null`;
  if (Array.isArray(value)) {
    if (key === 'evidence') {
      if (value.length === 0) return `${key}: []`;
      const rows = value.map((item) => {
        const line = (field, inner, forceQuote) =>
          `    ${field}: ${renderInlineScalar(inner, { forceQuote })}`;
        assertOneLine(String(item?.locator ?? ''), `${key}.locator`);
        assertOneLine(String(item?.quote ?? ''), `${key}.quote`);
        return [
          `  - source: ${renderInlineScalar(item?.source ?? null)}`,
          line('locator', item?.locator ?? null, true),
          line('quote', item?.quote ?? null, true),
          line('relation', item?.relation ?? null),
        ].join('\n');
      });
      return `${key}:\n${rows.join('\n')}`;
    }
    if (key === 'falsifiers') {
      if (value.length === 0) return `${key}: []`;
      const rows = value.map((item) => {
        const text = String(item ?? '');
        assertOneLine(text, key);
        return `  - ${renderInlineScalar(text, { forceQuote: true })}`;
      });
      return `${key}:\n${rows.join('\n')}`;
    }
    if (value.length === 0) return `${key}: []`;
    const items = value.map((item) => renderInlineScalar(item)).join(', ');
    return `${key}: [${items}]`;
  }
  if (typeof value === 'object') {
    const keys = key === 'signoff'
      ? [...SIGNOFF_ORDER, ...Object.keys(value).filter((k) => !SIGNOFF_ORDER.includes(k))]
      : Object.keys(value);
    const rows = keys
      .filter((k) => value[k] !== undefined)
      .map((k) => `  ${k}: ${renderInlineScalar(value[k])}`);
    if (rows.length === 0) return `${key}: {}`;
    return `${key}:\n${rows.join('\n')}`;
  }
  const text = typeof value === 'string' ? value : String(value);
  assertOneLine(text, key);
  if (ALWAYS_DOUBLE_QUOTED.has(key)) {
    return `${key}: "${escapeDoubleQuoted(text)}"`;
  }
  return `${key}: ${renderInlineScalar(text)}`;
}

// Rebuild the full claim file from a parsed card (as returned by
// parseClaimFile, possibly with mutated `data` / `body`). Fields whose value
// did not change are written back with their original source text, so
// untouched cards round-trip byte-for-byte and edits produce minimal diffs.
export function serializeClaim(card) {
  const { data, body, body0, fields, tail } = card;
  const keys = FIELD_ORDER.filter((key) => data[key] !== undefined);
  for (const key of Object.keys(data)) {
    if (!FIELD_ORDER.includes(key) && data[key] !== undefined) keys.push(key);
  }
  const fmLines = keys.map((key) => {
    const raw = fields?.get(key);
    if (raw && valuesEqual(raw.value, data[key])) return raw.raw;
    return renderField(key, data[key]);
  });
  const trimmedBody = String(body ?? '').trim();
  const tailOut = tail !== undefined && trimmedBody === body0 ? tail : `\n${trimmedBody}\n`;
  return `---\n${fmLines.join('\n')}\n---\n${tailOut}`;
}
