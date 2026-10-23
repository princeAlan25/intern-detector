import { test } from 'node:test';
import assert from 'node:assert';
import { getBadgeTheme, renderFindingsGrid } from './presenter.js';
import { Finding } from '../types.js';

test('getBadgeTheme returns emerald/green styling for high trust scores (8-10)', () => {
  const theme10 = getBadgeTheme(10);
  assert.ok(theme10.badgeClass.includes('emerald'));
  assert.strictEqual(theme10.label, 'Verified / Safe');

  const theme8 = getBadgeTheme(8);
  assert.ok(theme8.badgeClass.includes('emerald'));
});

test('getBadgeTheme returns amber/yellow styling for moderate scores (5-7)', () => {
  const theme7 = getBadgeTheme(7);
  assert.ok(theme7.badgeClass.includes('amber'));
  assert.strictEqual(theme7.label, 'Caution Recommended');

  const theme5 = getBadgeTheme(5);
  assert.ok(theme5.badgeClass.includes('amber'));
});

test('getBadgeTheme returns red styling for high risk scores (1-4)', () => {
  const theme4 = getBadgeTheme(4);
  assert.ok(theme4.badgeClass.includes('red'));
  assert.strictEqual(theme4.label, 'High Scam Risk');

  const theme1 = getBadgeTheme(1);
  assert.ok(theme1.badgeClass.includes('red'));
});

test('renderFindingsGrid formats reasons and evidence tags into responsive grid HTML', () => {
  const findings: Finding[] = [
    {
      reason: 'Upfront fee demand',
      evidences: ['registration fee of $150', 'pay before starting']
    }
  ];

  const html = renderFindingsGrid(findings);
  assert.ok(html.includes('Upfront fee demand'));
  assert.ok(html.includes('registration fee of $150'));
  assert.ok(html.includes('pay before starting'));
  assert.ok(html.includes('font-mono'));
});

test('renderFindingsGrid provides fallback message when findings list is empty', () => {
  const html = renderFindingsGrid([]);
  assert.ok(html.includes('No specific red flags'));
});
