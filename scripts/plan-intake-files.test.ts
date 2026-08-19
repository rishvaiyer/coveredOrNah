import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { after, test } from "node:test";

const port = 31_000 + Math.floor(Math.random() * 500);
const child = spawn("./node_modules/.bin/tsx", ["server.ts"], {
  env: { ...process.env, PORT: String(port), DATABASE_URL: "" },
  stdio: ["ignore", "pipe", "pipe"],
});
let startupOutput = "";
child.stdout.on("data", (chunk) => { startupOutput += String(chunk); });
child.stderr.on("data", (chunk) => { startupOutput += String(chunk); });

const baseUrl = `http://127.0.0.1:${port}`;
const waitForServer = async () => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error(`Server did not start. ${startupOutput}`);
};

after(() => child.kill());

test("returns 404 for the removed intake upload endpoint", async () => {
  await waitForServer();
  const response = await fetch(`${baseUrl}/api/plan-intake/files`, { method: "POST" });
  assert.equal(response.status, 404);
});

test("keeps the PHI-free intake template link and no-upload statement in the built client bundle", () => {
  const distDir = path.join(process.cwd(), "dist");
  const assetDir = path.join(distDir, "assets");
  const bundleName = readdirSync(assetDir).find((entry) => /^index-.*\.js$/.test(entry));
  assert.ok(bundleName, "Expected a built client bundle in dist/assets.");
  const bundle = readFileSync(path.join(assetDir, bundleName), "utf8");
  assert.match(bundle, /\/clinic-plan-intake-template\.csv/);
  assert.match(bundle, /No files are uploaded, reviewed, or stored by this app\./);
  assert.doesNotMatch(bundle, /Send files for intake review/);
  assert.doesNotMatch(bundle, /Submitted for review/);
});
