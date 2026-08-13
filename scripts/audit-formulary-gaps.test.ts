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
    planCount: 16,
    totalCells: 1360,
    confirmedCells: 682,
    unconfirmedCells: 678,
    unconfirmedPercent: 49.85,
  });

  assert.deepEqual(
    Object.fromEntries(audit.byPlan.map((row) => [row.planKey, row.unconfirmedCells])),
    {
      horizonMarketplace: 40,
      horizonClassic: 16,
      uhcCommercial: 44,
      oxfordFreedom: 44,
      aetnaMedicareHmo: 45,
      amerihealthNj: 43,
      amerihealthValue: 35,
      amerihealthSelect: 32,
      cignaNationalPreferred: 54,
      oscarNjIndividual: 54,
      wellcareNjH0913: 52,
      humanaNj26408: 26,
      bravenNjH0885: 76,
      healthspringNj26096: 30,
      cloverNj2026: 24,
      wellpointNjFamilyCare: 63,
    },
  );

  assert.equal(
    audit.byTherapeuticArea.reduce((sum, row) => sum + row.unconfirmedCells, 0),
    audit.summary.unconfirmedCells,
  );
  assert.equal(
    audit.byTherapeuticArea.find((row) => row.therapeuticArea === "Rescue inhalers")?.unconfirmedCells,
    20,
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
    assert.equal(source.completenessClass, "partial-row-extraction");
    assert.ok(source.refreshCadence);
    assert.equal(typeof source.absenceCanImplyNotListed, "boolean");
  }
});
