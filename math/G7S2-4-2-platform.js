const categoryNames = {
    1: "第一部分：x - a 類型 (移項變加)",
    2: "第二部分：x + a 類型 (移項變減)",
    3: "第三部分：-x 類型 (負號消失變號)",
    4: "第四部分：-x 加減類型 (先移項再變號)",
    5: "第五部分：係數 x 類型 (含乘除變號)",
    6: "第六部分：分數係數化整 (乘分母)",
    7: "第七部分：分數係數移項綜合大考驗"
};

const teacherReminders = {
    1: "這裡有減常數移項。移到右邊去時，要把減號變成加號喔！數字大小不要算錯。",
    2: "這裡是加常數移項。移到右邊去時，記得要把加號改成減號！",
    3: "超級注意！前面的負號 -x 消失，同乘 -1 的時候，不等號方向一定要反轉。",
    4: "挑戰兩步驟！先把常數移項，再左右同乘 -1，這時不等號方向要相反。",
    5: "同除以係數時，如果是正數，不等號方向不變；如果是負數，不等號方向一定要反轉。",
    6: "面對分數係數，兩邊同乘分母。若分數前面有負號，同乘負數時不等號要變向。",
    7: "大魔王！先把常數移到右邊，再乘分母消去分數。每一步都要看清楚正負號。"
};

const rawQuestions = [
    { id: 1, type: 1, formula: "x - 1 > 10", raw: { xCoeff: 1, constLHS: -1, op: ">", constRHS: 10 } },
    { id: 2, type: 1, formula: "x - 3 \\ge 7", raw: { xCoeff: 1, constLHS: -3, op: "\\ge", constRHS: 7 } },
    { id: 3, type: 1, formula: "x - 5 < 12", raw: { xCoeff: 1, constLHS: -5, op: "<", constRHS: 12 } },
    { id: 4, type: 1, formula: "x - 2 \\le 8", raw: { xCoeff: 1, constLHS: -2, op: "\\le", constRHS: 8 } },
    { id: 5, type: 1, formula: "x - 4 > 6", raw: { xCoeff: 1, constLHS: -4, op: ">", constRHS: 6 } },
    { id: 6, type: 1, formula: "x - 7 < 3", raw: { xCoeff: 1, constLHS: -7, op: "<", constRHS: 3 } },
    { id: 7, type: 1, formula: "x - 10 \\ge 5", raw: { xCoeff: 1, constLHS: -10, op: "\\ge", constRHS: 5 } },
    { id: 8, type: 1, formula: "x - 6 \\le 9", raw: { xCoeff: 1, constLHS: -6, op: "\\le", constRHS: 9 } },
    { id: 9, type: 1, formula: "x - 8 < 2", raw: { xCoeff: 1, constLHS: -8, op: "<", constRHS: 2 } },
    { id: 10, type: 1, formula: "x - 9 \\ge 11", raw: { xCoeff: 1, constLHS: -9, op: "\\ge", constRHS: 11 } },
    { id: 11, type: 2, formula: "x + 5 > 10", raw: { xCoeff: 1, constLHS: 5, op: ">", constRHS: 10 } },
    { id: 12, type: 2, formula: "x + 2 \\ge 7", raw: { xCoeff: 1, constLHS: 2, op: "\\ge", constRHS: 7 } },
    { id: 13, type: 2, formula: "x + 8 < 15", raw: { xCoeff: 1, constLHS: 8, op: "<", constRHS: 15 } },
    { id: 14, type: 2, formula: "x + 4 \\le 6", raw: { xCoeff: 1, constLHS: 4, op: "\\le", constRHS: 6 } },
    { id: 15, type: 2, formula: "x + 3 > 9", raw: { xCoeff: 1, constLHS: 3, op: ">", constRHS: 9 } },
    { id: 16, type: 2, formula: "x + 10 < 12", raw: { xCoeff: 1, constLHS: 10, op: "<", constRHS: 12 } },
    { id: 17, type: 2, formula: "x + 7 \\ge 8", raw: { xCoeff: 1, constLHS: 7, op: "\\ge", constRHS: 8 } },
    { id: 18, type: 2, formula: "x + 6 \\le 11", raw: { xCoeff: 1, constLHS: 6, op: "\\le", constRHS: 11 } },
    { id: 19, type: 2, formula: "x + 1 < 5", raw: { xCoeff: 1, constLHS: 1, op: "<", constRHS: 5 } },
    { id: 20, type: 2, formula: "x + 9 \\ge 20", raw: { xCoeff: 1, constLHS: 9, op: "\\ge", constRHS: 20 } },
    { id: 21, type: 3, formula: "-x > -10", raw: { xCoeff: -1, constLHS: 0, op: ">", constRHS: -10 } },
    { id: 22, type: 3, formula: "-x < 8", raw: { xCoeff: -1, constLHS: 0, op: "<", constRHS: 8 } },
    { id: 23, type: 3, formula: "-x \\ge -5", raw: { xCoeff: -1, constLHS: 0, op: "\\ge", constRHS: -5 } },
    { id: 24, type: 3, formula: "-x \\le 3", raw: { xCoeff: -1, constLHS: 0, op: "\\le", constRHS: 3 } },
    { id: 25, type: 3, formula: "-x > 2", raw: { xCoeff: -1, constLHS: 0, op: ">", constRHS: 2 } },
    { id: 26, type: 3, formula: "-x < -7", raw: { xCoeff: -1, constLHS: 0, op: "<", constRHS: -7 } },
    { id: 27, type: 3, formula: "-x \\ge 4", raw: { xCoeff: -1, constLHS: 0, op: "\\ge", constRHS: 4 } },
    { id: 28, type: 3, formula: "-x \\le -1", raw: { xCoeff: -1, constLHS: 0, op: "\\le", constRHS: -1 } },
    { id: 29, type: 3, formula: "-x > -6", raw: { xCoeff: -1, constLHS: 0, op: ">", constRHS: -6 } },
    { id: 30, type: 3, formula: "-x < 9", raw: { xCoeff: -1, constLHS: 0, op: "<", constRHS: 9 } },
    { id: 31, type: 4, formula: "-x - 8 > 10", raw: { xCoeff: -1, constLHS: -8, op: ">", constRHS: 10 } },
    { id: 32, type: 4, formula: "-x + 3 \\ge 7", raw: { xCoeff: -1, constLHS: 3, op: "\\ge", constRHS: 7 } },
    { id: 33, type: 4, formula: "-x - 5 < 12", raw: { xCoeff: -1, constLHS: -5, op: "<", constRHS: 12 } },
    { id: 34, type: 4, formula: "-x + 2 \\le 8", raw: { xCoeff: -1, constLHS: 2, op: "\\le", constRHS: 8 } },
    { id: 35, type: 4, formula: "-x - 4 > 6", raw: { xCoeff: -1, constLHS: -4, op: ">", constRHS: 6 } },
    { id: 36, type: 4, formula: "-x + 7 < 3", raw: { xCoeff: -1, constLHS: 7, op: "<", constRHS: 3 } },
    { id: 37, type: 4, formula: "-x - 10 \\ge 5", raw: { xCoeff: -1, constLHS: -10, op: "\\ge", constRHS: 5 } },
    { id: 38, type: 4, formula: "-x + 6 \\le 9", raw: { xCoeff: -1, constLHS: 6, op: "\\le", constRHS: 9 } },
    { id: 39, type: 4, formula: "-x - 8 < 2", raw: { xCoeff: -1, constLHS: -8, op: "<", constRHS: 2 } },
    { id: 40, type: 4, formula: "-x + 9 \\ge 11", raw: { xCoeff: -1, constLHS: 9, op: "\\ge", constRHS: 11 } },
    { id: 41, type: 5, formula: "2x - 4 > 6", raw: { xCoeff: 2, constLHS: -4, op: ">", constRHS: 6 } },
    { id: 42, type: 5, formula: "3x + 5 \\ge 11", raw: { xCoeff: 3, constLHS: 5, op: "\\ge", constRHS: 11 } },
    { id: 43, type: 5, formula: "4x - 8 < 12", raw: { xCoeff: 4, constLHS: -8, op: "<", constRHS: 12 } },
    { id: 44, type: 5, formula: "-2x + 6 \\le 12", raw: { xCoeff: -2, constLHS: 6, op: "\\le", constRHS: 12 } },
    { id: 45, type: 5, formula: "-3x - 9 > 6", raw: { xCoeff: -3, constLHS: -9, op: ">", constRHS: 6 } },
    { id: 46, type: 5, formula: "5x + 10 \\ge 25", raw: { xCoeff: 5, constLHS: 10, op: "\\ge", constRHS: 25 } },
    { id: 47, type: 5, formula: "-4x + 8 < 20", raw: { xCoeff: -4, constLHS: 8, op: "<", constRHS: 20 } },
    { id: 48, type: 5, formula: "2x - 10 \\le 4", raw: { xCoeff: 2, constLHS: -10, op: "\\le", constRHS: 4 } },
    { id: 49, type: 5, formula: "-5x - 5 > 10", raw: { xCoeff: -5, constLHS: -5, op: ">", constRHS: 10 } },
    { id: 50, type: 5, formula: "3x + 12 \\ge 3", raw: { xCoeff: 3, constLHS: 12, op: "\\ge", constRHS: 3 } },
    { id: 51, type: 6, formula: "\\frac{1}{3}x > 5", raw: { xCoeff: "1/3", constLHS: 0, op: ">", constRHS: 5 } },
    { id: 52, type: 6, formula: "\\frac{1}{2}x \\ge 4", raw: { xCoeff: "1/2", constLHS: 0, op: "\\ge", constRHS: 4 } },
    { id: 53, type: 6, formula: "\\frac{1}{4}x < 3", raw: { xCoeff: "1/4", constLHS: 0, op: "<", constRHS: 3 } },
    { id: 54, type: 6, formula: "\\frac{1}{5}x \\le 2", raw: { xCoeff: "1/5", constLHS: 0, op: "\\le", constRHS: 2 } },
    { id: 55, type: 6, formula: "\\frac{1}{2}x > 6", raw: { xCoeff: "1/2", constLHS: 0, op: ">", constRHS: 6 } },
    { id: 56, type: 6, formula: "-\\frac{1}{3}x < 2", raw: { xCoeff: "-1/3", constLHS: 0, op: "<", constRHS: 2 } },
    { id: 57, type: 6, formula: "-\\frac{1}{4}x \\ge -1", raw: { xCoeff: "-1/4", constLHS: 0, op: "\\ge", constRHS: -1 } },
    { id: 58, type: 6, formula: "\\frac{1}{6}x \\le 3", raw: { xCoeff: "1/6", constLHS: 0, op: "\\le", constRHS: 3 } },
    { id: 59, type: 6, formula: "-\\frac{1}{2}x > -4", raw: { xCoeff: "-1/2", constLHS: 0, op: ">", constRHS: -4 } },
    { id: 60, type: 6, formula: "\\frac{1}{5}x \\ge 5", raw: { xCoeff: "1/5", constLHS: 0, op: "\\ge", constRHS: 5 } },
    { id: 61, type: 7, formula: "\\frac{1}{2}x - 3 > 1", raw: { xCoeff: "1/2", constLHS: -3, op: ">", constRHS: 1 } },
    { id: 62, type: 7, formula: "\\frac{1}{3}x + 2 \\le 4", raw: { xCoeff: "1/3", constLHS: 2, op: "\\le", constRHS: 4 } },
    { id: 63, type: 7, formula: "\\frac{1}{4}x - 1 \\ge 2", raw: { xCoeff: "1/4", constLHS: -1, op: "\\ge", constRHS: 2 } },
    { id: 64, type: 7, formula: "-\\frac{1}{2}x + 5 < 3", raw: { xCoeff: "-1/2", constLHS: 5, op: "<", constRHS: 3 } },
    { id: 65, type: 7, formula: "\\frac{1}{5}x - 4 > -1", raw: { xCoeff: "1/5", constLHS: -4, op: ">", constRHS: -1 } },
    { id: 66, type: 7, formula: "-\\frac{1}{3}x - 2 \\ge -3", raw: { xCoeff: "-1/3", constLHS: -2, op: "\\ge", constRHS: -3 } },
    { id: 67, type: 7, formula: "\\frac{1}{2}x + 6 \\le 7", raw: { xCoeff: "1/2", constLHS: 6, op: "\\le", constRHS: 7 } },
    { id: 68, type: 7, formula: "-\\frac{1}{4}x + 3 > 1", raw: { xCoeff: "-1/4", constLHS: 3, op: ">", constRHS: 1 } },
    { id: 69, type: 7, formula: "\\frac{1}{6}x - 5 < -2", raw: { xCoeff: "1/6", constLHS: -5, op: "<", constRHS: -2 } },
    { id: 70, type: 7, formula: "-\\frac{1}{5}x - 1 \\ge -2", raw: { xCoeff: "-1/5", constLHS: -1, op: "\\ge", constRHS: -2 } }
];

let gameState = {
    currentQId: 1,
    attempts: {},
    completed: {},
    stepsData: {},
    timeRemaining: 420,
    timerInterval: null
};

function levelType() {
    return Number(window.LEVEL_TYPE || 1);
}

function levelQuestions() {
    return rawQuestions.filter(q => q.type === levelType());
}

function revOp(op) {
    return { ">": "<", "<": ">", "\\ge": "\\le", "\\le": "\\ge" }[op] || op;
}

function opPlain(op) {
    return op.replace("\\ge", "≥").replace("\\le", "≤");
}

function coeffText(coeff) {
    if (coeff === 1) return "x";
    if (coeff === -1) return "-x";
    return `${coeff}x`;
}

function getStepsForQuestion(q) {
    const r = q.raw;
    const steps = [];
    if (q.type === 1 || q.type === 2) {
        const a = Math.abs(r.constLHS);
        const sign = r.constLHS < 0 ? "+" : "-";
        const value = r.constRHS - r.constLHS;
        steps.push({
            title: q.type === 1 ? `第一步：減去 ${a} 移到右邊變成加上 ${a}` : `第一步：加上 ${a} 移到右邊變成減去 ${a}`,
            latex_before: `x ${r.op} ${r.constRHS}`,
            slots: [{ type: "sign", correct: sign }, { type: "number", correct: String(a) }],
            guide: "請填入移項後的符號與常數。"
        });
        steps.push({
            title: "第二步：計算右邊常數，得到最終解",
            latex_before: `x ${r.op}`,
            slots: [{ type: "number", correct: String(value) }],
            guide: "把右方算式算出來。"
        });
    } else if (q.type === 3) {
        steps.push({
            title: "第一步：兩邊同乘 -1，不等號方向要變向",
            latex_before: "x",
            slots: [{ type: "op", correct: revOp(r.op) }, { type: "number", correct: String(-r.constRHS) }],
            guide: "負號消失時，常數變號，不等號也要反向。"
        });
    } else if (q.type === 4 || q.type === 5) {
        const a = r.xCoeff;
        const b = Math.abs(r.constLHS);
        const sign = r.constLHS < 0 ? "+" : "-";
        const temp = r.constRHS - r.constLHS;
        const finalOp = a < 0 ? revOp(r.op) : r.op;
        const final = temp / a;
        steps.push({
            title: "第一步：將常數項移到右邊",
            latex_before: `${coeffText(a)} ${r.op} ${r.constRHS}`,
            slots: [{ type: "sign", correct: sign }, { type: "number", correct: String(b) }],
            guide: "常數移項時要變號。"
        });
        steps.push({
            title: "第二步：計算右邊常數的值",
            latex_before: `${coeffText(a)} ${r.op}`,
            slots: [{ type: "number", correct: String(temp) }],
            guide: "先得到右邊暫時的數值。"
        });
        steps.push({
            title: `第三步：同除以 ${a}。${a < 0 ? "除以負數，不等號要反向" : "除以正數，不等號不變"}`,
            latex_before: "x",
            slots: [{ type: "op", correct: finalOp }, { type: "number", correct: String(final) }],
            guide: "同除以係數，留意係數正負。"
        });
    } else if (q.type === 6) {
        const isNeg = r.xCoeff.startsWith("-");
        const den = Number(r.xCoeff.replace("-", "").split("/")[1]);
        const multiplier = isNeg ? -den : den;
        steps.push({
            title: `第一步：左右同乘以 ${multiplier} 消去分數。${isNeg ? "乘負數，不等號要反向" : "乘正數，不等號不變"}`,
            latex_before: "x",
            slots: [{ type: "op", correct: isNeg ? revOp(r.op) : r.op }, { type: "number", correct: String(r.constRHS * multiplier) }],
            guide: "同乘分母消去分數係數。"
        });
    } else if (q.type === 7) {
        const isNeg = r.xCoeff.startsWith("-");
        const den = Number(r.xCoeff.replace("-", "").split("/")[1]);
        const multiplier = isNeg ? -den : den;
        const b = Math.abs(r.constLHS);
        const sign = r.constLHS < 0 ? "+" : "-";
        const temp = r.constRHS - r.constLHS;
        const coeffLatex = isNeg ? `-\\frac{1}{${den}}x` : `\\frac{1}{${den}}x`;
        steps.push({
            title: "第一步：將常數移項到右方",
            latex_before: `${coeffLatex} ${r.op} ${r.constRHS}`,
            slots: [{ type: "sign", correct: sign }, { type: "number", correct: String(b) }],
            guide: "先處理加減常數，移項時要變號。"
        });
        steps.push({
            title: "第二步：計算右邊常數的值",
            latex_before: `${coeffLatex} ${r.op}`,
            slots: [{ type: "number", correct: String(temp) }],
            guide: "算出移項後右邊的數值。"
        });
        steps.push({
            title: `第三步：左右同乘 ${multiplier}，消去分數分母。${isNeg ? "乘負數，不等號要反向" : "乘正數，不等號不變"}`,
            latex_before: "x",
            slots: [{ type: "op", correct: isNeg ? revOp(r.op) : r.op }, { type: "number", correct: String(temp * multiplier) }],
            guide: "乘分母消去分數，注意正負號。"
        });
    }
    return steps;
}

function generateOptionsForStep(step, q) {
    const candidates = new Set(step.slots.map(s => s.correct));
    ["+", "-", ">", "<", "\\ge", "\\le"].forEach(v => candidates.add(v));
    const r = q.raw;
    [r.constRHS, Math.abs(r.constRHS), r.constLHS, Math.abs(r.constLHS)].forEach(v => candidates.add(String(v)));
    if (typeof r.xCoeff === "number") {
        [r.xCoeff, Math.abs(r.xCoeff), -Math.abs(r.xCoeff)].forEach(v => candidates.add(String(v)));
    } else {
        const den = r.xCoeff.replace("-", "").split("/")[1];
        candidates.add(den);
        candidates.add(`-${den}`);
    }
    const sum = Math.abs(r.constRHS) + Math.abs(r.constLHS);
    const diff = Math.abs(Math.abs(r.constRHS) - Math.abs(r.constLHS));
    [sum, diff, -sum, -diff].forEach(v => candidates.add(String(v)));
    let list = Array.from(candidates).filter(v => v !== "0" || step.slots.some(s => s.correct === "0"));
    if (step.slots.every(s => s.type === "number")) {
        list = list.filter(v => !["+", "-", ">", "<", "\\ge", "\\le"].includes(v));
    }
    step.slots.forEach(slot => {
        if (!list.includes(slot.correct)) list.push(slot.correct);
    });
    return list.sort(() => Math.random() - 0.5);
}

function initApp() {
    document.getElementById("unit-title").innerText = categoryNames[levelType()];
    document.getElementById("teacher-tip").innerText = teacherReminders[levelType()];
    levelQuestions().forEach(q => {
        const steps = getStepsForQuestion(q);
        gameState.stepsData[q.id] = {
            currentActiveStep: 0,
            userAnswers: steps.map(s => s.slots.map(() => "")),
            stepChecked: steps.map(() => false),
            options: steps.map(step => generateOptionsForStep(step, q))
        };
    });
    gameState.currentQId = levelQuestions()[0].id;
    renderNav();
    loadQuestion(gameState.currentQId);
    startTimer();
}

function startTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = setInterval(() => {
        if (gameState.timeRemaining > 0) {
            gameState.timeRemaining--;
            updateTimerDisplay();
        } else {
            clearInterval(gameState.timerInterval);
            timeOutFinish();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timeRemaining / 60);
    const seconds = gameState.timeRemaining % 60;
    document.getElementById("timer-display").innerText = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function renderNav() {
    const container = document.getElementById("q-nav-container");
    container.innerHTML = "";
    levelQuestions().forEach((q, index) => {
        const btn = document.createElement("button");
        const isActive = gameState.currentQId === q.id;
        const isDone = gameState.completed[q.id];
        btn.className = `w-10 h-10 rounded-full font-bold flex items-center justify-center transition-all text-sm border-2 ${isActive ? "bg-brand-600 text-white border-brand-600 ring-2 ring-brand-200" : isDone ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"}`;
        btn.innerHTML = isDone ? "✓" : index + 1;
        btn.onclick = () => loadQuestion(q.id);
        container.appendChild(btn);
    });
}

function loadQuestion(qId) {
    gameState.currentQId = qId;
    const q = rawQuestions.find(item => item.id === qId);
    const localIndex = levelQuestions().findIndex(item => item.id === qId) + 1;
    document.getElementById("q-badge").innerText = `第 ${localIndex} 題 / 共 10 題`;
    document.getElementById("main-math-eq").dataset.latex = q.formula;
    document.getElementById("q-status-text").innerText = gameState.completed[qId] ? "已完成" : "挑戰中";
    renderSteps(q);
    renderNav();
    renderMath();
}

function renderSteps(q) {
    const container = document.getElementById("steps-container");
    container.innerHTML = "";
    const steps = getStepsForQuestion(q);
    const sState = gameState.stepsData[q.id];
    steps.forEach((step, stepIdx) => {
        if (stepIdx > sState.currentActiveStep) return;
        const isChecked = sState.stepChecked[stepIdx];
        const isCurrent = stepIdx === sState.currentActiveStep && !isChecked;
        const card = document.createElement("div");
        card.className = `p-5 md:p-6 rounded-3xl border transition-all duration-300 ${isChecked ? "bg-emerald-50/70 border-emerald-200 shadow-sm" : "bg-white border-slate-200 shadow-md ring-1 ring-slate-100"}`;
        card.innerHTML = `<div class="flex justify-between items-center mb-3 flex-wrap gap-2"><h4 class="text-base font-extrabold text-slate-800 flex items-center gap-2"><span class="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-black">${stepIdx + 1}</span>${step.title}</h4>${isChecked ? '<span class="text-emerald-600 font-extrabold text-sm">完成</span>' : ""}</div>`;
        const mathLine = document.createElement("div");
        mathLine.className = "math-line border-y border-slate-50 py-3 my-4";
        mathLine.appendChild(mathSpan(step.latex_before));
        step.slots.forEach((slotInfo, slotIdx) => {
            const value = sState.userAnswers[stepIdx][slotIdx];
            const slot = document.createElement("span");
            slot.className = `slot ${isCurrent && !value ? "active" : ""} ${isChecked ? "correct" : ""}`;
            if (value) {
                if (["<", ">", "\\ge", "\\le"].includes(value)) slot.appendChild(mathSpan(value));
                else slot.innerText = value;
            } else {
                slot.innerText = "?";
            }
            if (isCurrent) slot.onclick = () => value ? clearSlot(stepIdx, slotIdx) : highlightSlot(slot);
            mathLine.appendChild(slot);
        });
        card.appendChild(mathLine);
        if (isCurrent) {
            const guide = document.createElement("p");
            guide.className = "text-xs font-semibold text-brand-600 bg-brand-50/50 p-2.5 rounded-xl border border-brand-100/50 mb-4";
            guide.innerText = `老師小幫手：${step.guide}`;
            card.appendChild(guide);
            const options = document.createElement("div");
            options.className = "mt-4";
            options.innerHTML = '<span class="block text-xs font-black text-slate-400 tracking-wider mb-2">請點選下方按鈕填入：</span>';
            const grid = document.createElement("div");
            grid.className = "grid grid-cols-3 sm:grid-cols-6 gap-2";
            sState.options[stepIdx].forEach(opt => {
                const btn = document.createElement("button");
                btn.className = "py-3 px-3 rounded-2xl bg-slate-50 border-2 border-slate-200 hover:border-brand-500 hover:bg-brand-50 font-black text-lg text-slate-700 transition-all active:scale-95 shadow-sm flex items-center justify-center";
                if (["<", ">", "\\ge", "\\le"].includes(opt)) btn.appendChild(mathSpan(opt));
                else btn.innerText = opt;
                btn.onclick = () => fillSlot(stepIdx, opt);
                grid.appendChild(btn);
            });
            options.appendChild(grid);
            card.appendChild(options);
            const action = document.createElement("div");
            action.className = "mt-6 pt-4 border-t border-slate-100 flex justify-end";
            action.innerHTML = `<button onclick="checkStep(${stepIdx})" class="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm transition-all shadow-md active:scale-95">檢查答案是否正確</button>`;
            card.appendChild(action);
        }
        container.appendChild(card);
    });
}

function mathSpan(latex) {
    const span = document.createElement("span");
    span.className = "math";
    span.dataset.latex = latex;
    return span;
}

function fillSlot(stepIdx, value) {
    const sState = gameState.stepsData[gameState.currentQId];
    const emptyIdx = sState.userAnswers[stepIdx].findIndex(ans => ans === "");
    if (emptyIdx !== -1) {
        sState.userAnswers[stepIdx][emptyIdx] = value;
        loadQuestion(gameState.currentQId);
    } else {
        showToast("本步驟的空格都填滿了，可以檢查答案。");
    }
}

function clearSlot(stepIdx, slotIdx) {
    gameState.stepsData[gameState.currentQId].userAnswers[stepIdx][slotIdx] = "";
    loadQuestion(gameState.currentQId);
}

function highlightSlot(slot) {
    slot.classList.add("active");
    setTimeout(() => slot.classList.remove("active"), 800);
}

function checkStep(stepIdx) {
    const q = rawQuestions.find(item => item.id === gameState.currentQId);
    const sState = gameState.stepsData[q.id];
    const step = getStepsForQuestion(q)[stepIdx];
    const answers = sState.userAnswers[stepIdx];
    if (answers.some(ans => ans === "")) {
        showToast("請填滿所有空格再檢查。");
        return;
    }
    const correct = step.slots.every((slot, idx) => answers[idx] === slot.correct);
    if (!correct) {
        gameState.attempts[`${q.id}_${stepIdx}`] = "wrong";
        showToast("再想想看，檢查不等號方向或移項符號。");
        return;
    }
    sState.stepChecked[stepIdx] = true;
    if (!gameState.attempts[`${q.id}_${stepIdx}`]) {
        gameState.attempts[`${q.id}_${stepIdx}`] = "correct";
        document.getElementById("global-score").innerText = Number(document.getElementById("global-score").innerText) + 1;
    }
    if (stepIdx + 1 < getStepsForQuestion(q).length) {
        sState.currentActiveStep = stepIdx + 1;
        showToast("答對了，進入下一步。", "success");
    } else {
        gameState.completed[q.id] = true;
        showToast("太棒了，本題完成。", "success");
        checkCategoryCompletion();
    }
    loadQuestion(q.id);
}

function checkCategoryCompletion() {
    if (levelQuestions().every(q => gameState.completed[q.id])) {
        showFinishModal();
    }
}

function prevQuestion() {
    const qs = levelQuestions();
    const idx = qs.findIndex(q => q.id === gameState.currentQId);
    if (idx > 0) loadQuestion(qs[idx - 1].id);
    else showToast("已經是本關第一題。");
}

function nextQuestion() {
    const qs = levelQuestions();
    const idx = qs.findIndex(q => q.id === gameState.currentQId);
    if (idx < qs.length - 1) loadQuestion(qs[idx + 1].id);
    else showToast("已經是本關最後一題。");
}

function showToast(text, type = "info") {
    const toast = document.getElementById("toast-message");
    document.getElementById("toast-icon").innerText = type === "success" ? "✓" : "!";
    document.getElementById("toast-text").innerText = text;
    toast.classList.remove("opacity-0", "pointer-events-none", "translate-y-2");
    toast.classList.add("opacity-100", "pointer-events-auto", "translate-y-0");
    setTimeout(() => {
        toast.classList.add("opacity-0", "pointer-events-none", "translate-y-2");
        toast.classList.remove("opacity-100", "pointer-events-auto", "translate-y-0");
    }, 2800);
}

function showFinishModal() {
    clearInterval(gameState.timerInterval);
    const used = 420 - gameState.timeRemaining;
    document.getElementById("modal-score").innerText = document.getElementById("global-score").innerText;
    document.getElementById("modal-time").innerText = `${String(Math.floor(used / 60)).padStart(2, "0")}:${String(used % 60).padStart(2, "0")}`;
    document.getElementById("finish-modal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("finish-modal").classList.add("hidden");
    if (gameState.timeRemaining > 0) startTimer();
}

function timeOutFinish() {
    document.getElementById("modal-title").innerText = "時間到囉！繼續加油！";
    document.getElementById("modal-desc").innerText = "不急不餒，重新練習一次，你一定能做得更好。";
    showFinishModal();
}

function restartChallenge() {
    gameState.timeRemaining = 420;
    gameState.attempts = {};
    gameState.completed = {};
    gameState.stepsData = {};
    document.getElementById("global-score").innerText = "0";
    document.getElementById("finish-modal").classList.add("hidden");
    initApp();
}

function renderMath() {
    if (typeof katex === "undefined") return;
    document.querySelectorAll(".math").forEach(el => {
        katex.render(el.dataset.latex, el, { throwOnError: false, displayMode: false });
    });
    document.querySelectorAll(".math-display").forEach(el => {
        katex.render(el.dataset.latex, el, { throwOnError: false, displayMode: true });
    });
}

window.addEventListener("DOMContentLoaded", initApp);
