export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { notes, difficulty, quizType } = req.body;

        if (!notes) {
            return res.status(400).json({ error: "No notes provided" });
        }

        const level = difficulty || "Medium";
        const type = quizType || "Mixed";

        const difficultyInstructions = {
            Easy: "Make the questions simple, testing basic recall of facts.",
            Medium: "Make the questions moderately challenging, testing understanding and application.",
            Hard: "Make the questions difficult, testing deep understanding, edge cases, and critical thinking."
        };

        const formatInstructions = {
            MultipleChoice: `Generate 5 multiple choice questions.

Format exactly like this for each question:

Question: ...
A) ...
B) ...
C) ...
D) ...
Correct: A`,

            TrueFalse: `Generate 5 true/false questions.

Format exactly like this for each question (only two options, True and False):

Question: ...
A) True
B) False
Correct: A`,

            Mixed: `Generate a mix: 3 multiple choice questions and 2 true/false questions, in any order.

For multiple choice questions, format exactly like this:

Question: ...
A) ...
B) ...
C) ...
D) ...
Correct: A

For true/false questions, format exactly like this (only two options, True and False):

Question: ...
A) True
B) False
Correct: A`
        };

        const prompt = `Turn these revision notes into a quiz.

Difficulty: ${level}. ${difficultyInstructions[level]}

Do NOT use markdown, asterisks, or bold formatting. Plain text only.

${formatInstructions[type]}

Notes:
${notes}`;

        let quiz, provider;
        try {
            const result = await generateAIContent(prompt);
            quiz = result.text;
            provider = result.provider;
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }

        return res.status(200).json({ quiz, provider });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// Tries Gemini (2 models, 6s timeout each), falls back to Groq (with rate-limit retry) if both fail/timeout
const GEMINI_MODELS = ["gemini-flash-latest", "gemini-2.5-flash-lite"];
const GEMINI_TIMEOUT_MS = 6000;

async function generateAIContent(prompt) {
    for (const model of GEMINI_MODELS) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.GEMINI_API_KEY
                },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return { text, provider: model };
            }
        } catch (err) {
            clearTimeout(timeoutId);
        }
    }

    // Fall back to Groq, retrying once if we hit its rate limit
    for (let attempt = 1; attempt <= 2; attempt++) {
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-120b",
                messages: [{ role: "user", content: prompt }]
            })
        });

        if (groqResponse.ok) {
            const groqData = await groqResponse.json();
            const text = groqData.choices?.[0]?.message?.content;
            if (text) return { text, provider: "groq-openai-gpt-oss-120b" };
        }

        if (groqResponse.status === 429 && attempt < 2) {
            const errData = await groqResponse.json().catch(() => ({}));
            const match = errData.error?.message?.match(/try again in ([\d.]+)s/);
            const waitMs = match ? Math.ceil(parseFloat(match[1]) * 1000) + 500 : 20000;
            await new Promise(r => setTimeout(r, waitMs));
            continue;
        }

        const errData = await groqResponse.json().catch(() => ({}));
        throw new Error(errData.error?.message || "All providers failed (Gemini + Groq)");
    }

    throw new Error("Groq rate limit persisted after retry");
}