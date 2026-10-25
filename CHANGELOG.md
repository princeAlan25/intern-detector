# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-25

### Added
- **Monorepo Architecture**: Clean separation into `@intern-detector/backend` and `@intern-detector/frontend` using npm workspaces.
- **Dual-Layer Analysis Engine**:
  - **OpenRouter AI Engine**: Deep semantic reasoning using OpenRouter models (e.g., Basesten Elephant, NVIDIA Nemotron, LLaMA 3.3) to classify nuanced fraudulent patterns and highlight evidence.
  - **Deterministic Heuristic Rules Engine**: Zero-latency regex and pattern checking for fee demands, unrealistic compensation, Telegram/WhatsApp redirects, free email domains, and trust signals (`.edu` domains, ATS job boards).
  - **Automatic Fallback Mechanism**: Seamless failover to the heuristic engine if the OpenRouter API key is absent or network requests fail.
- **Frontend Controller-Presenter Architecture**:
  - Responsive, accessible dashboard styled with Tailwind CSS v4.
  - Silent Empty Guard preventing empty or whitespace-only submissions.
  - Dynamic Trust Score gauge (1-10) with reactive color badges (Safe, Caution, High Risk).
  - Responsive findings card grid and concrete evidence tags.
- **Comprehensive Testing Suite**:
  - 21 backend unit and integration tests covering heuristic rules, OpenRouter parsing, fallback safety, and REST endpoints.
  - 10 frontend unit and DOM presenter tests covering sanitization, badge themes, and HTML generation.
- **Developer Experience**:
  - Unified root npm scripts (`npm start`, `npm run dev`, `npm test`).
  - OpenRouter live verification utility (`npm run test:openrouter`).
