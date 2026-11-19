
// ========================================
// PYTHAGORAS ADVENTURE
// app.js ฉบับปรับปรุง
// ========================================

const stages = [
    { title: "💡 สร้างความสนใจ", description: "" },
    { title: "🔍 สำรวจและค้นหา", description: "" },
    { title: "🧠 อธิบายและลงข้อสรุป", description: "" },
    { title: "🚀 ขยายความรู้", description: "" },
    { title: "🏆 ประเมินผล", description: "" }
];

let currentStage = 0;
let completedStages = [];

const activityArea = document.getElementById("activityArea");
const stageTitle = document.getElementById("stageTitle");
const stageDescription = document.getElementById("stageDescription");
const stageTag = document.getElementById("stageTag");
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");

// ========================================
// ข้อมูลสามเหลี่ยม
// ========================================

const triangleSets = [
    { sides: [3, 4, 5], names: ["A", "B", "C"] },
    { sides: [5, 12, 13], names: ["E", "F", "G"] },
    { sides: [8, 15, 17], names: ["M", "N", "O"] },
    { sides: [7, 24, 25], names: ["X", "Y", "Z"] }
];

const orientations = [
    { sx: 1, sy: -1 },
    { sx: -1, sy: 1 },
    { sx: -1, sy: -1 },
    { sx: 1, sy: 1 }
];

let triangleIndex = 0;
let exploration = {};

function currentTriangle() {
    return triangleSets[triangleIndex];
}

function getSideNames() {
    return currentTriangle().names.map(v => v.toLowerCase());
}

function shuffleArray(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

// ========================================
// จิ๊กซอว์สมการ
// ========================================

function createPuzzleTiles() {
    const [a, b, c] = getSideNames();

    return shuffleArray([
        { id: "c2", value: `${c}<sup class="puzzle-power">2</sup>`  },
        { id: "a2", value: `${a}<sup class="puzzle-power">2</sup>`  },
        { id: "b2", value: `${b}<sup class="puzzle-power">2</sup>`  },
        { id: "plus", value: "+" },

        { id: "a", value: a },
        { id: "b", value: b },
        { id: "c", value: c },

        { id: "d2", value: `d<sup class="puzzle-power">2</sup>` },
        { id: "minus", value: "−" },
        { id: "multiply", value: "×" },
        { id: "divide", value: "÷" }
    ]);
}

function resetExploration() {
    exploration = {
        questionAnswers: [null, null, null],

        lengthsDone: false,
        squaresDone: false,
        sumDone: false,
        puzzleDone: false,

        lengthNames: ["", "", ""],
        lengthValues: ["", "", ""],

        squareNames: ["", "", ""],
        squareLengths: ["", "", ""],
        squareValues: ["", "", ""],

        sumNames: ["", ""],
        sumLengths: ["", ""],
        sumSquares: ["", ""],
        sumValue: "",

        puzzleSlots: Array(4).fill(null),
        puzzleTiles: createPuzzleTiles()
    };
}

resetExploration();

// ========================================
// สัญลักษณ์มุมและส่วนของเส้นตรง
// ========================================

function angleNotation(vertexIndex) {
    const [A, B, C] = currentTriangle().names;

    let first, middle, last;

    if (vertexIndex === 0) {
        first = B;
        middle = A;
        last = C;
    } else if (vertexIndex === 1) {
        first = A;
        middle = B;
        last = C;
    } else {
        first = A;
        middle = C;
        last = B;
    }

    return `
        <span class="angle-symbol">
            <span>${first}</span>
            <span class="angle-middle">
                ${middle}
                <span class="angle-hat">^</span>
            </span>
            <span>${last}</span>
        </span>
    `;
}

function segmentNotation(first, second) {
    return `<span class="segment-symbol">${first}${second}</span>`;
}

// ========================================
// วาดสามเหลี่ยม
// ========================================

function triangleSVG() {
    const t = currentTriangle();
    const [a, b] = t.sides;
    const [A, B, C] = t.names;
    const [va, vb, vc] = getSideNames();
    const o = orientations[triangleIndex];

    const scale = Math.min(230 / Math.max(a, b), 180 / Math.min(a, b));

    const cx = 260;
    const cy = 220;

    const ax = cx + o.sx * b * scale;
    const ay = cy;

    const bx = cx;
    const by = cy + o.sy * a * scale;

    const centerX = (ax + bx + cx) / 3;
    const centerY = (ay + by + cy) / 3;

    function outsideLabel(x1, y1, x2, y2) {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;

        let nx = -(y2 - y1);
        let ny = x2 - x1;

        const length = Math.sqrt(nx * nx + ny * ny);
        nx /= length;
        ny /= length;

        const dot = nx * (centerX - mx) + ny * (centerY - my);

        if (dot > 0) {
            nx = -nx;
            ny = -ny;
        }

        return {
            x: mx + nx * 25,
            y: my + ny * 25
        };
    }

    const labelA = outsideLabel(bx, by, cx, cy);
    const labelB = outsideLabel(cx, cy, ax, ay);
    const labelC = outsideLabel(ax, ay, bx, by);

    const minX = Math.min(cx, ax, bx) - 65;
    const maxX = Math.max(cx, ax, bx) + 65;
    const minY = Math.min(cy, ay, by) - 55;
    const maxY = Math.max(cy, ay, by) + 55;

    return `
    <svg viewBox="${minX} ${minY} ${maxX - minX} ${maxY - minY}"
         width="100%" style="max-height:340px;display:block;">

        <polygon points="${ax},${ay} ${bx},${by} ${cx},${cy}"
            fill="#EAF5FF"
            stroke="#55A8DF"
            stroke-width="4"
            stroke-linejoin="round"/>

        <path d="
            M ${cx + o.sx * 17},${cy}
            L ${cx + o.sx * 17},${cy + o.sy * 17}
            L ${cx},${cy + o.sy * 17}
        " fill="none" stroke="#2674B8" stroke-width="3"/>

        <text x="${ax}" y="${ay - 14}"
            text-anchor="middle" fill="#D95C93"
            font-size="19" font-weight="bold">${A}</text>

        <text x="${bx}" y="${by + (o.sy === 1 ? 25 : -12)}"
            text-anchor="middle" fill="#D95C93"
            font-size="19" font-weight="bold">${B}</text>

        <text x="${cx + (o.sx === 1 ? -18 : 18)}"
            y="${cy + (o.sy === 1 ? -14 : 24)}"
            text-anchor="middle" fill="#D95C93"
            font-size="19" font-weight="bold">${C}</text>

        <text x="${labelA.x}" y="${labelA.y}"
            text-anchor="middle" dominant-baseline="middle"
            fill="#2674B8" font-size="15" font-weight="bold">${va} = ${a}</text>

        <text x="${labelB.x}" y="${labelB.y}"
            text-anchor="middle" dominant-baseline="middle"
            fill="#2674B8" font-size="15" font-weight="bold">${vb} = ${b}</text>

        <text x="${labelC.x}" y="${labelC.y}"
            text-anchor="middle" dominant-baseline="middle"
            fill="#2674B8" font-size="15" font-weight="bold">${vc} = ${Math.sqrt(a * a + b * b)}</text>
    </svg>`;
}

function nextTriangle() {
    triangleIndex = (triangleIndex + 1) % triangleSets.length;
    resetExploration();
    renderExploration();
}

// ========================================
// คำถามสำรวจ
// ========================================

function getQuestions() {
    const [A, B, C] = currentTriangle().names;

    return [
        {
            title: "สามเหลี่ยมรูปนี้มีมุมใดเป็นมุมฉาก",
            options: [
                angleNotation(0),
                angleNotation(1),
                angleNotation(2)
            ],
            answer: 2
        },
        {
            title: "ด้านใดเป็นด้านตรงข้ามมุมฉาก",
            options: [
                segmentNotation(A, B),
                segmentNotation(B, C),
                segmentNotation(C, A)
            ],
            answer: 0
        },
        {
            title: "ด้านใดเป็นด้านประกอบมุมฉาก",
            options: [
                `<span class="segment-pair">${segmentNotation(B, C)}<span>และ</span>${segmentNotation(C, A)}</span>`,
                `<span class="segment-pair">${segmentNotation(A, B)}<span>และ</span>${segmentNotation(A, C)}</span>`,
                `<span class="segment-pair">${segmentNotation(A, B)}<span>และ</span>${segmentNotation(B, C)}</span>`
            ],
            answer: 0
        }
    ];
}

function answerExplorationQuestion(questionIndex, optionIndex) {
    const questions = getQuestions();

    if (optionIndex === questions[questionIndex].answer) {
        exploration.questionAnswers[questionIndex] = optionIndex;
    } else {
        alert("ยังไม่ถูกต้อง ลองพิจารณารูปสามเหลี่ยมอีกครั้ง");
    }

    renderExploration();
}

// ========================================
// ช่องเลือกและช่องกรอก
// ========================================

function sideSelect(id, selected = "", disabled = false) {
    const names = getSideNames();

    return `
        <select id="${id}" class="math-select" ${disabled ? "disabled" : ""}>
            <option value="">เลือกด้าน</option>
            ${names.map(name => `
                <option value="${name}" ${selected === name ? "selected" : ""}>
                    ${name}
                </option>
            `).join("")}
        </select>
    `;
}

function numberInput(id, value = "", disabled = false, extraClass = "") {
    return `
        <input id="${id}" class="math-input ${extraClass}"
            type="number" min="0" step="1"
            value="${value}" ${disabled ? "disabled" : ""}>
    `;
}

function answerLine(selectId, selected, inputId, value, disabled) {
    return `
        <div class="answer-line">
            ${sideSelect(selectId, selected, disabled)}
            <b>=</b>
            ${numberInput(inputId, value, disabled)}
        </div>
    `;
}

// ========================================
// ตรวจความยาวด้าน
// ========================================

function checkLengths() {
    const [a, b, c] = currentTriangle().sides;
    const names = getSideNames();

    const selected = [
        document.getElementById("lengthNameA").value,
        document.getElementById("lengthNameB").value,
        document.getElementById("lengthNameC").value
    ];

    const values = [
        document.getElementById("lengthA").value.trim(),
        document.getElementById("lengthB").value.trim(),
        document.getElementById("lengthC").value.trim()
    ];

    if (selected.some(v => !v) || values.some(v => v === "")) {
        alert("กรุณาเลือกชื่อด้านและกรอกความยาวให้ครบทั้ง 3 ด้าน");
        return;
    }

    const firstCorrect =
        (selected[0] === names[0] && Number(values[0]) === a) ||
        (selected[0] === names[1] && Number(values[0]) === b);

    const secondCorrect =
        (selected[1] === names[0] && Number(values[1]) === a) ||
        (selected[1] === names[1] && Number(values[1]) === b);

    const correct =
        firstCorrect &&
        secondCorrect &&
        selected[0] !== selected[1] &&
        selected[2] === names[2] &&
        Number(values[2]) === c;

    if (!correct) {
        alert("คำตอบยังไม่ถูกต้อง ลองตรวจสอบชื่อด้านและความยาวอีกครั้ง");
        return;
    }

    exploration.lengthNames = selected;
    exploration.lengthValues = values;
    exploration.lengthsDone = true;

    renderExploration();
}

// ========================================
// ตรวจคำตอบกำลังสอง
// ========================================

function checkSquares() {
    const [a, b, c] = currentTriangle().sides;
    const names = getSideNames();

    const selected = [
        document.getElementById("squareNameA").value,
        document.getElementById("squareNameB").value,
        document.getElementById("squareNameC").value
    ];

    const lengths = [
        document.getElementById("squareLengthA").value.trim(),
        document.getElementById("squareLengthB").value.trim(),
        document.getElementById("squareLengthC").value.trim()
    ];

    const values = [
        document.getElementById("squareA").value.trim(),
        document.getElementById("squareB").value.trim(),
        document.getElementById("squareC").value.trim()
    ];

    if (selected.some(v => !v) ||
        lengths.some(v => v === "") ||
        values.some(v => v === "")) {
        alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
        return;
    }

    function isCorrectLeg(name, length, square) {
        if (name === names[0]) {
            return Number(length) === a && Number(square) === a ** 2;
        }

        if (name === names[1]) {
            return Number(length) === b && Number(square) === b ** 2;
        }

        return false;
    }

    const firstCorrect = isCorrectLeg(selected[0], lengths[0], values[0]);
    const secondCorrect = isCorrectLeg(selected[1], lengths[1], values[1]);

    const thirdCorrect =
        selected[2] === names[2] &&
        Number(lengths[2]) === c &&
        Number(values[2]) === c ** 2;

    const correct =
        firstCorrect &&
        secondCorrect &&
        selected[0] !== selected[1] &&
        thirdCorrect;

    if (!correct) {
        alert("คำตอบยังไม่ถูกต้อง ลองตรวจสอบอีกครั้ง");
        return;
    }

    exploration.squareNames = selected;
    exploration.squareLengths = lengths;
    exploration.squareValues = values;
    exploration.squaresDone = true;

    renderExploration();
}

// ========================================
// ตรวจผลบวก
// ========================================

function checkSum() {
    const [a, b] = currentTriangle().sides;
    const names = getSideNames();

    const selected = [
        document.getElementById("sumNameA").value,
        document.getElementById("sumNameB").value
    ];

    const lengths = [
        document.getElementById("sumLengthA").value.trim(),
        document.getElementById("sumLengthB").value.trim()
    ];

    const squares = [
        document.getElementById("sumSquareA").value.trim(),
        document.getElementById("sumSquareB").value.trim()
    ];

    const result = document.getElementById("sumAnswer").value.trim();

    if (
        selected.some(v => !v) ||
        lengths.some(v => v === "") ||
        squares.some(v => v === "") ||
        result === ""
    ) {
        alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
        return;
    }

    function isCorrectLeg(name, length, square) {
        if (name === names[0]) {
            return Number(length) === a && Number(square) === a ** 2;
        }

        if (name === names[1]) {
            return Number(length) === b && Number(square) === b ** 2;
        }

        return false;
    }

    const correct =
        isCorrectLeg(selected[0], lengths[0], squares[0]) &&
        isCorrectLeg(selected[1], lengths[1], squares[1]) &&
        selected[0] !== selected[1] &&
        Number(result) === a ** 2 + b ** 2;

    if (!correct) {
        alert("คำตอบยังไม่ถูกต้อง ลองตรวจสอบชื่อด้าน ความยาว กำลังสอง และผลบวก");
        return;
    }

    exploration.sumNames = selected;
    exploration.sumLengths = lengths;
    exploration.sumSquares = squares;
    exploration.sumValue = result;
    exploration.sumDone = true;

    renderExploration();
}

// ========================================
// ระบบจิ๊กซอว์
// ========================================

function usePuzzleTile(tileId) {
    if (exploration.puzzleDone) return;
    if (exploration.puzzleSlots.includes(tileId)) return;

    const emptyIndex = exploration.puzzleSlots.indexOf(null);

    if (emptyIndex === -1) {
        alert("ช่องสมการเต็มแล้ว คลิกช่องที่ต้องการนำออกก่อน");
        return;
    }

    exploration.puzzleSlots[emptyIndex] = tileId;
    renderExploration();
}

function removePuzzleTile(slotIndex) {
    if (exploration.puzzleDone) return;

    exploration.puzzleSlots[slotIndex] = null;
    renderExploration();
}

function checkPuzzle() {
    const slots = exploration.puzzleSlots;

    if (slots.some(v => v === null)) {
        alert("กรุณาเติมจิ๊กซอว์ให้ครบทุกช่องก่อน");
        return;
    }

    const correct =
        slots[0] === "c2" &&
        slots[2] === "plus" &&
        (
            (slots[1] === "a2" && slots[3] === "b2") ||
            (slots[1] === "b2" && slots[3] === "a2")
        );

    if (!correct) {
        alert("สมการยังไม่ถูกต้อง ลองเรียงจิ๊กซอว์ใหม่อีกครั้ง");
        return;
    }

    exploration.puzzleDone = true;
    renderExploration();
}

// ========================================
// ดึงสมการจากจิ๊กซอว์จริง
// ========================================

function getPuzzleEquation() {
    const tileMap = Object.fromEntries(
        exploration.puzzleTiles.map(tile => [tile.id, tile])
    );

    return exploration.puzzleSlots.map(id => tileMap[id]?.value || "");
}

function renderPuzzle() {
    const tileMap = Object.fromEntries(
        exploration.puzzleTiles.map(tile => [tile.id, tile])
    );

    return `
        <div class="puzzle-area">

            <div class="puzzle-slots">

                ${exploration.puzzleSlots.map((id, index) => `
                    <button class="puzzle-slot ${id ? "filled" : ""}"
                        onclick="removePuzzleTile(${index})"
                        ${exploration.puzzleDone ? "disabled" : ""}>
                        ${id ? tileMap[id].value : ""}
                    </button>

                    ${index === 0 ? `<span class="puzzle-equals">=</span>` : ""}
                `).join("")}

            </div>

            <p class="puzzle-instruction">
                เครื่องหมายเท่ากับกำหนดไว้แล้ว เลือกจิ๊กซอว์มาเติมสมการให้ถูกต้อง
            </p>

            <div class="puzzle-bank">
                ${exploration.puzzleTiles.map(tile => {
                    const used = exploration.puzzleSlots.includes(tile.id);

                    return `
                        <button class="puzzle-tile ${used ? "tile-used" : ""}"
                            onclick="usePuzzleTile('${tile.id}')"
                            ${used || exploration.puzzleDone ? "disabled" : ""}>
                            ${tile.value}
                        </button>
                    `;
                }).join("")}
            </div>

            ${!exploration.puzzleDone ? `
                <button class="check-button" onclick="checkPuzzle()">
                    ตรวจสอบสมการ
                </button>
            ` : `
                <p class="correct-message">✓ ถูกต้อง</p>
            `}

        </div>
    `;
}

// ========================================
// แสดงกิจกรรมขั้นที่ 2
// ========================================

function renderExploration() {
    const [a, b, c] = currentTriangle().sides;
    const [A, B, C] = currentTriangle().names;
    const [va, vb, vc] = getSideNames();

    const questions = getQuestions();
    const questionsDone = exploration.questionAnswers.every(v => v !== null);

    // สมการนี้ดึงมาจากจิ๊กซอว์ที่นักเรียนเลือกจริง
    const puzzleEquation = exploration.puzzleDone
        ? getPuzzleEquation()
        : [];

    activityArea.innerHTML = `
    <div class="explorer-layout">

        <section class="explorer-panel">

            <h3 class="explorer-heading">🔍 สำรวจสามเหลี่ยมมุมฉาก</h3>

            <button class="change-triangle-button" onclick="nextTriangle()">
                🔄 เปลี่ยนรูปสามเหลี่ยม
            </button>

            <div class="triangle-display">
                ${triangleSVG()}
            </div>

            ${exploration.puzzleDone ? `
                <div class="triangle-conclusion">
                    <div class="conclusion-title">🎉 ค้นพบความสัมพันธ์แล้ว</div>

                    <div class="conclusion-formula">
                        <span>${puzzleEquation[0]}</span>
                        <span>=</span>
                        <span>${puzzleEquation[1]}</span>
                        <span>${puzzleEquation[2]}</span>
                        <span>${puzzleEquation[3]}</span>
                    </div>

                    <p>
                        กำลังสองของความยาวของด้านตรงข้ามมุมฉาก
                        เท่ากับผลบวกของกำลังสองของความยาวของด้านประกอบมุมฉาก
                    </p>
                </div>
            ` : ""}

            <hr class="explorer-divider">

            <h3 class="explorer-heading">คำถามสำรวจ</h3>

            ${questions.map((q, i) => `
                <div class="question-card">
                    <b class="question-title">${i + 1}. ${q.title}</b>

                    <div class="question-options">
                        ${q.options.map((option, j) => `
                            <button class="question-option"
                                onclick="answerExplorationQuestion(${i},${j})"
                                style="background:${
                                    exploration.questionAnswers[i] === j
                                        ? "#C9F0D7" : "white"
                                };">
                                ${option}
                            </button>
                        `).join("")}
                    </div>

                    ${exploration.questionAnswers[i] !== null
                        ? `<p class="correct-message">✓ ถูกต้อง</p>`
                        : ""}
                </div>
            `).join("")}

            ${questionsDone
                ? `<p class="correct-message">✓ ถูกต้อง</p>`
                : `<p class="question-hint">ตอบคำถามให้ถูกครบทั้ง 3 ข้อ เพื่อปลดล็อกตารางบันทึกทางขวา</p>`
            }

        </section>

        <section class="explorer-panel">

            <h3 class="explorer-heading">📋 ตารางบันทึกการค้นพบ</h3>

            ${!questionsDone ? `
                <div class="locked-table">
                    🔒 ตอบคำถามฝั่งซ้ายให้ถูกต้องก่อน
                    <br>ตารางบันทึกจึงจะปรากฏ
                </div>
            ` : `

                <h4>ความยาวของด้าน</h4>

                <div class="answer-group">
                    <div class="answer-group-title">
                        ความยาวของด้านประกอบมุมฉาก (2 ด้าน)
                    </div>

                    ${answerLine("lengthNameA", exploration.lengthNames[0], "lengthA", exploration.lengthValues[0], exploration.lengthsDone)}
                    ${answerLine("lengthNameB", exploration.lengthNames[1], "lengthB", exploration.lengthValues[1], exploration.lengthsDone)}
                </div>

                <div class="answer-group">
                    <div class="answer-group-title">
                        ความยาวของด้านตรงข้ามมุมฉาก
                    </div>

                    ${answerLine("lengthNameC", exploration.lengthNames[2], "lengthC", exploration.lengthValues[2], exploration.lengthsDone)}
                </div>

                ${!exploration.lengthsDone ? `
                    <button class="check-button" onclick="checkLengths()">
                        ตรวจคำตอบความยาวด้าน
                    </button>
                ` : `<p class="correct-message">✓ ถูกต้อง</p>`}

                ${exploration.lengthsDone ? `
                    <hr class="explorer-divider">
                    <h4>กำลังสองของความยาวด้าน</h4>

                    <div class="answer-group">
                        <div class="answer-group-title">
                            กำลังสองของความยาวของด้านประกอบมุมฉาก
                        </div>

                        <div class="square-answer-line">
                            ${sideSelect("squareNameA", exploration.squareNames[0], exploration.squaresDone)}
                            <sup>2</sup><b>=</b>
                            ${numberInput("squareLengthA", exploration.squareLengths[0], exploration.squaresDone, "side-length-input")}
                            <sup>2</sup><b>=</b>
                            ${numberInput("squareA", exploration.squareValues[0], exploration.squaresDone, "square-result-input")}
                        </div>

                        <div class="square-answer-line">
                            ${sideSelect("squareNameB", exploration.squareNames[1], exploration.squaresDone)}
                            <sup>2</sup><b>=</b>
                            ${numberInput("squareLengthB", exploration.squareLengths[1], exploration.squaresDone, "side-length-input")}
                            <sup>2</sup><b>=</b>
                            ${numberInput("squareB", exploration.squareValues[1], exploration.squaresDone, "square-result-input")}
                        </div>
                    </div>

                    <div class="answer-group">
                        <div class="answer-group-title">
                            กำลังสองของความยาวของด้านตรงข้ามมุมฉาก
                        </div>

                        <div class="square-answer-line">
                            ${sideSelect("squareNameC", exploration.squareNames[2], exploration.squaresDone)}
                            <sup>2</sup><b>=</b>
                            ${numberInput("squareLengthC", exploration.squareLengths[2], exploration.squaresDone, "side-length-input")}
                            <sup>2</sup><b>=</b>
                            ${numberInput("squareC", exploration.squareValues[2], exploration.squaresDone, "square-result-input")}
                        </div>
                    </div>

                    ${!exploration.squaresDone ? `
                        <button class="check-button" onclick="checkSquares()">
                            ตรวจคำตอบกำลังสอง
                        </button>
                    ` : `<p class="correct-message">✓ ถูกต้อง</p>`}
                ` : ""}

                ${exploration.squaresDone ? `
                    <hr class="explorer-divider">

                    <h4>ผลบวกของกำลังสองของความยาวด้านประกอบมุมฉาก</h4>


<div class="answer-group sum-grid">

    <!-- บรรทัดที่ 1: ตัวแปรกำลังสอง -->
    <div class="sum-grid-row">
        <span class="sum-equals"></span>

        <div class="sum-term">
            ${sideSelect("sumNameA", exploration.sumNames[0], exploration.sumDone)}
            <sup>2</sup>
        </div>

        <b class="sum-operator">+</b>

        <div class="sum-term">
            ${sideSelect("sumNameB", exploration.sumNames[1], exploration.sumDone)}
            <sup>2</sup>
        </div>
    </div>

    <!-- บรรทัดที่ 2: แทนค่าความยาวด้าน -->
    <div class="sum-grid-row">
        <b class="sum-equals">=</b>

        <div class="sum-term">
            ${numberInput("sumLengthA", exploration.sumLengths[0], exploration.sumDone)}
            <sup>2</sup>
        </div>

        <b class="sum-operator">+</b>

        <div class="sum-term">
            ${numberInput("sumLengthB", exploration.sumLengths[1], exploration.sumDone)}
            <sup>2</sup>
        </div>
    </div>

    <!-- บรรทัดที่ 3: คำนวณกำลังสอง -->
    <div class="sum-grid-row">
        <b class="sum-equals">=</b>

        <div class="sum-term">
            ${numberInput("sumSquareA", exploration.sumSquares[0], exploration.sumDone)}
        </div>

        <b class="sum-operator">+</b>

        <div class="sum-term">
            ${numberInput("sumSquareB", exploration.sumSquares[1], exploration.sumDone)}
        </div>
    </div>

    <!-- บรรทัดที่ 4: ผลลัพธ์ -->
    <div class="sum-grid-row">
        <b class="sum-equals">=</b>

        <div class="sum-final">
            ${numberInput("sumAnswer", exploration.sumValue, exploration.sumDone)}
        </div>
    </div>

</div>


                    ${!exploration.sumDone ? `
                        <button class="check-button" onclick="checkSum()">
                            ตรวจคำตอบผลบวก
                        </button>
                    ` : `<p class="correct-message">✓ ถูกต้อง</p>`}
                ` : ""}

                ${exploration.sumDone ? `
                    <hr class="explorer-divider">

                    <h4>
                        พิจารณาความสัมพันธ์ระหว่างความยาวของด้านทั้งสามของรูปสามเหลี่ยมมุมฉาก
                    </h4>

                    <p class="puzzle-instruction">
                        เติมจิ๊กซอว์ให้เป็นสมการที่ถูกต้อง โดยเครื่องหมายเท่ากับกำหนดไว้แล้ว
                    </p>

                    ${renderPuzzle()}
                ` : ""}

            `}

        </section>
    </div>

    <style>
        .explorer-layout {
            display:grid;
            grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));
            gap:20px;
            align-items:start;
        }

        .explorer-panel {
            background:white;
            border:1px solid #D5E9FA;
            border-radius:18px;
            padding:18px;
            min-width:0;
        }

        .explorer-heading {
            color:#287CB5;
            margin:0 0 14px;
        }

        .change-triangle-button {
            width:100%;
            padding:13px;
            background:#61B5E8;
            color:white;
            border:0;
            border-radius:12px;
            font-size:16px;
            cursor:pointer;
        }

        .triangle-display {
            margin:15px 0;
            width:100%;
        }

        .triangle-conclusion {
            background:#EAF5FF;
            border:1px solid #B9DDF5;
            border-radius:13px;
            padding:15px;
            text-align:center;
            margin:12px 0;
        }

        .conclusion-title {
            color:#21834B;
            font-weight:bold;
            margin-bottom:10px;
        }

        .conclusion-formula {
            display:flex;
            justify-content:center;
            align-items:center;
            gap:12px;
            flex-wrap:nowrap;
            font-size:27px;
            color:#287CB5;
            font-weight:bold;
            padding:12px 4px;
            background:white;
            border:1px solid #B9DDF5;
            border-radius:10px;
        }

        .triangle-conclusion p {
            color:#526B80;
            font-size:13px;
            margin-bottom:0;
        }

        .explorer-divider {
            border:0;
            border-top:1px solid #DCEAF5;
            margin:18px 0;
        }

        .question-card {
            background:#EAF5FF;
            border:1px solid #C9E5FF;
            padding:14px;
            margin:12px 0;
            border-radius:12px;
        }

        .question-title {
            display:block;
            color:#315C7D;
            line-height:1.6;
        }

        .question-options {
            display:grid;
            grid-template-columns:1fr;
            gap:9px;
            margin-top:12px;
        }

        .question-option {
            display:flex;
            justify-content:center;
            align-items:center;
            width:100%;
            min-height:54px;
            box-sizing:border-box;
            padding:10px;
            border-radius:9px;
            border:1px solid #B9DDF5;
            color:#315C7D;
            cursor:pointer;
            font-size:16px;
            line-height:1;
        }

        .angle-symbol {
            display:inline-flex;
            align-items:center;
            justify-content:center;
            height:34px;
            line-height:1;
            font-size:19px;
            font-weight:600;
            letter-spacing:1px;
        }

        .angle-middle {
            position:relative;
            display:inline-flex;
            align-items:center;
            justify-content:center;
            width:17px;
            height:34px;
        }

        .angle-hat {
            position:absolute;
            top:-8px;
            left:50%;
            transform:translateX(-50%);
            font-size:22px;
            font-weight:bold;
        }

        .segment-symbol {
            display:inline-block;
            text-decoration:overline;
            text-decoration-thickness:2px;
            font-size:17px;
            padding-top:3px;
        }

        .segment-pair {
            display:inline-flex;
            justify-content:center;
            align-items:center;
            gap:16px;
        }

        .segment-pair span:not(.segment-symbol) {
            font-size:14px;
            color:#64748B;
        }

        .question-hint {
            color:#718096;
            font-size:13px;
        }

        .locked-table {
            background:#F1F7FC;
            border-radius:12px;
            padding:35px 15px;
            text-align:center;
            color:#7892A8;
        }

        .answer-group {
            background:#EAF5FF;
            border-radius:12px;
            padding:14px;
            margin:10px 0;
            min-width:0;
        }

        .answer-group-title {
            text-align:center;
            font-weight:bold;
            color:#315C7D;
            margin-bottom:13px;
            line-height:1.5;
        }

        .answer-line {
            display:flex;
            align-items:center;
            justify-content:center;
            gap:12px;
            margin:9px 0;
        }

        .math-select,
        .math-input {
            box-sizing:border-box;
            height:42px;
            border:1px solid #CBD5E1;
            border-radius:8px;
            background:white;
            color:#263B50;
            font-size:15px;
            text-align:center;
        }

        .math-select {
            width:85px;
            min-width:0;
            padding:5px 3px;
            font-size:14px;
            appearance:none;
            -webkit-appearance:none;
            -moz-appearance:none;
            background-image:none;
        }

        .math-input {
            width:90px;
            min-width:0;
            padding:6px;
        }

        .math-input:disabled,
        .math-select:disabled {
            background:#F0FDF4;
            color:#315C7D;
            opacity:1;
        }

        .answer-line .math-select {
            width:105px;
        }

        .answer-line .math-input {
            width:120px;
        }

        /* กำลังสอง: ช่องความยาวด้านแคบลง */
        .square-answer-line {
            display:flex;
            flex-wrap:nowrap;
            align-items:center;
            justify-content:center;
            gap:7px;
            margin:14px 0;
            min-width:0;
        }

        .square-answer-line .math-select {
            width:62px;
            flex:0 0 62px;
        }

        .square-answer-line .side-length-input {
            width:65px;
            flex:0 0 65px;
        }

        .square-answer-line .square-result-input {
            width:55px;
            flex:0 0 78px;
        }

        .square-answer-line sup,
        .sum-line sup {
            display:inline-block;
            font-size:0.9em;
            line-height:1;
            vertical-align:super;
            position:relative;
            top:-0.4em;
            margin-left:-5px;
            font-weight:800;
            color:#315C7D;
        }

        .square-answer-line b,
        .sum-line b {
            white-space:nowrap;
            color:#315C7D;
            font-size:16px;
        }

        /* ผลบวก */
        .sum-line {
            display:flex;
            flex-wrap:nowrap;
            align-items:center;
            justify-content:center;
            gap:7px;
            margin:16px 0;
            min-width:0;
            white-space:nowrap;
        }

        .sum-line .math-select {
            width:65px;
            flex:0 0 65px;
        }

        .sum-line .math-input {
            width:85px;
            flex:0 0 85px;
        }

        .sum-line-result .math-input {
            width:85px;
            flex:0 0 85px;
        }

        .check-button {
            margin-top:10px;
            padding:11px 18px;
            background:#61B5E8;
            color:white;
            border:0;
            border-radius:9px;
            cursor:pointer;
            font-size:15px;
        }

        .correct-message {
            color:#21834B;
            font-weight:bold;
            margin:12px 0;
        }

        /* จิ๊กซอว์ */
        .puzzle-area {
            background:#F1F7FC;
            padding:14px;
            border-radius:12px;
        }

        .puzzle-slots {
            display:grid;
            grid-template-columns:minmax(40px,1fr) 25px minmax(40px,1fr) minmax(40px,1fr) minmax(40px,1fr);
            align-items:center;
            gap:5px;
            margin:15px 0;
        }

        .puzzle-slot {
            min-width:0;
            height:48px;
            background:white;
            border:2px dashed #A9CFEA;
            border-radius:8px;
            font-size:19px;
            font-weight:bold;
            color:#287CB5;
            cursor:pointer;
        }

        .puzzle-slot.filled {
            border-style:solid;
            background:#E2F2FF;
        }

        .puzzle-slot:disabled {
            opacity:1;
            cursor:default;
        }

        .puzzle-equals {
            text-align:center;
            font-size:20px;
            font-weight:bold;
            color:#315C7D;
        }

        .puzzle-instruction {
            font-size:13px;
            color:#718096;
            margin:10px 0;
        }

        .puzzle-bank {
            display:flex;
            flex-wrap:wrap;
            justify-content:center;
            gap:8px;
            margin:14px 0;
        }

        .puzzle-tile {
            min-width:45px;
            height:44px;
            padding:5px 12px;
            background:white;
            border:1px solid #9CC8E8;
            border-radius:9px;
            color:#287CB5;
            font-size:19px;
            font-weight:bold;
            cursor:pointer;
        }
            .puzzle-power {
    font-size: 0.75em;
    font-weight: 700;
    vertical-align: super;
    position: relative;
    top: -0.1em;
    margin-left: 1px;
}

        .puzzle-tile.tile-used {
            opacity:0.25;
            cursor:default;
        }

        @media(max-width:480px) {
            .explorer-panel {
                padding:12px;
            }

            .square-answer-line {
                gap:5px;
                justify-content:center;
            }

            .square-answer-line .math-select {
                width:52px;
                flex:0 0 52px;
                font-size:13px;
            }

            .square-answer-line .side-length-input {
                width:55px;
                flex:0 0 55px;
                font-size:14px;
            }

            .square-answer-line .square-result-input {
                width:68px;
                flex:0 0 68px;
                font-size:14px;
            }

            .square-answer-line b,
            .sum-line b {
                font-size:14px;
            }

            .sum-line {
                justify-content:flex-start;
                gap:5px;
                overflow-x:auto;
            }

            .sum-line .math-select {
                width:55px;
                flex:0 0 55px;
            }

            .sum-line .math-input {
                width:68px;
                flex:0 0 68px;
            }

            .sum-line-result .math-input {
                width:75px;
                flex:0 0 75px;
            }

            .conclusion-formula {
                gap:8px;
                font-size:23px;
            }

            .puzzle-slots {
                gap:3px;
            }

            .puzzle-slot {
                height:42px;
                font-size:16px;
            }
        }
    </style>
    `;
}

// ========================================
// ขั้นที่ 1 และขั้นอื่น
// ========================================

function toggleElaborationAnswer(id) {
    const answer = document.getElementById(id);
    const button = document.getElementById("button-" + id);

    if (!answer || !button) return;

    const isOpen = answer.classList.toggle("show-answer");
    button.textContent = isOpen ? "ปิดเฉลย" : "กดเพื่อเปิดเฉลย";
}



function renderElaboration() {
    activityArea.innerHTML = `
        <div class="elaboration-container">

            <div class="elaboration-heading">
                <h2>กิจกรรมขยายความรู้</h2>
                <p>จงหาความยาวของด้านใดด้านหนึ่งของรูปสามเหลี่ยมมุมฉาก เมื่อกำหนดความยาวของด้านอีกสองด้านให้</p>
            </div>

            <!-- ข้อ 1 -->
            <section class="elaboration-question">
                <h3>ข้อ 1 จากรูปสามเหลี่ยมมุมฉากที่กำหนดให้ จงหาความยาวของ c</h3>

                <div class="elaboration-triangle">
                    <svg viewBox="0 0 280 190">
                        <path d="M65 20 L65 145 L235 145 Z"
                              fill="none" stroke="#2563eb"
                              stroke-width="3" stroke-linejoin="round"/>
                        <path d="M65 132 L78 132 L78 145"
                              fill="none" stroke="#333" stroke-width="2"/>

                        <text x="43" y="88" font-size="18">9</text>
                        <text x="145" y="170" font-size="18">12</text>
                        <text x="157" y="72" font-size="18">c</text>
                    </svg>
                </div>

                <button class="elaboration-button"
                    onclick="toggleElaborationAnswer('elaboration-answer-1')">
                    กดเพื่อเปิดเฉลย
                </button>

                <div id="elaboration-answer-1" class="elaboration-answer">
                    <h4>เฉลยข้อ 1</h4>
                    <p><strong>ขั้นที่ 1:</strong> พิจารณารูปสามเหลี่ยมมุมฉาก</p>
                    <p>ด้านที่ยาว 9 และ 12 เป็นด้านประกอบมุมฉาก ส่วนด้าน c เป็นด้านตรงข้ามมุมฉาก</p>

                    <p><strong>ขั้นที่ 2:</strong> ใช้ทฤษฎีบทพีทาโกรัส</p>
                    <p>c² = 9² + 12²</p>
                    <p>c² = 81 + 144</p>
                    <p>c² = 225</p>

                    <p><strong>ขั้นที่ 3:</strong> ถอดรากที่สองทั้งสองข้าง</p>
                    <p>c = <span class="math-root"><span>225</span></span></p>
                    <p>c = 15</p>

                    <p class="elaboration-result">
                        ตอบ ด้าน c ยาว 15 หน่วย
                    </p>
                </div>
            </section>

            <!-- ข้อ 2 -->
            <section class="elaboration-question">
                <h3>ข้อ 2 จากรูปสามเหลี่ยมมุมฉากที่กำหนดให้ จงหาความยาวของ b</h3>

                <div class="elaboration-triangle">
                    <svg viewBox="0 0 280 190">
                        <path d="M45 35 L235 35 L140 155 Z"
                              fill="none" stroke="#2563eb"
                              stroke-width="3" stroke-linejoin="round"/>
                        <path d="M130 142 L140 134 L148 145"
                              fill="none" stroke="#333" stroke-width="2"/>

                        <text x="132" y="23" font-size="18">17</text>
                        <text x="60" y="100" font-size="18">b</text>
                        <text x="202" y="100" font-size="18">15</text>
                    </svg>
                </div>

                <button class="elaboration-button"
                    onclick="toggleElaborationAnswer('elaboration-answer-2')">
                    กดเพื่อเปิดเฉลย
                </button>

                <div id="elaboration-answer-2" class="elaboration-answer">
                    <h4>เฉลยข้อ 2</h4>
                    <p><strong>ขั้นที่ 1:</strong> พิจารณารูปสามเหลี่ยมมุมฉาก</p>
                    <p>ด้านยาว 17 เป็นด้านตรงข้ามมุมฉาก ส่วนด้าน b และ 15 เป็นด้านประกอบมุมฉาก</p>

                    <p><strong>ขั้นที่ 2:</strong> ใช้ทฤษฎีบทพีทาโกรัส</p>
                    <p>17² = b² + 15²</p>
                    <p>289 = b² + 225</p>
                    <p>b² = 289 - 225</p>
                    <p>b² = 64</p>

                    <p><strong>ขั้นที่ 3:</strong> ถอดรากที่สองทั้งสองข้าง</p>
                    <p>b = <span class="math-root"><span>64</span></span></p>
                    <p>b = 8</p>

                    <p class="elaboration-result">
                        ตอบ ด้าน b ยาว 8 หน่วย
                    </p>
                </div>
            </section>

        </div>
    `;
}

/* ฟังก์ชันเปิดและปิดเฉลย */
function toggleElaborationAnswer(id) {
    const answer = document.getElementById(id);
    const button = document.querySelector(
        `[onclick="toggleElaborationAnswer('${id}')"]`
    );

    if (!answer || !button) return;

    const isOpen = answer.classList.toggle("show-answer");

    button.textContent = isOpen
        ? "ปิดเฉลย"
        : "กดเพื่อเปิดเฉลย";
}




const assessmentQuestions = [
    {
        title: "ข้อ 1 ข้อใดเขียนสมการที่แสดงความสัมพันธ์ระหว่างความยาวของด้านทั้งสามของรูปสามเหลี่ยมมุมฉากได้ถูกต้อง",
        diagram: `
            <svg viewBox="0 0 240 150">
                <path d="M45 15 L45 115 L190 115 Z" fill="none" stroke="#333" stroke-width="2.5"/>
                <path d="M45 103 L57 103 L57 115" fill="none" stroke="#333" stroke-width="1.5"/>
                <text x="32" y="70" font-size="16">a</text>
                <text x="112" y="135" font-size="16">c</text>
                <text x="112" y="53" font-size="16">b</text>
            </svg>`,
        options: [
            "a² = b² + c²",
            "b² = a² + c²",
            "b² = a² − c²",
            "c² = a² + b²"
        ],
        correct: 1,
        explanation: "ด้าน b เป็นด้านตรงข้ามมุมฉาก จึงเป็นด้านที่ยาวที่สุดและต้องยกกำลังสองเท่ากับผลบวกของกำลังสองของอีกสองด้าน ดังนั้น b² = a² + c²"
    },
    {
        title: "ข้อ 2 ข้อใดเขียนสมการที่แสดงความสัมพันธ์ระหว่างความยาวของด้านทั้งสามของรูปสามเหลี่ยมมุมฉากได้ถูกต้อง",
        diagram: `
            <svg viewBox="0 0 240 150">
                <path d="M35 115 L165 115 L165 15 Z" fill="none" stroke="#333" stroke-width="2.5"/>
                <path d="M153 115 L153 103 L165 103" fill="none" stroke="#333" stroke-width="1.5"/>
                <text x="95" y="135" font-size="16">z</text>
                <text x="174" y="70" font-size="16">y</text>
                <text x="91" y="55" font-size="16">x</text>
            </svg>`,
        options: [
            "z² = x² + y²",
            "y² = x² + z²",
            "x² = y² + z²",
            "z² = y² − x²"
        ],
        correct: 2,
        explanation: "ด้าน x เป็นด้านตรงข้ามมุมฉาก จึงเป็นด้านตรงข้ามมุมฉาก ดังนั้น x² = y² + z²"
    },
    {
        title: "ข้อ 3 ข้อใดเขียนสมการที่แสดงความสัมพันธ์ระหว่างความยาวของด้านทั้งสามของรูปสามเหลี่ยมมุมฉากได้ถูกต้อง",
        diagram: `
            <svg viewBox="0 0 240 150">
                <path d="M35 35 L165 35 L165 125 Z" fill="none" stroke="#333" stroke-width="2.5"/>
                <path d="M153 35 L153 47 L165 47" fill="none" stroke="#333" stroke-width="1.5"/>
                <text x="95" y="23" font-size="16">4</text>
                <text x="175" y="83" font-size="16">3</text>
                <text x="85" y="91" font-size="16">k</text>
            </svg>`,
        options: [
            "k² = 4² + 3²",
            "k² = 4² − 3²",
            "3² = 4² + k²",
            "4² = 3² + k²"
        ],
        correct: 0,
        explanation: "ด้าน k อยู่ตรงข้ามมุมฉาก จึงเป็นด้านตรงข้ามมุมฉาก ใช้ทฤษฎีบทพีทาโกรัสได้ว่า k² = 4² + 3²"
    },
    {
        title: "ข้อ 4 ข้อใดเขียนสมการที่แสดงความสัมพันธ์ระหว่างความยาวของด้านทั้งสามของรูปสามเหลี่ยมมุมฉาก ABC ได้ถูกต้อง",
        diagram: `
            <svg viewBox="0 0 240 150">
                <path d="M35 120 L115 18 L205 120 Z" fill="none" stroke="#333" stroke-width="2.5"/>
                <path d="M106 30 L117 39 L126 28" fill="none" stroke="#333" stroke-width="1.5"/>
                <text x="23" y="132" font-size="16">A</text>
                <text x="110" y="15" font-size="16">B</text>
                <text x="207" y="132" font-size="16">C</text>
            </svg>`,
        options: [
            "CB² = AB² + AC²",
            "AC² = AB² + CB²",
            "AB² = AC² + CB²",
            "AC² = AB² − CB²"
        ],
        correct: 1,
        explanation: "มุม B เป็นมุมฉาก ดังนั้นด้าน AC ซึ่งอยู่ตรงข้ามมุม B เป็นด้านตรงข้ามมุมฉาก จึงได้ AC² = AB² + CB²"
    },
    
    {
        title: "ข้อ 5 ข้อใดเขียนสมการที่แสดงความสัมพันธ์ระหว่างความยาวของด้านทั้งสามของรูปสามเหลี่ยมมุมฉากได้ถูกต้อง",
        diagram: `
            <svg viewBox="0 0 240 150">
                <path d="M35 75 L145 25 L175 125 Z"
                      fill="none" stroke="#333" stroke-width="2.5"
                      stroke-linejoin="round"/>
                <path d="M133 31 L139 44 L152 38"
                      fill="none" stroke="#333" stroke-width="1.5"/>

                <text x="82" y="37" font-size="16">t</text>
                <text x="174" y="82" font-size="16">g</text>
                <text x="98" y="112" font-size="16">d</text>
            </svg>`,
        options: [
            "g² = d² − t²",
            "d² = t² + g²",
            "t² = d² + g²",
            "t² = d² − g²"
        ],
        correct: 1,
        explanation: "มุมที่อยู่ระหว่างด้าน o และ g เป็นมุมฉาก ดังนั้นด้าน d ซึ่งอยู่ตรงข้ามมุมฉากเป็นด้านตรงข้ามมุมฉาก จึงใช้ทฤษฎีบทพีทาโกรัสได้ว่า d² = o² + g²"
    }

];

let assessmentAnswers = {};

function renderAssessment() {
    assessmentAnswers = {};

    activityArea.innerHTML = `
        <div class="assessment-container">
            <div class="assessment-heading">
                <h2>ขั้นที่ 5 ประเมินผล</h2>
                <p>แบบทดสอบ เรื่อง การเขียนสมการแสดงความสัมพันธ์ระหว่างความยาวของด้านทั้งสามของรูปสามเหลี่ยมมุมฉาก</p>
                <div class="assessment-total">คะแนนเต็ม 5 คะแนน</div>
                <p>เลือกคำตอบที่ถูกต้องที่สุดเพียงข้อเดียว</p>
            </div>

            <div id="assessment-questions">
                ${assessmentQuestions.map((q, index) => `
                    <section class="assessment-question">
                        <h3>${q.title}</h3>
                        <div class="assessment-diagram">${q.diagram}</div>
                        <div class="assessment-options">
                            ${q.options.map((option, optionIndex) => `
                                <label class="assessment-option">
                                    <input type="radio"
                                        name="question-${index}"
                                        value="${optionIndex}"
                                        onchange="selectAssessmentAnswer(${index}, ${optionIndex})">
                                    <span>${option}</span>
                                </label>
                            `).join("")}
                        </div>
                    </section>
                `).join("")}
            </div>

            <div class="assessment-submit-area">
                <p id="assessment-warning"></p>
                <button class="assessment-submit" onclick="submitAssessment()">
                    ส่งคำตอบ
                </button>
            </div>

            <div id="assessment-result"></div>
        </div>
    `;
}

function selectAssessmentAnswer(questionIndex, optionIndex) {
    assessmentAnswers[questionIndex] = optionIndex;
}

function submitAssessment() {
    const warning = document.getElementById("assessment-warning");

    if (Object.keys(assessmentAnswers).length !== assessmentQuestions.length) {
        warning.textContent = "กรุณาตอบคำถามให้ครบทั้ง 5 ข้อก่อนส่งคำตอบ";
        return;
    }

    const score = assessmentQuestions.reduce((total, question, index) => {
        return total + (assessmentAnswers[index] === question.correct ? 1 : 0);
    }, 0);

    const result = document.getElementById("assessment-result");

    result.innerHTML = `
        <div class="assessment-score">
            <h2>ผลการประเมิน</h2>
            <div class="score-number">${score} / 5</div>
            <p>คุณได้ ${score} คะแนน จากคะแนนเต็ม 5 คะแนน</p>
        </div>

        <div class="assessment-review">
            <h3>เฉลยแบบทดสอบ</h3>
            ${assessmentQuestions.map((question, index) => {
                const isCorrect = assessmentAnswers[index] === question.correct;
                return `
                    <div class="assessment-review-item">
                        <strong>ข้อ ${index + 1}
                            <span class="${isCorrect ? "answer-correct" : "answer-wrong"}">
                                ${isCorrect ? "ตอบถูก" : "ตอบผิด"}
                            </span>
                        </strong>
                        <p>คำตอบที่ถูกต้อง: ${String.fromCharCode(65 + question.correct)}. ${question.options[question.correct]}</p>
                        <p>${question.explanation}</p>
                    </div>
                `;
            }).join("")}
        </div>
    `;

    warning.textContent = "";
    result.scrollIntoView({ behavior: "smooth", block: "start" });

    document.querySelectorAll(".assessment-option input").forEach(input => {
        input.disabled = true;
    });

    document.querySelector(".assessment-submit").disabled = true;
    document.querySelector(".assessment-submit").textContent = "ส่งคำตอบแล้ว";
}


function renderActivity() {

    if (currentStage === 4) {
    renderAssessment();
    return;
}

if (currentStage === 3) {
    renderElaboration();
    return;
}    
    if (currentStage === 1) {
        renderExploration();
        return;
    }
if (currentStage === 2) {
    renderExplanation();
    return;
}
    if (currentStage === 0) {
        activityArea.innerHTML = `
            <div class="welcome">
                <div class="character">📐</div>
                <h3>สวัสดีนักสำรวจ!</h3>
                <p>เคยสังเกตไหมว่าอุปกรณ์ชิ้นหนึ่งที่เราใช้ในห้องเรียน มีความเกี่ยวข้องกับคณิตศาสตร์อย่างไร</p>
            </div>

            <div class="question-box">
                <b>คำถามที่ 1 : อุปกรณ์นี้เรียกว่าอะไร</b><br>
                <button class="reveal-btn" onclick="reveal(0)">
                    👀 กดเพื่อดูคำตอบ
                </button>
                <div class="answer" id="answer0">
                    คำตอบ: ไม้ฉากรูปสามเหลี่ยม
                </div>
            </div>

            <div class="question-box">
                <b>คำถามที่ 2 : ไม้ฉากนี้เป็นสามเหลี่ยมชนิดใด</b><br>
                <button class="reveal-btn" onclick="reveal(1)">
                    👀 กดเพื่อดูคำตอบ
                </button>
                <div class="answer" id="answer1">
                    คำตอบ: สามเหลี่ยมมุมฉาก
                </div>
            </div>

            <div class="question-box">
                <b>คำถามที่ 3 : สามเหลี่ยมมุมฉากมีลักษณะอย่างไร</b><br>
                <button class="reveal-btn" onclick="reveal(2)">
                    👀 กดเพื่อดูคำตอบ
                </button>
                <div class="answer" id="answer2">
                    คำตอบ: มีมุมมุมหนึ่ง มีขนาด 90 องศา และมีด้านสามด้าน มุมภายในของรูปสามเหลี่ยม รวมกัน 180 องศา
                </div>
            </div>

            <div class="question-box">
                <b>คำถามที่ 4 : ภาษาอังกฤษเรียกว่าอะไร</b><br>
                <button class="reveal-btn" onclick="reveal(3)">
                    👀 กดเพื่อดูคำตอบ
                </button>
                <div class="answer" id="answer3">
                    คำตอบ: Right-angled triangle
                </div>
            </div>

            <div class="question-box">
                <b>คำถามชวนคิด</b>
                <p>ความยาวของด้านทั้งสามของสามเหลี่ยมมุมฉาก
                มีความสัมพันธ์กันอย่างไร</p>
            </div>

            <div class="welcome">
                <h3>🌟 พร้อมออกเดินทางหรือยัง</h3>
                <p>เราจะมาค้นพบความลับของสามเหลี่ยมมุมฉากไปด้วยกัน</p>
            </div>
        `;
    } else {
        activityArea.innerHTML = `
            <div class="welcome">
                <div class="character">🔒</div>
                <h3>${stages[currentStage].title}</h3>
                <p>พื้นที่กิจกรรมของด่านนี้
                จะพัฒนาร่วมกันในขั้นตอนถัดไป</p>
            </div>
        `;
    }
}

function reveal(number) {
    const answer = document.getElementById("answer" + number);

    if (answer) {
        answer.classList.toggle("show");
    }
}

// ========================================
// ขั้นที่ 3 อธิบายและลงข้อสรุป
// ========================================


// ========================================
// ขั้นที่ 3 อธิบายและลงข้อสรุป
// ========================================

// ระบบเปิด-ปิดแผ่นป้ายคำตอบ
function revealExplanation(id) {
    const answer = document.getElementById(id);
    const button = document.getElementById("button-" + id);
    const label = document.getElementById("label-" + id);

    if (!answer || !button || !label) return;

    const isOpen = answer.classList.toggle("plaque-open");
    button.classList.toggle("is-open", isOpen);

label.style.display = isOpen ? "none" : "block";
}

// ระบบเปิด-ปิดแผ่นป้ายข้อสรุป
function revealConclusion() {
    const answer = document.getElementById("conclusion-answer");
    const button = document.getElementById("conclusion-button");
    const label = document.getElementById("label-conclusion");

    if (!answer || !button || !label) return;

    const isOpen = answer.classList.toggle("plaque-open");
    button.classList.toggle("is-open", isOpen);

 label.style.display = isOpen ? "none" : "block";
}


// ========================================
// แสดงเนื้อหาขั้นที่ 3
// ========================================

function renderExplanation() {

    activityArea.innerHTML = `

    <div class="explanation-container">

        <!-- ส่วนรูปและคำถาม -->
        <div class="explanation-layout">

            <!-- ฝั่งซ้าย : รูปสามเหลี่ยม -->
            <section class="explanation-left">

                <div class="explanation-panel">

                    <h3 class="explanation-panel-title">
                        📐 รูปสามเหลี่ยมมุมฉาก ABC
                    </h3>

                    <p class="explanation-intro">
                        กำหนด ABC เป็นรูปสามเหลี่ยมมุมฉาก
                        ที่มีมุม C เป็นมุมฉาก ดังรูป
                    </p>

                    <div class="explanation-triangle">

                        <svg viewBox="0 0 360 260"
                            width="100%"
                            xmlns="http://www.w3.org/2000/svg">

                            <!-- รูปสามเหลี่ยม -->
                            <polygon
                                points="95,35 95,175 280,175"
                                fill="#EAF5FF"
                                stroke="#55A8DF"
                                stroke-width="3.5"
                                stroke-linejoin="round"/>

                            <!-- สัญลักษณ์มุมฉาก -->
                            <path
                                d="M95 157 L113 157 L113 175"
                                fill="none"
                                stroke="#287CB5"
                                stroke-width="2.5"/>

                            <!-- จุด B -->
                            <text x="95" y="22"
                                text-anchor="middle"
                                font-size="18"
                                fill="#315C7D">B</text>

                            <!-- จุด C -->
                            <text x="80" y="197"
                                text-anchor="middle"
                                font-size="18"
                                fill="#315C7D">C</text>

                            <!-- จุด A -->
                            <text x="294" y="197"
                                text-anchor="middle"
                                font-size="18"
                                fill="#315C7D">A</text>

                            <!-- ด้าน a -->
                            <text x="76" y="108"
                                text-anchor="middle"
                                font-size="19"
                                fill="#287CB5"
                                font-style="italic">a</text>

                            <!-- ด้าน b -->
                            <text x="190" y="201"
                                text-anchor="middle"
                                font-size="19"
                                fill="#287CB5"
                                font-style="italic">b</text>

                            <!-- ด้าน c -->
                            <text x="202" y="94"
                                text-anchor="middle"
                                font-size="19"
                                fill="#287CB5"
                                font-style="italic">c</text>

                        </svg>

                    </div>

                </div>

            </section>


            <!-- ฝั่งขวา : คำถามและแผ่นป้าย -->
            <section class="explanation-right">

                <h3 class="explanation-section-title">
                    💡 คำถามและคำตอบ
                </h3>

                <!-- คำถามที่ 1 -->
                <div class="explanation-question">

                    <div class="explanation-number">
                        คำถามที่ 1
                    </div>

                    <h3>
                        ด้านตรงข้ามมุมฉากของรูปสามเหลี่ยมมุมฉาก
                        เป็นด้านที่มีความยาวเป็นอย่างไร
                    </h3>

                    <button
                        type="button"
                        id="button-answer-one"
                        class="explanation-plaque"
                        onclick="revealExplanation('answer-one')">

                        <span
                            class="plaque-label"
                            id="label-answer-one">
                            👀 กดเพื่อเปิดคำตอบ
                        </span>

                        <span
                            id="answer-one"
                            class="plaque-answer">

                            <strong>คำตอบ</strong>

                            <span class="plaque-answer-text">
                                ด้านตรงข้ามมุมฉากเป็นด้านที่มีความยาวที่สุด
                            </span>

                        </span>

                    </button>

                </div>


                <!-- คำถามที่ 2 -->
                <div class="explanation-question">

                    <div class="explanation-number">
                        คำถามที่ 2
                    </div>

                    <h3>
                        ผลที่ได้จากการพิจารณา ถ้ากำหนดให้ c
                        แทนความยาวด้านตรงข้ามมุมฉาก
                        ส่วน a และ b แทนความยาวด้านประกอบมุมฉาก
                        ความสัมพันธ์ของ a², b² และ c² เป็นอย่างไร
                    </h3>

                    <button
                        type="button"
                        id="button-answer-two"
                        class="explanation-plaque"
                        onclick="revealExplanation('answer-two')">

                        <span
                            class="plaque-label"
                            id="label-answer-two">
                            👀 กดเพื่อเปิดคำตอบ
                        </span>

                        <span
                            id="answer-two"
                            class="plaque-answer">

                            <strong>คำตอบ</strong>

                            <span class="explanation-formula">
                                c² = a² + b²
                            </span>

                        </span>

                    </button>

                </div>

            </section>

        </div>


        <!-- ส่วนสรุปด้านล่าง -->
        <section class="explanation-summary">

            <h3>📖 สรุปได้ว่า</h3>

            <p class="summary-intro">
                ความสัมพันธ์ระหว่างความยาวของด้านทั้งสาม
                ของรูปสามเหลี่ยมมุมฉาก เป็นไปตามสมบัติของรูปสามเหลี่ยมมุมฉาก
                ซึ่งกล่าวว่า
            </p>

            <button
                type="button"
                id="conclusion-button"
                class="explanation-plaque conclusion-plaque"
                onclick="revealConclusion()">

                <span
                    class="plaque-label"
                    id="label-conclusion">
                    📖 กดเพื่อเปิดข้อสรุป
                </span>

                <span
                    id="conclusion-answer"
                    class="plaque-answer">

<strong>ข้อสรุป</strong>

<p class="conclusion-text">
    สำหรับรูปสามเหลี่ยมมุมฉากใด ๆ
    กำลังสองของความยาวของด้านตรงข้ามมุมฉาก
    เท่ากับผลบวกของกำลังสองของความยาวด้านประกอบมุมฉาก
    ซึ่งเรียกสมบัตินี้ว่า
    <strong>ทฤษฎีบทพีทาโกรัส</strong>
    (Pythagoras' theorem)
</p>

                </span>

            </button>

        </section>

    </div>


    <!-- CSS เฉพาะขั้นที่ 3 -->
    <style>

        .explanation-container {
            display:flex;
            flex-direction:column;
            gap:18px;
            animation:explanationFade .45s ease;
        }

        /* แบ่งหน้าจอซ้าย-ขวา */
        .explanation-layout {
            display:grid;
            grid-template-columns:0.9fr 1.1fr;
            gap:18px;
            align-items:stretch;
        }

        .explanation-left,
        .explanation-right {
            min-width:0;
        }

        /* กรอบฝั่งซ้าย */
        .explanation-panel {
            min-height:520px;
            height:100%;
            box-sizing:border-box;
            background:#F7FBFF;
            border:1px solid #DCEAF5;
            border-radius:15px;
            padding:18px;
            display:flex;
            flex-direction:column;
        }

        .explanation-panel-title {
            color:#287CB5;
            text-align:center;
            margin:0 0 12px;
        }

        .explanation-intro {
            color:#526B80;
            line-height:1.8;
            text-align:center;
            font-size:14px;
            margin:0;
        }

        /* รูปสามเหลี่ยมใหญ่และอยู่ตรงกลางกรอบ */
        .explanation-triangle {
            flex:1;
            display:flex;
            align-items:center;
            justify-content:center;
            width:100%;
            min-height:340px;
        }

        .explanation-triangle svg {
            display:block;
            width:100%;
            max-width:520px;
            max-height:390px;
            overflow:visible;
        }

        /* หัวข้อฝั่งขวา */
        .explanation-section-title {
            color:#287CB5;
            margin:0 0 12px;
        }

        /* กรอบคำถาม */
        .explanation-question {
            background:#F1F7FC;
            border:1px solid #D5E9FA;
            border-radius:15px;
            padding:17px;
            margin-bottom:14px;
        }

        .explanation-number {
            display:inline-block;
            background:#DCEEFF;
            color:#287CB5;
            border-radius:20px;
            padding:6px 13px;
            font-size:14px;
            font-weight:bold;
            margin-bottom:10px;
        }

        .explanation-question h3 {
            color:#315C7D;
            font-size:15px;
            line-height:1.8;
            margin:5px 0 15px;
        }

        /* แผ่นป้ายคำตอบ */
        .explanation-plaque {
            display:block;
            width:100%;
            box-sizing:border-box;
            padding:16px;
            border:1px solid #A9D5F5;
            border-radius:12px;
            background:white;
            color:#287CB5;
            font-family:inherit;
            font-size:15px;
            font-weight:bold;
            text-align:center;
            cursor:pointer;
            transition:background .25s ease,
                       box-shadow .25s ease,
                       transform .2s ease;
        }

        .explanation-plaque:hover {
            background:#F3FAFF;
            box-shadow:0 3px 12px rgba(40,124,181,.12);
            transform:translateY(-2px);
        }

        .explanation-plaque.is-open {
            background:#E3F8EA;
            border-color:#B6E7C5;
            color:#246B43;
            transform:none;
        }

        .plaque-label {
            display:block;
            width:100%;
        }

        /* ซ่อนคำตอบไว้ในแผ่นป้าย */
        .plaque-answer {
            display:none;
            width:100%;
            box-sizing:border-box;
            text-align:left;
            line-height:1.9;
        }

        .plaque-answer.plaque-open {
            display:block;
            margin-top:12px;
            padding-top:12px;
            border-top:1px solid #B6E7C5;
            animation:answerReveal .3s ease;
        }

        .plaque-answer-text {
            display:block;
            margin-top:5px;
            font-weight:normal;
        }

        .explanation-formula {
            display:block;
            text-align:center;
            color:#287CB5;
            font-size:26px;
            font-weight:bold;
            padding:12px;
            margin-top:10px;
            background:white;
            border-radius:10px;
        }

        /* สรุปด้านล่าง */
        .explanation-summary {
            padding:22px 26px;
            border-radius:15px;
            border:1px solid #B9DDF5;
            background:#EAF5FF;
        }

        .explanation-summary h3 {
            color:#287CB5;
            margin:0 0 12px;
            font-size:19px;
        }

        .summary-intro {
            color:#315C7D;
            line-height:1.9;
            margin:0 0 16px;
        }

        .conclusion-plaque {
            background:white;
        }

        .conclusion-plaque.is-open {
            background:#E3F8EA;
        }

        .conclusion-plaque .plaque-answer {
            text-align:center;
        }

.conclusion-text {
    display: block;
    margin: 12px 0 0;
    line-height: 1.8;
    border: none;
}

   .conclusion-name {
    display:block;
    padding-top:0;
    border-top:none;
    margin-top:0;
    text-align:center;
    line-height:2;
    font-weight:normal;
}

        .conclusion-name strong {
            color:#287CB5;
        }

        /* เอฟเฟกต์ */
        @keyframes explanationFade {
            from {
                opacity:0;
                transform:translateY(10px);
            }
            to {
                opacity:1;
                transform:translateY(0);
            }
        }

        @keyframes answerReveal {
            from {
                opacity:0;
                transform:translateY(5px);
            }
            to {
                opacity:1;
                transform:translateY(0);
            }
        }

        /* หน้าจอมือถือ */
        @media(max-width:700px) {

            .explanation-layout {
                grid-template-columns:1fr;
            }

            .explanation-panel {
                min-height:380px;
            }

            .explanation-triangle {
                min-height:280px;
            }

            .explanation-summary {
                padding:16px;
            }

        }

    </style>

    `;
}



// ========================================
// ระบบเปลี่ยนด่าน
// ========================================

function renderStage() {
    const stage = stages[currentStage];

    stageTitle.textContent = stage.title;
    stageDescription.textContent = stage.description;
    stageTag.textContent = `STAGE 0${currentStage + 1}`;

    document.querySelectorAll(".stage").forEach((button, index) => {
        button.classList.toggle("active", index === currentStage);
        button.classList.toggle("completed", completedStages.includes(index));
        button.classList.toggle(
            "locked",
            index > currentStage && !completedStages.includes(index)
        );
    });

    const progress = completedStages.length / 5 * 100;

    document.getElementById("progressFill").style.width = progress + "%";
    document.getElementById("progressText").textContent =
        `${completedStages.length} / 5 ด่าน`;

    backBtn.disabled = currentStage === 0;

    nextBtn.textContent = currentStage === 0
        ? "เริ่มภารกิจสำรวจ →"
        : currentStage === 4
            ? "จบบทเรียน"
            : "ไปขั้นถัดไป →";

    renderActivity();
}

nextBtn.addEventListener("click", () => {
    if (currentStage === 1 && !exploration.puzzleDone) {
        alert("กรุณาทำกิจกรรมและเรียงจิ๊กซอว์สมการให้ถูกต้องก่อน");
        return;
    }

    if (currentStage < 4) {
        if (!completedStages.includes(currentStage)) {
            completedStages.push(currentStage);
        }

        currentStage++;
        renderStage();
    } else {
        alert("ยอดเยี่ยม! คุณเดินทางครบทั้ง 5 ด่านแล้ว");
    }
});

backBtn.addEventListener("click", () => {
    if (currentStage > 0) {
        currentStage--;
        renderStage();
    }
});

document.querySelectorAll(".stage").forEach(button => {
    button.addEventListener("click", () => {
        const target = Number(button.dataset.stage);

        if (target <= currentStage || completedStages.includes(target)) {
            currentStage = target;
            renderStage();
        }
    });
});

renderStage();


/* ===== เสียงเอฟเฟกต์เมื่อคลิก ===== */

function playClickSound() {
    const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(650, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
        420,
        audioContext.currentTime + 0.08
    );

    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
        0.12,
        audioContext.currentTime + 0.01
    );
    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + 0.12
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.13);

    oscillator.onended = () => audioContext.close();
}

// เล่นเสียงเมื่อคลิกปุ่ม
document.addEventListener("click", function(event) {
    if (event.target.closest("button")) {
        playClickSound();
    }
});

// เล่นเสียงเมื่อเลือกตัวเลือกหรือเปลี่ยนค่า
document.addEventListener("change", function(event) {
    if (
        event.target.matches(
            'input[type="radio"], input[type="checkbox"], select'
        )
    ) {
        playClickSound();
    }
});
