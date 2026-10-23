import { test } from 'node:test';
import assert from 'node:assert';
import { displayAnalysisResults, PresenterElements } from './presenter.js';
import { AnalysisResponse } from './types.js';

// Minimal mock DOM node for headless verification
function createMockElement(initialClasses = ''): HTMLElement {
  const classes = new Set(initialClasses.split(' ').filter(Boolean));
  return {
    className: initialClasses,
    textContent: '',
    innerHTML: '',
    classList: {
      add: (cls: string) => classes.add(cls),
      remove: (cls: string) => classes.delete(cls),
      contains: (cls: string) => classes.has(cls)
    }
  } as unknown as HTMLElement;
}

test('displayAnalysisResults renders High Risk scam analysis into DOM elements', () => {
  const elements: PresenterElements = {
    resultsSection: createMockElement('hidden mt-8'),
    verdictBadge: createMockElement(),
    scoreLabel: createMockElement(),
    summaryText: createMockElement(),
    findingsGrid: createMockElement()
  };

  const scamResponse: AnalysisResponse = {
    trustScore: 2,
    verdict: 'High Risk',
    summary: 'High risk detected. Upfront fee and unofficial chat.',
    findings: [
      {
        reason: 'Upfront payment requested',
        evidences: ['registration fee of $100']
      }
    ]
  };

  displayAnalysisResults(scamResponse, elements);

  // Results unhidden
  assert.strictEqual(elements.resultsSection.classList.contains('hidden'), false);

  // Badge has red theme
  assert.ok(elements.verdictBadge.className.includes('bg-red-50'));
  assert.ok(elements.verdictBadge.className.includes('text-red-700'));
  assert.ok(elements.verdictBadge.textContent?.includes('High Risk'));

  // Score label
  assert.strictEqual(elements.scoreLabel.textContent, 'Trust Score: 2/10');

  // Summary
  assert.strictEqual(elements.summaryText.textContent, scamResponse.summary);

  // Findings grid contains reason and evidence
  assert.ok(elements.findingsGrid.innerHTML.includes('Upfront payment requested'));
  assert.ok(elements.findingsGrid.innerHTML.includes('registration fee of $100'));
});

test('displayAnalysisResults renders Safe legitimate offer analysis into DOM elements', () => {
  const elements: PresenterElements = {
    resultsSection: createMockElement('hidden mt-8'),
    verdictBadge: createMockElement(),
    scoreLabel: createMockElement(),
    summaryText: createMockElement(),
    findingsGrid: createMockElement()
  };

  const legitResponse: AnalysisResponse = {
    trustScore: 9,
    verdict: 'Safe',
    summary: 'High trust verified.',
    findings: [
      {
        reason: 'Verified educational institution',
        evidences: ['stanford.edu']
      }
    ]
  };

  displayAnalysisResults(legitResponse, elements);

  // Badge has emerald theme
  assert.ok(elements.verdictBadge.className.includes('bg-emerald-50'));
  assert.ok(elements.verdictBadge.className.includes('text-emerald-700'));
  assert.ok(elements.verdictBadge.textContent?.includes('Safe'));
  assert.strictEqual(elements.scoreLabel.textContent, 'Trust Score: 9/10');
  assert.ok(elements.findingsGrid.innerHTML.includes('stanford.edu'));
});
