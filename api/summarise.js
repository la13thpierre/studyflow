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
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent",
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
                                    text: `Summarise these revision notes into short bullet points:

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

        const summary =
            data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!summary) {
            return res.status(500).json({
                error: "No summary was returned"
            });
        }

        return res.status(200).json({
            summary: summary
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
}