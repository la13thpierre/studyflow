let uploadedNotes = "";
let flashcards = [];


const fileInput = document.getElementById('file-upload');
const fileNameDisplay = document.getElementById('file-name');
const generateBtn = document.getElementById('generate-btn');
const aiOutput = document.getElementById('ai-output');
const summaryPoints = document.getElementById('summary-points');

fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];


    
    
  if (file) {

        fileNameDisplay.innerHTML = "📄 " + file.name;
        generateBtn.style.display = 'inline-block';
        generateBtn.innerHTML = 'Generate Summary';
        generateBtn.disabled = false;
        aiOutput.style.display = 'none';

        const reader = new FileReader();

reader.onload = function(e) {

   const uploadedText = e.target.result;

uploadedNotes = uploadedText;

console.log(uploadedText);

    console.log(uploadedText);

};

reader.readAsText(file);
    }
});
    
  async function generateAISummary(notes) {

    const response = await fetch("/api/summarise", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            notes: notes
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to generate summary");
    }

    return data.summary;
}

async function generateAIFlashcards(notes) {

    const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            notes: notes
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to generate flashcards");
    }

    return data.flashcards;
}

function parseFlashcards(text) {

    const cards = [];

    const sections = text.split("Question:");

    sections.forEach(section => {

        if(section.trim() === "") return;

        const parts = section.split("Answer:");

        if(parts.length === 2){

            cards.push({

                question: parts[0].trim(),

                answer: parts[1].trim()

            });

        }

    });

    return cards;

}

generateBtn.addEventListener("click", async function () {

    generateBtn.innerHTML = "⏳ Summarising...";
    generateBtn.disabled = true;

    summaryPoints.innerHTML = "";


       const summary = await generateAISummary(uploadedNotes);

   const flashcardText = await generateAIFlashcards(uploadedNotes);

const aiFlashcards = parseFlashcards(flashcardText);

console.log(aiFlashcards);


       const li = document.createElement("li");
       li.textContent = summary;
       summaryPoints.appendChild(li);
        
        generateBtn.innerHTML = 'Summary Complete! ✓';
        generateBtn.disabled = false;
        aiOutput.style.display = 'block';
        
});

const navSummary = document.getElementById('nav-summary');
const navFlashcards = document.getElementById('nav-flashcards');
const navQuizzes = document.getElementById('nav-quizzes');

const viewSummary = document.getElementById('view-summary');
const viewFlashcards = document.getElementById('view-flashcards');
const viewQuizzes = document.getElementById('view-quizzes');

function switchView(activeButton, activeView) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.app-view').forEach(view => view.style.display = 'none');
    
    activeButton.classList.add('active');
    activeView.style.display = 'block';
}

navSummary.addEventListener('click', function() {
    switchView(navSummary, viewSummary);
});

navFlashcards.addEventListener('click', function() {
    switchView(navFlashcards, viewFlashcards);
});

navQuizzes.addEventListener('click', function() {
    switchView(navQuizzes, viewQuizzes);
});


const flashcardContainer = document.getElementById("flashcard-container");
const nextBtn = document.getElementById("next-card");
const prevBtn = document.getElementById("prev-card");
const counter = document.getElementById("card-counter");

let currentCard = 0;
let flashcardElements = [];

function displayFlashcards(cards) {

    flashcardContainer.innerHTML = "";

    flashcardElements = [];

    currentCard = 0;

    cards.forEach((card, index) => {

        const flashcard = document.createElement("div");

        flashcard.className = "flashcard";

        if (index === 0) {
            flashcard.classList.add("active-card");
        }

        flashcard.innerHTML = `
            <div class="flashcard-inner">

                <div class="flashcard-front">
                    <h2>Question</h2>
                    <p>${card.question}</p>
                </div>

                <div class="flashcard-back">
                    <h2>Answer</h2>
                    <p>${card.answer}</p>
                </div>

            </div>
        `;

        flashcard.addEventListener("click", function () {
            flashcard.classList.toggle("flip");
        });

        flashcardContainer.appendChild(flashcard);

        flashcardElements.push(flashcard);
    });

    counter.textContent = `1 / ${flashcardElements.length}`;
}

function showCard(index) {

    if (flashcardElements.length === 0) {
        return;
    }

    flashcardElements.forEach(card => {
        card.classList.remove("active-card");
    });

    flashcardElements[index].classList.add("active-card");

    counter.textContent =
        `${index + 1} / ${flashcardElements.length}`;
}

nextBtn.addEventListener("click", function () {

    if (flashcardElements.length === 0) {
        return;
    }

    currentCard++;

    if (currentCard >= flashcardElements.length) {
        currentCard = 0;
    }

    showCard(currentCard);
});

prevBtn.addEventListener("click", function () {

    if (flashcardElements.length === 0) {
        return;
    }

    currentCard--;

    if (currentCard < 0) {
        currentCard = flashcardElements.length - 1;
    }

    showCard(currentCard);
});

const quizButtons = document.querySelectorAll(".quiz-btn");

quizButtons.forEach(button => {

    button.addEventListener("click", function(){

        quizButtons.forEach(btn => {

            btn.disabled = true;

        });

        if(button.id === "option" + quizData[currentQuestion].answer){

    button.style.backgroundColor = "#10B981";
  score++;

document.getElementById("score-counter").textContent =
    "Score: " + score;

}else{

    button.style.backgroundColor = "#EF4444";

    quizButtons[quizData[currentQuestion].answer].style.backgroundColor = "#10B981";

}

});

});

const quizData = [
  {
    question: "What does HTML stand for?",
    options: [
      "HyperText Markup Language",
      "HighText Machine Language",
      "Home Tool Markup Language",
      "Hyper Transfer Markup"
    ],
    answer: 0
  },
  {
    question: "Which language makes websites interactive?",
    options: [
      "HTML",
      "CSS",
      "JavaScript",
      "Python"
    ],
    answer: 2
  }
];

const quizQuestion = document.getElementById("quiz-question");

const option0 = document.getElementById("option0");
const option1 = document.getElementById("option1");
const option2 = document.getElementById("option2");
const option3 = document.getElementById("option3");

let currentQuestion = 0;
let score = 0;

function loadQuestion() {

    quizQuestion.textContent = quizData[currentQuestion].question;

    option0.textContent = quizData[currentQuestion].options[0];
    option1.textContent = quizData[currentQuestion].options[1];
    option2.textContent = quizData[currentQuestion].options[2];
    option3.textContent = quizData[currentQuestion].options[3];

    document.getElementById("question-counter").textContent =
    "Question " + (currentQuestion + 1) + " / " + quizData.length;
   
    document.getElementById("score-counter").textContent =
    "Score: " + score;

}

loadQuestion();

const nextQuestionBtn = document.getElementById("next-question");


nextQuestionBtn.addEventListener("click", function () {

    currentQuestion++;

    if (currentQuestion >= quizData.length) {

        quizQuestion.innerHTML = "🎉 Quiz Complete!";

        option0.style.display = "none";
        option1.style.display = "none";
        option2.style.display = "none";
        option3.style.display = "none";

        nextQuestionBtn.innerHTML =
            "Score: " + score + " / " + quizData.length;

        return;
    }

    quizButtons.forEach(btn => {
        btn.disabled = false;
        btn.style.backgroundColor = "";
    });

    loadQuestion();

});
