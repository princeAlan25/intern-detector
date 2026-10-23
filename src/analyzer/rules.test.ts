import { test } from 'node:test';
import assert from 'node:assert';
import { evaluateRules, upfrontFeeRule, unrealisticSalaryRule, unofficialChannelRule, freeEmailDomainRule, eduDomainRule, atsPortalRule } from './rules.js';

test('upfrontFeeRule detects registration fee demands and extracts evidence', () => {
  const sample = "Congratulations! To secure your internship, please pay a registration fee of $150 before starting.";
  const match = upfrontFeeRule.evaluate(sample);
  assert.ok(match, 'Expected upfront fee rule to match');
  assert.strictEqual(match?.type, 'red_flag');
  assert.ok(match?.finding.evidences.length > 0);
  assert.ok(match?.finding.evidences.some(e => /registration\s+fee/i.test(e)));
});

test('unrealisticSalaryRule flags exaggerated compensation', () => {
  const sample = "Remote data entry intern needed! Earn $800 per day from home with no experience.";
  const match = unrealisticSalaryRule.evaluate(sample);
  assert.ok(match, 'Expected unrealistic salary rule to match');
  assert.strictEqual(match?.type, 'red_flag');
  assert.ok(match?.finding.evidences.some(e => /\$800\s*per\s*day/i.test(e)));
});

test('unofficialChannelRule flags Telegram or WhatsApp interview redirects', () => {
  const sample = "Your resume was shortlisted. Please connect via Telegram @recruiter_john for your immediate interview.";
  const match = unofficialChannelRule.evaluate(sample);
  assert.ok(match, 'Expected unofficial channel rule to match');
  assert.strictEqual(match?.type, 'red_flag');
  assert.ok(match?.finding.evidences.some(e => /connect via telegram/i.test(e)));
});

test('freeEmailDomainRule flags corporate offers sent from free webmail accounts', () => {
  const sample = "Welcome to Microsoft Career Team! Please send your ID to hr.microsoft@gmail.com to proceed.";
  const match = freeEmailDomainRule.evaluate(sample);
  assert.ok(match, 'Expected free email domain rule to match');
  assert.strictEqual(match?.type, 'red_flag');
  assert.ok(match?.finding.evidences.some(e => e.includes('gmail.com')));
});

test('eduDomainRule recognizes verified educational institutions as trust signals', () => {
  const sample = "Check out the summer undergraduate research fellowship at https://research.stanford.edu/summer-fellowship";
  const match = eduDomainRule.evaluate(sample);
  assert.ok(match, 'Expected edu domain rule to match');
  assert.strictEqual(match?.type, 'trust_signal');
  assert.ok(match?.finding.evidences.some(e => e.includes('stanford.edu')));
});

test('atsPortalRule recognizes industry standard job board URLs as trust signals', () => {
  const sample = "Apply directly on our career page: https://boards.greenhouse.io/stripe/jobs/123456";
  const match = atsPortalRule.evaluate(sample);
  assert.ok(match, 'Expected ATS portal rule to match');
  assert.strictEqual(match?.type, 'trust_signal');
  assert.ok(match?.finding.evidences.some(e => e.includes('greenhouse.io')));
});

test('evaluateRules aggregates multiple red flags on a compound scam pitch', () => {
  const scamPitch = "Urgent hiring! Earn $1200 per week. Pay $50 registration fee and interview on Telegram.";
  const matches = evaluateRules(scamPitch);
  assert.ok(matches.length >= 3, `Expected at least 3 matches, got ${matches.length}`);
  const redFlags = matches.filter(m => m.type === 'red_flag');
  assert.ok(redFlags.length >= 3);
});
