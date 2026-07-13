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
    }
});

generateBtn.addEventListener('click', function() {
    generateBtn.innerHTML = '⏳ Summarising...';
    generateBtn.disabled = true; 
    
    setTimeout(function() {
        summaryPoints.innerHTML = '';
        
        const fakePoints = [
            "Core Concept: Main definitions and foundational formulas identified from your notes.",
            "Key Metric: Identified high-priority terminology likely to appear on exam specifications.",
            "Action Item: Review matching summary flashcards to solidify retention before tomorrow."
        ];
        
        fakePoints.forEach(function(point) {
            const li = document.createElement('li');
            li.textContent = point;
            summaryPoints.appendChild(li);
        });
        
        generateBtn.innerHTML = 'Summary Complete! ✓';
        generateBtn.disabled = false;
        aiOutput.style.display = 'block';
        
    }, 2000);
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


const flashcards = document.querySelectorAll(".flashcard");
const nextBtn = document.getElementById("next-card");
const prevBtn = document.getElementById("prev-card");
const counter = document.getElementById("card-counter");

let currentCard = 0;

function showCard(index){

    flashcards.forEach(card=>{
        card.classList.remove("active-card");
    });

    flashcards[index].classList.add("active-card");

    counter.textContent = `${index + 1} / ${flashcards.length}`;
}

nextBtn.addEventListener("click",function(){

    currentCard++;

    if(currentCard >= flashcards.length){
        currentCard = 0;
    }

    showCard(currentCard);

});

prevBtn.addEventListener("click",function(){

    currentCard--;

    if(currentCard < 0){
        currentCard = flashcards.length - 1;
    }

    showCard(currentCard);

});

showCard(0);

const quizButtons = document.querySelectorAll(".quiz-btn");

quizButtons.forEach(button => {

    button.addEventListener("click", function(){

        quizButtons.forEach(btn => {

            btn.disabled = true;

        });

        if(button.classList.contains("correct")){

    button.style.backgroundColor = "#10B981";
    score++;

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
