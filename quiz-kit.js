/**
 * @file quiz-kit.js
 * @description 通用計分計時工具列
 *   - 底部顯示：倒數計時 | 得分 | 歷史成績 | 提交
 *   - 自動偵測 .slot.correct 計算得分
 *   - 歷史按鈕展開本頁過去所有成績記錄
 *   - 計時結束自動提交
 *
 * 選用設定（在此 script 之前加入）：
 *   <script>
 *     window.quizKitConfig = {
 *       minutes: 7,          // 預設 7
 *       label:   '題目名稱', // 預設 document.title
 *       total:   20,         // 固定滿分（不填則自動算 .slot 數量）
 *     };
 *   </script>
 */
(function () {
  const cfg      = window.quizKitConfig || {};
  const MINUTES  = cfg.minutes || 7;
  const LABEL    = cfg.label   || document.title;
  const FIXED_TOTAL = cfg.total || null;

  let secondsLeft = MINUTES * 60;
  let submitted   = false;
  let timerHandle = null;
  let historyOpen = false;

  // ── 樣式 ────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #qk-bar {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 9990;
      background: #1e293b; color: #fff;
      display: flex; align-items: center;
      padding: 0 16px; height: 52px;
      box-shadow: 0 -2px 12px rgba(0,0,0,.25);
      font-family: 'Nunito','Noto Sans TC',sans-serif;
      gap: 10px;
    }
    #qk-bar.warning { background: #7f1d1d; }
    #qk-bar.done    { background: #14532d; }

    #qk-timer {
      font-size: 19px; font-weight: 800; min-width: 58px;
      letter-spacing: 1px; font-variant-numeric: tabular-nums;
    }
    #qk-timer.warn { color: #fca5a5; }

    #qk-score {
      flex: 1; text-align: center; font-weight: 700; font-size: 14px; color: #94a3b8;
    }
    #qk-score span { color: #fff; font-size: 17px; font-weight: 800; }

    .qk-btn {
      padding: 7px 14px; border: none; border-radius: 8px;
      font-size: 13px; font-weight: 800; font-family: inherit;
      cursor: pointer; white-space: nowrap; transition: background .15s;
    }
    #qk-history-btn { background: #334155; color: #e2e8f0; }
    #qk-history-btn:hover { background: #475569; }
    #qk-history-btn.active { background: #4f46e5; color: #fff; }
    #qk-submit-btn { background: #059669; color: #fff; }
    #qk-submit-btn:hover:not(:disabled) { background: #10b981; }
    #qk-submit-btn:disabled {
      background: #334155; color: #475569; cursor: not-allowed;
      box-shadow: none; opacity: .7;
    }
    /* 全部完成時按鈕脈動提示 */
    @keyframes qk-pulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,.6); }
      50%      { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
    }
    #qk-submit-btn:not(:disabled) { animation: qk-pulse 1.6s ease infinite; }

    /* 歷史面板 */
    #qk-history-panel {
      position: fixed; bottom: 52px; left: 0; right: 0; z-index: 9989;
      background: #1e293b; color: #fff;
      border-top: 1px solid #334155;
      max-height: 220px; overflow-y: auto;
      font-family: 'Nunito','Noto Sans TC',sans-serif;
      font-size: 14px;
      display: none;
    }
    #qk-history-panel.open { display: block; }
    .qk-hist-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 9px 16px; border-bottom: 1px solid #334155;
    }
    .qk-hist-row:last-child { border-bottom: none; }
    .qk-hist-time { color: #94a3b8; font-size: 12px; }
    .qk-hist-badge {
      font-weight: 800; font-size: 13px;
      padding: 2px 10px; border-radius: 12px;
    }
    .qk-hist-best { background: #166534; color: #bbf7d0; }

    body { padding-bottom: 60px !important; }
  `;
  document.head.appendChild(style);

  // ── HTML 注入 ────────────────────────────────────────────────
  function injectBar() {
    const histPanel = document.createElement('div');
    histPanel.id = 'qk-history-panel';
    document.body.appendChild(histPanel);

    const bar = document.createElement('div');
    bar.id = 'qk-bar';
    // 手動模式（FIXED_TOTAL 設定）→ 提交按鈕一開始可用；自動模式 → 要等全部答對
    const submitDisabled = FIXED_TOTAL === null ? 'disabled' : '';
    bar.innerHTML =
      '<div id="qk-timer">0' + String(MINUTES) + ':00</div>' +
      '<div id="qk-score">進度：<span id="qk-got">0</span> / <span id="qk-total">?</span></div>' +
      '<button id="qk-history-btn" class="qk-btn" onclick="quizKit.toggleHistory()">歷史 &#x25B2;</button>' +
      '<button id="qk-submit-btn"  class="qk-btn" onclick="quizKit.submit()" ' + submitDisabled + '>提交成績</button>';
    document.body.appendChild(bar);
  }

  // ── 計時器 ───────────────────────────────────────────────────
  function fmt(s) {
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  function tick() {
    if (submitted) return;
    secondsLeft--;
    const timerEl = document.getElementById('qk-timer');
    const barEl   = document.getElementById('qk-bar');
    if (timerEl) timerEl.textContent = fmt(secondsLeft);
    if (secondsLeft <= 60 && barEl) { timerEl.classList.add('warn'); barEl.classList.add('warning'); }
    if (secondsLeft <= 0) {
      clearInterval(timerHandle);
      // 時間到強制提交（不管是否全部完成）
      var submitBtn = document.getElementById('qk-submit-btn');
      if (submitBtn) submitBtn.disabled = false;
      quizKit.submit();
    }
  }

  // ── 自動計分 ─────────────────────────────────────────────────
  function getScore() {
    const total = FIXED_TOTAL !== null ? FIXED_TOTAL : document.querySelectorAll('.slot').length;
    const got   = document.querySelectorAll('.slot.correct').length;
    return { got, total };
  }

  function refreshScore() {
    if (submitted) return;
    var s       = getScore();
    var gotEl   = document.getElementById('qk-got');
    var totalEl = document.getElementById('qk-total');
    var scoreEl = document.getElementById('qk-score');
    var submitBtn = document.getElementById('qk-submit-btn');
    if (gotEl)   gotEl.textContent   = s.got;
    if (totalEl) totalEl.textContent = s.total || '?';

    // 自動模式：全部答對才開放提交
    if (FIXED_TOTAL === null && s.total > 0) {
      var allDone = s.got === s.total;
      if (submitBtn) {
        submitBtn.disabled = !allDone;
        submitBtn.style.background = allDone ? '#059669' : '';
      }
      if (scoreEl) {
        scoreEl.innerHTML = allDone
          ? '✓ 全部完成！<span style="color:#4ade80;font-size:17px;font-weight:800;">' + s.got + '/' + s.total + '</span>'
          : '進度：<span>' + s.got + '</span> / <span>' + (s.total || '?') + '</span>';
      }
    }
  }

  // ── 歷史面板 ─────────────────────────────────────────────────
  function relTime(iso) {
    var s = (Date.now() - new Date(iso)) / 1000;
    if (s < 60)     return '剛才';
    if (s < 3600)   return Math.floor(s / 60)   + ' 分鐘前';
    if (s < 86400)  return Math.floor(s / 3600)  + ' 小時前';
    if (s < 604800) return Math.floor(s / 86400) + ' 天前';
    return new Date(iso).toLocaleDateString('zh-TW');
  }

  function renderHistory() {
    const panel = document.getElementById('qk-history-panel');
    if (!panel) return;

    const data = window.spedProgress ? window.spedProgress.getData() : { exercises: [] };
    const url  = location.pathname;
    const mine = (data.exercises || []).filter(function (e) { return e.url === url; });

    if (!mine.length) {
      panel.innerHTML = '<div class="qk-hist-row" style="color:#94a3b8;justify-content:center;">還沒有成績記錄</div>';
      return;
    }

    // 找最高分
    let bestPct = -1;
    mine.forEach(function (e) {
      const p = e.total > 0 ? e.score / e.total : 0;
      if (p > bestPct) bestPct = p;
    });

    panel.innerHTML =
      '<div class="qk-hist-row" style="font-weight:800;font-size:12px;color:#64748b;justify-content:center;padding:6px 16px;">' +
      '本頁歷史成績（共 ' + mine.length + ' 次）</div>' +
      mine.slice(0, 10).map(function (e) {
        const pct    = e.total > 0 ? Math.round(e.score / e.total * 100) : 0;
        const isBest = e.total > 0 && Math.abs(e.score / e.total - bestPct) < 0.001;
        const badgeCls = isBest ? 'qk-hist-badge qk-hist-best' : 'qk-hist-badge';
        const badgeBg  = isBest ? '' : (pct >= 80 ? 'background:#166534;color:#bbf7d0;' : pct >= 60 ? 'background:#713f12;color:#fef08a;' : 'background:#7f1d1d;color:#fecaca;');
        return '<div class="qk-hist-row">' +
          '<span class="qk-hist-time">' + relTime(e.time) + (isBest ? '&nbsp;⭐ 最高' : '') + '</span>' +
          '<span class="' + badgeCls + '" style="' + badgeBg + '">' + e.score + '/' + e.total + '&nbsp;(' + pct + '%)</span>' +
          '</div>';
      }).join('');
  }

  // ── 提交結果彈窗 ─────────────────────────────────────────────
  function showResultPopup(got, total) {
    const pct   = total > 0 ? Math.round(got / total * 100) : 0;
    const emoji = pct === 100 ? '🎉' : pct >= 80 ? '👍' : pct >= 60 ? '💪' : '📝';

    if (!document.getElementById('qk-anim')) {
      const ks = document.createElement('style');
      ks.id = 'qk-anim';
      ks.textContent = '@keyframes qk-pop{from{opacity:0;transform:translate(-50%,-50%) scale(.8)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}';
      document.head.appendChild(ks);
    }
    const popup = document.createElement('div');
    popup.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
      'background:#fff;border-radius:16px;padding:28px 36px;' +
      'box-shadow:0 8px 40px rgba(0,0,0,.25);z-index:9995;' +
      'text-align:center;font-family:Nunito,sans-serif;animation:qk-pop .3s ease;';
    popup.innerHTML =
      '<div style="font-size:48px;margin-bottom:12px;">' + emoji + '</div>' +
      '<div style="font-size:22px;font-weight:800;color:#1e293b;margin-bottom:6px;">' +
        got + ' / ' + total + ' 分' +
      '</div>' +
      '<div style="font-size:14px;color:#64748b;">已儲存至學習紀錄</div>' +
      '<button onclick="this.parentNode.remove()" ' +
        'style="margin-top:16px;padding:8px 22px;background:#4f46e5;color:#fff;' +
        'border:none;border-radius:8px;font-size:14px;font-weight:700;' +
        'font-family:inherit;cursor:pointer;">關閉</button>';
    document.body.appendChild(popup);
  }

  // ── 公開 API ─────────────────────────────────────────────────
  window.quizKit = {
    submit: function (got, total) {
      if (submitted) return;
      submitted = true;
      clearInterval(timerHandle);

      if (got === undefined || total === undefined) {
        var s = getScore(); got = s.got; total = s.total;
      }

      var submitBtn = document.getElementById('qk-submit-btn');
      var barEl     = document.getElementById('qk-bar');
      var gotEl     = document.getElementById('qk-got');
      var totalEl   = document.getElementById('qk-total');
      if (submitBtn) { submitBtn.textContent = '已提交 ✓'; submitBtn.disabled = true; }
      if (barEl)     barEl.classList.add('done');
      if (gotEl)     gotEl.textContent   = got;
      if (totalEl)   totalEl.textContent = total;

      if (window.spedProgress) {
        window.spedProgress.recordExercise(got, total, LABEL);
      }

      showResultPopup(got, total);
      // 刷新歷史面板
      if (historyOpen) renderHistory();
    },

    toggleHistory: function () {
      historyOpen = !historyOpen;
      const panel = document.getElementById('qk-history-panel');
      const btn   = document.getElementById('qk-history-btn');
      if (panel) {
        panel.classList.toggle('open', historyOpen);
        panel.innerHTML = '';
        if (historyOpen) renderHistory();
      }
      if (btn) {
        btn.classList.toggle('active', historyOpen);
        btn.innerHTML = historyOpen ? '歷史 &#x25BC;' : '歷史 &#x25B2;';
      }
    },

    setScore: function (got, total) {
      var gotEl   = document.getElementById('qk-got');
      var totalEl = document.getElementById('qk-total');
      if (gotEl)   gotEl.textContent   = got;
      if (totalEl) totalEl.textContent = total;
    }
  };

  // ── 啟動 ─────────────────────────────────────────────────────
  function init() {
    injectBar();
    timerHandle = setInterval(tick, 1000);
    setInterval(refreshScore, 400);
    refreshScore();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
