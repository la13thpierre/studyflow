const fileInput = document.getElementById('file-upload');
const fileNameDisplay = document.getElementById('file-name');
const generateBtn = document.getElementById('generate-btn');
const aiOutput = document.getElementById('ai-output');
const summaryPoints = document.getElementById('summary-points');

const navSummary = document.getElementById('nav-summary');
const navFlashcards = document.getElementById('nav-flashcards');
const navQuizzes = document.getElementById('nav-quizzes');

const viewSummary = document.getElementById('view-summary');
const viewFlashcards = document.getElementById('view-flashcards');
const viewQuizzes = document.getElementById('view-quizzes');

if (fileInput) {
    fileInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            fileNameDisplay.innerHTML = "📄 " + e.target.files[0].name;
            generateBtn.style.display = 'inline-block';
            generateBtn.innerHTML = 'Generate Summary';
            generateBtn.disabled = false;
            aiOutput.style.display = 'none';
        }
    });
}

if (generateBtn) {
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
}

navSummary.addEventListener('click', function() {
    navSummary.classList.add('active');
    navFlashcards.classList.remove('active');
    navQuizzes.classList.remove('active');
    viewSummary.style.display = 'block';
    viewFlashcards.style.display = 'none';
    viewQuizzes.style.display = 'none';
});

navFlashcards.addEventListener('click', function() {
    navSummary.classList.remove('active');
    navFlashcards.classList.add('active');
    navQuizzes.classList.remove('active');
    viewSummary.style.display = 'none';
    viewFlashcards.style.display = 'block';
    viewQuizzes.style.display = 'none';
});

navQuizzes.addEventListener('click', function() {
    navSummary.classList.remove('active');
    navFlashcards.classList.remove('active');
    navQuizzes.classList.add('active');
    viewSummary.style.display = 'none';
    viewFlashcards.style.display = 'none';
    viewQuizzes.style.display = 'block';
});

