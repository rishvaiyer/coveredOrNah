import assert from "node:assert/strict";
import test from "node:test";
import {
  coverageFor,
  medications,
} from "../src/components/generated/PulmonaryFormularyDashboard.js";

const medication = (generic: string) => {
  const match = medications.find((candidate) => candidate.generic === generic);
  assert.ok(match, `Expected medication ${generic}`);
  return match;
};

test("Horizon Classic exposes mapped source rows and fails closed for unmapped rows", () => {
  const albuterol = coverageFor(medication("Albuterol HFA"), "horizonClassic");
  assert.equal(albuterol.state, "Tier 1");
  assert.deepEqual(albuterol.flags, ["QL"]);

  const levalbuterol = coverageFor(medication("Levalbuterol"), "horizonClassic");
  assert.equal(levalbuterol.state, "Tier varies");
  assert.match(levalbuterol.productNote ?? "", /nebulizer solution/i);

  const notMapped = coverageFor(medication("Revefenacin"), "horizonClassic");
  assert.equal(notMapped.state, "Source loading");
});
