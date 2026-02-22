// js/quiz_logic.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const playerCharSpan = document.getElementById('player-char');
    const quizPageTitle = document.getElementById('quiz-page-title');
    const meatJerkyDisplay = document.getElementById('meat-jerky-display');

    const quizContentArea = document.getElementById('quiz-content-area');
    const questionTextEl = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const quizForm = document.getElementById('quiz-form');
    const submitAnswerBtn = document.getElementById('submit-answer-btn');
    const feedbackEl = document.getElementById('quiz-feedback');

    const quizNavigationDiv = document.getElementById('quiz-navigation');
    const nextQuestionBtn = document.getElementById('next-question-btn');

    const quizCompleteMessageDiv = document.getElementById('quiz-complete-message');
    const quizCompleteTitle = document.getElementById('quiz-complete-title');
    const finalScoreMessage = document.getElementById('final-score-message');
    const basementUnlockMessage = document.getElementById('basement-unlock-message');

    // --- URL Parameters to determine the map ---
    const urlParams = new URLSearchParams(window.location.search);
    let mapId = urlParams.get('map') || 'library'; // default to library
    const characterId = urlParams.get('char');

    // Retrieve map specific data from quizData object (from js/quiz_data.js)
    const mapConfig = quizData[mapId];
    if (!mapConfig) {
        alert("找不到地圖資料！");
        return;
    }
    const questionsData = mapConfig.questions;

    // Set page body class for background styling
    document.body.className = mapConfig.className;

    // --- Game State ---
    let currentQuestionIndex = 0;
    let meatJerkyCount = parseInt(localStorage.getItem('meatJerkyCount')) || 0;
    const MAX_MEAT_JERKY_TO_UNLOCK = 3;
    let questionsAnsweredInThisSession = 0;

    // --- Initialization ---
    function initializeQuiz() {
        updateMeatJerkyDisplay();

        if (!questionsData || questionsData.length === 0) {
            questionTextEl.textContent = "此地點暫無挑戰題目。";
            if (submitAnswerBtn) submitAnswerBtn.classList.add('hidden');
            if (quizNavigationDiv) quizNavigationDiv.classList.remove('hidden');
            if (nextQuestionBtn) nextQuestionBtn.classList.add('hidden');
            return;
        }

        // Character Name Mapping
        const characterNames = { 'sheepdog': '牧羊犬', 'shiba': '柴犬', 'mix': '米克斯', 'bulldog': '鬥牛犬' };
        const selectedChar = JSON.parse(localStorage.getItem('selectedCharacter'));
        const charName = characterId ? characterNames[characterId] : (selectedChar ? selectedChar.name : "未知角色");

        if (playerCharSpan) {
            playerCharSpan.textContent = charName;
        }

        if (quizPageTitle) {
            quizPageTitle.textContent = mapConfig.title;
        }

        loadQuestion(currentQuestionIndex);
    }

    // --- UI Update Functions ---
    function updateMeatJerkyDisplay() {
        meatJerkyDisplay.textContent = meatJerkyCount;
    }

    function loadQuestion(index) {
        if (index >= questionsData.length) {
            endQuiz();
            return;
        }
        const qData = questionsData[index];
        questionTextEl.textContent = `問題 ${index + 1}：${qData.question}`;

        optionsContainer.innerHTML = '';
        for (const key in qData.options) {
            const optionLi = document.createElement('li');
            optionLi.className = 'quiz-option';
            const label = document.createElement('label');
            label.className = 'quiz-option-label';
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'q_answer';
            input.value = key;
            const customRadio = document.createElement('span');
            customRadio.className = 'custom-radio';
            const optionText = document.createElement('span');
            optionText.className = 'option-text';
            optionText.textContent = qData.options[key];

            label.appendChild(input);
            label.appendChild(customRadio);
            label.appendChild(optionText);
            optionLi.appendChild(label);
            optionsContainer.appendChild(optionLi);

            input.addEventListener('change', () => {
                document.querySelectorAll('input[name="q_answer"]').forEach(radio => {
                    radio.closest('.quiz-option-label').classList.remove('selected');
                });
                if (input.checked) {
                    label.classList.add('selected');
                }
            });
        }
        feedbackEl.classList.add('hidden');
        if (submitAnswerBtn) {
            submitAnswerBtn.disabled = false;
            submitAnswerBtn.classList.remove('hidden');
        }
        if (quizNavigationDiv) quizNavigationDiv.classList.add('hidden');
    }

    // --- Saving Local Data ---
    function saveAnswerLocally(record) {
        try {
            let history = JSON.parse(localStorage.getItem('answersHistory')) || [];
            history.push(record);
            localStorage.setItem('answersHistory', JSON.stringify(history));
            console.log("答案紀錄已保存至本機！");
        } catch (e) {
            console.error("保存紀錄失敗：", e);
        }
    }

    // --- Event Handlers ---
    if (quizForm) {
        quizForm.addEventListener('submit', function (event) {
            event.preventDefault();
            if (submitAnswerBtn) submitAnswerBtn.disabled = true;

            const selectedAnswerInput = quizForm.querySelector('input[name="q_answer"]:checked');

            feedbackEl.classList.remove('hidden');
            feedbackEl.className = '';
            feedbackEl.id = 'quiz-feedback';

            if (selectedAnswerInput) {
                const userAnswer = selectedAnswerInput.value;
                const currentQuestionData = questionsData[currentQuestionIndex];
                const correctAnswer = currentQuestionData.correctAnswer;
                const isCorrect = (userAnswer === correctAnswer);

                if (isCorrect) {
                    feedbackEl.textContent = '答對了！獲得一個 🦴 肉乾！';
                    feedbackEl.classList.add('correct');
                    meatJerkyCount++;
                    questionsAnsweredInThisSession++;
                    localStorage.setItem('meatJerkyCount', meatJerkyCount);
                    updateMeatJerkyDisplay();
                    checkBasementUnlock();
                } else {
                    feedbackEl.textContent = `答錯了。正確答案是：${currentQuestionData.options[correctAnswer]}`;
                    feedbackEl.classList.add('incorrect');
                }

                // ================== 將答題結果存放到 LocalStorage ==================
                const characterName = playerCharSpan.textContent || '未知角色';
                const answerRecord = {
                    character: characterName,
                    location: mapConfig.locationName,
                    question: currentQuestionData.question,
                    userAnswer: currentQuestionData.options[userAnswer],
                    correctAnswer: currentQuestionData.options[correctAnswer],
                    isCorrect: isCorrect,
                    timestamp: new Date().toISOString()
                };
                saveAnswerLocally(answerRecord);

            } else {
                feedbackEl.textContent = '請選擇一個答案！';
                feedbackEl.classList.add('info');
                if (submitAnswerBtn) submitAnswerBtn.disabled = false;
                return;
            }

            if (submitAnswerBtn) submitAnswerBtn.classList.add('hidden');
            if (quizNavigationDiv) quizNavigationDiv.classList.remove('hidden');

            if (currentQuestionIndex >= questionsData.length - 1) {
                if (nextQuestionBtn) nextQuestionBtn.textContent = "查看結果";
            } else {
                if (nextQuestionBtn) {
                    nextQuestionBtn.textContent = "下一題";
                    nextQuestionBtn.classList.remove('hidden');
                    nextQuestionBtn.style.display = 'inline-block'; // keeping this inline if its not simple block
                }
            }
        });
    }

    if (nextQuestionBtn) {
        nextQuestionBtn.addEventListener('click', () => {
            if (currentQuestionIndex >= questionsData.length - 1) {
                endQuiz();
            } else {
                currentQuestionIndex++;
                loadQuestion(currentQuestionIndex);
            }
        });
    }

    // --- Game Logic ---
    function checkBasementUnlock() {
        if (meatJerkyCount >= MAX_MEAT_JERKY_TO_UNLOCK) {
            if (localStorage.getItem('basementUnlocked') !== 'true') {
                localStorage.setItem('basementUnlocked', 'true');
            }
        }
    }

    function endQuiz() {
        if (quizContentArea) quizContentArea.classList.add('hidden');
        if (quizNavigationDiv) quizNavigationDiv.classList.add('hidden');
        if (quizCompleteMessageDiv) quizCompleteMessageDiv.classList.remove('hidden');

        if (quizCompleteTitle) quizCompleteTitle.textContent = `${mapConfig.title}完成！`;
        if (finalScoreMessage) {
            finalScoreMessage.textContent = `本次挑戰你答對了 ${questionsAnsweredInThisSession} / ${questionsData.length} 題。`;
            finalScoreMessage.textContent += ` 目前總共有 ${meatJerkyCount} 個肉乾。`;
        }

        if (localStorage.getItem('basementUnlocked') === 'true' || meatJerkyCount >= MAX_MEAT_JERKY_TO_UNLOCK) {
            if (basementUnlockMessage) basementUnlockMessage.classList.remove('hidden');
        }
    }

    // --- Start Quiz ---
    initializeQuiz();
});
