# studyflow
 Turn your class notes into AI-powered summaries and flashcards in seconds.


## CI/CD Pipeline

StudyFlow uses GitHub Actions to automate containerisation and image security scanning on every push to `main`:

1. **Build** — the app is containerised using a custom `Dockerfile`.
2. **Push** — the built image is pushed to Docker Hub (`la13th/studyflow:latest`).
3. **Scan** — the pushed image is scanned with [Trivy](https://github.com/aquasecurity/trivy) for CRITICAL and HIGH severity vulnerabilities, giving visibility into any risky dependencies before deployment.

This pipeline is defined in [`.github/workflows/docker-build.yml`](.github/workflows/docker-build.yml).