import { test, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { app } from './server.js';
import { AnalysisResponse } from './types.js';

let server: http.Server;
let baseUrl: string;

before(async () => {
  process.env.NODE_ENV = 'test';
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        baseUrl = `http://localhost:${address.port}`;
      }
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

test('GET /health returns 200 OK with status ok', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.deepStrictEqual(data, { status: 'ok' });
});

test('GET / serves frontend index.html with HTTP 200 and includes app logo', async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.strictEqual(res.status, 200);
  const html = await res.text();
  assert.ok(html.includes('Fake-Real Detector'));
  assert.ok(html.includes('id="detector-form"'));
  assert.ok(html.includes('src="/resources/app-icon.gif"'));
  assert.ok(html.includes('alt="Fake-Real Detector Logo"'));
});

test('GET /resources/app-icon.gif, /app-icon.gif, and /favicon.gif return 200 with image/gif', async () => {
  const resourceRes = await fetch(`${baseUrl}/resources/app-icon.gif`);
  assert.strictEqual(resourceRes.status, 200);
  assert.strictEqual(resourceRes.headers.get('content-type'), 'image/gif');

  const iconRes = await fetch(`${baseUrl}/app-icon.gif`);
  assert.strictEqual(iconRes.status, 200);
  assert.strictEqual(iconRes.headers.get('content-type'), 'image/gif');

  const faviconRes = await fetch(`${baseUrl}/favicon.gif`);
  assert.strictEqual(faviconRes.status, 200);
  assert.strictEqual(faviconRes.headers.get('content-type'), 'image/gif');
});

test('CORS headers are present on requests from isolated frontend', async () => {
  const res = await fetch(`${baseUrl}/health`, {
    headers: { Origin: 'http://localhost:5173' }
  });
  assert.strictEqual(res.headers.get('access-control-allow-origin'), '*');
});

test('POST /api/analyze returns 400 Bad Request on empty or missing content', async () => {
  const res = await fetch(`${baseUrl}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: '   ' })
  });
  assert.strictEqual(res.status, 400);
  const data = await res.json();
  assert.ok(data.error);
});

test('POST /api/analyze returns 200 with scam analysis for scam pitch', async () => {
  const res = await fetch(`${baseUrl}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: 'Immediate opening! Pay $50 registration fee and contact via Telegram @internship_hr.'
    })
  });

  assert.strictEqual(res.status, 200);
  const data = (await res.json()) as AnalysisResponse;

  assert.ok(typeof data.trustScore === 'number');
  assert.ok(data.trustScore <= 4);
  assert.strictEqual(data.verdict, 'High Risk');
  assert.ok(typeof data.summary === 'string');
  assert.ok(Array.isArray(data.findings) && data.findings.length > 0);
  assert.ok(Array.isArray(data.findings[0].evidences) && data.findings[0].evidences.length > 0);
});

test('POST /api/analyze returns 200 with Safe verdict for legitimate university offer', async () => {
  const res = await fetch(`${baseUrl}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: 'Stanford AI Lab Summer Internship: apply via https://stanford.edu/summer-internship on Greenhouse: https://boards.greenhouse.io/stanford'
    })
  });

  assert.strictEqual(res.status, 200);
  const data = (await res.json()) as AnalysisResponse;

  assert.ok(data.trustScore >= 8);
  assert.strictEqual(data.verdict, 'Safe');
  assert.ok(data.findings.length > 0);
});
