import { test } from 'node:test';
import assert from 'node:assert';
import { analyzeContent } from './orchestrator.js';

test('analyzeContent returns High Risk verdict and low trustScore for blatant scam pitch', async () => {
  const scamOffer = "Urgent! Work from home as an executive intern and earn $900 per day. Pay $100 registration fee and reach out via Telegram @hiring_team.";
  const result = await analyzeContent(scamOffer);

  assert.ok(result.trustScore <= 4, `Expected trust score <= 4, got ${result.trustScore}`);
  assert.strictEqual(result.verdict, 'High Risk');
  assert.ok(result.summary.includes('High risk detected'));
  assert.ok(result.findings.length >= 2, 'Expected at least 2 findings');
  for (const finding of result.findings) {
    assert.ok(typeof finding.reason === 'string' && finding.reason.length > 0);
    assert.ok(Array.isArray(finding.evidences) && finding.evidences.length > 0);
  }
});

test('analyzeContent returns Safe verdict and high trustScore for legitimate university program', async () => {
  const legitOffer = "Apply to the Stanford AI Undergraduate Fellowship at https://cs.stanford.edu/admissions/fellowship via https://boards.greenhouse.io/stanford-research";
  const result = await analyzeContent(legitOffer);

  assert.ok(result.trustScore >= 8, `Expected trust score >= 8, got ${result.trustScore}`);
  assert.strictEqual(result.verdict, 'Safe');
  assert.ok(result.summary.includes('High trust'));
  assert.ok(result.findings.length >= 1);
});

test('analyzeContent returns Caution verdict for neutral or ambiguous content', async () => {
  const neutralText = "Looking for someone to help organize spreadsheet files this weekend. Let me know if interested.";
  const result = await analyzeContent(neutralText);

  assert.ok(result.trustScore >= 5 && result.trustScore <= 7, `Expected score between 5 and 7, got ${result.trustScore}`);
  assert.strictEqual(result.verdict, 'Caution');
});
