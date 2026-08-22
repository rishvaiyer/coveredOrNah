import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  coverageFor,
  medications,
  type Coverage,
  type CoverageState,
} from "../src/components/generated/PulmonaryFormularyDashboard.js";
import { primaryNjPlans } from "../src/components/generated/formularyPlanRegistry.js";
import { auditCoverageGaps } from "./audit-formulary-gaps.js";

test("reports the current static formulary gap inventory deterministically", () => {
  const audit = auditCoverageGaps();

  assert.deepEqual(audit.summary, {
    medicationCount: 85,
    planCount: 17,
    totalCells: 1445,
      confirmedCells: 1074,
      unconfirmedCells: 371,
      unconfirmedPercent: 25.67,
  });

  assert.deepEqual(
    Object.fromEntries(audit.byPlan.map((row) => [row.planKey, row.unconfirmedCells])),
    {
      horizonMarketplace: 16,
      horizonClassic: 16,
      ambetterNjMarketplace: 15,
      uhcCommercial: 21,
      oxfordFreedom: 21,
      aetnaMedicareHmo: 15,
      amerihealthNj: 4,
      amerihealthValue: 3,
      amerihealthSelect: 4,
      cignaNationalPreferred: 38,
      oscarNjIndividual: 15,
      wellcareNjH0913: 20,
      humanaNj26408: 26,
      bravenNjH0885: 76,
      healthspringNj26096: 15,
      cloverNj2026: 17,
      wellpointNjFamilyCare: 49,
    },
  );

  assert.equal(
    audit.byTherapeuticArea.reduce((sum, row) => sum + row.unconfirmedCells, 0),
    audit.summary.unconfirmedCells,
  );
  assert.equal(
    audit.byTherapeuticArea.find((row) => row.therapeuticArea === "Rescue inhalers")?.unconfirmedCells,
    9,
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
  const launchPlanGeneratorSource = readFileSync(
    new URL("./build_launch_plan_pdf.py", import.meta.url),
    "utf8",
  );

  assert.match(dashboardSource, /Source-listed on the published tier shown here\./);
  assert.match(dashboardSource, /Source-listed on a higher published tier\./);
  assert.match(dashboardSource, /<span>Source-listed<\/span>/);
  assert.doesNotMatch(dashboardSource, /Covered on a higher tier\./);
  assert.doesNotMatch(dashboardSource, /<span>Covered<\/span>/);
  assert.match(readmeSource, /\| \*\*Source-listed\*\* \| The selected medication product appears in the selected source\./);
  assert.match(readmeSource, /Reserve `Covered` for exact connector output tied to a selected plan or NDC\./);
  assert.doesNotMatch(readmeSource, /\| \*\*Covered\*\* \| The selected medication product appears in the selected source\./);
  assert.match(launchPlanGeneratorSource, /1,035 of 1,445 medication-plan cells as source-confirmed; 410 remain explicitly unconfirmed/);
  assert.doesNotMatch(launchPlanGeneratorSource, /1,009 of 1,445 medication-plan cells as source-confirmed; 436 remain explicitly unconfirmed/);
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

  const expectedAmbetterMatrix = {
    "Albuterol HFA": { state: "Tier 1B", flags: [] },
    "Albuterol nebulizer solution": { state: "Tier varies", flags: ["QL"] },
    Levalbuterol: { state: "Tier varies", flags: ["QL"] },
    Arformoterol: { state: "Tier 1B", flags: ["QL"] },
    Formoterol: { state: "Tier 1B", flags: ["QL"] },
    Salmeterol: { state: "Tier 2", flags: ["QL"] },
    Ipratropium: { state: "Tier varies", flags: ["QL"] },
    "Ipratropium / albuterol": { state: "Tier varies", flags: ["QL"] },
    "Tiotropium (generic capsule-inhaler)": { state: "Tier 1A", flags: ["QL"] },
    "Spiriva HandiHaler / Respimat (brand)": { state: "Tier 2", flags: ["QL"] },
    "Incruse Ellipta (brand)": { state: "Tier 2", flags: ["QL"] },
    "Anoro Ellipta (brand)": { state: "Source loading", flags: [] },
    "Glycopyrrolate / formoterol": { state: "Source loading", flags: [] },
    Revefenacin: { state: "Source loading", flags: [] },
    "Tiotropium / olodaterol": { state: "Tier 2", flags: [] },
    Olodaterol: { state: "Tier 2", flags: [] },
    Aclidinium: { state: "Source loading", flags: [] },
    "Fluticasone / umeclidinium / vilanterol": { state: "Tier 2", flags: ["QL"] },
    "Budesonide / glycopyrrolate / formoterol": { state: "Tier 2", flags: ["QL"] },
    Roflumilast: { state: "Tier varies", flags: ["QL"] },
    Ensifentrine: { state: "Source loading", flags: [] },
    "Budesonide inhalation": { state: "Tier 1B", flags: ["PA", "QL"] },
    "Budesonide (Flexhaler)": { state: "Tier 2", flags: [] },
    "Fluticasone furoate": { state: "Tier varies", flags: ["QL"] },
    "Fluticasone propionate HFA 44 mcg": { state: "Tier 1B", flags: ["QL"] },
    "QVAR RediHaler (brand)": { state: "Tier 2", flags: [] },
    Ciclesonide: { state: "Tier 3", flags: ["PA"] },
    Mometasone: { state: "Source loading", flags: [] },
    "Advair Diskus / HFA (brand)": { state: "Source loading", flags: [] },
    "Symbicort (brand)": { state: "Source loading", flags: [] },
    "Budesonide / formoterol (generic)": { state: "Tier 1A", flags: [] },
    "Mometasone / formoterol": { state: "Tier 2", flags: [] },
    "Fluticasone / vilanterol": { state: "Tier varies", flags: [] },
    "Albuterol / budesonide": { state: "Source loading", flags: [] },
    "Fluticasone / salmeterol (generic)": { state: "Tier 1B", flags: [] },
    Montelukast: { state: "Tier 1B", flags: ["QL"] },
    Zafirlukast: { state: "Tier 1B", flags: ["QL"] },
    "Zileuton ER": { state: "Tier 1B", flags: ["PA", "QL"] },
    Prednisone: { state: "Tier varies", flags: [] },
    Prednisolone: { state: "Tier varies", flags: [] },
    Dupilumab: { state: "Tier 4", flags: ["PA", "QL"] },
    Benralizumab: { state: "Tier 4", flags: ["PA", "QL"] },
    Mepolizumab: { state: "Source loading", flags: [] },
    Reslizumab: { state: "Source loading", flags: [] },
    Tezepelumab: { state: "Source loading", flags: [] },
    Omalizumab: { state: "Source loading", flags: [] },
    Nintedanib: { state: "Tier 4", flags: ["PA", "QL"] },
    Pirfenidone: { state: "Tier varies", flags: ["PA", "QL"] },
    Ambrisentan: { state: "Tier 1B", flags: ["PA", "QL"] },
    Bosentan: { state: "Tier varies", flags: ["PA", "QL"] },
    "Sildenafil 20 mg": { state: "Tier 1A", flags: ["PA", "QL"] },
    "Tadalafil for PAH": { state: "Tier 1A", flags: ["PA", "QL"] },
    "Treprostinil inhaled": { state: "Tier 4", flags: ["PA"] },
    Selexipag: { state: "Tier 4", flags: ["PA", "QL"] },
    Riociguat: { state: "Tier 4", flags: ["PA", "QL"] },
    "Sotatercept-csrk": { state: "Source loading", flags: [] },
    "Tobramycin inhalation": { state: "Tier 1B", flags: ["PA", "QL"] },
    "Aztreonam inhalation": { state: "Tier 4", flags: ["PA", "QL"] },
    "Dornase alfa": { state: "Tier 4", flags: ["PA", "QL"] },
    "Elexacaftor / tezacaftor / ivacaftor": { state: "Tier 4", flags: ["PA", "QL"] },
    "Fluticasone nasal": { state: "Tier 1A", flags: ["QL"] },
    "Azelastine nasal": { state: "Tier 1B", flags: [] },
    Cetirizine: { state: "Tier 1A", flags: ["QL"] },
    Varenicline: { state: "Tier 0", flags: ["QL"] },
    "Nicotine replacement": { state: "Tier 0", flags: [] },
    "Bupropion SR 150 mg": { state: "Tier 0", flags: ["QL"] },
    Azithromycin: { state: "Tier 1A", flags: ["QL"] },
    "Amoxicillin / clavulanate": { state: "Tier varies", flags: [] },
    Doxycycline: { state: "Tier varies", flags: ["QL"] },
    Levofloxacin: { state: "Tier varies", flags: [] },
    Benzonatate: { state: "Tier varies", flags: ["QL"] },
    "Guaifenesin ER": { state: "Source loading", flags: [] },
    Famotidine: { state: "Tier varies", flags: [] },
    Pantoprazole: { state: "Tier 1B", flags: ["QL"] },
    "Epinephrine auto-injector": { state: "Tier 1B", flags: ["QL"] },
    Furosemide: { state: "Tier 1A", flags: [] },
    Apixaban: { state: "Tier 2", flags: ["QL"] },
    Lisinopril: { state: "Tier 1A", flags: [] },
    Losartan: { state: "Tier varies", flags: ["QL"] },
    Amlodipine: { state: "Tier 1B", flags: [] },
    Atorvastatin: { state: "Tier 1A", flags: ["QL"] },
    Metformin: { state: "Tier varies", flags: ["QL"] },
    Omeprazole: { state: "Tier varies", flags: ["QL"] },
    Sertraline: { state: "Tier 1B", flags: [] },
    Ibuprofen: { state: "Tier varies", flags: [] },
  } satisfies Record<string, { state: string; flags: string[] }>;

  assert.equal(Object.keys(expectedAmbetterMatrix).length, 85);
  assert.deepEqual(new Set(Object.keys(expectedAmbetterMatrix)), new Set(medications.map((row) => row.generic)));

  for (const [generic, expected] of Object.entries(expectedAmbetterMatrix)) {
    assertCoverage(generic, expected);
  }

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

  const ipratropium = ambetterCoverage("Ipratropium");
  assert.equal(ipratropium.state, "Tier varies");
  assert.deepEqual(ipratropium.flags, ["QL"]);
  assert.match(ipratropium.productNote ?? "", /Generic ipratropium HFA and 0\.02% solution rows are Tier 1B/);
  assert.match(ipratropium.productNote ?? "", /brand Atrovent HFA row is Tier 3/);

  const ipratropiumAlbuterol = ambetterCoverage("Ipratropium \/ albuterol");
  assert.equal(ipratropiumAlbuterol.state, "Tier varies");
  assert.deepEqual(ipratropiumAlbuterol.flags, ["QL"]);
  assert.match(ipratropiumAlbuterol.productNote ?? "", /Generic ipratropium-albuterol solution row is Tier 1B/);
  assert.match(ipratropiumAlbuterol.productNote ?? "", /brand Combivent Respimat row is Tier 2/);

  const tiotropiumGeneric = ambetterCoverage("Tiotropium (generic capsule-inhaler)");
  assert.equal(tiotropiumGeneric.state, "Tier 1A");
  assert.deepEqual(tiotropiumGeneric.flags, ["QL"]);

  const spirivaBrand = ambetterCoverage("Spiriva HandiHaler / Respimat (brand)");
  assert.equal(spirivaBrand.state, "Tier 2");
  assert.deepEqual(spirivaBrand.flags, ["QL"]);
  assert.match(spirivaBrand.productNote ?? "", /Spiriva Respimat row is Tier 2/);
  assert.match(spirivaBrand.productNote ?? "", /no exact Spiriva HandiHaler row was found/);

  const incruseBrand = ambetterCoverage("Incruse Ellipta (brand)");
  assert.equal(incruseBrand.state, "Tier 2");
  assert.deepEqual(incruseBrand.flags, ["QL"]);

  const budesonideInhalationMedication = medications.find((row) => row.generic === "Budesonide inhalation");
  assert.ok(budesonideInhalationMedication);
  assert.equal(budesonideInhalationMedication.brands, "Pulmicort Respules");
  assert.match(budesonideInhalationMedication.productDetails ?? "", /Flexhaler is tracked separately/);

  const budesonideInhalation = ambetterCoverage("Budesonide inhalation");
  assert.equal(budesonideInhalation.state, "Tier 1B");
  assert.deepEqual(budesonideInhalation.flags, ["PA", "QL"]);
  assert.match(budesonideInhalation.productNote ?? "", /Nebulized budesonide suspension row only/);
  assert.match(budesonideInhalation.productNote ?? "", /Pulmicort Flexhaler is tracked separately at Tier 2/);

  assertCoverage("Budesonide (Flexhaler)", { state: "Tier 2" });

  const budesonideFormoterolMedication = medications.find((row) => row.generic === "Budesonide / formoterol (generic)");
  assert.ok(budesonideFormoterolMedication);
  assert.equal(budesonideFormoterolMedication.brands, "Generic budesonide-formoterol");

  const budesonideFormoterolGeneric = ambetterCoverage("Budesonide / formoterol (generic)");
  assert.equal(budesonideFormoterolGeneric.state, "Tier 1A");
  assert.deepEqual(budesonideFormoterolGeneric.flags, []);
  assert.match(budesonideFormoterolGeneric.productNote ?? "", /Generic budesonide-formoterol fumarate dihydrate row is Tier 1A/);
  assert.match(budesonideFormoterolGeneric.productNote ?? "", /no exact Breyna brand row was found/);

  const fluticasoneFuroate = ambetterCoverage("Fluticasone furoate");
  assert.equal(fluticasoneFuroate.state, "Tier varies");
  assert.deepEqual(fluticasoneFuroate.flags, ["QL"]);
  assert.match(fluticasoneFuroate.productNote ?? "", /Generic fluticasone furoate inhalation row is Tier 1B/);
  assert.match(fluticasoneFuroate.productNote ?? "", /brand Arnuity Ellipta rows are Tier 2/);

  const ciclesonide = ambetterCoverage("Ciclesonide");
  assert.equal(ciclesonide.state, "Tier 3");
  assert.deepEqual(ciclesonide.flags, ["PA"]);
  assert.equal(ciclesonide.productNote, "Alvesco inhaler row.");

  const fluticasoneVilanterol = ambetterCoverage("Fluticasone \/ vilanterol");
  assert.equal(fluticasoneVilanterol.state, "Tier varies");
  assert.match(fluticasoneVilanterol.productNote ?? "", /Generic fluticasone furoate-vilanterol row is Tier 1B/);
  assert.match(fluticasoneVilanterol.productNote ?? "", /brand Breo Ellipta rows are Tier 2/);

  const famotidine = ambetterCoverage("Famotidine");
  assert.equal(famotidine.state, "Tier varies");
  assert.match(famotidine.productNote ?? "", /Tier 1A RX\/OTC/);
  assert.match(famotidine.productNote ?? "", /Tier 1B/);

  const albuterolNebulizer = ambetterCoverage("Albuterol nebulizer solution");
  assert.equal(albuterolNebulizer.state, "Tier varies");
  assert.deepEqual(albuterolNebulizer.flags, ["QL"]);
  assert.match(albuterolNebulizer.productNote ?? "", /0\.083% and strength-unspecified nebulizer rows are Tier 1A/);
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
  assert.match(levofloxacin.productNote ?? "", /500 mg tablet row is Tier 1A/);
  assert.match(levofloxacin.productNote ?? "", /IV 500 mg\/100 mL in D5W row, oral solution row, and 250\/750 mg tablet rows are Tier 1B/);

  const benzonatate = ambetterCoverage("Benzonatate");
  assert.equal(benzonatate.state, "Tier varies");
  assert.deepEqual(benzonatate.flags, ["QL"]);
  assert.match(benzonatate.productNote ?? "", /100 mg is Tier 1A/);
  assert.match(benzonatate.productNote ?? "", /150 mg and 200 mg rows are Tier 1B/);

  const omeprazole = ambetterCoverage("Omeprazole");
  assert.equal(omeprazole.state, "Tier varies");
  assert.deepEqual(omeprazole.flags, ["QL"]);
  assert.match(omeprazole.productNote ?? "", /Generic omeprazole CPDR row is Tier 1A/);
  assert.match(omeprazole.productNote ?? "", /omeprazole magnesium CPDR rows and omeprazole TBEC row are Tier 1B/);

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
  assert.match(prednisolone.productNote ?? "", /15 mg\/5 mL sodium-phosphate solution row and tablet row are Tier 1A/);
  assert.match(prednisolone.productNote ?? "", /5 mg\/5 mL, 10 mg\/5 mL, and 25 mg\/5 mL sodium-phosphate solutions, TBDP row, and other solution row are Tier 1B/);

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

  const bosentan = ambetterCoverage("Bosentan");
  assert.equal(bosentan.state, "Tier varies");
  assert.deepEqual(bosentan.flags, ["PA", "QL"]);
  assert.match(bosentan.productNote ?? "", /Generic bosentan tablet and oral-suspension rows are Tier 1B/);
  assert.match(bosentan.productNote ?? "", /brand Tracleer oral-suspension row is Tier 4/);

  const treprostinilInhaled = ambetterCoverage("Treprostinil inhaled");
  assert.equal(treprostinilInhaled.state, "Tier 4");
  assert.deepEqual(treprostinilInhaled.flags, ["PA"]);
  assert.match(treprostinilInhaled.productNote ?? "", /Tyvaso refill kit, starter kit, and nebulized solution rows are Tier 4/);
  assert.match(treprostinilInhaled.productNote ?? "", /no exact Tyvaso DPI row was found/);

  const tobramycinInhalation = ambetterCoverage("Tobramycin inhalation");
  assert.equal(tobramycinInhalation.state, "Tier 1B");
  assert.deepEqual(tobramycinInhalation.flags, ["PA", "QL"]);
  assert.match(tobramycinInhalation.productNote ?? "", /Generic tobramycin nebulizer row is Tier 1B/);
  assert.match(tobramycinInhalation.productNote ?? "", /no exact TOBI Podhaler row was found/);

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
