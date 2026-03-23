---
name: english-vocab
description: >
  將英文單字清單轉換成「單字預覽、選擇測驗、發音與 PDF 下載」互動網頁工具。當使用者貼上一組英文單字（不論有無附上中文），只要有意圖製作單字測驗或單字練習網頁，就必須觸發此 skill。
---

# 英文單字測驗網頁生成 Skill

## 目標

將使用者提供的英文單字清單，套用到指定的「預覽 + 測驗 + 發音 + PDF匯出」HTML 模版中，建立單一可執行的網頁檔案。

## 執行流程

### Step 1：處理單字清單
- 確保使用者提供的單字都有對應的繁體中文翻譯。若使用者只提供英文，請自動依據國中/小程度補上適當的中文翻譯。
- 將單字整理成 JavaScript 的物件陣列格式，例如：`{ chinese: '人；傢伙', english: 'guy' }`。

### Step 2：判定與替換標題
- 若使用者有指定版本、年級或單元（例如：佳音翰林 國中英語 第一冊 Unit 3），請一併更新：
  1. `<title>` 標籤
  2. 畫面中的 `<h1>` (大標題，如：佳音翰林 國中英語 iEnglish)
  3. 畫面中的 `<h2>` (副標題，如：一年級 Unit 3 單字測驗卷 (純文字版))
- 若無明確指定，請使用合適的預設標題（如「英文單字互動測驗」）。

### Step 3：產出完整 HTML 網頁 與 更新年級首頁
- 必須完整使用下方提供的「標準模版」，**嚴禁隨意更改核心架構與函式**（特別是 jsPDF 與 html2canvas 的載入、依賴的 Tailwind CSS 以及語音 speechSynthesis 的邏輯）。
- 將整理好的 `vocabulary` 陣列替換掉模版中的預設單字。
- **檔案命名與路徑**：請務必遵循既有邏輯：放到 `english/` 資料夾下，並以 `G{年級}S{1上或2下學期}-Unit{單元}-vocab.html` 命名（例如：`english/G7S2-Unit3-vocab.html` 代表 7 年級下學期第三單元）。
- **更新年級首頁導覽按鈕**：
  建立完成後，**必須自動去對應的年級首頁（例如：`7eng.html`）**，尋找該單元的區域（如：`<div id="s2-unit3">`）內的 `<div class="social-group"> <h3>單字區</h3>`，並在 `.btn-group` 中新增 `<a href="english/G7SX-UnitX-vocab.html" class="btn" target="_blank">單字測驗卷</a>`，讓首頁隨時保持最新！

### Step 4：整合計時與本機排行榜功能 (強制作為)
產出 HTML 的同時，請務必修改提供的標準模版，額外替它加入以下機制：
1. **玩家名稱與計時開始**：畫面預設應有一個「輸入玩家名稱並開始」的彈出視窗 (Modal)，點擊開始後啟動 7 分鐘的倒數計時挑戰模式。
2. **計時與分數加成**：畫面上方提示剩餘時間，測驗結算的分數公式必須為 `(答對/完成題數 * 1000) + 剩餘秒數`。
3. **LocalStorage 本機排行榜**：將成績儲存於本機端 `localStorage`（必須給予獨特的 key 值例如 `vocab_leaderboard_XXX`），並製作能顯示「前十名本地紀錄排行榜」的排行榜按鈕與彈出視窗。

---

## 互動網頁設計模版 (Template)

請以此架構為基底，抽換 `vocabulary` 與 `標題` 後直接產出：

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>佳音翰林 國中英語 iEnglish 1年級 Unit3 單字測驗 (純文字版)</title>
    <link rel="icon" href="../images/dog.png" type="image/png">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <style>
        body { font-family: 'Noto Sans TC', sans-serif; background-color: #F0FFFF; }
        .main-container { background-color: white; border-radius: 1.5rem; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); transition: transform 0.3s ease-in-out; }
        .option-btn { background-color: #afeeee; color: #1e3a8a; transition: all 0.3s ease; border: 3px solid transparent; }
        .option-btn:hover { background-color: #98e0e0; }
        .option-btn.selected { border-color: #3b82f6; background-color: #98e0e0; }
        .option-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .correct { background-color: #22c55e !important; color: white !important; border-color: #16a34a !important; }
        .incorrect-reveal { background-color: #ef4444 !important; color: white !important; border-color: #dc2626 !important; }
        .speaker-btn { background-color: #f0f9ff; color: #2563eb; border-radius: 50%; width: 3rem; height: 3rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.2s ease; }
        .speaker-btn:hover { background-color: #e0f2fe; transform: scale(1.1); }
        .progress-bar-container { width: 100%; background-color: #e0e0e0; border-radius: 9999px; overflow: hidden; }
        .progress-bar { height: 1rem; background-color: #2dd4bf; width: 0%; transition: width 0.5s ease-in-out; border-radius: 9999px; }
        .word-preview-item { background-color: #f0f8ff; border-radius: 0.75rem; padding: 0.75rem; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .word-preview-item:hover { transform: translateY(-3px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
    </style>
</head>
<body class="flex flex-col items-center justify-center min-h-screen p-4">

    <div class="w-full max-w-2xl mx-auto">
        <div class="text-center mb-6">
            <h1 class="text-3xl font-bold text-teal-800">佳音翰林 國中英語 iEnglish</h1>
            <h2 class="text-2xl font-semibold text-teal-600">一年級 Unit 3 單字測驗卷 (純文字版)</h2>
        </div>

        <div id="preview-container" class="main-container p-6 md:p-8">
             <h2 class="text-3xl font-bold text-center text-teal-700 mb-6">本單元單字預覽</h2>
             <div id="word-list" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8"></div>
             <div class="text-center flex flex-col sm:flex-row gap-4 justify-center">
                <button id="start-quiz-btn" class="bg-teal-500 text-white font-bold py-4 px-10 text-xl rounded-full shadow-xl hover:bg-teal-600 transition-transform transform hover:scale-110">開始測驗</button>
                <button id="download-btn" class="bg-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-purple-700 transition-transform transform hover:scale-105">下載測驗卷 (PDF)</button>
             </div>
        </div>

        <div id="quiz-container" class="hidden main-container p-6 md:p-8">
            <div class="mb-6">
                 <div class="flex justify-between items-center mb-2">
                    <div id="question-counter" class="text-lg font-semibold text-gray-600"></div>
                    <div id="score-counter" class="text-lg font-bold text-teal-600">分數: 0</div>
                </div>
                <div class="progress-bar-container">
                    <div id="progress-bar" class="progress-bar"></div>
                </div>
            </div>

            <div class="w-full flex flex-col justify-center items-center">
                <div class="flex items-center justify-center gap-4 mb-8">
                    <h3 id="question-text" class="text-4xl md:text-5xl font-bold text-center text-gray-800"></h3>
                    <button id="speak-question-btn" class="speaker-btn flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                    </button>
                </div>
                
                <div id="options-container" class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md"></div>
                
                <div id="control-buttons" class="mt-8 text-center">
                    <button id="check-answer-btn" class="bg-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-105 w-full md:w-auto">檢核答案</button>
                    <button id="next-question-btn" class="hidden bg-teal-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-teal-600 transition-transform transform hover:scale-105 w-full md:w-auto">下一題</button>
                </div>
            </div>
        </div>

        <div id="result-container" class="hidden text-center main-container p-8">
            <h2 class="text-4xl font-bold text-teal-700 mb-4">測驗完成！</h2>
            <p class="text-2xl text-gray-600 mb-2">你的最終分數是</p>
            <p id="final-score" class="text-6xl font-extrabold text-teal-500 mb-8"></p>
            <div id="result-buttons" class="flex flex-col sm:flex-row justify-center items-center gap-4"></div>
        </div>
    </div>
    
    <footer class="fixed bottom-0 left-0 w-full text-center text-gray-400 text-sm bg-white bg-opacity-80 py-2 border-t border-gray-200 backdrop-blur-sm">
        © 2025 特教米克師｜採用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh_TW" target="_blank" class="text-sky-600 hover:underline">CC BY-NC-SA 4.0 創用CC授權</a>｜非商業用途歡迎轉載或改編，請保留署名並附上原始連結。
    </footer>

    <div id="loading-overlay" class="hidden fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div class="bg-white p-8 rounded-lg shadow-xl text-center">
            <p id="export-status" class="text-lg font-semibold text-gray-800">正在產生 PDF...</p>
        </div>
    </div>
    <div id="export-render-container" style="position: absolute; left: -9999px; top: -9999px;"></div>

    <script>
        // 替換此處的 vocabulary
        const vocabulary = [
            { chinese: '人；傢伙', english: 'guy' }, 
            { chinese: '用；和', english: 'with' }
        ];
        
        const previewContainer = document.getElementById('preview-container');
        const wordList = document.getElementById('word-list');
        const startQuizBtn = document.getElementById('start-quiz-btn');
        const downloadBtn = document.getElementById('download-btn');
        const quizContainer = document.getElementById('quiz-container');
        const resultContainer = document.getElementById('result-container');
        const questionCounter = document.getElementById('question-counter');
        const scoreCounter = document.getElementById('score-counter');
        const questionText = document.getElementById('question-text');
        const optionsContainer = document.getElementById('options-container');
        const checkAnswerBtn = document.getElementById('check-answer-btn');
        const nextQuestionBtn = document.getElementById('next-question-btn');
        const speakQuestionBtn = document.getElementById('speak-question-btn');
        const finalScore = document.getElementById('final-score');
        const progressBar = document.getElementById('progress-bar');
        const resultButtonsContainer = document.getElementById('result-buttons');
        const loadingOverlay = document.getElementById('loading-overlay');
        const exportStatus = document.getElementById('export-status');

        let shuffledQuestions = [];
        let currentQuestionIndex = 0;
        let score = 0;
        let attempts = 0;
        let selectedButton = null;
        let synth = window.speechSynthesis;
        let incorrectlyAnswered = [];
        let quizWords = [];

        function speak(text, lang) {
            if (synth.speaking) { synth.cancel(); }
            let utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 0.9;
            synth.speak(utterance);
        }

        function shuffleArray(array) {
            return array.sort(() => Math.random() - 0.5);
        }

        function showPreview() {
            previewContainer.classList.remove('hidden');
            quizContainer.classList.add('hidden');
            resultContainer.classList.add('hidden');
            wordList.innerHTML = '';
            quizWords = [...vocabulary];

            quizWords.forEach(word => {
                const item = document.createElement('div');
                item.className = 'word-preview-item';
                item.innerHTML = `<p class="font-bold text-lg text-teal-800">${word.english}</p><p class="text-gray-600">${word.chinese}</p>`;
                item.addEventListener('click', () => {
                    const utteranceEn = new SpeechSynthesisUtterance(word.english);
                    utteranceEn.lang = 'en-US';
                    utteranceEn.rate = 0.9;
                    const utteranceZh = new SpeechSynthesisUtterance(word.chinese);
                    utteranceZh.lang = 'zh-TW';
                    utteranceZh.rate = 0.9;
                    utteranceEn.onend = () => { setTimeout(() => synth.speak(utteranceZh), 200); };
                    synth.cancel();
                    synth.speak(utteranceEn);
                });
                wordList.appendChild(item);
            });
        }

        function startQuiz(mode = 'all') {
            previewContainer.classList.add('hidden');
            quizContainer.classList.remove('hidden');
            resultContainer.classList.add('hidden');
            if (mode === 'incorrect' && incorrectlyAnswered.length > 0) {
                shuffledQuestions = shuffleArray([...incorrectlyAnswered]);
            } else {
                shuffledQuestions = shuffleArray([...quizWords]);
            }
            score = 0;
            incorrectlyAnswered = [];
            currentQuestionIndex = 0;
            scoreCounter.textContent = `分數: ${score}`;
            loadQuestion();
        }

        function loadQuestion() {
            attempts = 0;
            selectedButton = null;
            optionsContainer.innerHTML = '';
            checkAnswerBtn.classList.remove('hidden');
            nextQuestionBtn.classList.add('hidden');

            if (currentQuestionIndex >= shuffledQuestions.length) {
                showResults();
                return;
            }

            const progressPercentage = ((currentQuestionIndex) / shuffledQuestions.length) * 100;
            progressBar.style.width = `${progressPercentage}%`;
            const currentQuestion = shuffledQuestions[currentQuestionIndex];
            questionCounter.textContent = `問題 ${currentQuestionIndex + 1} / ${shuffledQuestions.length}`;
            questionText.textContent = currentQuestion.chinese;
            speak(currentQuestion.chinese, 'zh-TW');

            let options = [{...currentQuestion}];
            let tempVocab = [...vocabulary].filter(v => v.english !== currentQuestion.english);
            while (options.length < 4 && tempVocab.length > 0) {
                const randomIndex = Math.floor(Math.random() * tempVocab.length);
                options.push(tempVocab[randomIndex]);
                tempVocab.splice(randomIndex, 1);
            }
            
            shuffleArray(options).forEach(optionData => {
                const button = document.createElement('button');
                button.classList.add('option-btn', 'p-4', 'text-lg', 'font-semibold', 'rounded-xl', 'w-full', 'text-center');
                button.textContent = optionData.english;
                button.addEventListener('mouseenter', () => speak(optionData.english, 'en-US'));
                button.addEventListener('click', () => {
                    if (button.disabled) return;
                    document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
                    button.classList.add('selected');
                    selectedButton = button;
                });
                optionsContainer.appendChild(button);
            });
        }

        function checkAnswer() {
            if (!selectedButton) return;
            
            attempts++;
            const allButtons = Array.from(optionsContainer.children);
            const currentQuestion = shuffledQuestions[currentQuestionIndex];
            const correctAnswer = currentQuestion.english;
            const selectedAnswer = selectedButton.textContent;
            
            const correctFeedbacks = ['Good', 'Nice', 'Awesome', 'Excellent', 'Great job', 'Well done'];
            const incorrectFeedbacks = ['No worries', 'Almost there', 'Keep trying', 'Not quite'];

            if (selectedAnswer === correctAnswer) {
                if (attempts === 1) {
                    score++;
                    scoreCounter.textContent = `分數: ${score}`;
                }
                selectedButton.classList.add('correct');
                speak(correctFeedbacks[Math.floor(Math.random() * correctFeedbacks.length)], 'en-US');
                allButtons.forEach(btn => btn.disabled = true);
                checkAnswerBtn.classList.add('hidden');
                nextQuestionBtn.classList.remove('hidden');
            } else {
                if (attempts === 1) {
                    selectedButton.style.visibility = 'hidden';
                    if (!incorrectlyAnswered.some(q => q.english === currentQuestion.english)) {
                       incorrectlyAnswered.push(currentQuestion);
                    }
                    speak(incorrectFeedbacks[Math.floor(Math.random() * incorrectFeedbacks.length)], 'en-US');
                    selectedButton = null;
                } else {
                    selectedButton.classList.add('incorrect-reveal');
                    allButtons.forEach(btn => {
                        btn.disabled = true;
                        if (btn.textContent === correctAnswer) {
                            btn.classList.add('correct');
                            speak(correctAnswer, 'en-US');
                        }
                    });
                    checkAnswerBtn.classList.add('hidden');
                    nextQuestionBtn.classList.remove('hidden');
                }
            }
        }

        function showResults() {
            const totalQuestions = shuffledQuestions.length;
            const finalScoreValue = score;
            quizContainer.classList.add('hidden');
            resultContainer.classList.remove('hidden');
            finalScore.textContent = `${finalScoreValue} / ${totalQuestions}`;
            resultButtonsContainer.innerHTML = '';

            if (incorrectlyAnswered.length > 0) {
                const redoIncorrectBtn = document.createElement('button');
                redoIncorrectBtn.id = 'redo-incorrect-btn';
                redoIncorrectBtn.className = 'bg-orange-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-orange-600 transition-transform transform hover:scale-105 w-full sm:w-auto';
                redoIncorrectBtn.textContent = `重做錯題 (${incorrectlyAnswered.length} 題)`;
                redoIncorrectBtn.addEventListener('click', () => startQuiz('incorrect'));
                resultButtonsContainer.appendChild(redoIncorrectBtn);
            }

            const restartAllBtn = document.createElement('button');
            restartAllBtn.id = 'restart-btn';
            restartAllBtn.className = 'bg-teal-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-teal-600 transition-transform transform hover:scale-105 w-full sm:w-auto';
            restartAllBtn.textContent = '全部重測';
            restartAllBtn.addEventListener('click', () => startQuiz('all'));
            resultButtonsContainer.appendChild(restartAllBtn);
            
            speak(`Quiz finished! Your final score is ${finalScoreValue} out of ${totalQuestions}.`, 'en-US');
        }

        function nextQuestion() {
            currentQuestionIndex++;
            loadQuestion();
        }

        function createQuestionElementForPdf(question, options, questionNumber) {
            const container = document.createElement('div');
            container.style.fontFamily = "'Noto Sans TC', sans-serif";
            container.style.border = "1px solid #333";
            container.style.padding = '8px';
            container.style.width = '350px';
            container.style.backgroundColor = 'white';
            container.style.color = 'black';
            
            const chineseText = document.createElement('p');
            chineseText.textContent = `(${questionNumber}) ${question.chinese}`;
            chineseText.style.fontSize = '18px';
            chineseText.style.fontWeight = 'bold';
            chineseText.style.margin = '0 0 8px 0';
            container.appendChild(chineseText);

            options.forEach((opt, index) => {
                const optionLabel = `(${String.fromCharCode(65 + index)})`;
                const optionText = document.createElement('p');
                optionText.textContent = `${optionLabel} ${opt.english}`;
                optionText.style.fontSize = '16px';
                optionText.style.margin = '4px 0';
                container.appendChild(optionText);
            });

            return container;
        }

        async function exportPdf() {
            const renderContainer = document.getElementById('export-render-container');
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');

            const MARGIN = 10;
            const PAGE_WIDTH = doc.internal.pageSize.getWidth();
            const USABLE_WIDTH = PAGE_WIDTH - (MARGIN * 2);
            
            const ITEM_WIDTH_MM = (USABLE_WIDTH - 5) / 2;
            let ITEM_HEIGHT_MM = 0;
            const GAP_V = 5;

            let yPos = MARGIN + 15;

            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text(document.title, PAGE_WIDTH / 2, MARGIN + 5, { align: 'center' });

            const allQuestions = [];
            quizWords.forEach(word => {
                let options = [{...word}];
                let tempVocab = [...vocabulary].filter(v => v.english !== word.english);
                while (options.length < 4 && tempVocab.length > 0) {
                    const randomIndex = Math.floor(Math.random() * tempVocab.length);
                    options.push(tempVocab[randomIndex]);
                    tempVocab.splice(randomIndex, 1);
                }
                allQuestions.push({
                    chinese: word.chinese,
                    options: shuffleArray(options)
                });
            });

            for (let i = 0; i < allQuestions.length; i++) {
                exportStatus.textContent = `正在處理第 ${i + 1} / ${allQuestions.length} 題...`;
                
                const question = allQuestions[i];
                const element = createQuestionElementForPdf(question, question.options, i + 1);
                renderContainer.appendChild(element);

                const canvas = await html2canvas(element, { scale: 2, useCORS: true });
                const imgData = canvas.toDataURL('image/png');
                
                if (ITEM_HEIGHT_MM === 0) {
                    const aspectRatio = canvas.height / canvas.width;
                    ITEM_HEIGHT_MM = ITEM_WIDTH_MM * aspectRatio;
                }

                const col = i % 2;
                const xPos = MARGIN + (col * (ITEM_WIDTH_MM + 5));
                const currentY = yPos + Math.floor(i / 2) * (ITEM_HEIGHT_MM + GAP_V);
                
                if (currentY + ITEM_HEIGHT_MM > doc.internal.pageSize.getHeight() - MARGIN) {
                    doc.addPage();
                    doc.setFontSize(20);
                    doc.setFont('helvetica', 'bold');
                    doc.text(document.title, PAGE_WIDTH / 2, MARGIN + 5, { align: 'center' });
                    yPos = MARGIN + 15 - (Math.floor(i / 2) * (ITEM_HEIGHT_MM + GAP_V));
                }
                
                const finalYPos = yPos + Math.floor(i / 2) * (ITEM_HEIGHT_MM + GAP_V);
                doc.addImage(imgData, 'PNG', xPos, finalYPos, ITEM_WIDTH_MM, ITEM_HEIGHT_MM);

                renderContainer.innerHTML = '';
            }

            doc.save('English_Quiz.pdf');
        }

        async function handleDownload() {
            loadingOverlay.classList.remove('hidden');
            
            setTimeout(async () => {
                 try {
                    await exportPdf();
                } catch (error) {
                    console.error("PDF generation failed:", error);
                    exportStatus.textContent = '產生失敗!';
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } finally {
                    loadingOverlay.classList.add('hidden');
                }
            }, 100);
        }

        startQuizBtn.addEventListener('click', () => startQuiz('all'));
        downloadBtn.addEventListener('click', handleDownload);
        checkAnswerBtn.addEventListener('click', checkAnswer);
        nextQuestionBtn.addEventListener('click', nextQuestion);
        
        speakQuestionBtn.addEventListener('click', () => {
            if (currentQuestionIndex < shuffledQuestions.length) {
                speak(shuffledQuestions[currentQuestionIndex].chinese, 'zh-TW');
            }
        });

        document.addEventListener('DOMContentLoaded', showPreview);
        document.querySelector('body').addEventListener('submit', (e) => e.preventDefault());
    </script>
</body>
</html>
```

---
