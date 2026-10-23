---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn

## Slices

- [x] **1. Project setup and core analysis engine**
  Becomes usable: A running TypeScript Express backend listening on `http://localhost:3000`, exposing `POST /api/analyze` which evaluates message text or URLs for scam red flags and legitimate trust signals, returning a strictly typed JSON verdict with a score (1–10), summary, and findings containing reasons paired with arrays of evidence.
  Why now: Tackles the project's unique kernel (pattern detection and scoring) and bootstrapping (TypeScript, Express, types, project configuration) first so every subsequent frontend step builds on a working foundation.
  PRD ref: `prd.md > Features and Behavior > 1. Scam & Legitimacy Evaluation` & `2. Side-by-Side Reasons & Evidence`
  Spec ref: `spec.md > Stack`, `spec.md > Components > 2. API Server`, `3. Analyzer Engine`, `4. Shared Type Definitions`, `spec.md > Data Model`
  Build: Initialize `package.json`, install dependencies (`express`, `tsx`, `typescript`, `@types/node`, `@types/express`, `tailwindcss`, `dotenv`), configure `tsconfig.json`, create `src/types.ts`, implement `src/rules.ts` (heuristics for fees, unrealistic salary, domains, urgency, and legitimate signals), create `src/analyzer.ts`, and wire up `src/server.ts`.
  Verify (mechanical): Start the server with `npx tsx src/server.ts`, make test HTTP requests to `/api/analyze` using curl/node test script with sample scam and legitimate inputs, and verify HTTP 200 with matching typed `AnalysisResponse` schema (valid `trustScore`, `verdict`, and `findings` with `evidences` array).
  Learner check: Run a test curl/request command against `http://localhost:3000/api/analyze` and verify the server outputs a structured JSON response identifying the scam pattern and extracted evidence quotes.
  Commit: `feat: initialize typescript server and core analysis engine with pattern detection`

- [x] **2. Centered input surface with Tailwind styling and empty guard**
  Becomes usable: A clean, centered single-page web interface served at `http://localhost:3000` with the title, subtitle, centered textarea, and "Check" button styled with Tailwind CSS. Clicking "Check" on empty input silently does nothing (no-op). Submitting text initiates the request and shows a "Checking..." state.
  Why now: Connects the browser to the backend and implements the first essential PRD journey steps and edge-case behavior (silent empty input guard).
  PRD ref: `prd.md > Screens and Layout`, `prd.md > Look and Feel`, `prd.md > Features and Behavior > 3. Edge Cases & Input Handling`
  Spec ref: `spec.md > Components > 1. Web UI Client`, `spec.md > Look and Feel`
  Build: Create `public/index.html` with responsive centered layout, configure `tailwind.config.js`, create `src/client/style.css` and build output into `public/dist/output.css`. Write `src/client/app.ts` handling input reading, whitespace checking, "Checking..." button state, and API fetch dispatch.
  Verify (mechanical): Request `GET /` and verify HTTP 200; verify compiled CSS and JS are served; test empty input via headless/script check to ensure zero network requests and no uncaught errors.
  Learner check: Open `http://localhost:3000` in your browser, click "Check" with the input empty to verify it silently does nothing, then type a sample phrase and click "Check" to see the button show "Checking...".
  Commit: `feat: implement centered web UI with tailwind and empty input guard`

- [x] **3. Dynamic results display: color-coded score, summary, and two-column evidence grid**
  Becomes usable: The complete end-to-end user loop. When analysis finishes, the results container appears smoothly below the input box with a modest color-coded score badge (emerald for safe, amber for caution, red for high risk), a clear summary paragraph, and a two-column responsive grid showing reasons on the left and evidence tags on the right.
  Why now: Completes the full core journey defined in the PRD, making the application fully functional for both scam detection and legitimate verification.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Features and Behavior > 1 & 2`, `prd.md > Look and Feel`
  Spec ref: `spec.md > The Core Journey Through the System`, `spec.md > Look and Feel`, `spec.md > Data Model`
  Build: Update `public/index.html` and `src/client/app.ts` with DOM generation logic that parses `AnalysisResponse`, applies dynamic Tailwind color classes based on `trustScore`, formats the summary, and generates the two-column grid pairing each reason with an array of distinct evidence pill badges.
  Verify (mechanical): Execute end-to-end automated verification script sending both a known scam text and a legitimate offer; verify the HTML DOM updates with correct badge colors (`emerald` vs `red`) and structured evidence tags.
  Learner check: Paste a suspicious internship message into `http://localhost:3000` and see the red score badge with itemized reasons and evidence, then test a legitimate company posting and see a green score with positive reasons.
  Commit: `feat: render dynamic color-coded score and two-column reasons-evidence grid`

- [x] **4. AI engine integration with resilient heuristic fallback**
  Becomes usable: The analyzer engine utilizes OpenRouter AI when a `OPENROUTER_API_KEY` is present in `.env` to analyze nuanced phrasing, while seamlessly falling back to the local heuristic engine when offline or if no key is configured.
  Why now: Adds the AI capability specified in the blueprint while guaranteeing the app is completely resilient and never fails during video recording or local testing.
  PRD ref: `prd.md > Features and Behavior > 1. Scam & Legitimacy Evaluation`
  Spec ref: `spec.md > External Services and Dependencies`, `spec.md > Important Failure Modes`, `spec.md > What Was Simplified and Why`
  Build: Create `src/analyzer/openrouter.ts` (using native `fetch` to OpenRouter's OpenAI-compatible endpoint), connect to `src/analyzer/orchestrator.ts` with structured JSON output, wrapped in a try/catch that automatically defaults to `src/analyzer/rules.ts`.
  Verify (mechanical): Run automated test verifying analyzer output with an active key (or mock) and without a key to confirm identical typed `AnalysisResponse` shapes in both cases.
  Learner check: Verify the app runs smoothly with or without an API key, delivering consistent and accurate results.
  Commit: `feat: integrate openrouter ai analysis with automatic heuristic fallback`

## Hands-on Checkpoints

- [x] Early usable behavior explored - Slice 2 (UI input surface and backend connectivity)
- [x] Final kick-the-tires exploration and feedback completed - Slice 4

## Final Review

- [x] Final review complete - feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [x] Learning activity complete - guided route, focused alternative, prior practice connected, or brief recap
- [x] Optional edit and transfer reflection addressed - offered/declined/already covered/not applicable as appropriate
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Focused alternative connecting the learner's desired learning outcome (understanding structured non-vibe architecture) to the Layered Strategy Pattern, OpenRouter fallback, and 32 unit/integration tests.
Route and stops: Stop 1: src/client/controller.ts (Silent Empty Guard) -> Stop 2: src/analyzer/orchestrator.ts (Strategy priority & fallback) -> Stop 3: src/analyzer/rules.ts (Deterministic pattern matching & evidence extraction).
Edit outcome: Not applicable - learner confirmed implementation meets requirements without changes.
Reflection: Offered in wrap-up summary.
Activity mode: learn

## Revisions

- Switched AI engine strategy to OpenRouter API (OpenAI-compatible chat completions) with resilient heuristic fallback.
- Implemented native fetch for OpenRouter communication to prevent Node.js 24 Windows OpenSSL cipher decompression issues with large SDK tarballs.
- Migrated codebase to an npm workspaces monorepo with completely isolated `backend/` and `frontend/` packages, adding CORS support for cross-service calls and unified root orchestration scripts.