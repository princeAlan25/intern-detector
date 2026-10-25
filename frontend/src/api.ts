import { AnalysisRequest, AnalysisResponse } from './types.js';

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  if ((window as any).API_BASE_URL) return (window as any).API_BASE_URL;
  // If running on a separate frontend dev server port (e.g. 5000, 5173), target the backend at port 3000
  if (window.location.port && window.location.port !== '3000') {
    return 'http://localhost:3000';
  }
  return '';
}

export async function analyzeContentApi(content: string, baseUrl = getApiBaseUrl()): Promise<AnalysisResponse> {
  const requestBody: AnalysisRequest = { content };
  const endpoint = baseUrl ? `${baseUrl}/api/analyze` : '/api/analyze';

  const response = await fetch(endpoint, {
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
