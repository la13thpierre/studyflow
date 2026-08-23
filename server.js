const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/summarise', async (req, res) => {
    try {
        const { notes } = req.body;

        if (!notes) {
            return res.status(400).json({ error: "No notes provided" });
        }

        const response = await callGeminiWithRetry(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.GEMINI_API_KEY
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: `Summarise these revision notes into short bullet points:\n\n${notes}` }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error?.message || "Gemini API request failed"
            });
        }

        const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!summary) {
            return res.status(500).json({ error: "No summary was returned" });
        }

        return res.status(200).json({ summary: summary });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.post('/api/flashcards', async (req, res) => {
    try {
        const { notes } = req.body;

        if (!notes) {
            return res.status(400).json({ error: "No notes provided" });
        }

        const response = await callGeminiWithRetry(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.GEMINI_API_KEY
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Turn these revision notes into 5 flashcards.

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
${notes}`
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.error?.message || "Gemini API request failed"
            });
        }

        const flashcards = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!flashcards) {
            return res.status(500).json({ error: "No flashcards were returned" });
        }

        return res.status(200).json({ flashcards: flashcards });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`StudyFlow server running on port ${PORT}`);
});