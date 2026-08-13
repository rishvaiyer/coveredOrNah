import assert from "node:assert/strict";
import test from "node:test";
import {
  isEligibleCmsPlan,
  normalizeCmsRow,
  PDP_REGION_BY_STATE,
} from "./cms-medicare-utils.js";

test("normalizes CMS space-filled PDP geography fields", () => {
  const row = normalizeCmsRow(
    ["CONTRACT_ID", "STATE", "PDP_REGION_CODE", "PLAN_SUPPRESSED_YN"],
    ["S4802", " ", "04", "N"],
  );

  assert.deepEqual(row, {
    CONTRACT_ID: "S4802",
    STATE: "",
    PDP_REGION_CODE: "04",
    PLAN_SUPPRESSED_YN: "N",
  });
  assert.equal(
    isEligibleCmsPlan(row, new Set(["NJ"]), new Set([PDP_REGION_BY_STATE.NJ])),
    true,
  );
});

test("does not import a PDP from another region", () => {
  const row = normalizeCmsRow(
    ["STATE", "PDP_REGION_CODE", "PLAN_SUPPRESSED_YN"],
    ["", "02", "N"],
  );

  assert.equal(isEligibleCmsPlan(row, new Set(["NJ"]), new Set(["04"])), false);
});

test("does not import suppressed plans", () => {
  const row = normalizeCmsRow(
    ["STATE", "PDP_REGION_CODE", "PLAN_SUPPRESSED_YN"],
    ["NJ", "", "Y"],
  );

  assert.equal(isEligibleCmsPlan(row, new Set(["NJ"]), new Set(["04"])), false);
});
