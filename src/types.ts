export type Verdict = "Safe" | "Caution" | "High Risk";

export interface Finding {
  reason: string;
  evidences: string[];
}

export interface AnalysisRequest {
  content: string;
}

export interface AnalysisResponse {
  trustScore: number; // 1 to 10
  verdict: Verdict;
  summary: string;
  findings: Finding[];
}
