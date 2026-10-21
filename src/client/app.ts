import { AnalysisResponse, Finding } from "../types.js";

document.addEventListener("DOMContentLoaded", () => {
  const contentInput = document.getElementById("content-input") as HTMLTextAreaElement | null;
  const checkBtn = document.getElementById("check-btn") as HTMLButtonElement | null;
  const btnText = document.getElementById("btn-text") as HTMLSpanElement | null;
  const resultsContainer = document.getElementById("results-container") as HTMLElement | null;
  const scoreBadge = document.getElementById("score-badge") as HTMLSpanElement | null;
  const verdictLabel = document.getElementById("verdict-label") as HTMLSpanElement | null;
  const summaryText = document.getElementById("summary-text") as HTMLParagraphElement | null;
  const findingsGrid = document.getElementById("findings-grid") as HTMLDivElement | null;

  if (!checkBtn || !contentInput || !resultsContainer || !btnText) {
    console.error("Critical DOM elements missing from index.html");
    return;
  }

  checkBtn.addEventListener("click", async () => {
    const rawContent = contentInput.value;
    const content = rawContent.trim();

    // PRD REQUIREMENT: Silent empty guard — if nothing is typed, do nothing.
    if (!content) {
      return;
    }

    // Set Loading State
    checkBtn.disabled = true;
    btnText.textContent = "Checking...";

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: AnalysisResponse = await response.json();
      renderResults(data);
    } catch (error) {
      console.error("Failed to analyze content:", error);
      alert("Unable to analyze offer at this time. Please try again.");
    } finally {
      // Restore Button State
      checkBtn.disabled = false;
      btnText.textContent = "Check Offer";
    }
  });

  function renderResults(data: AnalysisResponse) {
    if (!resultsContainer || !scoreBadge || !verdictLabel || !summaryText || !findingsGrid) {
      return;
    }

    // 1. Unhide results container
    resultsContainer.classList.remove("hidden");

    // 2. Score Badge & Verdict Color Calibration
    scoreBadge.textContent = `${data.trustScore} / 10`;
    verdictLabel.textContent = `(${data.verdict})`;

    // Reset color classes
    scoreBadge.className = "inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border";
    verdictLabel.className = "text-sm font-semibold";

    if (data.trustScore >= 8) {
      // Safe (Emerald)
      scoreBadge.classList.add("bg-emerald-50", "text-emerald-700", "border-emerald-300");
      verdictLabel.classList.add("text-emerald-700");
    } else if (data.trustScore >= 5) {
      // Caution (Amber)
      scoreBadge.classList.add("bg-amber-50", "text-amber-700", "border-amber-300");
      verdictLabel.classList.add("text-amber-700");
    } else {
      // High Risk (Red)
      scoreBadge.classList.add("bg-red-50", "text-red-700", "border-red-300");
      verdictLabel.classList.add("text-red-700");
    }

    // 3. Summary Text
    summaryText.textContent = data.summary;

    // 4. Two-Column Findings Grid (Reasons on left, Evidences on right)
    findingsGrid.innerHTML = "";

    if (data.findings.length === 0) {
      findingsGrid.innerHTML = `
        <div class="col-span-1 md:col-span-2 text-sm text-gray-500 italic p-3 bg-gray-50 rounded border border-gray-100">
          No explicit scam triggers or verified institution indicators found.
        </div>
      `;
      return;
    }

    data.findings.forEach((finding: Finding) => {
      const card = document.createElement("div");
      card.className =
        "p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col justify-between space-y-3";

      // Left Column content: Reason
      const reasonHtml = `
        <div>
          <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Identified Pattern</div>
          <div class="text-sm font-medium text-gray-800 mt-1 leading-snug">${escapeHtml(finding.reason)}</div>
        </div>
      `;

      // Right Column / Badges content: Array of evidences
      const evidencesHtml = `
        <div class="pt-2 border-t border-gray-200">
          <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Matched Evidence</div>
          <div class="flex flex-wrap gap-1.5">
            ${finding.evidences
              .map(
                (ev) =>
                  `<span class="inline-block bg-white text-gray-700 text-xs px-2.5 py-1 rounded border border-gray-200 font-mono shadow-2xs">${escapeHtml(
                    ev
                  )}</span>`
              )
              .join("")}
          </div>
        </div>
      `;

      card.innerHTML = reasonHtml + evidencesHtml;
      findingsGrid.appendChild(card);
    });
  }

  function escapeHtml(str: string): string {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
});
