import { useEffect, useMemo, useState } from "react";
export type CoverageState =
  | "Preferred"
  | "Preferred + PA"
  | "Tier 1"
  | "Tier 1 + PA"
  | "Tier 2"
  | "Tier 2 + PA"
  | "Non-preferred"
  | "Not on PDL";
export type Restriction = "PA" | "QL" | "ST" | "SP" | "CC" | "Age" | "DX2RX";
export type PlanKey = "nyrx" | "njuhc" | "pama";
export type Coverage = {
  state: CoverageState;
  flags?: Restriction[];
};
export type Medication = {
  generic: string;
  brands: string;
  branch: string;
  use: string;
  coverage: Record<PlanKey, Coverage>;
};
export const plans: Array<{
  key: PlanKey;
  short: string;
  name: string;
  region: string;
  updated: string;
  source: string;
}> = [
  {
    key: "nyrx",
    short: "NYRx",
    name: "New York Medicaid NYRx",
    region: "NY",
    updated: "Jul 16, 2026",
    source: "https://newyork.fhsc.com/downloads/providers/NYRx_PDP_PDL.pdf",
  },
  {
    key: "njuhc",
    short: "NJ FamilyCare",
    name: "UnitedHealthcare NJ FamilyCare",
    region: "NJ",
    updated: "Jul 1, 2026",
    source:
      "https://www.uhcprovider.com/content/dam/provider/docs/public/commplan/nj/pharmacy/NJ-Preferred-Drug-List-Family-Care.pdf",
  },
  {
    key: "pama",
    short: "PA Medical Assistance",
    name: "Pennsylvania Statewide Medicaid PDL",
    region: "PA",
    updated: "Jan 5, 2026",
    source:
      "https://www.papdl.com/content/dam/ffs-medicaid/pa/pdl/penn-statewide-pdl-012026-v12.pdf",
  },
];
const c = (
  ny: CoverageState,
  nj: CoverageState,
  pa: CoverageState,
  nyFlags: Restriction[] = [],
  njFlags: Restriction[] = [],
  paFlags: Restriction[] = [],
): Record<PlanKey, Coverage> => ({
  nyrx: {
    state: ny,
    flags: nyFlags,
  },
  njuhc: {
    state: nj,
    flags: njFlags,
  },
  pama: {
    state: pa,
    flags: paFlags,
  },
});
export const medications: Medication[] = [
  {
    generic: "Albuterol HFA",
    brands: "ProAir HFA, Proventil HFA, Ventolin HFA",
    branch: "Rescue inhalers",
    use: "Asthma and COPD rescue bronchodilator",
    coverage: c("Preferred", "Tier 1", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Albuterol nebulizer solution",
    brands: "AccuNeb",
    branch: "Rescue inhalers",
    use: "Nebulized rescue bronchodilator",
    coverage: c("Preferred", "Tier 1", "Preferred", [], ["QL"], []),
  },
  {
    generic: "Levalbuterol",
    brands: "Xopenex HFA, Xopenex solution",
    branch: "Rescue inhalers",
    use: "Short-acting beta agonist",
    coverage: c(
      "Non-preferred",
      "Tier 1",
      "Preferred",
      [],
      ["ST", "QL"],
      ["QL"],
    ),
  },
  {
    generic: "Arformoterol",
    brands: "Brovana",
    branch: "Long-acting bronchodilators",
    use: "Nebulized LABA for COPD",
    coverage: c(
      "Preferred + PA",
      "Tier 2 + PA",
      "Non-preferred",
      ["CC", "QL"],
      ["QL"],
      ["QL"],
    ),
  },
  {
    generic: "Formoterol",
    brands: "Perforomist",
    branch: "Long-acting bronchodilators",
    use: "Nebulized LABA for COPD",
    coverage: c(
      "Preferred + PA",
      "Tier 2 + PA",
      "Non-preferred",
      ["CC", "QL"],
      ["QL"],
      ["QL"],
    ),
  },
  {
    generic: "Salmeterol",
    brands: "Serevent Diskus",
    branch: "Long-acting bronchodilators",
    use: "LABA controller",
    coverage: c(
      "Preferred + PA",
      "Tier 2 + PA",
      "Non-preferred",
      ["CC", "QL"],
      ["QL"],
      ["QL"],
    ),
  },
  {
    generic: "Ipratropium",
    brands: "Atrovent HFA, nebulizer solution",
    branch: "Anticholinergics",
    use: "Short-acting muscarinic antagonist",
    coverage: c("Preferred", "Tier 1", "Preferred", [], ["QL"], []),
  },
  {
    generic: "Ipratropium / albuterol",
    brands: "Combivent Respimat, DuoNeb",
    branch: "Combination bronchodilators",
    use: "SAMA and SABA combination",
    coverage: c("Preferred", "Tier 1", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Tiotropium (generic capsule-inhaler)",
    brands: "Brand Spiriva products are listed separately",
    branch: "Anticholinergics",
    use: "Long-acting muscarinic antagonist",
    coverage: c("Non-preferred", "Tier 1", "Non-preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Spiriva HandiHaler / Respimat (brand)",
    brands: "tiotropium brand products",
    branch: "Anticholinergics",
    use: "Long-acting muscarinic antagonist",
    coverage: c("Preferred", "Tier 2 + PA", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Incruse Ellipta (brand)",
    brands: "umeclidinium",
    branch: "Anticholinergics",
    use: "Long-acting muscarinic antagonist",
    coverage: c("Preferred", "Tier 2", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Anoro Ellipta (brand)",
    brands: "umeclidinium / vilanterol",
    branch: "Combination bronchodilators",
    use: "LAMA and LABA for COPD",
    coverage: c("Preferred", "Tier 2", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Tiotropium / olodaterol",
    brands: "Stiolto Respimat",
    branch: "Combination bronchodilators",
    use: "LAMA and LABA for COPD",
    coverage: c("Preferred", "Tier 2", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Fluticasone / umeclidinium / vilanterol",
    brands: "Trelegy Ellipta",
    branch: "Triple therapy",
    use: "ICS, LAMA and LABA for COPD or asthma",
    coverage: c(
      "Non-preferred",
      "Tier 2 + PA",
      "Preferred",
      [],
      ["QL"],
      ["QL"],
    ),
  },
  {
    generic: "Budesonide / glycopyrrolate / formoterol",
    brands: "Breztri Aerosphere",
    branch: "Triple therapy",
    use: "ICS, LAMA and LABA for COPD",
    coverage: c(
      "Non-preferred",
      "Tier 2 + PA",
      "Non-preferred",
      [],
      ["QL"],
      ["QL"],
    ),
  },
  {
    generic: "Roflumilast",
    brands: "Daliresp",
    branch: "COPD oral therapy",
    use: "PDE-4 inhibitor for severe COPD",
    coverage: c(
      "Preferred",
      "Tier 1",
      "Non-preferred",
      [],
      ["DX2RX", "QL"],
      ["QL"],
    ),
  },
  {
    generic: "Ensifentrine",
    brands: "Ohtuvayre",
    branch: "COPD nebulized therapy",
    use: "PDE-3 and PDE-4 inhibitor",
    coverage: c("Non-preferred", "Not on PDL", "Non-preferred", [], [], ["QL"]),
  },
  {
    generic: "Budesonide inhalation",
    brands: "Pulmicort Respules, Pulmicort Flexhaler",
    branch: "Inhaled corticosteroids",
    use: "ICS controller",
    coverage: c("Not on PDL", "Tier 1", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Fluticasone propionate HFA 44 mcg",
    brands: "Generic; brand and other strengths may differ",
    branch: "Inhaled corticosteroids",
    use: "ICS controller",
    coverage: c(
      "Preferred",
      "Tier 1",
      "Non-preferred",
      [],
      ["QL"],
      ["Age", "QL"],
    ),
  },
  {
    generic: "QVAR RediHaler (brand)",
    brands: "beclomethasone HFA; generic coverage may differ",
    branch: "Inhaled corticosteroids",
    use: "ICS controller",
    coverage: c("Preferred", "Tier 2 + PA", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Ciclesonide",
    brands: "Alvesco",
    branch: "Inhaled corticosteroids",
    use: "ICS controller",
    coverage: c("Preferred", "Tier 2 + PA", "Non-preferred", [], [], ["QL"]),
  },
  {
    generic: "Mometasone",
    brands: "Asmanex HFA, Asmanex Twisthaler",
    branch: "Inhaled corticosteroids",
    use: "ICS controller",
    coverage: c("Preferred", "Tier 2", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Advair Diskus / HFA (brand)",
    brands: "fluticasone / salmeterol; AirDuo, Wixela and generics may differ",
    branch: "ICS / LABA combinations",
    use: "Asthma or COPD controller",
    coverage: c(
      "Preferred + PA",
      "Tier 2 + PA",
      "Preferred",
      ["CC", "QL"],
      ["QL"],
      ["QL"],
    ),
  },
  {
    generic: "Symbicort (brand)",
    brands: "budesonide / formoterol; Breyna and generics may differ",
    branch: "ICS / LABA combinations",
    use: "Asthma or COPD controller",
    coverage: c(
      "Preferred + PA",
      "Tier 2 + PA",
      "Preferred",
      ["CC", "QL"],
      ["QL"],
      ["QL"],
    ),
  },
  {
    generic: "Mometasone / formoterol",
    brands: "Dulera",
    branch: "ICS / LABA combinations",
    use: "Asthma controller",
    coverage: c(
      "Preferred + PA",
      "Tier 2 + PA",
      "Preferred",
      ["CC", "QL"],
      ["QL"],
      ["QL"],
    ),
  },
  {
    generic: "Fluticasone / vilanterol",
    brands: "Breo Ellipta",
    branch: "ICS / LABA combinations",
    use: "Asthma or COPD controller",
    coverage: c(
      "Non-preferred",
      "Tier 2 + PA",
      "Non-preferred",
      ["CC", "QL"],
      ["QL"],
      ["QL"],
    ),
  },
  {
    generic: "Montelukast",
    brands: "Singulair",
    branch: "Leukotriene modifiers",
    use: "Asthma and allergic rhinitis",
    coverage: c("Preferred", "Tier 1", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Zafirlukast",
    brands: "Accolate",
    branch: "Leukotriene modifiers",
    use: "Asthma controller",
    coverage: c("Preferred", "Tier 1 + PA", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Zileuton ER",
    brands: "Zyflo CR",
    branch: "Leukotriene modifiers",
    use: "Asthma controller",
    coverage: c("Preferred", "Tier 2 + PA", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Prednisone",
    brands: "Rayos and generics",
    branch: "Systemic corticosteroids",
    use: "Acute pulmonary exacerbations",
    coverage: c("Preferred", "Tier 1", "Preferred", [], ["QL"], []),
  },
  {
    generic: "Prednisolone",
    brands: "Orapred and generics",
    branch: "Systemic corticosteroids",
    use: "Systemic corticosteroid",
    coverage: c("Preferred", "Tier 1", "Preferred", [], ["QL"], []),
  },
  {
    generic: "Dupilumab",
    brands: "Dupixent",
    branch: "Asthma biologics",
    use: "Type 2 asthma and nasal polyps",
    coverage: c(
      "Preferred + PA",
      "Tier 2 + PA",
      "Preferred + PA",
      ["CC", "ST"],
      ["SP", "QL"],
      ["QL"],
    ),
  },
  {
    generic: "Benralizumab",
    brands: "Fasenra",
    branch: "Asthma biologics",
    use: "Severe eosinophilic asthma",
    coverage: c(
      "Preferred + PA",
      "Tier 2 + PA",
      "Preferred + PA",
      ["CC", "ST"],
      ["SP", "QL"],
      ["QL"],
    ),
  },
  {
    generic: "Mepolizumab",
    brands: "Nucala",
    branch: "Asthma biologics",
    use: "Severe eosinophilic asthma",
    coverage: c(
      "Preferred + PA",
      "Tier 2 + PA",
      "Preferred + PA",
      ["CC", "ST"],
      ["SP", "QL"],
      ["QL"],
    ),
  },
  {
    generic: "Tezepelumab",
    brands: "Tezspire",
    branch: "Asthma biologics",
    use: "Severe asthma",
    coverage: c(
      "Preferred + PA",
      "Tier 2 + PA",
      "Preferred + PA",
      ["CC", "ST"],
      ["SP", "QL"],
      ["QL"],
    ),
  },
  {
    generic: "Omalizumab",
    brands: "Xolair",
    branch: "Asthma biologics",
    use: "Allergic asthma",
    coverage: c(
      "Preferred + PA",
      "Tier 2 + PA",
      "Preferred + PA",
      ["CC"],
      ["SP", "QL"],
      ["QL"],
    ),
  },
  {
    generic: "Nintedanib",
    brands: "Ofev",
    branch: "Interstitial lung disease",
    use: "Antifibrotic therapy",
    coverage: c(
      "Not on PDL",
      "Tier 1 + PA",
      "Preferred + PA",
      [],
      ["SP", "QL"],
      ["QL"],
    ),
  },
  {
    generic: "Pirfenidone",
    brands: "Esbriet",
    branch: "Interstitial lung disease",
    use: "Antifibrotic therapy",
    coverage: c(
      "Not on PDL",
      "Tier 1 + PA",
      "Preferred + PA",
      [],
      ["SP", "QL"],
      ["QL"],
    ),
  },
  {
    generic: "Ambrisentan",
    brands: "Letairis",
    branch: "Pulmonary hypertension",
    use: "Endothelin receptor antagonist",
    coverage: c(
      "Preferred + PA",
      "Tier 1 + PA",
      "Preferred + PA",
      ["CC"],
      ["SP", "QL"],
      ["QL"],
    ),
  },
  {
    generic: "Bosentan",
    brands: "Tracleer",
    branch: "Pulmonary hypertension",
    use: "Endothelin receptor antagonist",
    coverage: c(
      "Preferred + PA",
      "Tier 1 + PA",
      "Preferred + PA",
      ["CC"],
      ["SP", "QL"],
      ["QL"],
    ),
  },
  {
    generic: "Sildenafil 20 mg",
    brands: "Revatio",
    branch: "Pulmonary hypertension",
    use: "PDE-5 inhibitor for PAH",
    coverage: c(
      "Preferred + PA",
      "Tier 1 + PA",
      "Preferred + PA",
      ["CC"],
      ["SP", "QL"],
      ["QL"],
    ),
  },
  {
    generic: "Tadalafil for PAH",
    brands: "Adcirca, Alyq",
    branch: "Pulmonary hypertension",
    use: "PDE-5 inhibitor for PAH",
    coverage: c(
      "Preferred + PA",
      "Tier 1 + PA",
      "Preferred + PA",
      ["CC"],
      ["SP", "QL"],
      ["QL"],
    ),
  },
  {
    generic: "Treprostinil inhaled",
    brands: "Tyvaso, Tyvaso DPI",
    branch: "Pulmonary hypertension",
    use: "Prostacyclin pathway therapy",
    coverage: c(
      "Preferred + PA",
      "Tier 2 + PA",
      "Preferred + PA",
      ["CC"],
      ["SP", "QL"],
      ["QL"],
    ),
  },
  {
    generic: "Selexipag",
    brands: "Uptravi",
    branch: "Pulmonary hypertension",
    use: "Prostacyclin receptor agonist",
    coverage: c(
      "Preferred + PA",
      "Tier 2 + PA",
      "Non-preferred",
      ["CC"],
      ["SP", "QL"],
      ["QL"],
    ),
  },
  {
    generic: "Riociguat",
    brands: "Adempas",
    branch: "Pulmonary hypertension",
    use: "Soluble guanylate cyclase stimulator",
    coverage: c(
      "Non-preferred",
      "Tier 2 + PA",
      "Non-preferred",
      ["CC"],
      ["SP", "QL"],
      ["QL"],
    ),
  },
  {
    generic: "Tobramycin inhalation",
    brands: "Bethkis, Kitabis Pak, TOBI, TOBI Podhaler",
    branch: "Inhaled anti-infectives",
    use: "Chronic pulmonary infection in cystic fibrosis",
    coverage: c(
      "Preferred + PA",
      "Tier 2 + PA",
      "Preferred",
      ["CC", "QL"],
      ["SP", "QL"],
      ["QL"],
    ),
  },
  {
    generic: "Aztreonam inhalation",
    brands: "Cayston",
    branch: "Inhaled anti-infectives",
    use: "Pulmonary Pseudomonas infection in cystic fibrosis",
    coverage: c(
      "Preferred + PA",
      "Tier 2 + PA",
      "Preferred",
      ["CC", "QL"],
      ["SP", "QL"],
      ["QL"],
    ),
  },
  {
    generic: "Dornase alfa",
    brands: "Pulmozyme",
    branch: "Cystic fibrosis",
    use: "Airway mucus clearance",
    coverage: c(
      "Not on PDL",
      "Tier 2 + PA",
      "Not on PDL",
      [],
      ["SP", "QL"],
      [],
    ),
  },
  {
    generic: "Elexacaftor / tezacaftor / ivacaftor",
    brands: "Trikafta",
    branch: "Cystic fibrosis",
    use: "CFTR modulator",
    coverage: c(
      "Not on PDL",
      "Tier 2 + PA",
      "Not on PDL",
      [],
      ["SP", "QL"],
      [],
    ),
  },
  {
    generic: "Fluticasone nasal",
    brands: "Flonase",
    branch: "Upper airway / allergy",
    use: "Allergic rhinitis and upper airway inflammation",
    coverage: c("Preferred", "Tier 1", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Azelastine nasal",
    brands: "Astelin",
    branch: "Upper airway / allergy",
    use: "Intranasal antihistamine",
    coverage: c("Preferred", "Tier 1", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Cetirizine",
    brands: "Zyrtec",
    branch: "Upper airway / allergy",
    use: "Second-generation antihistamine",
    coverage: c("Preferred", "Tier 1", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Varenicline",
    brands: "Chantix",
    branch: "Smoking cessation",
    use: "Nicotine dependence treatment",
    coverage: c("Not on PDL", "Tier 1", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Nicotine replacement",
    brands: "Patch, gum, lozenge",
    branch: "Smoking cessation",
    use: "Nicotine dependence treatment",
    coverage: c("Not on PDL", "Tier 1", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Bupropion SR 150 mg",
    brands: "Zyban",
    branch: "Smoking cessation",
    use: "Nicotine dependence treatment",
    coverage: c("Not on PDL", "Tier 1", "Preferred", [], [], ["QL"]),
  },
  {
    generic: "Lisinopril",
    brands: "Zestril, Prinivil",
    branch: "Common primary care",
    use: "Hypertension and heart failure",
    coverage: c("Preferred", "Tier 1", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Losartan",
    brands: "Cozaar",
    branch: "Common primary care",
    use: "Hypertension and kidney protection",
    coverage: c("Preferred", "Tier 1", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Amlodipine",
    brands: "Norvasc",
    branch: "Common primary care",
    use: "Hypertension and angina",
    coverage: c("Preferred", "Tier 1", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Atorvastatin",
    brands: "Lipitor",
    branch: "Common primary care",
    use: "Cholesterol management",
    coverage: c("Preferred", "Tier 1", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Metformin",
    brands: "Glucophage and generics",
    branch: "Common primary care",
    use: "Type 2 diabetes",
    coverage: c("Preferred", "Tier 1", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Omeprazole",
    brands: "Prilosec",
    branch: "Common primary care",
    use: "Acid suppression",
    coverage: c("Preferred", "Tier 1", "Preferred", ["QL"], ["QL"], ["QL"]),
  },
  {
    generic: "Sertraline",
    brands: "Zoloft",
    branch: "Common primary care",
    use: "Depression and anxiety disorders",
    coverage: c("Preferred", "Tier 1", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Ibuprofen",
    brands: "Advil, Motrin and generics",
    branch: "Common primary care",
    use: "Pain, inflammation and fever",
    coverage: c("Preferred", "Tier 1", "Preferred", ["QL"], ["QL"], ["QL"]),
  },
];
const branches = [
  "All areas",
  ...Array.from(new Set(medications.map((med) => med.branch))),
];
const toneForState = (state: CoverageState) => {
  if (state === "Preferred" || state === "Tier 1")
    return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (state.includes("PA") || state === "Tier 2")
    return "bg-amber-50 text-amber-900 ring-amber-200";
  if (state === "Non-preferred")
    return "bg-rose-50 text-rose-800 ring-rose-200";
  return "bg-slate-100 text-slate-600 ring-slate-200";
};
const displayState = (state: CoverageState) =>
  state === "Not on PDL" ? "Not listed" : state;
const restrictionNames: Record<Restriction, string> = {
  PA: "Prior authorization",
  QL: "Quantity limit",
  ST: "Step therapy",
  SP: "Specialty pharmacy",
  CC: "Clinical criteria",
  Age: "Age restriction",
  DX2RX: "Diagnosis-to-drug criteria",
};
const isStraightforwardCoverage = (state: CoverageState) =>
  state === "Preferred" || state === "Tier 1";
const actionForCoverage = (state: CoverageState) => {
  if (isStraightforwardCoverage(state))
    return "Preferred or first-tier listing. Verify the exact product and benefit.";
  if (state.includes("PA"))
    return "Review prior-authorization criteria before prescribing.";
  if (state === "Tier 2")
    return "Covered on a higher tier. Check restrictions and preferred options.";
  if (state === "Non-preferred")
    return "Non-preferred. Review preferred same-branch options or exception criteria.";
  return "Not listed in this PDL snapshot. Verify the pharmacy benefit directly.";
};
const Icon = ({
  name,
  className = "h-5 w-5",
}: {
  name:
    | "search"
    | "lungs"
    | "shield"
    | "external"
    | "chevron"
    | "filter"
    | "database";
  className?: string;
}) => {
  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    lungs: (
      <>
        <path d="M12 3v8" />
        <path d="M10 9c-2-2-3-5-5-5-1 0-2 1-2 3v8c0 3 2 5 5 5 2 0 3-1 3-3V9Z" />
        <path d="M14 9c2-2 3-5 5-5 1 0 2 1 2 3v8c0 3-2 5-5 5-2 0-3-1-3-3V9Z" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 4 6v5c0 5 3 8 8 10 5-2 8-5 8-10V6l-8-3Z" />
        <path d="m9 12 2 2 4-5" />
      </>
    ),
    external: (
      <>
        <path d="M14 4h6v6" />
        <path d="m20 4-9 9" />
        <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    filter: (
      <>
        <path d="M4 6h16" />
        <path d="M7 12h10" />
        <path d="M10 18h4" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v6c0 2 4 3 8 3s8-1 8-3V5" />
        <path d="M4 11v6c0 2 4 3 8 3s8-1 8-3v-6" />
      </>
    ),
  };
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
};
export const PulmonaryFormularyDashboard = () => {
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("All areas");
  const [planFilter, setPlanFilter] = useState<"all" | PlanKey>("all");
  const [view, setView] = useState<"medications" | "plans">("medications");
  const [selected, setSelected] = useState<Medication | null>(medications[0]);
  const [apiConnected, setApiConnected] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/health", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("API unavailable");
        return response.json();
      })
      .then((payload) => setApiConnected(payload.status === "ok"))
      .catch(() => setApiConnected(false));
    return () => controller.abort();
  }, []);
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return medications.filter((med) => {
      const matchesText =
        !needle ||
        [med.generic, med.brands, med.branch, med.use]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      const matchesBranch = branch === "All areas" || med.branch === branch;
      return matchesText && matchesBranch;
    });
  }, [query, branch]);
  const visiblePlans =
    planFilter === "all"
      ? plans
      : plans.filter((plan) => plan.key === planFilter);
  const pulmonaryCount = medications.filter(
    (med) => med.branch !== "Common primary care",
  ).length;
  const activeSelected =
    results.find((med) => med.generic === selected?.generic) ??
    results[0] ??
    null;
  const alternativesFor = (med: Medication, planKey: PlanKey) =>
    medications
      .filter(
        (candidate) =>
          candidate.generic !== med.generic &&
          candidate.branch === med.branch &&
          isStraightforwardCoverage(candidate.coverage[planKey].state),
      )
      .slice(0, 3);
  const autocompleteOptions = Array.from(
    new Set(
      medications.flatMap((medication) => [
        medication.generic,
        ...medication.brands
          .split(/[,;]/)
          .map((brand) => brand.trim())
          .filter(Boolean),
      ]),
    ),
  )
    .filter((option) =>
      option.toLowerCase().includes(query.trim().toLowerCase()),
    )
    .slice(0, 12);
  return (
    <main className="min-h-screen w-full bg-[#f3f7f7] text-[#102a2b]">
      <header className="border-b border-[#dbe7e5] bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0d6664] text-white shadow-sm">
              <Icon name="lungs" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[17px] font-bold tracking-tight">
                  Formulary Finder
                </span>
                <span className="rounded-full bg-[#e7f4f1] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0d6664]">
                  Clinical pilot
                </span>
              </div>
              <p className="text-xs text-[#627b7b]">
                Regional coverage evidence for care teams
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-[#d9e6e4] bg-[#f8fbfa] px-3 py-2 text-xs font-medium text-[#4c6868] md:flex">
            <Icon name="shield" className="h-4 w-4 text-[#198f7c]" />
            {apiConnected ? "API connected · " : ""}No patient information
            collected
          </div>
        </div>
      </header>

      <section className="border-b border-[#d8e6e3] bg-[#0d3f42] px-4 py-8 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#76d6c1]">
                Fast formulary intelligence
              </p>
              <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                Know the coverage path before the pharmacy call.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#c7dcda]">
                Search pulmonary and common medicines across current regional
                government formularies. See preferred status, restrictions, and
                the evidence source together.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                ["Pulmonary meds", pulmonaryCount],
                ["Formularies", plans.length],
                ["Curated snapshot", "3 sources"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="min-w-24 rounded-xl border border-white/10 bg-white/8 px-3 py-3"
                >
                  <div className="text-xl font-semibold">{value}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#a9c6c3]">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-7 flex flex-col gap-3 rounded-2xl bg-white p-2 shadow-[0_16px_45px_rgba(0,0,0,0.2)] sm:flex-row">
            <div className="relative flex min-h-12 flex-1 items-center">
              <Icon
                name="search"
                className="absolute left-4 h-5 w-5 text-[#688382]"
              />
              <label htmlFor="medication-search" className="sr-only">
                Search medication
              </label>
              <input
                id="medication-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                autoComplete="off"
                className="h-12 w-full rounded-xl bg-[#f4f8f7] pl-12 pr-4 text-[15px] text-[#173334] outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-[#55bda8]"
                placeholder="Search albuterol, Trelegy, pulmonary hypertension..."
              />
              {searchFocused &&
                query.trim() &&
                autocompleteOptions.length > 0 && (
                  <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 overflow-hidden rounded-xl border border-[#cfe0dd] bg-white py-1 shadow-[0_18px_45px_rgba(9,52,53,0.2)]">
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#66807e]">
                      Medication suggestions
                    </div>
                    {autocompleteOptions.map((option) => (
                      <button
                        type="button"
                        key={option}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setQuery(option);
                          setSearchFocused(false);
                        }}
                        className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm font-semibold text-[#204341] transition hover:bg-[#eaf5f2] focus:bg-[#eaf5f2] focus:outline-none"
                      >
                        <span className="truncate">{option}</span>
                        <Icon
                          name="chevron"
                          className="h-4 w-4 shrink-0 text-[#84a09d]"
                        />
                      </button>
                    ))}
                  </div>
                )}
            </div>
            <select
              aria-label="Therapeutic area"
              value={branch}
              onChange={(event) => setBranch(event.target.value)}
              className="h-12 rounded-xl border-0 bg-[#edf5f3] px-4 text-sm font-semibold text-[#214746] outline-none ring-2 ring-transparent focus:ring-[#55bda8] sm:max-w-64"
            >
              {branches.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <button
              onClick={() => setQuery(query.trim())}
              className="h-12 rounded-xl bg-[#ef7d55] px-7 text-sm font-bold text-white shadow-sm transition hover:bg-[#df6942] focus:outline-none focus:ring-2 focus:ring-[#ef7d55] focus:ring-offset-2"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-10">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div className="inline-flex w-fit rounded-xl border border-[#d8e5e3] bg-white p-1 shadow-sm">
            <button
              onClick={() => setView("medications")}
              aria-pressed={view === "medications"}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${view === "medications" ? "bg-[#173f41] text-white" : "text-[#5b7272] hover:bg-[#f0f5f4]"}`}
            >
              By medication
            </button>
            <button
              onClick={() => setView("plans")}
              aria-pressed={view === "plans"}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${view === "plans" ? "bg-[#173f41] text-white" : "text-[#5b7272] hover:bg-[#f0f5f4]"}`}
            >
              By plan
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPlanFilter("all")}
              aria-pressed={planFilter === "all"}
              className={`rounded-full px-3 py-2 text-xs font-semibold ring-1 transition ${planFilter === "all" ? "bg-[#dff1ed] text-[#0d6664] ring-[#9dcec3]" : "bg-white text-[#5a7171] ring-[#d8e5e3]"}`}
            >
              All plans
            </button>
            {plans.map((plan) => (
              <button
                key={plan.key}
                onClick={() => setPlanFilter(plan.key)}
                aria-pressed={planFilter === plan.key}
                className={`rounded-full px-3 py-2 text-xs font-semibold ring-1 transition ${planFilter === plan.key ? "bg-[#dff1ed] text-[#0d6664] ring-[#9dcec3]" : "bg-white text-[#5a7171] ring-[#d8e5e3]"}`}
              >
                {plan.short}
              </button>
            ))}
          </div>
        </div>

        {view === "plans" ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {visiblePlans.map((plan) => {
              const preferred = medications.filter((med) =>
                ["Preferred", "Tier 1"].includes(med.coverage[plan.key].state),
              ).length;
              const restricted = medications.filter(
                (med) =>
                  med.coverage[plan.key].state.includes("PA") ||
                  med.coverage[plan.key].state === "Tier 2",
              ).length;
              return (
                <article
                  key={plan.key}
                  className="rounded-2xl border border-[#d8e5e3] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#e7f3f1] text-[#0d6664]">
                      <Icon name="database" />
                    </div>
                    <span className="rounded-full bg-[#f1f5f4] px-2.5 py-1 text-[11px] font-bold text-[#527070]">
                      {plan.region}
                    </span>
                  </div>
                  <h2 className="mt-4 text-lg font-bold tracking-tight">
                    {plan.name}
                  </h2>
                  <p className="mt-1 text-xs text-[#698080]">
                    Source updated {plan.updated}
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#eef8f4] p-3">
                      <div className="text-2xl font-semibold text-[#15735f]">
                        {preferred}
                      </div>
                      <div className="text-xs text-[#59736e]">
                        preferred / Tier 1
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#fff6e8] p-3">
                      <div className="text-2xl font-semibold text-[#9a6417]">
                        {restricted}
                      </div>
                      <div className="text-xs text-[#7b6a4f]">restricted</div>
                    </div>
                  </div>
                  <a
                    href={plan.source}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#0d6664] hover:text-[#074f4d]"
                  >
                    Open official source{" "}
                    <Icon name="external" className="h-4 w-4" />
                  </a>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="grid min-h-[580px] gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,.75fr)]">
            <div className="overflow-hidden rounded-2xl border border-[#d8e5e3] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#e4ecea] px-4 py-3 sm:px-5">
                <div>
                  <h2 className="font-bold">Medication coverage</h2>
                  <p className="text-xs text-[#6b8180]" aria-live="polite">
                    {results.length} results across {visiblePlans.length}{" "}
                    formular{visiblePlans.length === 1 ? "y" : "ies"}
                  </p>
                </div>
                <Icon name="filter" className="h-5 w-5 text-[#698281]" />
              </div>
              <div className="max-h-[760px] divide-y divide-[#e7eeed] overflow-y-auto">
                {results.map((med) => (
                  <button
                    key={med.generic}
                    onClick={() => setSelected(med)}
                    aria-pressed={activeSelected?.generic === med.generic}
                    className={`w-full px-4 py-4 text-left transition hover:bg-[#f6faf9] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#55bda8] sm:px-5 ${activeSelected?.generic === med.generic ? "bg-[#edf7f4]" : "bg-white"}`}
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 lg:max-w-[45%]">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-[15px] font-bold text-[#183839]">
                            {med.generic}
                          </h3>
                          {med.branch !== "Common primary care" && (
                            <span className="rounded-full bg-[#e9f3f1] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#3b706b]">
                              Pulmonary
                            </span>
                          )}
                        </div>
                        <p className="mt-1 truncate text-xs text-[#6b8080]">
                          {med.brands}
                        </p>
                        <p className="mt-1 text-[11px] font-medium text-[#4e7772]">
                          {med.branch}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        {visiblePlans.map((plan) => {
                          const item = med.coverage[plan.key];
                          return (
                            <span
                              key={plan.key}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[10px] font-bold ring-1 ring-inset ${toneForState(item.state)}`}
                            >
                              <span>{plan.region}</span>
                              <span className="opacity-50">·</span>
                              <span>{displayState(item.state)}</span>
                            </span>
                          );
                        })}
                        <Icon
                          name="chevron"
                          className="hidden h-5 w-5 self-center text-[#8aa09f] lg:block"
                        />
                      </div>
                    </div>
                  </button>
                ))}
                {results.length === 0 && (
                  <div className="grid min-h-64 place-items-center p-8 text-center">
                    <div>
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#edf4f3] text-[#698281]">
                        <Icon name="search" />
                      </div>
                      <h3 className="mt-3 font-bold">No matching medicine</h3>
                      <p className="mt-1 text-sm text-[#6d8181]">
                        Try a generic name, brand, condition, or therapeutic
                        area.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <aside className="order-first h-fit rounded-2xl border border-[#d8e5e3] bg-white p-5 shadow-sm xl:order-none xl:sticky xl:top-5">
              {activeSelected ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#0d6664] text-white">
                      <Icon name="lungs" />
                    </div>
                    <span className="rounded-full bg-[#eef5f3] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#446d69]">
                      {activeSelected.branch}
                    </span>
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">
                    {activeSelected.generic}
                  </h2>
                  <p className="mt-1 text-sm text-[#687e7e]">
                    {activeSelected.brands}
                  </p>
                  <p className="mt-2 text-[11px] leading-4 text-[#738786]">
                    Product-family summary. Device, strength, and brand or
                    generic status can differ.
                  </p>
                  <p className="mt-4 rounded-xl bg-[#f2f7f6] p-3 text-sm leading-5 text-[#3d5959]">
                    {activeSelected.use}
                  </p>
                  <div className="mt-5 space-y-3">
                    {visiblePlans.map((plan) => {
                      const item = activeSelected.coverage[plan.key];
                      const alternatives = alternativesFor(
                        activeSelected,
                        plan.key,
                      );
                      return (
                        <div
                          key={plan.key}
                          className="rounded-xl border border-[#e0e9e7] p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-bold">
                                {plan.name}
                              </div>
                              <div className="mt-0.5 text-[11px] text-[#738786]">
                                Effective source: {plan.updated}
                              </div>
                            </div>
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${toneForState(item.state)}`}
                            >
                              {displayState(item.state)}
                            </span>
                          </div>
                          {item.flags && item.flags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {item.flags.map((flag) => (
                                <span
                                  key={flag}
                                  title={restrictionNames[flag]}
                                  className="rounded bg-[#edf2f1] px-1.5 py-1 text-[10px] font-bold text-[#526b69]"
                                >
                                  {flag}: {restrictionNames[flag]}
                                </span>
                              ))}
                            </div>
                          )}
                          <a
                            href={plan.source}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Verify ${activeSelected.generic} in the ${plan.name} official source`}
                            className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#0d6664] hover:underline"
                          >
                            Verify source{" "}
                            <Icon name="external" className="h-3 w-3" />
                          </a>
                          <p className="mt-2 text-[11px] leading-4 text-[#536d6b]">
                            {actionForCoverage(item.state)}
                          </p>
                          {!isStraightforwardCoverage(item.state) &&
                            alternatives.length > 0 && (
                              <div className="mt-3 rounded-lg bg-[#f3f8f7] p-2.5">
                                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#466e69]">
                                  Similar covered options
                                </div>
                                <p className="mt-1 text-[10px] leading-4 text-[#718482]">
                                  Same medication branch and preferred or Tier 1
                                  on this plan. Not substitution advice.
                                </p>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {alternatives.map((alternative) => (
                                    <button
                                      key={alternative.generic}
                                      onClick={() => {
                                        setQuery("");
                                        setBranch(alternative.branch);
                                        setSelected(alternative);
                                      }}
                                      className="rounded-full bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#0d6664] ring-1 ring-[#b9d8d2] transition hover:bg-[#e5f3f0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55bda8]"
                                    >
                                      {alternative.generic}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </div>
                  <details className="mt-5 rounded-xl border border-[#dfe9e7] bg-[#f8fbfa] p-3 text-[11px] text-[#516b69]">
                    <summary className="cursor-pointer font-bold text-[#244a48]">
                      Restriction glossary
                    </summary>
                    <div className="mt-2 grid gap-1.5 sm:grid-cols-2 xl:grid-cols-1">
                      {Object.entries(restrictionNames).map(
                        ([code, meaning]) => (
                          <div key={code}>
                            <strong>{code}</strong>: {meaning}
                          </div>
                        ),
                      )}
                    </div>
                  </details>
                  <div className="mt-5 border-t border-[#e3ecea] pt-4">
                    <p className="text-[11px] leading-5 text-[#687d7d]">
                      <strong className="text-[#304f4e]">
                        Clinical use note:
                      </strong>{" "}
                      Formulary status is not a guarantee of payment. Confirm
                      strength, dosage form, member eligibility, benefit year,
                      and prior-authorization criteria before prescribing.
                    </p>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-sm text-[#6b8180]">
                  Select a medication to see plan details.
                </div>
              )}
            </aside>
          </div>
        )}

        <footer className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#d7e4e2] bg-[#e8f1ef] px-5 py-4 text-xs text-[#506b69] md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-2">
            <Icon
              name="shield"
              className="mt-0.5 h-4 w-4 shrink-0 text-[#157765]"
            />
            <p>
              <strong>Evidence-first pilot.</strong> No patient data,
              eligibility checks, or medical advice. “Not listed” does not mean
              not covered.
            </p>
          </div>
          <span className="shrink-0 font-semibold">
            Curated public PDL snapshot. Verify the exact product.
          </span>
        </footer>
      </section>
    </main>
  );
};
