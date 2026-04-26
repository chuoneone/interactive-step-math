/**
 * main.js
 * 整合：導覽列注入、手機版選單、導覽高亮、倒數計時、頁籤切換、上下學期切換
 */

// 1. 定義共用的導覽列 HTML 模板
const NAVBAR_TEMPLATE = `
  <a href="/" class="logo">SPEDMIX</a>
  <div class="search-container">
    <div class="search-input-wrapper">
      <input type="text" id="global-search" placeholder="搜尋課程或主題..." autocomplete="off">
      <i class="fas fa-search search-icon"></i>
    </div>
    <div id="search-results" class="search-results-dropdown"></div>
  </div>
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

    initSemesterLogic();
    initMobileMenu();
    initNavbarHighlight();
    initSearch();
    initBreadcrumb();
    handleSearchHighlight();
    initHistoryState();
    initCountdown();
    initTabs();
});

// 監聽瀏覽器上一頁/下一頁
function initHistoryState() {
    window.addEventListener('popstate', (event) => {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            // 如果有 Hash，嘗試開啟對應單元 (不隱藏選單的標記由 initTabs 邏輯決定)
            const buttons = document.querySelectorAll('.section-button');
            const targetBtn = Array.from(buttons).find(btn => {
                const attr = btn.getAttribute('onclick');
                return attr && attr.includes(hash);
            });
            if (targetBtn) {
                showSection(hash, targetBtn, true);
            }
        } else {
            // 如果沒有 Hash，回到選單模式
            showMenu();
        }
    });
}

// 增加麵包屑容器
function initBreadcrumb() {
    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
    if (isHomePage) return;

    let bc = document.getElementById('breadcrumb-nav');
    if (!bc) {
        bc = document.createElement('div');
        bc.className = 'breadcrumb-container';
        bc.id = 'breadcrumb-nav';
        // 插入到 body 最前面
        document.body.prepend(bc);
    }
    // 初始顯示
    updateBreadcrumb(null, null);
}

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
    } else {
        if (s1Area) s1Area.style.display = 'none';
        if (s2Area) s2Area.style.display = 'block';
        if (toggleText) toggleText.innerText = "切換至 上學期";
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

    // 註解掉儲存頁籤的邏輯，確保每次進入都是乾淨的選單
    // const pageKey = window.location.pathname;
    // const savedTabId = sessionStorage.getItem('activeTab_' + pageKey);

    // if (!targetBtn && savedTabId) {
    //     targetBtn = Array.from(buttons).find(btn => {
    //         const attr = btn.getAttribute('onclick');
    //         return attr && attr.includes(savedTabId);
    //     });
    // }

    // 如果沒有 hash 且該頁面還沒有被激活的按鈕，不自動選取 (除非有儲存的頁籤)
    // 但使用者希望進來只有按鈕，所以我們甚至可以忽略 savedTabId
    if (!targetBtn) {
        // 如果想完全純淨，可以連 savedTabId 都不理會
        // 這裡我們只在有 Hash 的情況下才自動開啟
    }

    if (targetBtn) {
        const onClickAttr = targetBtn.getAttribute('onclick');
        const match = onClickAttr?.match(/showSection\('([^']+)'/);
        if (match) {
            // 如果是透過 Hash 進來的，直接進入隱藏選單模式
            showSection(match[1], targetBtn, !!hash);
        }
    } else {
        // 確保所有內容初始都是隱藏的
        document.querySelectorAll('.section-content').forEach(sec => {
            sec.classList.remove('active-section');
        });
    }
}

function showSection(id, clickedBtn, hideMenu = true) {
    // 取得當前區塊內的內容進行切換
    const parentArea = clickedBtn ? clickedBtn.closest('#semester1-area, #semester2-area') : document;
    
    // 清除所有內容與按鈕狀態 (改為全域搜尋)
    document.querySelectorAll('.section-content').forEach(sec => sec.classList.remove('active-section'));
    document.querySelectorAll('.section-button').forEach(btn => btn.classList.remove('active'));

    const target = document.getElementById(id);
    if (target) {
        target.classList.add('active-section');
        
        if (hideMenu) {
            document.body.classList.add('menu-hidden');
            document.body.classList.add('with-breadcrumb');
            updateBreadcrumb(parentArea, clickedBtn);
            
            // 使用 pushState 紀錄歷史，讓上一頁可以回到選單
            const currentHash = window.location.hash;
            if (currentHash !== '#' + id) {
                history.pushState({ sectionId: id }, null, '#' + id);
            }
        }
    }
    
    if (clickedBtn) clickedBtn.classList.add('active');
}

function updateBreadcrumb(parentArea, clickedBtn) {
    const bcNav = document.getElementById('breadcrumb-nav');
    if (!bcNav) return;

    const subject = document.title.split('｜')[0] || "學習平台";
    const chapter = clickedBtn ? clickedBtn.innerText.trim() : "";

    let html = `
        <span class="breadcrumb-item" onclick="window.location.href='/'">HOME</span>
        <span class="breadcrumb-separator"><i class="fas fa-chevron-right"></i></span>
    `;

    if (chapter) {
        html += `
            <span class="breadcrumb-item" onclick="showMenu()">${subject}</span>
            <span class="breadcrumb-separator"><i class="fas fa-chevron-right"></i></span>
            <span class="breadcrumb-active">${chapter}</span>
        `;
    } else {
        html += `<span class="breadcrumb-active">${subject}</span>`;
    }

    bcNav.innerHTML = html;
}

function showMenu() {
    document.body.classList.remove('menu-hidden');
    document.body.classList.remove('with-breadcrumb');
    
    // 隱藏所有內容區塊
    document.querySelectorAll('.section-content').forEach(sec => {
        sec.classList.remove('active-section');
    });
    // 清除按鈕高亮
    document.querySelectorAll('.section-button').forEach(btn => {
        btn.classList.remove('active');
    });
    // 更新麵包屑回到科目層級
    updateBreadcrumb(null, null);

    // 清除網址 Hash
    history.replaceState(null, null, ' ');
    // 捲動回頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
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


/**
 * 7. 全域搜尋功能
 */
function initSearch() {
    const searchInput = document.getElementById('global-search');
    const searchResults = document.getElementById('search-results');
    if (!searchInput || !searchResults) return;

    // 動力載入搜尋索引 (如果尚未載入)
    if (typeof window.SEARCH_INDEX === 'undefined') {
        const script = document.createElement('script');
        script.src = 'search-data.js';
        document.head.appendChild(script);
    }

    let selectedIndex = -1;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        selectedIndex = -1; // 重置選擇
        if (query.length < 1) {
            searchResults.style.display = 'none';
            return;
        }

        if (typeof window.SEARCH_INDEX === 'undefined') return;

        const matches = window.SEARCH_INDEX.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.keywords.toLowerCase().includes(query)
        ).slice(0, 8); // 最多顯示 8 筆

        if (matches.length > 0) {
            searchResults.innerHTML = matches.map((item, idx) => `
                <div class="search-item" data-index="${idx}" onclick="navigateAndOpen('${item.page}', '${item.section}')">
                    <div class="search-item-title">${item.title}</div>
                    <div class="search-item-path">${item.page}</div>
                </div>
            `).join('');
            searchResults.style.display = 'block';
        } else {
            searchResults.innerHTML = '<div class="search-no-results">找不到相關課程</div>';
            searchResults.style.display = 'block';
        }
    });

    // 鍵盤導覽
    searchInput.addEventListener('keydown', (e) => {
        const items = searchResults.querySelectorAll('.search-item');
        if (searchResults.style.display === 'none' || items.length === 0) {
            if (e.key === 'Enter' && searchInput.value.trim().length > 0) {
                // 如果沒開選單但按 Enter，嘗試跳轉到第一個結果
                const query = searchInput.value.trim().toLowerCase();
                const firstMatch = window.SEARCH_INDEX?.find(item => 
                    item.title.toLowerCase().includes(query) || 
                    item.keywords.toLowerCase().includes(query)
                );
                if (firstMatch) navigateAndOpen(firstMatch.page, firstMatch.section);
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % items.length;
            updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            updateSelection(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex > -1) {
                items[selectedIndex].click();
            } else {
                // 如果沒選中，預設點擊第一個
                items[0].click();
            }
        } else if (e.key === 'Escape') {
            searchResults.style.display = 'none';
        }
    });

    function updateSelection(items) {
        items.forEach((item, idx) => {
            if (idx === selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    }

    // 點擊外部關閉搜尋結果
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

// 跳轉並開啟指定區塊
function navigateAndOpen(page, sectionId) {
    const targetUrl = page + (sectionId ? '#' + sectionId : '');
    
    // 如果已經在該頁面，直接切換頁籤
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPath === page && sectionId) {
        const btn = Array.from(document.querySelectorAll('.section-button')).find(b => {
            const attr = b.getAttribute('onclick');
            return attr && attr.includes(sectionId);
        });
        if (btn) {
            // 自動切換學期 (如果目標在隱藏的區域)
            ensureSemesterVisible(btn);
            
            btn.click();
            document.getElementById('search-results').style.display = 'none';
            document.getElementById('global-search').value = '';
            
            // 捲動並高亮
            const target = document.getElementById(sectionId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                target.classList.add('search-highlight');
                setTimeout(() => target.classList.remove('search-highlight'), 3000);
            }
        }
    } else {
        window.location.href = targetUrl;
    }
}

// 確保元素所在的學期區域是顯示的
function ensureSemesterVisible(el) {
    const s1 = el.closest('#semester1-area');
    const s2 = el.closest('#semester2-area');
    
    if (s1 && currentSem !== 1) {
        const toggleBtn = document.getElementById('floating-toggle');
        if (toggleBtn) toggleBtn.click();
    } else if (s2 && currentSem !== 2) {
        const toggleBtn = document.getElementById('floating-toggle');
        if (toggleBtn) toggleBtn.click();
    }
}

/**
 * 8. 處理從外部連結進來的高亮
 */
function handleSearchHighlight() {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        // 延遲一下確保內容已渲染
        setTimeout(() => {
            const target = document.getElementById(hash);
            const btn = Array.from(document.querySelectorAll('.section-button')).find(b => {
                const attr = b.getAttribute('onclick');
                return attr && attr.includes(hash);
            });

            if (btn) {
                ensureSemesterVisible(btn);
                btn.click();
            }

            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                target.classList.add('search-highlight');
                setTimeout(() => target.classList.remove('search-highlight'), 3000);
            }
        }, 600);
    }
}
