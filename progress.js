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
    const footerRight = document.querySelector('.footer-right');
    if (!footerRight) return;
    if (document.getElementById('progress-btn')) return;

    // 按鈕
    const btn = document.createElement('button');
    btn.id        = 'progress-btn';
    btn.className = 'footer-btn';
    btn.style.cssText = 'margin-right:6px;background:#9C27B0;color:#fff;border-color:#6A1B9A;';
    btn.innerHTML = '紀錄 <i class="fas fa-chart-bar"></i>';
    footerRight.insertBefore(btn, footerRight.firstChild);

    // modal
    const overlay = document.createElement('div');
    overlay.id = 'progress-modal';
    overlay.style.cssText = 'display:none;position:fixed;inset:0;z-index:9999;' +
      'background:rgba(0,0,0,.5);justify-content:center;align-items:center;';
    overlay.innerHTML =
      '<div style="background:#fff;border-radius:12px;padding:20px;width:92%;max-width:520px;' +
      'max-height:90vh;display:flex;flex-direction:column;position:relative;box-shadow:0 8px 32px rgba(0,0,0,.25);">' +
        '<span id="close-progress" style="position:absolute;top:12px;right:16px;font-size:24px;' +
        'cursor:pointer;color:#9ca3af;line-height:1;">&times;</span>' +
        '<h2 style="text-align:center;color:' + BRAND + ';margin:0 0 14px;font-size:17px;">&#x1F4CB; 學習紀錄</h2>' +

        // 分頁按鈕
        '<div style="display:flex;gap:8px;margin-bottom:12px;">' +
          '<button class="prog-tab-btn" data-tab="visits" ' +
          'style="flex:1;padding:7px;border:none;border-radius:8px;cursor:pointer;font-weight:700;' +
          'font-size:13px;font-family:inherit;background:' + BRAND + ';color:#fff;">' +
          '&#x1F4CB; 最近造訪</button>' +
          '<button class="prog-tab-btn" data-tab="ex" ' +
          'style="flex:1;padding:7px;border:none;border-radius:8px;cursor:pointer;font-weight:700;' +
          'font-size:13px;font-family:inherit;background:#f3f4f6;color:#374151;">' +
          '&#x2B50; 練習成績</button>' +
        '</div>' +

        // 造訪 panel
        '<div id="prog-panel-visits" style="overflow-y:auto;max-height:340px;">' +
          '<div id="prog-visits-list"></div>' +
          '<p id="prog-visits-empty" style="text-align:center;color:#aaa;display:none;margin:24px 0;">' +
          '還沒有造訪記錄，去學習看看吧！</p>' +
        '</div>' +

        // 成績 panel
        '<div id="prog-panel-ex" style="overflow-y:auto;max-height:340px;display:none;">' +
          '<div id="prog-ex-list"></div>' +
          '<p id="prog-ex-empty" style="text-align:center;color:#aaa;display:none;margin:24px 0;">' +
          '還沒有練習成績，完成練習後按「提交成績」吧！</p>' +
        '</div>' +

        '<div style="text-align:right;margin-top:12px;border-top:1px solid #eee;padding-top:10px;flex-shrink:0;">' +
          '<button id="prog-clear-btn" style="background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;' +
          'border-radius:6px;padding:5px 12px;cursor:pointer;font-size:12px;">&#x1F5D1; 清除全部紀錄</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    // 事件
    btn.addEventListener('click', function () {
      overlay.style.display = 'flex';
      switchTab('visits');
    });
    document.getElementById('close-progress').addEventListener('click', function () {
      overlay.style.display = 'none';
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.style.display = 'none';
    });
    overlay.querySelectorAll('.prog-tab-btn').forEach(function (b) {
      b.addEventListener('click', function () { switchTab(this.dataset.tab); });
    });
    document.getElementById('prog-clear-btn').addEventListener('click', function () {
      if (confirm('確定要清除全部學習紀錄嗎？此動作無法復原。')) {
        localStorage.removeItem(STORAGE_KEY);
        renderVisits();
        renderExercises();
      }
    });
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
