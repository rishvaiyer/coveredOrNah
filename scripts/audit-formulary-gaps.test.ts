import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  medications,
  primaryNjPlans,
  type Coverage,
  type CoverageState,
} from "../src/components/generated/PulmonaryFormularyDashboard.js";
import { auditCoverageGaps } from "./audit-formulary-gaps.js";

test("reports the current static formulary gap inventory deterministically", () => {
  const audit = auditCoverageGaps();

  assert.deepEqual(audit.summary, {
    medicationCount: 85,
    planCount: 17,
    totalCells: 1445,
    confirmedCells: 1009,
    unconfirmedCells: 436,
    unconfirmedPercent: 30.17,
  });

  assert.deepEqual(
    Object.fromEntries(audit.byPlan.map((row) => [row.planKey, row.unconfirmedCells])),
    {
      horizonMarketplace: 16,
      horizonClassic: 16,
      ambetterNjMarketplace: 17,
      uhcCommercial: 21,
      oxfordFreedom: 21,
      aetnaMedicareHmo: 15,
      amerihealthNj: 4,
      amerihealthValue: 3,
      amerihealthSelect: 4,
      cignaNationalPreferred: 38,
      oscarNjIndividual: 54,
      wellcareNjH0913: 25,
      humanaNj26408: 26,
      bravenNjH0885: 76,
      healthspringNj26096: 17,
      cloverNj2026: 20,
      wellpointNjFamilyCare: 63,
    },
  );

  assert.equal(
    audit.byTherapeuticArea.reduce((sum, row) => sum + row.unconfirmedCells, 0),
    audit.summary.unconfirmedCells,
  );
  assert.equal(
    audit.byTherapeuticArea.find((row) => row.therapeuticArea === "Rescue inhalers")?.unconfirmedCells,
    10,
  );
});

test("fails closed when a resolver returns an invalid coverage state", () => {
  const medication = medications[0];
  const plan = primaryNjPlans[0];

  assert.throws(
    () =>
      auditCoverageGaps([medication], [plan], () => ({
        state: "Covered-ish" as CoverageState,
      }) as Coverage),
    /Invalid coverage state "Covered-ish".*Albuterol HFA.*horizonMarketplace/,
  );
});

test("source manifest covers every baseline with the audited official URL", () => {
  const manifest = JSON.parse(
    readFileSync(new URL("../data/formulary-source-manifest.json", import.meta.url), "utf8"),
  ) as {
    baselines: Array<{
      planKey: string;
      sourceUrl: string;
      scope: string;
      completenessClass: string;
      refreshCadence: string;
      absenceCanImplyNotListed: boolean;
    }>;
  };

  assert.equal(new Set(manifest.baselines.map((row) => row.planKey)).size, manifest.baselines.length);
  for (const plan of primaryNjPlans) {
    const source = manifest.baselines.find((row) => row.planKey === plan.key);
    assert.ok(source, `Missing source manifest entry for ${plan.key}`);
    assert.equal(source.sourceUrl, plan.source);
    assert.match(source.sourceUrl, /^https:\/\//);
    assert.ok(source.scope);
    assert.ok(["partial-row-extraction", "full-machine-readable-feed"].includes(source.completenessClass));
    assert.ok(source.refreshCadence);
    assert.equal(typeof source.absenceCanImplyNotListed, "boolean");
  }
});
