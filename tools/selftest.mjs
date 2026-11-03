#!/usr/bin/env node
// Self-test for the ka-lib frontmatter serializer (tmp_docs/ka-web-ui-design.md §3.3):
//   1. round-trip: every card in claims/ parses -> serializes back byte-for-byte
//   2. splice: editing one field must not reflow any untouched field
//   3. canonical: freshly rendered values survive their own serialize -> parse cycle
// Run: node tools/selftest.mjs
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { CLAIMS_DIR, parseClaimFile, serializeClaim } from './ka-lib.mjs';

let failures = 0;
function check(name, ok, detail = '') {
  if (ok) {
    console.log(`PASS ${name}`);
  } else {
    failures += 1;
    console.error(`FAIL ${name}${detail ? `\n     ${detail}` : ''}`);
  }
}

function listCards() {
  return fs
    .readdirSync(CLAIMS_DIR)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .map((name) => path.join(CLAIMS_DIR, name));
}

// -- 1. round-trip fidelity on the whole corpus -----------------------------
let roundTripFailures = 0;
for (const file of listCards()) {
  const text = fs.readFileSync(file, 'utf8');
  try {
    const card = parseClaimFile(text);
    const out = serializeClaim(card);
    if (out !== text) {
      roundTripFailures += 1;
      const lines = text.split('\n');
      const outLines = out.split('\n');
      let first = 0;
      while (first < lines.length && lines[first] === outLines[first]) first += 1;
      console.error(`     ${path.basename(file)}: first diff at line ${first + 1}`);
      console.error(`       want: ${JSON.stringify(lines[first])}`);
      console.error(`       got : ${JSON.stringify(outLines[first])}`);
    }
  } catch (error) {
    roundTripFailures += 1;
    console.error(`     ${path.basename(file)}: ${error.message}`);
  }
}
check(`round-trip: ${listCards().length} cards byte-identical`, roundTripFailures === 0);

// -- 2. splice: a title edit leaves every other field byte-identical --------
{
  const file = listCards()[0];
  const text = fs.readFileSync(file, 'utf8');
  const card = parseClaimFile(text);
  const newTitle = `编辑后的标题：test ${Date.now()}`;
  card.data.title = newTitle;
  const out = serializeClaim(card);
  const before = text.split('\n');
  const after = out.split('\n');
  const changed = [];
  for (let i = 0; i < Math.max(before.length, after.length); i += 1) {
    if (before[i] !== after[i]) changed.push(i + 1);
  }
  const reparsed = parseClaimFile(out);
  check(
    'splice: title-only edit changes exactly one frontmatter line',
    changed.length === 1 && after[changed[0] - 1] === `title: "${newTitle}"`,
    `changed lines: ${changed.join(', ')}`
  );
  check('splice: edited card re-parses to the mutated title', reparsed.data.title === newTitle);
  check(
    'splice: evidence block untouched by title edit',
    reparsed.fields.get('evidence').raw === card.fields.get('evidence').raw
  );
}

// -- 3. canonical rendering round-trips its own output -----------------------
const nasty = {
  id: 'claim-selftest-canonical-render-roundtrip',
  title: '含"双引号"与\\反斜杠\\、ASCII:冒号、#井号、末尾空格 ',
  type: 'claim',
  status: 'asserted',
  scope: 'selftest only; not part of the corpus',
  tags: ['alpha', 'beta gamma', 'delta', ''],
  note: 'library/Self Test Note.md#section-with-dash',
  paper: 'arXiv 2000, Self Test (https://example.org/a:b)',
  stance: 'watch',
  evidence: [
    {
      source: 'library/Self Test Note.md',
      locator: '§1 / p.2',
      quote: 'she said \\"hello\\" then $x \\times y$ broke',
      relation: 'supports',
    },
    {
      source: 'https://example.org/abs/1234.5678',
      locator: '§2',
      quote: 'plain words only',
      relation: 'contradicts',
    },
  ],
  falsifiers: ['first \\"falsifier\\" with \\\\ backslash', 'plain falsifier', ''],
  review_due: '2027-01-31',
  related: [],
  signoff: null,
};
{
  const card = { data: nasty, body: '## 我的理解\n\n含 **加粗** 与 `code`。\n', fields: new Map(), tail: undefined };
  const text1 = serializeClaim(card);
  let parsed;
  try {
    parsed = parseClaimFile(text1);
  } catch (error) {
    parsed = null;
    check('canonical: nasty card parses', false, error.message);
  }
  if (parsed) {
    check('canonical: values survive serialize -> parse', JSON.stringify(parsed.data) === JSON.stringify(nasty));
    const text2 = serializeClaim(parsed);
    check('canonical: serialization is stable (idempotent)', text1 === text2);
    check('canonical: signoff rendered as literal null', /^signoff: null$/m.test(text1));
    check('canonical: empty related rendered as []', /^related: \[\]$/m.test(text1));
    check('canonical: empty tag rendered quoted', /tags: \[alpha, beta gamma, delta, ""\]/m.test(text1));
    check('canonical: body preserved', parsed.body === '## 我的理解\n\n含 **加粗** 与 `code`。');
  }
}

process.exitCode = failures ? 1 : 0;
if (!failures) console.log('\nall selftests passed');
