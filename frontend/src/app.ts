import { initController } from './controller.js';
import { PresenterElements } from './presenter.js';

window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('detector-form') as HTMLFormElement;
  const textarea = document.getElementById('content-input') as HTMLTextAreaElement;
  const button = document.getElementById('check-button') as HTMLButtonElement;

  const resultsSection = document.getElementById('results-section') as HTMLElement;
  const verdictBadge = document.getElementById('verdict-badge') as HTMLElement;
  const scoreLabel = document.getElementById('score-label') as HTMLElement;
  const summaryText = document.getElementById('summary-text') as HTMLElement;
  const findingsGrid = document.getElementById('findings-grid') as HTMLElement;

  if (!form || !textarea || !button || !resultsSection || !verdictBadge || !scoreLabel || !summaryText || !findingsGrid) {
    console.error('Missing expected DOM elements in Fake-Real Detector view.');
    return;
  }

  const presenterElements: PresenterElements = {
    resultsSection,
    verdictBadge,
    scoreLabel,
    summaryText,
    findingsGrid
  };

  initController({
    form,
    textarea,
    button,
    presenterElements
  });
});
