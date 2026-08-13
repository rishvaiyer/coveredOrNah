import assert from "node:assert/strict";
import test from "node:test";
import {
  UhcNjCommunityAdapter,
  UHC_NJ_COMMUNITY_SOURCE_URL,
  autocompleteUhcNjCommunity,
  lookupUhcNjCommunity,
} from "./uhc-nj-community.js";

const payload = [
  {
    rxnorm_id: "435",
    drug_name: "albuterol 90 MCG/ACTUAT Metered Dose Inhaler",
    plans: [{ plan_id_type: "PLAN-ID", plan_id: "UCSNJQ1", drug_tier: "PREFERRED(29)", prior_authorization: false, step_therapy: false, quantity_limit: true, years: [2026] }],
  },
  {
    rxnorm_id: "436",
    drug_name: "wrong plan",
    plans: [{ plan_id_type: "PLAN-ID", plan_id: "UCSNJQ6", drug_tier: "PREFERRED(29)", prior_authorization: false, step_therapy: false, quantity_limit: false, years: [2026] }],
  },
  {
    rxnorm_id: "437",
    drug_name: "missing restriction",
    plans: [{ plan_id_type: "PLAN-ID", plan_id: "UCSNJQ1", drug_tier: "PREFERRED(29)", prior_authorization: false, step_therapy: false, years: [2026] }],
  },
];

test("loads only complete standard UHC Community Plan NJ 2026 associations", async () => {
  const adapter = new UhcNjCommunityAdapter({
    fetchImpl: async (input) => {
      assert.equal(input.toString(), UHC_NJ_COMMUNITY_SOURCE_URL);
      return new Response(JSON.stringify(payload), { status: 200, headers: { "content-type": "application/json", etag: "fixture" } });
    },
  });
  const snapshot = await adapter.load();
  assert.equal(snapshot.drugs.length, 1);
  assert.equal(snapshot.drugs[0].rxcui, "435");
  assert.deepEqual(autocompleteUhcNjCommunity(snapshot, "albuterol HFA"), [snapshot.drugs[0]]);
  assert.equal(lookupUhcNjCommunity(snapshot, "435").status, "listed");
  assert.equal(lookupUhcNjCommunity(snapshot, "436").status, "not-listed-in-source");
});
