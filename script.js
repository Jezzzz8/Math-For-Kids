// GAME STATE (tanang importante nga datos)
// Mga variable nga nag hold sa tanang data sa dula
let firstNumber = 0;
let secondNumber = 0;
let currentOperator = '+';
let expectedAnswer = 0;
let userInput = '';
let currentScore = 0;
let isProblemAnswered = false;
let chosenOperator = '+';
let chosenDifficulty = 'easy';
let previousProblem = null;

// DOM ELEMENTS (mga parts sa page nga gigamit)
// Mao ni ang elements sa webpage nga gigamit
const displayFirstNum = document.getElementById('num1Display');
const displaySecondNum = document.getElementById('num2Display');
const displayOperator = document.getElementById('operatorDisplay');
const displayInput = document.getElementById('inputDisplay');
const feedbackArea = document.getElementById('feedback');
const scoreDisplay = document.getElementById('scoreDisplay');
const problemBox = document.getElementById('problemBox');

// Buttons
const checkBtn = document.getElementById('checkBtn');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearAllBtn');

// Operator & difficulty buttons
const operatorButtons = document.querySelectorAll('.op-btn');
const difficultyButtons = document.querySelectorAll('.diff-btn');

// Popup elements
const popupOverlay = document.getElementById('popupOverlay');
const popupCard = document.getElementById('popupCard');
const popupIcon = document.getElementById('popupIcon');
const popupTitle = document.getElementById('popupTitle');
const popupDetail = document.getElementById('popupDetail');
const popupActionBtn = document.getElementById('popupBtn');

// AUDIO (optional ra ni)
// Mga sound effects para sa correct, wrong, ug popup
const soundCorrect = document.getElementById('soundDing');
const soundWrong = document.getElementById('soundBuzz');
const soundPopup = document.getElementById('soundPop');

function playSound(audioElement) {
    if (audioElement) {
        audioElement.currentTime = 0;
        audioElement.play().catch(() => {});
    }
}

// HELPER FUNCTIONS
// Mga functions para sa random numbers ug sa pag kuha sa maximum nga number
function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Mo return sa maximum nga number nga allowed para sa difficulty sa daka operation
function getMaxNumber(operation) {
    const limits = {
        '+': { easy: 5, normal: 8, hard: 10 },
        '−': { easy: 5, normal: 8, hard: 10 },
        '×': { easy: 5, normal: 8, hard: 10 },
        '÷': { easy: 6, normal: 8, hard: 10 }
    };
    return limits[operation]?.[chosenDifficulty] || 10;
}

// GENERATE A NEW PROBLEM
// kani ang function nga maghimo og bag o nga problem
function generateProblem() {
    // Decide which operation to use (if Random, pick one)
    let operation = chosenOperator;
    if (operation === 'random') {
        const allOps = ['+', '−', '×', '÷'];
        operation = allOps[randomInteger(0, 3)];
    }

    const maxVal = getMaxNumber(operation);
    let num1, num2, answer;
    let attempts = 0;
    let isValid = false;

    // Keep trying until we get a valid problem (and avoid repeats)
    do {
        num1 = 0;
        num2 = 0;
        answer = 0;
        isValid = false;

        switch (operation) {
            case '+':
                num1 = randomInteger(0, maxVal);
                num2 = randomInteger(0, maxVal);
                answer = num1 + num2;
                isValid = true;
                break;

            case '−':
                num1 = randomInteger(0, maxVal);
                num2 = randomInteger(0, maxVal);
                // Make sure we don't get negative answers
                if (num1 < num2) {
                    [num1, num2] = [num2, num1];
                }
                answer = num1 - num2;
                isValid = true;
                break;

            case '×':
                num1 = randomInteger(0, maxVal);
                num2 = randomInteger(0, maxVal);
                answer = num1 * num2;
                isValid = true;
                break;

            case '÷':
                // Division: num1 = num2 * multiplier, so answer = multiplier
                const divisorLimit = Math.min(maxVal, chosenDifficulty === 'hard' ? 15 : 10);
                let multiplier;
                let multiplierMax;
                while (!isValid) {
                    num2 = randomInteger(1, divisorLimit);
                    multiplierMax = Math.floor(maxVal / num2);
                    if (multiplierMax >= 1) {
                        // Avoid multiplier = 1 most of the time
                        if (multiplierMax > 1 && randomInteger(1, 100) <= 70) {
                            multiplier = randomInteger(2, multiplierMax);
                        } else {
                            multiplier = randomInteger(1, multiplierMax);
                        }
                        num1 = num2 * multiplier;
                        answer = multiplier;
                        isValid = true;
                    }
                }
                break;
        }
        attempts++;
    } while (
        attempts < 50 &&
        previousProblem &&
        previousProblem.num1 === num1 &&
        previousProblem.num2 === num2 &&
        previousProblem.operator === operation
    );

    // Use this problem to avoid exact repetition next time
    previousProblem = { num1, num2, operator: operation };

    // Update the game state
    firstNumber = num1;
    secondNumber = num2;
    currentOperator = operation;
    expectedAnswer = answer;
    userInput = '';
    isProblemAnswered = false;

    // Enable the check and clear buttons
    checkBtn.disabled = false;
    clearBtn.disabled = false;

    // Refresh what's shown on screen
    updateDisplay();
    setFeedbackMessage('Try to solve it', '');
    animateProblemBox('pop');
    closePopup();
}

// UPDATE THE SCREEN
// Kani ang function nga mag-update sa display
function updateDisplay() {
    displayFirstNum.textContent = firstNumber;
    displaySecondNum.textContent = secondNumber;
    displayOperator.textContent = currentOperator;
    displayInput.textContent = userInput === '' ? '?' : userInput;
    scoreDisplay.textContent = currentScore;
}

// FEEDBACK MESSAGE
// Kani nagbutang og feedback message sa ubos sa problem
function setFeedbackMessage(message, type) {
    let feedbackSpan = feedbackArea.querySelector('.feedback-text');
    if (!feedbackSpan) {
        feedbackSpan = document.createElement('span');
        feedbackSpan.className = 'feedback-text';
        feedbackArea.appendChild(feedbackSpan);
    }
    feedbackSpan.className = 'feedback-text' + (type ? ' ' + type : '');
    feedbackSpan.innerHTML = message;
}

// ANIMATE THE PROBLEM BOX
// Kani nag add og animation sa problem box (pop og shake animation)
function animateProblemBox(animation) {
    problemBox.classList.remove('shake', 'pop');
    void problemBox.offsetWidth;
    if (animation) {
        problemBox.classList.add(animation);
        setTimeout(() => problemBox.classList.remove(animation), 250);
    }
}

// POPUP CONTROLS
// Kani ang function para sa popup nga naay icon, title, details, ug button
function showPopup(type, title, detail, buttonText, buttonClass) {
    const iconMap = {
        correct: 'tada.png',
        wrong: 'sweat.png',
        info: 'wave.png'
    };
    const titleClassMap = {
        correct: 'correct-title',
        wrong: 'wrong-title',
        info: 'info-title'
    };
    const cardClassMap = {
        correct: 'correct',
        wrong: 'wrong',
        info: 'info'
    };
    const btnClassMap = {
        correct: 'correct-btn',
        wrong: 'wrong-btn',
        info: 'info-btn'
    };

    // Set icon as image
    const iconSrc = iconMap[type] || 'sparkles.png';
    popupIcon.innerHTML = `<img src="${iconSrc}" alt="icon" class="popup-icon-img" />`;

    popupTitle.textContent = title || 'Hey!';
    popupTitle.className = 'popup-title ' + (titleClassMap[type] || '');
    popupDetail.innerHTML = detail || '';
    popupActionBtn.textContent = buttonText || 'OK';
    popupActionBtn.className = 'popup-btn ' + (btnClassMap[type] || '');
    popupCard.className = 'popup-card ' + (cardClassMap[type] || '');

    popupOverlay.classList.add('show');
    setTimeout(() => popupActionBtn.focus(), 100);
    playSound(soundPopup);
}

function closePopup() {
    popupOverlay.classList.remove('show');
}

// CHECK THE ANSWER
// Kani ang function nga mag-check sa answer sa player
function checkAnswer() {
    // If already answered, do nothing
    if (isProblemAnswered) return;

    // If no input, show a friendly reminder
    if (userInput === '') {
        showPopup('info', 'Wait!', 'Please enter a number!', 'OK', 'info');
        return;
    }

    const playerAnswer = parseInt(userInput, 10);
    if (isNaN(playerAnswer)) {
        showPopup('info', 'Wait!', 'Please enter a valid number!', 'OK', 'info');
        return;
    }

    // Disable buttons to prevent double‑clicking
    clearBtn.disabled = true;
    checkBtn.disabled = true;
    isProblemAnswered = true;

    // Compare with the correct answer
    if (playerAnswer === expectedAnswer) {
        // Correct!
        currentScore++;
        updateDisplay();
        showPopup('correct', 'Correct!', 'Great job!', 'Next ➜', 'correct');
        playSound(soundCorrect);
        animateProblemBox('pop');
    } else {
        // Wrong!
        currentScore = Math.max(0, currentScore - 1);
        updateDisplay();
        showPopup(
            'wrong',
            'Oops!',
            `The right answer is <span class="highlight-answer">${expectedAnswer}</span>`,
            'Try Again',
            'wrong'
        );
        playSound(soundWrong);
        animateProblemBox('shake');
    }
}

// NUMPAD INPUT
// Kani ang mga function ang para sa numpad ug sa keyboard
function addDigit(digit) {
    if (isProblemAnswered) return;
    if (userInput.length >= 6) return;
    userInput += digit;
    updateDisplay();
}

function clearInput() {
    if (isProblemAnswered) return;
    userInput = '';
    updateDisplay();
    // Clear any previous wrong feedback
    const feedbackSpan = feedbackArea.querySelector('.feedback-text');
    if (feedbackSpan && feedbackSpan.classList.contains('wrong')) {
        setFeedbackMessage('✨ Input cleared. Try again!', '');
    }
}

// CHANGE OPERATOR / DIFFICULTY
// kani nga functions mag change sa operator or difficulty, unya maghimo dayun og bag o na problem
function changeOperator(operation) {
    chosenOperator = operation;
    operatorButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.op === operation);
    });
    previousProblem = null;
    generateProblem();
}

function changeDifficulty(difficulty) {
    chosenDifficulty = difficulty;
    difficultyButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.diff === difficulty);
    });
    previousProblem = null;
    generateProblem();
}

// EVENT LISTENERS
// Mga event listeners para sa pag-click ug sa keyboard

// Numpad clicks
document.getElementById('numpad').addEventListener('click', (event) => {
    const button = event.target.closest('.num-btn');
    if (button) {
        addDigit(button.dataset.value);
    }
});

// Keyboard support
document.addEventListener('keydown', (event) => {
    // If popup is open, pressing Enter triggers the popup button
    if (event.key === 'Enter' && popupOverlay.classList.contains('show')) {
        event.preventDefault();
        popupActionBtn.click();
        return;
    }

    // Number keys (0‑9)
    if (event.key >= '0' && event.key <= '9') {
        event.preventDefault();
        addDigit(event.key);
    }
    // Backspace clears input
    else if (event.key === 'Backspace') {
        event.preventDefault();
        clearInput();
    }
    // Enter checks the answer
    else if (event.key === 'Enter') {
        event.preventDefault();
        checkAnswer();
    }
});

// Button clicks
clearBtn.addEventListener('click', clearInput);
generateBtn.addEventListener('click', generateProblem);
checkBtn.addEventListener('click', checkAnswer);

// Operator buttons
operatorButtons.forEach(btn => {
    btn.addEventListener('click', () => changeOperator(btn.dataset.op));
});

// Difficulty buttons
difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => changeDifficulty(btn.dataset.diff));
});

// Popup button – close popup and go to next problem (if correct/wrong)
popupActionBtn.addEventListener('click', () => {
    const card = popupCard;
    if (card.classList.contains('correct') || card.classList.contains('wrong')) {
        closePopup();
        generateProblem();
    } else {
        closePopup();
    }
});

// Click outside the popup to close it (only for info-type popups)
popupOverlay.addEventListener('click', (event) => {
    if (event.target === popupOverlay && popupCard.classList.contains('info')) {
        closePopup();
    }
});

// START THE GAME
// Pagstart sa dula: default kay Addition og Easy
changeOperator('+');
changeDifficulty('easy');