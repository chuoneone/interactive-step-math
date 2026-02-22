// js/quiz_data.js

const quizData = {
    gate: {
        locationName: "校門口",
        title: "校門口挑戰（入門暖身）",
        className: "library-quiz-page",
        questions: [
            { question: "計算：15 + 27 = ？", options: { a: "40", b: "42", c: "43", d: "41" }, correctAnswer: "b" },
            { question: "計算：8 × 7 = ？", options: { a: "54", b: "56", c: "58", d: "63" }, correctAnswer: "b" },
            { question: "計算：100 - 38 = ？", options: { a: "62", b: "68", c: "72", d: "58" }, correctAnswer: "a" },
            { question: "計算：48 ÷ 6 = ？", options: { a: "6", b: "7", c: "8", d: "9" }, correctAnswer: "c" }
        ]
    },
    library: {
        locationName: "圖書館",
        title: "圖書館挑戰（基礎代數與數論）",
        className: "library-quiz-page",
        questions: [
            { question: "計算：|-5| - 3 × (-2) = ？", options: { a: "11", b: "-1", c: "1", d: "-11" }, correctAnswer: "a" },
            { question: "解一元一次方程式：3x - 5 = 2x + 4，x 的值為何？", options: { a: "1", b: "9", c: "-9", d: "-1" }, correctAnswer: "b" },
            { question: "24 和 36 的最大公因數是多少？", options: { a: "6", b: "8", c: "12", d: "72" }, correctAnswer: "c" },
            { question: "若 a = -2, b = 3，則 a² - 2ab + b² 的值為何？", options: { a: "-5", b: "5", c: "25", d: "-25" }, correctAnswer: "c" }
        ]
    },
    playground: {
        locationName: "操場",
        title: "操場挑戰（幾何與速率）",
        className: "playground-quiz-page",
        questions: [
            { question: "一個直角三角形的兩股長分別為 3 和 4，斜邊長為何？", options: { a: "5", b: "6", c: "7", d: "8" }, correctAnswer: "a" },
            { question: "小明以每秒 5 公尺的速度繞著長 200 公尺的操場跑一圈，需要多少秒？", options: { a: "20", b: "30", c: "40", d: "50" }, correctAnswer: "c" },
            { question: "圓的半徑為 10，則其圓周長為多少？(圓周率以 π 表示)", options: { a: "10π", b: "20π", c: "50π", d: "100π" }, correctAnswer: "b" },
            { question: "一個正方形的面積為 64，其周長為何？", options: { a: "8", b: "16", c: "32", d: "64" }, correctAnswer: "c" }
        ]
    },
    lab: {
        locationName: "實驗室",
        title: "實驗室挑戰（機率與比例）",
        className: "lab-quiz-page",
        questions: [
            { question: "某實驗室調配藥水，A藥水與B藥水的比例為 3:5，若A藥水使用了 15 毫升，B藥水需要多少毫升？", options: { a: "15", b: "20", c: "25", d: "30" }, correctAnswer: "c" },
            { question: "投擲一枚均勻的硬幣一次，出現正面的機率是多少？", options: { a: "1", b: "1/2", c: "1/4", d: "0" }, correctAnswer: "b" },
            { question: "某濃度為 20% 的食鹽水 200 克，含有多少克的食鹽？", options: { a: "20", b: "40", c: "60", d: "80" }, correctAnswer: "b" },
            { question: "在一個不透明的袋子中裝有 3 顆紅球、2 顆白球，從中隨機抽出一顆球是紅球的機率為何？", options: { a: "60%", b: "40%", c: "50%", d: "30%" }, correctAnswer: "a" }
        ]
    },
    forest: {
        locationName: "後山林道",
        title: "後山林道挑戰（不等式與函數）",
        className: "forest-quiz-page",
        questions: [
            { question: "下列哪一個 x 的值滿足不等式 2x - 3 > 7？", options: { a: "3", b: "4", c: "5", d: "6" }, correctAnswer: "d" },
            { question: "已知函數 f(x) = -3x + 2，則 f(2) 的值為何？", options: { a: "-4", b: "4", c: "8", d: "-8" }, correctAnswer: "a" },
            { question: "有一等差數列 2, 5, 8, 11...，請問第 10 項為多少？", options: { a: "26", b: "29", c: "32", d: "35" }, correctAnswer: "b" },
            { question: "坐標平面上，直線 y = 2x - 4 與 x 軸的交點坐標為何？", options: { a: "(0, -4)", b: "(2, 0)", c: "(-2, 0)", d: "(0, 4)" }, correctAnswer: "b" }
        ]
    },
    basement: {
        locationName: "地下室",
        title: "地下室挑戰（綜合挑戰）",
        className: "basement-quiz-page",
        questions: [
            { question: "解二元一次聯立方程式：x + y = 10，且 x - y = 4，x和y的值為何？", options: { a: "x=4, y=6", b: "x=6, y=4", c: "x=7, y=3", d: "x=5, y=5" }, correctAnswer: "c" },
            { question: "多項式 (x - 3)(x + 4) 展開後的結果為何？", options: { a: "x² - x - 12", b: "x² + x - 12", c: "x² + 7x - 12", d: "x² - 12" }, correctAnswer: "b" },
            { question: "化簡根式：√18 = ？", options: { a: "2√3", b: "3√2", c: "9", d: "3" }, correctAnswer: "b" },
            { question: "一個罐子裡裝有糖果，小明先吃掉一半，小華再吃掉剩下的三分之一，最後剩下 10 顆糖果。請問原本有多少顆？", options: { a: "20", b: "30", c: "40", d: "60" }, correctAnswer: "b" }
        ]
    }
};
