export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { notes } = req.body;

        if (!notes) {
            return res.status(400).json({ error: "No notes provided" });
        }

        let summary, provider;
        try {
            const result = await summariseNotes(notes);
            summary = result.text;
            provider = result.provider;
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }

        return res.status(200).json({ summary, provider });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// Roughly 4 characters per token — keep chunks safely under Groq's 8000 TPM limit
const CHUNK_CHAR_LIMIT = 12000; // ~3000 tokens per chunk, leaves headroom for prompt + output

function chunkText(text, maxChars = CHUNK_CHAR_LIMIT) {
    const chunks = [];
    for (let i = 0; i < text.length; i += maxChars) {
        chunks.push(text.slice(i, i + maxChars));
    }
    return chunks;
}

async function summariseNotes(notes) {
    const chunks = chunkText(notes);

    if (chunks.length === 1) {
        const prompt = `Summarise these revision notes into short bullet points:\n\n${notes}`;
        return await generateAIContent(prompt);
    }

    const chunkSummaries = [];

    for (let i = 0; i < chunks.length; i++) {
        const prompt = `Summarise this section of revision notes into short bullet points:\n\n${chunks[i]}`;
        const result = await generateAIContent(prompt);
        chunkSummaries.push(result.text);

        // Small pause between chunks to avoid stacking up Groq's per-minute token limit
        if (i < chunks.length - 1) {
            await new Promise(r => setTimeout(r, 4000));
        }
    }

    const combinePrompt = `Combine and condense these section summaries into one clean, well-organised set of bullet point revision notes. Remove repetition, keep it concise:\n\n${chunkSummaries.join("\n\n")}`;
    return await generateAIContent(combinePrompt);
}

// Tries Gemini (2 models, short retry), falls back to Groq (with rate-limit retry) if both are overloaded
const GEMINI_MODELS = ["gemini-flash-latest", "gemini-2.5-flash-lite"];

async function generateAIContent(prompt) {
    for (const model of GEMINI_MODELS) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        for (let attempt = 1; attempt <= 2; attempt++) {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.GEMINI_API_KEY
                },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (response.ok) {
                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return { text, provider: model };
            }

            if (response.status !== 503) break;
            if (attempt < 2) await new Promise(r => setTimeout(r, 2000));
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