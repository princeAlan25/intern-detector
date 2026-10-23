import { AnalysisResponse, Finding } from '../types.js';

export interface PresenterElements {
  resultsSection: HTMLElement;
  verdictBadge: HTMLElement;
  scoreLabel: HTMLElement;
  summaryText: HTMLElement;
  findingsGrid: HTMLElement;
}

export function getBadgeTheme(score: number): { badgeClass: string; label: string } {
  if (score >= 8) {
    return {
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      label: 'Verified / Safe'
    };
  } else if (score >= 5) {
    return {
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-300',
      label: 'Caution Recommended'
    };
  } else {
    return {
      badgeClass: 'bg-red-50 text-red-700 border-red-300',
      label: 'High Scam Risk'
    };
  }
}

export function renderFindingsGrid(findings: Finding[]): string {
  if (!findings || findings.length === 0) {
    return `
      <div class="col-span-1 md:col-span-2 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
        No specific red flags or trust indicators were identified.
      </div>
    `;
  }

  return findings
    .map(finding => {
      const evidenceTags = finding.evidences
        .map(ev => `<span class="inline-block bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded border border-gray-200 font-mono">${escapeHtml(ev)}</span>`)
        .join(' ');

      return `
        <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-xs flex flex-col justify-between">
          <div class="text-sm font-medium text-gray-800 mb-2">
            ${escapeHtml(finding.reason)}
          </div>
          <div class="mt-2 pt-2 border-t border-gray-100">
            <div class="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Matched Evidence:</div>
            <div class="flex flex-wrap gap-1.5">
              ${evidenceTags}
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

export function displayAnalysisResults(response: AnalysisResponse, elements: PresenterElements): void {
  const { resultsSection, verdictBadge, scoreLabel, summaryText, findingsGrid } = elements;

  const theme = getBadgeTheme(response.trustScore);

  // Set badge classes & text
  verdictBadge.className = `inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${theme.badgeClass}`;
  verdictBadge.textContent = `${response.verdict} — ${theme.label}`;

  // Set score label
  scoreLabel.textContent = `Trust Score: ${response.trustScore}/10`;

  // Set summary text
  summaryText.textContent = response.summary;

  // Set findings grid
  findingsGrid.innerHTML = renderFindingsGrid(response.findings);

  // Unhide results section
  resultsSection.classList.remove('hidden');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
