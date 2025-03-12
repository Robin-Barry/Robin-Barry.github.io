let questions = [];
let currentQuestionIndex = 0;
let selectedQuestions = [];
let score = 0;
let totalQuestions = 0;
let timer;
let timeLeft = 20; // ⏳ Default 20 seconds per question
let isTransitioning = false; // ✅ Prevents fast clicking issues

async function loadQuestions() {
    try {
        const response = await fetch("questions.json");
        if (!response.ok) throw new Error("Failed to load questions.json");
        questions = await response.json();
        console.log("Questions loaded successfully:", questions);
    } catch (error) {
        console.error("Error loading questions:", error);
        alert("Failed to load questions! Check the console (F12) for details.");
    }
}

async function startExam(numQuestions) {
    await loadQuestions();

    if (questions.length === 0) {
        alert("No questions loaded! Check questions.json file.");
        return;
    }

    if (numQuestions > questions.length) {
        alert(`⚠️ Only ${questions.length} questions available. Starting with ${questions.length} questions.`);
    }

    numQuestions = Math.min(numQuestions, questions.length);

    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';

    selectedQuestions = questions.sort(() => 0.5 - Math.random()).slice(0, numQuestions);
    totalQuestions = selectedQuestions.length;
    currentQuestionIndex = 0;
    score = 0;

    loadQuestion();
}

function loadQuestion() {
    clearInterval(timer);

    if (currentQuestionIndex >= totalQuestions) {
        showResults();
        return;
    }

    let question = selectedQuestions[currentQuestionIndex];

    document.getElementById('question-number').textContent = `Question ${currentQuestionIndex + 1} of ${totalQuestions}`;
    document.getElementById('question-text').innerHTML = question.question.replace(/\n/g, '<br>');

    let imageContainer = document.getElementById('image-container');
    if (question.image) {
        imageContainer.innerHTML = `<img src="${question.image}" alt="Question Image">`;
        imageContainer.style.display = 'block';
    } else {
        imageContainer.style.display = 'none';
    }

    let answerOptions = document.getElementById('answer-options');
    answerOptions.innerHTML = "";

    let shuffledAnswers = question.answers.map((answer, index) => ({
        text: answer,
        originalIndex: index
    })).sort(() => Math.random() - 0.5);

    question.shuffledAnswers = shuffledAnswers;
    question.shuffledCorrectIndex = shuffledAnswers.findIndex(a => a.originalIndex === question.correct);

    shuffledAnswers.forEach(({ text }, displayIndex) => {
        let button = document.createElement("button");
        button.textContent = text;
        button.classList.add("answer-button");
        button.onclick = () => checkAnswer(displayIndex);
        answerOptions.appendChild(button);
    });

    document.getElementById("next-btn").style.display = "none";

    timeLeft = 20;
    document.getElementById("timer").textContent = `Time Left: ${timeLeft}s`;
    timer = setInterval(updateTimer, 1000);
}

// ✅ Timer Function
function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        document.getElementById("timer").textContent = `Time Left: ${timeLeft}s`;
    } else {
        clearInterval(timer);
        disableAnswers();
        document.getElementById("next-btn").style.display = "none";
        setTimeout(() => nextQuestion(), 1500);
    }
}

// ✅ Disable Answer Buttons if Time Runs Out
function disableAnswers() {
    let buttons = document.querySelectorAll(".answer-button");
    buttons.forEach(button => button.disabled = true);
}

// ✅ Check Answer & Move to Next Question
function checkAnswer(selectedIndex) {
    clearInterval(timer);
    disableAnswers();

    let question = selectedQuestions[currentQuestionIndex];

    question.userAnswer = selectedIndex;

    let correctAnswerIndex = question.shuffledCorrectIndex;

    let buttons = document.querySelectorAll(".answer-button");
    buttons.forEach((button, index) => {
        button.disabled = true;
        button.style.backgroundColor = index === correctAnswerIndex ? "green" : "red";
    });

    if (selectedIndex === correctAnswerIndex) {
        score++;
    }

    document.getElementById("next-btn").style.display = "block";
}

// ✅ Move to Next Question
function nextQuestion() {
    if (isTransitioning) return;
    isTransitioning = true;

    currentQuestionIndex++;

    if (currentQuestionIndex < totalQuestions) {
        setTimeout(() => {
            loadQuestion();
            isTransitioning = false;
        }, 300);
    } else {
        showResults();
        isTransitioning = false;
    }
}

// ✅ Show Results & Highlight Correct Answers
function showResults() {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('result-container').style.display = 'block';

    let percentage = ((score / totalQuestions) * 100).toFixed(2);

    let resultText = `
        You scored <b>${score} out of ${totalQuestions}</b> 
        <br><b>Percentage:</b> ${percentage}%
        <br>${percentage >= 70 ? "🎉 <span style='color: green; font-weight: bold;'>Pass</span>" : "❌ <span style='color: red; font-weight: bold;'>Fail</span>"}
    `;

    document.getElementById('score-text').innerHTML = resultText;

    let correctList = document.getElementById('correct-answers');
    correctList.innerHTML = selectedQuestions.map((q, i) => {
        let userAnswer = q.userAnswer !== undefined ? q.userAnswer : null;
        let correctAnswerIndex = q.shuffledCorrectIndex;
        let correctAnswerText = q.shuffledAnswers[correctAnswerIndex].text;
        let userAnswerText = userAnswer !== null ? q.shuffledAnswers[userAnswer].text : "No Answer";
        let isCorrect = userAnswer === correctAnswerIndex;

        return `
            <li style="background: ${isCorrect ? '#d4edda' : '#f8d7da'}; 
                padding: 10px; margin: 5px 0; border-left: 5px solid ${isCorrect ? 'green' : 'red'};
                color: ${isCorrect ? '#155724' : '#721c24'};">
                <b>Q${i + 1}:</b> ${q.question} 
                <br><b>Correct Answer:</b> ${correctAnswerText}
                <br><b>Your Answer:</b> ${userAnswerText}
            </li>
        `;
    }).join("");

    correctList.style.display = "none";
}

// ✅ Toggle Show/Hide Correct Answers
function toggleCorrectAnswers() {
    let correctList = document.getElementById('correct-answers');
    correctList.style.display = correctList.style.display === "none" ? "block" : "none";
}

// ✅ Toggle Dark Mode
function toggleDarkMode() {
    let body = document.body;
    body.classList.toggle("dark-mode");

    let isDarkMode = body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");

    document.getElementById("dark-mode-toggle").textContent = isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
}
function restartExam() {
    // ✅ Reset variables
    currentQuestionIndex = 0;
    score = 0;
    selectedQuestions = [];
    timeLeft = 20;

    // ✅ Hide results & show the start screen
    document.getElementById('result-container').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';

    // ✅ Clear answer review section
    document.getElementById('correct-answers').innerHTML = "";

    // ✅ Ensure the next exam starts fresh
    clearInterval(timer);
}
// ✅ Run on page load to force Dark Mode as default
window.onload = function () {
    document.body.classList.add("dark-mode");
    document.getElementById("dark-mode-toggle").textContent = "☀️ Light Mode";
    localStorage.setItem("darkMode", "enabled");
};
