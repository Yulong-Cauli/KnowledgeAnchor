// html:false disables embedded HTML rather than trusting source markup.
// KaTeX runs with trust:false; URLs are resolved through our layer allowlist.
export function slugify(text) {
  return String(text).toLowerCase().trim().replace(/\s+/gu, '-').replace(/[^\p{L}\p{N}_-]/gu, '');
}
const escape = (s) => String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

export function resolveLink(href, source = '') {
  let value;
  try { value = decodeURIComponent(String(href).trim()); } catch { return null; }
  if (!value || /[\x00-\x1f\\]/u.test(value)) return null;
  // Existing notes use this repository's raw GitHub asset URLs. Read their
  // checked-in local counterparts so these figures also work without internet.
  const ownAsset = value.match(/^https:\/\/raw\.githubusercontent\.com\/Yulong-Cauli\/KnowledgeAnchor\/main\/(library\/assets\/.+)$/u);
  if (ownAsset) value = ownAsset[1];
  if (/^https?:\/\//iu.test(value)) return { href: String(href), external: true };
  if (/^[a-z][a-z\d+.-]*:/iu.test(value) || value.startsWith('//')) return null;
  const root = 'http://knowledge.local/';
  const base = new URL(source.split('#')[0] || 'claims/card.md', root);
  const target = new URL(/^(library|claims|nightshift)\//u.test(value) ? '/' + value : value, base);
  let rel;
  try { rel = decodeURIComponent(target.pathname).replace(/^\//u, ''); } catch { return null; }
  if (!/^(library|claims|nightshift)\//u.test(rel) || /[\\\x00-\x1f:]/u.test(rel)) return null;
  const anchor = target.hash ? decodeURIComponent(target.hash.slice(1)) : '';
  if (rel.startsWith('library/') && rel.endsWith('.md')) return { href: '#/note/' + encodeURIComponent(rel + (anchor ? '#' + anchor : '')), path: rel, anchor, kind: 'note' };
  if (/^claims\/claim-[a-z\d-]+\.md$/u.test(rel)) return { href: '#/claim/' + encodeURIComponent(rel.slice(7, -3)), path: rel, anchor, kind: 'claim' };
  if (/^nightshift\/.+\.md$/u.test(rel)) return { href: '/api/resource?path=' + encodeURIComponent(rel), path: rel, kind: 'resource' };
  if (/^library\/.+\.(pdf|png|jpe?g|gif|svg|webp|avif|bmp)$/iu.test(rel)) return { href: '/api/resource?path=' + encodeURIComponent(rel), path: rel, kind: 'resource' };
  return null;
}

export function createReader(markdownit, katex) {
  const md = markdownit({ html: false, linkify: true, typographer: false });
  const mathHtml = (content, displayMode) => {
    try { return katex.renderToString(content, { displayMode, trust: false, throwOnError: false, maxExpand: 1000, maxSize: 20, strict: 'ignore' }); }
    catch { return `<code class="math-error">${escape(content)}</code>`; }
  };
  md.inline.ruler.before('html_inline', 'safe_note_image', (s, silent) => {
    const tail = s.src.slice(s.pos);
    const image = tail.match(/^<img\b[^>]*>/iu);
    if (image) {
      const src = image[0].match(/\bsrc\s*=\s*(["'])(.*?)\1/iu)?.[2];
      if (!src) return false;
      if (!silent) {
        const token = s.push('image', 'img', 0); token.attrSet('src', src.replaceAll('&amp;', '&'));
        token.content = image[0].match(/\balt\s*=\s*(["'])(.*?)\1/iu)?.[2] ?? '笔记插图';
      }
      s.pos += image[0].length; return true;
    }
    // Accept presentation-only wrappers, never arbitrary HTML attributes.
    const wrapper = tail.match(/^<\/?div(?:\s+align\s*=\s*["'](?:center|left|right)["'])?\s*>/iu);
    if (wrapper) { s.pos += wrapper[0].length; return true; }
    return false;
  });
  md.inline.ruler.before('escape', 'math_inline', (s, silent) => {
    const start = s.pos;
    const dollar = s.src[start] === '$' && s.src[start + 1] !== '$';
    const paren = s.src.slice(start, start + 2) === '\\(';
    if (!dollar && !paren) return false;
    const open = dollar ? 1 : 2, close = dollar ? '$' : '\\)';
    if (dollar && /\s/u.test(s.src[start + 1] ?? ' ')) return false;
    let end = s.src.indexOf(close, start + open);
    while (end >= 0 && s.src[end - 1] === '\\') end = s.src.indexOf(close, end + close.length);
    if (end < 0 || (dollar && /\s/u.test(s.src[end - 1]))) return false;
    if (!silent) { const token = s.push('math_inline', 'math', 0); token.content = s.src.slice(start + open, end); }
    s.pos = end + close.length; return true;
  });
  md.block.ruler.before('fence', 'math_block', (s, start, end, silent) => {
    const offset = s.bMarks[start] + s.tShift[start];
    const line = s.src.slice(offset, s.eMarks[start]).trim();
    const open = line.startsWith('$$') ? '$$' : line.startsWith('\\[') ? '\\[' : null;
    if (!open) return false;
    if (silent) return true;
    const close = open === '$$' ? '$$' : '\\]';
    let text = line.slice(2), next = start + 1;
    if (text.endsWith(close)) text = text.slice(0, -2);
    else {
      const lines = [text];
      while (next < end) {
        const raw = s.src.slice(s.bMarks[next] + s.tShift[next], s.eMarks[next]); next += 1;
        if (raw.trimEnd().endsWith(close)) { lines.push(raw.trimEnd().slice(0, -2)); break; }
        lines.push(raw);
      }
      text = lines.join('\n');
    }
    const token = s.push('math_block', 'math', 0); token.content = text; token.map = [start, next]; s.line = next; return true;
  }, { alt: ['paragraph', 'reference', 'blockquote', 'list'] });
  md.renderer.rules.math_inline = (tokens, i) => mathHtml(tokens[i].content, false);
  md.renderer.rules.math_block = (tokens, i) => `<div class="math-scroll">${mathHtml(tokens[i].content, true)}</div>`;
  md.renderer.rules.heading_open = (tokens, i, options, env, self) => {
    const text = (tokens[i + 1].children ?? []).map((t) => t.content).join('');
    const slug = slugify(text);
    const count = env.slugs.get(slug) ?? 0; env.slugs.set(slug, count + 1);
    const id = count ? `${slug}-${count}` : slug;
    tokens[i].attrSet('id', id); env.headings.push({ id, text, level: Number(tokens[i].tag.slice(1)) });
    return self.renderToken(tokens, i, options);
  };
  md.renderer.rules.link_open = (tokens, i, options, env) => {
    const target = resolveLink(tokens[i].attrGet('href'), env.source);
    if (!target) return '<a class="disabled-link" title="不支持或不安全的链接">';
    return `<a href="${escape(target.href)}"${target.external || target.kind === 'resource' ? ' target="_blank" rel="noopener noreferrer"' : ''}>`;
  };
  md.renderer.rules.image = (tokens, i, options, env) => {
    const token = tokens[i], target = resolveLink(token.attrGet('src'), env.source);
    if (!target || (target.kind !== 'resource' && !target.external) || /\.(pdf|md)(?:[?#]|$)/iu.test(target.path ?? target.href)) return `<span class="field-hint">[图片不可用：${escape(token.content)}]</span>`;
    return `<img src="${escape(target.href)}" alt="${escape(token.content)}" loading="lazy" class="reader-image" tabindex="0" title="点击放大">`;
  };
  md.renderer.rules.table_open = () => '<div class="table-scroll"><table>';
  md.renderer.rules.table_close = () => '</table></div>';
  return {
    render(source, sourcePath = '') {
      const env = { source: sourcePath, slugs: new Map(), headings: [] };
      const html = md.render(String(source ?? ''), env);
      return { html, headings: env.headings };
    },
  };
}

export function bindImageZoom(root) {
  root.querySelectorAll('.reader-image').forEach((img) => {
    const open = () => {
      const dialog = document.createElement('dialog'); dialog.className = 'image-dialog';
      const close = document.createElement('button'); close.type = 'button'; close.className = 'btn'; close.textContent = '关闭放大图';
      const copy = document.createElement('img'); copy.src = img.src; copy.alt = img.alt;
      close.onclick = () => dialog.close(); dialog.append(close, copy); document.body.append(dialog);
      dialog.addEventListener('close', () => dialog.remove()); dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); }); dialog.showModal();
    };
    img.addEventListener('click', open); img.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
  });
}
