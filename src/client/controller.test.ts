import { test } from 'node:test';
import assert from 'node:assert';
import { validateAndSanitizeInput } from './controller.js';

test('validateAndSanitizeInput returns null for empty string (Silent Empty Guard)', () => {
  assert.strictEqual(validateAndSanitizeInput(''), null);
});

test('validateAndSanitizeInput returns null for whitespace-only strings (Silent Empty Guard)', () => {
  assert.strictEqual(validateAndSanitizeInput('    '), null);
  assert.strictEqual(validateAndSanitizeInput('\t\n\r'), null);
  assert.strictEqual(validateAndSanitizeInput(null), null);
  assert.strictEqual(validateAndSanitizeInput(undefined), null);
});

test('validateAndSanitizeInput returns trimmed string for valid content', () => {
  const result = validateAndSanitizeInput('  Urgent internship offer paying $500/day  ');
  assert.strictEqual(result, 'Urgent internship offer paying $500/day');
});
