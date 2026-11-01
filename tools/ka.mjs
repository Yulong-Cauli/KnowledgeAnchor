#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLAIMS_DIR = path.join(ROOT, 'claims');
const LIBRARY_DIR = path.join(ROOT, 'library');
const INDEX_DIR = path.join(ROOT, 'index');
const STATUSES = new Set(['asserted', 'verified', 'refuted', 'stale']);
const STANCES = new Set(['adopt', 'trial', 'watch', 'avoid']);
const METHODS = new Set(['read', 'reproduced', 'cross-checked']);
const RELATIONS = new Set(['supports', 'contradicts']);
const CLAIM_ID = /^claim-[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const MAX_ID_LENGTH = 80;

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
    if (ch === '"' && !inSingle) inDouble = !inDouble;
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

function parseFrontmatter(text) {
  const lines = splitFrontmatter(text);
  if (!lines) throw new Error('missing YAML frontmatter');
  const tokens = tokenize(lines);
  if (tokens.length === 0) throw new Error('empty frontmatter');
  if (tokens[0].indent !== 0) throw new Error('frontmatter must start at column 0');
  const [value, next] = parseNode(tokens, 0, 0);
  if (next !== tokens.length) throw new Error(`unparsed frontmatter at line ${tokens[next].line}`);
  return value;
}

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

function loadClaims() {
  const errors = [];
  const claims = [];
  if (!fs.existsSync(CLAIMS_DIR)) {
    return { claims, errors: ['claims/ does not exist'] };
  }
  const files = walk(CLAIMS_DIR).filter((file) => file.endsWith('.md'));
  for (const file of files) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/');
    try {
      const data = parseFrontmatter(fs.readFileSync(file, 'utf8'));
      claims.push({ file, rel, data });
    } catch (error) {
      errors.push(`${rel}: ${error.message}`);
    }
  }
  return { claims, errors };
}

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

function checkRepoPath(value, label, errors) {
  if (typeof value !== 'string') return;
  const isLibrary = value.startsWith('library/');
  const isClaim = value.startsWith('claims/');
  if (!isLibrary && !isClaim) return;
  const clean = value.split('#')[0];
  const abs = path.resolve(ROOT, clean);
  const base = isLibrary ? path.resolve(LIBRARY_DIR) : path.resolve(CLAIMS_DIR);
  if (abs !== base && !abs.startsWith(`${base}${path.sep}`)) {
    errors.push(`${label}: path escapes its layer: ${clean}`);
    return;
  }
  if (!fs.existsSync(abs)) errors.push(`${label}: file not found: ${clean}`);
}

function validateClaims(claims) {
  const errors = [];
  const ids = new Set();
  for (const claim of claims) {
    const { data, rel } = claim;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      errors.push(`${rel}: frontmatter must be a map`);
      continue;
    }
    const required = ['id', 'title', 'type', 'status', 'scope', 'stance', 'evidence', 'falsifiers'];
    for (const key of required) {
      if (data[key] === undefined || data[key] === null || data[key] === '') {
        errors.push(`${rel}: missing ${key}`);
      }
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
          if (!item?.[key]) errors.push(`${rel}: evidence[${index}].${key} is required`);
        }
        if (!RELATIONS.has(item?.relation)) {
          errors.push(`${rel}: evidence[${index}].relation must be supports or contradicts`);
        }
        checkRepoPath(item?.source, `${rel}: evidence[${index}].source`, errors);
      });
    }
    if (!Array.isArray(data.falsifiers) || data.falsifiers.length === 0) {
      errors.push(`${rel}: falsifiers must be a non-empty array`);
    }
    if (data.tags !== undefined && !Array.isArray(data.tags)) {
      errors.push(`${rel}: tags must be an array`);
    }
    if (data.note !== undefined) {
      if (typeof data.note !== 'string' || !data.note.startsWith('library/')) {
        errors.push(`${rel}: note must start with library/`);
      } else {
        checkRepoPath(data.note, `${rel}: note`, errors);
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
        for (const key of ['by', 'at', 'method', 'evidence_hash']) {
          if (!signoff[key]) errors.push(`${rel}: signoff.${key} is required`);
        }
        if (!isDate(signoff.at)) errors.push(`${rel}: signoff.at must be a valid date`);
        if (!METHODS.has(signoff.method)) {
          errors.push(`${rel}: signoff.method must be read, reproduced, or cross-checked`);
        }
      }
      if (!data.review_due) errors.push(`${rel}: verified claim requires review_due`);
    }
    if (data.related !== undefined && !Array.isArray(data.related)) {
      errors.push(`${rel}: related must be an array`);
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

function buildIndex(claims) {
  fs.mkdirSync(INDEX_DIR, { recursive: true });
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
  const output = path.join(INDEX_DIR, 'claims.jsonl');
  fs.writeFileSync(output, `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`, 'utf8');
  console.log(`wrote ${rows.length} claim(s) to ${path.relative(ROOT, output)}`);
}

function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function review(claims) {
  const today = todayString();
  const rows = claims
    .map(({ data, rel }) => ({ ...data, path: rel }))
    .filter((row) => {
      if (row.status === 'asserted' || row.status === 'stale') return true;
      return row.status === 'verified' && row.review_due && row.review_due <= today;
    })
    .sort((a, b) => {
      const dueA = a.review_due ?? '9999-99-99';
      const dueB = b.review_due ?? '9999-99-99';
      return dueA.localeCompare(dueB) || a.id.localeCompare(b.id);
    });
  if (rows.length === 0) {
    console.log('review queue is empty');
    return;
  }
  for (const row of rows) {
    console.log(
      `${row.status.padEnd(8)} ${row.id}  stance=${row.stance}  due=${row.review_due ?? '-'}  ${row.title}`
    );
  }
  console.log(`\n${rows.length} claim(s) need attention`);
}

function printUsage() {
  console.log('Usage: node tools/ka.mjs <validate|index|review>');
}

const command = process.argv[2] ?? 'help';
const { claims, errors: loadErrors } = loadClaims();
const errors = [...loadErrors, ...(loadErrors.length ? [] : validateClaims(claims))];

if (command === 'help' || command === '--help') {
  printUsage();
  process.exit(0);
}

if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}

if (command === 'validate') {
  console.log(`OK: ${claims.length} claim(s) validated`);
} else if (command === 'index') {
  buildIndex(claims);
} else if (command === 'review') {
  review(claims);
} else {
  printUsage();
  process.exit(2);
}
