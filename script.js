const SUPABASE_URL = "https://vakdkccooxldulswmuni.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZha2RrY2Nvb3hsZHVsc3dtdW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODQyMzksImV4cCI6MjEwMTg2MDIzOX0.kXtGgBenhrPqNsCIqisZW3SrhJ3il2p_TUv50UO2HUM";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const authLoggedOut = document.getElementById('auth-logged-out');
const authLoggedIn = document.getElementById('auth-logged-in');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authMessage = document.getElementById('auth-message');
const userEmailSpan = document.getElementById('user-email');

let currentUser = null;
let currentNoteId = null;

document.getElementById('signup-btn').addEventListener('click', async function () {
    const { data, error } = await supabaseClient.auth.signUp({
        email: authEmail.value,
        password: authPassword.value
    });

    if (error) {
        authMessage.textContent = error.message;
    } else {
        authMessage.style.color = "#10B981";
        authMessage.textContent = "Check your email to confirm your account!";
    }
});

document.getElementById('login-btn').addEventListener('click', async function () {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: authEmail.value,
        password: authPassword.value
    });

    if (error) {
        authMessage.textContent = error.message;
    } else {
        checkAuthState();
    }
});

document.getElementById('logout-btn').addEventListener('click', async function () {
    await supabaseClient.auth.signOut();
    checkAuthState();
});

document.getElementById('google-login-btn').addEventListener('click', async function () {
    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google'
    });

    if (error) {
        authMessage.textContent = error.message;
    }
});

document.getElementById('facebook-login-btn').addEventListener('click', async function () {
    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'facebook'
    });

    if (error) {
        authMessage.textContent = error.message;
    }
});

const authContainer = document.getElementById('auth-container');
const navAuth = document.getElementById('nav-auth');

navAuth.addEventListener('click', function() {
    if (authContainer.style.display === 'none') {
        authContainer.style.display = 'block';
    } else {
        authContainer.style.display = 'none';
    }
});

async function checkAuthState() {
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (user) {
        authLoggedOut.style.display = 'none';
        authLoggedIn.style.display = 'block';
        userEmailSpan.textContent = user.email;
        navAuth.textContent = user.email;
    } else {
        authLoggedOut.style.display = 'block';
        authLoggedIn.style.display = 'none';
        navAuth.textContent = "Sign In";
    }
}

checkAuthState();
const hamburgerBtn = document.getElementById('hamburger-btn');
const navLinks = document.getElementById('nav-links');

hamburgerBtn.addEventListener('click', function () {
    navLinks.classList.toggle('open');
});

// Close the mobile menu after tapping any nav link
navLinks.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        navLinks.classList.remove('open');
    });
});


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

let selectedQuizType = "Mixed"; // default

document.querySelectorAll(".quiztype-btn").forEach(btn => {
    btn.addEventListener("click", function() {
        selectedQuizType = btn.dataset.type;

        document.querySelectorAll(".quiztype-btn").forEach(b => b.classList.remove("active"));
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

        const afterQuestion = section.split("Answer:");
        if (afterQuestion.length < 2) return;

        const questionText = afterQuestion[0].trim();

        const afterAnswer = afterQuestion[1].split("Mnemonic:");
        const answerText = afterAnswer[0].trim();
        const mnemonicText = afterAnswer[1] ? afterAnswer[1].trim() : "";

        cards.push({
            question: questionText,
            answer: answerText,
            mnemonic: mnemonicText
        });
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
        const optionB = section.split("B)")[1]?.split(/C\)|Correct:/)[0]?.trim();
        const optionCRaw = section.includes("C)") ? section.split("C)")[1]?.split(/D\)|Correct:/)[0]?.trim() : null;
        const optionDRaw = section.includes("D)") ? section.split("D)")[1]?.split("Correct:")[0]?.trim() : null;

        const options = [optionA, optionB];
        if (optionCRaw) options.push(optionCRaw);
        if (optionDRaw) options.push(optionDRaw);

        const answerLetter = correctMatch[1].toUpperCase();
        const answerIndex = { A: 0, B: 1, C: 2, D: 3 }[answerLetter];

        cards.push({
            question: questionText,
            options: options,
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

    try {
        const summary = await generateAISummary(uploadedNotes);

        const { data: { user } } = await supabaseClient.auth.getUser();
        currentUser = user;
        currentNoteId = null;

        if (user) {
            const { data: noteData, error: noteError } = await supabaseClient
                .from('notes')
                .insert({
                    user_id: user.id,
                    title: fileNameDisplay.textContent.replace("📄 ", ""),
                    raw_text: uploadedNotes
                })
                .select()
                .single();

            if (!noteError) {
                currentNoteId = noteData.id;

                await supabaseClient.from('summaries').insert({
                    user_id: user.id,
                    note_id: currentNoteId,
                    content: summary
                });
            } else {
                console.error("Failed to save note:", noteError);
            }
        }

        const flashcardText = await generateAIFlashcards(uploadedNotes);

        if (currentUser && currentNoteId) {
            const aiFlashcardsForSave = parseFlashcards(flashcardText);
            const flashcardRows = aiFlashcardsForSave.map(card => ({
                user_id: currentUser.id,
                note_id: currentNoteId,
                question: card.question,
                answer: card.answer
            }));

            if (flashcardRows.length > 0) {
                await supabaseClient.from('flashcards').insert(flashcardRows);
            }
        }

        const aiFlashcards = parseFlashcards(flashcardText);
        displayFlashcards(aiFlashcards);
        switchView(navFlashcards, viewFlashcards);

        const quizText = await generateAIQuiz(uploadedNotes, selectedDifficulty, selectedQuizType);
        quizData = parseQuiz(quizText);
        currentQuestion = 0;
        score = 0;
        if (quizData.length > 0) {
            loadQuestion();
        }

        const points = summary.split(/\n+/).map(line => line.replace(/^-\s*/, "").trim()).filter(line => line.length > 0);
        points.forEach(point => {
            const li = document.createElement("li");
            li.textContent = point;
            summaryPoints.appendChild(li);
        });

        btnSpinner.style.display = 'none';
        btnText.textContent = 'Summary Complete! ✓';
        generateBtn.disabled = false;

    } catch (error) {
        console.error("Generation failed:", error);
        btnSpinner.style.display = 'none';
        btnText.textContent = '⚠️ Gemini is busy — try again in a moment';
        generateBtn.disabled = false;
    }
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

const navDashboard = document.getElementById('nav-dashboard');
const viewDashboard = document.getElementById('view-dashboard');

navDashboard.addEventListener('click', async function() {
    switchView(navDashboard, viewDashboard);
    await loadDashboardStats();
});

async function loadDashboardStats() {
    if (!currentUser) {
        const { data: { user } } = await supabaseClient.auth.getUser();
        currentUser = user;
    }

    if (!currentUser) {
        return;
    }

    const { count: notesCount } = await supabaseClient
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUser.id);

    const { count: flashcardsCount } = await supabaseClient
        .from('flashcards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUser.id);

    const { data: quizAttempts } = await supabaseClient
        .from('quiz_attempts')
        .select('score, total_questions')
        .eq('user_id', currentUser.id);

    document.getElementById('stat-notes').textContent = notesCount || 0;
    document.getElementById('stat-flashcards').textContent = flashcardsCount || 0;
    document.getElementById('stat-quizzes').textContent = quizAttempts ? quizAttempts.length : 0;

if (quizAttempts && quizAttempts.length > 0) {
        const totalPercent = quizAttempts.reduce((sum, attempt) => {
            return sum + (attempt.score / attempt.total_questions) * 100;
        }, 0);
        const avgPercent = Math.round(totalPercent / quizAttempts.length);
        document.getElementById('stat-avg-score').textContent = avgPercent + "%";
    } else {
        document.getElementById('stat-avg-score').textContent = "0%";
    }

    const { data: notesForStreak } = await supabaseClient
        .from('notes')
        .select('created_at')
        .eq('user_id', currentUser.id);

    const streak = calculateStreak(notesForStreak);
    document.getElementById('stat-streak').textContent = streak;
}

function calculateStreak(rows) {
    if (!rows || rows.length === 0) return 0;

    const uniqueDays = new Set(
        rows.map(row => new Date(row.created_at).toDateString())
    );

    const dayList = Array.from(uniqueDays).map(d => new Date(d));
    dayList.sort((a, b) => b - a);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let expectedDate = new Date(today);

    for (const day of dayList) {
        day.setHours(0, 0, 0, 0);

        if (day.getTime() === expectedDate.getTime()) {
            streak++;
            expectedDate.setDate(expectedDate.getDate() - 1);
        } else if (day.getTime() < expectedDate.getTime()) {
            break;
        }
    }

    return streak;
}

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
                    ${card.mnemonic ? `<p class="mnemonic-hint">💡 ${card.mnemonic}</p>` : ""}
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

async function generateAIQuiz(notes, difficulty, quizType) {

    const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            notes: notes,
            difficulty: difficulty,
            quizType: quizType
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

    const currentOptions = quizData[currentQuestion].options;

    quizQuestion.textContent = quizData[currentQuestion].question;

    quizButtons.forEach((btn, index) => {
        if (index < currentOptions.length) {
            btn.textContent = currentOptions[index];
            btn.style.display = "block";
            btn.disabled = false;
            btn.style.backgroundColor = "";
        } else {
            btn.style.display = "none";
        }
    });

    document.getElementById("question-counter").textContent =
    "Question " + (currentQuestion + 1) + " / " + quizData.length;
   
    document.getElementById("score-counter").textContent =
    "Score: " + score;

}



const nextQuestionBtn = document.getElementById("next-question");


nextQuestionBtn.addEventListener("click", async function () {

    currentQuestion++;

  if (currentQuestion >= quizData.length) {

        quizQuestion.innerHTML = "🎉 Quiz Complete!";

        quizButtons.forEach(btn => btn.style.display = "none");
nextQuestionBtn.innerHTML =
            "Score: " + score + " / " + quizData.length;

        confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 }
        });

        if (currentUser && currentNoteId) {
            const { error: quizError } = await supabaseClient.from('quiz_attempts').insert({
                user_id: currentUser.id,
                note_id: currentNoteId,
                difficulty: selectedDifficulty,
                score: score,
                total_questions: quizData.length
            });

            if (quizError) {
                console.error("Failed to save quiz attempt:", quizError);
            }
        }

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
    const points = summary.split(/\n+/).map(line => line.replace(/^-\s*/, "").trim()).filter(line => line.length > 0);
    points.forEach(point => {
        const li = document.createElement("li");
        li.textContent = point;
        summaryPoints.appendChild(li);
    });
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
   const quizText = await generateAIQuiz(uploadedNotes, selectedDifficulty, selectedQuizType);
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

const navReview = document.getElementById('nav-review');
const viewReview = document.getElementById('view-review');
const reviewCardContainer = document.getElementById('review-card-container');
const reviewControls = document.getElementById('review-controls');
const reviewEmpty = document.getElementById('review-empty');

let reviewQueue = [];
let currentReviewCard = null;
let totalReviewCount = 0;

navReview.addEventListener('click', async function () {
    switchView(navReview, viewReview);
    await loadReviewQueue();
});

async function loadReviewQueue() {
    if (!currentUser) {
        const { data: { user } } = await supabaseClient.auth.getUser();
        currentUser = user;
    }

    if (!currentUser) {
        reviewCardContainer.innerHTML = "<p>Please sign in to review flashcards.</p>";
        reviewControls.style.display = 'none';
        reviewEmpty.style.display = 'none';
        return;
    }

    const { data: dueCards, error } = await supabaseClient
        .from('flashcards')
        .select('*')
        .eq('user_id', currentUser.id)
        .lte('next_review_date', new Date().toISOString())
        .order('next_review_date', { ascending: true });

    if (error) {
        console.error("Failed to load review queue:", error);
        return;
    }

    reviewQueue = dueCards || [];
    totalReviewCount = reviewQueue.length;
    showNextReviewCard();
}

function showNextReviewCard() {
    const reviewProgress = document.getElementById('review-progress');
    const reviewFeedback = document.getElementById('review-feedback');

    if (reviewQueue.length === 0) {
        reviewCardContainer.innerHTML = "";
        reviewControls.style.display = 'none';
        reviewEmpty.style.display = 'block';
        reviewProgress.textContent = "";
        reviewFeedback.style.display = 'none';
        currentReviewCard = null;
        return;
    }

    reviewEmpty.style.display = 'none';
    reviewControls.style.display = 'block';
    reviewFeedback.style.display = 'none';

    const cardsDone = totalReviewCount - reviewQueue.length;
    reviewProgress.textContent = `Card ${cardsDone + 1} of ${totalReviewCount}`;

    currentReviewCard = reviewQueue[0];

    reviewCardContainer.innerHTML = `
        <div class="flashcard active-card" id="review-flip-card">
            <div class="flashcard-inner">
                <div class="flashcard-front">
                    <h2>Question</h2>
                    <p>${currentReviewCard.question}</p>
                </div>
                <div class="flashcard-back">
                    <h2>Answer</h2>
                    <p>${currentReviewCard.answer}</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('review-flip-card').addEventListener('click', function () {
        this.classList.toggle('flip');
    });
}

async function answerReviewCard(gotIt) {
    if (!currentReviewCard) return;

    let newInterval;
    if (gotIt) {
        newInterval = Math.min((currentReviewCard.interval_days || 1) * 2, 60);
    } else {
        newInterval = 1;
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);

    const { error } = await supabaseClient
        .from('flashcards')
        .update({
            interval_days: newInterval,
            next_review_date: nextDate.toISOString()
        })
        .eq('id', currentReviewCard.id);

    if (error) {
        console.error("Failed to update card:", error);
    }

    reviewQueue.shift();
    showNextReviewCard();
}

document.getElementById('review-got-it').addEventListener('click', function () {
    answerReviewCard(true);
});

document.getElementById('review-didnt-know').addEventListener('click', function () {
    answerReviewCard(false);
});