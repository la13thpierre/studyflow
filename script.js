let uploadedNotes = "";
let flashcards = [];
let selectedDifficulty = "Medium"; // default

document.querySelectorAll(".difficulty-btn").forEach(btn => {
    btn.addEventListener("click", function() {
        selectedDifficulty = btn.dataset.level;

        document.querySelectorAll(".difficulty-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});


const fileInput = document.getElementById('file-upload');
const fileNameDisplay = document.getElementById('file-name');
const generateBtn = document.getElementById('generate-btn');
const btnSpinner = document.getElementById('btn-spinner');
const btnText = document.getElementById('btn-text');
const aiOutput = document.getElementById('ai-output');
const summaryPoints = document.getElementById('summary-points');

fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
 if (file) {

        fileNameDisplay.innerHTML = "📄 " + file.name;
        generateBtn.style.display = 'inline-block';
        btnText.textContent = 'Generate Summary';
        generateBtn.disabled = false;
        aiOutput.style.display = 'none';

       const extension = file.name.split('.').pop().toLowerCase();

if (extension === 'txt') {
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedNotes = e.target.result;
        console.log("Loaded TXT:", uploadedNotes);
    };
    reader.readAsText(file);

} else if (extension === 'docx') {
    const reader = new FileReader();
    reader.onload = function(e) {
        mammoth.extractRawText({ arrayBuffer: e.target.result })
            .then(function(result) {
                uploadedNotes = result.value;
                console.log("Loaded DOCX:", uploadedNotes);
            })
            .catch(function(err) {
                console.error("DOCX parsing failed:", err);
                fileNameDisplay.innerHTML = "❌ Could not read this DOCX file";
            });
    };
    reader.readAsArrayBuffer(file);

} else if (extension === 'pdf') {
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            pdfjsLib.GlobalWorkerOptions.workerSrc =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

            const pdf = await pdfjsLib.getDocument({ data: e.target.result }).promise;
            let fullText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const pageText = content.items.map(item => item.str).join(" ");
                fullText += pageText + "\n";
            }

            uploadedNotes = fullText;
            console.log("Loaded PDF:", uploadedNotes);
        } catch (err) {
            console.error("PDF parsing failed:", err);
            fileNameDisplay.innerHTML = "❌ Could not read this PDF file";
        }
    };
    reader.readAsArrayBuffer(file);

} else if (extension === 'pptx') {
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const zip = await JSZip.loadAsync(e.target.result);
            const slideFiles = Object.keys(zip.files)
                .filter(name => name.match(/^ppt\/slides\/slide\d+\.xml$/))
                .sort();

            let fullText = "";

            for (const slideFile of slideFiles) {
                const xml = await zip.files[slideFile].async("string");
                const matches = xml.match(/<a:t>(.*?)<\/a:t>/g) || [];
                const slideText = matches
                    .map(m => m.replace(/<\/?a:t>/g, ""))
                    .join(" ");
                fullText += slideText + "\n";
            }

            uploadedNotes = fullText;
            console.log("Loaded PPTX:", uploadedNotes);
        } catch (err) {
            console.error("PPTX parsing failed:", err);
            fileNameDisplay.innerHTML = "❌ Could not read this PPTX file";
        }
    };
    reader.readAsArrayBuffer(file);

} else {
    fileNameDisplay.innerHTML = "❌ Unsupported file type";
}
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
    console.log("Calling /api/flashcards...");

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
    const cleanText = text.replace(/\*\*/g, ""); // strip markdown bold

    const cards = [];
    const sections = cleanText.split("Question:");

    sections.forEach(section => {
        if (section.trim() === "") return;

        const parts = section.split("Answer:");

        if (parts.length === 2) {
            cards.push({
                question: parts[0].trim(),
                answer: parts[1].trim()
            });
        }
    });

    return cards;
}

function parseQuiz(text) {
    const cleanText = text.replace(/\*\*/g, "");
    const cards = [];

    const sections = cleanText.split("Question:");

    sections.forEach(section => {
        if (section.trim() === "") return;

        const correctMatch = section.match(/Correct:\s*([A-D])/i);
        if (!correctMatch) return;

        const questionText = section.split("A)")[0].trim();

        const optionA = section.split("A)")[1]?.split("B)")[0]?.trim();
        const optionB = section.split("B)")[1]?.split("C)")[0]?.trim();
        const optionC = section.split("C)")[1]?.split("D)")[0]?.trim();
        const optionD = section.split("D)")[1]?.split("Correct:")[0]?.trim();

        const answerLetter = correctMatch[1].toUpperCase();
        const answerIndex = { A: 0, B: 1, C: 2, D: 3 }[answerLetter];

        cards.push({
            question: questionText,
            options: [optionA, optionB, optionC, optionD],
            answer: answerIndex
        });
    });

    return cards;
}

generateBtn.addEventListener("click", async function () {

   btnSpinner.style.display = 'inline-block';
btnText.textContent = 'Summarising...';
generateBtn.disabled = true;
    summaryPoints.innerHTML = "";


       const summary = await generateAISummary(uploadedNotes);

   const flashcardText = await generateAIFlashcards(uploadedNotes);

const aiFlashcards = parseFlashcards(flashcardText);

console.log(aiFlashcards);

displayFlashcards(aiFlashcards);
switchView(navFlashcards, viewFlashcards);

const quizText = await generateAIQuiz(uploadedNotes, selectedDifficulty);
console.log("RAW QUIZ TEXT:", quizText);
quizData = parseQuiz(quizText);
console.log("PARSED QUIZ DATA:", quizData);
currentQuestion = 0;
score = 0;
if (quizData.length > 0) {
    loadQuestion();
}

       const li = document.createElement("li");
       li.textContent = summary;
       summaryPoints.appendChild(li);
        
        btnSpinner.style.display = 'none';
btnText.textContent = 'Summary Complete! ✓';
generateBtn.disabled = false;
        
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

async function generateAIQuiz(notes, difficulty) {

    const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            notes: notes,
            difficulty: difficulty
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to generate quiz");
    }

    return data.quiz;
}

let quizData = []; // starts empty, gets filled after generation


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

const regenSummaryBtn = document.getElementById('regen-summary-btn');
const regenFlashcardsBtn = document.getElementById('regen-flashcards-btn');
const regenQuizBtn = document.getElementById('regen-quiz-btn');

regenSummaryBtn.addEventListener('click', async function () {
    regenSummaryBtn.disabled = true;
    regenSummaryBtn.textContent = "⏳ Regenerating...";
    const summary = await generateAISummary(uploadedNotes);
    summaryPoints.innerHTML = "";
    const li = document.createElement("li");
    li.textContent = summary;
    summaryPoints.appendChild(li);
    regenSummaryBtn.disabled = false;
    regenSummaryBtn.textContent = "🔄 New Summary";
});

regenFlashcardsBtn.addEventListener('click', async function () {
    regenFlashcardsBtn.disabled = true;
    regenFlashcardsBtn.textContent = "⏳ Regenerating...";
    const flashcardText = await generateAIFlashcards(uploadedNotes);
    const aiFlashcards = parseFlashcards(flashcardText);
    displayFlashcards(aiFlashcards);
    regenFlashcardsBtn.disabled = false;
    regenFlashcardsBtn.textContent = "🔄 New Flashcards";
});

regenQuizBtn.addEventListener('click', async function () {
    regenQuizBtn.disabled = true;
    regenQuizBtn.textContent = "⏳ Regenerating...";
    const quizText = await generateAIQuiz(uploadedNotes, selectedDifficulty);
    quizData = parseQuiz(quizText);
    currentQuestion = 0;
    score = 0;
    if (quizData.length > 0) loadQuestion();
    quizButtons.forEach(btn => {
        btn.disabled = false;
        btn.style.backgroundColor = "";
    });
    regenQuizBtn.disabled = false;
    regenQuizBtn.textContent = "🔄 New Quiz";
});