import { Finding } from "./types.js";

export interface Rule {
  id: string;
  name: string;
  category: "scam" | "legit";
  scoreImpact: number; // Negative for scam, positive for legit
  patterns: (string | RegExp)[];
  getReason: () => string;
}

export const RULES: Rule[] = [
  // 1. Upfront Fee Demand (Critical Scam Indicator)
  {
    id: "upfront_fee",
    name: "Upfront Payment Required",
    category: "scam",
    scoreImpact: -4,
    patterns: [
      /pay\s+\$?\d+\s*(?:registration|application|processing|training|onboarding)?\s*(?:fee|deposit|cost)/i,
      /registration\s+fee/i,
      /application\s+fee/i,
      /security\s+deposit/i,
      /wire\s+(?:money|funds|transfer)/i,
      /gift\s*card/i,
      /western\s+union/i,
      /pay\s+upfront/i,
      /crypto(?:currency)?\s+payment/i
    ],
    getReason: () => "Demands upfront payment or registration fees before work begins."
  },

  // 2. Unrealistic Compensation (High Scam Indicator)
  {
    id: "unrealistic_compensation",
    name: "Unrealistic Income Guarantee",
    category: "scam",
    scoreImpact: -3,
    patterns: [
      /earn\s+\$?\d{3,5}\s*(?:\/|\s*per\s*)(?:week|day|hr|hour)/i,
      /\$\d{3,5}\s*(?:\/|\s*per\s*)(?:week|day)/i,
      /guaranteed\s+(?:income|earnings|payout)/i,
      /no\s+experience\s+(?:needed|required|necessary)/i,
      /work\s+(?:1|2|3)\s*hours?\s*(?:a|per)?\s*day\s+and\s+earn/i,
      /make\s+money\s+fast/i
    ],
    getReason: () => "Promises disproportionately high earnings with no experience or qualifications required."
  },

  // 3. High Urgency Pressure (Medium Scam Indicator)
  {
    id: "urgency_tactics",
    name: "Artificial Urgency & Scarcity",
    category: "scam",
    scoreImpact: -2,
    patterns: [
      /(?:apply|respond|register)\s+within\s+(?:24|48)\s*hours/i,
      /limited\s+(?:spots|positions|slots)\s+available/i,
      /only\s+\d+\s+(?:spots|slots)\s+left/i,
      /urgent\s+hiring/i,
      /valid\s+(?:today\s+only|for\s+limited\s+time)/i,
      /act\s+now/i
    ],
    getReason: () => "Employs high-pressure urgency tactics to bypass rational verification."
  },

  // 4. Informal or Free Email Channels for Corporate Roles
  {
    id: "informal_contact",
    name: "Unofficial Contact Channels",
    category: "scam",
    scoreImpact: -2,
    patterns: [
      /contact\s+(?:us\s+)?on\s+telegram/i,
      /send\s+(?:cv|resume|message)\s+on\s+whatsapp/i,
      /t\.me\/[a-zA-Z0-9_]+/i,
      /wa\.me\/[0-9]+/i,
      /[a-zA-Z0-9._%+-]+@(?:gmail|yahoo|hotmail|outlook)\.com/i
    ],
    getReason: () => "Directs applicants to personal email domains or instant messaging apps rather than official enterprise portals."
  },

  // 5. Educational / Official Institutional Domain (Positive Legitimacy Signal)
  {
    id: "institutional_domain",
    name: "Verified Institutional Domain",
    category: "legit",
    scoreImpact: +2,
    patterns: [
      /https?:\/\/[a-zA-Z0-9.-]+\.(?:edu|ac\.uk|gov|org)\b/i,
      /\b[a-zA-Z0-9.-]+\.(?:edu|ac\.uk|gov)\b/i
    ],
    getReason: () => "References recognized educational, governmental, or non-profit domains."
  },

  // 6. Standard Professional Hiring Process (Positive Legitimacy Signal)
  {
    id: "formal_application_process",
    name: "Standard Application Procedure",
    category: "legit",
    scoreImpact: +2,
    patterns: [
      /submit\s+(?:your\s+)?(?:resume|cv|cover\s+letter)/i,
      /equal\s+opportunity\s+employer/i,
      /interview\s+(?:process|stage|schedule)/i,
      /qualifications\s*:/i,
      /minimum\s+requirements/i,
      /official\s+(?:career|application)\s+portal/i
    ],
    getReason: () => "Follows standard structured recruitment procedures with formal application stages."
  }
];

export interface RuleEvaluationResult {
  trustScore: number;
  findings: Finding[];
}

export function evaluateRules(text: string): RuleEvaluationResult {
  const findings: Finding[] = [];
  let score = 7; // Baseline neutral-to-cautious starting point
  let hasCriticalScam = false;

  for (const rule of RULES) {
    const matchedEvidences: string[] = [];

    for (const pattern of rule.patterns) {
      if (typeof pattern === "string") {
        if (text.toLowerCase().includes(pattern.toLowerCase())) {
          matchedEvidences.push(pattern);
        }
      } else {
        const matches = text.match(new RegExp(pattern, "gi"));
        if (matches) {
          for (const m of matches) {
            if (!matchedEvidences.includes(m.trim())) {
              matchedEvidences.push(m.trim());
            }
          }
        }
      }
    }

    if (matchedEvidences.length > 0) {
      findings.push({
        reason: rule.getReason(),
        evidences: matchedEvidences
      });

      score += rule.scoreImpact;

      if (rule.id === "upfront_fee") {
        hasCriticalScam = true;
      }
    }
  }

  // Critical cap: If upfront fee or multiple severe scams, score cannot exceed 3
  if (hasCriticalScam) {
    score = Math.min(score, 3);
  }

  // Bound score strictly between 1 and 10
  const finalScore = Math.max(1, Math.min(10, score));

  return {
    trustScore: finalScore,
    findings
  };
}
