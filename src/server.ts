import express, { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { analyzeContent } from './analyzer/orchestrator.js';
import { AnalysisRequest } from './types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Main analysis endpoint
app.post('/api/analyze', async (req: Request<{}, {}, AnalysisRequest>, res: Response) => {
  const { content } = req.body;

  if (typeof content !== 'string' || content.trim() === '') {
    res.status(400).json({ error: 'Content is required and must be a non-empty string.' });
    return;
  }

  try {
    const analysis = await analyzeContent(content);
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'An unexpected error occurred during analysis.' });
  }
});

// Helper to start the server
export function startServer(port: number | string = PORT) {
  return app.listen(port, () => {
    console.log(`Fake-Real Detector server running on http://localhost:${port}`);
  });
}

// Start listening only if run directly as the application entry point
const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isMain) {
  startServer();
}
