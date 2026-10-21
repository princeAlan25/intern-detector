import app from "../src/server.js";
import http from "http";

console.log("=== RUNNING SLICE 2 MECHANICAL VERIFICATION ===");

const server = http.createServer(app);

server.listen(3099, async () => {
  try {
    // 1. Verify index.html is served at root
    const rootRes = await fetch("http://localhost:3099/");
    const rootHtml = await rootRes.text();
    console.log(`[CHECK 1] GET / -> HTTP ${rootRes.status}`);
    if (rootRes.status !== 200 || !rootHtml.includes("Fake-Real Detector")) {
      throw new Error("Failed to serve public/index.html correctly.");
    }
    console.log("  ✓ Serves index.html with Title and Input Surface.");

    // 2. Verify Tailwind CSS output.css is served
    const cssRes = await fetch("http://localhost:3099/dist/output.css");
    const cssText = await cssRes.text();
    console.log(`[CHECK 2] GET /dist/output.css -> HTTP ${cssRes.status}`);
    if (cssRes.status !== 200 || cssText.length < 500) {
      throw new Error("Failed to serve compiled Tailwind stylesheet.");
    }
    console.log(`  ✓ Serves compiled Tailwind CSS (${cssText.length} bytes).`);

    // 3. Verify client app.js is served
    const jsRes = await fetch("http://localhost:3099/dist/app.js");
    const jsText = await jsRes.text();
    console.log(`[CHECK 3] GET /dist/app.js -> HTTP ${jsRes.status}`);
    if (jsRes.status !== 200 || !jsText.includes("contentInput")) {
      throw new Error("Failed to serve compiled client script.");
    }
    console.log("  ✓ Serves compiled client app.js script.");

    // 4. Verify Empty Input Guard on API
    const emptyRes = await fetch("http://localhost:3099/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "   " })
    });
    console.log(`[CHECK 4] POST /api/analyze with empty input -> HTTP ${emptyRes.status}`);
    if (emptyRes.status !== 400) {
      throw new Error("Expected HTTP 400 for empty content input.");
    }
    console.log("  ✓ Backend validates empty input correctly.");

    console.log("\n>>> ALL SLICE 2 MECHANICAL CHECKS PASSED SUCCESSFULLY! <<<");
  } catch (err) {
    console.error("Slice 2 Verification Error:", err);
    process.exit(1);
  } finally {
    server.close();
  }
});
