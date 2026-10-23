import { AnalysisRequest, AnalysisResponse } from './types.js';

const API_BASE_URL = typeof window !== 'undefined' && (window as any).API_BASE_URL 
  ? (window as any).API_BASE_URL 
  : '';

export async function analyzeContentApi(content: string, baseUrl = API_BASE_URL): Promise<AnalysisResponse> {
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
