---
name: english-jumble
description: >
  將英文句子轉換成「英文單字重組、文法組句練習」互動網頁工具。當使用者貼上一組英文句子或提示（例如重組句型的題目），並希望製作文法重組測驗時，必須觸發此 skill。
---

# 英文句子重組網頁生成 Skill

## 目標

將使用者提供的英文句子或是文法題型，套用到指定的「點擊單字重組句子 + 發音 + 提示」HTML 模版中，建立單一可執行的網頁檔案。

## 執行流程

### Step 1：處理句子資料與字典
- **拆解題目**：根據使用者提供的題目，建立 `exercises` 陣列。
  每一題必須包含：
  - `id`: 字串（例如 's1q1', 's2q1'）
  - `section`: 區塊編號（例如 1 或 2，幫助在畫面分類。若無特別分類統一設為 1）
  - `prompt`: 題目的提示或要求（例如 `1. We / be / listen to music / .` 或 `1. Are you watching TV?`）
  - `answer`: 完整正確解答字串（例如 `We are listening to music.`）
  - `chunks`: 將正確解答拆解成單字與標點符號的陣列（例如 `['We', 'are', 'listening', 'to', 'music', '.']`）❗注意標點符號必須獨立為一個 chunk。
- **建立字典**：自動收集所有題目中出現的英文單字（不含標點），並生成 `dictionary` 物件，提供對應的繁體中文翻譯（例如 `'listening': '聽'`）。此字典用於滑鼠懸停字卡時的中文翻譯浮出提示 (Tooltip)。

### Step 2：判定與替換標題
- 根據使用者提供的年級、單元、文法重點（例如：Unit 4 Grammar Focus 3 或是 現在進行式）：
  1. `<title>` 與 `<h1>` 標題
  2. `<p>` 裡面的副標題與頁數說明

### Step 3：產出完整 HTML 網頁 與 更新年級首頁
- 必須完整使用下方提供的「標準模版」，**嚴禁隨意更改核心架構與 CSS 動畫邏輯**。
- 將處理好的 `dictionary` 與 `exercises` 陣列替換掉模版中對應的部分。
- **檔案命名與路徑**：請務必遵循既有邏輯：放到 `english/` 資料夾下，並以 `G{年級}S{1上或2下學期}-Unit{單元}-grammar{可選後綴}.html` 命名（例如：`english/G7S1-Unit4-grammar.html` 代表 7 年級上學期第四單元文法）。
- **更新年級首頁導覽按鈕**：
  建立完成後，**必須自動去對應的年級首頁（例如：`7eng.html`）**，尋找該單元的區域（如：`<div id="s1-unit4">`）內的 `<div class="social-group"> <h3>文法區</h3>`，並在 `.btn-group` 中新增 `<a href="english/G7SX-UnitX-grammar.html" class="btn" target="_blank">文法重組練習</a>`。

### Step 4：整合計時與本機排行榜功能 (強制作為)
產出 HTML 的同時，請務必修改提供的標準模版，額外替它加入以下機制：
1. **玩家名稱與計時開始**：畫面預設應有一個「輸入玩家名稱並開始」的彈出視窗 (Modal)，點擊開始後啟動 7 分鐘的倒數計時挑戰模式。
2. **計時與分數加成**：畫面上方提示剩餘時間，測驗結算的分數公式必須為 `(答對/完成題數 * 1000) + 剩餘秒數`。
3. **LocalStorage 本機排行榜**：將成績儲存於本機端 `localStorage`（必須給予獨特的 key 值例如 `eng_jumble_leaderboard_XXX`），並製作能顯示「前十名本地紀錄排行榜」的排行榜按鈕與彈出視窗。

---

## 互動網頁設計模版 (Template)

請以此 HTML 為基底，抽換 `dictionary` 與 `exercises` 及 `標題文字` 後直接產出：

```html
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- 替換標題 -->
    <title>Unit 4 Grammar Focus</title>
    <link rel="icon" href="../images/dog.png" type="image/png">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800&family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-color: #4f46e5;
            --secondary-color: #3b82f6;
            --accent-color: #f59e0b;
            --success-color: #10b981;
            --error-color: #ef4444;
        }
        body {
            font-family: 'Nunito', 'Noto Sans TC', sans-serif;
            background-color: #f3f4f6;
            background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
            background-size: 20px 20px;
            color: #1f2937;
            -webkit-tap-highlight-color: transparent;
        }
        .exercise-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.5);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .word-item {
            display: inline-block;
            font-family: 'Nunito', sans-serif;
            padding: 0.5rem 1rem;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            color: #374151;
            font-weight: 700;
            cursor: pointer;
            user-select: none;
            transition: all 0.15s ease;
            box-shadow: 0 2px 0 #e5e7eb;
            font-size: 1.05rem;
            margin: 4px;
            touch-action: manipulation;
        }
        .word-item:active { transform: translateY(2px); box-shadow: none; background-color: #eff6ff; }
        .word-item:hover { border-color: var(--secondary-color); color: var(--secondary-color); }
        .drop-zone {
            min-height: 64px;
            background-color: #f9fafb;
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            transition: all 0.3s ease;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
            padding: 12px;
        }
        .drop-zone:empty::before { content: '點擊下方單字卡片來組句'; color: #94a3b8; font-size: 0.9rem; width: 100%; text-align: center; padding: 10px; }
        .drop-zone.correct { background-color: #ecfdf5; border-color: var(--success-color); border-style: solid; }
        .drop-zone.incorrect { background-color: #fef2f2; border-color: var(--error-color); border-style: solid; animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .btn-action { transition: all 0.2s; }
        .btn-action:active { transform: scale(0.95); }
        .speaker-btn {
            display: inline-flex; align-items: center; justify-content: center;
            width: 32px; height: 32px; border-radius: 50%;
            background-color: #e0e7ff; color: var(--primary-color);
            margin-left: 8px; cursor: pointer; vertical-align: middle;
        }
        .speaker-btn:hover { background-color: var(--primary-color); color: white; }
        #tooltip {
            position: fixed; pointer-events: none; z-index: 1000;
            background: #1f2937; color: white; padding: 6px 12px;
            border-radius: 6px; font-size: 0.875rem; display: none;
            transform: translate(-50%, -120%); white-space: nowrap; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        #tooltip::after {
            content: ''; position: absolute; top: 100%; left: 50%;
            margin-left: -5px; border-width: 5px; border-style: solid;
            border-color: #1f2937 transparent transparent transparent;
        }
        .checkmark-wrapper { width: 120px; height: 120px; margin: 0 auto; }
        .checkmark {
            width: 120px; height: 120px; border-radius: 50%; display: block;
            stroke-width: 4; stroke: #fff; stroke-miterlimit: 10;
            box-shadow: inset 0px 0px 0px #10b981;
            animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
        }
        .checkmark__check {
            transform-origin: 50% 50%; stroke-dasharray: 48; stroke-dashoffset: 48;
            animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }
        @keyframes stroke { 100% { stroke-dashoffset: 0; } }
        @keyframes scale { 0%, 100% { transform: none; } 50% { transform: scale3d(1.1, 1.1, 1); } }
        @keyframes fill { 100% { box-shadow: inset 0px 0px 0px 80px #10b981; } }
        .confetti { position: absolute; width: 10px; height: 10px; background-color: #f00; animation: confetti-fall 3s linear forwards; }
        @keyframes confetti-fall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
    </style>
</head>
<body class="min-h-screen p-4 pb-12">

    <div id="tooltip"></div>

    <div id="completion-overlay" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm hidden opacity-0 transition-opacity duration-500">
        <div class="bg-white p-8 md:p-12 rounded-3xl shadow-2xl text-center transform scale-90 transition-transform duration-500 max-w-md w-full mx-4 relative overflow-hidden" id="completion-modal">
            <div class="checkmark-wrapper mb-6">
                <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                    <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
            </div>
            <h2 class="text-3xl font-extrabold text-gray-800 mb-2 animate-bounce">太棒了！</h2>
            <p class="text-gray-600 text-lg mb-8">你已經完成了所有的練習題！</p>
            <button onclick="closeOverlay()" class="w-full bg-indigo-600 text-white text-lg px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg transform hover:scale-105 active:scale-95">關閉</button>
        </div>
    </div>

    <div class="max-w-3xl mx-auto">
        <header class="text-center mb-10">
            <div class="inline-block p-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-4">
                <div class="bg-white rounded-full px-6 py-2">
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 font-bold tracking-wide uppercase text-sm">Grammar Practice</span>
                </div>
            </div>
            <!-- 替換標題與副標題 -->
            <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Unit X Grammar Focus</h1>
            <p class="text-lg text-gray-600 font-medium">文法主題說明</p>
            
            <div class="mt-6 max-w-xs mx-auto">
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div id="progress-bar" class="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500 ease-out" style="width: 0%"></div>
                </div>
                <p class="text-xs text-gray-400 mt-2 text-center" id="progress-text">完成進度: 0/0</p>
            </div>
        </header>

        <!-- 區塊渲染區 -->
        <div id="exercise-sections">
            <!-- 區塊 1 例句區 (可依據需求保留或隱藏) -->
            <div id="section-1-wrapper" class="mb-12 hidden">
                <div class="flex items-center gap-3 mb-6">
                    <span class="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">1</span>
                    <h2 class="text-xl font-bold text-gray-800" id="section-1-title">依提示完成句子</h2>
                </div>
                <!-- 例句 (可省略) -->
                <!-- <div class="..." /> -->
                <div id="container-section-1" class="space-y-6"></div>
            </div>

            <div id="section-2-wrapper" class="mb-12 hidden">
                <div class="flex items-center gap-3 mb-6">
                    <span class="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">2</span>
                    <h2 class="text-xl font-bold text-gray-800" id="section-2-title">請回答相關問題</h2>
                </div>
                <div id="container-section-2" class="space-y-6"></div>
            </div>
        </div>
    </div>

    <script>
        // ======= 從這裡替換使用者提供的資料 =======
        const dictionary = {
            'Teddy': '泰迪', 'is': '是', 'crying': '哭泣',
            '.': '。', '?': '？', ',': '，'
            // ...以此類推自動補齊...
        };

        const exercises = [
            {
                id: 's1q1', section: 1,
                prompt: '1. Joe / be / cook / at six p.m.',
                answer: 'Joe is cooking at six p.m.',
                chunks: ['Joe', 'is', 'cooking', 'at', 'six', 'p.m.', '.']
            }
        ];
        // ==========================================

        let completedCount = 0;
        const totalCount = exercises.length;
        const synth = window.speechSynthesis;

        function speak(text, rate = 0.9) {
            if (!text) return;
            synth.cancel();
            const cleanText = text.replace(/[.?]/g, '').replace(/(\d+)\s?a\.m\./gi, '$1 A M').replace(/(\d+)\s?p\.m\./gi, '$1 P M');
            const utterThis = new SpeechSynthesisUtterance(cleanText);
            utterThis.lang = 'en-US';
            utterThis.rate = rate;
            synth.speak(utterThis);
        }

        function renderApp() {
            // 自動顯示有資料的區塊
            const hasS1 = exercises.some(ex => ex.section === 1);
            const hasS2 = exercises.some(ex => ex.section === 2);
            
            if (hasS1) document.getElementById('section-1-wrapper').classList.remove('hidden');
            if (hasS2) document.getElementById('section-2-wrapper').classList.remove('hidden');

            const s1El = document.getElementById('container-section-1');
            const s2El = document.getElementById('container-section-2');

            // Set total count init
            document.getElementById('progress-text').innerText = `完成進度: 0/${totalCount}`;

            exercises.forEach((ex) => {
                const card = document.createElement('div');
                card.className = 'exercise-card p-5 sm:p-6';
                card.id = `card-${ex.id}`;
                card.dataset.id = ex.id;

                let promptHtml = `<span class="text-lg font-bold text-gray-800">${ex.prompt}</span>`;
                
                // 允許每個 question 前面加上發音鈕
                const speechText = ex.prompt.split('(')[0].trim().replace(/\//g, ' ');
                promptHtml += `
                    <button class="speaker-btn speak-prompt" data-text="${speechText.replace(/"/g, '&quot;')}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 pointer-events-none">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                        </svg>
                    </button>`;

                const shuffledWords = [...ex.chunks].sort(() => Math.random() - 0.5);

                card.innerHTML = `
                    <div class="mb-4 flex items-center flex-wrap">${promptHtml}</div>
                    <div class="word-bank flex flex-wrap gap-2 mb-4" id="bank-${ex.id}">
                        ${shuffledWords.map(word => `<div class="word-item">${word}</div>`).join('')}
                    </div>
                    <div class="drop-zone" id="zone-${ex.id}"></div>
                    <div class="flex flex-wrap items-center gap-3 mt-2">
                        <button class="btn-action check-btn bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl shadow transition-colors text-sm sm:text-base flex-grow sm:flex-grow-0" data-id="${ex.id}">檢查答案</button>
                        <button class="btn-action reset-btn bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 font-bold py-2 px-4 rounded-xl transition-colors text-sm sm:text-base" data-id="${ex.id}">重置</button>
                        <button class="btn-action hint-btn bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold py-2 px-4 rounded-xl transition-colors flex items-center gap-2 text-sm sm:text-base ml-auto" data-text="${ex.answer.replace(/"/g, '&quot;')}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                            提示
                        </button>
                    </div>
                    <div class="feedback mt-3 h-6 text-sm font-bold"></div>
                `;

                if (ex.section === 1) s1El.appendChild(card);
                else s2El.appendChild(card);
            });
        }

        document.body.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('word-item')) {
                const card = target.closest('.exercise-card');
                if (!card) return;
                const exId = card.dataset.id;
                const bank = document.getElementById(`bank-${exId}`);
                const zone = document.getElementById(`zone-${exId}`);

                speak(target.innerText, 1.0);

                if (target.parentElement === bank) { zone.appendChild(target); } 
                else { bank.appendChild(target); }

                const feedbackEl = card.querySelector('.feedback');
                feedbackEl.textContent = '';
                feedbackEl.className = 'feedback mt-3 h-6 text-sm font-bold';
                zone.classList.remove('correct', 'incorrect');
                return;
            }
            if (target.classList.contains('check-btn')) { checkAnswer(target.dataset.id); return; }
            if (target.classList.contains('reset-btn')) { resetQuestion(target.dataset.id); return; }
            if (target.closest('.hint-btn')) { speak(target.closest('.hint-btn').dataset.text, 0.5); return; }
            if (target.closest('.speak-prompt')) { speak(target.closest('.speak-prompt').dataset.text, 0.9); return; }
        });

        function showOverlay() {
            const overlay = document.getElementById('completion-overlay');
            const modal = document.getElementById('completion-modal');
            overlay.classList.remove('hidden');
            setTimeout(() => {
                overlay.classList.remove('opacity-0');
                modal.classList.remove('scale-90');
                modal.classList.add('scale-100');
                for(let i=0; i<50; i++) { createConfetti(overlay); }
            }, 10);
        }

        window.closeOverlay = function() {
            const overlay = document.getElementById('completion-overlay');
            const modal = document.getElementById('completion-modal');
            overlay.classList.add('opacity-0');
            modal.classList.remove('scale-100');
            modal.classList.add('scale-90');
            setTimeout(() => {
                overlay.classList.add('hidden');
                document.querySelectorAll('.confetti').forEach(c => c.remove());
            }, 500);
        }

        function createConfetti(container) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confetti.style.opacity = Math.random();
            container.appendChild(confetti);
        }

        function checkAnswer(id) {
            const zone = document.getElementById(`zone-${id}`);
            const card = document.getElementById(`card-${id}`);
            const feedbackEl = card.querySelector('.feedback');
            const exData = exercises.find(e => e.id === id);
            const rawWords = Array.from(zone.children).map(el => el.innerText);
            
            let userSentence = rawWords.join(' ')
                .replace(/\s+([,.?])/g, '$1')
                .replace(/\s+(’t)/g, '$1')
                .replace(/\s+('t)/g, '$1')
                .replace(/\.\./g, '.')
                .trim();

            const normalizedUser = userSentence.replace(/\s+/g, ' ');
            const normalizedAnswer = exData.answer.replace(/\s+/g, ' ');

            if (normalizedUser === normalizedAnswer) {
                feedbackEl.textContent = '🎉 答對了！太棒了！';
                feedbackEl.className = 'feedback mt-3 h-6 text-sm font-bold text-green-600';
                zone.classList.remove('incorrect');
                zone.classList.add('correct');
                
                if (!zone.dataset.completed) {
                    zone.dataset.completed = 'true';
                    updateProgress(1);
                }
            } else {
                feedbackEl.textContent = '🤔 再試試看！';
                feedbackEl.className = 'feedback mt-3 h-6 text-sm font-bold text-red-500';
                zone.classList.remove('correct');
                zone.classList.add('incorrect');
                zone.style.animation = 'none';
                zone.offsetHeight; 
                zone.style.animation = null; 
            }
        }

        function resetQuestion(id) {
            const bank = document.getElementById(`bank-${id}`);
            const zone = document.getElementById(`zone-${id}`);
            const card = document.getElementById(`card-${id}`);
            const feedbackEl = card.querySelector('.feedback');
            
            Array.from(zone.children).forEach(child => bank.appendChild(child));
            const words = Array.from(bank.children);
            words.sort(() => Math.random() - 0.5);
            words.forEach(w => bank.appendChild(w));

            feedbackEl.textContent = '';
            zone.classList.remove('correct', 'incorrect');
            if (zone.dataset.completed) {
                delete zone.dataset.completed;
                updateProgress(-1);
            }
        }

        function updateProgress(change) {
            completedCount += change;
            completedCount = Math.max(0, Math.min(completedCount, totalCount));
            const percentage = Math.round((completedCount / totalCount) * 100);
            const bar = document.getElementById('progress-bar');
            const text = document.getElementById('progress-text');
            bar.style.width = `${percentage}%`;
            text.textContent = `完成進度: ${completedCount}/${totalCount}`;

            if (completedCount === totalCount) {
                bar.classList.remove('from-indigo-500', 'to-blue-500');
                bar.classList.add('from-green-400', 'to-emerald-500');
                showOverlay();
            } else {
                bar.classList.add('from-indigo-500', 'to-blue-500');
                bar.classList.remove('from-green-400', 'to-emerald-500');
            }
        }

        const tooltip = document.getElementById('tooltip');
        document.body.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('word-item')) {
                const text = e.target.innerText.replace(/[.,?]/g, '').trim();
                const translation = dictionary[text];
                if (translation) {
                    tooltip.textContent = translation;
                    tooltip.style.display = 'block';
                    const rect = e.target.getBoundingClientRect();
                    tooltip.style.left = `${rect.left + rect.width / 2}px`;
                    tooltip.style.top = `${rect.top}px`;
                }
            }
        });
        document.body.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('word-item')) {
                tooltip.style.display = 'none';
            }
        });

        renderApp();
    </script>
</body>
</html>
```
