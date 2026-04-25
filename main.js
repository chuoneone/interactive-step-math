/**
 * main.js
 * 整合：導覽列注入、手機版選單、導覽高亮、倒數計時、頁籤切換、上下學期切換
 */

// 1. 定義共用的導覽列 HTML 模板
const NAVBAR_TEMPLATE = `
  <a href="/" class="logo">SPEDMIX學習平台</a>
  <nav>
    <ul class="nav-links">
      <li><a href="/">HOME</a></li>
      <li class="dropdown">
        <a href="javascript:void(0)" class="dropbtn">國文 <i class="fas fa-caret-down"></i></a>
        <div class="dropdown-content">
          <a href="7ch.html">國一</a>
          <a href="8ch.html">國二</a>
          <a href="9ch.html">國三</a>
        </div>
      </li>
      <li class="dropdown">
        <a href="javascript:void(0)" class="dropbtn">數學 <i class="fas fa-caret-down"></i></a>
        <div class="dropdown-content">
          <a href="7.html">國一</a>
          <a href="8.html">國二</a>
          <a href="9.html">國三</a>
        </div>
      </li>
      <li class="dropdown">
        <a href="javascript:void(0)" class="dropbtn">英文 <i class="fas fa-caret-down"></i></a>
        <div class="dropdown-content">
          <a href="7eng.html">國一</a>
          <a href="8eng.html">國二</a>
          <a href="9eng.html">國三</a>
        </div>
      </li>
    </ul>
  </nav>
  <div class="menu-toggle">
    <i class="fas fa-bars"></i>
  </div>
`;

// 2. 定義共用的頁尾 HTML 模板
const FOOTER_TEMPLATE = `
  <div class="footer-left">
    <div class="countdown-wrapper"><i class="fas fa-sun"></i> 暑假倒數：<span id="days">00</span> 天</div>
  </div>
  <div class="footer-center" style="font-size: 0.7rem; color: rgba(255,255,255,0.6); line-height: 1.2;">© 2026 SPEDMIX 米克師</div>
  <div class="footer-right">
    <button id="other-btn" class="footer-btn">其它 <i class="fas fa-caret-up"></i></button>
  </div>
`;

// 3. 定義共用的「其它」視窗模板
const OTHER_MODAL_TEMPLATE = `
  <div class="modal-content">
    <span class="close-modal">&times;</span>
    <h2 style="text-align: center; color: #C84C0C; margin-bottom: 20px;">其它資源</h2>
    <div class="modal-grid">
      <div class="modal-group">
        <h3><i class="fas fa-cogs"></i> 小工具</h3>
        <a href="bigtest.html" class="btn"><i class="fas fa-pen-alt"></i> 會考專區</a>
        <a href="https://emotionrecording.pages.dev/" target="_blank" class="btn"><i class="fas fa-face-smile"></i> 情緒紀錄</a>
        <a href="https://play.blooket.com/play" target="_blank" class="btn">Blooket</a>
        <a href="https://www.gimkit.com/join?class=60a1e3ba9eaadc0022adafb6" target="_blank" class="btn">Gimkit</a>
        <a href="https://sites.google.com/view/spedmixtool/time" target="_blank" class="btn">計時器</a>
      </div>
      <div class="modal-group">
        <h3><i class="fas fa-running"></i> 基本練功</h3>
        <a href="https://sites.google.com/view/specialchu/home?authuser=0" target="_blank" class="btn">舊網</a>
        <a href="other/test2.html" target="_blank" class="btn">加減法</a>
        <a href="other/test.html" target="_blank" class="btn">99乘法</a>
        <a href="math/game1.html" target="_blank" class="btn">正負數加減</a>
        <a href="https://doggame-math.pages.dev/" target="_blank" class="btn">狗子冒險去</a>
      </div>
      <div class="modal-group">
        <h3><i class="fas fa-star"></i> 特需課程</h3>
        <a href="socialskill.html" class="btn">社會技巧</a>
        <a href="learningstrategy.html" class="btn">學習策略</a>
      </div>
    </div>
  </div>
`;

// 全域變數：目前學期 (預設為 2 代表下學期)
let currentSem = 2;

// 主程式初始化
document.addEventListener('DOMContentLoaded', () => {
    // A. 注入導覽列
    const navbarElement = document.querySelector('.navbar');
    if (navbarElement) {
        navbarElement.innerHTML = NAVBAR_TEMPLATE;
    }

    // B. 注入頁尾
    const footerElement = document.querySelector('.sticky-footer');
    if (footerElement) {
        footerElement.innerHTML = FOOTER_TEMPLATE;
    }

    // C. 注入並初始化「其它」視窗
    initOtherModal();

    // D. 初始化各項互動功能
    initMobileMenu();
    initNavbarHighlight();
    initCountdown();
    initTabs();
    initSemesterLogic();
});

// --- 功能函式定義 ---

/**
 * 1. 學期切換邏輯 (萬用版)
 * 適用於所有具備 semester1-area 與 semester2-area 的頁面
 */
function initSemesterLogic() {
    const toggleBtn = document.getElementById('floating-toggle');
    if (!toggleBtn) return; // 如果該頁面沒有切換按鈕就跳過

    const pageKey = window.location.pathname;
    const savedSem = sessionStorage.getItem('activeSem_' + pageKey);
    if (savedSem) {
        currentSem = parseInt(savedSem, 10);
    }

    // 頁面載入時的初始狀態
    updateSemesterUI();

    // 綁定點擊事件
    toggleBtn.addEventListener('click', () => {
        currentSem = currentSem === 1 ? 2 : 1;
        sessionStorage.setItem('activeSem_' + pageKey, currentSem);

        // 圖示旋轉動畫
        const icon = document.getElementById('toggle-icon');
        if (icon) {
            icon.classList.add('rotate-icon');
            setTimeout(() => icon.classList.remove('rotate-icon'), 300);
        }

        updateSemesterUI();
    });
}

// 更新學期顯示狀態與文字
function updateSemesterUI() {
    const s1Area = document.getElementById('semester1-area');
    const s2Area = document.getElementById('semester2-area');
    const toggleText = document.getElementById('toggle-text');

    if (currentSem === 1) {
        if (s1Area) s1Area.style.display = 'block';
        if (s2Area) s2Area.style.display = 'none';
        if (toggleText) toggleText.innerText = "切換至 下學期";

        // 自動點擊上學期的預設按鈕
        const defBtn = document.getElementById('default-s1-btn');
        if (defBtn) defBtn.click();
    } else {
        if (s1Area) s1Area.style.display = 'none';
        if (s2Area) s2Area.style.display = 'block';
        if (toggleText) toggleText.innerText = "切換至 上學期";

        // 自動點擊下學期的預設按鈕
        const defBtn = document.getElementById('default-s2-btn');
        if (defBtn) defBtn.click();
    }
}

/**
 * 2. 手機版漢堡選單與下拉選單邏輯
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        });

        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(drop => {
            const dropBtn = drop.querySelector('.dropbtn');
            if (dropBtn) {
                dropBtn.addEventListener('click', (e) => {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        e.stopPropagation();
                        dropdowns.forEach(other => {
                            if (other !== drop) other.classList.remove('open');
                        });
                        drop.classList.toggle('open');
                    }
                });
            }
        });

        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') &&
                !navLinks.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                navLinks.classList.remove('active');
                dropdowns.forEach(d => d.classList.remove('open'));
            }
        });
    }
}

/**
 * 3. 導覽列自動高亮
 */
function initNavbarHighlight() {
    const currentPath = location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
            link.classList.add('active');
        }
    });
}

/**
 * 4. 頁籤切換邏輯 (原本的 showSection 邏輯)
 */
function initTabs() {
    const buttons = document.querySelectorAll('.section-button');
    if (buttons.length === 0) return;

    // 檢查有無 hash (#section-id)
    const hash = window.location.hash.replace('#', '');
    let targetBtn = null;

    if (hash) {
        targetBtn = Array.from(buttons).find(btn => {
            const attr = btn.getAttribute('onclick');
            return attr && attr.includes(hash);
        });
    }

    const pageKey = window.location.pathname;
    const savedTabId = sessionStorage.getItem('activeTab_' + pageKey);

    if (!targetBtn && savedTabId) {
        targetBtn = Array.from(buttons).find(btn => {
            const attr = btn.getAttribute('onclick');
            return attr && attr.includes(savedTabId);
        });
    }

    // 如果沒有 hash 且該頁面還沒有被激活的按鈕，就找預設按鈕
    if (!targetBtn && !document.querySelector('.section-button.active')) {
        // 先看有沒有目前學期的預設按鈕，沒有就選第一個
        const defId = currentSem === 1 ? 'default-s1-btn' : 'default-s2-btn';
        targetBtn = document.getElementById(defId) || buttons[0];
    }

    if (targetBtn) {
        const onClickAttr = targetBtn.getAttribute('onclick');
        const match = onClickAttr?.match(/showSection\('([^']+)'/);
        if (match) showSection(match[1], targetBtn);
    }
}

function showSection(id, clickedBtn) {
    // 取得當前區塊內的內容進行切換
    const parentArea = clickedBtn ? clickedBtn.closest('#semester1-area, #semester2-area') : document;
    const allContents = parentArea ? parentArea.querySelectorAll('.section-content') : document.querySelectorAll('.section-content');
    const allButtons = parentArea ? parentArea.querySelectorAll('.section-button') : document.querySelectorAll('.section-button');

    allContents.forEach(sec => sec.classList.remove('active-section'));
    allButtons.forEach(btn => btn.classList.remove('active'));

    const target = document.getElementById(id);
    if (target) target.classList.add('active-section');
    if (clickedBtn) clickedBtn.classList.add('active');

    const pageKey = window.location.pathname;
    sessionStorage.setItem('activeTab_' + pageKey, id);
}

/**
 * 5. 暑假倒數計時器
 */
function initCountdown() {
    const timerEl = document.getElementById('days');
    if (!timerEl) return;

    const countDate = new Date("2026-07-01T00:00:00").getTime();

    const updateTimer = () => {
        const now = new Date().getTime();
        const gap = countDate - now;
        const el = document.getElementById("days");

        if (!el) return;
        if (gap < 0) {
            el.innerText = "0";
            return;
        }

        const day = 1000 * 60 * 60 * 24;
        el.innerText = Math.floor(gap / day);
    };

    setInterval(updateTimer, 60000);
    updateTimer();
}

/**
 * 6. 初始化「其它」資源視窗
 */
function initOtherModal() {
    let modal = document.getElementById("other-modal");
    if (!modal) return;

    // 注入模板內容
    modal.innerHTML = OTHER_MODAL_TEMPLATE;

    const otherBtn = document.getElementById("other-btn");
    const closeSpan = modal.querySelector(".close-modal");

    if (otherBtn) {
        otherBtn.onclick = () => modal.style.display = "block";
    }
    if (closeSpan) {
        closeSpan.onclick = () => modal.style.display = "none";
    }
    window.addEventListener('click', (e) => {
        if (e.target == modal) modal.style.display = "none";
    });
}


