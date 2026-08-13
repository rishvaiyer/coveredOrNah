import assert from "node:assert/strict";
import test from "node:test";
import {
  AETNA_NJ_FAMILYCARE_SOURCE_URL,
  AetnaNjFamilyCareAdapter,
  AetnaNjFamilyCareError,
  autocompleteAetnaNjFamilyCareDrugs,
  fetchAetnaNjFamilyCareFormulary,
  getAetnaNjFamilyCareMetadata,
  lookupAetnaNjFamilyCareCoverageByNdc,
  validateAetnaNjFamilyCarePayload,
  type FetchLike,
} from "./aetna-nj-familycare.js";

function payload() {
  return {
    Profile_Information: {
      public_name: "Aetna_Better_Health_of_New_Jersey",
      state: "NEW JERSEY",
      formulary_type: "State Medicaid",
      formulary_name: "ABH NJ New",
      formulary_id: 25689,
      formulary_version: 13,
      formulary_effective_date: "07/01/2026",
    },
    Drug_Information: [
      {
        ndc: "00078061515",
        ndc_label_name: "Albuterol Sulfate Inhalation Aerosol 90 MCG/ACTUATION",
        drug_tier: "Preferred",
        prior_authorization: false,
        step_therapy: false,
        quantity_limit: true,
        otc: false,
      },
      {
        ndc: "00078061615",
        ndc_label_name: "Albuterol Sulfate Inhalation Aerosol 90 MCG/ACTUATION",
        drug_tier: "Preferred",
        prior_authorization: false,
        step_therapy: false,
        quantity_limit: true,
        otc: false,
      },
      {
        ndc: "00054001729",
        ndc_label_name: "Budesonide Inhalation Suspension 0.5 MG/2 ML",
        drug_tier: "Preferred",
        prior_authorization: false,
        step_therapy: false,
        quantity_limit: false,
        otc: false,
      },
    ],
  };
}

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json", ...(init.headers ?? {}) },
    ...init,
  });
}

test("validates the official Medicaid identity and exposes provenance", () => {
  const formulary = validateAetnaNjFamilyCarePayload(payload(), {
    fetchedAt: "2026-08-11T14:00:00.000Z",
    responseBytes: 1_234,
    responseEtag: '"test"',
  });
  const metadata = getAetnaNjFamilyCareMetadata(formulary);

  assert.equal(metadata.source.program, "NJ FamilyCare Medicaid");
  assert.equal(metadata.source.url, AETNA_NJ_FAMILYCARE_SOURCE_URL);
  assert.equal(metadata.source.effectiveDate, "2026-07-01");
  assert.deepEqual(metadata.source.exclusions, [
    "Aetna commercial plans",
    "Aetna Medicare and Medicare Part D plans",
    "Member eligibility, cost, and claim-payment determinations",
  ]);
  assert.equal(metadata.rowCount, 3);
  assert.equal(metadata.productCount, 2);
  assert.equal(metadata.responseEtag, '"test"');
});

test("rejects data that is not the Aetna New Jersey State Medicaid formulary", () => {
  const wrong = payload();
  wrong.Profile_Information.formulary_type = "Medicare";

  assert.throws(
    () => validateAetnaNjFamilyCarePayload(wrong),
    (error) => error instanceof AetnaNjFamilyCareError &&
      error.code === "INVALID_SCHEMA" &&
      error.message.includes("not the State Medicaid formulary"),
  );
});

test("returns product autocomplete suggestions without collapsing NDCs", () => {
  const formulary = validateAetnaNjFamilyCarePayload(payload());
  const result = autocompleteAetnaNjFamilyCareDrugs(formulary, "albut", 5);
  const separatedTerms = autocompleteAetnaNjFamilyCareDrugs(formulary, "albuterol aerosol", 5);
  const typoTolerantResult = autocompleteAetnaNjFamilyCareDrugs(formulary, "albutrol", 5);

  assert.equal(result.query, "albut");
  assert.equal(result.suggestions.length, 1);
  assert.equal(result.suggestions[0].ndcCount, 2);
  assert.deepEqual(result.suggestions[0].ndcs, ["00078061515", "00078061615"]);
  assert.equal(separatedTerms.suggestions.length, 1);
  assert.equal(separatedTerms.suggestions[0].drugName, "Albuterol Sulfate Inhalation Aerosol 90 MCG/ACTUATION");
  assert.equal(typoTolerantResult.suggestions.length, 1);
});

test("looks up exact 11-digit NDC coverage and treats absence as not a denial", () => {
  const formulary = validateAetnaNjFamilyCarePayload(payload());
  const found = lookupAetnaNjFamilyCareCoverageByNdc(formulary, "00078-0615-15");
  const missing = lookupAetnaNjFamilyCareCoverageByNdc(formulary, "99999999999");

  assert.equal(found.status, "listed");
  assert.equal(found.matches[0].drugTier, "Preferred");
  assert.equal(found.matches[0].quantityLimit, true);
  assert.equal(missing.status, "not-listed-in-source");
  assert.match(missing.notice, /not a denial/i);
  assert.throws(
    () => lookupAetnaNjFamilyCareCoverageByNdc(formulary, "12345"),
    (error) => error instanceof AetnaNjFamilyCareError && error.code === "INVALID_NDC",
  );
});

test("fetches with an injected transport and validates the response", async () => {
  let seenUrl = "";
  let seenInit: RequestInit | undefined;
  const fakeFetch: FetchLike = async (input, init) => {
    seenUrl = input.toString();
    seenInit = init;
    return jsonResponse(payload(), {
      headers: { "last-modified": "Tue, 11 Aug 2026 12:00:00 GMT" },
    });
  };

  const formulary = await fetchAetnaNjFamilyCareFormulary({
    fetchImpl: fakeFetch,
    now: () => new Date("2026-08-11T14:00:00.000Z"),
  });

  assert.equal(seenUrl, AETNA_NJ_FAMILYCARE_SOURCE_URL);
  assert.equal(new Headers(seenInit?.headers).get("accept"), "application/json");
  assert.ok(seenInit?.signal instanceof AbortSignal);
  assert.equal(formulary.fetchedAt, "2026-08-11T14:00:00.000Z");
  assert.equal(formulary.responseLastModified, "Tue, 11 Aug 2026 12:00:00 GMT");
});

test("enforces declared and streamed response size limits", async () => {
  const declaredTooLarge: FetchLike = async () => new Response("{}", {
    status: 200,
    headers: { "content-length": "1000" },
  });
  const streamedTooLarge: FetchLike = async () => new Response("x".repeat(101), { status: 200 });

  await assert.rejects(
    () => fetchAetnaNjFamilyCareFormulary({ fetchImpl: declaredTooLarge, maxBytes: 100 }),
    (error) => error instanceof AetnaNjFamilyCareError && error.code === "RESPONSE_TOO_LARGE",
  );
  await assert.rejects(
    () => fetchAetnaNjFamilyCareFormulary({ fetchImpl: streamedTooLarge, maxBytes: 100 }),
    (error) => error instanceof AetnaNjFamilyCareError && error.code === "RESPONSE_TOO_LARGE",
  );
});

test("classifies timeout, HTTP, invalid JSON, and invalid schema errors", async () => {
  const timeoutFetch: FetchLike = async (_input, init) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => {
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

  await assert.rejects(
    () => fetchAetnaNjFamilyCareFormulary({ fetchImpl: timeoutFetch, timeoutMs: 5 }),
    (error) => error instanceof AetnaNjFamilyCareError && error.code === "TIMEOUT",
  );
  await assert.rejects(
    () => fetchAetnaNjFamilyCareFormulary({
      fetchImpl: async () => new Response("rate limited", { status: 429 }),
    }),
    (error) => error instanceof AetnaNjFamilyCareError &&
      error.code === "HTTP_ERROR" && error.details.status === 429,
  );
  await assert.rejects(
    () => fetchAetnaNjFamilyCareFormulary({
      fetchImpl: async () => new Response("not json", { status: 200 }),
    }),
    (error) => error instanceof AetnaNjFamilyCareError && error.code === "INVALID_JSON",
  );
  await assert.rejects(
    () => fetchAetnaNjFamilyCareFormulary({ fetchImpl: async () => jsonResponse({}) }),
    (error) => error instanceof AetnaNjFamilyCareError && error.code === "INVALID_SCHEMA",
  );
});

test("caches successful loads, refreshes after TTL, and coalesces concurrent fetches", async () => {
  let calls = 0;
  let clock = Date.parse("2026-08-11T14:00:00.000Z");
  const fakeFetch: FetchLike = async () => {
    calls += 1;
    await Promise.resolve();
    return jsonResponse(payload());
  };
  const adapter = new AetnaNjFamilyCareAdapter({
    fetchImpl: fakeFetch,
    cacheTtlMs: 1_000,
    now: () => new Date(clock),
  });

  const [first, concurrent] = await Promise.all([adapter.load(), adapter.load()]);
  const cached = await adapter.load();
  assert.equal(calls, 1);
  assert.equal(first, concurrent);
  assert.equal(first, cached);

  clock += 1_001;
  const refreshed = await adapter.load();
  assert.equal(calls, 2);
  assert.notEqual(refreshed, first);
});

test(
  "live read-only smoke: loads the official Aetna NJ FamilyCare source",
  { skip: process.env.RUN_LIVE_AETNA_NJ_FAMILYCARE !== "1", timeout: 60_000 },
  async () => {
    const formulary = await fetchAetnaNjFamilyCareFormulary({ timeoutMs: 30_000 });
    const metadata = getAetnaNjFamilyCareMetadata(formulary);

    assert.equal(metadata.source.program, "NJ FamilyCare Medicaid");
    assert.equal(metadata.profile.state, "NEW JERSEY");
    assert.equal(metadata.profile.formularyType, "State Medicaid");
    assert.ok(metadata.rowCount > 1_000);
    assert.match(metadata.source.effectiveDate, /^\d{4}-\d{2}-\d{2}$/);

    const firstNdc = formulary.drugs[0].ndc;
    assert.equal(lookupAetnaNjFamilyCareCoverageByNdc(formulary, firstNdc).status, "listed");
  },
);
