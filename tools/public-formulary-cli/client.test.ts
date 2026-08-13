import assert from "node:assert/strict";
import test from "node:test";
import {
  CliError,
  MarketplaceClient,
  RxNormClient,
  marketplaceApiKey,
  redactUrl,
  requestJson,
  type FetchLike,
} from "./client.js";
import { normalizeQhpFormulary, readQhpFormularyInput } from "./qhp.js";
import { DEMO_FIXTURE_DATE, DEMO_FIXTURE_REFERENCE, verifyBundledDemo } from "./demo.js";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

test("redacts Marketplace credentials from URLs", () => {
  assert.equal(
    redactUrl("https://example.test/path?q=drug&apikey=secret"),
    "https://example.test/path?q=drug&apikey=REDACTED",
  );
});

test("requires the Marketplace API key", () => {
  assert.throws(
    () => marketplaceApiKey({}),
    (error) => error instanceof CliError && error.exitCode === 2 && error.message.includes("CMS_MARKETPLACE_API_KEY"),
  );
});

test("RxNorm normalization constructs the official endpoint and enriches the candidate", async () => {
  const seen: string[] = [];
  const fakeFetch: FetchLike = async (input) => {
    const url = input.toString();
    seen.push(url);
    if (url.includes("/rxcui.json?")) return jsonResponse({ idGroup: { rxnormId: ["435"] } });
    return jsonResponse({ properties: { rxcui: "435", name: "Albuterol", tty: "IN" } });
  };
  const client = new RxNormClient(fakeFetch, 1_000, "https://rxnorm.test/REST");

  const result = await client.normalize("albuterol", "exact-or-normalized");

  assert.equal(result.candidateCount, 1);
  assert.deepEqual(result.candidates, [{ rxcui: "435", name: "Albuterol", tty: "IN" }]);
  assert.equal(seen[0], "https://rxnorm.test/REST/rxcui.json?name=albuterol&allsrc=0&search=2");
  assert.equal(seen[1], "https://rxnorm.test/REST/rxcui/435/properties.json");
});

test("Marketplace drug search constructs an authenticated, year-specific URL", async () => {
  let seen = "";
  const fakeFetch: FetchLike = async (input) => {
    seen = input.toString();
    return jsonResponse({ drugs: [{ rxcui: "435", name: "Albuterol" }] });
  };
  const client = new MarketplaceClient("test-key", fakeFetch, 1_000, "https://marketplace.test/api/v1");

  const result = await client.searchDrugs("albuterol sulfate", 2026);

  assert.deepEqual(result, { drugs: [{ rxcui: "435", name: "Albuterol" }] });
  assert.equal(seen, "https://marketplace.test/api/v1/drugs/search?q=albuterol+sulfate&year=2026&apikey=test-key");
});

test("Marketplace coverage validates identifiers and sends comma-separated values", async () => {
  let seen = "";
  const fakeFetch: FetchLike = async (input) => {
    seen = input.toString();
    return jsonResponse({ coverage: [] });
  };
  const client = new MarketplaceClient("test-key", fakeFetch, 1_000, "https://marketplace.test/api/v1");

  await client.drugCoverage(["435", "123"], ["12345NJ1234567"], 2026);

  assert.equal(seen, "https://marketplace.test/api/v1/drugs/covered?drugs=435%2C123&planids=12345NJ1234567&year=2026&apikey=test-key");
  await assert.rejects(
    () => client.drugCoverage(["not-an-rxcui"], ["12345NJ1234567"], 2026),
    /rxcui must contain digits only/,
  );
});

test("HTTP errors preserve source details but redact the credential", async () => {
  const fakeFetch: FetchLike = async () => jsonResponse({ message: "unauthorized" }, 401);
  const url = new URL("https://marketplace.test/api/v1/market-years?apikey=secret");

  await assert.rejects(
    () => requestJson(fakeFetch, url, 1_000),
    (error) => {
      assert.ok(error instanceof CliError);
      assert.equal(error.details?.status, 401);
      assert.equal(error.details?.source, "https://marketplace.test/api/v1/market-years?apikey=REDACTED");
      assert.doesNotMatch(JSON.stringify(error.details), /secret/);
      return true;
    },
  );
});

test("normalizes a complete CMS QHP drug-plan association", () => {
  const result = normalizeQhpFormulary([
    {
      rxnorm_id: " 1649961 ",
      drug_name: "Albuterol inhaler",
      plans: [{
        plan_id_type: "hios-plan-id",
        plan_id: "12345nj1234567",
        drug_tier: "preferred brand",
        prior_authorization: false,
        step_therapy: false,
        quantity_limit: true,
        years: [2026, 2025, 2026],
      }],
    },
  ]);

  assert.equal(result.summary.candidateRowCount, 1);
  assert.equal(result.summary.completeCandidateCount, 1);
  assert.deepEqual(result.candidateRows[0], {
    sourceDrugIndex: 0,
    sourcePlanIndex: 0,
    rxcui: "1649961",
    drugName: "Albuterol inhaler",
    planIdType: "HIOS-PLAN-ID",
    planId: "12345NJ1234567",
    drugTier: "PREFERRED-BRAND",
    priorAuthorization: false,
    stepTherapy: false,
    quantityLimit: true,
    years: [2025, 2026],
    validationStatus: "complete",
    gaps: [],
  });
  assert.equal(result.gapSummary.normalizedFormattingCount, 1);
});

test("preserves missing restrictions and years as unknown gaps", () => {
  const result = normalizeQhpFormulary([
    {
      rxnorm_id: "435",
      drug_name: "albuterol",
      plans: [{
        plan_id_type: "HIOS-PLAN-ID",
        plan_id: "12345NJ1234567",
        drug_tier: "GENERIC",
      }],
    },
  ]);

  assert.equal(result.summary.validationStatus, "gaps");
  assert.equal(result.summary.incompleteCandidateCount, 1);
  assert.equal(result.candidateRows[0].priorAuthorization, null);
  assert.deepEqual(result.candidateRows[0].gaps, ["prior_authorization", "step_therapy", "quantity_limit", "years"]);
  assert.equal(result.gapSummary.missingPriorAuthorizationCount, 1);
  assert.equal(result.gapSummary.missingYearsCount, 1);
});

test("rejects invalid required identifiers and reports invalid restriction types", () => {
  const result = normalizeQhpFormulary([
    {
      rxnorm_id: "435",
      drug_name: "albuterol",
      plans: [
        {
          plan_id_type: "OTHER",
          plan_id: "bad-plan",
          drug_tier: "GENERIC",
        },
        {
          plan_id_type: "HIOS-PLAN-ID",
          plan_id: "12345NJ1234567",
          drug_tier: "GENERIC",
          prior_authorization: "false",
          step_therapy: false,
          quantity_limit: false,
          years: [2026],
        },
      ],
    },
  ]);

  assert.equal(result.summary.validationStatus, "invalid");
  assert.equal(result.summary.rejectedAssociationCount, 1);
  assert.equal(result.summary.candidateRowCount, 1);
  assert.equal(result.candidateRows[0].priorAuthorization, null);
  assert.equal(result.gapSummary.invalidRestrictionValueCount, 1);
  assert.ok(result.issues.some((issue) => issue.code === "INVALID_PLAN_ID"));
  assert.ok(result.issues.some((issue) => issue.code === "INVALID_RESTRICTION"));
});

test("reads an HTTPS-hosted QHP formulary with an injected transport", async () => {
  const fakeFetch: FetchLike = async (input) => {
    assert.equal(input.toString(), "https://issuer.example/drugs.json?ignored=secret");
    return jsonResponse([{ rxnorm_id: "435", drug_name: "albuterol", plans: [] }]);
  };
  const loaded = await readQhpFormularyInput("https://issuer.example/drugs.json?ignored=secret", {
    fetchImpl: fakeFetch,
    maxBytes: 10_000,
  });

  assert.equal(loaded.source.kind, "url");
  assert.equal(loaded.source.reference, "https://issuer.example/drugs.json");
  assert.ok(Array.isArray(loaded.payload));
  await assert.rejects(
    () => readQhpFormularyInput("http://issuer.example/drugs.json", { fetchImpl: fakeFetch }),
    /must use HTTPS/,
  );
  await assert.rejects(
    () => readQhpFormularyInput("https://127.0.0.1/drugs.json", { fetchImpl: fakeFetch }),
    /public hostname/,
  );
});

test("reads a local QHP formulary without network access", async () => {
  const input = new URL("./fixtures/qhp-valid.json", import.meta.url).toString();
  const loaded = await readQhpFormularyInput(input);

  assert.equal(loaded.source.kind, "file");
  assert.equal((loaded.payload as Array<unknown>).length, 1);
});

test("verifies the bundled QHP demo with deterministic provenance and counts", async () => {
  const first = await verifyBundledDemo();
  const second = await verifyBundledDemo();

  assert.deepEqual(second, first);
  assert.equal(first.status, "passed");
  assert.equal(first.networkAccess, false);
  assert.equal(first.source.reference, DEMO_FIXTURE_REFERENCE);
  assert.equal(first.source.date, DEMO_FIXTURE_DATE);
  assert.match(first.source.sha256, /^[a-f0-9]{64}$/);
  assert.deepEqual(first.counts, {
    inputDrugs: 1,
    planAssociations: 1,
    candidateRows: 1,
    completeCandidates: 1,
    incompleteCandidates: 0,
    rejectedAssociations: 0,
    issues: 0,
    errors: 0,
    warnings: 0,
    gaps: 0,
  });
});
