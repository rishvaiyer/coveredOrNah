import assert from "node:assert/strict";
import { once } from "node:events";
import { spawn } from "node:child_process";
import { test, after } from "node:test";

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

test("accepts an allowed intake file without retaining contents", async () => {
  await waitForServer();
  const form = new FormData();
  form.append("files", new Blob(["insurer,plan\nExample,Preferred\n"], { type: "text/csv" }), "plans.csv");
  const response = await fetch(`${baseUrl}/api/plan-intake/files`, { method: "POST", body: form });
  const body = await response.json() as { status: string; fileCount: number; stored: boolean; reviewRequired: boolean; files: unknown[]; message: string };
  assert.equal(response.status, 200);
  assert.equal(body.status, "received");
  assert.equal(body.fileCount, 1);
  assert.equal(body.stored, false);
  assert.equal(body.reviewRequired, true);
  assert.equal(body.files.length, 1);
  assert.match(body.message, /not retained/);
});

test("rejects unsupported file types", async () => {
  const form = new FormData();
  form.append("files", new Blob(["not an insurer document"], { type: "application/octet-stream" }), "payload.exe");
  const response = await fetch(`${baseUrl}/api/plan-intake/files`, { method: "POST", body: form });
  const body = await response.json() as { status: string; message: string };
  assert.equal(response.status, 400);
  assert.equal(body.status, "rejected");
  assert.match(body.message, /PDF, Word, spreadsheet/);
});

test("rejects an empty intake request", async () => {
  const response = await fetch(`${baseUrl}/api/plan-intake/files`, { method: "POST" });
  const body = await response.json() as { status: string; message: string };
  assert.equal(response.status, 400);
  assert.deepEqual(body, { status: "rejected", message: "Add at least one insurer source file." });
});
