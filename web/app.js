// KnowledgeAnchor Web UI (tmp_docs/ka-web-ui-design.md §4).
// Vanilla JS, hash routing, no build step. The frontend only talks to the API;
// it never touches files (§9).
'use strict';

const $ = (sel, root = document) => root.querySelector(sel);

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function api(path, options) {
  const res = await fetch(path, options);
  let body = null;
  try { body = await res.json(); } catch { /* non-JSON error body */ }
  if (!res.ok) {
    const error = new Error(body?.error ?? `HTTP ${res.status}`);
    error.status = res.status;
    error.details = body?.details;
    throw error;
  }
  return body;
}

let toastTimer = null;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2500);
}

// ------------------------------------------------------ markdown (minimal) --

function inlineMd(text) {
  let s = esc(text);
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, code) => {
    codes.push(code);
    return `\u0000${codes.length - 1}\u0000`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const target = /\.md$/.test(href) && !/[:/]{2}/.test(href)
      ? `#/claim/${encodeURIComponent(href.replace(/\.md$/, '').split('/').pop())}`
      : href;
    return `<a href="${target}">${label}</a>`;
  });
  return s.replaceAll(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[Number(i)]}</code>`);
}

function renderMarkdown(src) {
  const lines = String(src ?? '').split(/\r?\n/);
  const out = [];
  let para = [];
  let list = null;
  let code = null;

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${para.map(inlineMd).join('<br>')}</p>`);
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      out.push(`</${list}>`);
      list = null;
    }
  };
  const flushAll = () => { flushPara(); flushList(); };

  for (const raw of lines) {
    if (code !== null) {
      if (/^```/.test(raw)) {
        out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`);
        code = null;
      } else {
        code.push(raw);
      }
      continue;
    }
    if (/^```/.test(raw)) { flushAll(); code = []; continue; }
    const heading = raw.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      flushAll();
      const level = Math.min(heading[1].length + 1, 3);
      out.push(`<h${level}>${inlineMd(heading[2])}</h${level}>`);
      continue;
    }
    const ulItem = raw.match(/^[-*]\s+(.*)$/);
    if (ulItem) {
      flushPara();
      if (list !== 'ul') { flushList(); out.push('<ul>'); list = 'ul'; }
      out.push(`<li>${inlineMd(ulItem[1])}</li>`);
      continue;
    }
    const olItem = raw.match(/^\d+\.\s+(.*)$/);
    if (olItem) {
      flushPara();
      if (list !== 'ol') { flushList(); out.push('<ol>'); list = 'ol'; }
      out.push(`<li>${inlineMd(olItem[1])}</li>`);
      continue;
    }
    if (!raw.trim()) { flushAll(); continue; }
    flushList();
    para.push(raw);
  }
  if (code !== null) out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`);
  flushAll();
  return out.join('\n');
}

// ----------------------------------------------------------------- theme --

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('ka-theme', theme);
  $('#theme-toggle').textContent = theme === 'dark' ? '☀' : '☾';
}

// ----------------------------------------------------------------- state --

const state = {
  meta: null,
  claims: [],
  loaded: false,
  q: '',
  statuses: new Set(['asserted', 'verified', 'refuted', 'stale']),
  activeTag: null,
  expandedId: null,
  detailCache: new Map(),
};

function statusLabel(status) {
  return { asserted: 'asserted', verified: 'verified', refuted: 'refuted', stale: 'stale' }[status] ?? status;
}

function dueLabel(due, today) {
  if (!due) return '';
  if (due < today) return `已于 ${due} 到期`;
  if (due === today) return '今天到期';
  return `到期 ${due}`;
}

function badgeHtml(status) {
  return `<span class="badge badge-status-${esc(status)}" title="status">${esc(statusLabel(status))}</span>`;
}

function stanceBadgeHtml(stance) {
  return `<span class="badge badge-stance" title="stance">${esc(stance)}</span>`;
}

function tagsHtml(tags, clickable) {
  if (!tags?.length) return '';
  return tags.map((tag) => (clickable
    ? `<button type="button" class="tag-chip tag-btn" data-tag="${esc(tag)}">${esc(tag)}</button>`
    : `<span class="tag-chip">${esc(tag)}</span>`)).join('');
}

// Same queue rule and order as `node tools/ka.mjs review` (§4.2).
function queueRows() {
  const today = state.meta.today;
  return state.claims
    .filter((row) => row.status === 'asserted'
      || row.status === 'stale'
      || (row.status === 'verified' && row.review_due && row.review_due <= today))
    .filter((row) => state.statuses.has(row.status))
    .filter((row) => !state.activeTag || (row.tags ?? []).includes(state.activeTag))
    .filter((row) => matchesQuery(row))
    .sort((a, b) => {
      const dueA = a.review_due ?? '9999-99-99';
      const dueB = b.review_due ?? '9999-99-99';
      return dueA.localeCompare(dueB) || a.id.localeCompare(b.id);
    });
}

function allRows() {
  return state.claims
    .filter((row) => state.statuses.has(row.status))
    .filter((row) => !state.activeTag || (row.tags ?? []).includes(state.activeTag))
    .filter((row) => matchesQuery(row))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function matchesQuery(row) {
  const q = state.q.trim().toLowerCase();
  if (!q) return true;
  return [row.id, row.title, ...(row.tags ?? [])]
    .some((field) => String(field).toLowerCase().includes(q));
}

// -------------------------------------------------------------- data load --

async function loadData() {
  const [meta, claimsBody] = await Promise.all([api('/api/meta'), api('/api/claims')]);
  state.meta = meta;
  state.claims = claimsBody.claims;
  state.loaded = true;
}

async function refresh() {
  await loadData();
  render();
}

// --------------------------------------------------------------- sidebar --

function renderSidebar() {
  const sidebar = $('#sidebar');
  const counts = state.meta.counts;
  const statuses = ['asserted', 'verified', 'refuted', 'stale'];
  const tagRows = state.meta.tags
    .map(({ tag, count }) => `
      <button type="button" class="tag-item ${state.activeTag === tag ? 'active' : ''}" data-tag="${esc(tag)}">
        <span>${esc(tag)}</span><span class="n">${count}</span>
      </button>`)
    .join('');
  sidebar.classList.remove('hidden');
  sidebar.innerHTML = `
    <div class="panel">
      <p class="side-title">待复核</p>
      <div class="queue-count">${state.meta.queue}<span class="unit">张</span></div>
    </div>
    <div class="panel">
      <p class="side-title">状态</p>
      ${statuses.map((status) => `
        <label class="check-row">
          <input type="checkbox" data-status="${status}" ${state.statuses.has(status) ? 'checked' : ''}>
          <span>${statusLabel(status)}</span>
          <span class="n">${counts[status] ?? 0}</span>
        </label>`).join('')}
    </div>
    <div class="panel">
      <p class="side-title">Tags${state.activeTag ? ` · <b>${esc(state.activeTag)}</b>` : ''}</p>
      <div class="tag-list">
        ${state.activeTag ? '<button type="button" class="tag-item" data-tag-clear="1">清除 tag 筛选</button>' : ''}
        ${tagRows || '<span class="field-hint">暂无 tag</span>'}
      </div>
    </div>`;

  sidebar.querySelectorAll('input[data-status]').forEach((input) => {
    input.addEventListener('change', () => {
      if (input.checked) state.statuses.add(input.dataset.status);
      else state.statuses.delete(input.dataset.status);
      renderMain();
    });
  });
  sidebar.querySelectorAll('.tag-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.activeTag = btn.dataset.tagClear ? null : btn.dataset.tag;
      render();
    });
  });
}

// ----------------------------------------------------------------- queue --

async function renderQueue() {
  const rows = queueRows();
  if (state.expandedId && !rows.some((row) => row.id === state.expandedId)) state.expandedId = null;
  const expandedId = state.expandedId ?? rows[0]?.id ?? null;
  const today = state.meta.today;

  const listHtml = rows.length === 0
    ? '<div class="empty-state">队列已清空。所有卡都在复核周期内。</div>'
    : `<div class="card-list">${rows.map((row) => queueCardHtml(row, row.id === expandedId, today)).join('')}</div>`;

  $('#main').innerHTML = `
    <div class="view-head">
      <h1>复核队列</h1>
      <span class="sub">${rows.length} 张 · 按 review_due 升序</span>
    </div>
    ${listHtml}`;

  bindQueueEvents();
  if (expandedId) {
    const card = state.claims.find((row) => row.id === expandedId);
    if (card) await fillExpandedQuote(expandedId, card.path);
  }
}

function queueCardHtml(row, expanded, today) {
  const due = dueLabel(row.review_due, today);
  return `
    <div class="card" data-id="${esc(row.id)}">
      <div class="card-row">
        <span class="card-title">${esc(row.title)}</span>
        <span class="card-meta">
          ${due ? `<span class="due">${esc(due)}</span>` : ''}
          ${stanceBadgeHtml(row.stance)}
          ${badgeHtml(row.status)}
        </span>
      </div>
      ${expanded ? `
        <div class="card-expanded" data-expanded="${esc(row.id)}">
          <div class="expanded-body"><span class="field-hint">加载证据…</span></div>
          <div class="card-actions">
            <button type="button" class="btn btn-primary btn-sm" data-act="reviewed" data-id="${esc(row.id)}">标记已复核</button>
            <button type="button" class="btn btn-sm" data-act="edit" data-id="${esc(row.id)}">编辑</button>
            <button type="button" class="btn btn-sm" data-act="detail" data-id="${esc(row.id)}">打开详情</button>
            <button type="button" class="btn btn-sm" data-act="postpone" data-id="${esc(row.id)}">顺延 30 天</button>
          </div>
        </div>` : ''}
    </div>`;
}

function bindQueueEvents() {
  $('#main').querySelectorAll('.card:not(.clickable) .card-row').forEach((rowEl) => {
    rowEl.addEventListener('click', (event) => {
      if (event.target.closest('button')) return;
      const id = rowEl.closest('.card').dataset.id;
      state.expandedId = state.expandedId === id ? null : id;
      renderMain();
    });
  });
  $('#main').querySelectorAll('[data-act]').forEach((btn) => {
    btn.addEventListener('click', () => runCardAction(btn.dataset.act, btn.dataset.id));
  });
  bindTagButtons();
}

async function fillExpandedQuote(id, relPath) {
  const container = $(`[data-expanded="${CSS.escape(id)}"] .expanded-body`);
  if (!container) return;
  try {
    const card = state.detailCache.get(id) ?? await api(`/api/claims/${encodeURIComponent(id)}`);
    state.detailCache.set(id, card);
    const first = card.evidence?.[0];
    const target = $(`[data-expanded="${CSS.escape(id)}"] .expanded-body`);
    if (!target) return;
    target.innerHTML = first
      ? `<blockquote class="quote-block">${inlineMd(first.quote)}</blockquote>
         <span class="locator">${esc(first.locator)} · ${esc(first.source.replace(/^library\//, ''))}</span>`
      : '<span class="field-hint">此卡没有证据条目。</span>';
  } catch {
    if (container.isConnected) container.innerHTML = '<span class="field-hint">证据加载失败。</span>';
  }
}

async function runCardAction(action, id) {
  try {
    if (action === 'edit' || action === 'detail') {
      location.hash = `#/claim/${encodeURIComponent(id)}`;
      return;
    }
    if (action === 'reviewed') {
      await api(`/api/claims/${encodeURIComponent(id)}/reviewed`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ actor: 'local' }),
      });
      toast(`已复核：${id}（review_due → 今天 + 90 天）`);
    } else if (action === 'postpone') {
      await api(`/api/claims/${encodeURIComponent(id)}/postpone`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ actor: 'local', days: 30 }),
      });
      toast(`已顺延：${id}（review_due → 今天 + 30 天）`);
    }
    state.detailCache.delete(id);
    await refresh();
  } catch (error) {
    toast(`操作失败：${error.message}`);
  }
}

// ---------------------------------------------------------------- claims --

function renderClaims() {
  const rows = allRows();
  const today = state.meta.today;
  $('#main').innerHTML = `
    <div class="view-head">
      <h1>全部 Claim</h1>
      <span class="sub">${rows.length} 张 · 按 id 排序</span>
    </div>
    ${rows.length === 0
      ? '<div class="empty-state">没有匹配的 claim。</div>'
      : `<div class="card-list">${rows.map((row) => `
          <div class="card clickable" data-id="${esc(row.id)}">
            <div class="card-row compact">
              <span class="card-title">${esc(row.title)}</span>
              <span class="card-meta">
                ${dueLabel(row.review_due, today) ? `<span class="due">${esc(dueLabel(row.review_due, today))}</span>` : ''}
                ${tagsHtml(row.tags)}
                ${stanceBadgeHtml(row.stance)}
                ${badgeHtml(row.status)}
              </span>
            </div>
          </div>`).join('')}
        </div>`}`;

  $('#main').querySelectorAll('.card.clickable').forEach((cardEl) => {
    cardEl.addEventListener('click', (event) => {
      if (event.target.closest('.tag-btn')) return;
      location.hash = `#/claim/${encodeURIComponent(cardEl.dataset.id)}`;
    });
  });
  bindTagButtons();
}

function bindTagButtons() {
  $('#main').querySelectorAll('.tag-btn').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      state.activeTag = btn.dataset.tag;
      render();
    });
  });
}

// ---------------------------------------------------------------- detail --

function evidenceItemHtml(item) {
  return `
    <div class="evidence-item">
      <blockquote class="quote-block">${inlineMd(item.quote)}</blockquote>
      <div><span class="locator">${esc(item.locator)}</span></div>
      <div><span class="locator">${esc(item.source)}</span> · <span class="badge badge-stance">${esc(item.relation)}</span></div>
    </div>`;
}

async function renderDetail(id) {
  const sidebar = $('#sidebar');
  sidebar.classList.add('hidden');
  let card;
  try {
    // Always re-read: the file on disk is the source of truth and may have
    // been edited by hand since the last visit.
    card = await api(`/api/claims/${encodeURIComponent(id)}`);
  } catch (error) {
    $('#main').innerHTML = `<div class="empty-state">${esc(error.message)}</div>
      <div style="text-align:center"><a class="back-link" href="#/claims">← 返回列表</a></div>`;
    return;
  }
  state.detailCache.set(id, card);
  const editable = card.status === 'asserted';
  const today = state.meta.today;

  $('#main').innerHTML = `
    <a class="back-link" href="#/claims">← 返回列表</a>
    <div class="detail-grid">
      <div class="detail-col">
        <span class="mono" style="color:var(--text-muted)">${esc(card.id)}</span>
        <h1 class="detail-title">${esc(card.title)}</h1>
        <div class="chip-row">${badgeHtml(card.status)} ${stanceBadgeHtml(card.stance)}
          ${dueLabel(card.review_due, today) ? `<span class="due">${esc(dueLabel(card.review_due, today))}</span>` : ''}
        </div>
        <div class="meta-block">
          ${card.paper ? `<div class="meta-item"><div class="label">paper</div><div>${esc(card.paper)}</div></div>` : ''}
          ${card.note ? `
            <div class="meta-item">
              <div class="label">来源笔记</div>
              <div class="mono">${esc(card.note)}</div>
              <div><button type="button" class="btn btn-sm" id="note-toggle">展开笔记</button></div>
              <div id="note-panel" class="note-panel" hidden></div>
            </div>` : ''}
          <div class="meta-item"><div class="label">scope</div><div>${esc(card.scope)}</div></div>
        </div>
        <p class="section-title">证据</p>
        ${(card.evidence ?? []).map((item) => evidenceItemHtml(item)).join('')}
        <p class="section-title">Falsifiers</p>
        <ol class="falsifier-list">${(card.falsifiers ?? []).map((item) => `<li>${inlineMd(item)}</li>`).join('')}</ol>
        ${(card.related?.length) ? `
          <p class="section-title">关联 claim</p>
          <div class="chip-row">${card.related.map((relId) => `<a class="chip" href="#/claim/${encodeURIComponent(relId)}">${esc(relId)}</a>`).join('')}</div>` : ''}
        <p class="section-title">正文</p>
        <div class="md">${renderMarkdown(card.body)}</div>
      </div>
      <div class="detail-col" id="edit-col">${editable
        ? editPanelHtml(card)
        : `<div class="edit-head"><h2>编辑</h2></div>
           <div class="readonly-note">
             <span>此卡为 ${esc(card.status)}，不可在界面编辑。</span>
             <span class="field-hint">如需修改，请直接编辑 markdown 文件；签署 verified 只能由用户本人在文件中完成。</span>
           </div>`}
      </div>
    </div>`;

  bindNoteToggle(card);
  if (editable) bindEditPanel(card);
}

function bindNoteToggle(card) {
  const toggle = $('#note-toggle');
  if (!toggle) return;
  const panel = $('#note-panel');
  let loaded = false;
  toggle.addEventListener('click', async () => {
    if (panel.hidden && !loaded) {
      toggle.textContent = '加载中…';
      try {
        const note = await api(`/api/note?path=${encodeURIComponent(card.note)}`);
        panel.innerHTML = `<div class="md">${renderMarkdown(note.content)}</div>`;
        loaded = true;
        scrollToAnchor(panel, note.anchor);
      } catch (error) {
        panel.innerHTML = `<span class="field-hint">笔记加载失败：${esc(error.message)}</span>`;
      }
      toggle.textContent = '收起笔记';
    } else if (panel.hidden) {
      toggle.textContent = '收起笔记';
    } else {
      toggle.textContent = '展开笔记';
    }
    panel.hidden = !panel.hidden;
  });
}

function slugify(text) {
  return String(text).toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]/g, '');
}

function scrollToAnchor(panel, anchor) {
  if (!anchor) return;
  const headings = [...panel.querySelectorAll('h1, h2, h3, h4')];
  const target = headings.find((h) => {
    const slug = slugify(h.textContent);
    return slug === anchor || slug.replaceAll('-', '') === anchor.replaceAll('-', '');
  });
  if (target) {
    target.classList.add('anchor-hl');
    target.scrollIntoView({ block: 'start' });
  }
}

// ------------------------------------------------------------ edit panel --

function editPanelHtml(card) {
  const evRows = (card.evidence ?? []).map((item, i) => `
    <div class="struct-row ev-row">
      <div class="row-head span-2"><span class="idx">证据 ${i + 1}</span>
        <button type="button" class="btn-remove" data-remove-ev="${i}" title="删除此条">✕</button></div>
      <div class="field"><label>source</label><input class="ev-source" value="${esc(item.source)}" spellcheck="false"></div>
      <div class="field"><label>relation</label>
        <select class="ev-relation">
          ${['supports', 'contradicts'].map((rel) => `<option value="${rel}" ${item.relation === rel ? 'selected' : ''}>${rel}</option>`).join('')}
        </select></div>
      <div class="field"><label>locator</label><input class="ev-locator" value="${esc(item.locator)}" spellcheck="false"></div>
      <div class="field"><label>quote</label><textarea class="ev-quote" rows="2">${esc(item.quote)}</textarea></div>
    </div>`).join('');
  const falsRows = (card.falsifiers ?? []).map((item, i) => `
    <div class="struct-row fals-row">
      <div class="row-head span-2"><span class="idx">Falsifier ${i + 1}</span>
        <button type="button" class="btn-remove" data-remove-fals="${i}" title="删除此条">✕</button></div>
      <div class="field span-2"><textarea class="fals-text" rows="2">${esc(item)}</textarea></div>
    </div>`).join('');

  return `
    <div class="edit-head"><h2>编辑</h2><span class="field-hint">asserted 卡可编辑</span></div>
    <div id="form-errors"></div>
    <form id="edit-form" class="form-grid" autocomplete="off">
      <div class="field"><label>title</label><input id="f-title" value="${esc(card.title)}"></div>
      <div class="field-row">
        <div class="field"><label>stance</label>
          <select id="f-stance">
            ${['adopt', 'trial', 'watch', 'avoid'].map((s) => `<option value="${s}" ${card.stance === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select></div>
        <div class="field"><label>review_due</label><input id="f-due" type="date" value="${esc(card.review_due ?? '')}"></div>
      </div>
      <div class="field"><label>tags（逗号分隔）</label><input id="f-tags" value="${esc((card.tags ?? []).join(', '))}" spellcheck="false"></div>
      <div class="field"><label>scope</label><textarea id="f-scope" rows="3">${esc(card.scope)}</textarea></div>
      <div class="field-row">
        <div class="field"><label>paper</label><input id="f-paper" value="${esc(card.paper ?? '')}" spellcheck="false"></div>
        <div class="field"><label>note（library/…md#锚点）</label><input id="f-note" value="${esc(card.note ?? '')}" spellcheck="false"></div>
      </div>
      <div class="field"><label>related claim（逗号分隔 id）</label><input id="f-related" value="${esc((card.related ?? []).join(', '))}" spellcheck="false"></div>

      <p class="section-title" style="margin-top:8px">证据</p>
      <div class="struct-list" id="ev-list">${evRows}</div>
      <div><button type="button" class="btn btn-sm" id="add-ev">＋ 添加证据</button></div>

      <p class="section-title">Falsifiers</p>
      <div class="struct-list" id="fals-list">${falsRows}</div>
      <div><button type="button" class="btn btn-sm" id="add-fals">＋ 添加 Falsifier</button></div>

      <div class="field"><label>正文（markdown）</label><textarea id="f-body" rows="12" spellcheck="false">${esc(card.body)}</textarea></div>
      <div class="card-actions">
        <button type="submit" class="btn btn-primary">保存 → 自动校验</button>
        <button type="button" class="btn btn-quiet" id="f-cancel">取消</button>
      </div>
    </form>`;
}

function bindEditPanel(card) {
  const form = $('#edit-form');
  $('#add-ev').addEventListener('click', () => {
    const list = $('#ev-list');
    const index = list.querySelectorAll('.ev-row').length;
    const row = document.createElement('div');
    row.className = 'struct-row ev-row';
    row.innerHTML = `
      <div class="row-head span-2"><span class="idx">证据 ${index + 1}</span>
        <button type="button" class="btn-remove" title="删除此条">✕</button></div>
      <div class="field"><label>source</label><input class="ev-source" value="library/" spellcheck="false"></div>
      <div class="field"><label>relation</label>
        <select class="ev-relation"><option value="supports">supports</option><option value="contradicts">contradicts</option></select></div>
      <div class="field"><label>locator</label><input class="ev-locator" value="" spellcheck="false"></div>
      <div class="field"><label>quote</label><textarea class="ev-quote" rows="2"></textarea></div>`;
    row.querySelector('.btn-remove').addEventListener('click', () => row.remove());
    list.appendChild(row);
  });
  $('#add-fals').addEventListener('click', () => {
    const list = $('#fals-list');
    const row = document.createElement('div');
    row.className = 'struct-row fals-row';
    row.innerHTML = `
      <div class="row-head span-2"><span class="idx">Falsifier</span>
        <button type="button" class="btn-remove" title="删除此条">✕</button></div>
      <div class="field span-2"><textarea class="fals-text" rows="2"></textarea></div>`;
    row.querySelector('.btn-remove').addEventListener('click', () => row.remove());
    list.appendChild(row);
  });
  $('#main').querySelectorAll('[data-remove-ev]').forEach((btn) => btn.addEventListener('click', () => {
    btn.closest('.ev-row').remove();
  }));
  $('#main').querySelectorAll('[data-remove-fals]').forEach((btn) => btn.addEventListener('click', () => {
    btn.closest('.fals-row').remove();
  }));
  $('#f-cancel').addEventListener('click', () => renderDetail(card.id));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const errorsBox = $('#form-errors');
    errorsBox.innerHTML = '';
    const patch = {
      title: $('#f-title').value,
      stance: $('#f-stance').value,
      review_due: $('#f-due').value,
      tags: $('#f-tags').value.split(',').map((s) => s.trim()).filter(Boolean),
      scope: $('#f-scope').value,
      paper: $('#f-paper').value,
      note: $('#f-note').value.trim(),
      related: $('#f-related').value.split(',').map((s) => s.trim()).filter(Boolean),
      evidence: [...$('#main').querySelectorAll('.ev-row')].map((row) => ({
        source: row.querySelector('.ev-source').value.trim(),
        locator: row.querySelector('.ev-locator').value,
        quote: row.querySelector('.ev-quote').value,
        relation: row.querySelector('.ev-relation').value,
      })),
      falsifiers: [...$('#main').querySelectorAll('.fals-row .fals-text')].map((el) => el.value).filter((v) => v.trim()),
      body: $('#f-body').value,
    };
    try {
      const saved = await api(`/api/claims/${encodeURIComponent(card.id)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ actor: 'local', patch }),
      });
      state.detailCache.set(card.id, saved);
      toast('已保存，validate 通过');
      await refresh();
    } catch (error) {
      const details = error.details?.length
        ? `<ul>${error.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>`
        : '';
      errorsBox.innerHTML = `<div class="form-error"><b>${esc(error.message)}</b>${details}</div>`;
      errorsBox.scrollIntoView({ block: 'nearest' });
    }
  });
}

// ------------------------------------------------------------------ new --

const NEW_CARD_BODY = [
  '## 我的理解',
  '',
  '用几句话说明这条主张具体在说什么，以及它依赖哪些前提。',
  '',
  '## 待验证',
  '',
  '- 列出可以独立完成的检查：复现哪个数字、跑哪个仓库、对照哪个基线。',
  '',
  '## 若成立 / 不成立意味着什么',
  '',
  '说明这条 claim 的成立与否会怎样影响后续选型、实验或方案。',
].join('\n');

function addDaysLocal(dateStr, days) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function renderNew() {
  const sidebar = $('#sidebar');
  sidebar.classList.add('hidden');
  const defaultDue = addDaysLocal(state.meta.today, 90);
  $('#main').innerHTML = `
    <a class="back-link" href="#/claims">← 返回列表</a>
    <div class="detail-col" style="max-width:860px">
      <div class="edit-head"><h2>起草新 Claim</h2><span class="field-hint">创建即 status: asserted · signoff: null</span></div>
      <div id="form-errors"></div>
      <form id="new-form" class="form-grid" autocomplete="off">
        <div class="field">
          <label>id</label>
          <input id="n-id" class="mono" placeholder="claim-<论文或方法>-<结论>" spellcheck="false">
          <span class="field-hint" id="n-id-hint">claim-<论文或方法>-<结论>，小写 kebab-case，≤80 字符，提交后不可改名</span>
        </div>
        <div class="field"><label>title</label><input id="n-title" placeholder="论文声称 / 方法主张，一句话"></div>
        <div class="field-row">
          <div class="field"><label>stance</label>
            <select id="n-stance">
              ${['adopt', 'trial', 'watch', 'avoid'].map((s) => `<option value="${s}" ${s === 'watch' ? 'selected' : ''}>${s}</option>`).join('')}
            </select></div>
          <div class="field"><label>review_due</label><input id="n-due" type="date" value="${esc(defaultDue)}"></div>
        </div>
        <div class="field-row">
          <div class="field"><label>tags（逗号分隔）</label><input id="n-tags" spellcheck="false"></div>
          <div class="field"><label>related claim（逗号分隔 id）</label><input id="n-related" spellcheck="false"></div>
        </div>
        <div class="field"><label>scope（数据集 / 模型 / 硬件 / 条件）</label><textarea id="n-scope" rows="2"></textarea></div>
        <div class="field-row">
          <div class="field"><label>paper</label><input id="n-paper" spellcheck="false"></div>
          <div class="field"><label>note（library/…md#锚点）</label><input id="n-note" spellcheck="false"></div>
        </div>

        <p class="section-title" style="margin-top:8px">证据</p>
        <div class="struct-list" id="n-ev-list"></div>
        <div><button type="button" class="btn btn-sm" id="n-add-ev">＋ 添加证据</button></div>

        <p class="section-title">Falsifiers</p>
        <div class="struct-list" id="n-fals-list"></div>
        <div><button type="button" class="btn btn-sm" id="n-add-fals">＋ 添加 Falsifier</button></div>

        <div class="field"><label>正文（markdown，三个小节）</label><textarea id="n-body" rows="12" spellcheck="false">${esc(NEW_CARD_BODY)}</textarea></div>
        <div class="card-actions">
          <button type="submit" class="btn btn-primary">创建 → 自动校验</button>
          <button type="button" class="btn btn-quiet" id="n-cancel">取消</button>
        </div>
      </form>
    </div>`;

  const idInput = $('#n-id');
  const idHint = $('#n-id-hint');
  idInput.addEventListener('input', () => {
    const value = idInput.value.trim();
    idInput.classList.remove('invalid');
    idHint.classList.remove('error', 'ok');
    if (!value) { idHint.textContent = 'claim-<论文或方法>-<结论>，小写 kebab-case，≤80 字符，提交后不可改名'; return; }
    const valid = /^claim-[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value) && value.length <= 80;
    const exists = state.claims.some((row) => row.id === value);
    if (exists) {
      idInput.classList.add('invalid');
      idHint.classList.add('error');
      idHint.textContent = '此 id 已存在';
    } else if (valid) {
      idHint.classList.add('ok');
      idHint.textContent = 'id 可用';
    } else {
      idInput.classList.add('invalid');
      idHint.classList.add('error');
      idHint.textContent = '格式不符：小写 kebab-case，以 claim- 开头，≤80 字符';
    }
  });

  const addEv = () => {
    const list = $('#n-ev-list');
    const index = list.querySelectorAll('.ev-row').length;
    const row = document.createElement('div');
    row.className = 'struct-row ev-row';
    row.innerHTML = `
      <div class="row-head span-2"><span class="idx">证据 ${index + 1}</span>
        <button type="button" class="btn-remove" title="删除此条">✕</button></div>
      <div class="field"><label>source</label><input class="ev-source" value="library/" spellcheck="false"></div>
      <div class="field"><label>relation</label>
        <select class="ev-relation"><option value="supports">supports</option><option value="contradicts">contradicts</option></select></div>
      <div class="field"><label>locator</label><input class="ev-locator" placeholder="§X / p.N" spellcheck="false"></div>
      <div class="field"><label>quote</label><textarea class="ev-quote" rows="2"></textarea></div>`;
    row.querySelector('.btn-remove').addEventListener('click', () => row.remove());
    list.appendChild(row);
  };
  const addFals = () => {
    const list = $('#n-fals-list');
    const row = document.createElement('div');
    row.className = 'struct-row fals-row';
    row.innerHTML = `
      <div class="row-head span-2"><span class="idx">Falsifier</span>
        <button type="button" class="btn-remove" title="删除此条">✕</button></div>
      <div class="field span-2"><textarea class="fals-text" rows="2"></textarea></div>`;
    row.querySelector('.btn-remove').addEventListener('click', () => row.remove());
    list.appendChild(row);
  };
  addEv();
  addFals();
  $('#n-add-ev').addEventListener('click', addEv);
  $('#n-add-fals').addEventListener('click', addFals);
  $('#n-cancel').addEventListener('click', () => { location.hash = '#/claims'; });

  $('#new-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const errorsBox = $('#form-errors');
    errorsBox.innerHTML = '';
    const payload = {
      actor: 'local',
      id: $('#n-id').value.trim(),
      title: $('#n-title').value,
      stance: $('#n-stance').value,
      review_due: $('#n-due').value,
      tags: $('#n-tags').value.split(',').map((s) => s.trim()).filter(Boolean),
      related: $('#n-related').value.split(',').map((s) => s.trim()).filter(Boolean),
      scope: $('#n-scope').value,
      paper: $('#n-paper').value,
      note: $('#n-note').value.trim(),
      evidence: [...$('#main').querySelectorAll('.ev-row')].map((row) => ({
        source: row.querySelector('.ev-source').value.trim(),
        locator: row.querySelector('.ev-locator').value,
        quote: row.querySelector('.ev-quote').value,
        relation: row.querySelector('.ev-relation').value,
      })),
      falsifiers: [...$('#main').querySelectorAll('.fals-row .fals-text')].map((el) => el.value).filter((v) => v.trim()),
      body: $('#n-body').value,
    };
    try {
      await api('/api/claims', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      toast(`已创建：${payload.id}`);
      location.hash = `#/claim/${encodeURIComponent(payload.id)}`;
    } catch (error) {
      const details = error.details?.length
        ? `<ul>${error.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>`
        : '';
      errorsBox.innerHTML = `<div class="form-error"><b>${esc(error.message)}</b>${details}</div>`;
      errorsBox.scrollIntoView({ block: 'nearest' });
    }
  });
}

// ---------------------------------------------------------------- router --

function renderMain() {
  const hash = location.hash || '#/queue';
  if (hash.startsWith('#/claim/')) {
    const id = decodeURIComponent(hash.slice('#/claim/'.length));
    renderDetail(id);
  } else if (hash === '#/new') {
    renderNew();
  } else if (hash === '#/claims') {
    renderClaims();
  } else {
    renderQueue();
  }
  const navName = hash.startsWith('#/claim/') || hash === '#/new'
    ? 'claims'
    : (hash === '#/claims' ? 'claims' : 'queue');
  document.querySelectorAll('.nav a[data-nav]').forEach((a) => {
    a.classList.toggle('active', a.dataset.nav === navName);
  });
}

function render() {
  if (!state.loaded) return;
  const hash = location.hash || '#/queue';
  if (hash === '#/claims' || hash.startsWith('#/claim/') || hash === '#/new') {
    if (hash === '#/claims') renderSidebar();
  } else {
    renderSidebar();
  }
  renderMain();
}

async function init() {
  applyTheme(document.documentElement.dataset.theme || 'light');
  $('#theme-toggle').addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });
  $('#search').addEventListener('input', (event) => {
    state.q = event.target.value;
    const hash = location.hash || '#/queue';
    if (hash.startsWith('#/claim/') || hash === '#/new') return; // search only drives list views
    renderMain();
  });
  document.querySelectorAll('.nav a.nav-disabled').forEach((a) => {
    a.addEventListener('click', (event) => event.preventDefault());
  });
  window.addEventListener('hashchange', () => {
    state.expandedId = null;
    render();
  });
  try {
    await loadData();
  } catch (error) {
    $('#main').innerHTML = `<div class="empty-state">加载失败：${esc(error.message)}<br>请确认 serve.mjs 正在运行。</div>`;
    return;
  }
  render();
}

init();
