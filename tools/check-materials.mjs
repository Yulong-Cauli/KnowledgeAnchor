#!/usr/bin/env node
// check-materials.mjs — consistency check between library/assets/ material dirs
// and the paper notes (.md) under the library category dirs.
//
// Reports:
//   [1] asset dirs that match no note
//   [2] notes whose expected asset dir is missing or empty
//   [3] image files under library/assets/ that no note references
//
// Matching rules for [1]/[2], applied in order (first hit wins):
//   exact       raw dir name equals the note file stem (case-insensitive)
//   normalized  both sides lower-cased with spaces/hyphens removed
//   alias       both sides mapped through the built-in ALIASES table
//   contains    normalized dir name is a substring of the normalized note
//               stem or first H1 title (min 3 chars, guards degenerate hits)
//
// Image references for [3] are collected from every *.md under library/
// EXCEPT the ones inside library/assets/ itself (those are paper-conversion
// dumps, not notes). Both markdown images ![alt](url) and HTML <img src=url>
// count. Local URLs resolve relative to the note file; remote http(s) URLs
// count as a reference when their path contains "/assets/<dir>/<file>".
//
// Exit code is 1 when [1] or [2] found a gap, else 0 (maintenance gate).
// Images nobody references ([3]) alone do not fail the run.
//
// Usage: node tools/check-materials.mjs [--verbose] [--help]
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIBRARY_DIR = path.join(ROOT, 'library');
const ASSETS_DIRNAME = 'assets';
const ASSETS_DIR = path.join(LIBRARY_DIR, ASSETS_DIRNAME);
const VERBOSE = process.argv.includes('--verbose');

const IMAGE_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp', '.avif', '.ico', '.tif', '.tiff',
]);

// Known dir-name <-> note-name mappings in this library: [variant, canonical].
// Keys are normalized before lookup, so entries below are the raw spellings as
// they occur on disk. Keep this table in sync when a draft is imported under a
// new name.
const ALIASES = [
  // draft-name -> imported note name (nightshift 2026-11-03 import batch)
  ['Alpamago', 'Alpamayo-R1'],
  ['BRCEQ', 'BRECQ'],
  // spelled with/without separators (normalization already folds hyphens,
  // kept here so the mapping stays explicit if one side changes spelling)
  ['Qwen3VL', 'Qwen3-VL'],
  // '+' vs 'PP' spelling of the RC-BEVDet follow-up
  ['RCBEVDet++', 'RCBEVDetPP'],
  // MobileNet.md is a family note covering V1 -> V2 -> V3
  ['MobileNetV2', 'MobileNet'],
  ['MobileV3', 'MobileNet'],
];

function norm(name) {
  return name.toLowerCase().replace(/[\s\u2010-\u2015\u2212-]+/g, '');
}

const ALIAS_LOOKUP = new Map(ALIASES.map(([variant, canonical]) => [norm(variant), canonical]));

function canon(name) {
  const key = norm(name);
  const raw = ALIAS_LOOKUP.get(key);
  return raw ? norm(raw) : key;
}

function decodeURIComponentSafe(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function walkFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(abs, out);
    else if (entry.isFile()) out.push(abs);
  }
  return out;
}

// Extract URLs that embed images: markdown images and HTML <img src>.
function extractImageUrls(text) {
  const urls = [];
  for (const match of text.matchAll(/!\[[^\]]*\]\(\s*<?([^)\s>]+)>?[^)]*\)/g)) {
    urls.push(match[1]);
  }
  for (const match of text.matchAll(/<img\b[^>]*?\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    urls.push(match[1] ?? match[2]);
  }
  return urls;
}

function collectNotes() {
  const categories = fs
    .readdirSync(LIBRARY_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== ASSETS_DIRNAME)
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
  const notes = [];
  for (const category of categories) {
    for (const file of walkFiles(path.join(LIBRARY_DIR, category))) {
      if (path.extname(file) !== '.md') continue;
      const text = fs.readFileSync(file, 'utf8');
      const titleMatch = text.match(/^#\s+(.+)$/m);
      notes.push({
        file,
        rel: path.relative(ROOT, file),
        category,
        stem: path.basename(file, '.md').trim(),
        title: titleMatch ? titleMatch[1].trim() : '',
        imageLinkCount: extractImageUrls(text).length,
      });
    }
  }
  return notes;
}

function collectAssetDirs() {
  if (!fs.existsSync(ASSETS_DIR)) return [];
  return fs
    .readdirSync(ASSETS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = path.join(ASSETS_DIR, entry.name);
      const files = walkFiles(dir);
      return {
        name: entry.name,
        dir,
        rel: path.relative(ROOT, dir) + path.sep,
        files,
        images: files.filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase())),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Which rule (if any) links an asset dir to a note. First hit wins.
function matchRule(assetDir, note) {
  const dirName = assetDir.name;
  if (dirName.toLowerCase() === note.stem.toLowerCase()) return 'exact';
  const names = [note.stem, note.title].filter(Boolean);
  const dirNorm = norm(dirName);
  const dirCanon = canon(dirName);
  if (names.some((name) => norm(name) === dirNorm)) return 'normalized';
  // Reaching here means normalized equality failed, so a canon hit is a real alias match.
  if (names.some((name) => canon(name) === dirCanon)) return 'alias';
  if (dirNorm.length >= 3 && names.some((name) => norm(name).includes(dirNorm))) return 'contains';
  return null;
}

function collectReferences() {
  // All *.md under library/, excluding conversion dumps inside assets/.
  const markdownFiles = walkFiles(LIBRARY_DIR).filter(
    (file) => path.extname(file) === '.md' && !file.startsWith(ASSETS_DIR + path.sep)
  );
  const referenced = new Set();
  for (const file of markdownFiles) {
    const text = fs.readFileSync(file, 'utf8');
    for (const rawUrl of extractImageUrls(text)) {
      const url = rawUrl.trim();
      if (/^https?:\/\//i.test(url)) {
        const marker = url.indexOf(`/${ASSETS_DIRNAME}/`);
        if (marker === -1) continue;
        const rel = url
          .slice(marker + ASSETS_DIRNAME.length + 2)
          .split(/[?#]/)[0];
        referenced.add(path.normalize(path.join(ASSETS_DIR, decodeURIComponentSafe(rel))));
        continue;
      }
      const target = path.resolve(
        path.dirname(file),
        decodeURIComponentSafe(url.split(/[?#]/)[0])
      );
      if (target === ASSETS_DIR || target.startsWith(ASSETS_DIR + path.sep)) {
        referenced.add(path.normalize(target));
      }
    }
  }
  return referenced;
}

function printUsage() {
  console.log('Usage: node tools/check-materials.mjs [--verbose]');
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  printUsage();
  process.exit(0);
}

const notes = collectNotes();
const assetDirs = collectAssetDirs();
const referencedImages = collectReferences();

if (VERBOSE) {
  console.log(`scanned ${notes.length} note(s) in ${new Set(notes.map((n) => n.category)).size} categories,`);
  console.log(`${assetDirs.length} asset dir(s), ${assetDirs.reduce((sum, d) => sum + d.images.length, 0)} image(s) under library/assets/`);
  console.log('');
  console.log('dir -> note matches:');
  for (const dir of assetDirs) {
    const hits = notes
      .map((note) => ({ note, rule: matchRule(dir, note) }))
      .filter((hit) => hit.rule)
      .map((hit) => `${hit.note.rel} [${hit.rule}]`);
    console.log(`  ${dir.rel} -> ${hits.length ? hits.join(', ') : '(none)'}`);
  }
  console.log('');
}

// [1] asset dirs with no matching note.
const orphanDirs = assetDirs.filter((dir) => !notes.some((note) => matchRule(dir, note)));

// [2] notes whose expected asset dir is missing or empty.
const notesWithoutAssets = notes
  .map((note) => {
    const matched = assetDirs.filter((dir) => matchRule(dir, note));
    const usable = matched.filter((dir) => dir.files.length > 0);
    if (usable.length > 0) return null;
    return {
      note,
      reason: matched.length === 0
        ? `no asset dir matches "${note.stem}"`
        : `matched dir empty: ${matched.map((dir) => dir.rel).join(', ')}`,
    };
  })
  .filter(Boolean);

// [3] unreferenced images inside asset dirs.
const allImages = assetDirs.flatMap((dir) => dir.images);
const unreferencedImages = allImages.filter((file) => !referencedImages.has(path.normalize(file)));

const gaps = orphanDirs.length + notesWithoutAssets.length;
for (const dir of orphanDirs) {
  const referencedHere = dir.images.filter((file) => referencedImages.has(path.normalize(file))).length;
  console.log(`[1] asset dir without note: ${dir.rel} (${dir.images.length} image(s), ${referencedHere} referenced)`);
}
for (const { note, reason } of notesWithoutAssets) {
  console.log(`[2] note without asset dir: ${note.rel} (${reason}; ${note.imageLinkCount} image link(s) in note)`);
}
for (const file of unreferencedImages) {
  console.log(`[3] unreferenced image: ${path.relative(ROOT, file)}`);
}
console.log(
  `summary: ${assetDirs.length} asset dir(s), ${notes.length} note(s), ${referencedImages.size} of ${allImages.length} image(s) referenced; ` +
    `gaps [1]=${orphanDirs.length} [2]=${notesWithoutAssets.length} [3]=${unreferencedImages.length}`
);
if (gaps > 0) {
  console.log(`FAIL: ${gaps} gap(s) of class [1]/[2]`);
  process.exit(1);
}
console.log('OK: no [1]/[2] gaps');
