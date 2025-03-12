let questions = [];
let currentQuestionIndex = 0;
let selectedQuestions = [];
let score = 0;
let totalQuestions = 0;
let timer;
let timeLeft = 20; // ⏳ Default 120 seconds per question

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

    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';

    selectedQuestions = questions.sort(() => 0.5 - Math.random()).slice(0, numQuestions);
    totalQuestions = numQuestions;
    currentQuestionIndex = 0;
    score = 0;

    loadQuestion();
}

function loadQuestion() {
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

    // ✅ Shuffle answer order
    let shuffledAnswers = question.answers.map((answer, index) => ({
        text: answer,
        index: index
    })).sort(() => Math.random() - 0.5); // Randomize

    shuffledAnswers.forEach(({ text, index }) => {
        let button = document.createElement("button");
        button.textContent = text;
        button.classList.add("answer-button");
        button.onclick = () => checkAnswer(index, question.correct, button);
        answerOptions.appendChild(button);
    });

    document.getElementById("next-btn").style.display = "none";

    // ✅ Start countdown timer
    timeLeft = 20;
    document.getElementById("timer").textContent = `Time Left: ${timeLeft}s`;
    clearInterval(timer);
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
        document.getElementById("next-btn").style.display = "none"; // Hide next button
        setTimeout(() => nextQuestion(), 1500); // ⏳ Wait 1.5s, then move to next question
    }
}


// ✅ Disable Answer Buttons if Time Runs Out
function disableAnswers() {
    let buttons = document.querySelectorAll(".answer-button");
    buttons.forEach(button => button.disabled = true);
}

// ✅ Check Answer & Move to Next Question
function checkAnswer(selectedIndex, correctIndex, selectedButton) {
    clearInterval(timer); // Stop the timer

    let question = selectedQuestions[currentQuestionIndex];
    question.userAnswer = selectedIndex; // ✅ Store user's answer

    let buttons = document.querySelectorAll(".answer-button");
    buttons.forEach((button, index) => {
        button.disabled = true;
        button.style.backgroundColor = index === correctIndex ? "green" : "red";
    });

    if (selectedIndex === correctIndex) {
        score++;
    }

    document.getElementById("next-btn").style.display = "block";
}

// ✅ Move to Next Question
function nextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

// ✅ Show Results & Highlight Incorrect Answers
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
        let correctAnswer = q.correct;
        let isCorrect = userAnswer === correctAnswer;

        return `
            <li style="background: ${isCorrect ? '#d4edda' : '#f8d7da'}; 
                padding: 10px; margin: 5px 0; border-left: 5px solid ${isCorrect ? 'green' : 'red'};
                color: ${isCorrect ? '#155724' : '#721c24'};">
                <b>Q${i + 1}:</b> ${q.question} 
                <br><b>Correct Answer:</b> ${q.answers[correctAnswer]}
                ${userAnswer !== null ? `<br><b>Your Answer:</b> ${q.answers[userAnswer]}` : "<br><b>Your Answer:</b> No Answer"}
            </li>
        `;
    }).join("");
}
// 🌙 Toggle Dark Mode
// ✅ Ensure images in Dark Mode have a white background
function fixImagesForDarkMode() {
    let images = document.querySelectorAll("#image-container img");
    images.forEach(img => {
        img.style.backgroundColor = "white";
        img.style.padding = "10px";
        img.style.borderRadius = "5px";
    });
}

// 🔄 Run this function when Dark Mode is toggled
function toggleDarkMode() {
    let body = document.body;
    body.classList.toggle("dark-mode");

    let isDarkMode = body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");

    document.getElementById("dark-mode-toggle").textContent = isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode";

    fixImagesForDarkMode(); // Apply white background to images in Dark Mode
}

// ✅ Run on page load to fix images if Dark Mode is enabled
window.onload = function () {
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        document.getElementById("dark-mode-toggle").textContent = "☀️ Light Mode";
        fixImagesForDarkMode(); // Apply fix when page loads
    }
};


// ✅ Toggle Correct Answers Display
function toggleCorrectAnswers() {
    let correctList = document.getElementById('correct-answers');
    correctList.style.display = correctList.style.display === "none" ? "block" : "none";
}

// ✅ Fully Restart Exam
function restartExam() {
    document.getElementById('result-container').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
    currentQuestionIndex = 0;
    score = 0;
    selectedQuestions = [];
}

