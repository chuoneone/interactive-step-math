/**
 * @file progress.js
 * @description 學習進度本機追蹤。
 *   - 自動記錄頁面造訪
 *   - 在任何有 .sticky-footer 的頁面自動注入「紀錄」按鈕與 modal
 *   - 在導覽頁面為已造訪的連結加上綠色 hover 效果
 */
(function () {
  const STORAGE_KEY = 'spedmix_progress';
  const BRAND       = '#C84C0C';
  const MAX_VISITS  = 200;

  // ── 資料層 ──────────────────────────────────────────────────

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { visits: [] };
    } catch (e) {
      return { visits: [] };
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

  // ── 渲染 ────────────────────────────────────────────────────

  function renderVisits() {
    const data  = load();
    const list  = document.getElementById('prog-visits-list');
    const empty = document.getElementById('prog-visits-empty');
    if (!list) return;
    if (!data.visits.length) {
      list.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';
    list.innerHTML = data.visits.slice(0, 50).map(function (v) {
      return '<div style="display:flex;justify-content:space-between;align-items:center;' +
             'padding:8px 6px;border-bottom:1px solid #f3f4f6;">' +
             '<span style="font-size:14px;color:#1f2937;">' + subjectIcon(v.url) + ' ' + escHtml(v.title) + '</span>' +
             '<span style="font-size:12px;color:#9ca3af;white-space:nowrap;margin-left:10px;">' + relTime(v.time) + '</span>' +
             '</div>';
    }).join('');
  }

  // ── UI 注入 ──────────────────────────────────────────────────

  function injectUI() {
    const footerRight = document.querySelector('.footer-right');
    if (!footerRight) return;
    if (document.getElementById('progress-btn')) return;

    // 注入「紀錄」按鈕（明確給定顏色，避免因 CSS 載入時序造成白字不可見）
    const btn = document.createElement('button');
    btn.id        = 'progress-btn';
    btn.className = 'footer-btn';
    btn.style.cssText = 'margin-right:6px;background:#9C27B0;color:#fff;border-color:#6A1B9A;';
    btn.innerHTML = '紀錄 <i class="fas fa-chart-bar"></i>';
    footerRight.insertBefore(btn, footerRight.firstChild);

    // 注入 modal
    const overlay = document.createElement('div');
    overlay.id = 'progress-modal';
    overlay.style.cssText = 'display:none;position:fixed;inset:0;z-index:9999;' +
      'background:rgba(0,0,0,.5);justify-content:center;align-items:center;';
    overlay.innerHTML =
      '<div style="background:#fff;border-radius:12px;padding:24px;width:92%;max-width:520px;' +
      'max-height:90vh;overflow-y:auto;position:relative;box-shadow:0 8px 32px rgba(0,0,0,.25);">' +
        '<span id="close-progress" style="position:absolute;top:14px;right:18px;font-size:24px;' +
        'cursor:pointer;color:#9ca3af;line-height:1;">&times;</span>' +
        '<h2 style="text-align:center;color:' + BRAND + ';margin:0 0 16px;font-size:18px;">' +
        '&#x1F4CB; 最近學習紀錄</h2>' +
        '<div id="prog-visits-list" style="max-height:380px;overflow-y:auto;"></div>' +
        '<p id="prog-visits-empty" style="text-align:center;color:#aaa;display:none;margin:24px 0;">' +
        '還沒有造訪記錄，去學習看看吧！</p>' +
        '<div style="text-align:right;margin-top:14px;border-top:1px solid #eee;padding-top:10px;">' +
          '<button id="prog-clear-btn" style="background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;' +
          'border-radius:6px;padding:6px 14px;cursor:pointer;font-size:13px;">' +
          '&#x1F5D1; 清除全部紀錄</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    // 事件綁定
    btn.addEventListener('click', function () {
      overlay.style.display = 'flex';
      renderVisits();
    });

    document.getElementById('close-progress').addEventListener('click', function () {
      overlay.style.display = 'none';
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.style.display = 'none';
    });

    document.getElementById('prog-clear-btn').addEventListener('click', function () {
      if (confirm('確定要清除全部學習紀錄嗎？此動作無法復原。')) {
        localStorage.removeItem(STORAGE_KEY);
        renderVisits();
        markVisitedLinks();
      }
    });
  }

  // ── 公開 API ─────────────────────────────────────────────────

  window.spedProgress = {
    getData:   load,
    clearData: function () { localStorage.removeItem(STORAGE_KEY); }
  };

  // ── 啟動 ─────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      recordVisit();
      injectUI();
    });
  } else {
    recordVisit();
    injectUI();
  }
})();
