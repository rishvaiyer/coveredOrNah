import assert from "node:assert/strict";
import test from "node:test";
import {
  UHC_NJ_QHP_MANIFEST_URL,
  UhcNjQhpAdapter,
  UhcNjQhpError,
  type UhcNjQhpFetch,
} from "./uhc-nj-qhp.js";

const planUrl = "https://providermrf.uhc.com/api/stream/ui/ifp/plans/JSON_PLANS_NJ.json";
const drugUrl = "https://legacy.providerlookuponline.com/mrf/optumrx/drugs/2877216/JSON_Drugs_UHCNJEX_HIX.json";

const manifest = {
  plans: [{
    name: "JSON_PLANS_NJ.json",
    date: "2025-11-11T12:07:01.000Z",
    blobPath: "ui/ifp/plans/JSON_PLANS_NJ.json",
  }],
  drugs: [{
    name: "JSON_Drugs_UHCNJEX_HIX.json",
    date: "2026-07-16T13:01:48.000Z",
    url: drugUrl,
    isExternal: true,
  }],
};

const plans = [
  {
    plan_id_type: "HIOS-PLAN-ID",
    plan_id: "37777NJ0100002",
    years: [2026],
    marketing_name: "UHC Bronze Value HSA (No Referrals)",
    summary_url: "https://www.uhcexchange.com/example.pdf",
    marketing_url: "https://www.uhc.com/NJplanbrochure2026",
    formulary_url: "https://www.uhc.com/xNJdruglist2026",
    last_updated_on: "2025-07-10",
    formulary: [
      { drug_tier: "PREFERRED BRAND", mail_order: true },
      { drug_tier: "PREFERRED-GENERIC", mail_order: true },
    ],
  },
  {
    plan_id_type: "HIOS-PLAN-ID",
    plan_id: "37777NJ0100002",
    years: [2025],
    marketing_name: "Old plan year",
    formulary: [{ drug_tier: "GENERIC" }],
  },
  {
    plan_id_type: "HIOS-PLAN-ID",
    plan_id: "99999NY0100002",
    years: [2026],
    marketing_name: "Outside issuer and state",
    formulary: [{ drug_tier: "GENERIC" }],
  },
];

const drugs = [
  {
    rxnorm_id: "435",
    drug_name: "albuterol",
    plans: [{
      plan_id_type: "HIOS-PLAN-ID",
      plan_id: "37777NJ0100002",
      drug_tier: "PREFERRED-GENERIC",
      prior_authorization: false,
      step_therapy: false,
      quantity_limit: true,
      years: [2026],
    }],
  },
  {
    rxnorm_id: "999",
    drug_name: "incomplete drug",
    plans: [{
      plan_id_type: "HIOS-PLAN-ID",
      plan_id: "37777NJ0100002",
      drug_tier: "PREFERRED-BRAND",
      prior_authorization: false,
      years: [2026],
    }],
  },
];

function jsonResponse(value: unknown, headers: Record<string, string> = {}) {
  const body = JSON.stringify(value);
  return new Response(body, {
    status: 200,
    headers: { "content-type": "application/json", "content-length": String(Buffer.byteLength(body)), ...headers },
  });
}

function fixtureFetch(options: { fail?: () => boolean; calls?: string[] } = {}): UhcNjQhpFetch {
  return async (input) => {
    const url = input.toString();
    options.calls?.push(url);
    if (options.fail?.()) throw new Error("offline");
    if (url === UHC_NJ_QHP_MANIFEST_URL) return jsonResponse(manifest);
    if (url === planUrl) return jsonResponse(plans, { "last-modified": "Tue, 11 Nov 2025 12:07:01 GMT" });
    if (url === drugUrl) return jsonResponse(drugs, { "last-modified": "Thu, 16 Jul 2026 13:01:48 GMT", etag: "fixture-etag" });
    return new Response(null, { status: 404 });
  };
}

test("loads only 2026 UHC NJ Individual/Family HIOS plans and exact matches", async () => {
  const adapter = new UhcNjQhpAdapter({ fetchImpl: fixtureFetch() });
  const result = await adapter.exactPlanSearch("UHC Bronze Value HSA (No Referrals)");

  assert.equal(result.status, "confirmed");
  assert.equal(result.plans.length, 1);
  assert.equal(result.plans[0].planId, "37777NJ0100002");
  assert.deepEqual(result.plans[0].years, [2026]);
  assert.deepEqual(result.plans[0].drugTiers, ["PREFERRED-BRAND", "PREFERRED-GENERIC"]);
  assert.equal(result.source.quality.planCount, 1);
  assert.equal(result.source.state, "NJ");
  assert.equal(result.source.year, 2026);
  assert.match(result.source.boundary, /Not UnitedHealthcare employer/);
});

test("returns partial plan candidates without calling them confirmed", async () => {
  const adapter = new UhcNjQhpAdapter({ fetchImpl: fixtureFetch() });
  const result = await adapter.exactPlanSearch("Bronze Value");

  assert.equal(result.status, "candidates");
  assert.equal(result.reason, "EXACT_PLAN_SELECTION_REQUIRED");
  assert.equal(result.plans[0].planId, "37777NJ0100002");
});

test("autocompletes only drugs with valid 2026 NJ plan associations", async () => {
  const adapter = new UhcNjQhpAdapter({ fetchImpl: fixtureFetch() });
  const result = await adapter.drugAutocomplete("albu", 10);
  const typoTolerantResult = await adapter.drugAutocomplete("albutrol", 10);

  assert.equal(result.status, "confirmed");
  assert.deepEqual(result.drugs, [{ rxcui: "435", drugName: "albuterol", planCount: 1 }]);
  assert.deepEqual(typoTolerantResult.drugs, [{ rxcui: "435", drugName: "albuterol", planCount: 1 }]);
  assert.equal(result.source.drugs.sourceDate, "2026-07-16T13:01:48.000Z");
  assert.equal(result.source.drugs.etag, "fixture-etag");
});

test("returns confirmed coverage only for an exact plan and RxCUI association", async () => {
  const adapter = new UhcNjQhpAdapter({ fetchImpl: fixtureFetch() });
  const result = await adapter.coverage("37777NJ0100002", "435");

  assert.equal(result.status, "confirmed");
  assert.equal(result.covered, true);
  assert.equal(result.coverage[0].drugTier, "PREFERRED-GENERIC");
  assert.equal(result.coverage[0].priorAuthorization, false);
  assert.equal(result.coverage[0].quantityLimit, true);
});

test("uses unconfirmed states instead of interpreting missing source rows as denials", async () => {
  const adapter = new UhcNjQhpAdapter({ fetchImpl: fixtureFetch() });

  const missingPlan = await adapter.coverage("37777NJ9999999", "435");
  assert.deepEqual({ status: missingPlan.status, covered: missingPlan.covered, reason: missingPlan.reason }, {
    status: "unconfirmed",
    covered: null,
    reason: "PLAN_NOT_FOUND",
  });

  const missingDrug = await adapter.coverage("37777NJ0100002", "123456789");
  assert.equal(missingDrug.status, "unconfirmed");
  assert.equal(missingDrug.reason, "RXCUI_NOT_FOUND");

  const incomplete = await adapter.coverage("37777NJ0100002", "999");
  assert.equal(incomplete.status, "unconfirmed");
  assert.equal(incomplete.reason, "INCOMPLETE_SOURCE_RESTRICTIONS");
  assert.equal(incomplete.covered, null);
});

test("coalesces source requests and serves the cache within its TTL", async () => {
  const calls: string[] = [];
  const adapter = new UhcNjQhpAdapter({ fetchImpl: fixtureFetch({ calls }), cacheTtlMs: 1_000 });

  await Promise.all([adapter.exactPlanSearch("37777NJ0100002"), adapter.drugAutocomplete("alb")]);
  await adapter.coverage("37777NJ0100002", "435");

  assert.equal(calls.length, 3);
  assert.deepEqual(new Set(calls), new Set([UHC_NJ_QHP_MANIFEST_URL, planUrl, drugUrl]));
});

test("serves bounded stale cache with an explicit warning after refresh failure", async () => {
  let now = 0;
  let fail = false;
  const adapter = new UhcNjQhpAdapter({
    fetchImpl: fixtureFetch({ fail: () => fail }),
    now: () => now,
    cacheTtlMs: 10,
    staleIfErrorMs: 100,
  });
  await adapter.exactPlanSearch("37777NJ0100002");
  now = 11;
  fail = true;

  const result = await adapter.exactPlanSearch("37777NJ0100002");

  assert.equal(result.source.cacheStatus, "stale");
  assert.match(result.source.warning ?? "", /SOURCE_UNAVAILABLE/);
});

test("rejects oversized source responses before parsing", async () => {
  const fetchImpl: UhcNjQhpFetch = async () => new Response("[]", {
    status: 200,
    headers: { "content-type": "application/json", "content-length": "9999" },
  });
  const adapter = new UhcNjQhpAdapter({ fetchImpl, limits: { manifest: 100 } });

  await assert.rejects(
    () => adapter.exactPlanSearch("37777NJ0100002"),
    (error) => error instanceof UhcNjQhpError && error.code === "SOURCE_TOO_LARGE",
  );
});

test("aborts a source request after the configured timeout", async () => {
  const fetchImpl: UhcNjQhpFetch = async (_input, init) => new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
  });
  const adapter = new UhcNjQhpAdapter({ fetchImpl, timeoutMs: 5 });

  await assert.rejects(
    () => adapter.exactPlanSearch("37777NJ0100002"),
    (error) => error instanceof UhcNjQhpError && error.code === "SOURCE_TIMEOUT",
  );
});
