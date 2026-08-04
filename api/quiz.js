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
            "https://generativelanguage.googleapis.com/v1beta/models/YOUR_WORKING_MODEL:generateContent",
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
                                    text: `Create 5 multiple-choice quiz questions from these revision notes.

Return ONLY valid JSON in this exact format:

[
  {
    "question": "Question here",
    "options": [
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4"
    ],
    "answer": 0
  }
]

The answer number must be 0, 1, 2, or 3 depending on which option is correct.

Revision notes:

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

        let quizText =
            data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!quizText) {
            return res.status(500).json({
                error: "No quiz was returned"
            });
        }

        quizText = quizText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const quiz = JSON.parse(quizText);

        return res.status(200).json({
            quiz: quiz
        });

    } catch (error) {

        return res.status(500).json({
            error: error.message
        });

    }
}