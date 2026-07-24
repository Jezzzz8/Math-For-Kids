// script.js – Complete game logic with difficulty
// --------------------------------------------------------------
// CORE LOGIC: generateProblem() creates a new math problem
// based on the selected operator and difficulty. It calculates
// the correct answer and updates the display. checkAnswer()
// compares the user's input with the correct answer.
// --------------------------------------------------------------

// --- STATE ---
let num1, num2, operator, correctAnswer;
let currentInput = '';
let score = 0;
let isAnswered = false;
let selectedOperator = '+';
let selectedDifficulty = 'easy';
let lastProblem = null;

// --- DOM REFS ---
const num1Display = document.getElementById('num1Display');
const num2Display = document.getElementById('num2Display');
const operatorDisplay = document.getElementById('operatorDisplay');
const inputDisplay = document.getElementById('inputDisplay');
const feedback = document.getElementById('feedback');
const scoreDisplay = document.getElementById('scoreDisplay');
const problemBox = document.getElementById('problemBox');
const checkBtn = document.getElementById('checkBtn');
const generateBtn = document.getElementById('generateBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const opsButtons = document.querySelectorAll('.op-btn');
const diffButtons = document.querySelectorAll('.diff-btn');
const popupOverlay = document.getElementById('popupOverlay');
const popupCard = document.getElementById('popupCard');
const popupIcon = document.getElementById('popupIcon');
const popupTitle = document.getElementById('popupTitle');
const popupDetail = document.getElementById('popupDetail');
const popupBtn = document.getElementById('popupBtn');

// --- AUDIO (optional) ---
const soundDing = document.getElementById('soundDing');
const soundBuzz = document.getElementById('soundBuzz');
const soundPop = document.getElementById('soundPop');

function playSound(audio) {
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }
}

// --- HELPERS ---
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get number range based on difficulty
function getRange(op) {
    const ranges = {
        '+': { easy: 5, normal: 10, hard: 15 },
        '−': { easy: 5, normal: 10, hard: 15 },
        '×': { easy: 5, normal: 10, hard: 12 },
        '÷': { easy: 10, normal: 15, hard: 20 }
    };
    return ranges[op] || ranges['+'];
}

// --- GENERATE PROBLEM (core calculation) ---
function generateProblem() {
    let op = selectedOperator;
    if (op === 'random') {
        const ops = ['+', '−', '×', '÷'];
        op = ops[randomInt(0, 3)];
    }

    const range = getRange(op);
    const maxVal = range[selectedDifficulty] || 10;
    let n1, n2, answer;
    let attempts = 0;

    // Loop to avoid repeating the exact same problem
    do {
        n1 = 0;
        n2 = 0;
        answer = 0;
        let valid = false;

        switch (op) {
            case '+':
                n1 = randomInt(0, maxVal);
                n2 = randomInt(0, maxVal);
                answer = n1 + n2;
                valid = true;
                break;

            case '−':
                n1 = randomInt(0, maxVal);
                n2 = randomInt(0, maxVal);
                if (n1 < n2) [n1, n2] = [n2, n1];
                answer = n1 - n2;
                valid = true;
                break;

            case '×':
                n1 = randomInt(0, maxVal);
                n2 = randomInt(0, maxVal);
                answer = n1 * n2;
                valid = true;
                break;

            case '÷':
                let divisorMax = Math.min(maxVal, selectedDifficulty === 'hard' ? 15 : 10);
                let multiplierMax;
                let multiplier;
                while (!valid) {
                    n2 = randomInt(1, divisorMax);
                    multiplierMax = Math.floor(maxVal / n2);
                    if (multiplierMax >= 1) {
                        if (multiplierMax > 1 && randomInt(1, 100) <= 70) {
                            multiplier = randomInt(2, multiplierMax);
                        } else {
                            multiplier = randomInt(1, multiplierMax);
                        }
                        n1 = n2 * multiplier;
                        answer = multiplier;
                        valid = true;
                    }
                }
                break;
        }
        attempts++;
    } while (
        attempts < 50 &&
        lastProblem &&
        lastProblem.num1 === n1 &&
        lastProblem.num2 === n2 &&
        lastProblem.operator === op
    );

    lastProblem = { num1: n1, num2: n2, operator: op };

    num1 = n1;
    num2 = n2;
    operator = op;
    correctAnswer = answer;
    currentInput = '';
    isAnswered = false;

    checkBtn.disabled = false;
    clearAllBtn.disabled = false;

    updateDisplay();
    setFeedback('Try to solve it.', '');
    problemBox.classList.remove('shake', 'pop');
    void problemBox.offsetWidth;
    problemBox.classList.add('pop');
    setTimeout(() => problemBox.classList.remove('pop'), 250);

    closePopup();
}

// --- UPDATE DISPLAY ---
function updateDisplay() {
    num1Display.textContent = num1;
    num2Display.textContent = num2;
    operatorDisplay.textContent = operator;
    inputDisplay.textContent = currentInput === '' ? '?' : currentInput;
    scoreDisplay.textContent = score;
}

// --- FEEDBACK ---
function setFeedback(message, type) {
    const el = feedback.querySelector('.feedback-text') || document.createElement('span');
    el.className = 'feedback-text';
    if (type) el.classList.add(type);
    el.innerHTML = message;
    if (!feedback.querySelector('.feedback-text')) feedback.appendChild(el);
}

// --- POPUP ---
function showPopup(type, title, detail, btnText, btnClass) {
    const icons = {
        correct: 'tada.png',
        wrong: 'sweat.png',
        info: 'wave.png'
    };
    const titleClasses = { correct: 'correct-title', wrong: 'wrong-title', info: 'info-title' };
    const cardClasses = { correct: 'correct', wrong: 'wrong', info: 'info' };
    const btnClasses = { correct: 'correct-btn', wrong: 'wrong-btn', info: 'info-btn' };

    const iconSrc = icons[type] || 'sparkles.png';
    popupIcon.innerHTML = `<img src="${iconSrc}" alt="icon" class="popup-icon-img" />`;

    popupTitle.textContent = title || 'Hey!';
    popupTitle.className = 'popup-title ' + (titleClasses[type] || '');
    popupDetail.innerHTML = detail || '';
    popupBtn.textContent = btnText || 'OK';
    popupBtn.className = 'popup-btn ' + (btnClasses[type] || '');
    popupCard.className = 'popup-card ' + (cardClasses[type] || '');

    popupOverlay.classList.add('show');
    setTimeout(() => popupBtn.focus(), 100);
    playSound(soundPop);
}

function closePopup() {
    popupOverlay.classList.remove('show');
}

// --- CHECK ANSWER (core comparison) ---
function checkAnswer() {
    if (isAnswered) return;

    if (currentInput === '') {
        showPopup('info', 'Wait!', 'Please enter a number!', 'OK', 'info');
        return;
    }

    const userAnswer = parseInt(currentInput, 10);
    if (isNaN(userAnswer)) {
        showPopup('info', 'Wait!', 'Please enter a valid number!', 'OK', 'info');
        return;
    }

    clearAllBtn.disabled = true;
    checkBtn.disabled = true;
    isAnswered = true;

    if (userAnswer === correctAnswer) {
        score++;
        updateDisplay();
        showPopup('correct', 'Correct!', 'Great job!', 'Next ➜', 'correct');
        playSound(soundDing);
        problemBox.classList.remove('shake');
        problemBox.classList.add('pop');
        setTimeout(() => problemBox.classList.remove('pop'), 250);
    } else {
        score = Math.max(0, score - 1);
        updateDisplay();
        showPopup(
            'wrong',
            'Oops!',
            `The right answer is <span class="highlight-answer">${correctAnswer}</span>`,
            'Try Again',
            'wrong'
        );
        playSound(soundBuzz);
        problemBox.classList.remove('pop');
        problemBox.classList.add('shake');
        setTimeout(() => problemBox.classList.remove('shake'), 350);
    }
}

// --- NUMPAD INPUT ---
function handleInput(value) {
    if (isAnswered) return;
    if (currentInput.length >= 6) return;
    currentInput += value;
    updateDisplay();
}

function clearInput() {
    if (isAnswered) return;
    currentInput = '';
    updateDisplay();
    const fb = feedback.querySelector('.feedback-text');
    if (fb && fb.classList.contains('wrong')) {
        setFeedback('✨ Input cleared. Try again!', '');
    }
}

// --- SELECT OPERATOR / DIFFICULTY ---
function selectOperator(op) {
    selectedOperator = op;
    opsButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.op === op));
    lastProblem = null;
    generateProblem();
}

function selectDifficulty(diff) {
    selectedDifficulty = diff;
    diffButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.diff === diff));
    lastProblem = null;
    generateProblem();
}

// --- EVENT LISTENERS ---
document.getElementById('numpad').addEventListener('click', (e) => {
    const btn = e.target.closest('.num-btn');
    if (btn) handleInput(btn.dataset.value);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && popupOverlay.classList.contains('show')) {
        e.preventDefault();
        popupBtn.click();
        return;
    }
    if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleInput(e.key);
    } else if (e.key === 'Backspace') {
        e.preventDefault();
        clearInput();
    } else if (e.key === 'Enter') {
        e.preventDefault();
        checkAnswer();
    }
});

clearAllBtn.addEventListener('click', clearInput);
generateBtn.addEventListener('click', generateProblem);
checkBtn.addEventListener('click', checkAnswer);

opsButtons.forEach(btn => {
    btn.addEventListener('click', () => selectOperator(btn.dataset.op));
});
diffButtons.forEach(btn => {
    btn.addEventListener('click', () => selectDifficulty(btn.dataset.diff));
});

popupBtn.addEventListener('click', () => {
    const card = popupCard;
    if (card.classList.contains('correct') || card.classList.contains('wrong')) {
        closePopup();
        generateProblem();
    } else {
        closePopup();
    }
});

popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay && popupCard.classList.contains('info')) {
        closePopup();
    }
});

// --- START with Easy difficulty ---
selectOperator('+');
selectDifficulty('easy');