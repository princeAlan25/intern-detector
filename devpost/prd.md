---
doc: prd
status: approved
---

# Fake-Real Detector — Product Requirements

A lightweight single-surface web application that analyzes internship postings, scholarship links, and viral forwards for scam patterns, outputting a calibrated trust score, summary assessment, and side-by-side reason and evidence breakdown.
Source: `scope.md > The Unique Kernel` and `scope.md > Who It's For`.

---

## The Core Journey

1. **Arrival**: The user lands on a clean, minimal single-page web app. They see the application title at the top and a centered input box ready for text or a URL.
2. **Input**: The user pastes a suspicious or uncertain internship offer, scholarship message, or viral post link/text into the input box and clicks "Check".
3. **Validation & Trigger**: If the input is empty or whitespace-only, the app remains silent and takes no action (no error popups or intrusive warnings). If text or a URL is present, analysis begins.
4. **Analysis & Verdict**: The app evaluates the input against common scam indicators and positive trust signals, then renders the results panel immediately beneath the input box.
5. **Review**:
   - The user sees a modest-sized trust score color-coded on a gradient from green (trustworthy/legit) to red (high scam probability).
   - Below the score, an overall description summarizes the verdict.
   - Beneath the description, reasons are listed on the left, paired directly with the exact matching evidence/triggers from the input or URL on the right.
6. **Repeat**: The user can modify or replace the input and check another offer whenever needed.

---

## Screens and Layout

- **Single Surface**: Everything resides on one responsive, centered page.
- **Top Section**:
  - Application title: **Fake-Real Detector** (with a brief subtitle or tagline).
- **Center Section**:
  - A clean, centered text/URL input area (textarea/input with sensible height, not overwhelmingly large).
  - A distinct "Check" action button aligned with or directly beneath the input.
- **Results Section (Below Input)**:
  - **Trust Score**: Modest footprint (not dominant or oversized), color-coded from green (safe) through yellow/orange to red (danger).
  - **Summary Description**: A clear introductory paragraph interpreting the score in plain language.
  - **Detailed Evidence Table/Grid**:
    - **Left Column**: Specific detected pattern or reason (e.g., "Demands upfront payment", "Unrealistic salary promises", "Verified domain matches official institution").
    - **Right Column**: The extracted snippet, keyword, or URL element that directly triggered that finding.

---

## Look and Feel

- **Aesthetic**: Clean, utilitarian, and distraction-free. Minimalist design emphasizing clarity over decoration.
- **Color Coding**: Dynamic status colors calibrated strictly to the score:
  - Green for safe / high-trust results.
  - Amber / Yellow for ambiguous or caution-worthy results.
  - Red for high scam risk / critical red flags.
- **Hierarchy**: Modest score badge so that the focus remains on the explanation and evidence rather than just a raw number.

---

## Features and Behavior

### 1. Scam & Legitimacy Evaluation
Source: `scope.md > The Unique Kernel`

- **Text & URL Analysis**: Accepts arbitrary message text, job descriptions, or links.
- **Scam Detection**: Identifies patterns such as upfront fees, urgency language ("apply in 24 hours"), unofficial contact domains (e.g., `@gmail.com` claiming to be major banks or tech firms), and exaggerated guarantees.
- **Legitimate Verification**: Identifies positive signals when analyzing safe listings (e.g., official domain structure, standard application procedures, absence of high-risk keywords).
- **Acceptance Criteria**:
  - [ ] Pasting a known scam pitch flags key red flags and displays a low score in red/amber.
  - [ ] Pasting a standard, legitimate posting displays a high score in green with positive verification reasons.
  - [ ] The score reflects a clear range from red (low trust) to green (high trust).

### 2. Side-by-Side Reasons & Evidence
Source: `scope.md > The Core Loop`

- **Left-Right Alignment**: Each finding is presented as a paired row:
  - **Reason**: Concise explanation of the pattern.
  - **Evidence**: The corresponding excerpt from the user's input or analyzed URL.
- **Acceptance Criteria**:
  - [ ] Every listed reason has an accompanying evidence snippet showing what triggered it.
  - [ ] If no negative patterns exist, positive trust factors are listed with supporting text.

### 3. Edge Cases & Input Handling

- **Empty Input**: Clicking "Check" with empty or whitespace-only input does nothing.
- **Acceptance Criteria**:
  - [ ] Clicking "Check" on an empty field produces no state change, console error, or disruptive alert.

---

## States and Boundaries

- **Empty / Initial State**: Title, centered input box, and Check button visible. Results section is hidden until the first check.
- **Analyzing / Loading State**: Subtle visual indicator while processing (e.g., button state changes to "Checking...").
- **Results State (Scam / Warning)**: Red or amber score, warning description, red-flag breakdown with matching text evidence.
- **Results State (Legitimate)**: Green score, positive assessment description, validation evidence.
- **Persistence**: Session-only; no local storage or server database requirements for the PoC.

---

## Product Decisions

1. **Modest Score Display**: Sized moderately rather than overwhelmingly large so the user's attention naturally directs to the educational reasons and evidence.
2. **Color Range (Green to Red)**: Intuitive visual cue directly representing trust levels from verified safe (green) to dangerous (red).
3. **Structured Reasons & Evidence Columns**: Placing the rationale on the left and the verbatim trigger text on the right makes the tool's judgment transparent and reproducible.
4. **Silent Empty Input Handling**: Avoids annoying validation banners or popups when nothing has been typed.
5. **Dual Detection (Scam + Legit)**: Safe content produces meaningful positive feedback rather than an empty result or error.

---

## What We're Building

- Single-page web app layout (Title, centered input, Check button).
- Analysis engine assessing scam indicators and positive trust signals.
- Color-coded score display (green-to-red scale).
- Summary description text.
- Two-column reason and evidence display.

---

## Deferred From the POC

- **Browser extension overlay**: Kept for later; web interface proves the core detection logic first.
- **Live domain WHOIS / registry lookups**: Relies on input parsing and pattern analysis for PoC speed and offline independence.
- **Saved history / User accounts**: Out of scope for a single-session demo tool.

---

## Non-Goals

- Will not attempt to crawl external password-protected portals or private group chats.
- Will not send automated report emails or contact authorities.
- Will not require user sign-ups or credentials.

---

## Open Questions

- None blocking. The technical architecture (API vs. client-side evaluation) will be specified in `4-spec`.
