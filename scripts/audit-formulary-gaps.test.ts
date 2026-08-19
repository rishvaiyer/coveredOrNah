import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  coverageFor,
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

test("static source-backed UI uses source-listed language instead of covered language", () => {
  const dashboardSource = readFileSync(
    new URL("../src/components/generated/PulmonaryFormularyDashboard.tsx", import.meta.url),
    "utf8",
  );
  const readmeSource = readFileSync(new URL("../README.md", import.meta.url), "utf8");

  assert.match(dashboardSource, /Source-listed on the published tier shown here\./);
  assert.match(dashboardSource, /Source-listed on a higher published tier\./);
  assert.match(dashboardSource, /<span>Source-listed<\/span>/);
  assert.doesNotMatch(dashboardSource, /Covered on a higher tier\./);
  assert.doesNotMatch(dashboardSource, /<span>Covered<\/span>/);
  assert.match(readmeSource, /\| \*\*Source-listed\*\* \| The selected medication product appears in the selected source\./);
  assert.match(readmeSource, /Reserve `Covered` for exact connector output tied to a selected plan or NDC\./);
  assert.doesNotMatch(readmeSource, /\| \*\*Covered\*\* \| The selected medication product appears in the selected source\./);
});

test("ambetter preserves reviewed Tier 0, Tier 1A, Tier 1B, and unconfirmed semantics", () => {
  const ambetterPlan = primaryNjPlans.find((plan) => plan.key === "ambetterNjMarketplace");
  assert.ok(ambetterPlan, "Missing Ambetter baseline plan");

  const ambetterCoverage = (generic: string) => {
    const medication = medications.find((row) => row.generic === generic);
    assert.ok(medication, `Missing medication fixture for ${generic}`);
    return coverageFor(medication, ambetterPlan.key);
  };

  const assertCoverage = (
    generic: string,
    expected: { state: string; flags?: string[]; productNote?: string },
  ) => {
    const actual = ambetterCoverage(generic);
    assert.equal(actual.state, expected.state);
    if (expected.flags) {
      assert.deepEqual(actual.flags, expected.flags);
    }
    if (expected.productNote) {
      assert.equal(actual.productNote, expected.productNote);
    }
  };

  assertCoverage("Albuterol HFA", { state: "Tier 1B" });
  assertCoverage("Arformoterol", { state: "Tier 1B", flags: ["QL"] });
  assertCoverage("Tiotropium (generic capsule-inhaler)", { state: "Tier 1A", flags: ["QL"] });
  assertCoverage("Incruse Ellipta (brand)", { state: "Tier 2", flags: ["QL"] });
  assertCoverage("Montelukast", { state: "Tier 1B", flags: ["QL"] });
  assertCoverage("Zafirlukast", { state: "Tier 1B", flags: ["QL"] });
  assertCoverage("Varenicline", {
    state: "Tier 0",
    flags: ["QL"],
    productNote: "ACA preventive smoking-cessation benefit.",
  });
  assertCoverage("Nicotine replacement", {
    state: "Tier 0",
    productNote: "ACA preventive smoking-cessation benefit.",
  });
  assertCoverage("Bupropion SR 150 mg", {
    state: "Tier 0",
    flags: ["QL"],
    productNote: "ACA preventive smoking-cessation benefit.",
  });
  assertCoverage("Zileuton ER", { state: "Tier 1B", flags: ["PA", "QL"] });

  const tiotropiumGeneric = ambetterCoverage("Tiotropium (generic capsule-inhaler)");
  assert.equal(tiotropiumGeneric.state, "Tier 1A");
  assert.deepEqual(tiotropiumGeneric.flags, ["QL"]);

  const incruseBrand = ambetterCoverage("Incruse Ellipta (brand)");
  assert.equal(incruseBrand.state, "Tier 2");
  assert.deepEqual(incruseBrand.flags, ["QL"]);

  const famotidine = ambetterCoverage("Famotidine");
  assert.equal(famotidine.state, "Tier varies");
  assert.match(famotidine.productNote ?? "", /Tier 1A RX\/OTC/);
  assert.match(famotidine.productNote ?? "", /Tier 1B/);

  assertCoverage("Glycopyrrolate / formoterol", {
    state: "Source loading",
    flags: [],
    productNote: "No exact Bevespi product row was found in the current Ambetter NJ formulary.",
  });
});
