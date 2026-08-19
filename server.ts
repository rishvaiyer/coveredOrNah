import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureFormularySchema, pool } from "./db.js";
import {
  medications,
  plans,
  primaryNjPlans,
  coverageFor,
  summitNjInsurers,
  summitNjFormularySources,
  type PlanKey,
} from "./src/components/generated/PulmonaryFormularyDashboard.tsx";
import { PDP_REGION_BY_STATE } from "./scripts/cms-medicare-utils.js";
import { UhcNjQhpAdapter, serializeUhcNjQhpError } from "./uhc-nj-qhp.js";
import {
  AetnaNjFamilyCareAdapter,
  AetnaNjFamilyCareError,
  autocompleteAetnaNjFamilyCareDrugs,
  getAetnaNjFamilyCareMetadata,
  lookupAetnaNjFamilyCareCoverageByNdc,
} from "./src/server-data/aetna-nj-familycare.js";
import {
  UhcNjCommunityAdapter,
  autocompleteUhcNjCommunity,
  lookupUhcNjCommunity,
  uhcNjCommunitySource,
} from "./src/server-data/uhc-nj-community.js";
import {
  autocompleteFidelisNjFamilyCare,
  fidelisNjFamilyCareDrugs,
  fidelisNjFamilyCareSource,
  lookupFidelisNjFamilyCare,
} from "./src/server-data/fidelis-nj-familycare.js";
import {
  autocompleteHorizonNjHealth,
  horizonNjHealthDrugs,
  horizonNjHealthSource,
  lookupHorizonNjHealth,
} from "./src/server-data/horizon-nj-health.js";
import {
  autocompleteWellpointFeed,
  fetchWellpointNjFamilyCareFeed,
  lookupWellpointFeedProduct,
  type WellpointNjFamilyCareFeed,
} from "./src/server-data/wellpoint-nj-familycare-feed.js";

const app = express();
const port = Number(process.env.PORT || 3000);
const rootDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(rootDir, "dist");
const validPlanKeys = new Set<PlanKey>(plans.map((plan) => plan.key));
const uhcNjQhp = new UhcNjQhpAdapter();
const aetnaNjFamilyCare = new AetnaNjFamilyCareAdapter();
const uhcNjCommunity = new UhcNjCommunityAdapter();
let wellpointFeedCache: { loadedAt: number; feed: WellpointNjFamilyCareFeed } | null = null;
let wellpointFeedPromise: Promise<WellpointNjFamilyCareFeed> | null = null;
const loadWellpointFeed = async () => {
  if (wellpointFeedCache && Date.now() - wellpointFeedCache.loadedAt < 6 * 60 * 60 * 1_000) return wellpointFeedCache.feed;
  if (!wellpointFeedPromise) {
    wellpointFeedPromise = fetchWellpointNjFamilyCareFeed()
      .then((feed) => { wellpointFeedCache = { loadedAt: Date.now(), feed }; return feed; })
      .finally(() => { wellpointFeedPromise = null; });
  }
  return wellpointFeedPromise;
};
const serializeWellpointFeedProduct = (product: ReturnType<typeof autocompleteWellpointFeed>[number]) => {
  const rows = product.rows;
  return {
    id: product.id,
    name: product.name,
    aliases: product.aliases,
    tier: rows.some((row) => row.drugTier.toLowerCase().includes("non")) ? "Non-Preferred" : "Preferred",
    priorAuthorization: rows.some((row) => row.priorAuthorization),
    quantityLimit: rows.some((row) => row.quantityLimit),
    stepTherapy: rows.some((row) => row.stepTherapy),
    specialtyPharmacy: false,
    ageLimit: false,
    note: `${rows.length} NDC${rows.length === 1 ? "" : "s"} in the current feed`,
  };
};
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
    service: "formulary-finder-api",
    medicationCount: medications.length,
    planCount: primaryNjPlans.length,
  });
});

app.get("/api/plans", (_request, response) => {
  response.json({ plans: primaryNjPlans });
});

app.get("/api/uhc-nj-qhp/plans", async (request, response) => {
  const query = String(request.query.q || "").trim().slice(0, 200);
  if (!query) return response.status(400).json({ status: "error", error: "q is required for exact UHC NJ QHP plan matching." });
  response.setHeader("Cache-Control", "no-store");
  try {
    response.json(await uhcNjQhp.exactPlanSearch(query));
  } catch (error) {
    response.status(503).json(serializeUhcNjQhpError(error));
  }
});

app.get("/api/uhc-nj-qhp/drugs", async (request, response) => {
  const query = String(request.query.q || "").trim().slice(0, 100);
  const requestedLimit = Number(request.query.limit || 20);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.floor(requestedLimit), 1), 25) : 20;
  if (query.length < 2) return response.status(400).json({ status: "error", error: "q must contain at least 2 characters." });
  response.setHeader("Cache-Control", "no-store");
  try {
    response.json(await uhcNjQhp.drugAutocomplete(query, limit));
  } catch (error) {
    response.status(503).json(serializeUhcNjQhpError(error));
  }
});

app.get("/api/uhc-nj-qhp/coverage", async (request, response) => {
  const planId = String(request.query.planId || "").trim().toUpperCase();
  const rxcui = String(request.query.rxcui || "").trim();
  if (!/^37777NJ\d{7}$/.test(planId) || !/^\d+$/.test(rxcui)) {
    return response.status(400).json({ status: "error", covered: null, error: "An exact 2026 UHC NJ Individual/Family HIOS planId and numeric RxCUI are required." });
  }
  response.setHeader("Cache-Control", "no-store");
  try {
    response.json(await uhcNjQhp.coverage(planId, rxcui));
  } catch (error) {
    response.status(503).json(serializeUhcNjQhpError(error));
  }
});

const sendAetnaNjFamilyCareError = (response: express.Response, error: unknown) => {
  const sourceError = error instanceof AetnaNjFamilyCareError ? error : null;
  const invalidRequest = sourceError?.code === "INVALID_NDC" || sourceError?.code === "INVALID_SCHEMA";
  response.status(invalidRequest ? 400 : 503).json({
    status: "error",
    listed: null,
    error: sourceError?.code ?? "SOURCE_UNAVAILABLE",
    message: sourceError?.message ?? "Aetna NJ FamilyCare formulary data is temporarily unavailable.",
    scope: "Aetna Better Health of New Jersey FamilyCare Medicaid only",
  });
};

app.get("/api/aetna-nj-familycare/metadata", async (_request, response) => {
  response.setHeader("Cache-Control", "no-store");
  try {
    response.json({ status: "confirmed", ...getAetnaNjFamilyCareMetadata(await aetnaNjFamilyCare.load()) });
  } catch (error) {
    sendAetnaNjFamilyCareError(response, error);
  }
});

app.get("/api/aetna-nj-familycare/drugs", async (request, response) => {
  const query = String(request.query.q || "").trim().slice(0, 100);
  const requestedLimit = Number(request.query.limit || 12);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.floor(requestedLimit), 1), 25) : 12;
  response.setHeader("Cache-Control", "no-store");
  try {
    const result = autocompleteAetnaNjFamilyCareDrugs(await aetnaNjFamilyCare.load(), query, limit);
    response.json({ status: result.suggestions.length ? "confirmed" : "unconfirmed", ...result });
  } catch (error) {
    sendAetnaNjFamilyCareError(response, error);
  }
});

app.get("/api/aetna-nj-familycare/coverage", async (request, response) => {
  const ndc = String(request.query.ndc || "").trim();
  response.setHeader("Cache-Control", "no-store");
  try {
    const result = lookupAetnaNjFamilyCareCoverageByNdc(await aetnaNjFamilyCare.load(), ndc);
    response.json({ listed: result.status === "listed" ? true : null, ...result });
  } catch (error) {
    sendAetnaNjFamilyCareError(response, error);
  }
});

app.get("/api/uhc-nj-community/metadata", async (_request, response) => {
  response.setHeader("Cache-Control", "no-store");
  try {
    const snapshot = await uhcNjCommunity.load();
    response.json({
      status: "confirmed",
      source: uhcNjCommunitySource(),
      productCount: snapshot.drugs.length,
      sourceRetrievedAt: snapshot.fetchedAt,
      sourceLastModified: snapshot.responseLastModified,
    });
  } catch {
    response.status(503).json({ status: "error", listed: null, error: "SOURCE_UNAVAILABLE", scope: uhcNjCommunitySource().boundary });
  }
});

app.get("/api/uhc-nj-community/drugs", async (request, response) => {
  const query = String(request.query.q || "").trim().slice(0, 100);
  const requestedLimit = Number(request.query.limit || 12);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.floor(requestedLimit), 1), 25) : 12;
  response.setHeader("Cache-Control", "no-store");
  try {
    const drugs = autocompleteUhcNjCommunity(await uhcNjCommunity.load(), query, limit);
    response.json({ status: drugs.length ? "confirmed" : "unconfirmed", source: uhcNjCommunitySource(), query, drugs });
  } catch {
    response.status(503).json({ status: "error", listed: null, error: "SOURCE_UNAVAILABLE", scope: uhcNjCommunitySource().boundary });
  }
});

app.get("/api/uhc-nj-community/coverage", async (request, response) => {
  const rxcui = String(request.query.rxcui || "").trim();
  if (!/^\d+$/.test(rxcui)) return response.status(400).json({ status: "error", listed: null, error: "A numeric RxCUI is required." });
  response.setHeader("Cache-Control", "no-store");
  try {
    const result = lookupUhcNjCommunity(await uhcNjCommunity.load(), rxcui);
    response.json({ listed: result.status === "listed" ? true : null, ...result });
  } catch {
    response.status(503).json({ status: "error", listed: null, error: "SOURCE_UNAVAILABLE", scope: uhcNjCommunitySource().boundary });
  }
});

app.get("/api/fidelis-nj-familycare/metadata", (_request, response) => {
  response.json({
    status: "confirmed",
    source: fidelisNjFamilyCareSource,
    productCount: fidelisNjFamilyCareDrugs.length,
    extraction: "partial pulmonary rows from the current 2026 PDF",
  });
});

app.get("/api/fidelis-nj-familycare/drugs", (request, response) => {
  const query = String(request.query.q || "").trim().slice(0, 100);
  const requestedLimit = Number(request.query.limit || 12);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.floor(requestedLimit), 1), 25) : 12;
  const drugs = autocompleteFidelisNjFamilyCare(query, limit);
  response.json({ status: drugs.length ? "confirmed" : "unconfirmed", source: fidelisNjFamilyCareSource, query, drugs });
});

app.get("/api/fidelis-nj-familycare/coverage", (request, response) => {
  const id = String(request.query.id || "").trim().slice(0, 80);
  if (!id) return response.status(400).json({ status: "error", listed: null, error: "A Fidelis pulmonary product id is required." });
  const result = lookupFidelisNjFamilyCare(id);
  response.json({ listed: result.status === "listed" ? true : null, ...result });
});

app.get("/api/horizon-nj-health/metadata", (_request, response) => {
  response.json({
    status: "confirmed",
    source: horizonNjHealthSource,
    productCount: horizonNjHealthDrugs.length,
    extraction: "partial pulmonary rows from the current 2026 PDF",
  });
});

app.get("/api/horizon-nj-health/drugs", (request, response) => {
  const query = String(request.query.q || "").trim().slice(0, 100);
  const requestedLimit = Number(request.query.limit || 12);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.floor(requestedLimit), 1), 25) : 12;
  const drugs = autocompleteHorizonNjHealth(query, limit);
  response.json({ status: drugs.length ? "confirmed" : "unconfirmed", source: horizonNjHealthSource, query, drugs });
});

app.get("/api/horizon-nj-health/coverage", (request, response) => {
  const id = String(request.query.id || "").trim().slice(0, 80);
  if (!id) return response.status(400).json({ status: "error", listed: null, error: "A Horizon NJ Health pulmonary product id is required." });
  const result = lookupHorizonNjHealth(id);
  response.json({ listed: result.status === "listed" ? true : null, ...result });
});

app.get("/api/wellpoint-nj-familycare/metadata", async (_request, response) => {
  try {
    const feed = await loadWellpointFeed();
    response.json({ status: "confirmed", source: { id: "wellpoint-nj-familycare-2026-json", name: "Wellpoint New Jersey Medicaid machine-readable formulary", url: "https://fm.formularynavigator.com/FBO/4/New%20Jersey%20Medicaid.json", effectiveDate: feed.profile.effectiveDate, extraction: "full-machine-readable-feed", boundary: "Wellpoint NJ FamilyCare Medicaid only. Not eligibility, cost, payment, or clinical criteria." }, profile: feed.profile, rowCount: feed.drugs.length, productCount: feed.products.length, responseBytes: feed.responseBytes, fetchedAt: feed.fetchedAt });
  } catch (error) {
    response.status(503).json({ status: "error", error: error instanceof Error ? error.message : "SOURCE_UNAVAILABLE" });
  }
});

app.get("/api/wellpoint-nj-familycare/drugs", async (request, response) => {
  const query = String(request.query.q || "").trim().slice(0, 100);
  const requestedLimit = Number(request.query.limit || 12);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.floor(requestedLimit), 1), 25) : 12;
  try {
    const feed = await loadWellpointFeed();
    const products = autocompleteWellpointFeed(feed, query, limit);
    response.json({ status: products.length ? "confirmed" : "unconfirmed", source: { effectiveDate: feed.profile.effectiveDate, extraction: "full-machine-readable-feed" }, query, drugs: products.map(serializeWellpointFeedProduct) });
  } catch (error) {
    response.status(503).json({ status: "error", error: error instanceof Error ? error.message : "SOURCE_UNAVAILABLE" });
  }
});

app.get("/api/wellpoint-nj-familycare/coverage", async (request, response) => {
  const id = String(request.query.id || "").trim().slice(0, 80);
  if (!id) return response.status(400).json({ status: "error", listed: null, error: "A Wellpoint NJ FamilyCare pulmonary product id is required." });
  try {
    const feed = await loadWellpointFeed();
    const result = lookupWellpointFeedProduct(feed, id);
    response.json({ listed: result.status === "listed" ? true : null, status: result.status, source: { effectiveDate: feed.profile.effectiveDate, extraction: "full-machine-readable-feed" }, drug: result.product ? serializeWellpointFeedProduct(result.product) : null, notice: result.notice });
  } catch (error) {
    response.status(503).json({ status: "error", listed: null, error: error instanceof Error ? error.message : "SOURCE_UNAVAILABLE" });
  }
});

app.get("/api/medicare/plans", async (request, response) => {
  if (!pool) return response.status(503).json({ error: "Medicare plan index is not configured yet." });
  const query = String(request.query.q || "").trim().slice(0, 100);
  const state = String(request.query.state || "NJ").trim().toUpperCase();
  const benefitType = String(request.query.benefitType || "").trim();
  if (benefitType && benefitType !== "ma" && benefitType !== "pdp") {
    return response.status(400).json({ error: "benefitType must be ma or pdp." });
  }
  const pdpRegion = state ? PDP_REGION_BY_STATE[state] : "";
  if (benefitType === "pdp" && state && !pdpRegion) {
    return response.status(400).json({ error: `Standalone Part D lookup is not configured for ${state}.` });
  }
  try {
    const latest = await pool.query<{ id: number; source_version: string; imported_at: string }>("SELECT id, source_version, imported_at FROM formulary_imports WHERE status = 'succeeded' ORDER BY imported_at DESC LIMIT 1");
    if (!latest.rowCount) return response.json({ import: null, plans: [] });
    const result = await pool.query(`SELECT contract_id, plan_id, segment_id, contract_name, plan_name, state, formulary_id, pdp_region_code, CASE WHEN contract_id LIKE 'H%' THEN 'Medicare Advantage' WHEN contract_id LIKE 'S%' THEN 'Standalone Part D prescription drug plan' ELSE 'Medicare plan type not identified' END AS plan_type, array_agg(DISTINCT county_code) FILTER (WHERE county_code IS NOT NULL) AS county_codes FROM medicare_plans WHERE import_id = $1 AND ($2 = '' OR (contract_id LIKE 'H%' AND state = $2) OR (contract_id LIKE 'S%' AND pdp_region_code = $5)) AND ($3 = '' OR contract_name ILIKE '%' || $3 || '%' OR plan_name ILIKE '%' || $3 || '%' OR contract_id ILIKE '%' || $3 || '%') AND ($4 = '' OR ($4 = 'ma' AND contract_id LIKE 'H%') OR ($4 = 'pdp' AND contract_id LIKE 'S%')) GROUP BY contract_id, plan_id, segment_id, contract_name, plan_name, state, formulary_id, pdp_region_code ORDER BY contract_name, plan_name LIMIT 100`, [latest.rows[0].id, state, query, benefitType, pdpRegion]);
    response.json({ import: latest.rows[0], plans: result.rows });
  } catch { response.status(503).json({ error: "Medicare plan index is temporarily unavailable." }); }
});

app.get("/api/medicare/coverage", async (request, response) => {
  if (!pool) return response.status(503).json({ error: "Medicare coverage data is not configured yet." });
  const contractId = String(request.query.contractId || "").trim().toUpperCase().slice(0, 12);
  const planId = String(request.query.planId || "").trim().slice(0, 8);
  const segmentId = String(request.query.segmentId || "000").trim().slice(0, 8);
  const medication = String(request.query.medication || "").trim().slice(0, 120);
  if (!contractId || !planId || !medication) {
    return response.status(400).json({ error: "contractId, planId, and medication are required." });
  }
  try {
    const latest = await pool.query<{ id: number; source_version: string; imported_at: string }>("SELECT id, source_version, imported_at FROM formulary_imports WHERE status = 'succeeded' ORDER BY imported_at DESC LIMIT 1");
    if (!latest.rowCount) return response.status(404).json({ error: "No successful Medicare source import is available." });
    const plan = await pool.query<{ formulary_id: string; plan_name: string }>("SELECT formulary_id, plan_name FROM medicare_plans WHERE import_id = $1 AND contract_id = $2 AND plan_id = $3 AND segment_id = $4 LIMIT 1", [latest.rows[0].id, contractId, planId, segmentId]);
    if (!plan.rowCount) return response.status(404).json({ error: "Medicare plan was not found in the current source." });
    const searchTerms = [...new Set([medication, ...medication.split(/[ /(),-]+/).filter((term) => term.length >= 4)])].slice(0, 6);
    const rxNormResults = await Promise.all(searchTerms.map(async (term) => {
      const lookup = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(term)}&search=2`);
      if (!lookup.ok) throw new Error("RxNorm lookup unavailable");
      const payload = await lookup.json() as { idGroup?: { rxnormId?: string[] } };
      return { term, rxcuis: payload.idGroup?.rxnormId ?? [] };
    }));
    const rxcuis = [...new Set(rxNormResults.flatMap((result) => result.rxcuis))].slice(0, 10);
    const matchedTerms = rxNormResults.filter((result) => result.rxcuis.length).map((result) => result.term);
    if (!rxcuis.length) return response.json({ source: latest.rows[0], plan: plan.rows[0], medication, matchedTerms, rxcuis: [], coverage: [] });
    const relatedResponses = await Promise.all(
      rxcuis.map(async (rxcui) => {
        const related = await fetch(`https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/related.json?tty=SCD+SBD`);
        if (!related.ok) return [];
        const payload = await related.json() as { relatedGroup?: { conceptGroup?: Array<{ conceptProperties?: Array<{ rxcui: string }> }> } };
        return payload.relatedGroup?.conceptGroup?.flatMap((group) => group.conceptProperties?.map((concept) => concept.rxcui) ?? []) ?? [];
      }),
    );
    const productRxcuis = [...new Set([...rxcuis, ...relatedResponses.flat()])];
    const coverage = await pool.query<{ rxcui: string | null; ndc: string | null; tier_level: number | null; prior_authorization: boolean; quantity_limit: boolean; quantity_limit_amount: string | null; quantity_limit_days: string | null; step_therapy: boolean }>("SELECT DISTINCT rxcui, ndc, tier_level, prior_authorization, quantity_limit, NULLIF(BTRIM(quantity_limit_amount), '') AS quantity_limit_amount, NULLIF(BTRIM(quantity_limit_days), '') AS quantity_limit_days, step_therapy FROM medicare_formulary_drugs WHERE import_id = $1 AND formulary_id = $2 AND rxcui = ANY($3::text[]) ORDER BY tier_level NULLS LAST, rxcui, ndc LIMIT 100", [latest.rows[0].id, plan.rows[0].formulary_id, productRxcuis]);
    response.json({ source: latest.rows[0], plan: plan.rows[0], medication, matchedTerms, rxcuis, productRxcuiCount: productRxcuis.length, coverage: coverage.rows });
  } catch {
    response.status(503).json({ error: "Medicare coverage lookup is temporarily unavailable." });
  }
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
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.sendFile(path.join(distDir, "index.html"));
});

await ensureFormularySchema();
app.listen(port, "0.0.0.0", () => {
  console.log(`Formulary Finder listening on port ${port}`);
});
