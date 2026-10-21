import { AnalysisResponse, Verdict } from "./types.js";
import { evaluateRules } from "./rules.js";

export function analyzeContent(content: string): AnalysisResponse {
  const trimmed = content.trim();

  // If empty, return a safe minimal neutral response
  if (!trimmed) {
    return {
      trustScore: 5,
      verdict: "Caution",
      summary: "No content provided for analysis.",
      findings: []
    };
  }

  const { trustScore, findings } = evaluateRules(trimmed);

  // Compute Verdict
  let verdict: Verdict = "Caution";
  if (trustScore >= 8) {
    verdict = "Safe";
  } else if (trustScore <= 4) {
    verdict = "High Risk";
  }

  // Generate Summary based on verdict & findings
  let summary = "";
  if (verdict === "High Risk") {
    summary =
      "High scam probability detected. This posting exhibits severe red flags (such as upfront payment demands or unrealistic promises). Do not send money or sensitive personal information.";
  } else if (verdict === "Safe") {
    summary =
      "Legitimate patterns identified. This listing reflects standard professional recruitment standards, realistic qualifications, and recognized domains.";
  } else {
    summary =
      "Mixed signals detected. While no immediate critical scam patterns were triggered, key verification markers are missing. Verify the employer directly on their official careers page.";
  }

  // If no specific rules matched, add a helpful educational finding
  if (findings.length === 0) {
    findings.push({
      reason:
        "No common scam patterns or verified institutional signals were recognized in this snippet.",
      evidences: ["Content reviewed without high-confidence rule matches"]
    });
  }

  return {
    trustScore,
    verdict,
    summary,
    findings
  };
}
