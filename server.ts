import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  medications,
  plans,
  coverageFor,
  summitNjInsurers,
  summitNjFormularySources,
  type PlanKey,
} from "./src/components/generated/PulmonaryFormularyDashboard.tsx";

const app = express();
const port = Number(process.env.PORT || 3000);
const rootDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(rootDir, "dist");
const validPlanKeys = new Set<PlanKey>(plans.map((plan) => plan.key));
const paFormDownloads = new Map(
  plans
    .filter(
      (plan) => plan.priorAuthorizationDownload && plan.priorAuthorizationUrl,
    )
    .map((plan) => [
      plan.key,
      {
        url: plan.priorAuthorizationUrl as string,
        filename: `${plan.short.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-prior-authorization-form.pdf`,
      },
    ]),
);

app.disable("x-powered-by");
app.use((_request, response, next) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  next();
});

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "covered-or-nah-api",
    medicationCount: medications.length,
    planCount: plans.length,
  });
});

app.get("/api/plans", (_request, response) => {
  response.json({ plans });
});

app.get("/api/pa-form/:plan", async (request, response) => {
  const planKey = String(request.params.plan || "") as PlanKey;
  const form = paFormDownloads.get(planKey);
  if (!form) {
    response.status(404).json({ error: "No downloadable PA form for this plan." });
    return;
  }

  try {
    const formResponse = await fetch(form.url, { redirect: "follow" });
    if (!formResponse.ok) throw new Error(`Official form returned ${formResponse.status}`);
    const pdf = Buffer.from(await formResponse.arrayBuffer());
    response.setHeader("Content-Type", "application/pdf");
    response.setHeader("Content-Disposition", `attachment; filename="${form.filename}"`);
    response.setHeader("Cache-Control", "public, max-age=3600");
    response.send(pdf);
  } catch {
    response.status(502).json({ error: "Unable to retrieve the official PA form right now." });
  }
});

app.get("/api/summit-nj-insurers", (request, response) => {
  const query = String(request.query.q || "")
    .trim()
    .slice(0, 100)
    .toLowerCase();
  const insurers = summitNjInsurers.filter((insurer) =>
    [insurer.name, insurer.category, insurer.note]
      .join(" ")
      .toLowerCase()
      .includes(query),
  );
  response.json({
    count: insurers.length,
    source: "Summit Health New Jersey accepted-insurance list",
    insurers,
  });
});

app.get("/api/summit-nj-formulary-sources", (_request, response) => {
  response.json({
    count: summitNjFormularySources.length,
    sources: summitNjFormularySources,
  });
});

app.get("/api/metadata", (_request, response) => {
  response.json({
    medicationCount: medications.length,
    summitNjInsurerCount: summitNjInsurers.length,
    summitNjPrioritySourceCount: summitNjFormularySources.length,
    pulmonaryMedicationCount: medications.filter(
      (medication) => medication.branch !== "Common primary care",
    ).length,
    branches: Array.from(
      new Set(medications.map((medication) => medication.branch)),
    ).sort(),
    plans,
  });
});

app.get("/api/medications", (request, response) => {
  const query = String(request.query.q || "")
    .trim()
    .slice(0, 100)
    .toLowerCase();
  const branch = String(request.query.branch || "")
    .trim()
    .slice(0, 100);
  const requestedPlan = String(request.query.plan || "").trim() as PlanKey;
  const plan = validPlanKeys.has(requestedPlan) ? requestedPlan : null;
  const requestedLimit = Number(request.query.limit || 100);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.floor(requestedLimit), 1), 100)
    : 100;

  const results = medications
    .filter((medication) => {
      const matchesQuery =
        !query ||
        [
          medication.generic,
          medication.brands,
          medication.branch,
          medication.use,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesBranch = !branch || medication.branch === branch;
      return matchesQuery && matchesBranch;
    })
    .slice(0, limit)
    .map((medication) => ({
      ...medication,
      coverage: plan
        ? { [plan]: coverageFor(medication, plan) }
        : Object.fromEntries(
            plans.map((candidatePlan) => [
              candidatePlan.key,
              coverageFor(medication, candidatePlan.key),
            ]),
          ),
    }));

  response.json({ count: results.length, medications: results });
});

app.get("/api/alternatives", (request, response) => {
  const medicationName = String(request.query.medication || "")
    .trim()
    .slice(0, 160);
  const plan = String(request.query.plan || "").trim() as PlanKey;

  if (!medicationName || !validPlanKeys.has(plan)) {
    response.status(400).json({
      error: "A valid medication and plan are required.",
      validPlans: Array.from(validPlanKeys),
    });
    return;
  }

  const medication = medications.find(
    (candidate) =>
      candidate.generic.toLowerCase() === medicationName.toLowerCase(),
  );
  if (!medication) {
    response.status(404).json({ error: "Medication not found." });
    return;
  }

  const alternatives = medications
    .filter(
      (candidate) =>
        candidate.generic !== medication.generic &&
        candidate.branch === medication.branch &&
        ["Preferred", "Tier 1", "Generic", "Low-cost generic", "Preferred brand"].includes(
          coverageFor(candidate, plan).state,
        ),
    )
    .slice(0, 5)
    .map((candidate) => ({
      generic: candidate.generic,
      brands: candidate.brands,
      branch: candidate.branch,
      coverage: coverageFor(candidate, plan),
    }));

  response.json({
    medication: medication.generic,
    plan,
    branch: medication.branch,
    note: "Formulary alternatives only. Not substitution advice.",
    alternatives,
  });
});

app.use("/api", (_request, response) => {
  response.status(404).json({ error: "API route not found." });
});

app.use(express.static(distDir, { index: false, maxAge: "1h" }));
app.get(/.*/, (_request, response) => {
  response.sendFile(path.join(distDir, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Covered or Nah listening on port ${port}`);
});
