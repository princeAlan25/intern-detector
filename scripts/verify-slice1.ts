import { analyzeContent } from "../src/analyzer.js";

console.log("=== RUNNING SLICE 1 MECHANICAL VERIFICATION ===");

// 1. Test Scam Pitch
const scamInput =
  "URGENT HIRING: Earn $5000/week, no experience needed! Work 2 hours a day from home. Pay $50 registration fee via gift card to secure your spot. Apply within 24 hours on Telegram: t.me/fastjobs";

const scamResult = analyzeContent(scamInput);
console.log("\n[SCAM TEST RESULT]");
console.log(`Trust Score: ${scamResult.trustScore}/10 (Expected <= 3)`);
console.log(`Verdict: ${scamResult.verdict} (Expected: High Risk)`);
console.log(`Findings count: ${scamResult.findings.length}`);
scamResult.findings.forEach((f, i) => {
  console.log(`  ${i + 1}. Reason: ${f.reason}`);
  console.log(`     Evidences (${f.evidences.length}): ${JSON.stringify(f.evidences)}`);
});

if (scamResult.trustScore > 3 || scamResult.verdict !== "High Risk") {
  console.error("FAIL: Scam detection failed!");
  process.exit(1);
}

// 2. Test Legitimate Posting
const legitInput =
  "Summer Research Internship at Stanford University (https://stanford.edu). Equal opportunity employer. Submit your resume and cover letter through our official career portal. Minimum requirements: computer science coursework and basic coding skills.";

const legitResult = analyzeContent(legitInput);
console.log("\n[LEGIT TEST RESULT]");
console.log(`Trust Score: ${legitResult.trustScore}/10 (Expected >= 8)`);
console.log(`Verdict: ${legitResult.verdict} (Expected: Safe)`);
console.log(`Findings count: ${legitResult.findings.length}`);
legitResult.findings.forEach((f, i) => {
  console.log(`  ${i + 1}. Reason: ${f.reason}`);
  console.log(`     Evidences (${f.evidences.length}): ${JSON.stringify(f.evidences)}`);
});

if (legitResult.trustScore < 8 || legitResult.verdict !== "Safe") {
  console.error("FAIL: Legit detection failed!");
  process.exit(1);
}

// 3. Verify Contract: every finding must have an array of evidences
for (const f of [...scamResult.findings, ...legitResult.findings]) {
  if (!Array.isArray(f.evidences) || f.evidences.length === 0) {
    console.error(`FAIL: Finding missing valid evidences array: ${JSON.stringify(f)}`);
    process.exit(1);
  }
}

console.log("\n>>> ALL SLICE 1 MECHANICAL CHECKS PASSED SUCCESSFULLY! <<<");
