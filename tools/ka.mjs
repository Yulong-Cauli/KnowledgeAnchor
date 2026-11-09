#!/usr/bin/env node
// KnowledgeAnchor CLI. Parsing / validation / indexing live in ka-lib.mjs;
// this file is the command-line entry (validate | index | review | viz).
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import {
  INDEX_DIR,
  buildIndex,
  loadClaims,
  splitBody,
  todayString,
  validateClaims,
} from './ka-lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VIEW_TEMPLATE = path.join(ROOT, 'tools', 'view-template.html');
const VIEW_PLACEHOLDER = '__KA_DATA__';

function buildViz(claims) {
  if (!fs.existsSync(VIEW_TEMPLATE)) {
    console.error(`ERROR: view template not found: ${path.relative(ROOT, VIEW_TEMPLATE)}`);
    process.exit(1);
  }
  const template = fs.readFileSync(VIEW_TEMPLATE, 'utf8');
  if (!template.includes(VIEW_PLACEHOLDER)) {
    console.error(`ERROR: ${path.basename(VIEW_TEMPLATE)} is missing the ${VIEW_PLACEHOLDER} placeholder`);
    process.exit(1);
  }
  fs.mkdirSync(INDEX_DIR, { recursive: true });
  const rows = claims
    .map(({ file, rel, data }) => ({
      id: data.id,
      title: data.title,
      status: data.status,
      stance: data.stance,
      scope: data.scope,
      tags: data.tags ?? [],
      note: data.note ?? null,
      paper: data.paper ?? null,
      review_due: data.status === 'verified' ? null : data.review_due ?? null,
      related: data.related ?? [],
      evidence: data.evidence ?? [],
      falsifiers: data.falsifiers ?? [],
      signoff: data.signoff ?? null,
      body: splitBody(fs.readFileSync(file, 'utf8')),
      path: rel,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  const payload = JSON.stringify({ generated_at: todayString(), claims: rows }).replaceAll('<', '\\u003c');
  const output = path.join(INDEX_DIR, 'view.html');
  fs.writeFileSync(output, template.replace(VIEW_PLACEHOLDER, () => payload), 'utf8');
  console.log(`wrote ${rows.length} claim(s) to ${path.relative(ROOT, output)}`);
}

function review(claims) {
  const rows = claims
    .map(({ data, rel }) => ({ ...data, path: rel }))
    .filter((row) => row.status === 'asserted' || row.status === 'stale')
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
  console.log('Usage: node tools/ka.mjs <validate|index|review|viz>');
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
} else if (command === 'viz') {
  buildViz(claims);
} else {
  printUsage();
  process.exit(2);
}
