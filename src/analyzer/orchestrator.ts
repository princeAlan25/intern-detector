import { AnalysisResponse, Finding, Verdict } from '../types.js';
import { evaluateRules } from './rules.js';
import { analyzeWithOpenRouter, OpenRouterConfig } from './openrouter.js';

/**
 * Deterministic heuristic rule-based analysis.
 * Always available offline with zero external dependencies.
 */
export function analyzeContentWithRules(content: string): AnalysisResponse {
  const matches = evaluateRules(content);

  const redFlags = matches.filter(m => m.type === 'red_flag');
  const trustSignals = matches.filter(m => m.type === 'trust_signal');

  // Base score is neutral-moderate (7)
  let rawScore = 7;

  // Apply score impacts
  for (const match of matches) {
    rawScore += match.scoreImpact;
  }

  // If there are critical red flags (upfront fee, etc.), ensure score reflects high risk
  if (redFlags.some(f => f.finding.reason.toLowerCase().includes('upfront') || f.finding.reason.toLowerCase().includes('payment'))) {
    rawScore = Math.min(rawScore, 2);
  }

  // Clamp score between 1 and 10
  const trustScore = Math.max(1, Math.min(10, Math.round(rawScore)));

  // Derive verdict
  let verdict: Verdict;
  if (trustScore >= 8) {
    verdict = 'Safe';
  } else if (trustScore >= 5) {
    verdict = 'Caution';
  } else {
    verdict = 'High Risk';
  }

  // Synthesize summary
  let summary = '';
  if (verdict === 'High Risk') {
    summary = `High risk detected (${redFlags.length} critical red flag${redFlags.length === 1 ? '' : 's'}). This offer exhibits strong hallmarks of an employment scam.`;
  } else if (verdict === 'Caution') {
    if (redFlags.length > 0) {
      summary = `Proceed with caution. Identified ${redFlags.length} potential concern${redFlags.length === 1 ? '' : 's'} that warrant verification before sharing personal details.`;
    } else {
      summary = 'Moderate trust. No immediate red flags were detected, but always verify offers directly through the organization\'s official portal.';
    }
  } else {
    summary = `High trust signals verified (${trustSignals.length} trust indicator${trustSignals.length === 1 ? '' : 's'}). The offer references legitimate institutional domains or recruitment channels.`;
  }

  const findings: Finding[] = matches.map(m => m.finding);

  return {
    trustScore,
    verdict,
    summary,
    findings
  };
}

/**
 * Main analysis orchestrator.
 * Attempts AI contextual deep analysis via OpenRouter if OPENROUTER_API_KEY is configured,
 * with automated, seamless fallback to the local heuristic rules engine.
 */
export async function analyzeContent(
  content: string,
  openRouterConfig?: OpenRouterConfig
): Promise<AnalysisResponse> {
  const apiKey = openRouterConfig?.apiKey ?? process.env.OPENROUTER_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const aiResponse = await analyzeWithOpenRouter(content, openRouterConfig);
      if (aiResponse) {
        return aiResponse;
      }
    } catch (err) {
      console.warn('OpenRouter analysis failed, engaging heuristic rules fallback:', err);
    }
  }

  // Resilient fallback to deterministic rule engine
  return analyzeContentWithRules(content);
}
