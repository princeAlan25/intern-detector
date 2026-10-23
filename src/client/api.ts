import { AnalysisRequest, AnalysisResponse } from '../types.js';

export async function analyzeContentApi(content: string): Promise<AnalysisResponse> {
  const requestBody: AnalysisRequest = { content };

  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}
