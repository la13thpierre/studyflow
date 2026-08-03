export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { notes } = req.body;

        if (!notes) {
            return res.status(400).json({
                error: "No notes provided"
            });
        }

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
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

        const flashcards =
            data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!flashcards) {
            return res.status(500).json({
                error: "No flashcards were returned"
            });
        }

        return res.status(200).json({
            flashcards: flashcards
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
}