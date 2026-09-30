# StudyFlow

Turn your class notes into AI-powered summaries, flashcards, and quizzes in seconds. Built as both a genuinely useful study tool and a DevOps portfolio piece.

**Live demo:** https://studyflow-lemon-three.vercel.app/

## Features

- **File upload** — supports TXT, DOCX, PDF, and PPTX (via Mammoth, PDF.js, and JSZip)
- **AI Summaries** — condenses notes into clear bullet-point summaries
- **AI Flashcards** — auto-generated from your notes, with flip animations and AI-generated mnemonics for hard-to-remember answers
- **AI Quizzes** — multiple choice, true/false, or mixed, with adjustable difficulty (Easy/Medium/Hard)
- **Spaced-repetition Review mode** — cards resurface based on how well you know them, with an Again/Hard/Good/Easy scoring scale that adjusts the next review interval
- **AI Tutor chat** — ask questions about your own uploaded notes; answers are grounded only in your notes, and the tutor explicitly says so if something isn't covered rather than guessing
- **Accounts & progress tracking** — sign in with email/password, Google, or Facebook; a live dashboard shows notes uploaded, flashcards generated, quizzes completed, average score, and day streak

## Tech Stack

- **Frontend/Backend:** Vanilla JS, hosted on Vercel
- **AI:** Gemini API (primary) with automatic fallback to Groq — see [AI Reliability](#ai-reliability) below
- **Auth & Database:** Supabase (Auth + Postgres, with row-level security tied to user ID)
- **File parsing:** Mammoth (DOCX), PDF.js (PDF), JSZip (PPTX)

## AI Reliability

Free-tier AI APIs are prone to rate limits and overload errors, so each AI feature (summaries, flashcards, quizzes, tutor chat) uses the same fallback chain:

1. Try Gemini (`gemini-flash-latest`), with a short timeout (no long backoff waiting)
2. If that fails, try a second Gemini model (`gemini-2.5-flash-lite`)
3. If both fail, fall back to Groq (`openai/gpt-oss-120b`), with automatic retry on Groq's rate-limit errors (parses the API's own suggested wait time and retries once)

Long notes are automatically chunked and summarized in pieces to stay under Groq's per-request token limit, then combined into one final summary.

This means short notes resolve fast (usually a single Gemini call), and long notes still succeed via chunking instead of erroring out — at the cost of being a bit slower.

## DevOps Setup

This project doubles as a DevOps portfolio piece, built into the same repo as the live product:

- **Containerization:** `Dockerfile` + `.dockerignore`, hardened (non-root user, `npm ci` instead of `npm install`, `--omit=dev`)
- **CI/CD:** GitHub Actions builds the Docker image, scans it with [Trivy](https://github.com/aquasecurity/trivy) (blocks on CRITICAL/HIGH vulnerabilities), and pushes to Docker Hub tagged with both `:latest` and the git SHA for rollback. Defined in [`.github/workflows/docker-build.yml`](.github/workflows/docker-build.yml)
- **Dependency updates:** Dependabot configured for npm, Docker, and GitHub Actions ecosystems
- **Infrastructure as Code:** Terraform (`terraform/`) provisions an EC2 instance on AWS — auto-fetches the latest Amazon Linux 2023 AMI, restricts SSH ingress to a single IP, and passes API keys/secrets into the container via Terraform variables (kept out of version control via `.gitignore`)

Note: the live product runs on Vercel. The Docker/Terraform/EC2 setup is a parallel, independent DevOps demonstration — not what serves real users — showing the same app containerized and deployable to traditional infrastructure.

## Notable Bugs Fixed

A few real issues hit and fixed during development, kept here because they're more instructive than "it just worked":

- **Hidden-parent CSS bug** — the Review view was rendering blank despite the JS correctly switching to it, because a missing closing `</div>` left it nested inside the Dashboard view's markup
- **Unclosed CSS rule** — `.active-card` was missing its closing brace, silently breaking every style rule defined after it in the file
- **Groq rate-limit stacking** — summary, flashcard, and quiz generation fired back-to-back on the same button click, all sharing Groq's account-wide token-per-minute budget; added short delays between calls so the budget has time to partially recover
- **Nav overflow on mobile** — the nav bar was pushing items off-screen on small viewports; fixed with a hamburger menu under a 768px breakpoint

