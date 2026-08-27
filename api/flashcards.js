export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { notes } = req.body;

        if (!notes) {
            return res.status(400).json({ error: "No notes provided" });
        }

        const prompt = `Turn these revision notes into 5 flashcards.

Do NOT use markdown, asterisks, or bold formatting. Plain text only.

Format exactly like this:

Question: ...
Answer: ...

Question: ...
Answer: ...

Question: ...
Answer: ...

Question: ...
Answer: ...

Question: ...
Answer: ...

Notes:
${notes}`;

        let flashcards, provider;
        try {
            const result = await generateAIContent(prompt);
            flashcards = result.text;
            provider = result.provider;
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }

        return res.status(200).json({ flashcards, provider });

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