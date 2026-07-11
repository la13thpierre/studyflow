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

