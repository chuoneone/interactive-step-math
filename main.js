/**
 * main.js
 * 整合：導覽列注入、手機版選單、導覽高亮、倒數計時、頁籤切換、上下學期切換
 */

// 1. 定義共用的導覽列 HTML 模板
const NAVBAR_TEMPLATE = `
  <div class="logo">SPED</div>
  <nav>
    <ul class="nav-links">
      <li><a href="index.html">HOME</a></li>
      <li class="dropdown">
        <a href="javascript:void(0)" class="dropbtn">國文 <i class="fas fa-caret-down"></i></a>
        <div class="dropdown-content">
          <a href="7ch.html">七年級</a>
          <a href="8ch.html">八年級</a>
          <a href="9ch.html">九年級</a>
        </div>
      </li>
      <li class="dropdown">
        <a href="javascript:void(0)" class="dropbtn">數學 <i class="fas fa-caret-down"></i></a>
        <div class="dropdown-content">
          <a href="7.html">七年級</a>
          <a href="8.html">八年級</a>
          <a href="9.html">九年級</a>
        </div>
      </li>
      <li class="dropdown">
        <a href="javascript:void(0)" class="dropbtn">英文 <i class="fas fa-caret-down"></i></a>
        <div class="dropdown-content">
          <a href="7eng.html">七年級</a>
          <a href="8eng.html">八年級</a>
          <a href="9eng.html">九年級</a>
        </div>
      </li>
      <li class="dropdown">
        <a href="javascript:void(0)" class="dropbtn" style="color: #FFD700;">特需課程 <i class="fas fa-star"></i></a>
        <div class="dropdown-content">
          <a href="socialskill.html"><i class="fas fa-user-group"></i> 社會技巧</a>
          <a href="learningstrategy.html"><i class="fas fa-lightbulb"></i> 學習策略</a>
          <a href="bigtest.html"><i class="fas fa-pen-alt"></i> 會考專區</a>
        </div>
      </li>
    </ul>
  </nav>
  <div class="menu-toggle">
    <i class="fas fa-bars"></i>
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

    // B. 初始化各項互動功能
    initMobileMenu();
    initNavbarHighlight();
    initCountdown();
    initTabs();
    initSemesterLogic(); // 新增：初始化學期切換邏輯
});

// --- 功能函式定義 ---

/**
 * 1. 學期切換邏輯 (萬用版)
 * 適用於所有具備 semester1-area 與 semester2-area 的頁面
 */
function initSemesterLogic() {
    const toggleBtn = document.getElementById('floating-toggle');
    if (!toggleBtn) return; // 如果該頁面沒有切換按鈕就跳過

    // 頁面載入時的初始狀態 (預設下學期)
    updateSemesterUI();

    // 綁定點擊事件
    toggleBtn.addEventListener('click', () => {
        currentSem = currentSem === 1 ? 2 : 1;
        
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

// 供頁籤使用的全域切換函式
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

