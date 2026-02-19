/**
 * main.js
 * 負責介面互動邏輯：頁籤切換、倒數計時、手機版選單
 */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initNavbarHighlight();
    initCountdown();
    initTabs();
});

// 1. 手機版漢堡選單邏輯
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        // 點擊漢堡切換開關
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止事件冒泡導致立刻被關閉
            navLinks.classList.toggle('active');
        });

        // --- 手機版下拉選單點擊邏輯 (優化版) ---
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(drop => {
            const dropBtn = drop.querySelector('.dropbtn');
            if (dropBtn) {
                dropBtn.addEventListener('click', (e) => {
                    // 只在手機版寬度時 (<= 768px) 觸發點擊展開
                    if (window.innerWidth <= 768) {
                        e.preventDefault(); // 防止頁面跳轉
                        e.stopPropagation(); // 防止觸發 document 的關閉監聽
                        
                        // 1. 先關閉其他已經打開的下拉選單 (手風琴效果)
                        dropdowns.forEach(other => {
                            if (other !== drop) {
                                other.classList.remove('open');
                            }
                        });

                        // 2. 切換目前這個選單的開關狀態
                        drop.classList.toggle('open');
                    }
                });
            }
        });

        // 點擊外部關閉選單 (包含漢堡選單本身與展開的下拉內容)
        document.addEventListener('click', (e) => {
            // 如果選單是開著的，且點擊的地方既不是選單內容，也不是漢堡按鈕
            if (navLinks.classList.contains('active') && 
                !navLinks.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                
                navLinks.classList.remove('active');
                
                // 關閉選單時，順便把所有展開的下拉項也收起來
                dropdowns.forEach(d => d.classList.remove('open'));
            }
        });
    }
}

// 2. 導覽列自動高亮 (Active State)
function initNavbarHighlight() {
    const currentPath = location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        // 簡單比對：如果當前檔名包含在 href 裡
        if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
            link.classList.add('active');
        }
    });
}

// 3. 頁籤切換邏輯 (Tabs)
function initTabs() {
    const buttons = document.querySelectorAll('.section-button');
    const contents = document.querySelectorAll('.section-content');

    if (buttons.length > 0 && contents.length > 0) {
        // 檢查網址是否有指定錨點
        const hash = window.location.hash.replace('#', '');
        let targetBtn = null;

        if (hash) {
            targetBtn = Array.from(buttons).find(btn => btn.getAttribute('onclick')?.includes(hash));
        }

        // 如果沒有指定錨點，或找不到對應按鈕，就選第一個 (且沒有其他預設 active 的話)
        if (!targetBtn && !document.querySelector('.section-button.active')) {
            targetBtn = buttons[0];
        }

        // 自動觸發第一個按鈕的顯示邏輯 (不觸發 click 事件以免影響 GA)
        if (targetBtn) {
            const onClickAttr = targetBtn.getAttribute('onclick');
            if(onClickAttr) {
                 const match = onClickAttr.match(/showSection\('([^']+)'/);
                 if(match && match[1]) {
                     showSection(match[1], targetBtn);
                 }
            }
        }
    }
}

// 切換顯示函式 (供 HTML onclick 呼叫)
function showSection(id, clickedBtn) {
    // 隱藏所有內容
    document.querySelectorAll('.section-content').forEach(sec => sec.classList.remove('active-section'));
    // 取消所有按鈕 active
    document.querySelectorAll('.section-button').forEach(btn => btn.classList.remove('active'));

    // 顯示目標
    const target = document.getElementById(id);
    if (target) target.classList.add('active-section');
    
    // 激活按鈕
    if (clickedBtn) clickedBtn.classList.add('active');
}

// 4. 倒數計時器
function initCountdown() {
    const timerEl = document.getElementById('days'); // 只要檢查有沒有 days 元素即可
    if (!timerEl) return;

    // 設定目標日期：2026年7月1日
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

        const second = 1000;
        const minute = second * 60;
        const hour = minute * 60;
        const day = hour * 24;

        const textDay = Math.floor(gap / day);
        el.innerText = textDay;
    };

    setInterval(updateTimer, 1000);
    updateTimer(); // 立即執行一次
}