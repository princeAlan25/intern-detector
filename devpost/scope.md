---
doc: scope
status: approved
---

# Fake-Real Detector

A web app that checks internship offers, scholarship links, and viral forwards for scam patterns, then gives a trust score with clear reasons.

## The Unique Kernel
It doesn't just say "scam" or "safe" — it shows you *why*, pattern by pattern, so you learn to spot the red flags yourself. The trust score is transparent: every point is backed by a concrete reason you can read, understand, and learn from.

## Who It's For
A college student or young job-seeker who sees an internship post on social media, gets a scholarship link forwarded on WhatsApp, or spots a "too good to be true" offer — and isn't sure if it's legit. Today they either ignore it and miss out, or trust it and get burned. There's no quick, beginner-friendly way to check.

## The Core Loop
Paste suspicious text or a URL into the input field → hit "Check" → read the trust score and the itemized reasons behind it. Come back whenever something new feels off.

## Inspiration & Identity
Straightforward, no-nonsense utility. Think of a virus scanner result panel — clear verdict up top, details below. Friendly enough for a non-technical student, credible enough to trust.

## Why This Matters to the Learner
Wants to understand the real workflow of building a project — planning before coding, architecture before features — and be able to apply the same process to future projects. Not vibe coding.

## What "Working" Looks Like
You open the web app. You paste in a sketchy internship post that says "Earn $5000/week, no experience needed, pay $50 registration fee." You hit Check. The app returns **Trust Score: 2/10 — Likely Scam** with reasons: "promises unrealistic pay," "asks for upfront payment," "uses urgency tactics." That's the demo moment — under a minute, on screen.

## The POC Boundary
- Single-page web app (runs in a browser, no install needed)
- One text/URL input field + "Check" button
- Scam pattern analysis (rule-based, AI-assisted, or both — decided in spec)
- Trust score display (e.g., 1–10) with itemized, human-readable reasons
- Submissions need a short demo video and a public GitHub repository; deployment is optional

## Later
- Browser extension version (right-click to check a link)
- Real-time URL/domain reputation lookup (WHOIS, domain age)
- History of past checks
- Share results with friends
- Multi-language support

## Explicitly Cut
- **User accounts / login** — not needed to prove the core idea
- **Database of known scams** — too large to build and maintain for a PoC
- **WhatsApp / Telegram bot** — separate platform, separate project
- **Mobile app** — the web app already works on mobile browsers
- **Browser extension** — moved to "later"; web app proves the concept first
