import dotenv from 'dotenv';
import { analyzeWithOpenRouter } from '../src/analyzer/openrouter.js';

dotenv.config();

async function testConnection() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct';

  console.log('--- Testing OpenRouter Connection ---');
  if (!apiKey || apiKey.trim() === '') {
    console.error('❌ OPENROUTER_API_KEY is not set in .env');
    console.log('Please add your key to .env:');
    console.log('OPENROUTER_API_KEY=sk-or-v1-...');
    process.exit(1);
  }

  const maskedKey = apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4);
  console.log(`🔑 Using API Key: ${maskedKey}`);
  console.log(`🤖 Using Model:   ${model}`);
  console.log('\nSending test prompt to OpenRouter...');

  const startTime = Date.now();
  const testSample = 'Congratulations! You have been selected for an online data entry internship paying $800/day. Please pay a $60 onboarding fee via Telegram @recruiter to start.';

  const result = await analyzeWithOpenRouter(testSample);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  if (!result) {
    console.error(`❌ Connection failed after ${elapsed}s. Check API key permissions, credits, or model name.`);
    process.exit(1);
  }

  console.log(`✅ Success! Received response in ${elapsed}s:`);
  console.log(JSON.stringify(result, null, 2));
}

testConnection().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
