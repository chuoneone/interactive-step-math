/**
 * @file progress.js
 * @description 學習進度本機追蹤。
 *   - 自動記錄頁面造訪
 *   - 在任何有 .sticky-footer 的頁面自動注入「紀錄」按鈕與 modal
 *   - modal 顯示：最近造訪 + 每頁最高成績
 *   - 公開 API: spedProgress.recordExercise(score, total, label)
 */
(function () {
  const STORAGE_KEY = 'spedmix_progress';
  const BRAND       = '#C84C0C';
  const MAX_VISITS  = 200;

  // ── 資料層 ──────────────────────────────────────────────────

  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return d || { visits: [], exercises: [] };
    } catch (e) {
      return { visits: [], exercises: [] };
    }
  }

  function persist(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  function recordVisit() {
    if (location.pathname === '/' || location.pathname.endsWith('index.html')) return;
    const data  = load();
    const url   = location.pathname;
    const title = document.title || url;
    data.visits = data.visits.filter(v => v.url !== url);
    data.visits.unshift({ url, title, time: new Date().toISOString() });
    if (data.visits.length > MAX_VISITS) data.visits.length = MAX_VISITS;
    persist(data);
  }

  function recordExercise(score, total, label) {
    const data = load();
    data.exercises = data.exercises || [];
    data.exercises.unshift({
      url:   location.pathname,
      title: label || document.title,
      score: score,
      total: total,
      time:  new Date().toISOString()
    });
    if (data.exercises.length > 500) data.exercises.length = 500;
    persist(data);
  }

  // ── UI 輔助 ──────────────────────────────────────────────────

  function relTime(iso) {
    const s = (Date.now() - new Date(iso)) / 1000;
    if (s < 60)     return '剛才';
    if (s < 3600)   return Math.floor(s / 60)   + ' 分鐘前';
    if (s < 86400)  return Math.floor(s / 3600)  + ' 小時前';
    if (s < 604800) return Math.floor(s / 86400) + ' 天前';
    return new Date(iso).toLocaleDateString('zh-TW');
  }

  function subjectIcon(url) {
    if (url.includes('chinese') || url.includes('ch.html')) return '📖';
    if (url.includes('english') || url.includes('eng.html')) return '🔤';
    if (url.includes('math') || /\/[789]\.html/.test(url))  return '🔢';
    if (url.includes('social')) return '🤝';
    return '📚';
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function scoreBadge(score, total) {
    const pct   = total > 0 ? Math.round(score / total * 100) : 0;
    const bg    = pct >= 80 ? '#d1fae5' : pct >= 60 ? '#fef3c7' : '#fee2e2';
    const color = pct >= 80 ? '#065f46' : pct >= 60 ? '#92400e' : '#991b1b';
    return '<span style="font-size:12px;font-weight:800;background:' + bg + ';color:' + color +
           ';padding:2px 8px;border-radius:12px;white-space:nowrap;">' +
           score + '/' + total + '&nbsp;(' + pct + '%)</span>';
  }

  // ── 渲染：最近造訪 ───────────────────────────────────────────

  function renderVisits() {
    const data  = load();
    const list  = document.getElementById('prog-visits-list');
    const empty = document.getElementById('prog-visits-empty');
    if (!list) return;
    if (!data.visits.length) {
      list.innerHTML = ''; empty.style.display = 'block'; return;
    }
    empty.style.display = 'none';
    list.innerHTML = data.visits.slice(0, 50).map(function (v) {
      return '<div style="display:flex;justify-content:space-between;align-items:center;' +
             'padding:8px 6px;border-bottom:1px solid #f3f4f6;">' +
             '<span style="font-size:14px;color:#1f2937;">' + subjectIcon(v.url) + ' ' + escHtml(v.title) + '</span>' +
             '<span style="font-size:12px;color:#9ca3af;white-space:nowrap;margin-left:8px;">' + relTime(v.time) + '</span>' +
             '</div>';
    }).join('');
  }

  // ── 渲染：練習成績（每頁最高分）────────────────────────────────

  function renderExercises() {
    const data = load();
    const list  = document.getElementById('prog-ex-list');
    const empty = document.getElementById('prog-ex-empty');
    if (!list) return;

    const exs = data.exercises || [];
    if (!exs.length) {
      list.innerHTML = ''; empty.style.display = 'block'; return;
    }
    empty.style.display = 'none';

    // 按 URL 分組，取最高分 + 最後練習時間
    const byUrl = {};
    exs.forEach(function (e) {
      const pct = e.total > 0 ? e.score / e.total : 0;
      if (!byUrl[e.url]) {
        byUrl[e.url] = { title: e.title, url: e.url, best: e, bestPct: pct, lastTime: e.time };
      } else {
        if (pct > byUrl[e.url].bestPct) { byUrl[e.url].best = e; byUrl[e.url].bestPct = pct; }
        if (e.time > byUrl[e.url].lastTime) byUrl[e.url].lastTime = e.time;
      }
    });

    const rows = Object.values(byUrl).sort(function (a, b) {
      return b.lastTime.localeCompare(a.lastTime);
    });

    list.innerHTML = rows.map(function (r) {
      return '<div style="display:flex;justify-content:space-between;align-items:center;' +
             'padding:8px 6px;border-bottom:1px solid #f3f4f6;gap:8px;">' +
             '<div style="min-width:0;">' +
             '<div style="font-size:14px;color:#1f2937;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
             subjectIcon(r.url) + ' ' + escHtml(r.best.title) + '</div>' +
             '<div style="font-size:11px;color:#9ca3af;margin-top:2px;">最近：' + relTime(r.lastTime) + '</div>' +
             '</div>' +
             '<div style="flex-shrink:0;text-align:right;">' +
             '<div style="font-size:11px;color:#9ca3af;margin-bottom:3px;">最高</div>' +
             scoreBadge(r.best.score, r.best.total) +
             '</div></div>';
    }).join('');
  }

  // ── UI 注入 ──────────────────────────────────────────────────

  function switchTab(tab) {
    var panels  = ['prog-panel-visits', 'prog-panel-ex'];
    var tabBtns = document.querySelectorAll('.prog-tab-btn');
    panels.forEach(function (id, i) {
      document.getElementById(id).style.display = (i === (tab === 'ex' ? 1 : 0)) ? '' : 'none';
    });
    tabBtns.forEach(function (b) {
      var active = b.dataset.tab === tab;
      b.style.background = active ? BRAND    : '#f3f4f6';
      b.style.color      = active ? '#fff'   : '#374151';
    });
    if (tab === 'visits') renderVisits(); else renderExercises();
  }

  function injectUI() {
    // 移除 UI 注入
    return;
  }

  // ── 公開 API ─────────────────────────────────────────────────

  window.spedProgress = {
    recordExercise: recordExercise,
    getData:        load,
    clearData:      function () { localStorage.removeItem(STORAGE_KEY); }
  };

  // ── 啟動 ─────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { recordVisit(); injectUI(); });
  } else {
    recordVisit(); injectUI();
  }
})();
