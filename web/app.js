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
  const meta = $('#theme-color-meta');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#171717' : '#F7F7F8');
}

// ----------------------------------------------------------------- state --

const state = {
  meta: null,
  claims: [],
  loaded: false,
  readonly: false,
  q: '',
  statuses: new Set(['asserted', 'verified', 'refuted', 'stale']),
  activeTag: null,
  expandedId: null,
  detailCache: new Map(),
  sortBy: localStorage.getItem('ka-sort-claims') ?? 'id',
  queueSortBy: localStorage.getItem('ka-sort-queue') ?? 'due',
  tagQuery: '',
  tagShowAll: false,
  tagSort: 'count',
};

const STATUS_ORDER = { asserted: 0, verified: 1, refuted: 2, stale: 3 };

// Shared sorters. `due` puts missing review_due last (queue semantics, §4.2).
const SORTERS = {
  due: (a, b) => {
    const dueA = a.review_due ?? '9999-99-99';
    const dueB = b.review_due ?? '9999-99-99';
    return dueA.localeCompare(dueB) || a.id.localeCompare(b.id);
  },
  id: (a, b) => a.id.localeCompare(b.id),
  title: (a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN') || a.id.localeCompare(b.id),
  status: (a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9) || a.id.localeCompare(b.id),
};

const SORT_LABELS = {
  due: '按到期日',
  id: '按 id',
  title: '按标题',
  status: '按状态',
};

function sortRows(rows, key) {
  return [...rows].sort(SORTERS[key] ?? SORTERS.id);
}

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

// Same queue rule as `node tools/ka.mjs review` (§4.2); order is UI-selectable
// (default keeps the canonical review_due ascending order).
function queueRows() {
  const today = state.meta.today;
  return sortRows(state.claims
    .filter((row) => row.status === 'asserted'
      || row.status === 'stale'
      || (row.status === 'verified' && row.review_due && row.review_due <= today))
    .filter((row) => state.statuses.has(row.status))
    .filter((row) => !state.activeTag || (row.tags ?? []).includes(state.activeTag))
    .filter((row) => matchesQuery(row)), state.queueSortBy);
}

function allRows() {
  return sortRows(state.claims
    .filter((row) => state.statuses.has(row.status))
    .filter((row) => !state.activeTag || (row.tags ?? []).includes(state.activeTag))
    .filter((row) => matchesQuery(row)), state.sortBy);
}

function sortSelectHtml(current, keyPrefix) {
  const options = ['due', 'id', 'title', 'status'];
  return `<label class="sort-control">排序
    <select id="${keyPrefix}-sort" data-sort-prefix="${keyPrefix}">
      ${options.map((key) => `<option value="${key}" ${current === key ? 'selected' : ''}>${SORT_LABELS[key]}</option>`).join('')}
    </select></label>`;
}

function bindSortSelect(prefix, onChange) {
  const select = $(`#${prefix}-sort`);
  if (!select) return;
  select.addEventListener('change', () => {
    if (prefix === 'queue') {
      state.queueSortBy = select.value;
      localStorage.setItem('ka-sort-queue', select.value);
    } else {
      state.sortBy = select.value;
      localStorage.setItem('ka-sort-claims', select.value);
    }
    onChange();
  });
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
  state.readonly = Boolean(meta.readonly);
  state.claims = claimsBody.claims;
  state.loaded = true;
}

async function refresh() {
  await loadData();
  render();
}

// ------------------------------------------------------------- mobile UI --

// ≤720px: the sidebar becomes an off-canvas filter drawer and search collapses
// behind a topbar button (web/styles.css). Desktop keeps the original layout.
const MOBILE_QUERY = window.matchMedia('(max-width: 720px)');

function isMobile() {
  return MOBILE_QUERY.matches;
}

function openDrawer() {
  if (!isMobile()) return;
  $('#sidebar').classList.add('open');
  $('#drawer-overlay').hidden = false;
  document.body.classList.add('drawer-open');
}

function closeDrawer() {
  $('#sidebar').classList.remove('open');
  $('#drawer-overlay').hidden = true;
  document.body.classList.remove('drawer-open');
}

function toggleDrawer() {
  if ($('#sidebar').classList.contains('open')) closeDrawer();
  else openDrawer();
}

function setSearchOpen(open) {
  $('.topbar').classList.toggle('search-open', open);
  document.body.classList.toggle('search-open', open);
  $('#search-toggle').setAttribute('aria-expanded', String(open));
  if (open) $('#search').focus();
}

// --------------------------------------------------------------- sidebar --

// Tag panel: 382 distinct tags over ~180 cards — search + sort + collapse
// keep the list navigable (tmp_docs/TODO.md #1).
const TAG_VISIBLE_DEFAULT = 30;

function visibleTagRows() {
  const q = state.tagQuery.trim().toLowerCase();
  let rows = state.meta.tags;
  if (q) rows = rows.filter(({ tag }) => tag.toLowerCase().includes(q));
  if (state.tagSort === 'name') {
    rows = [...rows].sort((a, b) => a.tag.localeCompare(b.tag, 'zh-Hans-CN'));
  } else {
    rows = [...rows].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-Hans-CN'));
  }
  return rows;
}

function renderSidebar() {
  const sidebar = $('#sidebar');
  const counts = state.meta.counts;
  const statuses = ['asserted', 'verified', 'refuted', 'stale'];
  const all = visibleTagRows();
  const total = state.meta.tags.length;
  const limit = state.tagShowAll || state.tagQuery.trim() ? all.length : TAG_VISIBLE_DEFAULT;
  const shown = all.slice(0, limit);
  const tagRows = shown
    .map(({ tag, count }) => `
      <button type="button" class="tag-item ${state.activeTag === tag ? 'active' : ''}" data-tag="${esc(tag)}">
        <span>${esc(tag)}</span><span class="n">${count}</span>
      </button>`)
    .join('');
  const overflow = all.length - shown.length;
  const tagFooter = all.length === 0
    ? `<span class="field-hint">${state.tagQuery ? '没有匹配的 tag' : '暂无 tag'}</span>`
    : `${overflow > 0
      ? `<button type="button" class="tag-more" id="tag-more">显示全部 ${all.length} 个（还有 ${overflow} 个）</button>`
      : (all.length > TAG_VISIBLE_DEFAULT && !state.tagQuery
        ? '<button type="button" class="tag-more" id="tag-more">收起</button>' : '')}`;
  sidebar.classList.remove('hidden');
  sidebar.innerHTML = `
    <div class="panel">
      <p class="side-title">待复核</p>
      <div class="queue-count">${state.meta.queue}<span class="unit">张</span></div>
      ${state.readonly ? '<p class="field-hint readonly-hint">只读模式 · 可浏览，不可编辑</p>' : ''}
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
      <p class="side-title">Tags · 共 ${total} 个${state.activeTag ? ` · <b>${esc(state.activeTag)}</b>` : ''}</p>
      <input id="tag-filter" class="search tag-filter" type="search" placeholder="筛选 tag…" autocomplete="off" spellcheck="false" value="${esc(state.tagQuery)}">
      <label class="sort-control tag-sort">排序
        <select id="tag-sort">
          <option value="count" ${state.tagSort !== 'name' ? 'selected' : ''}>按数量</option>
          <option value="name" ${state.tagSort === 'name' ? 'selected' : ''}>按名称</option>
        </select>
      </label>
      <div class="tag-list">
        ${state.activeTag ? '<button type="button" class="tag-item" data-tag-clear="1">清除 tag 筛选</button>' : ''}
        ${tagRows}
        ${tagFooter}
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
      if (isMobile()) closeDrawer();
    });
  });
  const tagFilter = $('#tag-filter');
  tagFilter.addEventListener('input', () => {
    state.tagQuery = tagFilter.value;
    // Re-render the sidebar; then restore focus and caret in the filter box.
    const query = state.tagQuery;
    renderSidebar();
    const nextFilter = $('#tag-filter');
    nextFilter.focus();
    nextFilter.setSelectionRange(query.length, query.length);
  });
  $('#tag-sort').addEventListener('change', (event) => {
    state.tagSort = event.target.value;
    renderSidebar();
  });
  const more = $('#tag-more');
  if (more) {
    more.addEventListener('click', () => {
      state.tagShowAll = !state.tagShowAll;
      renderSidebar();
    });
  }
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
      <span class="sub">${rows.length} 张 · ${state.queueSortBy === 'due' ? '按 review_due 升序（与 ka.mjs review 一致）' : SORT_LABELS[state.queueSortBy]}</span>
      <span class="view-tools">${sortSelectHtml(state.queueSortBy, 'queue')}</span>
    </div>
    ${listHtml}`;

  bindSortSelect('queue', renderMain);
  bindQueueEvents();
  if (expandedId) {
    const card = state.claims.find((row) => row.id === expandedId);
    if (card) await fillExpandedQuote(expandedId, card.path);
  }
}

function queueCardHtml(row, expanded, today) {
  const due = dueLabel(row.review_due, today);
  const actions = [
    !state.readonly && `<button type="button" class="btn btn-primary btn-sm" data-act="reviewed" data-id="${esc(row.id)}">标记已复核</button>`,
    !state.readonly && `<button type="button" class="btn btn-sm" data-act="edit" data-id="${esc(row.id)}">编辑</button>`,
    `<button type="button" class="btn btn-sm" data-act="detail" data-id="${esc(row.id)}">打开详情</button>`,
    !state.readonly && `<button type="button" class="btn btn-sm" data-act="postpone" data-id="${esc(row.id)}">顺延 30 天</button>`,
  ].filter(Boolean).join('');
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
          <div class="card-actions">${actions}</div>
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
      ? `<blockquote class="quote-block md md-quote">${renderMarkdown(first.quote)}</blockquote>
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
      <span class="sub">${rows.length} 张 · ${SORT_LABELS[state.sortBy]}</span>
      <span class="view-tools">${sortSelectHtml(state.sortBy, 'claims')}</span>
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

  bindSortSelect('claims', renderMain);
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
      <blockquote class="quote-block md md-quote">${renderMarkdown(item.quote)}</blockquote>
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
  const editable = !state.readonly && card.status === 'asserted';
  const showEditor = !state.readonly;
  const today = state.meta.today;

  $('#main').innerHTML = `
    <a class="back-link" href="#/claims">← 返回列表</a>
    <div class="detail-grid${showEditor ? '' : ' single'}">
      <div class="detail-col">
        <span class="mono" style="color:var(--text-muted)">${esc(card.id)}</span>
        <h1 class="detail-title">${esc(card.title)}</h1>
        <div class="chip-row">${badgeHtml(card.status)} ${stanceBadgeHtml(card.stance)}
          ${state.readonly ? '<span class="badge badge-stance">只读</span>' : ''}
          ${dueLabel(card.review_due, today) ? `<span class="due">${esc(dueLabel(card.review_due, today))}</span>` : ''}
        </div>
        <div class="meta-block">
          ${card.paper ? `<div class="meta-item"><div class="label">paper</div><div>${esc(card.paper)}</div></div>` : ''}
          ${card.tags?.length ? `<div class="meta-item"><div class="label">tags</div><div class="chip-row">${tagsHtml(card.tags)}</div></div>` : ''}
          ${card.note ? `
            <div class="meta-item">
              <div class="label">来源笔记</div>
              <div class="mono">${esc(card.note)}</div>
              <div><button type="button" class="btn btn-sm" id="note-toggle">展开笔记</button></div>
              <div id="note-panel" class="note-panel" hidden></div>
            </div>` : ''}
          <div class="meta-item"><div class="label">scope</div><div class="md md-compact">${renderMarkdown(card.scope)}</div></div>
        </div>
        <p class="section-title">证据</p>
        ${(card.evidence ?? []).map((item) => evidenceItemHtml(item)).join('')}
        <p class="section-title">Falsifiers</p>
        <ol class="falsifier-list">${(card.falsifiers ?? []).map((item) => `<li><div class="md md-compact">${renderMarkdown(item)}</div></li>`).join('')}</ol>
        ${(card.related?.length) ? `
          <p class="section-title">关联 claim</p>
          <div class="chip-row">${card.related.map((relId) => `<a class="chip" href="#/claim/${encodeURIComponent(relId)}">${esc(relId)}</a>`).join('')}</div>` : ''}
        <p class="section-title">正文</p>
        <div class="md">${renderMarkdown(card.body)}</div>
      </div>
      ${showEditor ? `
      <div class="detail-col" id="edit-col">${editable
        ? editPanelHtml(card)
        : `<div class="edit-head"><h2>编辑</h2></div>
           <div class="readonly-note">
             <span>此卡为 ${esc(card.status)}，不可在界面编辑。</span>
             <span class="field-hint">如需修改，请直接编辑 markdown 文件；签署 verified 只能由用户本人在文件中完成。</span>
           </div>`}
      </div>` : ''}
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
  if (state.readonly) {
    $('#main').innerHTML = '<div class="empty-state">只读模式，无法新建 claim。<br>请在桌面端可写实例中操作。</div>';
    return;
  }
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

// ----------------------------------------------------------------- graph --
// 图谱 v0.1 (design doc §10): force-directed canvas. "hubs" mode = paper notes
// radiating their claims (status-colored); "related" mode = claim↔claim network.

let graphRuntime = null; // kept across re-renders of the same view so filter tweaks don't reset the layout
let graphMode = 'hubs';

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const STATUS_VARS = { asserted: '--c-asserted', verified: '--c-verified', refuted: '--c-refuted', stale: '--c-stale' };

function statusColor(status) {
  return cssVar(STATUS_VARS[status] ?? '--c-stale') || '#888';
}

function renderGraph() {
  const host = $('#main');
  if (graphRuntime && host.contains(graphRuntime.canvas)) {
    graphRuntime.refilter();
    return;
  }
  graphRuntime = null;
  host.innerHTML = '<div class="empty-state">图谱加载中…</div>';

  api('/api/graph').then((data) => {
    // Route may have changed while fetching.
    const hash = location.hash || '#/queue';
    if (hash !== '#/graph' || !host.isConnected) return;
    buildGraphView(data);
  }).catch((error) => {
    if ((location.hash || '#/queue') === '#/graph') {
      host.innerHTML = `<div class="empty-state">图谱加载失败：${esc(error.message)}</div>`;
    }
  });
}

function buildGraphView(data) {
  const host = $('#main');
  if (graphRuntime?.onWindowUp) window.removeEventListener('mouseup', graphRuntime.onWindowUp);
  const noteById = new Map(data.nodes.filter((n) => n.kind === 'note').map((n) => [n.id, n]));
  const claimById = new Map(data.nodes.filter((n) => n.kind === 'claim').map((n) => [n.id, n]));

  host.innerHTML = `
    <div class="view-head">
      <h1>图谱</h1>
      <span class="sub" id="graph-sub"></span>
      <span class="view-tools">
        <label class="sort-control">视图
          <select id="graph-mode">
            <option value="hubs" ${graphMode === 'hubs' ? 'selected' : ''}>论文归属图</option>
            <option value="related" ${graphMode === 'related' ? 'selected' : ''}>关联网络</option>
          </select>
        </label>
        <button type="button" class="btn btn-sm" id="graph-relayout">重新布局</button>
      </span>
    </div>
    <div class="graph-wrap">
      <canvas id="graph-canvas" class="graph-canvas"></canvas>
      <div class="graph-legend">
        <span class="lg"><i class="dot" style="background:var(--c-asserted)"></i>asserted</span>
        <span class="lg"><i class="dot" style="background:var(--c-verified)"></i>verified</span>
        <span class="lg"><i class="dot" style="background:var(--c-refuted)"></i>refuted</span>
        <span class="lg"><i class="dot" style="background:var(--c-stale)"></i>stale</span>
        <span class="lg"><i class="sq"></i>笔记（论文）</span>
        <span class="lg hint">拖拽平移 · 滚轮缩放 · 点节点跳详情</span>
      </div>
      <div class="graph-tooltip" id="graph-tooltip" hidden></div>
    </div>`;

  const canvas = $('#graph-canvas');
  const wrap = canvas.parentElement;
  const tooltip = $('#graph-tooltip');
  const ctx = canvas.getContext('2d');
  let mode = graphMode;

  // ---- simulation state (positions survive filter changes) ----
  const pos = new Map(); // id -> {x, y, vx, vy}
  const ensurePos = (id, x, y) => {
    if (!pos.has(id)) pos.set(id, { x: x + (Math.random() - 0.5) * 40, y: y + (Math.random() - 0.5) * 40, vx: 0, vy: 0 });
    return pos.get(id);
  };
  let alpha = 0;            // simulation heat
  let raf = 0;
  let view = { zoom: 1, panX: 0, panY: 0, autoFit: true };
  let hoverId = null;
  let focusNote = null;     // sticky highlight after clicking a note node
  let dragNode = null;
  let panning = null;
  let mouse = { x: 0, y: 0, inside: false };

  let nodes = [];           // active nodes [{...meta, x, y, vx, vy, r, deg}]
  let edges = [];           // active edges
  let neighbors = new Map();
  const claimIds = new Set();

  const resize = () => {
    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    kick(0.08);
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(wrap);

  // ---- filtering ----
  function refilter() {
    const q = state.q.trim().toLowerCase();
    const claimVisible = (n) => state.statuses.has(n.status)
      && (!state.activeTag || n.tags.includes(state.activeTag))
      && (!q || String(`${n.label} ${n.id}`).toLowerCase().includes(q));

    const activeClaims = [...claimById.values()].filter(claimVisible);
    const noteHasVisible = new Map();
    for (const note of noteById.values()) noteHasVisible.set(note.id, false);
    const claimsOfNote = new Map();
    const nextEdges = [];
    neighbors = new Map();
    const bump = (a, b) => {
      if (!neighbors.has(a)) neighbors.set(a, new Set());
      neighbors.get(a).add(b);
    };

    if (mode === 'hubs') {
      const visibleSet = new Set(activeClaims.map((c) => c.id));
      for (const claim of activeClaims) {
        const notePath = claimIdNote.get(claim.id);
        if (notePath) {
          if (!claimsOfNote.has(notePath)) claimsOfNote.set(notePath, []);
          claimsOfNote.get(notePath).push(claim.id);
          noteHasVisible.set(notePath, true);
          nextEdges.push({ source: notePath, target: claim.id, kind: 'note' });
          bump(notePath, claim.id); bump(claim.id, notePath);
        }
      }
      for (const e of data.edges) {
        if (e.kind !== 'related') continue;
        if (!claimById.has(e.source) || !claimById.has(e.target)) continue;
        if (!visibleSet.has(e.source) || !visibleSet.has(e.target)) continue;
        nextEdges.push(e);
        bump(e.source, e.target); bump(e.target, e.source);
      }
      const activeNotes = [...noteById.values()].filter((n) => noteHasVisible.get(n.id) || n.id === focusNote);
      set_active([...activeNotes, ...activeClaims], nextEdges);
    } else {
      const linked = new Set();
      for (const e of data.edges) {
        if (e.kind !== 'related') continue;
        if (!claimById.has(e.source) || !claimById.has(e.target)) continue;
        linked.add(e.source); linked.add(e.target);
      }
      const active = activeClaims.filter((c) => linked.has(c.id));
      const activeSet = new Set(active.map((c) => c.id));
      for (const e of data.edges) {
        if (e.kind !== 'related') continue;
        if (activeSet.has(e.source) && activeSet.has(e.target)) {
          nextEdges.push(e);
          bump(e.source, e.target); bump(e.target, e.source);
        }
      }
      set_active(active, nextEdges);
    }
    $('#graph-sub').textContent = `显示 ${nodes.length} 节点 · ${edges.length} 边（全库 ${data.counts.claims} claim · ${data.counts.notes} 笔记 · related ${data.counts.edgesRelated} 条）`;
    kick(0.45);
  }

  // note path per claim id (claims may lack a note)
  const claimIdNote = new Map();
  for (const e of data.edges) {
    if (e.kind === 'note') {
      const claim = claimById.get(e.target);
      if (claim) claimIdNote.set(claim.id, e.source);
    }
  }

  function set_active(activeNodes, activeEdges) {
    const deg = new Map();
    for (const e of activeEdges) {
      deg.set(e.source, (deg.get(e.source) ?? 0) + 1);
      deg.set(e.target, (deg.get(e.target) ?? 0) + 1);
    }
    const w = canvas.clientWidth || 900;
    const h = canvas.clientHeight || 500;
    const noteIds = activeNodes.filter((n) => n.kind === 'note').map((n) => n.id);
    const R = Math.max(120, Math.min(560, 62 * Math.sqrt(Math.max(1, noteIds.length))));
    const placed = new Map();
    noteIds.forEach((id, i) => {
      const a = (i / Math.max(1, noteIds.length)) * Math.PI * 2;
      placed.set(id, { x: Math.cos(a) * R, y: Math.sin(a) * R });
    });
    nodes = activeNodes.map((meta) => {
      let seed;
      if (placed.has(meta.id)) seed = placed.get(meta.id);
      else {
        const noteId = claimIdNote.get(meta.id);
        const anchor = noteId && placed.get(noteId);
        seed = anchor
          ? { x: anchor.x + (Math.random() - 0.5) * 90, y: anchor.y + (Math.random() - 0.5) * 90 }
          : { x: (Math.random() - 0.5) * w * 0.8, y: (Math.random() - 0.5) * h * 0.8 };
      }
      const p = ensurePos(meta.id, seed.x, seed.y);
      const d = deg.get(meta.id) ?? 0;
      return { ...meta, ...p, deg: d, r: meta.kind === 'note' ? 6 : 3.5 + Math.min(d, 10) * 0.55 };
    });
    edges = activeEdges;
    nodeById = new Map(nodes.map((n) => [n.id, n]));
  }

  let nodeById = new Map();

  // ---- simulation ----
  function tick() {
    const n = nodes.length;
    const repulsion = mode === 'related' ? 2600 : 3400;
    for (let i = 0; i < n; i += 1) {
      const a = nodes[i];
      for (let j = i + 1; j < n; j += 1) {
        const b = nodes[j];
        let dx = a.x - b.x; let dy = a.y - b.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; d2 = 1; }
        if (d2 > 640000) continue; // cutoff: far pairs don't push
        const f = repulsion / d2;
        const d = Math.sqrt(d2);
        const fx = (dx / d) * f; const fy = (dy / d) * f;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      }
    }
    for (const e of edges) {
      const a = nodeById.get(e.source);
      const b = nodeById.get(e.target);
      if (!a || !b) continue;
      const target = e.kind === 'note' ? 110 : 150;
      const k = e.kind === 'note' ? 0.045 : 0.02;
      const dx = b.x - a.x; const dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = (d - target) * k;
      const fx = (dx / d) * f; const fy = (dy / d) * f;
      a.vx += fx; a.vy += fy;
      b.vx -= fx; b.vy -= fy;
    }
    for (const node of nodes) {
      node.vx += -node.x * 0.0035;
      node.vy += -node.y * 0.0035;
      if (dragNode === node.id) { node.vx = 0; node.vy = 0; continue; }
      node.vx *= 0.82; node.vy *= 0.82;
      node.x += node.vx * alpha;
      node.y += node.vy * alpha;
      const p = pos.get(node.id);
      if (p) { p.x = node.x; p.y = node.y; p.vx = node.vx; p.vy = node.vy; }
    }
    alpha *= 0.985;
    if (alpha < 0.02) alpha = 0;
  }

  function draw() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // auto-fit while untouched
    if (view.autoFit && nodes.length) {
      let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity;
      for (const node of nodes) {
        if (node.x < minX) minX = node.x; if (node.x > maxX) maxX = node.x;
        if (node.y < minY) minY = node.y; if (node.y > maxY) maxY = node.y;
      }
      const bw = Math.max(50, maxX - minX); const bh = Math.max(50, maxY - minY);
      const z = Math.min(2.2, Math.max(0.25, Math.min((w - 80) / bw, (h - 80) / bh)));
      view.zoom = view.zoom * 0.9 + z * 0.1;
      view.panX = view.panX * 0.9 + (-(minX + maxX) / 2) * view.zoom * 0.1;
      view.panY = view.panY * 0.9 + (-(minY + maxY) / 2) * view.zoom * 0.1;
    }

    ctx.translate(w / 2 + view.panX, h / 2 + view.panY);
    ctx.scale(view.zoom, view.zoom);

    const focusSet = new Set();
    if (hoverId) focusSet.add(hoverId);
    if (focusNote) focusSet.add(focusNote);
    const highlight = (id) => (hoverId || focusNote) && focusSet.has(id);
    const isNeighbor = (id) => (hoverId || focusNote) && neighbors.get(hoverId ?? focusNote)?.has(id);
    const dimming = Boolean(hoverId || focusNote);

    // edges
    for (const e of edges) {
      const a = pos.get(e.source); const b = pos.get(e.target);
      if (!a || !b) continue;
      const activeEdge = (hoverId || focusNote) && (e.source === (hoverId ?? focusNote) || e.target === (hoverId ?? focusNote));
      ctx.globalAlpha = dimming ? (activeEdge ? 0.9 : 0.08) : (e.kind === 'related' ? 0.55 : 0.4);
      ctx.strokeStyle = e.kind === 'related' ? cssVar('--brand') : cssVar('--border') || '#8888';
      ctx.lineWidth = activeEdge ? 1.8 : (e.kind === 'related' ? 1.2 : 1);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // nodes
    ctx.font = '11px var(--font-ui, sans-serif)';
    const showLabels = view.zoom >= 1.9;
    for (const node of nodes) {
      const dim = dimming && !highlight(node.id) && !isNeighbor(node.id);
      ctx.globalAlpha = dim ? 0.15 : 1;
      if (node.kind === 'note') {
        const s = node.r + 4;
        ctx.fillStyle = cssVar('--surface');
        ctx.strokeStyle = cssVar('--brand');
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y - s);
        ctx.lineTo(node.x + s, node.y);
        ctx.lineTo(node.x, node.y + s);
        ctx.lineTo(node.x - s, node.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = statusColor(node.status);
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();
      }
      const label = node.kind === 'note' ? node.label : node.title ?? node.label;
      const wantLabel = node.kind === 'note' || showLabels || node.id === hoverId || (dimming && isNeighbor(node.id));
      if (wantLabel) {
        ctx.globalAlpha = dim ? 0.2 : (node.kind === 'note' ? 0.95 : 0.85);
        ctx.fillStyle = cssVar('--text-muted');
        ctx.textAlign = 'center';
        const text = label.length > 26 ? `${label.slice(0, 25)}…` : label;
        ctx.fillText(text, node.x, node.y + node.r + (node.kind === 'note' ? 16 : 11));
      }
    }
    ctx.globalAlpha = 1;
  }

  function loop() {
    raf = 0;
    if (alpha > 0) tick();
    draw();
    if (alpha > 0) kick(0);
  }

  function kick(initialAlpha) {
    if (initialAlpha > alpha) alpha = initialAlpha;
    if (!raf) raf = requestAnimationFrame(loop);
  }
  function pause() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    alpha = 0;
  }

  // ---- interaction ----
  const toWorld = (event) => {
    const rect = canvas.getBoundingClientRect();
    const sx = event.clientX - rect.left - (rect.width / 2 + view.panX);
    const sy = event.clientY - rect.top - (rect.height / 2 + view.panY);
    return { x: sx / view.zoom, y: sy / view.zoom };
  };
  function pick(event) {
    const { x, y } = toWorld(event);
    let best = null; let bestD = Infinity;
    for (const node of nodes) {
      const d = Math.hypot(node.x - x, node.y - y);
      const hit = node.r + (node.kind === 'note' ? 6 : 5);
      if (d < hit && d < bestD) { best = node; bestD = d; }
    }
    return best;
  }

  canvas.addEventListener('mousemove', (event) => {
    mouse = { x: event.clientX, y: event.clientY, inside: true };
    if (dragNode) {
      const node = nodes.find((n) => n.id === dragNode);
      if (node) {
        const w = toWorld(event);
        node.x = w.x; node.y = w.y;
        const p = pos.get(node.id);
        if (p) { p.x = w.x; p.y = w.y; }
        kick(0.3);
      }
      return;
    }
    if (panning) {
      view.panX = panning.panX + (event.clientX - panning.x);
      view.panY = panning.panY + (event.clientY - panning.y);
      view.autoFit = false;
      kick(0);
      return;
    }
    const hit = pick(event);
    const changed = (hit?.id ?? null) !== hoverId;
    hoverId = hit?.id ?? null;
    if (hoverId) {
      const node = hit;
      const lines = node.kind === 'note'
        ? [`<b>${esc(node.label)}</b>`, `<span class="field-hint">笔记 · ${node.deg} 条边</span>`]
        : [`<b>${esc(node.label)}</b>`,
          `<span class="badge badge-status-${esc(node.status)}">${esc(node.status)}</span> <span class="badge badge-stance">${esc(node.stance)}</span>`,
          node.tags?.length ? `<span class="field-hint">${esc(node.tags.join(' · '))}</span>` : ''];
      tooltip.innerHTML = lines.filter(Boolean).join('<br>');
      tooltip.hidden = false;
      const rect = wrap.getBoundingClientRect();
      const tx = Math.min(event.clientX - rect.left + 14, rect.width - 280);
      const ty = Math.min(event.clientY - rect.top + 14, rect.height - 90);
      tooltip.style.left = `${Math.max(8, tx)}px`;
      tooltip.style.top = `${Math.max(8, ty)}px`;
      canvas.style.cursor = 'pointer';
    } else {
      tooltip.hidden = true;
      canvas.style.cursor = 'default';
    }
    if (changed) kick(0);
  });
  canvas.addEventListener('mouseleave', () => {
    mouse.inside = false;
    hoverId = null;
    tooltip.hidden = true;
    kick(0);
  });
  let downXY = null; // to distinguish a click from a drag
  canvas.addEventListener('mousedown', (event) => {
    downXY = { x: event.clientX, y: event.clientY };
    const hit = pick(event);
    if (hit) {
      dragNode = hit.id;
      view.autoFit = false;
    } else {
      panning = { x: event.clientX, y: event.clientY, panX: view.panX, panY: view.panY };
    }
    kick(0.15);
  });
  const onWindowUp = (event) => {
    if (dragNode) {
      dragNode = null;
      kick(0.2);
      return;
    }
    if (panning) {
      const moved = Math.hypot(event.clientX - panning.x, event.clientY - panning.y);
      panning = null;
      if (moved < 4) {
        // plain click on background: clear sticky focus
        if (focusNote) { focusNote = null; kick(0.2); }
      }
    }
  };
  window.addEventListener('mouseup', onWindowUp);
  canvas.addEventListener('click', (event) => {
    if (event.target !== canvas) return;
    // ignore the click that ends a node drag / pan
    if (downXY && Math.hypot(event.clientX - downXY.x, event.clientY - downXY.y) > 4) return;
    const hit = pick(event);
    if (!hit) return;
    if (hit.kind === 'claim') {
      location.hash = `#/claim/${encodeURIComponent(hit.id)}`;
    } else {
      focusNote = focusNote === hit.id ? null : hit.id;
      kick(0.2);
    }
  });
  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mx = event.clientX - rect.left - rect.width / 2;
    const my = event.clientY - rect.top - rect.height / 2;
    const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
    const next = Math.min(6, Math.max(0.2, view.zoom * factor));
    const applied = next / view.zoom;
    view.panX = mx - (mx - view.panX) * applied;
    view.panY = my - (my - view.panY) * applied;
    view.zoom = next;
    view.autoFit = false;
    kick(0);
  }, { passive: false });

  $('#graph-mode').addEventListener('change', (event) => {
    mode = event.target.value;
    graphMode = mode;
    focusNote = null;
    refilter();
  });
  $('#graph-relayout').addEventListener('click', () => {
    pos.clear();
    view = { zoom: 1, panX: 0, panY: 0, autoFit: true };
    refilter();
  });

  graphRuntime = {
    canvas,
    pause,
    refilter,
    onWindowUp,
  };
  resize();
  refilter();
}

// ---------------------------------------------------------------- router --

function renderMain() {
  graphRuntime?.pause();
  const hash = location.hash || '#/queue';
  const isDetailView = hash.startsWith('#/claim/') || hash === '#/new';
  document.body.classList.toggle('detail-view', isDetailView);
  if (isDetailView) closeDrawer();
  if (hash.startsWith('#/claim/')) {
    const id = decodeURIComponent(hash.slice('#/claim/'.length));
    renderDetail(id);
  } else if (hash === '#/new') {
    renderNew();
  } else if (hash === '#/graph') {
    if (isMobile()) {
      // The force layout and canvas interactions are desktop-only for now.
      $('#main').innerHTML = '<div class="empty-state">图谱视图暂未适配移动端。<br>请在桌面端查看。</div>';
    } else {
      renderGraph();
    }
  } else if (hash === '#/claims') {
    renderClaims();
  } else {
    renderQueue();
  }
  const navName = hash.startsWith('#/claim/') || hash === '#/new'
    ? 'claims'
    : (hash === '#/graph' ? 'graph' : (hash === '#/claims' ? 'claims' : 'queue'));
  document.querySelectorAll('.nav a[data-nav]').forEach((a) => {
    a.classList.toggle('active', a.dataset.nav === navName);
  });
}

function render() {
  if (!state.loaded) return;
  const hash = location.hash || '#/queue';
  if (hash === '#/claims' || hash === '#/graph' || hash.startsWith('#/claim/') || hash === '#/new') {
    if (hash === '#/claims' || hash === '#/graph') renderSidebar();
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
  $('#search-toggle').addEventListener('click', () => {
    setSearchOpen(!$('.topbar').classList.contains('search-open'));
  });
  $('#filter-toggle').addEventListener('click', toggleDrawer);
  $('#drawer-overlay').addEventListener('click', closeDrawer);
  $('.topbar').addEventListener('click', (event) => {
    if (event.target.closest('.nav a, .brand')) setSearchOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeDrawer();
      setSearchOpen(false);
    }
  });
  MOBILE_QUERY.addEventListener('change', () => {
    closeDrawer();
    setSearchOpen(false);
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
    closeDrawer();
    setSearchOpen(false);
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
