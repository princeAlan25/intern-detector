import { AnalysisResponse, Finding, Verdict } from '../types.js';

export interface OpenRouterConfig {
  apiKey?: string;
  model?: string;
  apiUrl?: string;
  fetchFn?: typeof fetch;
}

const DEFAULT_MODEL = 'meta-llama/llama-3.3-70b-instruct';
const DEFAULT_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `
You are an expert fraud and employment scam detector for students and job seekers.
Analyze the provided internship, job offer, scholarship link, or message.
Evaluate red flags (upfront fees, unrealistic pay, unofficial messaging apps like Telegram/WhatsApp, fake corporate emails, artificial urgency) or legitimate trust signals (.edu domains, official company portals, ATS boards).

You MUST respond strictly with valid JSON conforming to this TypeScript interface:
{
  "trustScore": number, // integer from 1 (extreme scam risk) to 10 (verified safe)
  "verdict": "Safe" | "Caution" | "High Risk", // "Safe" if score >= 8, "Caution" if 5-7, "High Risk" if 1-4
  "summary": string, // 1-2 sentence crisp overview of the risk or trust assessment
  "findings": [
    {
      "reason": string, // Clear explanation of the red flag or trust indicator
      "evidences": string[] // Verbatim quotes or extracted tokens from the input that justify this finding
    }
  ]
}

Only output raw JSON. Do not wrap in markdown backticks or commentary.
`.trim();

/**
 * Calls OpenRouter AI to analyze the content.
 * Returns null if no API key is configured or if the API call fails, enabling resilient fallback.
 */
export async function analyzeWithOpenRouter(
  content: string,
  config?: OpenRouterConfig
): Promise<AnalysisResponse | null> {
  const apiKey = config?.apiKey ?? process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  const model = config?.model ?? process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;
  const apiUrl = config?.apiUrl ?? DEFAULT_API_URL;
  const customFetch = config?.fetchFn ?? fetch;

  try {
    const response = await customFetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://intern-detector.local',
        'X-Title': 'Fake-Real Detector'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Analyze the following content:\n\n${content}` }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      console.warn(`OpenRouter API request failed with HTTP ${response.status}. Falling back to rules engine.`);
      return null;
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;
    if (!rawContent) {
      return null;
    }

    // Clean potential markdown fences if present
    const cleanedJson = rawContent.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleanedJson);

    // Validate and sanitize parsed output
    return sanitizeAiResponse(parsed);
  } catch (error) {
    console.warn('Error during OpenRouter analysis, falling back to heuristic engine:', error);
    return null;
  }
}

/**
 * Validates and ensures the response adheres to our strict AnalysisResponse contract.
 */
export function sanitizeAiResponse(data: any): AnalysisResponse | null {
  if (!data || typeof data !== 'object') return null;

  const rawScore = Number(data.trustScore);
  if (isNaN(rawScore)) return null;

  const trustScore = Math.max(1, Math.min(10, Math.round(rawScore)));

  let verdict: Verdict = 'Caution';
  if (data.verdict === 'Safe' || data.verdict === 'High Risk' || data.verdict === 'Caution') {
    verdict = data.verdict;
  } else {
    verdict = trustScore >= 8 ? 'Safe' : trustScore >= 5 ? 'Caution' : 'High Risk';
  }

  const summary = typeof data.summary === 'string' && data.summary.trim().length > 0
    ? data.summary.trim()
    : 'Analysis completed via OpenRouter AI.';

  const findings: Finding[] = Array.isArray(data.findings)
    ? data.findings
        .filter((f: any) => f && typeof f.reason === 'string' && Array.isArray(f.evidences))
        .map((f: any) => ({
          reason: f.reason,
          evidences: f.evidences.map((e: any) => String(e).trim()).filter(Boolean)
        }))
    : [];

  return {
    trustScore,
    verdict,
    summary,
    findings
  };
}
