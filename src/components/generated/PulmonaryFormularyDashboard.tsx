import { useEffect, useMemo, useState } from "react";
export type CoverageState =
  | "Preferred"
  | "Preferred + PA"
  | "Tier 1"
  | "Tier 1 + PA"
  | "Tier 2"
  | "Tier 2 + PA"
  | "Tier 3"
  | "Tier 4"
  | "Tier 5"
  | "Tier varies"
  | "Non-preferred"
  | "Not on PDL"
  | "Source loading"
  | "Generic"
  | "Low-cost generic"
  | "Preferred brand"
  | "Non-preferred drug"
  | "Non-formulary";
export type Restriction =
  | "PA"
  | "QL"
  | "ST"
  | "SP"
  | "CC"
  | "Age"
  | "DX2RX"
  | "RS"
  | "LD";
export type PlanKey =
  | "nyrx"
  | "njuhc"
  | "pama"
  | "horizonMarketplace"
  | "uhcCommercial"
  | "aetnaMedicareHmo"
  | "amerihealthNj"
  | "cignaNationalPreferred"
  | "oscarNjIndividual";
export type Coverage = {
  state: CoverageState;
  flags?: Restriction[];
  productNote?: string;
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
  priorAuthorizationUrl?: string;
  priorAuthorizationLabel?: string;
  priorAuthorizationDownload?: boolean;
}> = [
  {
    key: "horizonMarketplace",
    short: "Horizon NJ",
    name: "Horizon BCBSNJ Marketplace",
    region: "NJ",
    updated: "Aug 2026",
    source:
      "https://www.myprime.com/content/dam/prime/memberportal/WebDocs/2026/Formularies/HIM/2026_NJ_3T_HealthInsuranceMarketplace.pdf",
  },
  {
    key: "uhcCommercial",
    short: "UHC Commercial",
    name: "UnitedHealthcare Commercial PDL baseline",
    region: "NJ",
    updated: "May 1, 2026",
    source:
      "https://www.uhcprovider.com/content/dam/provider/docs/public/resources/pharmacy/commercial-pdl-may-2026.pdf",
    priorAuthorizationUrl:
      "https://www.optum.com/content/dam/optum3/professional-optumrx/resources/pdfs/UHCEnI/General_UHC.pdf",
    priorAuthorizationLabel: "Download PA form",
    priorAuthorizationDownload: true,
  },
  {
    key: "aetnaMedicareHmo",
    short: "Aetna HMO",
    name: "Aetna Medicare HMO formulary baseline",
    region: "NJ",
    updated: "Aug 1, 2026",
    source:
      "https://www.aetna.com/medicare/documents/individual/2026/formularies/FORM_2026_26010B29zHMO_EN.pdf",
    priorAuthorizationUrl:
      "https://www.aetna.com/content/dam/aetna/pdfs/wwwaetnamedicarecomSSL/individual/2026/appeals/Coverage_Determination_Request_Form.pdf",
    priorAuthorizationLabel: "Download PA form",
    priorAuthorizationDownload: true,
  },
  {
    key: "amerihealthNj",
    short: "AmeriHealth NJ",
    name: "AmeriHealth NJ Individual and Family",
    region: "NJ",
    updated: "Jul 1, 2026",
    source:
      "https://www.amerihealth.com/pdfs/providers/pharmacy_information/value/ah-individual-family-formulary.pdf",
    priorAuthorizationUrl:
      "https://www.amerihealth.com/resources/for-providers/policies-and-guidelines/prior-authorization.html",
    priorAuthorizationLabel: "Open PA route",
  },
  {
    key: "cignaNationalPreferred",
    short: "Cigna 3-Tier",
    name: "Cigna National Preferred 3-Tier employer formulary",
    region: "NJ",
    updated: "Jul 1, 2026",
    source:
      "https://www.cigna.com/static/www-cigna-com/docs/ifp/cigna-national-preferred-formulary-abridged.pdf",
    priorAuthorizationUrl:
      "https://v.static.cigna.com/assets/chcp/resourceLibrary/forms/prescription/commercialDrugPriorAuthorizationForms.html",
    priorAuthorizationLabel: "Open PA route",
  },
  {
    key: "oscarNjIndividual",
    short: "Oscar NJ",
    name: "Oscar NJ Individual 5-Tier standard formulary",
    region: "NJ",
    updated: "Aug 1, 2026",
    source:
      "https://www.hioscar.com/search-documents/drug-formularies/document?state=NJ&year=2026&planType=INDIVIDUAL",
    priorAuthorizationUrl: "https://provider.hioscar.com/",
    priorAuthorizationLabel: "Open Oscar PA portal (sign-in required)",
  },
];
export type SummitNjInsurer = {
  name: string;
  category: string;
  participation: "Accepted" | "Limited / provider-specific";
  note: string;
};

export type SummitNjFormularySource = {
  insurer: string;
  planScope: string;
  status:
    | "Ready for pulmonary extraction"
    | "Plan selection required"
    | "CMS plan import running";
  source: string;
  sourceLabel: string;
  detail: string;
  priorAuthorizationUrl?: string;
  priorAuthorizationLabel?: string;
};

export const summitNjFormularySources: SummitNjFormularySource[] = [
  {
    insurer: "Horizon BCBSNJ",
    planScope: "NJ Marketplace and named small-group products",
    status: "Ready for pulmonary extraction",
    source:
      "https://www.myprime.com/content/dam/prime/memberportal/WebDocs/2026/Formularies/HIM/2026_NJ_3T_HealthInsuranceMarketplace.pdf",
    sourceLabel: "August 2026 Horizon NJ drug guide",
    detail:
      "Exact named NJ Marketplace and small-group products. Pulmonary product, strength, tier and restriction rows are being loaded.",
  },
  {
    insurer: "UnitedHealthcare / Oxford",
    planScope: "NJ commercial plans with UHC pharmacy benefit",
    status: "Ready for pulmonary extraction",
    source:
      "https://www.uhcprovider.com/en/resource-library/drug-lists-pharmacy.html?CID=none",
    sourceLabel: "UHC drug-list library",
    detail:
      "Coverage varies by employer benefit and Oxford product. The official drug-list library is the source route for named plan coverage.",
    priorAuthorizationUrl:
      "https://www.optum.com/content/dam/optum3/professional-optumrx/resources/pdfs/UHCEnI/General_UHC.pdf",
  },
  {
    insurer: "UMR employer plans",
    planScope: "Employer plan and network shown on the member card",
    status: "Plan selection required",
    source: "https://www.umr.com/oss/cms/welcometoumr/prescriptionbenefits.html",
    sourceLabel: "UMR pharmacy-benefit route",
    detail:
      "UMR administers employer plans. Confirm the network on the card, then use that employer plan's UMR or Optum Rx formulary.",
  },
  {
    insurer: "Aetna",
    planScope: "2026 Aetna Medicare HMO formulary family",
    status: "Ready for pulmonary extraction",
    source:
      "https://www.aetna.com/medicare/documents/individual/2026/formularies/FORM_2026_26010B29zHMO_EN.pdf",
    sourceLabel: "August 2026 Aetna HMO drug guide",
    detail:
      "Pulmonary rows are loaded for this named HMO formulary family. Confirm the plan and county because other Aetna formularies can differ.",
  },
  {
    insurer: "Braven Health",
    planScope: "NJ Medicare Advantage plans",
    status: "CMS plan import running",
    source:
      "https://data.cms.gov/sites/default/files/2026-07/86072516-8629-44d7-9f0e-2d8877ef7fd3/2026_20260722.zip",
    sourceLabel: "CMS July 2026 plan formulary data",
    detail:
      "Exact NJ contract and plan IDs are being loaded from CMS before pulmonary coverage is shown.",
    priorAuthorizationUrl: "https://mydirectory.bravenhealth.com/",
    priorAuthorizationLabel: "Open plan documents",
  },
  {
    insurer: "UnitedHealthcare / AARP Medicare",
    planScope: "NJ Medicare Advantage and Part D plans",
    status: "CMS plan import running",
    source:
      "https://data.cms.gov/sites/default/files/2026-07/86072516-8629-44d7-9f0e-2d8877ef7fd3/2026_20260722.zip",
    sourceLabel: "CMS July 2026 plan formulary data",
    detail:
      "Exact NJ contract and plan IDs are being loaded from CMS before pulmonary coverage is shown.",
  },
  {
    insurer: "Humana",
    planScope: "NJ Medicare Advantage and Part D plans",
    status: "CMS plan import running",
    source:
      "https://data.cms.gov/sites/default/files/2026-07/86072516-8629-44d7-9f0e-2d8877ef7fd3/2026_20260722.zip",
    sourceLabel: "CMS July 2026 plan formulary data",
    detail:
      "CMS plan import is running; Humana's plan-scoped formulary API will be used for refreshes.",
    priorAuthorizationUrl:
      "https://provider.humana.com/pharmacy-resources/prior-authorizations",
    priorAuthorizationLabel: "Open PA hub",
  },
  {
    insurer: "Wellcare",
    planScope: "NJ Medicare Advantage and Part D plans",
    status: "CMS plan import running",
    source:
      "https://data.cms.gov/sites/default/files/2026-07/86072516-8629-44d7-9f0e-2d8877ef7fd3/2026_20260722.zip",
    sourceLabel: "CMS July 2026 plan formulary data",
    detail:
      "Exact NJ contract and plan IDs are being loaded from CMS before pulmonary coverage is shown.",
    priorAuthorizationUrl:
      "https://www.wellcare.com/en/New-Jersey/Providers/Medicare/Pharmacy/Coverage-Determination-Request",
    priorAuthorizationLabel: "Open PA form",
  },
  {
    insurer: "HealthSpring",
    planScope: "NJ Medicare Advantage plans",
    status: "CMS plan import running",
    source:
      "https://data.cms.gov/sites/default/files/2026-07/86072516-8629-44d7-9f0e-2d8877ef7fd3/2026_20260722.zip",
    sourceLabel: "CMS July 2026 plan formulary data",
    detail:
      "Exact NJ contract and plan IDs are being loaded from CMS before pulmonary coverage is shown.",
    priorAuthorizationUrl: "https://www.healthspring.com/providers/prior-authorization",
    priorAuthorizationLabel: "Open PA hub",
  },
  {
    insurer: "Clover Health",
    planScope: "NJ Medicare Advantage plans",
    status: "CMS plan import running",
    source:
      "https://data.cms.gov/sites/default/files/2026-07/86072516-8629-44d7-9f0e-2d8877ef7fd3/2026_20260722.zip",
    sourceLabel: "CMS July 2026 plan formulary data",
    detail:
      "Exact NJ contract and plan IDs are being loaded from CMS before pulmonary coverage is shown.",
    priorAuthorizationUrl:
      "https://cdn.cloverhealth.com/filer_public/2f/52/2f52cc48-ac8a-478a-b921-7057d3f995e3/clover-nlx_website_prior_authorization_form_final.pdf",
    priorAuthorizationLabel: "Open PA form",
  },
  {
    insurer: "Wellpoint",
    planScope: "NJ Medicare Advantage plans",
    status: "CMS plan import running",
    source:
      "https://data.cms.gov/sites/default/files/2026-07/86072516-8629-44d7-9f0e-2d8877ef7fd3/2026_20260722.zip",
    sourceLabel: "CMS July 2026 plan formulary data",
    detail:
      "Exact NJ contract and plan IDs are being loaded from CMS before pulmonary coverage is shown.",
    priorAuthorizationUrl:
      "https://www.provider.wellpoint.com/new-jersey-provider/resources/prior-authorization-requirements/prior-authorization-lookup",
    priorAuthorizationLabel: "Open PA lookup",
  },
  {
    insurer: "Cigna",
    planScope: "NJ employer and individual plans by exact drug-list type",
    status: "Plan selection required",
    source:
      "https://www.cigna.com/individuals-families/member-guide/prescription-drug-lists",
    sourceLabel: "Cigna 2026 drug-list hub",
    detail:
      "Select the employer drug-list type or individual plan before coverage is shown.",
    priorAuthorizationUrl:
      "https://v.static.cigna.com/assets/chcp/resourceLibrary/forms/prescription/commercialDrugPriorAuthorizationForms.html",
    priorAuthorizationLabel: "Open PA route",
  },
  {
    insurer: "AmeriHealth NJ",
    planScope: "NJ Individual and Family or named Value/Select formulary",
    status: "Ready for pulmonary extraction",
    source:
      "https://www.amerihealth.com/pdfs/providers/pharmacy_information/value/ah-individual-family-formulary.pdf",
    sourceLabel: "2026 NJ Individual and Family drug guide",
    detail:
      "The exact plan family matters. Individual and Family, Value and Select each use distinct formularies.",
    priorAuthorizationUrl:
      "https://www.amerihealth.com/resources/for-providers/policies-and-guidelines/prior-authorization.html",
    priorAuthorizationLabel: "Open PA route",
  },
  {
    insurer: "Oscar Health",
    planScope: "NJ commercial plans by exact member policy",
    status: "Plan selection required",
    source: "https://www.hioscar.com/formularies",
    sourceLabel: "Oscar formulary hub",
    detail:
      "Verify the member policy and plan formulary before coverage is shown.",
    priorAuthorizationUrl: "https://www.hioscar.com/clinical-guidelines/pharmacy",
    priorAuthorizationLabel: "Open PA guidance",
  },
  {
    insurer: "Empire / Anthem NY",
    planScope: "NY-origin plan selected by exact drug-list type",
    status: "Plan selection required",
    source: "https://www.anthem.com/ny/pharmacy-information/drug-list-formulary",
    sourceLabel: "Empire/Anthem NY drug-list hub",
    detail:
      "Use the state of the health plan and its named drug list, not the member's residence.",
    priorAuthorizationUrl:
      "https://providers.anthem.com/new-york-provider/resources/pharmacy-information",
    priorAuthorizationLabel: "Open PA lookup",
  },
];

export const summitNjInsurers: SummitNjInsurer[] = [
  {
    name: "1199 SEIU",
    category: "Commercial",
    participation: "Accepted",
    note: "1199 SEIU",
  },
  {
    name: "Aetna",
    category: "Commercial + Medicare Advantage",
    participation: "Accepted",
    note: "Most plans, Whole Health, Signature Solutions, Meritain and First Health commercial",
  },
  {
    name: "AmeriHealth / AmeriHealth Administrators",
    category: "Commercial",
    participation: "Accepted",
    note: "All plans",
  },
  {
    name: "Anthem BCBS",
    category: "Commercial",
    participation: "Accepted",
    note: "All plans",
  },
  {
    name: "Braven Health",
    category: "Medicare Advantage",
    participation: "Accepted",
    note: "Medicare plans",
  },
  {
    name: "Horizon BCBSNJ",
    category: "Commercial + Medicare Advantage",
    participation: "Accepted",
    note: "All plans; Braven Health Medicare Advantage",
  },
  {
    name: "Empire BCBS of NY",
    category: "Commercial",
    participation: "Accepted",
    note: "All plans; Health Plus and Pathway Medicaid excluded",
  },
  {
    name: "Centivo",
    category: "Commercial",
    participation: "Accepted",
    note: "All plans",
  },
  {
    name: "CHN / Medlogix",
    category: "Network",
    participation: "Accepted",
    note: "CHN or Medlogix",
  },
  {
    name: "Cigna",
    category: "Commercial + Medicare Advantage",
    participation: "Accepted",
    note: "All plans and Local Plus",
  },
  {
    name: "HealthSpring",
    category: "Medicare Advantage",
    participation: "Accepted",
    note: "Formerly Cigna Medicare",
  },
  {
    name: "Clover Health",
    category: "Medicare Advantage",
    participation: "Accepted",
    note: "Medicare Advantage",
  },
  {
    name: "CorVel",
    category: "Workers compensation",
    participation: "Accepted",
    note: "Workers compensation",
  },
  {
    name: "Coventry",
    category: "Workers compensation / MVA",
    participation: "Accepted",
    note: "Workers compensation and motor vehicle only",
  },
  {
    name: "Emblem Health / HIP",
    category: "Commercial + Medicare Advantage",
    participation: "Accepted",
    note: "Selected commercial, Medicare and Child Health Plus networks",
  },
  {
    name: "First Health",
    category: "Commercial + Medigap",
    participation: "Accepted",
    note: "First Health logo on card and Medigap; Medicare Advantage excluded",
  },
  {
    name: "Humana",
    category: "Commercial + Medicare",
    participation: "Accepted",
    note: "PPO, HMO and all Humana Medicare plans",
  },
  {
    name: "MagnaCare",
    category: "Commercial + workers compensation",
    participation: "Accepted",
    note: "All commercial plans and workers compensation",
  },
  {
    name: "Original Medicare",
    category: "Medicare",
    participation: "Accepted",
    note: "Traditional Medicare",
  },
  {
    name: "Railroad Medicare",
    category: "Medicare",
    participation: "Accepted",
    note: "Railroad Medicare",
  },
  {
    name: "MultiPlan / PHCS / Beech Street",
    category: "Network",
    participation: "Accepted",
    note: "All plans",
  },
  {
    name: "MVP",
    category: "Commercial",
    participation: "Accepted",
    note: "All plans",
  },
  {
    name: "NY Workers Compensation",
    category: "Workers compensation",
    participation: "Accepted",
    note: "Workers compensation",
  },
  {
    name: "Optum VA Community Care Network",
    category: "Government",
    participation: "Accepted",
    note: "VA Community Care Network",
  },
  {
    name: "Oscar Health",
    category: "ACA marketplace",
    participation: "Accepted",
    note: "NJ Individual, Family, PPO and Small Group; Medicare Advantage excluded",
  },
  {
    name: "Oxford Health",
    category: "Commercial + Medicare",
    participation: "Accepted",
    note: "Freedom, Liberty and all Medicare plans; Compass and Garden State excluded",
  },
  {
    name: "QualCare",
    category: "Commercial + workers compensation",
    participation: "Accepted",
    note: "All plans and workers compensation",
  },
  {
    name: "The Empire Plan",
    category: "Government employee",
    participation: "Accepted",
    note: "All plans except Medicaid",
  },
  {
    name: "TRICARE",
    category: "Government",
    participation: "Accepted",
    note: "All plans",
  },
  {
    name: "UnitedHealthcare",
    category: "Commercial + Medicare Advantage",
    participation: "Accepted",
    note: "Choice, Choice Plus, HMO, PPO, Navigate, AARP Medicare Complete and VA Community Care",
  },
  {
    name: "US Family Health Plan",
    category: "TRICARE Prime",
    participation: "Accepted",
    note: "US Family Health Plan - TRICARE Prime",
  },
  {
    name: "WellCare",
    category: "Medicare Advantage",
    participation: "Accepted",
    note: "Managed Medicare",
  },
  {
    name: "Wellpoint",
    category: "Medicare Advantage",
    participation: "Accepted",
    note: "All Summit NJ providers participate in listed Medicare Advantage plans",
  },
];
const c = (
  ny: CoverageState,
  nj: CoverageState,
  pa: CoverageState,
  nyFlags: Restriction[] = [],
  njFlags: Restriction[] = [],
  paFlags: Restriction[] = [],
  horizon: CoverageState = "Source loading",
  uhcCommercial: CoverageState = "Source loading",
  aetnaMedicareHmo: CoverageState = "Source loading",
  amerihealthNj: CoverageState = "Source loading",
  cignaNationalPreferred: CoverageState = "Source loading",
  oscarNjIndividual: CoverageState = "Source loading",
  horizonFlags: Restriction[] = [],
  uhcCommercialFlags: Restriction[] = [],
  aetnaMedicareHmoFlags: Restriction[] = [],
  amerihealthNjFlags: Restriction[] = [],
  cignaNationalPreferredFlags: Restriction[] = [],
  oscarNjIndividualFlags: Restriction[] = [],
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
  horizonMarketplace: {
    state: horizon,
    flags: horizonFlags,
  },
  uhcCommercial: {
    state: uhcCommercial,
    flags: uhcCommercialFlags,
  },
  aetnaMedicareHmo: {
    state: aetnaMedicareHmo,
    flags: aetnaMedicareHmoFlags,
  },
  amerihealthNj: {
    state: amerihealthNj,
    flags: amerihealthNjFlags,
  },
  cignaNationalPreferred: {
    state: cignaNationalPreferred,
    flags: cignaNationalPreferredFlags,
  },
  oscarNjIndividual: {
    state: oscarNjIndividual,
    flags: oscarNjIndividualFlags,
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
    generic: "Azithromycin",
    brands: "Zithromax, Z-Pak and generics",
    branch: "Respiratory infections",
    use: "Common bacterial respiratory infection treatment when clinically appropriate",
    coverage: c("Source loading", "Source loading", "Source loading"),
  },
  {
    generic: "Amoxicillin / clavulanate",
    brands: "Augmentin and generics",
    branch: "Respiratory infections",
    use: "Common bacterial respiratory infection treatment when clinically appropriate",
    coverage: c("Source loading", "Source loading", "Source loading"),
  },
  {
    generic: "Doxycycline",
    brands: "Vibramycin and generics",
    branch: "Respiratory infections",
    use: "Common bacterial respiratory infection treatment when clinically appropriate",
    coverage: c("Source loading", "Source loading", "Source loading"),
  },
  {
    generic: "Levofloxacin",
    brands: "Levaquin and generics",
    branch: "Respiratory infections",
    use: "Respiratory infection treatment when clinically appropriate",
    coverage: c("Source loading", "Source loading", "Source loading"),
  },
  {
    generic: "Benzonatate",
    brands: "Tessalon Perles and generics",
    branch: "Cough and mucus",
    use: "Non-opioid cough suppression",
    coverage: c("Source loading", "Source loading", "Source loading"),
  },
  {
    generic: "Guaifenesin ER",
    brands: "Mucinex and generics",
    branch: "Cough and mucus",
    use: "Expectorant for mucus clearance",
    coverage: c("Source loading", "Source loading", "Source loading"),
  },
  {
    generic: "Famotidine",
    brands: "Pepcid and generics",
    branch: "Reflux and upper airway",
    use: "Acid suppression for reflux-associated respiratory symptoms",
    coverage: c("Source loading", "Source loading", "Source loading"),
  },
  {
    generic: "Pantoprazole",
    brands: "Protonix and generics",
    branch: "Reflux and upper airway",
    use: "Acid suppression for reflux-associated respiratory symptoms",
    coverage: c("Source loading", "Source loading", "Source loading"),
  },
  {
    generic: "Epinephrine auto-injector",
    brands: "EpiPen, Auvi-Q and generics",
    branch: "Allergy and anaphylaxis",
    use: "Emergency treatment for severe allergic reaction",
    coverage: c("Source loading", "Source loading", "Source loading"),
  },
  {
    generic: "Furosemide",
    brands: "Lasix and generics",
    branch: "Pulmonary hypertension support",
    use: "Diuretic often used for fluid management when clinically appropriate",
    coverage: c("Source loading", "Source loading", "Source loading"),
  },
  {
    generic: "Apixaban",
    brands: "Eliquis",
    branch: "Pulmonary vascular",
    use: "Anticoagulant used for venous thromboembolism treatment or prevention when clinically appropriate",
    coverage: c("Source loading", "Source loading", "Source loading"),
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

const coverage = (
  state: CoverageState,
  flags: Restriction[] = [],
  productNote?: string,
): Coverage => ({ state, flags, productNote });

const planCoverageOverrides: Partial<
  Record<PlanKey, Record<string, Coverage>>
> = {
  horizonMarketplace: {
    "Albuterol HFA": coverage("Tier 1", ["QL"]),
    "Albuterol nebulizer solution": coverage("Tier 1"),
    Arformoterol: coverage("Tier 1", ["QL"]),
    Salmeterol: coverage("Tier 2", ["QL"]),
    Ipratropium: coverage("Tier 1", ["QL"]),
    "Ipratropium / albuterol": coverage("Tier 1"),
    "Tiotropium (generic capsule-inhaler)": coverage("Tier 1", ["QL"]),
    "Spiriva HandiHaler / Respimat (brand)": coverage(
      "Tier 2",
      ["QL"],
    ),
    "Incruse Ellipta (brand)": coverage("Tier 2", ["QL"]),
    "Anoro Ellipta (brand)": coverage("Tier 2", ["QL"]),
    "Tiotropium / olodaterol": coverage("Tier 2", ["QL"]),
    "Fluticasone / umeclidinium / vilanterol": coverage("Tier 2 + PA", [
      "PA",
      "QL",
    ]),
    "Budesonide / glycopyrrolate / formoterol": coverage("Tier 2 + PA", [
      "PA",
      "QL",
    ]),
    Roflumilast: coverage("Tier 1", ["QL"]),
    "Budesonide inhalation": coverage("Tier 1", ["QL"]),
    "QVAR RediHaler (brand)": coverage("Tier 2"),
    Mometasone: coverage("Tier 2", ["QL"]),
    "Advair Diskus / HFA (brand)": coverage(
      "Tier varies",
      ["QL"],
      "Advair Diskus is Tier 1; Advair HFA is Tier 2.",
    ),
    "Symbicort (brand)": coverage("Tier 1", ["QL"]),
    "Mometasone / formoterol": coverage("Tier 2", ["QL"]),
    "Fluticasone / vilanterol": coverage("Tier 2", ["QL"]),
    Montelukast: coverage("Tier 1", ["QL"]),
    Zafirlukast: coverage("Tier 1", ["QL"]),
    "Zileuton ER": coverage("Tier 1", ["QL"]),
    Dupilumab: coverage("Tier 2 + PA", ["PA", "QL", "SP", "LD"]),
    Benralizumab: coverage("Tier 2 + PA", ["PA", "QL", "SP"]),
    Mepolizumab: coverage("Tier 2 + PA", ["PA", "QL", "SP", "LD"]),
    Tezepelumab: coverage("Tier 2 + PA", ["PA", "QL", "SP", "LD"]),
    Omalizumab: coverage("Tier 2 + PA", ["PA", "SP", "LD"]),
    Nintedanib: coverage("Tier 1 + PA", ["PA", "QL", "SP", "LD"]),
    Pirfenidone: coverage(
      "Tier varies",
      ["PA", "QL", "SP", "LD"],
      "267 mg capsule and 267/801 mg tablet are Tier 1; 534 mg tablet is Tier 3.",
    ),
    Ambrisentan: coverage("Tier 1 + PA", ["PA", "QL", "SP", "LD"]),
    Bosentan: coverage("Tier 1 + PA", ["PA", "QL", "SP", "LD"]),
    "Sildenafil 20 mg": coverage("Tier 1 + PA", ["PA", "QL", "SP", "LD"]),
    "Tadalafil for PAH": coverage("Tier 1 + PA", ["PA", "QL", "SP", "LD"]),
    Selexipag: coverage("Tier 3", ["PA", "QL", "SP", "LD"]),
    Riociguat: coverage("Tier 3", ["PA", "QL", "SP", "LD"]),
    "Tobramycin inhalation": coverage(
      "Tier varies",
      ["PA", "QL", "SP", "LD"],
      "Tobi and Bethkis nebulizer solutions are Tier 1; generic and Kitabis Pak are Tier 3; Tobi Podhaler is Tier 2.",
    ),
    "Aztreonam inhalation": coverage("Tier 2 + PA", ["PA", "QL", "SP", "LD"]),
    "Dornase alfa": coverage("Tier 2", ["QL", "SP", "LD"]),
    "Elexacaftor / tezacaftor / ivacaftor": coverage("Tier 2 + PA", [
      "PA",
      "QL",
      "SP",
      "LD",
    ]),
  },
  uhcCommercial: {
    Salmeterol: coverage("Tier 2", ["QL"]),
    "Spiriva HandiHaler / Respimat (brand)": coverage("Tier 2", ["QL"]),
    "Tiotropium / olodaterol": coverage("Tier 2", ["QL"]),
    "Symbicort (brand)": coverage("Tier 3", ["QL", "RS"]),
    "Fluticasone / umeclidinium / vilanterol": coverage("Tier 3", ["QL", "RS"]),
    Tezepelumab: coverage("Tier 4", ["PA", "QL", "SP"]),
    Omalizumab: coverage("Tier 2", ["PA", "QL", "SP"]),
    "Dornase alfa": coverage("Tier 2", ["PA", "QL", "SP"]),
    "Tobramycin inhalation": coverage(
      "Tier 3",
      ["PA", "QL", "SP"],
      "Tobi Podhaler entry.",
    ),
    Nintedanib: coverage("Tier 4", ["PA", "QL", "SP"]),
    Pirfenidone: coverage("Tier 2", ["PA", "QL", "SP"]),
    Zafirlukast: coverage("Tier 1"),
  },
  aetnaMedicareHmo: {
    "Albuterol HFA": coverage("Tier 2", ["QL"]),
    "Albuterol nebulizer solution": coverage(
      "Tier 2",
      [],
      "Listed under Medicare Part B/D coverage categories.",
    ),
    Levalbuterol: coverage(
      "Tier varies",
      ["QL"],
      "Levalbuterol nebulizer is Tier 2; levalbuterol HFA is Tier 3.",
    ),
    Salmeterol: coverage("Tier 3", ["QL"]),
    Ipratropium: coverage(
      "Tier varies",
      ["QL"],
      "Ipratropium nebulizer is Tier 2; Atrovent HFA is Tier 4.",
    ),
    "Ipratropium / albuterol": coverage(
      "Tier varies",
      ["QL"],
      "DuoNeb generic is Tier 2; Combivent Respimat is Tier 4.",
    ),
    "Spiriva HandiHaler / Respimat (brand)": coverage("Tier 4", ["QL"]),
    "Incruse Ellipta (brand)": coverage("Tier 3", ["QL"]),
    "Anoro Ellipta (brand)": coverage("Tier 3", ["QL"]),
    "Fluticasone / umeclidinium / vilanterol": coverage("Tier 3", ["QL"]),
    "Budesonide / glycopyrrolate / formoterol": coverage("Tier 3", ["QL"]),
    Roflumilast: coverage("Tier 4"),
    "Budesonide inhalation": coverage(
      "Tier 4",
      [],
      "Listed under Medicare Part B/D coverage categories.",
    ),
    Ciclesonide: coverage("Tier 4", ["QL"]),
    "Advair Diskus / HFA (brand)": coverage(
      "Tier varies",
      ["QL"],
      "Fluticasone-salmeterol Diskus is Tier 2; generic Advair HFA is Tier 4.",
    ),
    "Symbicort (brand)": coverage("Tier 3", ["QL"]),
    "Mometasone / formoterol": coverage("Tier 4", ["QL"]),
    "Fluticasone / vilanterol": coverage("Tier 3", ["QL"]),
    Montelukast: coverage("Tier 1", ["QL"]),
    Benralizumab: coverage("Tier 5", ["PA", "QL", "LD"]),
    Omalizumab: coverage("Tier 5", ["PA", "LD"]),
    Nintedanib: coverage("Tier 5", ["PA", "QL", "LD"]),
    Pirfenidone: coverage("Tier 5", ["PA", "QL"]),
    "Dornase alfa": coverage("Tier 5", ["PA", "LD"]),
    "Elexacaftor / tezacaftor / ivacaftor": coverage("Tier 5", [
      "PA",
      "QL",
      "LD",
    ]),
  },
  amerihealthNj: {
    "Albuterol HFA": coverage("Generic"),
    "Albuterol nebulizer solution": coverage("Generic"),
    Levalbuterol: coverage(
      "Non-preferred drug",
      ["QL"],
      "Levalbuterol HFA is non-preferred with a quantity limit; nebulizer solution is generic.",
    ),
    Arformoterol: coverage("Generic"),
    Formoterol: coverage("Generic"),
    Salmeterol: coverage("Preferred brand"),
    Ipratropium: coverage("Generic"),
    "Ipratropium / albuterol": coverage("Generic"),
    "Tiotropium (generic capsule-inhaler)": coverage("Non-formulary"),
    "Spiriva HandiHaler / Respimat (brand)": coverage("Preferred brand"),
    "Incruse Ellipta (brand)": coverage("Non-formulary"),
    "Anoro Ellipta (brand)": coverage("Preferred brand"),
    "Tiotropium / olodaterol": coverage("Preferred brand"),
    "Fluticasone / umeclidinium / vilanterol": coverage("Preferred brand"),
    "Budesonide / glycopyrrolate / formoterol": coverage("Preferred brand"),
    Roflumilast: coverage("Generic"),
    Ensifentrine: coverage("Non-formulary", ["QL"]),
    "Budesonide inhalation": coverage("Generic"),
    "Fluticasone propionate HFA 44 mcg": coverage("Non-formulary"),
    "QVAR RediHaler (brand)": coverage("Non-formulary"),
    Ciclesonide: coverage("Non-formulary"),
    Mometasone: coverage("Non-formulary"),
    "Advair Diskus / HFA (brand)": coverage(
      "Non-formulary",
      [],
      "Advair Diskus is non-formulary; Advair HFA is preferred brand.",
    ),
    "Symbicort (brand)": coverage("Preferred brand"),
    "Mometasone / formoterol": coverage("Non-formulary"),
    "Fluticasone / vilanterol": coverage("Non-formulary"),
    Montelukast: coverage("Generic"),
    Zafirlukast: coverage("Generic"),
    "Zileuton ER": coverage("Generic", ["PA"]),
    Mepolizumab: coverage("Preferred brand", ["SP", "PA"]),
    Tezepelumab: coverage("Preferred brand", ["SP", "PA"]),
    Omalizumab: coverage("Preferred brand", ["SP", "PA"]),
    "Benzonatate": coverage("Low-cost generic"),
    "Epinephrine auto-injector": coverage("Generic", ["QL"]),
  },
  cignaNationalPreferred: {
    "Albuterol nebulizer solution": coverage("Tier 1"),
    "Ipratropium / albuterol": coverage("Tier 2", ["QL"], "Combivent Respimat entry."),
    "Spiriva HandiHaler / Respimat (brand)": coverage("Tier 2", ["QL"], "Spiriva Respimat entry."),
    "Incruse Ellipta (brand)": coverage("Tier 2", ["QL"]),
    "Anoro Ellipta (brand)": coverage("Tier 2", ["QL"]),
    "Tiotropium / olodaterol": coverage("Tier 2", ["QL"]),
    "Fluticasone / umeclidinium / vilanterol": coverage("Tier 2", ["QL"]),
    "Budesonide / glycopyrrolate / formoterol": coverage("Tier 2", ["QL"]),
    "QVAR RediHaler (brand)": coverage("Tier 2", ["QL"]),
    Mometasone: coverage("Tier 2", ["QL"]),
    "Advair Diskus / HFA (brand)": coverage("Tier 2 + PA", ["PA", "QL"], "Advair HFA entry."),
    "Symbicort (brand)": coverage("Tier 1 + PA", ["PA", "QL"], "Breyna entry; brand status can differ."),
    "Mometasone / formoterol": coverage("Tier 2 + PA", ["PA", "QL"]),
    "Fluticasone / vilanterol": coverage("Tier 2 + PA", ["PA", "QL"]),
    Montelukast: coverage("Tier 1"),
    Benralizumab: coverage("Tier 2 + PA", ["PA", "QL", "LD"]),
    Mepolizumab: coverage("Tier 2 + PA", ["PA", "QL", "LD"]),
    Tezepelumab: coverage("Tier 2 + PA", ["PA", "QL", "LD"]),
    Omalizumab: coverage("Tier 2 + PA", ["PA", "QL", "LD"]),
    "Treprostinil inhaled": coverage("Tier 2 + PA", ["PA", "LD"]),
    Selexipag: coverage("Tier 2 + PA", ["PA", "QL", "LD"]),
    Riociguat: coverage("Tier 2 + PA", ["PA", "QL", "LD"]),
  },
  oscarNjIndividual: {
    "Albuterol HFA": coverage("Tier 1", ["QL"]),
    "Albuterol nebulizer solution": coverage("Tier 1", ["QL"]),
    Levalbuterol: coverage("Tier 1", ["QL"]),
    Formoterol: coverage("Tier 2", ["QL"], "Formoterol nebulizer entry."),
    Ipratropium: coverage("Tier 1", ["QL"], "Ipratropium nebulizer entry."),
    "Ipratropium / albuterol": coverage("Tier 1", ["QL"], "Ipratropium-albuterol nebulizer entry."),
    "Spiriva HandiHaler / Respimat (brand)": coverage("Tier 2", ["QL"]),
    "Incruse Ellipta (brand)": coverage("Tier 2", ["QL"]),
    "Anoro Ellipta (brand)": coverage("Tier 2", ["QL"]),
    "Fluticasone / umeclidinium / vilanterol": coverage("Tier 2", ["QL"]),
    Roflumilast: coverage("Tier 3", ["PA"]),
    "Budesonide inhalation": coverage("Tier 1", ["QL"]),
    "QVAR RediHaler (brand)": coverage("Tier 2", ["QL"]),
    "Advair Diskus / HFA (brand)": coverage("Tier 1", ["QL"], "Generic fluticasone-salmeterol entry."),
    "Symbicort (brand)": coverage("Tier 1", ["QL"], "Generic budesonide-formoterol entry; brand status can differ."),
    "Mometasone / formoterol": coverage("Tier 2", ["QL"]),
    "Fluticasone / vilanterol": coverage("Tier 2", ["QL"]),
    Montelukast: coverage("Tier 1"),
    Zafirlukast: coverage("Tier 1"),
    "Zileuton ER": coverage("Tier 3", ["PA", "QL"]),
    Dupilumab: coverage("Tier 4", ["PA", "QL", "SP"]),
    Benralizumab: coverage("Tier 4", ["PA", "QL", "SP"]),
    Mepolizumab: coverage("Tier 4", ["PA", "QL", "SP"]),
    Tezepelumab: coverage("Tier 4", ["PA", "QL", "SP"]),
    Omalizumab: coverage("Tier 4", ["PA", "QL", "SP"]),
    Nintedanib: coverage("Tier 4", ["PA", "QL", "SP"]),
    Pirfenidone: coverage("Tier 4", ["PA", "QL", "SP"]),
    "Tobramycin inhalation": coverage("Tier 4", ["PA", "QL", "SP"], "Tobramycin nebulizer entry."),
    "Aztreonam inhalation": coverage("Tier 4", ["PA", "QL", "SP"]),
    "Elexacaftor / tezacaftor / ivacaftor": coverage("Tier 4", ["PA", "QL", "SP"]),
  },
};

export const coverageFor = (medication: Medication, plan: PlanKey): Coverage =>
  planCoverageOverrides[plan]?.[medication.generic] ?? medication.coverage[plan];

const branches = [
  "All areas",
  ...Array.from(new Set(medications.map((med) => med.branch))),
];
const toneForState = (state: CoverageState) => {
  if (
    ["Preferred", "Tier 1", "Generic", "Low-cost generic", "Preferred brand"].includes(
      state,
    )
  )
    return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (state.includes("PA") || state.startsWith("Tier"))
    return "bg-amber-50 text-amber-900 ring-amber-200";
  if (state === "Non-preferred" || state === "Non-preferred drug" || state === "Non-formulary")
    return "bg-rose-50 text-rose-800 ring-rose-200";
  return "bg-slate-100 text-slate-600 ring-slate-200";
};
const displayState = (state: CoverageState) =>
  state === "Not on PDL"
    ? "Not listed"
    : state === "Source loading"
      ? "Verifying"
      : state;
const restrictionNames: Record<Restriction, string> = {
  PA: "Prior authorization",
  QL: "Quantity limit",
  ST: "Step therapy",
  SP: "Specialty pharmacy",
  CC: "Clinical criteria",
  Age: "Age restriction",
  DX2RX: "Diagnosis-to-drug criteria",
  RS: "Refill or supply restriction",
  LD: "Limited distribution",
};
const isStraightforwardCoverage = (state: CoverageState) =>
  ["Preferred", "Tier 1", "Generic", "Low-cost generic", "Preferred brand"].includes(
    state,
  );
const actionForCoverage = (state: CoverageState) => {
  if (isStraightforwardCoverage(state))
    return "Preferred or first-tier listing. Verify the exact product and benefit.";
  if (state.includes("PA"))
    return "Review prior-authorization criteria before prescribing.";
  if (state.startsWith("Tier"))
    return "Covered on a higher tier. Check restrictions and preferred options.";
  if (state === "Tier varies")
    return "Tier differs by product or strength. Check the product detail below.";
  if (state === "Source loading")
    return "This exact plan source is being reviewed. No coverage claim is shown yet.";
  if (state === "Non-preferred")
    return "Non-preferred. Review preferred same-branch options or exception criteria.";
  if (state === "Non-preferred drug" || state === "Non-formulary")
    return "Review preferred same-branch options or the plan's PA and exception route.";
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
  const [insurerQuery, setInsurerQuery] = useState("");
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
          isStraightforwardCoverage(coverageFor(candidate, planKey).state),
      )
      .slice(0, 3);
  const summitNjDirectory = summitNjInsurers.filter((insurer) =>
    [insurer.name, insurer.category, insurer.note]
      .join(" ")
      .toLowerCase()
      .includes(insurerQuery.trim().toLowerCase()),
  );
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
          <>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Live formulary plans</h2>
                <p className="text-xs text-[#6b8180]">
                  Source-backed medication coverage available now
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#dff1ed] px-3 py-1.5 text-xs font-bold text-[#0d6664]">
                  {visiblePlans.length} live
                </span>
                <button
                  onClick={() => setView("medications")}
                  className="rounded-full bg-[#173f41] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#0d6664] focus:outline-none focus:ring-2 focus:ring-[#55bda8] focus:ring-offset-2"
                >
                  Search medicines
                </button>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {visiblePlans.map((plan) => {
                const preferred = medications.filter((med) =>
                  isStraightforwardCoverage(coverageFor(med, plan.key).state),
                ).length;
                const restricted = medications.filter(
                  (med) =>
                    coverageFor(med, plan.key).state.includes("PA") ||
                    coverageFor(med, plan.key).state === "Tier 2",
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

            <section className="mt-8 rounded-2xl border border-[#cfe0dd] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div className="max-w-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0d6664]">
                    Summit Health NJ network directory
                  </p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight">
                    Every accepted insurer and plan family
                  </h2>
                  <p className="mt-2 text-sm leading-5 text-[#607977]">
                    {summitNjInsurers.length} organizations from Summit Health’s
                    current New Jersey accepted-insurance list. These cards
                    identify network participation only. Medication coverage is
                    enabled once the exact plan formulary is sourced and
                    reviewed.
                  </p>
                </div>
                <label className="relative block w-full lg:max-w-sm">
                  <span className="sr-only">Find an accepted insurer</span>
                  <Icon
                    name="search"
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#698281]"
                  />
                  <input
                    value={insurerQuery}
                    onChange={(event) => setInsurerQuery(event.target.value)}
                    className="h-11 w-full rounded-xl border border-[#d9e7e4] bg-[#f7faf9] pl-10 pr-3 text-sm outline-none ring-2 ring-transparent focus:bg-white focus:ring-[#55bda8]"
                    placeholder="Find Aetna, Medicare, UHC..."
                  />
                </label>
              </div>
              <div className="mt-5 rounded-xl border border-[#d8e8e4] bg-[#f5faf8] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0d6664]">
                      Summit NJ pulmonary priority
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#183839]">
                      Official source routes now being converted into searchable coverage
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#446d69] ring-1 ring-[#c9ded9]">
                    No mock coverage
                  </span>
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-3">
                  {summitNjFormularySources.map((item) => (
                    <article
                      key={item.insurer}
                      className="rounded-lg border border-[#dce9e6] bg-white p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-[#183839]">
                          {item.insurer}
                        </h3>
                        <span className="shrink-0 rounded-full bg-[#eef5f3] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-[#47706b]">
                          {item.status === "CMS plan import running"
                            ? "Importing"
                            : "Source ready"}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] font-semibold text-[#3d716b]">
                        {item.planScope}
                      </p>
                      <p className="mt-2 text-[10px] leading-4 text-[#657c7a]">
                        {item.detail}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <a
                          href={item.source}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0d6664] hover:underline"
                        >
                          {item.sourceLabel}
                          <Icon name="external" className="h-3 w-3" />
                        </a>
                        {item.priorAuthorizationUrl && (
                          <a
                            href={item.priorAuthorizationUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded bg-[#eef5f3] px-2 py-1 text-[9px] font-bold text-[#0d6664]"
                          >
                            {item.priorAuthorizationLabel ?? "Open PA route"}
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {summitNjDirectory.map((insurer) => (
                  <article
                    key={insurer.name}
                    className="rounded-xl border border-[#e1ebe9] bg-[#fbfdfc] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-bold text-[#183839]">
                        {insurer.name}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${insurer.participation === "Accepted" ? "bg-[#e6f6ef] text-[#16745f]" : "bg-[#fff3dd] text-[#94621e]"}`}
                      >
                        {insurer.participation === "Accepted"
                          ? "Accepted"
                          : "Limited"}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] font-semibold text-[#3d716b]">
                      {insurer.category}
                    </p>
                    <p className="mt-2 text-[11px] leading-4 text-[#657c7a]">
                      {insurer.note}
                    </p>
                    <p className="mt-3 inline-flex rounded-full bg-[#eef3f2] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#657a78]">
                      Formulary sourcing
                    </p>
                  </article>
                ))}
              </div>
              {summitNjDirectory.length === 0 && (
                <p className="mt-5 rounded-xl bg-[#f4f8f7] p-4 text-sm text-[#607977]">
                  No insurer matches that search.
                </p>
              )}
              <p className="mt-5 border-t border-[#e3ecea] pt-4 text-[11px] leading-5 text-[#687d7d]">
                Source: Summit Health’s New Jersey accepted-insurance list, last
                updated April 20, 2026. Participation can vary by exact
                location, provider, network, and plan.
              </p>
            </section>
          </>
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
                          const item = coverageFor(med, plan.key);
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
                      const item = coverageFor(activeSelected, plan.key);
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
                          {item.productNote && (
                            <p className="mt-2 rounded-md bg-[#f5f8f7] px-2 py-1.5 text-[10px] leading-4 text-[#536d6b]">
                              {item.productNote}
                            </p>
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
                            plan.priorAuthorizationUrl && (
                              <a
                                href={
                                  plan.priorAuthorizationDownload
                                    ? `/api/pa-form/${plan.key}`
                                    : plan.priorAuthorizationUrl
                                }
                                target={
                                  plan.priorAuthorizationDownload
                                    ? undefined
                                    : "_blank"
                                }
                                rel={
                                  plan.priorAuthorizationDownload
                                    ? undefined
                                    : "noreferrer"
                                }
                                download={
                                  plan.priorAuthorizationDownload || undefined
                                }
                                className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#eef5f3] px-2 py-1.5 text-[10px] font-bold text-[#0d6664] ring-1 ring-[#c7ded9] hover:bg-[#dff1ed]"
                              >
                                {plan.priorAuthorizationLabel ?? "Open PA route"}
                                <Icon name="external" className="h-3 w-3" />
                              </a>
                            )}
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
                        Quick-check note:
                      </strong>{" "}
                      Coverage can differ by product, strength, device, benefit
                      year, and member plan. Use the linked source or PA route
                      for the final check.
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
