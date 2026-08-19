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
  assertCoverage("Formoterol", { state: "Tier 1B", flags: ["QL"] });
  assertCoverage("Ipratropium", { state: "Tier 1B", flags: ["QL"] });
  assertCoverage("Ipratropium / albuterol", { state: "Tier 1B", flags: ["QL"] });
  assertCoverage("Tiotropium (generic capsule-inhaler)", { state: "Tier 1A", flags: ["QL"] });
  assertCoverage("Incruse Ellipta (brand)", { state: "Tier 2", flags: ["QL"] });
  assertCoverage("Budesonide inhalation", { state: "Tier 1B", flags: ["PA", "QL"] });
  assertCoverage("Fluticasone furoate", { state: "Tier 1B", flags: ["QL"] });
  assertCoverage("Fluticasone propionate HFA 44 mcg", { state: "Tier 1B", flags: ["QL"] });
  assertCoverage("Fluticasone / vilanterol", { state: "Tier 1B" });
  assertCoverage("Fluticasone / salmeterol (generic)", { state: "Tier 1B" });
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
  assertCoverage("Ambrisentan", { state: "Tier 1B", flags: ["PA", "QL"] });
  assertCoverage("Sildenafil 20 mg", { state: "Tier 1A", flags: ["PA", "QL"] });
  assertCoverage("Tadalafil for PAH", { state: "Tier 1A", flags: ["PA", "QL"] });
  assertCoverage("Tobramycin inhalation", { state: "Tier 1B", flags: ["PA", "QL"] });
  assertCoverage("Fluticasone nasal", { state: "Tier 1A", flags: ["QL"] });
  assertCoverage("Azelastine nasal", { state: "Tier 1B" });
  assertCoverage("Cetirizine", { state: "Tier 1A", flags: ["QL"] });
  assertCoverage("Azithromycin", { state: "Tier 1A", flags: ["QL"] });
  assertCoverage("Pantoprazole", { state: "Tier 1B", flags: ["QL"] });
  assertCoverage("Furosemide", { state: "Tier 1A" });
  assertCoverage("Lisinopril", { state: "Tier 1A" });
  assertCoverage("Amlodipine", { state: "Tier 1B" });
  assertCoverage("Atorvastatin", { state: "Tier 1A", flags: ["QL"] });
  assertCoverage("Sertraline", { state: "Tier 1B" });
  assertCoverage("Epinephrine auto-injector", { state: "Tier 1B", flags: ["QL"] });

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

  const albuterolNebulizer = ambetterCoverage("Albuterol nebulizer solution");
  assert.equal(albuterolNebulizer.state, "Tier varies");
  assert.deepEqual(albuterolNebulizer.flags, ["QL"]);
  assert.match(albuterolNebulizer.productNote ?? "", /0\.083% nebulizer row is Tier 1A/);
  assert.match(albuterolNebulizer.productNote ?? "", /0\.63 mg\/3 mL and 1\.25 mg\/3 mL nebulizer rows are Tier 1B/);

  const levalbuterol = ambetterCoverage("Levalbuterol");
  assert.equal(levalbuterol.state, "Tier varies");
  assert.deepEqual(levalbuterol.flags, ["QL"]);
  assert.match(levalbuterol.productNote ?? "", /tartrate HFA row is Tier 1A/);
  assert.match(levalbuterol.productNote ?? "", /HCl nebulizer rows are Tier 1B/);

  const roflumilast = ambetterCoverage("Roflumilast");
  assert.equal(roflumilast.state, "Tier varies");
  assert.deepEqual(roflumilast.flags, ["QL"]);
  assert.match(roflumilast.productNote ?? "", /250 mcg row is Tier 1A/);
  assert.match(roflumilast.productNote ?? "", /500 mcg row is Tier 1B/);

  const levofloxacin = ambetterCoverage("Levofloxacin");
  assert.equal(levofloxacin.state, "Tier varies");
  assert.match(levofloxacin.productNote ?? "", /500 mg is Tier 1A/);
  assert.match(levofloxacin.productNote ?? "", /250\/750 mg tablet rows are Tier 1B/);

  const benzonatate = ambetterCoverage("Benzonatate");
  assert.equal(benzonatate.state, "Tier varies");
  assert.deepEqual(benzonatate.flags, ["QL"]);
  assert.match(benzonatate.productNote ?? "", /100 mg is Tier 1A/);
  assert.match(benzonatate.productNote ?? "", /150 mg and 200 mg rows are Tier 1B/);

  const omeprazole = ambetterCoverage("Omeprazole");
  assert.equal(omeprazole.state, "Tier varies");
  assert.deepEqual(omeprazole.flags, ["QL"]);
  assert.match(omeprazole.productNote ?? "", /Capsule rows are Tier 1A/);
  assert.match(omeprazole.productNote ?? "", /magnesium capsule and delayed-release tablet rows are Tier 1B/);

  const losartan = ambetterCoverage("Losartan");
  assert.equal(losartan.state, "Tier varies");
  assert.deepEqual(losartan.flags, ["QL"]);
  assert.match(losartan.productNote ?? "", /25 mg is Tier 1A/);
  assert.match(losartan.productNote ?? "", /50 mg and 100 mg rows are Tier 1B/);

  const prednisone = ambetterCoverage("Prednisone");
  assert.equal(prednisone.state, "Tier varies");
  assert.match(prednisone.productNote ?? "", /2\.5 mg, 10 mg, 20 mg, and 50 mg tablet rows are Tier 1A/);
  assert.match(prednisone.productNote ?? "", /solution, 1 mg and 5 mg tablet rows, and dose-pack row are Tier 1B/);

  const prednisolone = ambetterCoverage("Prednisolone");
  assert.equal(prednisolone.state, "Tier varies");
  assert.match(prednisolone.productNote ?? "", /Tablet row is Tier 1A/);
  assert.match(prednisolone.productNote ?? "", /solution row is Tier 1B/);

  const ibuprofen = ambetterCoverage("Ibuprofen");
  assert.equal(ibuprofen.state, "Tier varies");
  assert.match(ibuprofen.productNote ?? "", /400 mg and 600 mg tablets are Tier 1A/);
  assert.match(ibuprofen.productNote ?? "", /suspension and 800 mg tablet rows are Tier 1B/);

  const amoxicillinClavulanate = ambetterCoverage("Amoxicillin / clavulanate");
  assert.equal(amoxicillinClavulanate.state, "Tier varies");
  assert.match(amoxicillinClavulanate.productNote ?? "", /CHEW, suspension, 500\/875 mg tablets, and TB12 rows are Tier 1B/);
  assert.match(amoxicillinClavulanate.productNote ?? "", /250 mg tablet row is Tier 1A/);

  const doxycycline = ambetterCoverage("Doxycycline");
  assert.equal(doxycycline.state, "Tier varies");
  assert.deepEqual(doxycycline.flags, ["QL"]);
  assert.match(doxycycline.productNote ?? "", /Monohydrate capsule rows and hyclate capsule row are Tier 1A/);
  assert.match(doxycycline.productNote ?? "", /monohydrate tablet rows and hyclate tablet rows are Tier 1B/);

  const pirfenidone = ambetterCoverage("Pirfenidone");
  assert.equal(pirfenidone.state, "Tier varies");
  assert.deepEqual(pirfenidone.flags, ["PA", "QL"]);
  assert.match(pirfenidone.productNote ?? "", /Capsule and 267 mg or 801 mg tablet rows are Tier 1B/);
  assert.match(pirfenidone.productNote ?? "", /534 mg tablet row is Tier 4/);

  assertCoverage("Bosentan", { state: "Tier 1B", flags: ["PA", "QL"] });

  const metformin = ambetterCoverage("Metformin");
  assert.equal(metformin.state, "Tier varies");
  assert.deepEqual(metformin.flags, ["QL"]);
  assert.match(metformin.productNote ?? "", /850 mg tablet row is Tier 0/);
  assert.match(metformin.productNote ?? "", /500 mg and 1000 mg tablet rows plus 500 mg and 750 mg extended-release tablet rows are Tier 1B/);

  assertCoverage("Glycopyrrolate / formoterol", {
    state: "Source loading",
    flags: [],
    productNote: "No exact Bevespi product row was found in the current Ambetter NJ formulary.",
  });
});
