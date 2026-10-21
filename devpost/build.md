# Fake-Real Detector — Detailed Build Guide (`build.md`)

This document provides a comprehensive, step-by-step breakdown of how the **Fake-Real Detector** is built. It details every slice from [`devpost/checklist.md`](file:///c:/Users/PrinceAlan/Documents/DevPost/intern-detector/devpost/checklist.md), including the specific files involved, the implementation mechanics, and both mechanical and visual verification procedures.

---

## Architecture & Flow Overview

```
[ User Browser (public/index.html) ]
        │
        │ 1. Submits Text/URL (Click "Check")
        │    (If empty -> silent no-op)
        ▼
[ Client Controller (src/client/app.ts) ]
        │
        │ 2. POST /api/analyze { content: "..." }
        ▼
[ Express Server (src/server.ts) ]
        │
        │ 3. Routes request to Analyzer
        ▼
[ Analyzer Orchestrator (src/analyzer.ts) ]
       ╱                             ╲
      ╱ (If GEMINI_API_KEY present)   ╲ (Default / Fallback)
     ▼                                 ▼
[ Gemini AI Client ]             [ Heuristic Rules Library ]
(src/gemini.ts)                  (src/rules.ts)
     │                                 │
     └─────────────────┬───────────────┘
                       │
                       ▼ 4. Typed AnalysisResponse (Score, Verdict, Summary, Findings)
[ Express Server ]
        │
        ▼ 5. HTTP 200 JSON Response
[ Client Controller (src/client/app.ts) ]
        │
        ▼ 6. DOM Rendering with Tailwind CSS
- Modest color-coded badge (Green / Amber / Red)
- Plain-language summary paragraph
- Two-column responsive grid (Reasons on Left | Evidences Array on Right)
```

---

## Slice Breakdown & Implementation Blueprint

---

### Slice 1: Project Setup & Core Analysis Engine (Status: ✅ Complete)

- **Objective**: Establish the TypeScript + Express project foundation, define strictly typed data models, and build the pattern detection and scoring logic.
- **Why First**: Tackles the project's unique kernel (pattern detection and transparent reasons) and core API contract before any user interface work begins.
- **Files Created**:
  1. [`package.json`](file:///c:/Users/PrinceAlan/Documents/DevPost/intern-detector/package.json): Defines npm scripts (`start`, `dev`, `build:css`) and dependencies (`express`, `dotenv`, `typescript`, `tsx`, `tailwindcss`, `@types/node`, `@types/express`).
  2. [`tsconfig.json`](file:///c:/Users/PrinceAlan/Documents/DevPost/intern-detector/tsconfig.json): Configures TypeScript for modern ES2022 and NodeNext module resolution.
  3. [`src/types.ts`](file:///c:/Users/PrinceAlan/Documents/DevPost/intern-detector/src/types.ts): Data contracts for `Finding` (with `evidences: string[]`), `Verdict`, `AnalysisRequest`, and `AnalysisResponse`.
  4. [`src/rules.ts`](file:///c:/Users/PrinceAlan/Documents/DevPost/intern-detector/src/rules.ts): The pattern engine with regex rules for upfront fees, unrealistic salaries, artificial urgency, and informal contact channels, alongside positive institutional trust signals.
  5. [`src/analyzer.ts`](file:///c:/Users/PrinceAlan/Documents/DevPost/intern-detector/src/analyzer.ts): Combines pattern evaluation, calculates the 1–10 score, assigns the verdict (`Safe`, `Caution`, or `High Risk`), and crafts an explanatory summary.
  6. [`src/server.ts`](file:///c:/Users/PrinceAlan/Documents/DevPost/intern-detector/src/server.ts): Express server hosting static files from `public/` and exposing `POST /api/analyze`.
  7. [`scripts/verify-slice1.ts`](file:///c:/Users/PrinceAlan/Documents/DevPost/intern-detector/scripts/verify-slice1.ts): Automated verification script.
- **Verification**:
  - Mechanical: `npx tsx scripts/verify-slice1.ts` executed and verified scam detection (1/10 High Risk) and legit verification (10/10 Safe).
  - Git Commit: `feat: initialize typescript server and core analysis engine with pattern detection`.

---

### Slice 2: Centered Input Surface with Tailwind Styling & Empty Guard (Status: ⬜ Next)

- **Objective**: Create the visual front-end surface with Tailwind CSS, establishing a clean, centered layout with the title, text input area, and "Check" action button. Implement the PRD edge-case behavior: clicking "Check" on empty input silently halts without errors.
- **Detailed Responsibilities**:
  1. [`tailwind.config.js`](file:///c:/Users/PrinceAlan/Documents/DevPost/intern-detector/tailwind.config.js):
     - Configure content scan paths: `./public/**/*.{html,js}` and `./src/**/*.{ts,js}`.
  2. [`src/client/style.css`](file:///c:/Users/PrinceAlan/Documents/DevPost/intern-detector/src/client/style.css):
     - Tailwind directives: `@tailwind base; @tailwind components; @tailwind utilities;`.
  3. [`public/index.html`](file:///c:/Users/PrinceAlan/Documents/DevPost/intern-detector/public/index.html):
     - Modern semantic markup:
       - Header: App Title ("Fake-Real Detector") and brief mission tagline.
       - Main Container: Centered, max-width `max-w-3xl`, clean padding.
       - Input Form: Textarea with placeholder ("Paste an internship offer, scholarship message, or suspicious link..."), character guidance, and a prominent "Check" button.
       - Results Placeholder: Hidden by default (`id="results-container" class="hidden"`).
  4. [`src/client/app.ts`](file:///c:/Users/PrinceAlan/Documents/DevPost/intern-detector/src/client/app.ts):
     - Listen for form submit / button click.
     - **Silent Empty Guard**: Read `input.value.trim()`. If empty, return immediately without any alerts or network requests.
     - **Loading State**: Toggle button text to "Checking..." and disable button during request.
     - Send `POST /api/analyze` request with JSON payload `{ content }`.
- **Verification**:
  - Mechanical: Compile CSS via `npm run build:css`. Verify `public/dist/output.css` exists. Verify `GET /` serves HTTP 200 with all HTML and asset links.
  - Learner Check: Open `http://localhost:3000`, test clicking "Check" with empty input (confirm nothing happens), then type text to verify the button transitions to "Checking...".
  - Commit: `feat: implement centered web UI with tailwind and empty input guard`.

---

### Slice 3: Dynamic Results Display (Color-Coded Score, Summary, 2-Column Grid)

- **Objective**: Implement the full core loop. When the server returns the `AnalysisResponse`, the client renders a visual card beneath the input box showing:
  1. A modest trust score badge color-coded from green (safe) to red (high risk).
  2. An overarching plain-language summary paragraph.
  3. A two-column responsive grid: Reasons on the left, paired with an array of distinct evidence pill badges on the right.
- **Detailed Responsibilities**:
  1. **Score Color Mapping (`src/client/app.ts`)**:
     - Score 8–10 (`Safe`): Emerald styling (`bg-emerald-50 text-emerald-700 border-emerald-300`).
     - Score 5–7 (`Caution`): Amber styling (`bg-amber-50 text-amber-700 border-amber-300`).
     - Score 1–4 (`High Risk`): Red styling (`bg-red-50 text-red-700 border-red-300`).
  2. **Findings Grid (`public/index.html` & `src/client/app.ts`)**:
     - Container: `grid grid-cols-1 md:grid-cols-2 gap-4 mt-6`.
     - Left Column: Reason description explaining the specific pattern found.
     - Right Column: Render `evidences` as individual tag pills (`inline-block bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded border border-gray-200`) showing exact quotes.
  3. **Reset / New Check**:
     - Entering new text and clicking "Check" smoothly updates the results without full-page reloads.
- **Verification**:
  - Mechanical: Automated headless test running both scam and legitimate inputs, asserting DOM contains score pill, summary text, and evidence tags.
  - Learner Check: Paste a scam pitch into the browser and observe the red score with evidence tags; paste a legitimate job offer and observe the green score.
  - Commit: `feat: render dynamic color-coded score and two-column reasons-evidence grid`.

---

### Slice 4: AI Engine Integration with Resilient Heuristic Fallback

- **Objective**: Integrate Google Gemini AI to analyze nuanced language and unstructured messages while ensuring the app automatically falls back to the deterministic local rule engine if no API key is set or if offline.
- **Detailed Responsibilities**:
  1. [`src/gemini.ts`](file:///c:/Users/PrinceAlan/Documents/DevPost/intern-detector/src/gemini.ts):
     - Initializes Google Gemini API client if `process.env.GEMINI_API_KEY` exists.
     - System Prompt: Instructs Gemini to evaluate the text for employment/scholarship fraud and return strictly typed JSON matching `AnalysisResponse`.
     - Try/Catch Wrapper: Catches any rate limit or network exception and delegates directly to `evaluateRules()`.
  2. [`src/analyzer.ts`](file:///c:/Users/PrinceAlan/Documents/DevPost/intern-detector/src/analyzer.ts):
     - Directs analysis through `analyzeWithGemini()` if configured, otherwise executes `evaluateRules()`.
- **Verification**:
  - Mechanical: Test analyzer with and without mock API keys to verify identical schema compliance in all states.
  - Learner Check: Test analysis with varied inputs and confirm fast, resilient performance.
  - Commit: `feat: integrate gemini ai analysis with automatic heuristic fallback`.

---

## Hands-On Checkpoints & Final Review

1. **Checkpoint 1 (After Slice 2)**: Learner verifies the running UI on `http://localhost:3000` and confirms the silent empty guard and input layout.
2. **Checkpoint 2 (After Slice 4)**: Learner performs full kick-the-tires end-to-end testing with varied real-world examples.
3. **Code Tour & App Map**: Generate [`devpost/app-map.html`](file:///c:/Users/PrinceAlan/Documents/DevPost/intern-detector/devpost/app-map.html) summarizing the project files and architecture for reuse in future projects.
