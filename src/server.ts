import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { analyzeContent } from "./analyzer.js";
import { AnalysisRequest } from "./types.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve directory paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "../public");

// Middleware
app.use(express.json());
app.use(express.static(publicDir));

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "fake-real-detector", timestamp: new Date().toISOString() });
});

// Primary Analysis API endpoint
app.post("/api/analyze", (req: Request<{}, {}, AnalysisRequest>, res: Response) => {
  const { content } = req.body;

  if (typeof content !== "string") {
    return res.status(400).json({ error: "Property 'content' must be a valid string." });
  }

  // PRD edge-case: If content is empty or whitespace, return empty/noop response
  if (!content.trim()) {
    return res.status(400).json({ error: "Content cannot be empty." });
  }

  try {
    const result = analyzeContent(content);
    return res.json(result);
  } catch (err: any) {
    console.error("Analysis error:", err);
    return res.status(500).json({ error: "An unexpected error occurred during analysis." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Fake-Real Detector server running at http://localhost:${PORT}`);
});

export default app;
