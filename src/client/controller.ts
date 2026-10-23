import { analyzeContentApi } from './api.js';
import { displayAnalysisResults, PresenterElements } from './presenter.js';

/**
 * Enforces the PRD Silent Empty Guard:
 * Returns the trimmed string if valid, or null if empty/whitespace-only (silent no-op).
 */
export function validateAndSanitizeInput(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export interface ControllerOptions {
  form: HTMLFormElement;
  textarea: HTMLTextAreaElement;
  button: HTMLButtonElement;
  presenterElements: PresenterElements;
  apiClient?: typeof analyzeContentApi;
}

export function initController(options: ControllerOptions): void {
  const { form, textarea, button, presenterElements, apiClient = analyzeContentApi } = options;

  form.addEventListener('submit', async (event: Event) => {
    event.preventDefault();

    const rawInput = textarea.value;
    const validatedContent = validateAndSanitizeInput(rawInput);

    // Silent Empty Guard: if empty, halt immediately with zero errors or side effects
    if (!validatedContent) {
      return;
    }

    const originalButtonText = button.textContent || 'Check Offer';
    button.disabled = true;
    button.textContent = 'Checking...';

    try {
      const result = await apiClient(validatedContent);
      displayAnalysisResults(result, presenterElements);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Unable to complete analysis. Please try again.');
    } finally {
      button.disabled = false;
      button.textContent = originalButtonText;
    }
  });
}
