import { test } from 'node:test';
import assert from 'node:assert';
import { analyzeWithOpenRouter, sanitizeAiResponse } from './openrouter.js';
import { analyzeContent } from './orchestrator.js';

test('analyzeWithOpenRouter returns null when API key is missing (offline/keyless resilience)', async () => {
  const result = await analyzeWithOpenRouter('Urgent job offer', { apiKey: '' });
  assert.strictEqual(result, null);
});

test('analyzeWithOpenRouter parses and returns valid AnalysisResponse when OpenRouter responds with valid JSON', async () => {
  const mockPayload = {
    choices: [
      {
        message: {
          content: JSON.stringify({
            trustScore: 2,
            verdict: 'High Risk',
            summary: 'AI detected severe scam markers including upfront payment demands.',
            findings: [
              {
                reason: 'Demands upfront registration fee before hiring',
                evidences: ['$200 registration fee']
              }
            ]
          })
        }
      }
    ]
  };

  const mockFetch: typeof fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => mockPayload
  } as unknown as Response);

  const result = await analyzeWithOpenRouter('Pay $200 fee', {
    apiKey: 'test-openrouter-key',
    fetchFn: mockFetch
  });

  assert.ok(result);
  assert.strictEqual(result?.trustScore, 2);
  assert.strictEqual(result?.verdict, 'High Risk');
  assert.ok(result?.summary.includes('AI detected'));
  assert.strictEqual(result?.findings.length, 1);
  assert.strictEqual(result?.findings[0].evidences[0], '$200 registration fee');
});

test('analyzeWithOpenRouter returns null when OpenRouter returns HTTP error (resilient fallback)', async () => {
  const errorFetch: typeof fetch = async () => ({
    ok: false,
    status: 401,
    statusText: 'Unauthorized'
  } as unknown as Response);

  const result = await analyzeWithOpenRouter('Pay $200 fee', {
    apiKey: 'invalid-key',
    fetchFn: errorFetch
  });

  assert.strictEqual(result, null);
});

test('analyzeContent orchestrator falls back to rules engine when OpenRouter is unconfigured or fails', async () => {
  // Test fallback with explicit failing config
  const failingFetch: typeof fetch = async () => {
    throw new Error('Network timeout connecting to OpenRouter');
  };

  const result = await analyzeContent(
    'Urgent! Earn $900 per day. Pay $100 registration fee and reach out via Telegram @hiring_team.',
    {
      apiKey: 'test-key',
      fetchFn: failingFetch
    }
  );

  // Still returns a valid High Risk response from the local heuristic rule engine!
  assert.ok(result);
  assert.ok(result.trustScore <= 4);
  assert.strictEqual(result.verdict, 'High Risk');
  assert.ok(result.findings.length >= 2);
});

test('sanitizeAiResponse clamps out-of-range scores and fixes missing fields', () => {
  const raw = {
    trustScore: 99,
    verdict: 'Safe',
    summary: 'Great job',
    findings: [{ reason: 'Looks good', evidences: ['stanford.edu'] }]
  };

  const sanitized = sanitizeAiResponse(raw);
  assert.ok(sanitized);
  assert.strictEqual(sanitized?.trustScore, 10); // Clamped to 10
  assert.strictEqual(sanitized?.verdict, 'Safe');
});
