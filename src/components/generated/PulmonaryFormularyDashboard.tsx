import { useEffect, useMemo, useRef, useState } from "react";
import {
  commercialPlanRoutes,
  generalPdlReferenceKeys,
  pharmacyBenefitSuggestions,
  planNameSuggestions,
  plans,
  primaryNjPlans,
  referencePlans,
  type PlanKey,
} from "./formularyPlanRegistry";
export type CoverageState =
  | "Preferred"
  | "Preferred + PA"
  | "Tier 0"
  | "Tier 1"
  | "Tier 1 + PA"
  | "Tier 1A"
  | "Tier 1B"
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
  | "Listed in PDL"
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
export type Coverage = {
  state: CoverageState;
  flags?: Restriction[];
  productNote?: string;
  priorAuthorizationUrl?: string;
  priorAuthorizationLabel?: string;
};
export type Medication = {
  generic: string;
  brands: string;
  branch: string;
  use: string;
  productDetails?: string;
  coverage: Partial<Record<PlanKey, Coverage>>;
};
export type SummitNjInsurer = {
  name: string;
  category: string;
  participation: "Accepted" | "Limited / provider-specific";
  note: string;
};

type PlanIntake = {
  insurer: string;
  planKind: string;
  planName: string;
  pharmacyBenefit: string;
};

const planKinds = [
  "Commercial / employer",
  "ACA marketplace / individual",
  "Medicare Advantage",
  "Standalone Medicare Part D (Original / Railroad Medicare)",
  "Medicaid / public coverage",
  "Government / military",
  "Workers' compensation / MVA",
  "Network or administrator",
];

const planKindsForInsurer = (insurerName: string) => {
  const insurer = summitNjInsurers.find((candidate) => candidate.name === insurerName);
  if (!insurer) return planKinds;
  const category = insurer.category.toLowerCase();
  if (insurer.name === "Original Medicare" || insurer.name === "Railroad Medicare") {
    return ["Standalone Medicare Part D (Original / Railroad Medicare)"];
  }
  if (insurer.name === "Aetna") {
    return [
      "Commercial / employer",
      "Medicare Advantage",
      "Standalone Medicare Part D (Original / Railroad Medicare)",
      "Medicaid / public coverage",
    ];
  }
  if (insurer.name === "UnitedHealthcare") {
    return [
      "Commercial / employer",
      "ACA marketplace / individual",
      "Medicare Advantage",
      "Standalone Medicare Part D (Original / Railroad Medicare)",
      "Medicaid / public coverage",
      "Government / military",
    ];
  }
  if (insurer.name === "WellCare" || insurer.name === "Humana") {
    return ["Medicare Advantage", "Standalone Medicare Part D (Original / Railroad Medicare)"];
  }
  if (insurer.name === "Wellpoint") {
    return ["Medicaid / public coverage", "Medicare Advantage"];
  }
  if (insurer.name === "Fidelis Care") return ["Medicaid / public coverage"];
  if (insurer.name === "Horizon NJ Health") return ["Medicaid / public coverage"];
  if (insurer.name === "Oxford Health") {
    return ["Commercial / employer", "Medicare Advantage"];
  }
  if (insurer.name === "AmeriHealth / AmeriHealth Administrators" || insurer.name === "Anthem BCBS") {
    return ["Commercial / employer", "ACA marketplace / individual"];
  }
  if (insurer.name === "Horizon BCBSNJ") {
    return ["Commercial / employer", "ACA marketplace / individual", "Medicare Advantage"];
  }
  if (insurer.name === "Oscar Health") return ["ACA marketplace / individual", "Commercial / employer"];
  if (insurer.name === "Ambetter from WellCare NJ") return ["ACA marketplace / individual"];
  if (category.includes("workers compensation")) return ["Workers' compensation / MVA"];
  if (category.includes("network")) return ["Network or administrator"];
  if (category.includes("government employee") || category === "government" || category.includes("tricare")) {
    return ["Government / military"];
  }
  if (category.includes("medicare") && !category.includes("commercial")) {
    return ["Medicare Advantage"];
  }
  if (category.includes("commercial") && category.includes("medicare")) {
    return ["Commercial / employer", "Medicare Advantage"];
  }
  if (category.includes("commercial")) return ["Commercial / employer"];
  return planKinds;
};

const planNameOptionsFor = (insurerName: string, planKind: string) => {
  const names = new Set(
    referencePlans
      .filter(
        (plan) =>
          importedPlanOwners[plan.key]?.includes(insurerName) &&
          importedPlanKinds[plan.key]?.includes(planKind),
      )
      .flatMap((plan) => [plan.short, plan.name]),
  );
  if (insurerName === "Horizon BCBSNJ" && planKind === "ACA marketplace / individual") {
    [
      "Direct Access Silver HSA 100/70/60 BlueCard",
      "Direct Access Gold 100/80/60 BlueCard",
      "Direct Access 100/70 BlueCard",
      "Horizon Marketplace formulary",
    ].forEach((name) => names.add(name));
  }
  if (insurerName === "UnitedHealthcare" && planKind === "Medicaid / public coverage") {
    ["UHC Community Plan NJ", "UnitedHealthcare Community Plan of New Jersey"].forEach((name) => names.add(name));
  }
  if (insurerName === "UnitedHealthcare" && planKind === "Commercial / employer") {
    ["UnitedHealthcare Commercial PDL baseline", "UHC Commercial"].forEach((name) => names.add(name));
  }
  if (insurerName === "Oxford Health" && planKind === "Commercial / employer") {
    ["Oxford Freedom Network commercial PDL baseline", "Oxford Freedom"].forEach((name) => names.add(name));
  }
  if (insurerName === "Aetna" && ["Commercial / employer", "ACA marketplace / individual"].includes(planKind)) {
    ["Advanced Control Plan", "Aetna Health Exchange Plan", "Standard Opt-Out Plan"].forEach((name) => names.add(name));
  }
  if (insurerName === "Cigna" && planKind === "Commercial / employer") {
    ["Cigna National Preferred 3-Tier employer formulary", "Cigna 3-Tier"].forEach((name) => names.add(name));
  }
  if (insurerName === "AmeriHealth / AmeriHealth Administrators") {
    if (planKind === "ACA marketplace / individual") names.add("AmeriHealth NJ Individual and Family");
    if (planKind === "Commercial / employer") {
      ["AmeriHealth New Jersey Value Formulary", "AmeriHealth New Jersey Select Formulary"].forEach((name) => names.add(name));
    }
  }
  if (insurerName === "Fidelis Care" && planKind === "Medicaid / public coverage") {
    ["Fidelis Care NJ FamilyCare", "Fidelis Care New Jersey FamilyCare", "Fidelis / WellCare NJ FamilyCare PDL"].forEach((name) => names.add(name));
  }
  if (insurerName === "Horizon NJ Health" && planKind === "Medicaid / public coverage") {
    names.add("Horizon NJ Health NJ FamilyCare");
  }
  if (insurerName === "Wellpoint" && planKind === "Medicaid / public coverage") {
    names.add("Wellpoint New Jersey FamilyCare PDL");
  }
  return Array.from(names).sort();
};

const pharmacyBenefitOptionsFor = (insurerName: string, planKind: string) => {
  const options = new Set<string>();
  if (!insurerName) return pharmacyBenefitSuggestions;
  if (insurerName === "Horizon BCBSNJ") {
    options.add(planKind === "ACA marketplace / individual" ? "Marketplace 3-Tier" : "Prime Therapeutics");
  }
  if (insurerName === "UnitedHealthcare" || insurerName === "Oxford Health") {
    options.add("Optum Rx");
    options.add("Commercial PDL");
    if (planKind === "Medicaid / public coverage") options.add("NJ Community Plan PDL");
  }
  if (insurerName === "Aetna") {
    options.add(planKind === "Medicaid / public coverage" ? "NJ FamilyCare" : "Aetna pharmacy benefit");
  }
  if (insurerName === "Wellpoint" && planKind === "Medicaid / public coverage") options.add("NJ FamilyCare PDL");
  if (insurerName === "Fidelis Care" && planKind === "Medicaid / public coverage") options.add("NJ FamilyCare PDL");
  if (insurerName === "Horizon NJ Health" && planKind === "Medicaid / public coverage") options.add("Horizon NJ Health pharmacy benefit");
  if (insurerName === "AmeriHealth / AmeriHealth Administrators") {
    options.add("Individual & Family");
    options.add("Value");
    options.add("Select");
  }
  if (insurerName === "Cigna") {
    options.add("National Preferred");
    options.add("Standard");
    options.add("Value");
    options.add("Performance");
    options.add("Advantage");
  }
  if (insurerName === "Anthem BCBS") options.add("Confirm state and exact Anthem drug list");
  if (insurerName === "Oscar Health") options.add("Oscar formulary");
  if (insurerName === "Ambetter from WellCare NJ") options.add("Ambetter NJ 2026 Formulary");
  if (planKind === "Medicare Advantage" || planKind === "Standalone Medicare Part D (Original / Railroad Medicare)") {
    options.add("Medicare formulary");
  }
  return options.size ? Array.from(options).sort() : ["Plan pharmacy label from card"];
};

export type SummitNjFormularySource = {
  insurer: string;
  planScope: string;
  status:
    | "Ready for pulmonary extraction"
    | "Pulmonary formulary loaded"
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
    status: "Pulmonary formulary loaded",
    source:
      "https://www.myprime.com/content/dam/prime/memberportal/WebDocs/2026/Formularies/HIM/2026_NJ_3T_HealthInsuranceMarketplace.pdf",
    sourceLabel: "August 2026 Horizon NJ drug guide",
    detail:
      "Pulmonary formulary rows are available in the portal for this Marketplace formulary family. Do not use them for other Horizon commercial or Medicaid products.",
  },
  {
    insurer: "Horizon BCBSNJ Classic",
    planScope: "NJ commercial plans whose pharmacy benefit is explicitly Horizon Classic",
    status: "Pulmonary formulary loaded",
    source:
      "https://www.myprime.com/content/dam/prime/memberportal/WebDocs/2026/Formularies/Commercial/5517-L_Horizon_Classic.pdf",
    sourceLabel: "July 2026 Horizon Classic Formulary",
    detail:
      "This quarterly Classic drug list is a source-backed baseline only when the card or benefits document confirms the Horizon Classic pharmacy benefit. Direct Access is not automatically Classic.",
    priorAuthorizationUrl: "https://www.horizonblue.com/providers/pharmacy",
    priorAuthorizationLabel: "Open Horizon pharmacy PA route",
  },
  {
    insurer: "Ambetter from WellCare NJ",
    planScope: "NJ Marketplace individual plans",
    status: "Pulmonary formulary loaded",
    source:
      "https://www.ambetterhealth.com/content/dam/centene/new-jersey/ambetter/pdf/2026-nj-formulary.pdf",
    sourceLabel: "Ambetter NJ 2026 Formulary",
    detail:
      "Exact pulmonary catalog rows are mapped from the current Ambetter NJ formulary. Confirm the member's product, strength, device, and plan benefit before acting on the result.",
    priorAuthorizationUrl:
      "https://www.ambetterhealth.com/en/nj/provider-resources/pharmacy/",
    priorAuthorizationLabel: "Open Ambetter pharmacy resources",
  },
  {
    insurer: "UnitedHealthcare / Oxford",
    planScope: "NJ commercial plans with UHC pharmacy benefit",
    status: "Pulmonary formulary loaded",
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
    planScope: "NJ Medicare Advantage and standalone Part D plans",
    status: "CMS plan import running",
    source:
      "https://data.cms.gov/sites/default/files/2026-07/86072516-8629-44d7-9f0e-2d8877ef7fd3/2026_20260722.zip",
    sourceLabel: "CMS July 2026 plan formulary data",
    detail:
      "Exact NJ contract and plan IDs are being loaded from CMS before pulmonary coverage is shown.",
  },
  {
    insurer: "Humana",
    planScope: "NJ Medicare Advantage and standalone Part D plans",
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
    planScope: "NJ Medicare Advantage and standalone Part D plans",
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
      "Pulmonary formulary rows are available in the portal for the Individual and Family formulary family. Value, Select, employer, and Medicare products remain separate.",
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
    name: "Horizon NJ Health",
    category: "Medicaid / public coverage",
    participation: "Accepted",
    note: "NJ FamilyCare Medicaid MCO",
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
    name: "Ambetter from WellCare NJ",
    category: "ACA marketplace",
    participation: "Accepted",
    note: "Ambetter Marketplace plans for New Jersey",
  },
  {
    name: "Wellpoint",
    category: "Medicare Advantage",
    participation: "Accepted",
    note: "All Summit NJ providers participate in listed Medicare Advantage plans",
  },
  {
    name: "Fidelis Care",
    category: "Medicaid / public coverage",
    participation: "Accepted",
    note: "NJ FamilyCare Medicaid",
  },
];

type ClinicalWorkflow = {
  kind: string;
  cardCheck: string;
  steps: string[];
  resultRule: string;
  source?: { label: string; url: string };
  cardAction?: string;
  baseline?: PlanKey;
  exactMedicare?: boolean;
};

type PlanIntakeMatch =
  | { kind: "imported"; plan: (typeof plans)[number] }
  | { kind: "medicare" }
  | { kind: "uhc-nj-marketplace" }
  | { kind: "aetna-nj-familycare" }
  | { kind: "uhc-nj-community" }
  | { kind: "fidelis-nj-familycare" }
  | { kind: "horizon-nj-health" }
  | { kind: "wellpoint-nj-familycare" }
  | { kind: "horizon-nj-marketplace" }
  | { kind: "horizon-classic" }
  | { kind: "amerihealth-nj-individual" }
  | { kind: "aetna-commercial-variant" }
  | { kind: "anthem-nj-mismatch" }
  | { kind: "anthem-ny-select" }
  | { kind: "uhc-commercial" }
  | { kind: "oxford-freedom" }
  | { kind: "cigna-national-preferred" }
  | { kind: "out-of-scope" }
  | { kind: "unconfirmed" };

type UhcNjQhpPlan = {
  planId: string;
  marketingName: string;
  years: number[];
  lastUpdatedOn: string | null;
  drugTiers: string[];
};

type UhcNjQhpDrug = {
  rxcui: string;
  drugName: string;
  planCount: number;
};

type UhcNjQhpCoverage = {
  status: "confirmed" | "unconfirmed" | "error";
  covered: true | null;
  reason: string | null;
  plan?: UhcNjQhpPlan;
  drug?: { rxcui: string; drugName: string };
  coverage?: Array<{
    drugTier: string;
    priorAuthorization: boolean | null;
    stepTherapy: boolean | null;
    quantityLimit: boolean | null;
  }>;
  source?: { drugs?: { sourceDate?: string | null }; cacheStatus?: string };
};

type AetnaNjFamilyCareSuggestion = {
  drugName: string;
  ndcCount: number;
  ndcs: string[];
};

type AetnaNjFamilyCareCoverage = {
  status: "listed" | "not-listed-in-source" | "error";
  listed: true | null;
  ndc?: string;
  notice?: string;
  matches?: Array<{
    ndc: string;
    drugName: string;
    drugTier: string;
    priorAuthorization: boolean;
    stepTherapy: boolean;
    quantityLimit: boolean;
    otc: boolean;
  }>;
  source?: { effectiveDate?: string };
};

type UhcNjCommunityDrug = {
  rxcui: string;
  drugName: string;
  tier: string;
  priorAuthorization: boolean;
  stepTherapy: boolean;
  quantityLimit: boolean;
};

type UhcNjCommunityCoverage = {
  status: "listed" | "not-listed-in-source" | "error";
  listed: true | null;
  drug?: UhcNjCommunityDrug | null;
  source?: { sourceLastModified?: string | null };
};

type FidelisNjFamilyCareDrug = {
  id: string;
  name: string;
  aliases: string[];
  tier: "P" | "NF";
  priorAuthorization: boolean;
  stepTherapy: boolean;
  quantityLimit: boolean;
  ageLimit: boolean;
  quantityText?: string;
  ageText?: string;
  note?: string;
};

type FidelisNjFamilyCareCoverage = {
  status: "listed" | "not-listed-in-source" | "error";
  listed: true | null;
  drug?: FidelisNjFamilyCareDrug | null;
  notice?: string;
};

type HorizonNjHealthDrug = {
  id: string;
  name: string;
  aliases: string[];
  priorAuthorization: boolean;
  limitations: boolean;
  note?: string;
};

type HorizonNjHealthCoverage = {
  status: "listed" | "not-listed-in-source" | "error";
  listed: true | null;
  drug?: HorizonNjHealthDrug | null;
  notice?: string;
};

type WellpointNjFamilyCareDrug = {
  id: string;
  name: string;
  aliases: string[];
  tier: "Preferred" | "Non-Preferred";
  priorAuthorization: boolean;
  quantityLimit: boolean;
  stepTherapy: boolean;
  specialtyPharmacy: boolean;
  ageLimit: boolean;
  note?: string;
};

type WellpointNjFamilyCareCoverage = {
  status: "listed" | "not-listed-in-source" | "error";
  listed: true | null;
  drug?: WellpointNjFamilyCareDrug | null;
  notice?: string;
};

const normalizedPlanText = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const needsProductCorrectionHint = (query: string, productNames: string[]) => {
  const queryTokens = normalizedPlanText(query).split(" ").filter(Boolean);
  if (!queryTokens.length || !productNames.length) return false;
  return !productNames.some((productName) => {
    const productTokens = normalizedPlanText(productName).split(" ").filter(Boolean);
    return queryTokens.every((queryToken) =>
      productTokens.some((productToken) => productToken.startsWith(queryToken)),
    );
  });
};

const editDistance = (left: string, right: string) => {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let diagonal = previous[0];
    previous[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const saved = previous[rightIndex];
      previous[rightIndex] = Math.min(
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + 1,
        diagonal + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
      diagonal = saved;
    }
  }
  return previous[right.length];
};

const medicationSuggestionScore = (query: string, medication: Medication) => {
  const needle = normalizedPlanText(query);
  const name = normalizedPlanText(`${medication.generic} ${medication.brands} ${medication.productDetails ?? ""}`);
  if (!needle) return 0;
  if (name.includes(needle)) return 0;
  const nameTokens = name.split(" ").filter(Boolean);
  const queryTokens = needle.split(" ").filter(Boolean);
  let score = 0;
  for (const queryToken of queryTokens) {
    const best = Math.min(...nameTokens.map((nameToken) => nameToken.startsWith(queryToken) ? 0 : editDistance(queryToken, nameToken)));
    if (best > Math.max(1, Math.floor(queryToken.length / 3))) return Number.POSITIVE_INFINITY;
    score += best;
  }
  return score;
};

const importedPlanOwners: Partial<Record<PlanKey, string[]>> = {
  horizonMarketplace: ["Horizon BCBSNJ"],
  ambetterNjMarketplace: ["Ambetter from WellCare NJ"],
  uhcCommercial: ["UnitedHealthcare"],
  oxfordFreedom: ["Oxford Health"],
  aetnaMedicareHmo: ["Aetna"],
  amerihealthNj: ["AmeriHealth / AmeriHealth Administrators"],
  amerihealthValue: ["AmeriHealth / AmeriHealth Administrators"],
  amerihealthSelect: ["AmeriHealth / AmeriHealth Administrators"],
  cignaNationalPreferred: ["Cigna"],
  horizonClassic: ["Horizon BCBSNJ"],
  oscarNjIndividual: ["Oscar Health"],
  anthemNySelect: ["Anthem BCBS"],
  wellcareNjH0913: ["WellCare"],
  humanaNj26408: ["Humana"],
  bravenNjH0885: ["Braven Health"],
  healthspringNj26096: ["HealthSpring"],
  cloverNj2026: ["Clover Health"],
  wellpointNjFamilyCare: ["Wellpoint"],
};

const importedPlanKinds: Partial<Record<PlanKey, string[]>> = {
  horizonMarketplace: ["ACA marketplace / individual"],
  ambetterNjMarketplace: ["ACA marketplace / individual"],
  uhcCommercial: ["Commercial / employer"],
  oxfordFreedom: ["Commercial / employer"],
  aetnaMedicareHmo: ["Medicare Advantage"],
  amerihealthNj: ["ACA marketplace / individual"],
  amerihealthValue: ["Commercial / employer"],
  amerihealthSelect: ["Commercial / employer"],
  cignaNationalPreferred: ["Commercial / employer"],
  horizonClassic: ["Commercial / employer"],
  oscarNjIndividual: ["ACA marketplace / individual"],
  anthemNySelect: ["ACA marketplace / individual"],
  wellcareNjH0913: ["Medicare Advantage"],
  humanaNj26408: ["Medicare Advantage"],
  bravenNjH0885: ["Medicare Advantage"],
  healthspringNj26096: ["Medicare Advantage"],
  cloverNj2026: ["Medicare Advantage"],
  wellpointNjFamilyCare: ["Medicaid / public coverage"],
};

const planIntakeMatchFor = (intake: PlanIntake): PlanIntakeMatch => {
  if (
    intake.planKind === "Medicare Advantage" ||
    intake.planKind === "Standalone Medicare Part D (Original / Railroad Medicare)" ||
    ["Original Medicare", "Railroad Medicare"].includes(intake.insurer)
  )
    return { kind: "medicare" };
  const normalizedName = normalizedPlanText(intake.planName);
  if (
    intake.insurer === "Anthem BCBS" &&
    ["Commercial / employer", "ACA marketplace / individual"].includes(intake.planKind)
  )
    return { kind: "anthem-nj-mismatch" };
  if (
    intake.insurer === "UnitedHealthcare" &&
    intake.planKind === "ACA marketplace / individual"
  )
    return { kind: "uhc-nj-marketplace" };
  if (
    intake.insurer === "Aetna" &&
    intake.planKind === "Medicaid / public coverage"
  )
    return { kind: "aetna-nj-familycare" };
  if (
    intake.insurer === "Aetna" &&
    ["Commercial / employer", "ACA marketplace / individual"].includes(intake.planKind) &&
    ["Advanced Control Plan", "Aetna Health Exchange Plan", "Standard Opt-Out Plan"].includes(intake.planName.trim())
  )
    return { kind: "aetna-commercial-variant" };
  if (
    intake.insurer === "Fidelis Care" &&
    intake.planKind === "Medicaid / public coverage" &&
    ["Fidelis Care NJ FamilyCare", "Fidelis Care New Jersey FamilyCare", "Fidelis / WellCare NJ FamilyCare PDL"].includes(intake.planName.trim())
  )
    return { kind: "fidelis-nj-familycare" };
  if (
    intake.insurer === "UnitedHealthcare" &&
    intake.planKind === "Medicaid / public coverage" &&
    ["UHC Community Plan NJ", "UnitedHealthcare Community Plan of New Jersey", "UHC Community Plan of NJ"].includes(intake.planName.trim())
  )
    return { kind: "uhc-nj-community" };
  if (
    intake.insurer === "Horizon NJ Health" &&
    intake.planKind === "Medicaid / public coverage" &&
    ["Horizon NJ Health NJ FamilyCare", "Horizon NJ Health Medicaid", "Horizon NJ Health formulary"].includes(intake.planName.trim())
  )
    return { kind: "horizon-nj-health" };
  if (
    intake.insurer === "Wellpoint" &&
    intake.planKind === "Medicaid / public coverage" &&
    ["Wellpoint New Jersey FamilyCare PDL", "Wellpoint NJ FamilyCare", "Wellpoint Medicaid PDL"].includes(intake.planName.trim())
  )
    return { kind: "wellpoint-nj-familycare" };
  if (
    intake.insurer === "Horizon BCBSNJ" &&
    intake.planKind === "ACA marketplace / individual"
  )
    return { kind: "horizon-nj-marketplace" };
  if (
    intake.insurer === "Horizon BCBSNJ" &&
    intake.planKind === "Commercial / employer" &&
    ["horizon classic formulary", "horizon classic"].includes(normalizedName)
  )
    return { kind: "horizon-classic" };
  if (
    intake.insurer === "AmeriHealth / AmeriHealth Administrators" &&
    intake.planKind === "ACA marketplace / individual"
  )
    return { kind: "amerihealth-nj-individual" };
  const importedMatches = referencePlans.filter((plan) =>
    importedPlanOwners[plan.key]?.includes(intake.insurer) &&
    importedPlanKinds[plan.key]?.includes(intake.planKind) &&
    [plan.name, plan.short].some((name) => normalizedPlanText(name) === normalizedName),
  );
  if (importedMatches.length === 1)
    return generalPdlReferenceKeys.has(importedMatches[0].key)
      ? importedMatches[0].key === "uhcCommercial"
        ? { kind: "uhc-commercial" }
        : importedMatches[0].key === "oxfordFreedom"
          ? { kind: "oxford-freedom" }
          : { kind: "cigna-national-preferred" }
      : { kind: "imported", plan: importedMatches[0] };
  if (
    normalizedName &&
    ["Medicare Advantage", "Standalone Medicare Part D (Original / Railroad Medicare)"].includes(
      intake.planKind,
    )
  )
    return { kind: "medicare" };
  return { kind: "unconfirmed" };
};

const commercialRouteFor = (name: string) => {
  if (name.includes("Horizon")) return commercialPlanRoutes[0];
  if (name.includes("UnitedHealthcare") || name.includes("Oxford"))
    return commercialPlanRoutes[1];
  if (name.includes("Aetna")) return commercialPlanRoutes[2];
  if (name.includes("Cigna")) return commercialPlanRoutes[3];
  if (name.includes("AmeriHealth")) return commercialPlanRoutes[4];
  if (name.includes("Oscar")) return commercialPlanRoutes[5];
  return undefined;
};

const clinicalWorkflowFor = (insurer: SummitNjInsurer): ClinicalWorkflow => {
  const name = insurer.name;
  const lowerName = name.toLowerCase();
  const commercialRoute = commercialRouteFor(name);
  const sourceMatch = summitNjFormularySources.find((source) => {
    const sourceName = source.insurer.toLowerCase();
    const insurerName = lowerName;
    return (
      sourceName.includes(insurerName) ||
      insurerName.includes(sourceName) ||
      ((name === "Anthem BCBS" || name === "Empire BCBS of NY") &&
        source.insurer === "Empire / Anthem NY")
    );
  });
  const source = commercialRoute
    ? { label: commercialRoute.action, url: commercialRoute.url }
    : sourceMatch
      ? { label: sourceMatch.sourceLabel, url: sourceMatch.source }
      : undefined;

  if (
    [
      "Braven Health",
      "HealthSpring",
      "Clover Health",
      "WellCare",
      "Wellpoint",
    ].includes(name)
  ) {
    return {
      kind: "Medicare Advantage",
      cardCheck: "Carrier plus exact plan name or contract-plan ID. Do not use the member ID.",
      steps: [
        "Confirm the card says Medicare Advantage and read the plan name or ID.",
        "Select that exact plan in the Medicare finder.",
        "Match the medication's device, strength, and NDC before acting on a CMS candidate row.",
      ],
      resultRule:
        "Only the selected CMS plan can produce a plan-level result. A missing product match is unconfirmed, not a denial.",
      source,
      exactMedicare: true,
    };
  }

  if (name === "Fidelis Care") {
    return {
      kind: "NJ FamilyCare Medicaid",
      cardCheck: "Fidelis Care or WellCare NJ FamilyCare card and the exact pharmacy benefit.",
      steps: [
        "Confirm the member is enrolled in Fidelis Care NJ FamilyCare Medicaid.",
        "Choose the Fidelis Care NJ FamilyCare PDL workflow in this portal.",
        "Select the exact medication product and review the published tier and restrictions.",
      ],
      resultRule:
        "The portal shows listed products from the current Fidelis NJ FamilyCare PDL. An omitted product is unconfirmed, not a denial.",
      source: {
        label: "Fidelis NJ FamilyCare 2026 PDL",
        url: "https://www.fideliscarenj.com/content/dam/centene/wellcare/nj/pdfs/pdls/NJ_Caid_Preferred_Drug_List_2026_Eng_Spa_R.pdf",
      },
    };
  }

  if (name === "Original Medicare" || name === "Railroad Medicare") {
    return {
      kind: "Original or Railroad Medicare with standalone Part D",
      cardCheck: "Use the separate prescription-drug plan card. The red-white-blue Medicare card does not identify the Part D plan.",
      steps: [
        "Find the patient's separate Part D prescription-drug plan card.",
        "Enter the carrier, exact plan name, or S-contract and plan ID in the Medicare finder.",
        "Select the exact standalone Part D plan before checking a medication.",
      ],
      resultRule:
        "A missing plan or product match is unconfirmed, not a denial. Original or Railroad Medicare alone does not determine outpatient drug coverage.",
      cardAction:
        "If there is no separate Part D card, confirm the prescription plan with the patient or the clinic's established benefits-verification process.",
      exactMedicare: true,
    };
  }

  if (
    ["CorVel", "Coventry", "NY Workers Compensation"].includes(name)
  ) {
    return {
      kind: "Workers' compensation or motor-vehicle claim",
      cardCheck: "Claim administrator, claim instructions, and the authorized pharmacy benefit. Do not record claim numbers here.",
      steps: [
        "Confirm the visit and prescription are authorized under the injury claim.",
        "Use the claim administrator's pharmacy channel or written pharmacy instructions.",
        "Escalate to the adjuster or authorized pharmacy contact when the medicine is not listed.",
      ],
      resultRule:
        "A general medical network does not establish pharmacy authorization for a workers' compensation or MVA claim.",
    };
  }

  if (
    [
      "CHN / Medlogix",
      "MultiPlan / PHCS / Beech Street",
      "MagnaCare",
      "QualCare",
      "Centivo",
      "First Health",
    ].includes(name)
  ) {
    return {
      kind: "Network or plan administrator",
      cardCheck: "The underlying insurer and pharmacy-benefit manager, not only the network logo.",
      steps: [
        "Read the pharmacy-benefit or PBM name from the card or benefits document.",
        "Use the underlying payer's exact drug list or member/provider pharmacy route.",
        "If the card only identifies a network, call the pharmacy-benefit number before beginning prior authorization.",
      ],
      resultRule:
        "Network participation is not medication coverage and cannot be used as a formulary match.",
    };
  }

  if (name === "Optum VA Community Care Network") {
    return {
      kind: "VA Community Care",
      cardCheck: "VA authorization and the pharmacy instructions for this episode of care.",
      steps: [
        "Confirm Community Care authorization before treating this as a VA-covered pharmacy request.",
        "Use the VA-directed pharmacy channel or the authorization contact, not a commercial payer baseline.",
        "Escalate missing authorization or medication routing to the VA Community Care contact.",
      ],
      resultRule:
        "Community Care network participation does not establish outpatient pharmacy coverage.",
    };
  }

  if (name === "TRICARE" || name === "US Family Health Plan") {
    return {
      kind: "Military health plan",
      cardCheck: "Plan variant and the prescription-benefit routing shown on the card.",
      steps: [
        "Confirm whether the card is TRICARE or US Family Health Plan and identify its pharmacy route.",
        "Use that plan's current drug list and prior-authorization process.",
        "Do not substitute a commercial, Medicare, or network formulary for this benefit.",
      ],
      resultRule:
        "Coverage depends on the named military health plan and pharmacy route, not the network label alone.",
    };
  }

  if (name === "The Empire Plan") {
    return {
      kind: "New York government employee plan",
      cardCheck: "The Empire Plan pharmacy-benefit information and current drug-list year.",
      steps: [
        "Confirm the card identifies The Empire Plan, not a different Empire or Anthem product.",
        "Use its current pharmacy benefit and drug list.",
        "Verify product, device, strength, and restriction before beginning prior authorization.",
      ],
      resultRule:
        "The Empire Plan should not be matched to a generic Empire or Anthem commercial formulary.",
    };
  }

  const combinedMedicareCarrier = [
    "Aetna",
    "Horizon BCBSNJ",
    "Humana",
    "UnitedHealthcare",
    "Oxford Health",
    "Emblem Health / HIP",
  ].includes(name);

  return {
    kind: insurer.category,
    cardCheck: combinedMedicareCarrier
      ? "Whether this is a Medicare Advantage/Part D plan or a commercial plan, plus the pharmacy-benefit or drug-list name."
      : "Exact plan or pharmacy-benefit name and the drug-list year shown on the card or benefits document.",
    steps: [
      combinedMedicareCarrier
        ? "If the card says Medicare Advantage or Part D, use the exact Medicare plan finder."
        : "Identify the exact plan and the pharmacy-benefit or drug-list name.",
      "Use the named plan's official drug list before treating a medication as covered.",
      "Match the product, device, strength, and restriction criteria; then use the plan's PA route if needed.",
    ],
    resultRule:
      "A carrier-level result is not coverage. Use a sourced baseline only when the card matches its exact plan family; otherwise verify in the official plan route.",
    source,
    cardAction: source
      ? undefined
      : "Use the pharmacy-benefit phone number and exact plan route printed on the card before beginning prior authorization.",
    baseline: commercialRoute?.baseline,
    exactMedicare: combinedMedicareCarrier,
  };
};
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
  anthemNySelect: CoverageState = "Source loading",
  wellcareNjH0913: CoverageState = "Source loading",
  humanaNj26408: CoverageState = "Source loading",
  bravenNjH0885: CoverageState = "Source loading",
  healthspringNj26096: CoverageState = "Source loading",
  cloverNj2026: CoverageState = "Source loading",
  wellpointNjFamilyCare: CoverageState = "Source loading",
  horizonFlags: Restriction[] = [],
  uhcCommercialFlags: Restriction[] = [],
  aetnaMedicareHmoFlags: Restriction[] = [],
  amerihealthNjFlags: Restriction[] = [],
  cignaNationalPreferredFlags: Restriction[] = [],
  oscarNjIndividualFlags: Restriction[] = [],
  anthemNySelectFlags: Restriction[] = [],
  wellcareNjH0913Flags: Restriction[] = [],
  humanaNj26408Flags: Restriction[] = [],
  bravenNjH0885Flags: Restriction[] = [],
  healthspringNj26096Flags: Restriction[] = [],
  cloverNj2026Flags: Restriction[] = [],
  wellpointNjFamilyCareFlags: Restriction[] = [],
  horizonClassic: CoverageState = "Source loading",
  horizonClassicFlags: Restriction[] = [],
  amerihealthValue: CoverageState = "Source loading",
  amerihealthValueFlags: Restriction[] = [],
  amerihealthSelect: CoverageState = "Source loading",
  amerihealthSelectFlags: Restriction[] = [],
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
  horizonClassic: {
    state: horizonClassic,
    flags: horizonClassicFlags,
  },
  ambetterNjMarketplace: {
    state: "Source loading",
    flags: [],
  },
  uhcCommercial: {
    state: uhcCommercial,
    flags: uhcCommercialFlags,
  },
  oxfordFreedom: {
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
  amerihealthValue: {
    state: amerihealthValue,
    flags: amerihealthValueFlags,
  },
  amerihealthSelect: {
    state: amerihealthSelect,
    flags: amerihealthSelectFlags,
  },
  cignaNationalPreferred: {
    state: cignaNationalPreferred,
    flags: cignaNationalPreferredFlags,
  },
  oscarNjIndividual: {
    state: oscarNjIndividual,
    flags: oscarNjIndividualFlags,
  },
  anthemNySelect: {
    state: anthemNySelect,
    flags: anthemNySelectFlags,
  },
  wellcareNjH0913: {
    state: wellcareNjH0913,
    flags: wellcareNjH0913Flags,
  },
  humanaNj26408: {
    state: humanaNj26408,
    flags: humanaNj26408Flags,
  },
  bravenNjH0885: {
    state: bravenNjH0885,
    flags: bravenNjH0885Flags,
  },
  healthspringNj26096: {
    state: healthspringNj26096,
    flags: healthspringNj26096Flags,
  },
  cloverNj2026: {
    state: cloverNj2026,
    flags: cloverNj2026Flags,
  },
  wellpointNjFamilyCare: {
    state: wellpointNjFamilyCare,
    flags: wellpointNjFamilyCareFlags,
  },
});
export const medications: Medication[] = [
  {
    generic: "Albuterol HFA",
    brands: "ProAir HFA, Proventil HFA, Ventolin HFA",
    branch: "Rescue inhalers",
    use: "Asthma and COPD rescue bronchodilator",
    productDetails: "Metered-dose inhaler: 90 mcg base per actuation (108 mcg albuterol sulfate).",
    coverage: c("Preferred", "Tier 1", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Albuterol nebulizer solution",
    brands: "AccuNeb",
    branch: "Rescue inhalers",
    use: "Nebulized rescue bronchodilator",
    productDetails: "Nebulizer solution: 0.63 mg/3 mL, 1.25 mg/3 mL, 2.5 mg/3 mL, and concentrated 5 mg/mL products can differ.",
    coverage: c("Preferred", "Tier 1", "Preferred", [], ["QL"], []),
  },
  {
    generic: "Levalbuterol",
    brands: "Xopenex HFA, Xopenex solution",
    branch: "Rescue inhalers",
    use: "Short-acting beta agonist",
    productDetails: "HFA inhaler: 45 mcg per actuation. Nebulizer solution: 0.31, 0.63, or 1.25 mg/3 mL; concentrate products differ.",
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
    productDetails: "Nebulizer solution: 15 mcg/2 mL.",
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
    productDetails: "Nebulizer solution: 20 mcg/2 mL.",
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
    productDetails: "Dry-powder inhaler: 50 mcg per blister.",
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
    productDetails: "HFA inhaler: 17 mcg per actuation. Nebulizer solution: 0.02% (0.5 mg/2.5 mL).",
    coverage: c("Preferred", "Tier 1", "Preferred", [], ["QL"], []),
  },
  {
    generic: "Ipratropium / albuterol",
    brands: "Combivent Respimat, DuoNeb",
    branch: "Combination bronchodilators",
    use: "SAMA and SABA combination",
    productDetails: "Respimat: ipratropium 20 mcg/albuterol 100 mcg per actuation. Nebulizer: ipratropium 0.5 mg/albuterol 2.5 mg per 3 mL.",
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
    productDetails: "HandiHaler capsule: 18 mcg. Respimat: 1.25 or 2.5 mcg per actuation; device and indication matter.",
    coverage: c("Preferred", "Tier 2 + PA", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Incruse Ellipta (brand)",
    brands: "umeclidinium",
    branch: "Anticholinergics",
    use: "Long-acting muscarinic antagonist",
    productDetails: "Ellipta dry-powder inhaler: 62.5 mcg per blister.",
    coverage: c("Preferred", "Tier 2", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Anoro Ellipta (brand)",
    brands: "umeclidinium / vilanterol",
    branch: "Combination bronchodilators",
    use: "LAMA and LABA for COPD",
    productDetails: "Ellipta dry-powder inhaler: umeclidinium 62.5 mcg/vilanterol 25 mcg per blister.",
    coverage: c("Preferred", "Tier 2", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Glycopyrrolate / formoterol",
    brands: "Bevespi Aerosphere",
    branch: "Combination bronchodilators",
    use: "LAMA and LABA maintenance therapy for COPD",
    productDetails: "Metered-dose inhaler: glycopyrrolate 9 mcg/formoterol 4.8 mcg per actuation.",
    coverage: c("Source loading", "Source loading", "Source loading"),
  },
  {
    generic: "Revefenacin",
    brands: "Yupelri",
    branch: "Anticholinergics",
    use: "Once-daily nebulized long-acting muscarinic antagonist for COPD",
    productDetails: "Nebulizer solution: 175 mcg/3 mL unit-dose vial.",
    coverage: c("Source loading", "Source loading", "Source loading"),
  },
  {
    generic: "Tiotropium / olodaterol",
    brands: "Stiolto Respimat",
    branch: "Combination bronchodilators",
    use: "LAMA and LABA for COPD",
    productDetails: "Respimat inhaler: tiotropium 2.5 mcg/olodaterol 2.5 mcg per actuation.",
    coverage: c("Preferred", "Tier 2", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Olodaterol",
    brands: "Striverdi Respimat",
    branch: "Long-acting bronchodilators",
    use: "Once-daily LABA maintenance therapy for COPD",
    productDetails: "Respimat inhaler: 2.5 mcg per actuation.",
    coverage: c("Source loading", "Source loading", "Source loading"),
  },
  {
    generic: "Aclidinium",
    brands: "Tudorza Pressair",
    branch: "Anticholinergics",
    use: "Long-acting muscarinic antagonist maintenance therapy for COPD",
    productDetails: "Dry-powder inhaler: 400 mcg per actuation.",
    coverage: c("Source loading", "Source loading", "Source loading"),
  },
  {
    generic: "Fluticasone / umeclidinium / vilanterol",
    brands: "Trelegy Ellipta",
    branch: "Triple therapy",
    use: "ICS, LAMA and LABA for COPD or asthma",
    productDetails: "Ellipta dry-powder inhaler: 100/62.5/25 mcg or 200/62.5/25 mcg per blister.",
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
    productDetails: "Metered-dose inhaler: budesonide 160 mcg/glycopyrrolate 9 mcg/formoterol 4.8 mcg per actuation.",
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
    brands: "Pulmicort Respules",
    branch: "Inhaled corticosteroids",
    use: "ICS controller",
    productDetails: "Nebulized suspension entry only. Dry-powder Pulmicort Flexhaler is tracked separately.",
    coverage: c("Not on PDL", "Tier 1", "Preferred", [], ["QL"], ["QL"]),
  },
  {
    generic: "Budesonide (Flexhaler)",
    brands: "Pulmicort Flexhaler",
    branch: "Inhaled corticosteroids",
    use: "Dry-powder inhaled corticosteroid controller",
    productDetails: "Dry-powder inhaler: 90 or 180 mcg per actuation. This is distinct from nebulized budesonide.",
    coverage: c("Source loading", "Source loading", "Source loading"),
  },
  {
    generic: "Fluticasone furoate",
    brands: "Arnuity Ellipta",
    branch: "Inhaled corticosteroids",
    use: "Once-daily ICS controller for asthma",
    productDetails: "Ellipta dry-powder inhaler: 50, 100, or 200 mcg per blister.",
    coverage: c("Source loading", "Source loading", "Source loading"),
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
    generic: "Budesonide / formoterol (generic)",
    brands: "Generic budesonide-formoterol",
    branch: "ICS / LABA combinations",
    use: "Asthma or COPD controller",
    productDetails: "Metered-dose inhaler: 80/4.5 or 160/4.5 mcg per actuation. Brand and generic coverage can differ.",
    coverage: c("Source loading", "Source loading", "Source loading"),
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
    generic: "Albuterol / budesonide",
    brands: "Airsupra",
    branch: "Rescue inhalers",
    use: "Anti-inflammatory rescue inhaler for asthma",
    productDetails: "Metered-dose inhaler: albuterol 90 mcg/budesonide 80 mcg per actuation.",
    coverage: c("Source loading", "Source loading", "Source loading"),
  },
  {
    generic: "Fluticasone / salmeterol (generic)",
    brands: "Wixela Inhub and generic fluticasone-salmeterol products",
    branch: "ICS / LABA combinations",
    use: "Asthma or COPD controller",
    productDetails: "Dry-powder inhaler: 100/50, 250/50, or 500/50 mcg per blister. HFA and DPI products can have different coverage.",
    coverage: c("Source loading", "Source loading", "Source loading"),
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
    generic: "Reslizumab",
    brands: "Cinqair",
    branch: "Asthma biologics",
    use: "IV anti-IL-5 therapy for severe eosinophilic asthma",
    productDetails: "Intravenous infusion: 100 mg/10 mL vial; medical-benefit coverage may differ from pharmacy coverage.",
    coverage: c("Source loading", "Source loading", "Source loading"),
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
    generic: "Sotatercept-csrk",
    brands: "Winrevair",
    branch: "Pulmonary hypertension",
    use: "Activin signaling inhibitor for pulmonary arterial hypertension",
    coverage: c("Source loading", "Source loading", "Source loading"),
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
  priorAuthorizationUrl?: string,
  priorAuthorizationLabel?: string,
): Coverage => ({
  state,
  flags,
  productNote,
  priorAuthorizationUrl,
  priorAuthorizationLabel,
});

const planCoverageOverrides: Partial<
  Record<PlanKey, Record<string, Coverage>>
> = {
  amerihealthSelect: {
    Arformoterol: coverage("Generic"),
    Formoterol: coverage("Generic"),
    Salmeterol: coverage("Preferred brand"),
    Ipratropium: coverage("Tier varies", [], "Atrovent HFA is preferred brand; inhalation solution is generic."),
    "Ipratropium / albuterol": coverage("Generic"),
    "Tiotropium (generic capsule-inhaler)": coverage("Non-preferred", ["PA"]),
    "Spiriva HandiHaler / Respimat (brand)": coverage("Preferred brand"),
    "Incruse Ellipta (brand)": coverage("Non-preferred", ["PA"]),
    "Anoro Ellipta (brand)": coverage("Preferred brand"),
    "Glycopyrrolate / formoterol": coverage("Non-preferred", ["PA"], "Bevespi Aerosphere entry."),
    Revefenacin: coverage("Non-preferred", ["PA"], "Yupelri solution entry."),
    "Tiotropium / olodaterol": coverage("Preferred brand"),
    Olodaterol: coverage("Preferred brand"),
    "Fluticasone / umeclidinium / vilanterol": coverage("Preferred brand"),
    "Budesonide / glycopyrrolate / formoterol": coverage("Preferred brand"),
    Roflumilast: coverage("Generic"),
    "Budesonide inhalation": coverage("Tier varies", ["PA"], "Generic budesonide suspension is generic; Pulmicort Respules are non-preferred with PA."),
    "Budesonide (Flexhaler)": coverage("Preferred brand"),
    "Fluticasone furoate": coverage("Preferred brand"),
    "Fluticasone propionate HFA 44 mcg": coverage("Non-preferred", ["PA"]),
    "QVAR RediHaler (brand)": coverage("Non-preferred", ["PA"]),
    Ciclesonide: coverage("Non-preferred", ["PA"]),
    Mometasone: coverage("Non-preferred", ["PA"]),
    "Advair Diskus / HFA (brand)": coverage("Tier varies", ["PA"], "Advair HFA is preferred brand; Advair Diskus is non-preferred with PA."),
    "Symbicort (brand)": coverage("Preferred brand"),
    "Budesonide / formoterol (generic)": coverage("Non-preferred", ["PA"]),
    "Mometasone / formoterol": coverage("Non-preferred", ["PA"]),
    "Fluticasone / vilanterol": coverage("Preferred brand"),
    "Fluticasone / salmeterol (generic)": coverage("Non-preferred"),
    Montelukast: coverage("Generic"),
    Zafirlukast: coverage("Generic"),
    "Zileuton ER": coverage("Generic", ["PA"]),
    Dupilumab: coverage("Preferred brand", ["PA", "SP"]),
    Benralizumab: coverage("Preferred brand", ["PA", "SP"]),
    Mepolizumab: coverage("Preferred brand", ["PA", "SP"]),
    Tezepelumab: coverage("Preferred brand", ["PA", "SP"]),
    Omalizumab: coverage("Preferred brand", ["PA", "SP"]),
    Nintedanib: coverage("Non-preferred", ["PA", "SP"]),
    Pirfenidone: coverage("Generic", ["PA", "SP"]),
    Ambrisentan: coverage("Generic", ["PA", "SP"]),
    Bosentan: coverage("Generic", ["PA", "SP"]),
    "Sildenafil 20 mg": coverage("Generic", ["PA", "SP"]),
    "Tadalafil for PAH": coverage("Generic", ["PA", "SP"]),
    "Sotatercept-csrk": coverage("Non-preferred", ["PA", "SP"], "Winrevair injection entry."),
    "Dornase alfa": coverage("Preferred brand", ["SP"]),
    "Elexacaftor / tezacaftor / ivacaftor": coverage("Non-preferred", ["PA", "SP"]),
    "Fluticasone nasal": coverage("Generic"),
    "Azelastine nasal": coverage("Generic"),
    Varenicline: coverage("Generic"),
    "Nicotine replacement": coverage("Generic", [], "ACA preventive coverage may apply when the member's benefit includes it."),
    "Bupropion SR 150 mg": coverage("Generic"),
    Benzonatate: coverage("Low-cost generic"),
    "Epinephrine auto-injector": coverage("Tier varies", ["QL"], "0.3 mg generic pen is generic; 0.15 mg pen is preferred brand; brand EpiPen products are non-preferred with PA."),
    "Albuterol HFA": coverage("Generic"),
    "Albuterol nebulizer solution": coverage("Generic"),
    Levalbuterol: coverage("Tier varies", ["QL"], "Levalbuterol HFA is non-preferred with a quantity limit; nebulizer solution is generic."),
    Aclidinium: coverage("Non-preferred drug", ["PA"], "Tudorza Pressair entry."),
    Ensifentrine: coverage("Non-preferred drug", ["PA", "QL"], "Ohtuvayre suspension entry."),
    "Albuterol / budesonide": coverage("Non-preferred drug", ["PA"], "Airsupra entry."),
    Prednisone: coverage("Low-cost generic"),
    Prednisolone: coverage("Non-preferred drug", ["PA"], "Prednisolone 5 mg tablet entry."),
    "Treprostinil inhaled": coverage("Non-preferred drug", ["PA", "SP"], "Tyvaso entry."),
    Selexipag: coverage("Non-preferred drug", ["PA", "SP"], "Uptravi entry."),
    Riociguat: coverage("Preferred brand", ["PA", "SP"], "Adempas entry."),
    "Aztreonam inhalation": coverage("Non-preferred drug", ["PA", "SP"], "Cayston entry."),
    Azithromycin: coverage("Generic"),
    Doxycycline: coverage("Tier varies", [], "Multiple doxycycline strengths and dosage forms are listed."),
    Levofloxacin: coverage("Low-cost generic"),
    Famotidine: coverage("Generic"),
    Pantoprazole: coverage("Generic", ["QL"]),
    Furosemide: coverage("Low-cost generic"),
    Apixaban: coverage("Preferred brand", [], "Eliquis entry."),
    Lisinopril: coverage("Low-cost generic"),
    Losartan: coverage("Generic"),
    Amlodipine: coverage("Low-cost generic"),
    Atorvastatin: coverage("Generic"),
    Metformin: coverage("Generic"),
    Omeprazole: coverage("Generic", ["QL"]),
    Sertraline: coverage("Low-cost generic"),
    Ibuprofen: coverage("Generic", ["QL"]),
    "Amoxicillin / clavulanate": coverage("Generic"),
    Reslizumab: coverage("Source loading", [], "No exact Reslizumab/Cinqair row was found in the current Select formulary PDF."),
    "Tobramycin inhalation": coverage("Source loading", [], "No exact inhaled tobramycin row was found; the PDF's tobramycin entries are ophthalmic products."),
    Cetirizine: coverage("Source loading", [], "No exact Cetirizine row was found in the current Select formulary PDF."),
    "Guaifenesin ER": coverage("Source loading", [], "The PDF lists guaifenesin-codeine, but no exact extended-release guaifenesin row."),
  },
  amerihealthValue: {
    Arformoterol: coverage("Generic"),
    Salmeterol: coverage("Preferred brand"),
    Ipratropium: coverage("Tier varies", [], "Atrovent HFA is preferred brand; inhalation solution is generic."),
    "Ipratropium / albuterol": coverage("Generic"),
    "Spiriva HandiHaler / Respimat (brand)": coverage("Preferred brand"),
    "Anoro Ellipta (brand)": coverage("Preferred brand"),
    "Glycopyrrolate / formoterol": coverage("Non-preferred", ["PA"], "Bevespi Aerosphere entry."),
    Revefenacin: coverage("Non-preferred", ["PA"], "Yupelri solution entry."),
    "Tiotropium / olodaterol": coverage("Preferred brand"),
    Olodaterol: coverage("Preferred brand"),
    "Fluticasone / umeclidinium / vilanterol": coverage("Preferred brand"),
    "Budesonide / glycopyrrolate / formoterol": coverage("Preferred brand"),
    Roflumilast: coverage("Generic"),
    "Budesonide inhalation": coverage("Generic"),
    "Budesonide (Flexhaler)": coverage("Preferred brand"),
    "Fluticasone furoate": coverage("Preferred brand"),
    "Fluticasone propionate HFA 44 mcg": coverage("Non-formulary"),
    "QVAR RediHaler (brand)": coverage("Non-formulary"),
    Ciclesonide: coverage("Non-formulary"),
    Mometasone: coverage("Non-formulary"),
    "Advair Diskus / HFA (brand)": coverage("Tier varies", [], "Advair Diskus is non-formulary; Advair HFA is preferred brand."),
    "Symbicort (brand)": coverage("Preferred brand"),
    "Budesonide / formoterol (generic)": coverage("Non-formulary"),
    "Mometasone / formoterol": coverage("Non-formulary"),
    "Fluticasone / vilanterol": coverage("Preferred brand"),
    "Fluticasone / salmeterol (generic)": coverage("Generic"),
    Montelukast: coverage("Generic"),
    Zafirlukast: coverage("Generic"),
    "Zileuton ER": coverage("Generic", ["PA"]),
    Dupilumab: coverage("Preferred brand", ["PA", "SP"]),
    Benralizumab: coverage("Preferred brand", ["PA", "SP"]),
    Mepolizumab: coverage("Preferred brand", ["PA", "SP"]),
    Tezepelumab: coverage("Preferred brand", ["PA", "SP"]),
    Omalizumab: coverage("Preferred brand", ["PA", "SP"]),
    Nintedanib: coverage("Non-preferred", ["PA", "SP"]),
    Pirfenidone: coverage("Generic", ["PA", "SP"]),
    Bosentan: coverage("Generic", ["PA", "SP"]),
    "Sildenafil 20 mg": coverage("Generic", ["PA", "SP"]),
    "Tadalafil for PAH": coverage("Generic", ["PA", "SP"]),
    "Tobramycin inhalation": coverage("Tier varies", ["SP"], "Generic inhaled tobramycin is generic; branded/device products differ."),
    "Aztreonam inhalation": coverage("Non-preferred", ["PA", "SP"]),
    "Dornase alfa": coverage("Preferred brand", ["SP"]),
    "Elexacaftor / tezacaftor / ivacaftor": coverage("Non-formulary", ["SP"]),
    "Fluticasone nasal": coverage("Generic"),
    "Azelastine nasal": coverage("Generic", ["PA"]),
    Varenicline: coverage("Generic"),
    "Nicotine replacement": coverage("Generic", [], "ACA preventive coverage may apply when the member's benefit includes it."),
    "Bupropion SR 150 mg": coverage("Generic"),
    Benzonatate: coverage("Low-cost generic"),
    "Epinephrine auto-injector": coverage("Tier varies", ["QL"], "0.3 mg generic pen is generic; 0.15 mg pen is preferred brand; Auvi-Q differs by strength."),
    "Albuterol HFA": coverage("Generic"),
    "Albuterol nebulizer solution": coverage("Generic"),
    Levalbuterol: coverage("Tier varies", ["QL"], "Levalbuterol HFA is non-preferred; nebulizer solution is generic."),
    Formoterol: coverage("Generic"),
    "Tiotropium (generic capsule-inhaler)": coverage("Non-formulary", [], "Tiotropium bromide 18 mcg capsule entry."),
    "Incruse Ellipta (brand)": coverage("Non-formulary"),
    Aclidinium: coverage("Non-formulary", [], "Tudorza Pressair entry."),
    Ensifentrine: coverage("Non-formulary", ["QL"], "Ohtuvayre suspension entry."),
    "Albuterol / budesonide": coverage("Non-preferred drug", ["PA"], "Airsupra entry."),
    Prednisone: coverage("Low-cost generic"),
    Prednisolone: coverage("Non-preferred drug", ["PA"], "Prednisolone 5 mg tablet entry."),
    Ambrisentan: coverage("Generic", ["PA", "SP"]),
    "Treprostinil inhaled": coverage("Non-preferred drug", ["PA", "SP"], "Tyvaso entry."),
    Selexipag: coverage("Non-preferred drug", ["PA", "SP"], "Uptravi entry."),
    Riociguat: coverage("Preferred brand", ["PA", "SP"], "Adempas entry."),
    "Sotatercept-csrk": coverage("Non-preferred drug", ["PA", "SP"], "Winrevair injection entry."),
    Azithromycin: coverage("Generic"),
    Doxycycline: coverage("Tier varies", [], "Multiple doxycycline strengths and dosage forms are listed."),
    Levofloxacin: coverage("Low-cost generic"),
    Famotidine: coverage("Generic"),
    Pantoprazole: coverage("Generic", ["QL"]),
    Furosemide: coverage("Low-cost generic"),
    Apixaban: coverage("Preferred brand", [], "Eliquis entry."),
    Lisinopril: coverage("Low-cost generic"),
    Losartan: coverage("Generic"),
    Amlodipine: coverage("Low-cost generic"),
    Atorvastatin: coverage("Generic"),
    Metformin: coverage("Generic"),
    Omeprazole: coverage("Generic", ["QL"]),
    Sertraline: coverage("Low-cost generic"),
    Ibuprofen: coverage("Generic", ["QL"]),
    "Amoxicillin / clavulanate": coverage("Generic"),
    Reslizumab: coverage("Source loading", [], "No exact Reslizumab/Cinqair row was found in the current Value formulary PDF."),
    Cetirizine: coverage("Source loading", [], "No exact Cetirizine row was found in the current Value formulary PDF."),
    "Guaifenesin ER": coverage("Source loading", [], "The PDF lists guaifenesin-codeine, but no exact extended-release guaifenesin row."),
  },
  horizonClassic: {
    "Albuterol HFA": coverage("Tier 1", ["QL"], "Albuterol sulfate HFA inhaler entry in the July 2026 Horizon Classic Formulary."),
    "Albuterol nebulizer solution": coverage("Tier 1"),
    Arformoterol: coverage("Tier 1"),
    "Fluticasone furoate": coverage("Tier 2", ["QL"]),
    "Anoro Ellipta (brand)": coverage("Tier 2", ["QL"]),
    "Fluticasone / umeclidinium / vilanterol": coverage("Tier 2", ["QL"]),
    "Budesonide / glycopyrrolate / formoterol": coverage("Tier 2", ["PA", "QL"]),
    "Budesonide inhalation": coverage("Tier 1", ["QL"]),
    "Budesonide / formoterol (generic)": coverage("Tier 1", ["QL"]),
    "Ipratropium / albuterol": coverage(
      "Tier varies",
      ["QL"],
      "Combivent Respimat is Tier 2; ipratropium-albuterol nebulizer solution is Tier 1.",
    ),
    "Roflumilast": coverage("Tier varies", ["QL"], "Generic roflumilast is Tier 1; Daliresp is Tier 3 with quantity limits in the July 2026 Horizon Classic Formulary."),
    "Fluticasone / salmeterol (generic)": coverage("Tier 1", ["QL"]),
    "Montelukast": coverage("Tier 1", ["QL"]),
    "Levalbuterol": coverage("Tier varies", ["QL"], "Nebulizer solution entries are Tier 1; levalbuterol HFA is Tier 3 in the July 2026 Horizon Classic Formulary."),
    Dupilumab: coverage("Tier 2", ["PA", "QL", "SP", "LD"]),
    Benralizumab: coverage("Tier 2", ["PA", "QL", "SP", "LD"]),
    Mepolizumab: coverage("Tier 2", ["PA", "QL", "SP", "LD"]),
    "QVAR RediHaler (brand)": coverage("Tier 2", ["QL"]),
    "Symbicort (brand)": coverage("Tier 1", ["QL"]),
    "Spiriva HandiHaler / Respimat (brand)": coverage(
      "Tier varies",
      ["QL"],
      "Spiriva HandiHaler is Tier 1; Spiriva Respimat is Tier 2.",
    ),
    // Horizon Classic rows below are transcribed from the July 2026 official drug list.
    // Combined catalog entries stay Tier varies when the source separates formulations.
    Salmeterol: coverage("Tier 2", ["QL"]),
    Ipratropium: coverage("Tier 1"),
    // Existing rows below are kept in the same source-backed map and corrected
    // in place where the official list separates products or restrictions.
    "Tiotropium (generic capsule-inhaler)": coverage("Tier 1"),
    "Incruse Ellipta (brand)": coverage("Tier 2", ["QL"]),
    "Tiotropium / olodaterol": coverage("Tier 2", ["QL"]),
    Olodaterol: coverage("Tier 3", ["QL"]),
    "Mometasone": coverage("Tier 2", ["QL"]),
    "Advair Diskus / HFA (brand)": coverage(
      "Tier varies",
      ["QL"],
      "Advair HFA is Tier 2; the Advair Diskus/fluticasone-salmeterol dry-powder entries are Tier 1.",
    ),
    "Mometasone / formoterol": coverage("Tier 2", ["QL"]),
    "Fluticasone / vilanterol": coverage("Tier 2", ["QL"]),
    // Fluticasone/salmeterol, montelukast, and the other existing rows above
    // retain their source-backed entries in the original map.
    Zafirlukast: coverage("Tier 1", ["QL"]),
    Prednisone: coverage("Tier 1"),
    Prednisolone: coverage("Tier 1"),
    Tezepelumab: coverage("Tier 2", ["PA", "QL", "SP", "LD"]),
    Omalizumab: coverage("Tier 2", ["PA", "QL", "SP"]),
    Nintedanib: coverage("Tier 1", ["PA", "QL", "SP", "LD"]),
    Pirfenidone: coverage(
      "Tier varies",
      ["PA", "QL", "SP", "LD"],
      "Pirfenidone 534 mg is Tier 3; 267 mg capsule/tablet entries are Tier 1.",
    ),
    Ambrisentan: coverage("Tier 1", ["PA", "QL", "SP", "LD"]),
    Bosentan: coverage("Tier 1", ["PA", "QL", "SP", "LD"]),
    "Sildenafil 20 mg": coverage("Tier 1", ["PA", "QL", "SP", "LD"]),
    "Tadalafil for PAH": coverage("Tier 1", ["PA", "QL", "SP", "LD"]),
    Selexipag: coverage("Tier 3", ["PA", "QL", "SP", "LD"]),
    Riociguat: coverage("Tier 3", ["PA", "QL", "SP", "LD"]),
    "Tobramycin inhalation": coverage(
      "Tier varies",
      ["PA", "QL", "SP", "LD"],
      "Tobramycin inhaled products range from Tier 1 to Tier 3 by product and device.",
    ),
    "Aztreonam inhalation": coverage("Tier 2", ["PA", "QL", "SP", "LD"]),
    "Dornase alfa": coverage("Tier 2", ["PA", "QL", "SP"]),
    "Elexacaftor / tezacaftor / ivacaftor": coverage("Tier 2", ["PA", "QL", "SP", "LD"]),
    "Azelastine nasal": coverage("Tier 1", ["QL"]),
    Varenicline: coverage(
      "Tier varies",
      [],
      "The July 2026 source marks varenicline as ACA rather than assigning a numeric tier.",
    ),
    "Nicotine replacement": coverage(
      "Tier varies",
      [],
      "The July 2026 source marks covered nicotine gum, lozenge, and patches as ACA products rather than assigning a numeric tier.",
    ),
    "Bupropion SR 150 mg": coverage("Tier 1"),
    Azithromycin: coverage("Tier 1", ["QL"]),
    "Amoxicillin / clavulanate": coverage("Tier 1"),
    Doxycycline: coverage("Tier 1", ["QL"]),
    Levofloxacin: coverage("Tier 1", ["QL"]),
    Benzonatate: coverage("Tier 1"),
    Famotidine: coverage("Tier 1"),
    Pantoprazole: coverage("Tier 1", ["QL"]),
    "Epinephrine auto-injector": coverage(
      "Tier varies",
      ["QL"],
      "The listed epinephrine auto-injectors range from Tier 1 to Tier 3 by product and strength.",
    ),
    Furosemide: coverage("Tier 1"),
    Apixaban: coverage("Tier 2", ["QL"]),
    Lisinopril: coverage("Tier 1"),
    Losartan: coverage("Tier 1", ["QL"]),
    Amlodipine: coverage("Tier 1"),
    Atorvastatin: coverage("Tier 1", ["QL"]),
    Metformin: coverage("Tier 1", ["QL"]),
    Omeprazole: coverage("Tier 1", ["QL"]),
    Sertraline: coverage("Tier 1"),
    Ibuprofen: coverage("Tier 1"),
    // Keep labels without an exact Classic row visibly unconfirmed.
    Formoterol: coverage("Source loading", [], "No exact Formoterol product row was found in the July 2026 Horizon Classic Formulary."),
    "Glycopyrrolate / formoterol": coverage("Source loading", [], "No exact Glycopyrrolate/formoterol product row was found in the July 2026 Horizon Classic Formulary."),
    Revefenacin: coverage("Source loading", [], "No exact Revefenacin product row was found in the July 2026 Horizon Classic Formulary."),
    Aclidinium: coverage("Source loading", [], "No exact Aclidinium product row was found in the July 2026 Horizon Classic Formulary."),
    Ensifentrine: coverage("Source loading", [], "No exact Ensifentrine product row was found in the July 2026 Horizon Classic Formulary."),
    "Budesonide (Flexhaler)": coverage("Source loading", [], "The Classic list includes nebulized budesonide, but no exact Flexhaler row was found."),
    "Fluticasone propionate HFA 44 mcg": coverage("Source loading", [], "No exact Fluticasone propionate HFA 44 mcg row was found in the July 2026 Horizon Classic Formulary."),
    Ciclesonide: coverage("Source loading", [], "No exact Ciclesonide product row was found in the July 2026 Horizon Classic Formulary."),
    "Albuterol / budesonide": coverage("Source loading", [], "No exact Albuterol/budesonide product row was found in the July 2026 Horizon Classic Formulary."),
    "Zileuton ER": coverage("Source loading", [], "No exact Zileuton ER product row was found in the July 2026 Horizon Classic Formulary."),
    Reslizumab: coverage("Source loading", [], "No exact Reslizumab product row was found in the July 2026 Horizon Classic Formulary."),
    "Treprostinil inhaled": coverage("Source loading", [], "The Classic list includes oral treprostinil, but no exact inhaled product row was found."),
    "Sotatercept-csrk": coverage("Source loading", [], "No exact Sotatercept-csrk product row was found in the July 2026 Horizon Classic Formulary."),
    "Fluticasone nasal": coverage("Source loading", [], "No exact Fluticasone nasal product row was found in the July 2026 Horizon Classic Formulary."),
    Cetirizine: coverage("Source loading", [], "No exact Cetirizine product row was found in the July 2026 Horizon Classic Formulary."),
    "Guaifenesin ER": coverage("Source loading", [], "No exact Guaifenesin ER product row was found in the July 2026 Horizon Classic Formulary."),
  },
  oxfordFreedom: {
    "Fluticasone furoate": coverage(
      "Tier 1",
      ["QL"],
      "Arnuity Ellipta entry on the Oxford/UHC commercial PDL.",
    ),
  },
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
    "Glycopyrrolate / formoterol": coverage("Source loading"),
    Revefenacin: coverage("Source loading"),
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
    "Budesonide / formoterol (generic)": coverage("Tier 1", ["QL"], "Budesonide-formoterol 80/4.5 and 160/4.5 entries."),
    "Fluticasone furoate": coverage("Tier 2", ["QL"], "Arnuity Ellipta 50, 100, and 200 mcg entries."),
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
    "Albuterol / budesonide": coverage("Source loading"),
    "Fluticasone / salmeterol (generic)": coverage("Tier varies", ["QL"], "DPI products are Tier 1; HFA product restrictions differ."),
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
    Levalbuterol: coverage("Tier varies", ["QL"], "Nebulizer and concentrate entries are Tier 1; HFA is Tier 3 with a quantity limit."),
    Prednisone: coverage("Tier varies", ["PA", "QL"], "Tablets and therapy packs are Tier 1; oral solution is Tier 2 with PA and quantity limits."),
    Prednisolone: coverage("Tier 1", [], "Oral solution entries."),
    "Azelastine nasal": coverage("Tier 1", ["QL"]),
    Varenicline: coverage("Tier varies", [], "The source marks varenicline as ACA tobacco-cessation coverage rather than a numeric tier."),
    "Nicotine replacement": coverage("Tier varies", [], "Source-listed gum, lozenge, and patch products are marked ACA; benefit rules apply."),
    "Bupropion SR 150 mg": coverage("Tier 1", [], "Bupropion sustained-release entry; smoking-deterrent use is marked ACA."),
    Azithromycin: coverage("Tier 1", ["QL"], "Tablet entries have a quantity limit."),
    "Amoxicillin / clavulanate": coverage("Tier varies", [], "Most suspension/tablet entries are Tier 1; one Augmentin suspension entry is Tier 3."),
    Doxycycline: coverage("Tier varies", ["QL"], "Capsule/tablet entries are Tier 1; selected strengths carry quantity limits."),
    Levofloxacin: coverage("Tier 1", ["QL"], "Solution and tablet entries are Tier 1; tablets carry a quantity limit."),
    Benzonatate: coverage("Tier 1"),
    Famotidine: coverage("Tier 1"),
    Pantoprazole: coverage("Tier 1", ["QL"]),
    "Epinephrine auto-injector": coverage("Tier varies", ["QL"], "Auvi-Q is Tier 2; EpiPen products are Tier 1; listed products carry quantity limits."),
    Furosemide: coverage("Tier 1"),
    Apixaban: coverage("Tier 2", [], "Eliquis entry."),
    Lisinopril: coverage("Tier 1"),
    Losartan: coverage("Tier 1", ["QL"]),
    Amlodipine: coverage("Tier 1"),
    Atorvastatin: coverage("Tier 1", ["QL"]),
    Metformin: coverage("Tier 1", ["QL"], "Immediate-release and extended-release entries."),
    Omeprazole: coverage("Tier 1", ["QL"]),
    Sertraline: coverage("Tier 1"),
    Ibuprofen: coverage("Tier 1"),
  },
  ambetterNjMarketplace: {
    "Albuterol HFA": coverage("Tier 1B"),
    "Albuterol nebulizer solution": coverage("Tier varies", ["QL"], "0.083% and strength-unspecified nebulizer rows are Tier 1A; 0.63 mg/3 mL and 1.25 mg/3 mL nebulizer rows are Tier 1B. QL is 15 mL/day."),
    Levalbuterol: coverage("Tier varies", ["QL"], "Levalbuterol tartrate HFA row is Tier 1A; levalbuterol HCl nebulizer rows are Tier 1B."),
    Arformoterol: coverage("Tier 1B", ["QL"]),
    Formoterol: coverage("Tier 1B", ["QL"]),
    Salmeterol: coverage("Tier 2", ["QL"], "Serevent Diskus row."),
    Ipratropium: coverage("Tier varies", ["QL"], "Generic ipratropium HFA and 0.02% solution rows are Tier 1B; brand Atrovent HFA row is Tier 3."),
    "Ipratropium / albuterol": coverage("Tier varies", ["QL"], "Generic ipratropium-albuterol solution row is Tier 1B; brand Combivent Respimat row is Tier 2."),
    "Tiotropium (generic capsule-inhaler)": coverage("Tier 1A", ["QL"]),
    "Spiriva HandiHaler / Respimat (brand)": coverage("Tier 2", ["QL"], "Spiriva Respimat row is Tier 2; no exact Spiriva HandiHaler row was found in the current Ambetter NJ formulary."),
    "Incruse Ellipta (brand)": coverage("Tier 2", ["QL"]),
    "Tiotropium / olodaterol": coverage("Tier 2"),
    Olodaterol: coverage("Tier 2"),
    "Fluticasone / umeclidinium / vilanterol": coverage("Tier 2", ["QL"]),
    "Budesonide / glycopyrrolate / formoterol": coverage("Tier 2", ["QL"]),
    Roflumilast: coverage("Tier varies", ["QL"], "250 mcg row is Tier 1A; 500 mcg row is Tier 1B."),
    "Budesonide inhalation": coverage("Tier 1B", ["PA", "QL"], "Nebulized budesonide suspension row only; Pulmicort Flexhaler is tracked separately at Tier 2."),
    "Budesonide (Flexhaler)": coverage("Tier 2"),
    "Fluticasone furoate": coverage("Tier varies", ["QL"], "Generic fluticasone furoate inhalation row is Tier 1B; brand Arnuity Ellipta rows are Tier 2."),
    "Fluticasone propionate HFA 44 mcg": coverage("Tier 1B", ["QL"]),
    "QVAR RediHaler (brand)": coverage("Tier 2"),
    Ciclesonide: coverage("Tier 3", ["PA"], "Alvesco inhaler row."),
    "Budesonide / formoterol (generic)": coverage("Tier 1A", [], "Generic budesonide-formoterol fumarate dihydrate row is Tier 1A; no exact Breyna brand row was found in the current Ambetter NJ formulary."),
    "Mometasone / formoterol": coverage("Tier 2"),
    "Fluticasone / vilanterol": coverage("Tier varies", [], "Generic fluticasone furoate-vilanterol row is Tier 1B; brand Breo Ellipta rows are Tier 2."),
    "Fluticasone / salmeterol (generic)": coverage("Tier 1B"),
    Montelukast: coverage("Tier 1B", ["QL"]),
    Zafirlukast: coverage("Tier 1B", ["QL"]),
    "Zileuton ER": coverage("Tier 1B", ["PA", "QL"]),
    Prednisone: coverage("Tier varies", [], "2.5 mg, 10 mg, 20 mg, and 50 mg tablet rows are Tier 1A; solution, 1 mg and 5 mg tablet rows, and dose-pack row are Tier 1B."),
    Prednisolone: coverage("Tier varies", [], "15 mg/5 mL sodium-phosphate solution row and tablet row are Tier 1A; 5 mg/5 mL, 10 mg/5 mL, and 25 mg/5 mL sodium-phosphate solutions, TBDP row, and other solution row are Tier 1B."),
    Dupilumab: coverage("Tier 4", ["PA", "QL"]),
    Benralizumab: coverage("Tier 4", ["PA", "QL"]),
    Nintedanib: coverage("Tier 4", ["PA", "QL"]),
    Pirfenidone: coverage("Tier varies", ["PA", "QL"], "Capsule and 267 mg or 801 mg tablet rows are Tier 1B; 534 mg tablet row is Tier 4."),
    Ambrisentan: coverage("Tier 1B", ["PA", "QL"]),
    Bosentan: coverage("Tier varies", ["PA", "QL"], "Generic bosentan tablet and oral-suspension rows are Tier 1B; brand Tracleer oral-suspension row is Tier 4."),
    "Sildenafil 20 mg": coverage("Tier 1A", ["PA", "QL"]),
    "Tadalafil for PAH": coverage("Tier 1A", ["PA", "QL"]),
    "Treprostinil inhaled": coverage("Tier 4", ["PA"], "Tyvaso refill kit, starter kit, and nebulized solution rows are Tier 4; no exact Tyvaso DPI row was found in the current Ambetter NJ formulary."),
    Selexipag: coverage("Tier 4", ["PA", "QL"]),
    Riociguat: coverage("Tier 4", ["PA", "QL"]),
    "Tobramycin inhalation": coverage("Tier 1B", ["PA", "QL"], "Generic tobramycin nebulizer row is Tier 1B; no exact TOBI Podhaler row was found in the current Ambetter NJ formulary."),
    "Aztreonam inhalation": coverage("Tier 4", ["PA", "QL"]),
    "Dornase alfa": coverage("Tier 4", ["PA", "QL"]),
    "Elexacaftor / tezacaftor / ivacaftor": coverage("Tier 4", ["PA", "QL"]),
    "Fluticasone nasal": coverage("Tier 1A", ["QL"]),
    "Azelastine nasal": coverage("Tier 1B"),
    Cetirizine: coverage("Tier 1A", ["QL"]),
    Varenicline: coverage("Tier 0", ["QL"], "ACA preventive smoking-cessation benefit."),
    "Nicotine replacement": coverage("Tier 0", [], "ACA preventive smoking-cessation benefit."),
    "Bupropion SR 150 mg": coverage("Tier 0", ["QL"], "ACA preventive smoking-cessation benefit."),
    Azithromycin: coverage("Tier 1A", ["QL"]),
    "Amoxicillin / clavulanate": coverage("Tier varies", [], "CHEW, suspension, 500/875 mg tablets, and TB12 rows are Tier 1B; the 250 mg tablet row is Tier 1A."),
    Doxycycline: coverage("Tier varies", ["QL"], "Monohydrate capsule rows and hyclate capsule row are Tier 1A; monohydrate tablet rows and hyclate tablet rows are Tier 1B."),
    Levofloxacin: coverage("Tier varies", [], "500 mg tablet row is Tier 1A; IV 500 mg/100 mL in D5W row, oral solution row, and 250/750 mg tablet rows are Tier 1B."),
    Benzonatate: coverage("Tier varies", ["QL"], "100 mg is Tier 1A; 150 mg and 200 mg rows are Tier 1B."),
    Famotidine: coverage("Tier varies", [], "20 mg tablets are Tier 1A RX/OTC; 40 mg tablets and liquid rows are Tier 1B."),
    Pantoprazole: coverage("Tier 1B", ["QL"]),
    Omeprazole: coverage("Tier varies", ["QL"], "Generic omeprazole CPDR row is Tier 1A; omeprazole magnesium CPDR rows and omeprazole TBEC row are Tier 1B."),
    "Epinephrine auto-injector": coverage("Tier 1B", ["QL"]),
    Furosemide: coverage("Tier 1A"),
    Apixaban: coverage("Tier 2", ["QL"]),
    Lisinopril: coverage("Tier 1A"),
    Losartan: coverage("Tier varies", ["QL"], "25 mg is Tier 1A; 50 mg and 100 mg rows are Tier 1B."),
    Amlodipine: coverage("Tier 1B"),
    Atorvastatin: coverage("Tier 1A", ["QL"]),
    Metformin: coverage("Tier varies", ["QL"], "850 mg tablet row is Tier 0; 500 mg and 1000 mg tablet rows plus 500 mg and 750 mg extended-release tablet rows are Tier 1B."),
    Sertraline: coverage("Tier 1B"),
    Ibuprofen: coverage("Tier varies", [], "400 mg and 600 mg tablets are Tier 1A; suspension and 800 mg tablet rows are Tier 1B."),
    "Glycopyrrolate / formoterol": coverage("Source loading", [], "No exact Bevespi product row was found in the current Ambetter NJ formulary."),
    Revefenacin: coverage("Source loading", [], "No exact Revefenacin product row was found in the current Ambetter NJ formulary."),
    Aclidinium: coverage("Source loading", [], "No exact Aclidinium product row was found in the current Ambetter NJ formulary."),
    Ensifentrine: coverage("Source loading", [], "No exact Ensifentrine product row was found in the current Ambetter NJ formulary."),
    "Albuterol / budesonide": coverage("Source loading", [], "No exact Airsupra product row was found in the current Ambetter NJ formulary."),
    "Symbicort (brand)": coverage("Source loading", [], "No exact brand Symbicort product row was found in the current Ambetter NJ formulary."),
    "Advair Diskus / HFA (brand)": coverage("Source loading", [], "No exact brand Advair product row was found in the current Ambetter NJ formulary."),
    Mometasone: coverage("Source loading", [], "No exact inhaled Mometasone product row was found in the current Ambetter NJ formulary."),
    Reslizumab: coverage("Source loading", [], "No exact Reslizumab product row was found in the current Ambetter NJ formulary."),
    Tezepelumab: coverage("Source loading", [], "No exact Tezepelumab product row was found in the current Ambetter NJ formulary."),
    Omalizumab: coverage("Source loading", [], "No exact Omalizumab product row was found in the current Ambetter NJ formulary."),
    "Sotatercept-csrk": coverage("Source loading", [], "No exact Sotatercept/Winrevair product row was found in the current Ambetter NJ formulary."),
    "Guaifenesin ER": coverage("Source loading", [], "No exact extended-release Guaifenesin product row was found in the current Ambetter NJ formulary."),
  },
  uhcCommercial: {
    "Albuterol HFA": coverage("Tier 2", ["QL"]),
    "Albuterol nebulizer solution": coverage("Tier varies", [], "0.083%, 0.63 mg/3 mL, and 1.25 mg/3 mL are Tier 1; 0.5% is Tier 3."),
    Levalbuterol: coverage("Tier 3", ["QL"]),
    Arformoterol: coverage("Source loading", [], "No exact arformoterol/Brovana row was found in the May 2026 UHC commercial PDL."),
    Formoterol: coverage("Tier 4", ["QL"], "Perforomist nebulizer solution entry."),
    Salmeterol: coverage("Tier 2", ["QL"]),
    Ipratropium: coverage("Tier 1"),
    "Ipratropium / albuterol": coverage("Tier 2"),
    "Tiotropium (generic capsule-inhaler)": coverage("Source loading", [], "No exact generic tiotropium capsule row was found in the May 2026 UHC commercial PDL."),
    "Spiriva HandiHaler / Respimat (brand)": coverage("Tier 2", ["QL"]),
    "Incruse Ellipta (brand)": coverage("Source loading", [], "No exact Incruse Ellipta row was found in the May 2026 UHC commercial PDL."),
    "Anoro Ellipta (brand)": coverage("Tier 3", ["QL"]),
    Olodaterol: coverage("Tier 2", ["QL"], "STRIVERDI RESPIMAT exact product row."),
    "Glycopyrrolate / formoterol": coverage("Tier 2", ["QL"], "Bevespi Aerosphere entry."),
    "Tiotropium / olodaterol": coverage("Tier 2", ["QL"]),
    Revefenacin: coverage("Tier 4", ["PA", "QL"], "Yupelri entry."),
    "Fluticasone / salmeterol (generic)": coverage("Tier 3", ["QL", "RS"], "Wixela Inhub entry."),
    "Fluticasone furoate": coverage("Tier 1", ["QL"], "Arnuity Ellipta entry."),
    "Budesonide inhalation": coverage("Tier 2", ["QL"]),
    "QVAR RediHaler (brand)": coverage("Tier 1", ["QL"]),
    "Advair Diskus / HFA (brand)": coverage("Tier 3", ["QL", "RS"], "Advair HFA entry."),
    "Budesonide / formoterol (generic)": coverage("Source loading", [], "No exact generic budesonide/formoterol row was found in the May 2026 UHC commercial PDL."),
    "Mometasone / formoterol": coverage("Source loading", [], "No exact Dulera/mometasone-formoterol row was found in the May 2026 UHC commercial PDL."),
    "Fluticasone / vilanterol": coverage("Tier 3", ["QL", "RS"], "Breo Ellipta entry."),
    "Budesonide / glycopyrrolate / formoterol": coverage("Tier 3", ["QL", "RS"]),
    Roflumilast: coverage("Tier 2", ["QL"]),
    Benralizumab: coverage("Tier 4", ["PA", "QL", "SP"]),
    Mepolizumab: coverage("Tier 4", ["PA", "QL", "SP"]),
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
    "Elexacaftor / tezacaftor / ivacaftor": coverage("Tier 2", ["PA", "QL", "SP"]),
    "Fluticasone nasal": coverage("Tier 2"),
    "Azelastine nasal": coverage("Tier 2"),
    Benzonatate: coverage("Tier 1"),
    "Epinephrine auto-injector": coverage("Tier 1", ["QL"]),
    Ambrisentan: coverage("Source loading", [], "No exact ambrisentan row was found in the May 2026 UHC commercial PDL."),
    Bosentan: coverage("Tier 2", ["PA", "QL", "SP"]),
    "Sildenafil 20 mg": coverage("Tier 1", ["QL"]),
    "Tadalafil for PAH": coverage("Tier 1", ["PA", "QL", "SP"]),
    "Treprostinil inhaled": coverage("Tier 2", ["PA", "SP"], "Tyvaso/Tyvaso DPI entries."),
    Riociguat: coverage("Tier 2", ["PA", "QL", "SP"]),
    Nintedanib: coverage("Tier 4", ["PA", "QL", "SP"]),
    Pirfenidone: coverage("Tier 2", ["PA", "QL", "SP"]),
    Zafirlukast: coverage("Tier 1"),
    "Albuterol / budesonide": coverage("Tier 3", ["QL"], "Airsupra entry."),
    Montelukast: coverage("Tier varies", [], "Packet is Tier 2; tablet and chewable entries are Tier 1."),
    Dupilumab: coverage("Tier 2", ["PA", "QL", "SP"], "Dupixent entry."),
    Prednisone: coverage("Tier 1"),
    Prednisolone: coverage("Source loading", [], "The May 2026 PDL lists oral solution products only; confirm the exact strength and dosage form."),
    Varenicline: coverage("Tier 3"),
    "Nicotine replacement": coverage("Tier varies", [], "Nicotine patch and polacrilex entries are Tier 1; tobacco-cessation benefit rules apply."),
    "Bupropion SR 150 mg": coverage("Tier 1", [], "Bupropion sustained-release entry."),
    Azithromycin: coverage("Tier 1", [], "Oral packet entry."),
    "Amoxicillin / clavulanate": coverage("Tier 1"),
    Doxycycline: coverage("Tier varies", [], "Capsule and tablet strengths are Tier 1-2; suspension is Tier 3."),
    Levofloxacin: coverage("Tier 1"),
    Famotidine: coverage("Source loading", [], "The May 2026 PDL lists an oral suspension row only; confirm the exact dosage form."),
    Pantoprazole: coverage("Tier 1"),
    Furosemide: coverage("Tier 1"),
    Apixaban: coverage("Tier 2", ["QL"], "Eliquis entry."),
    Lisinopril: coverage("Tier 1"),
    Losartan: coverage("Tier 1"),
    Amlodipine: coverage("Tier 1"),
    Atorvastatin: coverage("Tier 1", [], "10-80 mg tablet entries are Tier 1; verify strength-specific rules."),
    Metformin: coverage("Tier 1"),
    Omeprazole: coverage("Tier 1"),
    Sertraline: coverage("Tier 1"),
    Ibuprofen: coverage("Tier 1"),
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
    "Glycopyrrolate / formoterol": coverage("Tier 3", ["QL"], "Bevespi Aerosphere entry."),
    "Fluticasone / umeclidinium / vilanterol": coverage("Tier 3", ["QL"]),
    "Budesonide / glycopyrrolate / formoterol": coverage("Tier 3", ["QL"]),
    Roflumilast: coverage("Tier 4"),
    "Budesonide inhalation": coverage(
      "Tier 4",
      [],
      "Listed under Medicare Part B/D coverage categories.",
    ),
    "Fluticasone furoate": coverage("Tier 3", ["QL"], "Arnuity Ellipta 50, 100, and 200 mcg entries."),
    Ciclesonide: coverage("Tier 4", ["QL"]),
    "Advair Diskus / HFA (brand)": coverage(
      "Tier varies",
      ["QL"],
      "Fluticasone-salmeterol Diskus is Tier 2; generic Advair HFA is Tier 4.",
    ),
    "Symbicort (brand)": coverage("Tier 3", ["QL"]),
    "Mometasone / formoterol": coverage("Tier 4", ["QL"]),
    "Fluticasone / vilanterol": coverage("Tier 3", ["QL"]),
    "Albuterol / budesonide": coverage("Tier 3", ["QL"], "Airsupra entry."),
    "Fluticasone / salmeterol (generic)": coverage(
      "Tier varies",
      ["QL"],
      "Diskus entries are Tier 2; generic HFA entries are Tier 4.",
    ),
    Montelukast: coverage("Tier 1", ["QL"]),
    Zafirlukast: coverage("Tier 4", ["QL"]),
    "Budesonide / formoterol (generic)": coverage("Tier 3", ["QL"]),
    Benralizumab: coverage("Tier 5", ["PA", "QL", "LD"]),
    Dupilumab: coverage("Tier 5", ["PA", "QL"]),
    Omalizumab: coverage("Tier 5", ["PA", "LD"]),
    Nintedanib: coverage("Tier 5", ["PA", "QL", "LD"]),
    Pirfenidone: coverage("Tier 5", ["PA", "QL"]),
    "Dornase alfa": coverage("Tier 5", ["PA", "LD"]),
    "Elexacaftor / tezacaftor / ivacaftor": coverage("Tier 5", [
      "PA",
      "QL",
      "LD",
    ]),
    "Fluticasone nasal": coverage("Tier 2", ["QL"], "Fluticasone propionate nasal spray entry."),
    "Azelastine nasal": coverage("Tier 2", ["QL"], "Azelastine hydrochloride nasal spray entry."),
    Ambrisentan: coverage("Tier 5", ["PA", "QL"]),
    Bosentan: coverage("Tier 5", ["PA", "QL", "LD"]),
    "Sildenafil 20 mg": coverage("Tier 3", ["PA", "QL"], "Generic Revatio entry."),
    "Tadalafil for PAH": coverage("Tier 5", ["PA"], "Generic Adcirca entry."),
    "Treprostinil inhaled": coverage("Tier 5", ["PA", "LD"], "Tyvaso starter and refill kit entries."),
    Riociguat: coverage("Tier 5", ["PA", "QL", "LD"], "Adempas entry."),
    Arformoterol: coverage("Tier 4", ["QL"], "Arformoterol nebulization entry; Part B/D determination applies."),
    "Tiotropium / olodaterol": coverage("Tier 3", ["QL"], "Stiolto Respimat entry."),
    Olodaterol: coverage("Tier 3", ["QL"], "Striverdi Respimat entry."),
    Prednisone: coverage("Tier varies", [], "Tablets and therapy packs are Tier 2; solution products are Tier 4 with Part B/D determination."),
    Prednisolone: coverage("Tier varies", [], "Oral solution products range from Tier 2 to Tier 4 with Part B/D determination."),
    Mepolizumab: coverage("Tier 5", ["PA", "QL"], "Nucala injection entries."),
    "Aztreonam inhalation": coverage("Tier 5", ["PA", "QL"], "Cayston nebulization entry."),
    Cetirizine: coverage("Tier 2", ["QL"], "Cetirizine oral solution entry."),
    Azithromycin: coverage("Tier varies", [], "Tablet entries are Tier 1; suspension is Tier 2; injection is Tier 4."),
    "Amoxicillin / clavulanate": coverage("Tier varies", [], "Tablets are Tier 2 or 4; suspension products are Tier 2 or 4; extended-release is Tier 4."),
    Doxycycline: coverage("Tier varies", [], "Capsule/tablet products range from Tier 2 to Tier 4; suspension is Tier 4."),
    Levofloxacin: coverage("Tier 2", [], "Oral tablet entry; solution and injection products are Tier 4."),
    Famotidine: coverage("Tier 1", [], "20 mg and 40 mg tablet entries."),
    Furosemide: coverage("Tier 1", [], "Oral solution and tablet entries."),
    Lisinopril: coverage("Tier 1"),
    Losartan: coverage("Tier 1", ["QL"]),
    Amlodipine: coverage("Tier 1"),
    Atorvastatin: coverage("Tier 1", ["QL"]),
    Metformin: coverage("Tier 1", ["QL"]),
    Sertraline: coverage("Tier varies", ["QL"], "Tablets are Tier 1; concentrate is Tier 4."),
    Ibuprofen: coverage("Tier 2", [], "400/600/800 mg tablet entry; suspension is Tier 2."),
    Selexipag: coverage("Tier 5", ["PA", "QL", "LD"], "Uptravi entry; ACS/limited-distribution handling applies."),
    "Sotatercept-csrk": coverage("Tier 5", ["PA", "QL", "LD"], "Winrevair entry; ACS/limited-distribution handling applies."),
    "Tobramycin inhalation": coverage("Tier 5", ["PA", "QL", "LD"], "TOBI Podhaler entry."),
    Varenicline: coverage("Tier 4"),
    "Bupropion SR 150 mg": coverage("Tier varies", ["QL"], "Sustained-release bupropion entry; confirm product and indication."),
    Benzonatate: coverage("Source loading", [], "No exact benzonatate row was found in the current Aetna formulary."),
    Pantoprazole: coverage("Tier 1", ["QL"], "20 mg and 40 mg delayed-release tablet entries."),
    "Epinephrine auto-injector": coverage("Tier 3", ["QL"], "Auto-injector entry; quantity limit 2 per 30 days."),
    Apixaban: coverage("Tier 3", ["QL"], "Eliquis entry."),
    Omeprazole: coverage("Tier 1", ["QL"], "Delayed-release capsule entries."),
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
    "Glycopyrrolate / formoterol": coverage("Non-preferred drug", ["PA"], "Bevespi Aerosphere entry."),
    Revefenacin: coverage("Non-preferred drug", ["PA"], "Yupelri entry."),
    "Tiotropium / olodaterol": coverage("Preferred brand"),
    Olodaterol: coverage("Preferred brand", [], "Striverdi Respimat entry."),
    Aclidinium: coverage("Non-formulary", [], "Tudorza Pressair entry."),
    "Fluticasone / umeclidinium / vilanterol": coverage("Preferred brand"),
    "Budesonide / glycopyrrolate / formoterol": coverage("Preferred brand"),
    Roflumilast: coverage("Generic"),
    Ensifentrine: coverage("Non-formulary", ["QL"]),
    "Budesonide inhalation": coverage("Generic"),
    "Budesonide (Flexhaler)": coverage("Preferred brand", [], "Pulmicort Flexhaler entry."),
    "Fluticasone furoate": coverage("Preferred brand", [], "Arnuity Ellipta entry."),
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
    "Albuterol / budesonide": coverage("Non-preferred drug", ["PA"], "Airsupra entry."),
    "Fluticasone / salmeterol (generic)": coverage("Generic"),
    Montelukast: coverage("Generic"),
    Zafirlukast: coverage("Generic"),
    "Zileuton ER": coverage("Generic", ["PA"]),
    Mepolizumab: coverage("Preferred brand", ["SP", "PA"]),
    Tezepelumab: coverage("Preferred brand", ["SP", "PA"]),
    Omalizumab: coverage("Preferred brand", ["SP", "PA"]),
    "Benzonatate": coverage("Low-cost generic"),
    "Epinephrine auto-injector": coverage("Generic", ["QL"]),
    "Budesonide / formoterol (generic)": coverage("Generic"),
    Prednisone: coverage("Low-cost generic"),
    Prednisolone: coverage("Non-preferred drug", ["PA"], "Prednisolone 5 mg tablet entry."),
    Dupilumab: coverage("Preferred brand", ["PA", "SP"]),
    Benralizumab: coverage("Preferred brand", ["PA", "SP"]),
    Nintedanib: coverage("Non-preferred drug", ["PA", "SP"], "Ofev entry."),
    Pirfenidone: coverage("Generic", ["PA", "SP"]),
    Ambrisentan: coverage("Generic", ["PA", "SP"]),
    Bosentan: coverage("Generic", ["PA", "SP"]),
    "Sildenafil 20 mg": coverage("Generic", ["PA", "SP"]),
    "Tadalafil for PAH": coverage("Generic", ["PA", "SP"], "Generic Adcirca entry."),
    "Treprostinil inhaled": coverage("Non-preferred drug", ["PA", "SP"], "Tyvaso entry."),
    Selexipag: coverage("Non-preferred drug", ["PA", "SP"], "Uptravi entry."),
    Riociguat: coverage("Preferred brand", ["PA", "SP"], "Adempas entry."),
    "Sotatercept-csrk": coverage("Non-preferred drug", ["PA", "SP"], "Winrevair injection entry."),
    "Aztreonam inhalation": coverage("Non-preferred drug", ["PA", "SP"], "Cayston entry."),
    "Dornase alfa": coverage("Preferred brand", ["SP"]),
    "Elexacaftor / tezacaftor / ivacaftor": coverage("Non-preferred drug", ["PA", "SP"], "Trikafta entry."),
    "Fluticasone nasal": coverage("Generic"),
    "Azelastine nasal": coverage("Generic"),
    Varenicline: coverage("Generic", ["QL"]),
    "Bupropion SR 150 mg": coverage("Generic"),
    Azithromycin: coverage("Generic"),
    Doxycycline: coverage("Tier varies", [], "Multiple doxycycline strengths and dosage forms are listed."),
    Levofloxacin: coverage("Low-cost generic"),
    Famotidine: coverage("Generic"),
    Pantoprazole: coverage("Generic", ["QL"]),
    Furosemide: coverage("Low-cost generic"),
    Apixaban: coverage("Preferred brand", [], "Eliquis entry."),
    Lisinopril: coverage("Low-cost generic"),
    Losartan: coverage("Generic"),
    Amlodipine: coverage("Low-cost generic"),
    Atorvastatin: coverage("Generic"),
    Metformin: coverage("Generic"),
    Omeprazole: coverage("Generic", ["QL"]),
    Sertraline: coverage("Low-cost generic"),
    Ibuprofen: coverage("Generic", ["QL"]),
    "Amoxicillin / clavulanate": coverage("Generic"),
    "Nicotine replacement": coverage("Generic", [], "Nicotine replacement products are listed under the ACA tobacco-cessation benefit; eligibility and product limits apply."),
    Reslizumab: coverage("Source loading", [], "No exact Reslizumab/Cinqair row was found in the current Individual & Family formulary PDF."),
    "Tobramycin inhalation": coverage("Source loading", [], "No exact inhaled tobramycin row was found; the PDF's tobramycin entries are ophthalmic products."),
    Cetirizine: coverage("Source loading", [], "No exact Cetirizine row was found in the current Individual & Family formulary PDF."),
    "Guaifenesin ER": coverage("Source loading", [], "The PDF lists guaifenesin-codeine, but no exact extended-release guaifenesin row."),
  },
  cignaNationalPreferred: {
    "Albuterol HFA": coverage("Listed in PDL", ["QL"]),
    "Albuterol nebulizer solution": coverage("Listed in PDL"),
    "Ipratropium / albuterol": coverage("Listed in PDL", ["QL"], "Combivent Respimat entry; this does not determine nebulizer coverage."),
    "Spiriva HandiHaler / Respimat (brand)": coverage("Listed in PDL", ["QL"], "Spiriva Respimat entry."),
    "Incruse Ellipta (brand)": coverage("Listed in PDL", ["QL"]),
    "Anoro Ellipta (brand)": coverage("Listed in PDL", ["QL"]),
    Revefenacin: coverage("Listed in PDL", ["QL"], "Yupelri entry."),
    "Tiotropium / olodaterol": coverage("Listed in PDL", ["QL"], "Stiolto Respimat entry."),
    Olodaterol: coverage("Listed in PDL", ["QL"], "Striverdi Respimat entry."),
    "Fluticasone / umeclidinium / vilanterol": coverage("Listed in PDL", ["QL"], "Trelegy Ellipta entry."),
    "Budesonide / glycopyrrolate / formoterol": coverage("Listed in PDL", ["QL"], "Breztri Aerosphere entry."),
    "QVAR RediHaler (brand)": coverage("Listed in PDL", ["QL"]),
    Mometasone: coverage("Listed in PDL", ["QL"], "Asmanex or Asmanex HFA entry."),
    "Advair Diskus / HFA (brand)": coverage("Listed in PDL", ["PA", "QL"], "Advair HFA entry."),
    "Budesonide / formoterol (generic)": coverage("Listed in PDL", ["PA", "QL"], "Breyna entry."),
    "Mometasone / formoterol": coverage("Listed in PDL", ["PA", "QL"], "Dulera entry."),
    "Fluticasone / vilanterol": coverage("Listed in PDL", ["PA", "QL"], "Breo Ellipta entry."),
    "Albuterol / budesonide": coverage("Listed in PDL", [], "Airsupra entry."),
    Montelukast: coverage("Listed in PDL"),
    Dupilumab: coverage("Listed in PDL", ["PA", "QL"], "Dupixent entry."),
    Benralizumab: coverage("Listed in PDL", ["PA", "QL"], "Fasenra Pen entry."),
    Mepolizumab: coverage("Listed in PDL", ["PA", "QL"], "Nucala auto-injector or syringe entry."),
    Tezepelumab: coverage("Listed in PDL", ["PA", "QL"]),
    Omalizumab: coverage("Listed in PDL", ["PA", "QL"]),
    Nintedanib: coverage("Listed in PDL", ["PA", "QL"], "Ofev entry."),
    "Treprostinil inhaled": coverage("Listed in PDL", ["PA"], "Tyvaso entry."),
    Selexipag: coverage("Listed in PDL", ["PA", "QL"], "Uptravi tablet entry."),
    Riociguat: coverage("Listed in PDL", ["PA", "QL"], "Adempas entry."),
    "Fluticasone nasal": coverage("Listed in PDL", ["QL"], "Fluticasone spray entry."),
    "Azelastine nasal": coverage("Listed in PDL", ["QL"], "Azelastine 0.1% nasal spray entry."),
    Ibuprofen: coverage("Listed in PDL", [], "Oral suspension and 400 mg, 600 mg, or 800 mg tablet entries."),
    "Symbicort (brand)": coverage("Listed in PDL", ["QL"], "Symbicort entry."),
    Prednisone: coverage("Listed in PDL"),
    "Tobramycin inhalation": coverage("Listed in PDL", ["PA", "QL"], "Tobi Podhaler entry."),
    Azithromycin: coverage("Listed in PDL", ["PA"], "Oral suspension, packet, and tablet entries."),
    "Amoxicillin / clavulanate": coverage("Listed in PDL"),
    Doxycycline: coverage("Listed in PDL", ["ST"], "Doxycycline hyclate and monohydrate entries vary by strength."),
    Benzonatate: coverage("Listed in PDL"),
    Famotidine: coverage("Listed in PDL", [], "Oral suspension and 40 mg tablet entries."),
    Pantoprazole: coverage("Listed in PDL", [], "Delayed-release 40 mg tablet entry."),
    Omeprazole: coverage("Listed in PDL", ["QL"], "Delayed-release capsule entry."),
    Furosemide: coverage("Listed in PDL", [], "Oral solution and tablet entries."),
    Apixaban: coverage("Listed in PDL", [], "Eliquis entry."),
    Amlodipine: coverage("Listed in PDL"),
    Atorvastatin: coverage("Listed in PDL", ["QL"]),
    Metformin: coverage("Listed in PDL", ["QL"], "Metformin ER tablet entry."),
    Sertraline: coverage("Listed in PDL", ["QL"], "Sertraline concentrate and tablet entries."),
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
    "Fluticasone furoate": coverage("Tier 2", ["QL"], "Arnuity Ellipta entry."),
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
  anthemNySelect: {
    "Albuterol HFA": coverage("Tier 1", ["QL"]),
    "Albuterol nebulizer solution": coverage("Tier 1", ["QL"]),
    Levalbuterol: coverage("Tier varies", ["QL"], "HFA is Tier 1; nebulizer solution is Tier 2."),
    Arformoterol: coverage("Tier 2", ["QL"]),
    Formoterol: coverage("Tier 2", ["QL"]),
    Salmeterol: coverage("Tier 2", ["QL"]),
    Ipratropium: coverage("Tier 1", ["QL"], "Ipratropium nebulizer entry."),
    "Ipratropium / albuterol": coverage("Tier 1", ["QL"], "Ipratropium-albuterol nebulizer entry."),
    "Tiotropium (generic capsule-inhaler)": coverage("Tier 2", ["QL"]),
    "Spiriva HandiHaler / Respimat (brand)": coverage("Tier 2", ["QL"], "Spiriva Respimat entry."),
    "Anoro Ellipta (brand)": coverage("Tier 2", ["QL"], "Umeclidinium/vilanterol entry."),
    "Fluticasone / umeclidinium / vilanterol": coverage("Tier 2", ["QL"]),
    "Budesonide / glycopyrrolate / formoterol": coverage("Tier 3", ["QL"]),
    Roflumilast: coverage("Tier 2", ["QL"]),
    "Budesonide inhalation": coverage("Tier 1", ["QL"]),
    "Fluticasone propionate HFA 44 mcg": coverage("Tier 2", ["QL"]),
    "QVAR RediHaler (brand)": coverage("Tier 2", ["QL"]),
    Mometasone: coverage("Tier 2", ["QL"]),
    "Advair Diskus / HFA (brand)": coverage("Tier 1", ["QL"], "Fluticasone-salmeterol HFA/DPI entry; brand status can differ."),
    "Symbicort (brand)": coverage("Tier 2", ["QL"], "Budesonide-formoterol entry; brand status can differ."),
    "Mometasone / formoterol": coverage("Tier 2", ["QL"]),
    "Fluticasone / vilanterol": coverage("Tier 2", ["QL"]),
    Montelukast: coverage("Tier 1", ["QL"]),
    Zafirlukast: coverage("Tier 1", ["QL"]),
    "Zileuton ER": coverage("Tier 2 + PA", ["PA", "QL"]),
    Dupilumab: coverage("Tier 3", ["PA", "SP"]),
    Nintedanib: coverage("Tier 3", ["PA", "QL", "SP"]),
    "Tobramycin inhalation": coverage("Tier 3", ["QL", "SP"]),
    "Dornase alfa": coverage("Tier 3", ["PA", "QL", "SP", "LD"]),
    "Bupropion SR 150 mg": coverage("Tier 1", ["QL"], "$0 smoking-cessation benefit entry."),
    "Nicotine replacement": coverage("Tier 1", [], "$0 smoking-cessation benefit entry."),
    Varenicline: coverage("Tier 2", ["QL"], "$0 smoking-cessation benefit entry."),
  },
  wellcareNjH0913: {
    "Albuterol HFA": coverage("Tier varies", ["QL"], "Generic albuterol HFA is Tier 4; Ventolin HFA is Tier 3."),
    "Albuterol nebulizer solution": coverage("Tier 4", [], "Part B/D determination applies."),
    Levalbuterol: coverage("Tier 4", [], "Nebulizer entry; Part B/D determination applies."),
    Arformoterol: coverage("Tier 4", ["QL"], "Part B/D determination applies."),
    Formoterol: coverage("Tier 3", ["QL"], "Part B/D determination applies."),
    Ipratropium: coverage("Tier 2", [], "Nebulizer entry; Part B/D determination applies."),
    Salmeterol: coverage("Tier 3", ["QL"], "Serevent Diskus entry, 60 actuations per 30 days."),
    "Spiriva HandiHaler / Respimat (brand)": coverage("Tier 4", ["QL"], "Spiriva Respimat entry, 4 g per 30 days."),
    "Incruse Ellipta (brand)": coverage("Tier 3", ["QL"], "30 doses per 30 days."),
    "Anoro Ellipta (brand)": coverage("Tier 3", ["QL"], "60 doses per 30 days."),
    "Fluticasone / umeclidinium / vilanterol": coverage("Tier 3", ["QL"], "Trelegy Ellipta entry, 60 actuations per 30 days."),
    "Budesonide / glycopyrrolate / formoterol": coverage("Tier 3", ["QL"], "Breztri entry, 10.7 g per 30 days."),
    "Fluticasone / vilanterol": coverage("Tier 3", ["QL"], "Breo Ellipta entry, 60 doses per 30 days."),
    "Ipratropium / albuterol": coverage("Tier 3", ["QL"], "Combivent Respimat entry, 8 g per 30 days."),
    "Glycopyrrolate / formoterol": coverage("Tier 3", ["QL"], "Bevespi entry."),
    "Budesonide inhalation": coverage("Tier 4", [], "Part B/D determination applies."),
    "Albuterol / budesonide": coverage("Tier 3", ["QL"], "Airsupra entry."),
    "Fluticasone / salmeterol (generic)": coverage("Tier 4", ["QL"]),
    "Budesonide / formoterol (generic)": coverage("Tier 3", ["QL"], "Breyna entry."),
    "Advair Diskus / HFA (brand)": coverage("Tier 3", ["QL"], "Exact ADVAIR HFA 45/21, 115/21, and 230/21 mcg entries, QL 12 GM per 30 days, in Wellcare formulary 26187 for H0913-002/021/022."),
    "Fluticasone furoate": coverage("Tier 3", ["QL"], "Exact ARNUITY ELLIPTA 50/100/200 mcg entries, QL 30 each per 30 days, in Wellcare formulary 26187 for H0913-002/021/022."),
    "Fluticasone nasal": coverage("Tier 2", ["QL"]),
    Montelukast: coverage("Tier varies", [], "10 mg tablet is Tier 1; granules and chewables are Tier 2."),
    Zafirlukast: coverage("Tier 4"),
    "Benralizumab": coverage("Tier 5", ["PA", "QL"], "Fasenra entry, 0.5 to 1 mL per 28 days."),
    Dupilumab: coverage("Tier 5", ["PA", "QL"], "Dupixent package-specific quantity limits per 28 days."),
    Omalizumab: coverage("Tier 5", ["PA", "QL", "LD"]),
    Nintedanib: coverage("Tier 5", ["PA", "QL"]),
    Pirfenidone: coverage("Tier 5", ["PA", "QL"]),
    Roflumilast: coverage("Tier 4", ["QL"]),
    "Sildenafil 20 mg": coverage("Tier 2", ["PA", "QL"]),
    "Tadalafil for PAH": coverage("Tier 4", ["PA", "QL"]),
    "Dornase alfa": coverage("Tier 5", [], "Part B/D determination applies."),
    Cetirizine: coverage("Tier 1", [], "Exact cetirizine oral solution 1 mg/mL entry in Wellcare formulary 26187 for H0913-002/021/022."),
    Selexipag: coverage("Tier 5", ["PA", "QL", "LD"], "Exact UPTRAVI entries, PA, LA, QL 60 each per 30 days, in Wellcare formulary 26187 for H0913-002/021/022."),
    Riociguat: coverage("Tier 5", ["PA", "QL", "LD"], "Exact ADEMPAS entries, PA, LA, QL 90 each per 30 days, in Wellcare formulary 26187 for H0913-002/021/022."),
    "Elexacaftor / tezacaftor / ivacaftor": coverage("Tier 5", ["PA", "QL", "LD"]),
    "Sotatercept-csrk": coverage("Tier 5", ["PA", "QL"]),
    "Tobramycin inhalation": coverage("Tier 5", ["PA", "QL"], "Tobramycin inhalation solution entry."),
    "Azelastine nasal": coverage("Tier 2", ["QL"]),
    Prednisone: coverage("Tier varies", [], "Tablets are Tier 1; oral solution and concentrate are Tier 4."),
    Prednisolone: coverage("Tier 4", [], "Oral solution entries."),
    Varenicline: coverage("Tier 4"),
    "Bupropion SR 150 mg": coverage("Tier 2", ["QL"], "Sustained-release 150 mg entry."),
    Azithromycin: coverage("Tier varies", [], "Suspension is Tier 2; tablet entries are Tier 2; injection is Tier 4."),
    "Amoxicillin / clavulanate": coverage("Tier varies", [], "Suspension entries are Tier 2 or 4; tablet entries are Tier 2 or 4."),
    Doxycycline: coverage("Tier 2", [], "Hyclate and monohydrate capsule/tablet entries are Tier 2."),
    Levofloxacin: coverage("Tier 1", [], "Oral tablet and solution entries."),
    Benzonatate: coverage("Tier 2"),
    "Guaifenesin ER": coverage("Source loading", [], "No exact extended-release guaifenesin row was found; only guaifenesin-codeine and OTC entries are listed."),
    Famotidine: coverage("Tier 1", [], "Oral tablet entry."),
    Pantoprazole: coverage("Tier 1", ["QL"]),
    "Epinephrine auto-injector": coverage("Tier 3", ["QL"]),
    Furosemide: coverage("Tier 1"),
    Apixaban: coverage("Tier 3", ["QL"], "Eliquis entry."),
    Lisinopril: coverage("Tier 1"),
    Losartan: coverage("Tier varies", ["QL"], "100 mg and 25/50 mg tablet entries carry quantity limits."),
    Amlodipine: coverage("Tier 1"),
    Atorvastatin: coverage("Tier 1", ["QL"]),
    Metformin: coverage("Tier varies", ["QL"], "Immediate-release and extended-release entries; source uses $0 tier notation."),
    Omeprazole: coverage("Tier 1", ["QL"]),
    Sertraline: coverage("Tier varies", ["QL"], "Concentrate is Tier 2; tablets are Tier 1 with quantity limits."),
    Ibuprofen: coverage("Tier varies", [], "400/600/800 mg tablets are Tier 1; suspension is Tier 2."),
    Ambrisentan: coverage("Tier 5", ["PA", "QL"], "Ambrisentan tablet entry."),
    Bosentan: coverage("Tier 5", ["PA", "QL"], "Bosentan tablet entry."),
    "Aztreonam inhalation": coverage("Tier 5", ["PA", "QL"], "CAYSTON inhalation entry; source also marks limited availability."),
  },
  humanaNj26408: {
    "Albuterol HFA": coverage("Tier 3", ["QL"]),
    "Albuterol nebulizer solution": coverage("Tier 2", [], "Part B versus Part D determination applies."),
    Levalbuterol: coverage("Tier 4", ["ST", "QL"], "Levalbuterol HFA entry."),
    Arformoterol: coverage("Tier 4", ["QL"], "Part B versus Part D determination applies."),
    Ipratropium: coverage("Tier varies", ["PA", "QL"], "Nebulizer is Tier 2 with Part B/D determination; HFA is Tier 4 with PA and QL."),
    "Ipratropium / albuterol": coverage("Tier varies", ["QL"], "DuoNeb is Tier 2 with Part B/D determination; Combivent is Tier 4 with QL."),
    "Spiriva HandiHaler / Respimat (brand)": coverage("Tier 3", ["QL"]),
    "Tiotropium / olodaterol": coverage("Tier 3", ["QL"]),
    "Fluticasone / umeclidinium / vilanterol": coverage("Tier 3", ["QL"]),
    "Budesonide / glycopyrrolate / formoterol": coverage("Tier 3", ["QL"]),
    Roflumilast: coverage("Tier 3", ["QL"]),
    "Budesonide inhalation": coverage("Tier 4", [], "Part B versus Part D determination applies."),
    "Fluticasone furoate": coverage("Tier 3", ["QL"], "Arnuity Ellipta entry."),
    "Albuterol / budesonide": coverage("Tier 3", ["QL"], "Airsupra entry."),
    "Advair Diskus / HFA (brand)": coverage("Tier 3", ["QL"]),
    "Symbicort (brand)": coverage("Tier 3", ["QL"]),
    "Fluticasone / vilanterol": coverage("Tier 3", ["QL"]),
    "Fluticasone / salmeterol (generic)": coverage("Tier 3", ["QL"], "Wixela Inhub entry."),
    Montelukast: coverage("Tier 1", ["QL"]),
    Zafirlukast: coverage("Tier 4", ["QL"]),
    Dupilumab: coverage("Tier 5", ["PA", "QL"]),
    Benralizumab: coverage("Tier 5", ["PA", "QL"]),
    Mepolizumab: coverage("Tier 5", ["PA", "QL"], "Nucala entries."),
    Omalizumab: coverage("Tier 5", ["PA", "QL"]),
    Nintedanib: coverage("Tier 5", ["PA", "QL"]),
    Pirfenidone: coverage("Tier 5", ["PA", "QL"]),
    Ambrisentan: coverage("Tier 5", ["PA", "QL"]),
    "Sildenafil 20 mg": coverage("Tier 3", ["PA", "QL"]),
    "Tadalafil for PAH": coverage("Tier 4", ["PA", "QL"]),
    Selexipag: coverage("Tier 5", ["PA", "QL"]),
    Riociguat: coverage("Tier 5", ["PA", "QL"]),
    "Tobramycin inhalation": coverage("Tier 5", [], "Part B versus Part D determination applies."),
    "Aztreonam inhalation": coverage("Tier 5", ["PA", "QL"]),
    "Dornase alfa": coverage("Tier 5", [], "Part B versus Part D determination applies."),
    "Elexacaftor / tezacaftor / ivacaftor": coverage("Tier 5", ["PA", "QL"]),
    "Fluticasone nasal": coverage("Tier 2", ["QL"], "Fluticasone propionate nasal spray entry."),
    "Azelastine nasal": coverage("Tier 3", ["QL"], "Azelastine 0.1% nasal spray entry."),
    "Epinephrine auto-injector": coverage("Tier 3", ["QL"], "Generic epinephrine auto-injector entry."),
    "Sotatercept-csrk": coverage("Tier 5", ["PA"], "Winrevair entry."),
    Prednisone: coverage("Tier varies", [], "Most tablet strengths are Tier 1; dose-pack and liquid products vary."),
    Prednisolone: coverage("Tier varies", [], "Oral solution products range from Tier 2 to Tier 4."),
    Cetirizine: coverage("Tier 2", ["QL"], "Cetirizine oral solution entry."),
    Azithromycin: coverage("Tier 1"),
    "Amoxicillin / clavulanate": coverage("Tier varies", [], "Oral products range from Tier 1 to Tier 3 by formulation."),
    Doxycycline: coverage("Tier varies", [], "Product and formulation tiers vary."),
    Levofloxacin: coverage("Tier varies", [], "Oral product tiers vary by strength and formulation."),
    Benzonatate: coverage("Tier 1"),
    Famotidine: coverage("Tier 2"),
    Pantoprazole: coverage("Tier 1", ["QL"]),
    Furosemide: coverage("Tier 1"),
    Apixaban: coverage("Tier 3", ["QL"], "Eliquis entry."),
    Lisinopril: coverage("Tier 1"),
    Losartan: coverage("Tier 1"),
    Amlodipine: coverage("Tier 1"),
    Atorvastatin: coverage("Tier 1"),
    Metformin: coverage("Tier 1"),
    Omeprazole: coverage("Tier 1"),
    Sertraline: coverage("Tier 1", ["QL"]),
    Ibuprofen: coverage("Tier 1"),
  },
  bravenNjH0885: {
    "Albuterol HFA": coverage("Tier 3", ["QL"], "Metered-dose inhaler entries have 13.4 or 17 units per 30 days limits."),
    "Albuterol nebulizer solution": coverage("Tier varies", ["PA"], "0.83 mg/mL is Tier 2; 0.21/0.417 mg/mL entries are Tier 3."),
    "Ipratropium / albuterol": coverage("Tier 2 + PA", ["PA"], "Nebulizer entry."),
    "Budesonide inhalation": coverage("Tier 4", ["PA"], "Nebulized product entries."),
    "Symbicort (brand)": coverage("Tier 4", ["QL"], "Budesonide-formoterol MDI entries, 30.9 units per 30 days."),
    Montelukast: coverage("Tier varies", [], "4 mg granule is Tier 4; 4/5 mg chewable and 10 mg tablet entries are Tier 2."),
    Roflumilast: coverage("Tier 4", ["PA", "QL"], "30 tablets per 30 days."),
    Nintedanib: coverage("Tier 5", ["PA", "QL"], "60 capsules per 30 days."),
    Pirfenidone: coverage("Tier varies", ["PA", "QL"], "267 mg tablet is Tier 4; 801 mg tablet and 267 mg capsule are Tier 5."),
  },
  healthspringNj26096: {
    "Albuterol HFA": coverage("Tier 2", ["QL"]),
    "Albuterol nebulizer solution": coverage("Tier 2", ["PA"], "Part B/D determination applies."),
    Arformoterol: coverage("Tier 4", ["PA"], "Part B/D determination applies."),
    Levalbuterol: coverage("Tier varies", ["PA"], "Nebulizer is Tier 3; HFA is Tier 4 with a quantity limit."),
    Salmeterol: coverage("Tier 3", ["QL"], "Serevent Diskus entry."),
    Ipratropium: coverage("Tier varies", ["PA", "QL"], "Nebulizer is Tier 2; HFA is Tier 4 with a quantity limit."),
    "Ipratropium / albuterol": coverage("Tier 2", ["PA"], "Part B/D determination applies."),
    "Anoro Ellipta (brand)": coverage("Tier 3", ["QL"]),
    "Spiriva HandiHaler / Respimat (brand)": coverage("Tier 4", ["ST", "QL"], "Spiriva Respimat entry."),
    "Incruse Ellipta (brand)": coverage("Tier 3", ["QL"]),
    "Fluticasone / umeclidinium / vilanterol": coverage("Tier 3", ["QL"]),
    "Budesonide / glycopyrrolate / formoterol": coverage("Tier 3", ["QL"], "Breztri Aerosphere entry."),
    Revefenacin: coverage("Tier 5", ["PA", "QL"], "Yupelri entry; Part B/D determination applies."),
    "Fluticasone / vilanterol": coverage("Tier 3", ["QL"], "Breo Ellipta entry."),
    "Budesonide inhalation": coverage("Tier 3", ["PA", "QL"], "Part B/D determination applies."),
    "Budesonide (Flexhaler)": coverage("Tier 4", ["PA", "QL"], "Pulmicort entry; Part B/D determination applies."),
    "Fluticasone furoate": coverage("Tier 3", ["QL"], "Arnuity Ellipta entry."),
    "Fluticasone nasal": coverage("Tier 2", ["QL"]),
    Montelukast: coverage("Tier varies", ["QL"], "Tablets are Tier 1; granules are Tier 3."),
    Zafirlukast: coverage("Tier 4", ["QL"]),
    Benralizumab: coverage("Tier 5", ["PA", "QL"]),
    Omalizumab: coverage("Tier 5", ["PA", "QL", "LD"]),
    Mepolizumab: coverage("Tier 5", ["PA", "QL"], "Nucala entries."),
    Nintedanib: coverage("Tier 5", ["PA", "QL"]),
    Pirfenidone: coverage("Tier 5", ["PA", "QL"]),
    Roflumilast: coverage("Tier 4", ["PA", "QL"]),
    "Sildenafil 20 mg": coverage("Tier 3", ["PA", "QL"]),
    "Tadalafil for PAH": coverage("Tier 4", ["PA", "QL"]),
    "Glycopyrrolate / formoterol": coverage("Tier 2", ["QL"], "Bevespi entry."),
    "Fluticasone / salmeterol (generic)": coverage("Tier 2", ["QL"], "Generic DPI formulary entry."),
    "Budesonide / formoterol (generic)": coverage("Tier 1", ["QL"], "Generic budesonide-formoterol entry."),
    "Sotatercept-csrk": coverage("Tier 5", ["PA", "QL"], "Winrevair entry."),
    Ambrisentan: coverage("Tier 5", ["PA", "QL"], "Specialty distribution restriction applies."),
    Bosentan: coverage("Tier 5", ["PA"], "Specialty distribution restriction applies."),
    Prednisone: coverage("Tier varies", [], "Most tablets and dose packs are Tier 1; solution and 50 mg tablet vary."),
    Prednisolone: coverage("Tier varies", [], "Oral products range from Tier 3 to Tier 4."),
    Cetirizine: coverage("Tier 2", ["QL"], "Cetirizine oral solution entry."),
    Azithromycin: coverage("Tier 1"),
    "Amoxicillin / clavulanate": coverage("Tier varies", [], "Oral tablets are Tier 2; suspension and extended-release products vary."),
    Doxycycline: coverage("Tier varies", [], "Doxycycline hyclate products are Tier 1; other formulations vary."),
    Levofloxacin: coverage("Tier varies", [], "Oral tablet is Tier 2; solution is Tier 4."),
    Famotidine: coverage("Tier 1"),
    Pantoprazole: coverage("Tier 1", ["QL"]),
    Furosemide: coverage("Tier 1"),
    Lisinopril: coverage("Tier 1"),
    Losartan: coverage("Tier 1", ["QL"]),
    Amlodipine: coverage("Tier 1"),
    Atorvastatin: coverage("Tier 1", ["QL"]),
    Metformin: coverage("Tier 1"),
    Omeprazole: coverage("Tier 1", ["QL"]),
    Sertraline: coverage("Tier 1", ["QL"]),
    Ibuprofen: coverage("Tier varies", [], "Tablets are Tier 1; oral suspension is Tier 2."),
    "Tiotropium (generic capsule-inhaler)": coverage("Tier 4", ["QL"], "Tiotropium bromide entry."),
    Olodaterol: coverage("Tier 3", ["QL"], "Striverdi Respimat entry."),
    "Tobramycin inhalation": coverage("Tier 5", ["PA", "QL"], "Tobramycin inhalation solution entry; Part B/D and supply limits apply."),
    Ensifentrine: coverage("Tier 5", ["PA", "QL"], "Exact OHTUVAYRE entry, PA, QL 150 per 30 days, NDS, in HealthSpring formulary 00026096 for H3949-054/H7849-149."),
    "Aztreonam inhalation": coverage("Tier 5", ["PA", "QL", "LD"], "Exact CAYSTON entry, PA, LA, QL 84 per 28 days, NDS, in HealthSpring formulary 00026096 for H3949-054/H7849-149."),
    "Elexacaftor / tezacaftor / ivacaftor": coverage("Tier 5", ["PA", "QL"], "Trikafta sequential tablet and granule entries."),
    "Dornase alfa": coverage("Tier 5", ["PA", "QL"], "Pulmozyme entry; Part B/D determination applies."),
    Selexipag: coverage("Tier 5", ["PA", "QL"], "Uptravi entry."),
    "Treprostinil inhaled": coverage("Tier 5", ["PA"], "Tyvaso entry; Part B/D determination applies."),
    "Azelastine nasal": coverage("Tier 2", ["QL"]),
    Varenicline: coverage("Tier 4"),
    "Bupropion SR 150 mg": coverage("Tier 2", ["QL"]),
    "Epinephrine auto-injector": coverage("Tier 2", ["QL"]),
    Formoterol: coverage("Tier 4", ["PA", "QL"], "Formoterol fumarate entry; Part B/D determination applies."),
    Dupilumab: coverage("Tier 5", ["PA", "QL"], "Dupixent pen and syringe entries."),
    "Advair Diskus / HFA (brand)": coverage("Tier varies", ["QL"], "Advair HFA and generic fluticasone-salmeterol rows differ by product."),
    Riociguat: coverage("Tier 5", ["PA", "QL"], "Adempas entry."),
    Apixaban: coverage("Tier 3", [], "Eliquis entry; no additional restriction marker shown."),
  },
  cloverNj2026: {
    "Albuterol HFA": coverage("Tier 3", ["QL"], "Two inhalers per 30 days."),
    "Albuterol nebulizer solution": coverage("Tier varies", [], "Tier 2 or 3 depending NDC; Part B versus Part D determination applies."),
    Levalbuterol: coverage("Tier varies", ["ST", "QL"], "HFA is Tier 3 with step therapy/QL; nebulizer is Tier 4 with Part B/D determination."),
    Arformoterol: coverage("Tier 4", [], "Part B versus Part D determination applies."),
    Formoterol: coverage("Tier 4", [], "Part B versus Part D determination applies."),
    Salmeterol: coverage("Tier 3", ["QL"]),
    Ipratropium: coverage("Tier varies", ["QL"], "Nebulizer is Tier 2 with Part B/D determination; HFA is Tier 4 with QL."),
    "Ipratropium / albuterol": coverage("Tier varies", ["QL"], "Nebulizer is Tier 3 with Part B/D determination; Combivent is Tier 4 with QL."),
    "Spiriva HandiHaler / Respimat (brand)": coverage("Tier 4", ["QL"]),
    "Incruse Ellipta (brand)": coverage("Tier 3", ["QL"]),
    "Anoro Ellipta (brand)": coverage("Tier 3", ["QL"]),
    "Glycopyrrolate / formoterol": coverage("Tier 3", ["QL"], "Bevespi entry."),
    "Fluticasone / umeclidinium / vilanterol": coverage("Tier 3", ["QL"]),
    "Budesonide / glycopyrrolate / formoterol": coverage("Tier 3", ["QL"]),
    Roflumilast: coverage(
      "Tier 4",
      ["QL"],
      "250 mcg is limited to 56 tablets per year; 500 mcg is limited to 30 tablets per 30 days.",
    ),
    "Budesonide inhalation": coverage("Tier 4", [], "Part B versus Part D determination applies."),
    "Fluticasone furoate": coverage("Tier 3", ["QL"], "Arnuity Ellipta entry."),
    Ciclesonide: coverage("Tier 4", ["QL"], "Alvesco inhaler entries."),
    "Advair Diskus / HFA (brand)": coverage("Tier 3", ["QL"]),
    "Symbicort (brand)": coverage("Tier 3", ["QL"], "Budesonide-formoterol product entries."),
    "Mometasone / formoterol": coverage("Tier 4", ["QL"]),
    "Fluticasone / vilanterol": coverage("Tier 3", ["QL"]),
    "Albuterol / budesonide": coverage("Tier 3", ["QL"], "Airsupra entry."),
    "Fluticasone / salmeterol (generic)": coverage("Tier 3", ["QL"], "Generic DPI formulary entry."),
    Montelukast: coverage("Tier varies", [], "10 mg tablet is Tier 1; chewable is Tier 2; granule packet is Tier 4."),
    Zafirlukast: coverage("Tier 3"),
    Dupilumab: coverage("Tier 5", ["PA", "QL"], "Dupixent entry; not available by mail order."),
    Benralizumab: coverage("Tier 5", ["PA", "QL"], "Fasenra entry; not available by mail order."),
    Omalizumab: coverage("Tier 5", ["PA", "QL"], "Xolair entry; not available by mail order."),
    Nintedanib: coverage("Tier 5", ["PA", "QL"], "Ofev and nintedanib entries; not available by mail order."),
    Pirfenidone: coverage("Tier 5", ["PA", "QL"], "Pirfenidone entries; not available by mail order."),
    Ambrisentan: coverage("Tier 5", ["PA", "QL"], "Not available by mail order."),
    "Sildenafil 20 mg": coverage("Tier 3", ["PA", "QL"], "Pulmonary-hypertension entry; not available by mail order."),
    "Tadalafil for PAH": coverage("Tier 4", ["PA", "QL"], "Pulmonary-hypertension entry; not available by mail order."),
    Selexipag: coverage("Tier 5", ["PA", "QL"], "Uptravi entry; not available by mail order."),
    Riociguat: coverage("Tier 5", ["PA", "QL"], "Adempas entry; not available by mail order."),
    "Treprostinil inhaled": coverage("Tier 5", ["PA"], "Treprostinil solution entry; not available by mail order."),
    "Sotatercept-csrk": coverage("Tier 5", ["PA", "QL"], "Winrevair entry; not available by mail order."),
    Prednisone: coverage("Tier varies", [], "Most tablets are Tier 1; dose packs and liquid products vary."),
    Prednisolone: coverage("Tier varies", [], "Oral products range from Tier 2 to Tier 4."),
    Cetirizine: coverage("Tier 2", ["QL"]),
    Azithromycin: coverage("Tier varies", [], "Oral tablet and suspension product tiers vary."),
    Doxycycline: coverage("Tier varies", [], "Doxycycline hyclate and monohydrate product tiers vary."),
    Levofloxacin: coverage("Tier varies", [], "Oral tablet is Tier 1; oral solution is Tier 4."),
    Famotidine: coverage("Tier 1"),
    Pantoprazole: coverage("Tier 1"),
    Furosemide: coverage("Tier varies", [], "Oral tablets are Tier 1; solution is Tier 2."),
    Lisinopril: coverage("Tier 1"),
    Losartan: coverage("Tier varies", [], "Tier varies by strength."),
    Amlodipine: coverage("Tier 1"),
    Atorvastatin: coverage("Tier varies", [], "Tier varies by strength."),
    Metformin: coverage("Tier 1", ["QL"]),
    Omeprazole: coverage("Tier 1"),
    Sertraline: coverage("Tier 1"),
    Ibuprofen: coverage("Tier varies", [], "Oral tablets are Tier 1; suspension is Tier 3."),
    "Amoxicillin / clavulanate": coverage("Tier varies", [], "Clover lists suspension products in Tiers 3-4 and tablet products in Tiers 2-3."),
    "Tobramycin inhalation": coverage("Tier 5", ["PA"], "Tobramycin nebulizer and Tobi Podhaler entries; not available by mail order."),
    "Dornase alfa": coverage("Tier 5", ["PA"], "Pulmozyme entry; not available by mail order."),
    "Elexacaftor / tezacaftor / ivacaftor": coverage("Tier 5", ["PA", "QL"], "Trikafta entry; not available by mail order."),
    "Fluticasone nasal": coverage("Tier 2", ["QL"], "Fluticasone propionate nasal spray entry."),
    "Azelastine nasal": coverage("Tier 2", [], "Azelastine 0.1% nasal solution entry."),
    "Epinephrine auto-injector": coverage("Tier 3", [], "Generic EpiPen and Adrenaclick entries."),
    Varenicline: coverage("Tier 4", ["QL"], "Varenicline tablet and starter-pack entries."),
    "Bupropion SR 150 mg": coverage("Tier 2", ["QL"], "Sustained-release 150 mg smoking-cessation entry."),
    Bosentan: coverage("Tier 5", ["PA", "QL"], "Bosentan tablet entry."),
    "Budesonide / formoterol (generic)": coverage("Tier 3", ["QL"], "Exact Breyna 80/4.5 and 160/4.5 mcg entries, QL 3 inhalers per 30 days, in Clover formulary 00026082."),
    "Aztreonam inhalation": coverage("Tier 5", ["PA"], "Exact CAYSTON SOLR 75 mg entry, NM and PA, in Clover formulary 00026082."),
    Apixaban: coverage("Tier 3", ["QL"], "Exact ELIQUIS 2.5 mg and 5 mg tablet entries, QL, in Clover formulary 00026082."),
  },
  wellpointNjFamilyCare: {
    "Albuterol HFA": coverage("Listed in PDL", ["QL"], "Albuterol sulfate HFA entry."),
    "Albuterol nebulizer solution": coverage("Listed in PDL", ["QL"], "Albuterol sulfate nebulization solution entry."),
    Salmeterol: coverage("Listed in PDL", ["QL"], "Serevent Diskus entry."),
    Ipratropium: coverage("Listed in PDL", ["QL"], "Atrovent HFA and ipratropium nebulization entries."),
    "Ipratropium / albuterol": coverage("Listed in PDL", ["QL"], "Ipratropium-albuterol inhalation solution entry."),
    "Spiriva HandiHaler / Respimat (brand)": coverage("Listed in PDL", ["QL"], "Spiriva Respimat entry."),
    "Anoro Ellipta (brand)": coverage("Listed in PDL", ["QL"], "Umeclidinium-vilanterol / Anoro Ellipta entry."),
    "Tiotropium / olodaterol": coverage("Listed in PDL", ["QL"], "Stiolto Respimat entry."),
    Roflumilast: coverage("Listed in PDL", ["QL"], "Roflumilast / Daliresp entry."),
    "Budesonide inhalation": coverage("Listed in PDL", ["QL"], "Budesonide nebulization / Pulmicort entry."),
    "Fluticasone furoate": coverage("Listed in PDL", ["QL"], "Arnuity Ellipta entry."),
    "Fluticasone propionate HFA 44 mcg": coverage("Listed in PDL", ["QL"], "Fluticasone propionate HFA entry."),
    "Budesonide / formoterol (generic)": coverage("Listed in PDL", ["QL"], "Budesonide-formoterol / Breyna entry."),
    "Fluticasone / salmeterol (generic)": coverage("Listed in PDL", ["QL"], "Fluticasone-salmeterol / Wixela Inhub entry."),
    Montelukast: coverage("Listed in PDL", ["QL"], "Montelukast / Singulair entries."),
    Zafirlukast: coverage("Listed in PDL", ["QL"]),
    Dupilumab: coverage("Listed in PDL", ["PA", "SP", "QL"], "Dupixent entry."),
    Omalizumab: coverage("Listed in PDL", ["PA", "SP", "QL"], "Xolair entry."),
    Ambrisentan: coverage("Listed in PDL", ["PA", "SP", "QL"], "Letairis entry."),
    "Sildenafil 20 mg": coverage("Listed in PDL", ["PA", "SP", "QL"], "Sildenafil / Revatio entry for pulmonary hypertension."),
    "Tadalafil for PAH": coverage("Listed in PDL", ["PA", "SP", "QL"], "Tadalafil PAH / Alyq entry."),
    "Tobramycin inhalation": coverage("Listed in PDL", ["SP", "QL"], "Bethkis entry."),
    Arformoterol: coverage("Listed in PDL", ["QL"], "Arformoterol tartrate 15 mcg/2 mL nebulization solution, Non-Preferred, QL. Wellpoint NJ Medicaid feed version 79, effective 2026-08-01."),
    Formoterol: coverage("Listed in PDL", ["QL"], "Formoterol fumarate 20 mcg/2 mL nebulization solution, Non-Preferred, QL. Wellpoint NJ Medicaid feed version 79, effective 2026-08-01."),
    "Tiotropium (generic capsule-inhaler)": coverage("Listed in PDL", ["PA", "QL"], "Tiotropium bromide 18 mcg inhalation capsule, Non-Preferred, PA and QL. Representative NDC 68180-0964-12. Wellpoint NJ Medicaid feed version 79, effective 2026-08-01."),
    "Incruse Ellipta (brand)": coverage("Listed in PDL", ["PA", "QL"], "Incruse Ellipta 62.5 mcg/actuation, Non-Preferred, PA and QL. Representative NDC 00173-0873-06. Wellpoint NJ Medicaid feed version 79, effective 2026-08-01."),
    "Glycopyrrolate / formoterol": coverage("Listed in PDL", ["PA", "QL"], "Bevespi Aerosphere 9/4.8 mcg per actuation, Non-Preferred, PA and QL. Representative NDC 00310-4600-12. Wellpoint NJ Medicaid feed version 79, effective 2026-08-01."),
    Revefenacin: coverage("Listed in PDL", ["PA", "QL"], "Yupelri 175 mcg/3 mL nebulization solution, Non-Preferred, PA and QL. Representative NDC 49502-0806-32. Wellpoint NJ Medicaid feed version 79, effective 2026-08-01."),
    Olodaterol: coverage("Listed in PDL", ["QL"], "Striverdi Respimat 2.5 mcg/actuation, Non-Preferred, QL. Representative NDC 00597-0192-61. Wellpoint NJ Medicaid feed version 79, effective 2026-08-01."),
    Aclidinium: coverage("Listed in PDL", ["PA", "QL"], "Tudorza Pressair 400 mcg/actuation, Non-Preferred, PA and QL. Representative NDC 00310-0800-39. Wellpoint NJ Medicaid feed version 79, effective 2026-08-01."),
    Ensifentrine: coverage("Listed in PDL", ["PA", "QL"], "Ohtuvayre 3 mg/2.5 mL suspension, Non-Preferred, PA and QL. Representative NDC 83034-0003-60. Wellpoint NJ Medicaid feed version 79, effective 2026-08-01."),
    "Albuterol / budesonide": coverage("Listed in PDL", ["PA", "QL"], "Airsupra 90/80 mcg per actuation, Non-Preferred, PA and QL. Representative NDC 00310-9080-12. Wellpoint NJ Medicaid feed version 79, effective 2026-08-01."),
    "Zileuton ER": coverage("Listed in PDL", ["PA", "QL"], "Zileuton ER 600 mg extended-release tablet, Non-Preferred, PA and QL. Wellpoint NJ Medicaid feed version 79, effective 2026-08-01."),
    Reslizumab: coverage("Listed in PDL", [], "Cinqair 100 mg/10 mL intravenous solution, Non-Preferred, no PA or QL flag in the feed. Wellpoint NJ Medicaid feed version 79, effective 2026-08-01."),
    "Aztreonam inhalation": coverage("Listed in PDL", ["QL"], "Cayston 75 mg inhalation solution, Non-Preferred, QL. Representative NDC 61958-0901-01. Wellpoint NJ Medicaid feed version 79, effective 2026-08-01."),
    "Dornase alfa": coverage("Listed in PDL", ["PA", "QL"], "Pulmozyme 2.5 mg/2.5 mL inhalation solution, Preferred, PA and QL. Representative NDC 50242-0100-39. Wellpoint NJ Medicaid feed version 79, effective 2026-08-01."),
  },
};

export const coverageFor = (medication: Medication, plan: PlanKey): Coverage => {
  const coveragePlan = plan === "oxfordFreedom" ? "uhcCommercial" : plan;
  return (
    planCoverageOverrides[plan]?.[medication.generic] ??
    planCoverageOverrides[coveragePlan]?.[medication.generic] ??
    medication.coverage[coveragePlan] ??
    coverage("Source loading", [], "No exact product row has been mapped for this formulary source.")
  );
};

const branches = [
  "All areas",
  ...Array.from(new Set(medications.map((med) => med.branch))),
];
const toneForState = (state: CoverageState) => {
  if (
    ["Preferred", "Tier 0", "Tier 1", "Tier 1A", "Tier 1B", "Generic", "Low-cost generic", "Preferred brand"].includes(
      state,
    )
  )
    return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (state === "Listed in PDL") return "bg-teal-50 text-teal-800 ring-teal-200";
  if (state.includes("PA") || state.startsWith("Tier"))
    return "bg-amber-50 text-amber-900 ring-amber-200";
  if (state === "Non-preferred" || state === "Non-preferred drug" || state === "Non-formulary")
    return "bg-rose-50 text-rose-800 ring-rose-200";
  return "bg-slate-100 text-slate-600 ring-slate-200";
};
const displayState = (state: CoverageState) =>
  state === "Preferred"
    ? "Plan preferred"
    : state === "Preferred + PA"
      ? "Plan preferred + PA"
      : state === "Preferred brand"
      ? "Plan preferred brand"
      : state === "Listed in PDL"
        ? "Listed in source PDL"
    : state === "Not on PDL"
    ? "Not listed"
    : state === "Source loading"
      ? "Unconfirmed"
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
  ["Preferred", "Tier 0", "Tier 1", "Tier 1A", "Tier 1B", "Generic", "Low-cost generic", "Preferred brand"].includes(
    state,
  );
const isSourceListedCoverage = (state: CoverageState) =>
  !["Source loading", "Not on PDL", "Non-formulary"].includes(state);
const isCoveredBySource = (state: CoverageState) =>
  ![
    "Source loading",
    "Not on PDL",
    "Non-formulary",
    "Non-preferred drug",
  ].includes(state);
const actionForCoverage = (state: CoverageState) => {
  if (state === "Listed in PDL")
    return "Listed in the source PDL. Confirm the member's exact pharmacy benefit, tier, cost, and current restrictions.";
  if (isStraightforwardCoverage(state))
    return "Source-listed on the published tier shown here. Verify the exact product, benefit, and current restrictions.";
  if (state === "Tier varies")
    return "Source-listed, but the published tier differs by product, strength, or dosage form. Check the product detail below.";
  if (state.includes("PA"))
    return "Source-listed with prior-authorization requirements. Review the criteria before prescribing.";
  if (state.startsWith("Tier"))
    return "Source-listed on a higher published tier. Check restrictions and preferred options.";
  if (state === "Source loading")
    return "Please verify coverage directly with the insurer. We could not find an official source for this exact medication and plan combination. It may still be covered; confirm before submitting prior authorization.";
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
    | "check"
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
    check: <path d="m5 12 4 4L19 6" />,
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
  const medicationDetailRef = useRef<HTMLElement | null>(null);
  const coverageQuickSearchRef = useRef<HTMLInputElement | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [insurerQuery, setInsurerQuery] = useState("");
  const [selectedInsurerName, setSelectedInsurerName] = useState<string | null>(
    null,
  );
  const [showAllInsurerWorkflows, setShowAllInsurerWorkflows] = useState(false);
  const [planIntake, setPlanIntake] = useState<PlanIntake>({
    insurer: "",
    planKind: "Commercial / employer",
    planName: "",
    pharmacyBenefit: "",
  });
  const [submittedPlanIntake, setSubmittedPlanIntake] = useState<PlanIntake | null>(null);
  const planIntakeRef = useRef<HTMLElement | null>(null);
  const planIntakeInsurerRef = useRef<HTMLInputElement | null>(null);
  const medicareFinderRef = useRef<HTMLElement | null>(null);
  const medicareSearchRef = useRef<HTMLInputElement | null>(null);
  const [medicareBenefitType, setMedicareBenefitType] = useState<"ma" | "pdp">("ma");
  const [medicareQuery, setMedicareQuery] = useState("");
  const [medicarePlans, setMedicarePlans] = useState<
    Array<{
      contract_id: string;
      plan_id: string;
      segment_id: string;
      plan_name: string;
      formulary_id: string;
      plan_type: string;
      county_codes: string[];
    }>
  >([]);
  const [medicarePlanLoading, setMedicarePlanLoading] = useState(false);
  const [medicarePlanError, setMedicarePlanError] = useState(false);
  const [selectedMedicarePlan, setSelectedMedicarePlan] = useState<{
    contract_id: string;
    plan_id: string;
    segment_id: string;
    plan_name: string;
    formulary_id: string;
    plan_type: string;
    county_codes: string[];
  } | null>(null);
  const [medicareCoverageLoading, setMedicareCoverageLoading] = useState(false);
  const [selectedMedicareCoverage, setSelectedMedicareCoverage] = useState<{
    source: { source_version: string; imported_at: string };
    plan: { formulary_id: string; plan_name: string };
    medication: string;
    matchedTerms: string[];
    productRxcuiCount: number;
    coverage: Array<{
      rxcui: string | null;
      ndc: string | null;
      tier_level: number | null;
      prior_authorization: boolean;
      quantity_limit: boolean;
      quantity_limit_amount: string | null;
      quantity_limit_days: string | null;
      step_therapy: boolean;
    }>;
  } | null>(null);
  const publicCoverageFinderRef = useRef<HTMLElement | null>(null);
  const publicPlanMedicationRef = useRef<HTMLInputElement | null>(null);
  const uhcQhpPlanRef = useRef<HTMLInputElement | null>(null);
  const aetnaFamilyCareDrugRef = useRef<HTMLInputElement | null>(null);
  const uhcCommunityDrugRef = useRef<HTMLInputElement | null>(null);
  const fidelisFamilyCareDrugRef = useRef<HTMLInputElement | null>(null);
  const horizonNjHealthDrugRef = useRef<HTMLInputElement | null>(null);
  const wellpointNjFamilyCareDrugRef = useRef<HTMLInputElement | null>(null);
  const [uhcQhpPlanQuery, setUhcQhpPlanQuery] = useState("");
  const [uhcQhpPlans, setUhcQhpPlans] = useState<UhcNjQhpPlan[]>([]);
  const [selectedUhcQhpPlan, setSelectedUhcQhpPlan] = useState<UhcNjQhpPlan | null>(null);
  const [uhcQhpDrugQuery, setUhcQhpDrugQuery] = useState("");
  const [uhcQhpDrugs, setUhcQhpDrugs] = useState<UhcNjQhpDrug[]>([]);
  const [selectedUhcQhpDrug, setSelectedUhcQhpDrug] = useState<UhcNjQhpDrug | null>(null);
  const [uhcQhpCoverage, setUhcQhpCoverage] = useState<UhcNjQhpCoverage | null>(null);
  const [uhcQhpCoverageRequest, setUhcQhpCoverageRequest] = useState(0);
  const [uhcQhpLoading, setUhcQhpLoading] = useState(false);
  const [uhcQhpError, setUhcQhpError] = useState(false);
  const [aetnaFamilyCareDrugQuery, setAetnaFamilyCareDrugQuery] = useState("");
  const [aetnaFamilyCareSuggestions, setAetnaFamilyCareSuggestions] = useState<AetnaNjFamilyCareSuggestion[]>([]);
  const [selectedAetnaFamilyCareNdc, setSelectedAetnaFamilyCareNdc] = useState("");
  const [aetnaFamilyCareCoverage, setAetnaFamilyCareCoverage] = useState<AetnaNjFamilyCareCoverage | null>(null);
  const [aetnaFamilyCareCoverageRequest, setAetnaFamilyCareCoverageRequest] = useState(0);
  const [aetnaFamilyCareLoading, setAetnaFamilyCareLoading] = useState(false);
  const [aetnaFamilyCareError, setAetnaFamilyCareError] = useState(false);
  const [uhcCommunityDrugQuery, setUhcCommunityDrugQuery] = useState("");
  const [uhcCommunityDrugs, setUhcCommunityDrugs] = useState<UhcNjCommunityDrug[]>([]);
  const [selectedUhcCommunityDrug, setSelectedUhcCommunityDrug] = useState<UhcNjCommunityDrug | null>(null);
  const [uhcCommunityCoverage, setUhcCommunityCoverage] = useState<UhcNjCommunityCoverage | null>(null);
  const [uhcCommunityLoading, setUhcCommunityLoading] = useState(false);
  const [uhcCommunityError, setUhcCommunityError] = useState(false);
  const [fidelisFamilyCareDrugQuery, setFidelisFamilyCareDrugQuery] = useState("");
  const [fidelisFamilyCareDrugs, setFidelisFamilyCareDrugs] = useState<FidelisNjFamilyCareDrug[]>([]);
  const [selectedFidelisFamilyCareDrug, setSelectedFidelisFamilyCareDrug] = useState<FidelisNjFamilyCareDrug | null>(null);
  const [fidelisFamilyCareCoverage, setFidelisFamilyCareCoverage] = useState<FidelisNjFamilyCareCoverage | null>(null);
  const [fidelisFamilyCareLoading, setFidelisFamilyCareLoading] = useState(false);
  const [fidelisFamilyCareError, setFidelisFamilyCareError] = useState(false);
  const [horizonNjHealthDrugQuery, setHorizonNjHealthDrugQuery] = useState("");
  const [horizonNjHealthDrugs, setHorizonNjHealthDrugs] = useState<HorizonNjHealthDrug[]>([]);
  const [selectedHorizonNjHealthDrug, setSelectedHorizonNjHealthDrug] = useState<HorizonNjHealthDrug | null>(null);
  const [horizonNjHealthCoverage, setHorizonNjHealthCoverage] = useState<HorizonNjHealthCoverage | null>(null);
  const [horizonNjHealthLoading, setHorizonNjHealthLoading] = useState(false);
  const [horizonNjHealthError, setHorizonNjHealthError] = useState(false);
  const [wellpointNjFamilyCareDrugQuery, setWellpointNjFamilyCareDrugQuery] = useState("");
  const [wellpointNjFamilyCareDrugs, setWellpointNjFamilyCareDrugs] = useState<WellpointNjFamilyCareDrug[]>([]);
  const [selectedWellpointNjFamilyCareDrug, setSelectedWellpointNjFamilyCareDrug] = useState<WellpointNjFamilyCareDrug | null>(null);
  const [wellpointNjFamilyCareCoverage, setWellpointNjFamilyCareCoverage] = useState<WellpointNjFamilyCareCoverage | null>(null);
  const [wellpointNjFamilyCareLoading, setWellpointNjFamilyCareLoading] = useState(false);
  const [wellpointNjFamilyCareError, setWellpointNjFamilyCareError] = useState(false);
  const [publicPlanMedicationQuery, setPublicPlanMedicationQuery] = useState("");
  const [selectedPublicPlanMedication, setSelectedPublicPlanMedication] = useState<Medication | null>(null);
  const [publicPlanCoverageVisible, setPublicPlanCoverageVisible] = useState(false);
  useEffect(() => {
    const search = medicareQuery.trim();
    if (search.length < 2) {
      setMedicarePlans([]);
      setMedicarePlanLoading(false);
      return;
    }
    const controller = new AbortController();
    setMedicarePlanLoading(true);
    setMedicarePlanError(false);
    const timeout = window.setTimeout(() => {
      fetch(`/api/medicare/plans?q=${encodeURIComponent(search)}&state=NJ&benefitType=${medicareBenefitType}`, {
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) throw new Error("Medicare plans unavailable");
          return response.json();
        })
        .then((payload) => setMedicarePlans(payload.plans ?? []))
        .catch((error) => {
          if (error.name !== "AbortError") {
            setMedicarePlans([]);
            setMedicarePlanError(true);
          }
        })
        .finally(() => setMedicarePlanLoading(false));
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [medicareQuery, medicareBenefitType]);
  useEffect(() => {
    if (!selectedMedicarePlan || !selected) {
      setSelectedMedicareCoverage(null);
      setMedicareCoverageLoading(false);
      return;
    }
    const controller = new AbortController();
    setMedicareCoverageLoading(true);
    fetch(
      `/api/medicare/coverage?contractId=${encodeURIComponent(selectedMedicarePlan.contract_id)}&planId=${encodeURIComponent(selectedMedicarePlan.plan_id)}&segmentId=${encodeURIComponent(selectedMedicarePlan.segment_id)}&medication=${encodeURIComponent(selected.generic)}`,
      { signal: controller.signal },
    )
      .then((response) => {
        if (!response.ok) throw new Error("Medicare coverage unavailable");
        return response.json();
      })
      .then((payload) => setSelectedMedicareCoverage(payload))
      .catch((error) => {
        if (error.name !== "AbortError") setSelectedMedicareCoverage(null);
      })
      .finally(() => setMedicareCoverageLoading(false));
    return () => controller.abort();
  }, [selectedMedicarePlan, selected]);
  useEffect(() => {
    const search = uhcQhpPlanQuery.trim();
    if (search.length < 2) {
      setUhcQhpPlans([]);
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setUhcQhpLoading(true);
      setUhcQhpError(false);
      fetch(`/api/uhc-nj-qhp/plans?q=${encodeURIComponent(search)}`, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error("UHC NJ Marketplace plans unavailable");
          return response.json();
        })
        .then((payload) => setUhcQhpPlans(payload.plans ?? []))
        .catch((error) => {
          if (error.name !== "AbortError") {
            setUhcQhpPlans([]);
            setUhcQhpError(true);
          }
        })
        .finally(() => setUhcQhpLoading(false));
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [uhcQhpPlanQuery]);
  useEffect(() => {
    const search = uhcQhpDrugQuery.trim();
    if (search.length < 2) {
      setUhcQhpDrugs([]);
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setUhcQhpLoading(true);
      setUhcQhpError(false);
      fetch(`/api/uhc-nj-qhp/drugs?q=${encodeURIComponent(search)}&limit=12`, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error("UHC NJ Marketplace drugs unavailable");
          return response.json();
        })
        .then((payload) => setUhcQhpDrugs(payload.drugs ?? []))
        .catch((error) => {
          if (error.name !== "AbortError") {
            setUhcQhpDrugs([]);
            setUhcQhpError(true);
          }
        })
        .finally(() => setUhcQhpLoading(false));
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [uhcQhpDrugQuery]);
  useEffect(() => {
    if (!selectedUhcQhpPlan || !selectedUhcQhpDrug || !uhcQhpCoverageRequest) {
      setUhcQhpCoverage(null);
      setUhcQhpLoading(false);
      return;
    }
    const controller = new AbortController();
    setUhcQhpLoading(true);
    setUhcQhpError(false);
    fetch(`/api/uhc-nj-qhp/coverage?planId=${encodeURIComponent(selectedUhcQhpPlan.planId)}&rxcui=${encodeURIComponent(selectedUhcQhpDrug.rxcui)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("UHC NJ Marketplace coverage unavailable");
        return response.json();
      })
      .then((payload) => setUhcQhpCoverage(payload))
      .catch((error) => {
        if (error.name !== "AbortError") {
          setUhcQhpCoverage(null);
          setUhcQhpError(true);
        }
      })
      .finally(() => setUhcQhpLoading(false));
    return () => controller.abort();
  }, [selectedUhcQhpPlan, selectedUhcQhpDrug, uhcQhpCoverageRequest]);
  useEffect(() => {
    const search = aetnaFamilyCareDrugQuery.trim();
    if (search.length < 2) {
      setAetnaFamilyCareSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setAetnaFamilyCareLoading(true);
      setAetnaFamilyCareError(false);
      fetch(`/api/aetna-nj-familycare/drugs?q=${encodeURIComponent(search)}&limit=10`, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error("Aetna NJ FamilyCare formulary unavailable");
          return response.json();
        })
        .then((payload) => setAetnaFamilyCareSuggestions(payload.suggestions ?? []))
        .catch((error) => {
          if (error.name !== "AbortError") {
            setAetnaFamilyCareSuggestions([]);
            setAetnaFamilyCareError(true);
          }
        })
        .finally(() => setAetnaFamilyCareLoading(false));
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [aetnaFamilyCareDrugQuery]);
  useEffect(() => {
    if (!selectedAetnaFamilyCareNdc || !aetnaFamilyCareCoverageRequest) {
      setAetnaFamilyCareCoverage(null);
      setAetnaFamilyCareLoading(false);
      return;
    }
    const controller = new AbortController();
    setAetnaFamilyCareLoading(true);
    setAetnaFamilyCareError(false);
    fetch(`/api/aetna-nj-familycare/coverage?ndc=${encodeURIComponent(selectedAetnaFamilyCareNdc)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Aetna NJ FamilyCare coverage unavailable");
        return response.json();
      })
      .then((payload) => setAetnaFamilyCareCoverage(payload))
      .catch((error) => {
        if (error.name !== "AbortError") {
          setAetnaFamilyCareCoverage(null);
          setAetnaFamilyCareError(true);
        }
      })
      .finally(() => setAetnaFamilyCareLoading(false));
    return () => controller.abort();
  }, [selectedAetnaFamilyCareNdc, aetnaFamilyCareCoverageRequest]);
  useEffect(() => {
    const search = uhcCommunityDrugQuery.trim();
    if (search.length < 2) {
      setUhcCommunityDrugs([]);
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setUhcCommunityLoading(true);
      setUhcCommunityError(false);
      fetch(`/api/uhc-nj-community/drugs?q=${encodeURIComponent(search)}&limit=12`, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error("UHC Community NJ formulary unavailable");
          return response.json();
        })
        .then((payload) => setUhcCommunityDrugs(payload.drugs ?? []))
        .catch((error) => {
          if (error.name !== "AbortError") {
            setUhcCommunityDrugs([]);
            setUhcCommunityError(true);
          }
        })
        .finally(() => setUhcCommunityLoading(false));
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [uhcCommunityDrugQuery]);
  useEffect(() => {
    if (!selectedUhcCommunityDrug) {
      setUhcCommunityCoverage(null);
      setUhcCommunityLoading(false);
      return;
    }
    const controller = new AbortController();
    setUhcCommunityLoading(true);
    setUhcCommunityError(false);
    fetch(`/api/uhc-nj-community/coverage?rxcui=${encodeURIComponent(selectedUhcCommunityDrug.rxcui)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("UHC Community NJ coverage unavailable");
        return response.json();
      })
      .then((payload) => setUhcCommunityCoverage(payload))
      .catch((error) => {
        if (error.name !== "AbortError") {
          setUhcCommunityCoverage(null);
          setUhcCommunityError(true);
        }
      })
      .finally(() => setUhcCommunityLoading(false));
    return () => controller.abort();
  }, [selectedUhcCommunityDrug]);
  useEffect(() => {
    const search = fidelisFamilyCareDrugQuery.trim();
    if (search.length < 2) {
      setFidelisFamilyCareDrugs([]);
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setFidelisFamilyCareLoading(true);
      setFidelisFamilyCareError(false);
      fetch(`/api/fidelis-nj-familycare/drugs?q=${encodeURIComponent(search)}&limit=12`, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error("Fidelis NJ FamilyCare formulary unavailable");
          return response.json();
        })
        .then((payload) => setFidelisFamilyCareDrugs(payload.drugs ?? []))
        .catch((error) => {
          if (error.name !== "AbortError") {
            setFidelisFamilyCareDrugs([]);
            setFidelisFamilyCareError(true);
          }
        })
        .finally(() => setFidelisFamilyCareLoading(false));
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [fidelisFamilyCareDrugQuery]);
  useEffect(() => {
    if (!selectedFidelisFamilyCareDrug) {
      setFidelisFamilyCareCoverage(null);
      setFidelisFamilyCareLoading(false);
      return;
    }
    const controller = new AbortController();
    setFidelisFamilyCareLoading(true);
    setFidelisFamilyCareError(false);
    fetch(`/api/fidelis-nj-familycare/coverage?id=${encodeURIComponent(selectedFidelisFamilyCareDrug.id)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Fidelis NJ FamilyCare coverage unavailable");
        return response.json();
      })
      .then((payload) => setFidelisFamilyCareCoverage(payload))
      .catch((error) => {
        if (error.name !== "AbortError") {
          setFidelisFamilyCareCoverage(null);
          setFidelisFamilyCareError(true);
        }
      })
      .finally(() => setFidelisFamilyCareLoading(false));
    return () => controller.abort();
  }, [selectedFidelisFamilyCareDrug]);
  useEffect(() => {
    const search = horizonNjHealthDrugQuery.trim();
    if (search.length < 2) {
      setHorizonNjHealthDrugs([]);
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setHorizonNjHealthLoading(true);
      setHorizonNjHealthError(false);
      fetch(`/api/horizon-nj-health/drugs?q=${encodeURIComponent(search)}&limit=12`, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error("Horizon NJ Health formulary unavailable");
          return response.json();
        })
        .then((payload) => setHorizonNjHealthDrugs(payload.drugs ?? []))
        .catch((error) => {
          if (error.name !== "AbortError") {
            setHorizonNjHealthDrugs([]);
            setHorizonNjHealthError(true);
          }
        })
        .finally(() => setHorizonNjHealthLoading(false));
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [horizonNjHealthDrugQuery]);
  useEffect(() => {
    if (!selectedHorizonNjHealthDrug) {
      setHorizonNjHealthCoverage(null);
      setHorizonNjHealthLoading(false);
      return;
    }
    const controller = new AbortController();
    setHorizonNjHealthLoading(true);
    setHorizonNjHealthError(false);
    fetch(`/api/horizon-nj-health/coverage?id=${encodeURIComponent(selectedHorizonNjHealthDrug.id)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Horizon NJ Health coverage unavailable");
        return response.json();
      })
      .then((payload) => setHorizonNjHealthCoverage(payload))
      .catch((error) => {
        if (error.name !== "AbortError") {
          setHorizonNjHealthCoverage(null);
          setHorizonNjHealthError(true);
        }
      })
      .finally(() => setHorizonNjHealthLoading(false));
    return () => controller.abort();
  }, [selectedHorizonNjHealthDrug]);
  useEffect(() => {
    const search = wellpointNjFamilyCareDrugQuery.trim();
    if (search.length < 2) {
      setWellpointNjFamilyCareDrugs([]);
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setWellpointNjFamilyCareLoading(true);
      setWellpointNjFamilyCareError(false);
      fetch(`/api/wellpoint-nj-familycare/drugs?q=${encodeURIComponent(search)}&limit=12`, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error("Wellpoint NJ FamilyCare formulary unavailable");
          return response.json();
        })
        .then((payload) => setWellpointNjFamilyCareDrugs(payload.drugs ?? []))
        .catch((error) => {
          if (error.name !== "AbortError") {
            setWellpointNjFamilyCareDrugs([]);
            setWellpointNjFamilyCareError(true);
          }
        })
        .finally(() => setWellpointNjFamilyCareLoading(false));
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [wellpointNjFamilyCareDrugQuery]);
  useEffect(() => {
    if (!selectedWellpointNjFamilyCareDrug) {
      setWellpointNjFamilyCareCoverage(null);
      setWellpointNjFamilyCareLoading(false);
      return;
    }
    const controller = new AbortController();
    setWellpointNjFamilyCareLoading(true);
    setWellpointNjFamilyCareError(false);
    fetch(`/api/wellpoint-nj-familycare/coverage?id=${encodeURIComponent(selectedWellpointNjFamilyCareDrug.id)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Wellpoint NJ FamilyCare coverage unavailable");
        return response.json();
      })
      .then((payload) => setWellpointNjFamilyCareCoverage(payload))
      .catch((error) => {
        if (error.name !== "AbortError") {
          setWellpointNjFamilyCareCoverage(null);
          setWellpointNjFamilyCareError(true);
        }
      })
      .finally(() => setWellpointNjFamilyCareLoading(false));
    return () => controller.abort();
  }, [selectedWellpointNjFamilyCareDrug]);
  const selectMedication = (medication: Medication) => {
    setSelected(medication);
    window.requestAnimationFrame(() => {
      medicationDetailRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };
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
      ? referencePlans
      : referencePlans.filter((plan) => plan.key === planFilter);
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
          isSourceListedCoverage(coverageFor(candidate, planKey).state),
      )
      .slice(0, 3);
  const summitNjDirectory = summitNjInsurers.filter((insurer) =>
    [insurer.name, insurer.category, insurer.note]
      .join(" ")
      .toLowerCase()
      .includes(insurerQuery.trim().toLowerCase()),
  );
  const selectedInsurer = selectedInsurerName
    ? summitNjInsurers.find((insurer) => insurer.name === selectedInsurerName) ?? null
    : null;
  const selectedWorkflow = selectedInsurer
    ? clinicalWorkflowFor(selectedInsurer)
    : null;
  const intakeInsurer = submittedPlanIntake?.insurer
    ? summitNjInsurers.find((insurer) => insurer.name === submittedPlanIntake.insurer) ?? null
    : null;
  const intakeWorkflow = intakeInsurer
    ? clinicalWorkflowFor(intakeInsurer)
    : null;
  const intakeMatch = submittedPlanIntake ? planIntakeMatchFor(submittedPlanIntake) : null;
  const recognizedPlanIntakeInsurer = summitNjInsurers.find(
    (insurer) => insurer.name === planIntake.insurer.trim(),
  );
  const availablePlanKinds = planKindsForInsurer(planIntake.insurer.trim());
  const availablePlanNames = planNameOptionsFor(planIntake.insurer.trim(), planIntake.planKind);
  const availablePharmacyBenefits = pharmacyBenefitOptionsFor(
    planIntake.insurer.trim(),
    planIntake.planKind,
  );
  const isExactPublicWorkflow =
    (planIntake.insurer === "UnitedHealthcare" &&
      planIntake.planKind === "ACA marketplace / individual") ||
    (planIntake.insurer === "Aetna" &&
      planIntake.planKind === "Medicaid / public coverage") ||
    (planIntake.insurer === "UnitedHealthcare" &&
      planIntake.planKind === "Medicaid / public coverage") ||
    (planIntake.insurer === "Fidelis Care" &&
      planIntake.planKind === "Medicaid / public coverage") ||
    (planIntake.insurer === "Horizon NJ Health" &&
      planIntake.planKind === "Medicaid / public coverage" &&
      ["Horizon NJ Health NJ FamilyCare", "Horizon NJ Health Medicaid", "Horizon NJ Health formulary"].includes(planIntake.planName.trim())) ||
    (planIntake.insurer === "Wellpoint" &&
      planIntake.planKind === "Medicaid / public coverage" &&
      ["Wellpoint New Jersey FamilyCare PDL", "Wellpoint NJ FamilyCare", "Wellpoint Medicaid PDL"].includes(planIntake.planName.trim())) ||
    (planIntake.insurer === "Horizon BCBSNJ" &&
      planIntake.planKind === "ACA marketplace / individual") ||
    (planIntake.insurer === "Horizon BCBSNJ" &&
      planIntake.planKind === "Commercial / employer" &&
      ["Horizon Classic", "Horizon Classic Formulary"].includes(planIntake.planName.trim())) ||
    (planIntake.insurer === "AmeriHealth / AmeriHealth Administrators" &&
      planIntake.planKind === "ACA marketplace / individual") ||
    (planIntake.insurer === "Anthem BCBS" &&
      planIntake.planKind === "ACA marketplace / individual") ||
    (planIntake.insurer === "UnitedHealthcare" &&
      planIntake.planKind === "Commercial / employer" &&
      ["UHC Commercial", "UnitedHealthcare Commercial PDL baseline"].includes(planIntake.planName.trim())) ||
    (planIntake.insurer === "Oxford Health" &&
      planIntake.planKind === "Commercial / employer" &&
      ["Oxford Freedom", "Oxford Freedom Network commercial PDL baseline"].includes(planIntake.planName.trim())) ||
    (planIntake.insurer === "Cigna" &&
      planIntake.planKind === "Commercial / employer" &&
      ["Cigna 3-Tier", "Cigna National Preferred 3-Tier employer formulary"].includes(planIntake.planName.trim())) ||
    planIntake.planKind === "Medicare Advantage" ||
    planIntake.planKind === "Standalone Medicare Part D (Original / Railroad Medicare)" ||
    ["Original Medicare", "Railroad Medicare"].includes(planIntake.insurer);
  const canStartPlanWorkflow =
    summitNjInsurers.some((insurer) => insurer.name === planIntake.insurer) &&
    (isExactPublicWorkflow || Boolean(planIntake.planName.trim()));
  const activePublicFormulary =
    intakeMatch?.kind === "uhc-nj-marketplace" ||
    intakeMatch?.kind === "aetna-nj-familycare" ||
    intakeMatch?.kind === "uhc-nj-community" ||
    intakeMatch?.kind === "fidelis-nj-familycare" ||
    intakeMatch?.kind === "horizon-nj-health" ||
    intakeMatch?.kind === "wellpoint-nj-familycare" ||
    intakeMatch?.kind === "horizon-nj-marketplace" ||
    intakeMatch?.kind === "horizon-classic" ||
    intakeMatch?.kind === "amerihealth-nj-individual" ||
    intakeMatch?.kind === "anthem-ny-select" ||
    intakeMatch?.kind === "uhc-commercial" ||
    intakeMatch?.kind === "oxford-freedom" ||
    intakeMatch?.kind === "cigna-national-preferred"
      ? intakeMatch.kind
      : null;
  const planIntakeNextMatch = planIntakeMatchFor(planIntake);
  const planIntakeActionLabel =
    planIntakeNextMatch.kind === "uhc-nj-marketplace"
      ? "Choose UHC Marketplace plan"
      : planIntakeNextMatch.kind === "aetna-nj-familycare"
        ? "Choose Aetna FamilyCare product"
      : planIntakeNextMatch.kind === "uhc-nj-community"
        ? "Choose UHC Community medication"
      : planIntakeNextMatch.kind === "fidelis-nj-familycare"
        ? "Choose Fidelis medication"
      : planIntakeNextMatch.kind === "horizon-nj-health"
        ? "Choose Horizon NJ Health medication"
      : planIntakeNextMatch.kind === "wellpoint-nj-familycare"
        ? "Choose Wellpoint medication"
        : planIntakeNextMatch.kind === "aetna-commercial-variant"
          ? "Confirm Aetna drug list"
        : planIntakeNextMatch.kind === "anthem-nj-mismatch"
          ? "Confirm plan state"
        : planIntakeNextMatch.kind === "horizon-nj-marketplace"
          ? "Choose Horizon medication"
          : planIntakeNextMatch.kind === "horizon-classic"
            ? "Choose Horizon Classic medication"
          : planIntakeNextMatch.kind === "amerihealth-nj-individual"
            ? "Choose AmeriHealth medication"
          : planIntakeNextMatch.kind === "anthem-ny-select"
            ? "Choose Anthem medication"
          : ["uhc-commercial", "oxford-freedom", "cigna-national-preferred"].includes(planIntakeNextMatch.kind)
            ? "Choose medication product"
        : planIntakeNextMatch.kind === "medicare"
          ? "Find exact Medicare plan"
          : planIntakeNextMatch.kind === "imported"
            ? "Next: choose medicine"
          : "Continue to plan check";
  const publicPlanKey: PlanKey | null =
    activePublicFormulary === "horizon-nj-marketplace"
      ? "horizonMarketplace"
      : activePublicFormulary === "horizon-classic"
        ? "horizonClassic"
      : activePublicFormulary === "amerihealth-nj-individual"
        ? "amerihealthNj"
        : activePublicFormulary === "anthem-ny-select"
          ? "anthemNySelect"
        : activePublicFormulary === "uhc-commercial"
          ? "uhcCommercial"
        : activePublicFormulary === "oxford-freedom"
          ? "oxfordFreedom"
        : activePublicFormulary === "cigna-national-preferred"
          ? "cignaNationalPreferred"
        : null;
  const publicPlanMedicationSuggestions = publicPlanKey
    ? medications
        .map((medication) => {
          const coverage = coverageFor(medication, publicPlanKey);
          return { medication, coverage, score: medicationSuggestionScore(publicPlanMedicationQuery, medication) };
        })
        .filter(({ coverage, score }) => coverage.state !== "Source loading" && Number.isFinite(score))
        .sort((left, right) => left.score - right.score || left.medication.generic.localeCompare(right.medication.generic))
        .map(({ medication }) => medication)
        .slice(0, 12)
    : [];
  const selectedPublicPlanCoverage =
    publicPlanKey && selectedPublicPlanMedication
      ? coverageFor(selectedPublicPlanMedication, publicPlanKey)
      : null;
  const publicPlanSource =
    activePublicFormulary === "horizon-nj-marketplace"
      ? summitNjFormularySources.find((source) => source.insurer === "Horizon BCBSNJ")
      : activePublicFormulary === "horizon-classic"
        ? summitNjFormularySources.find((source) => source.insurer === "Horizon BCBSNJ Classic")
      : activePublicFormulary === "amerihealth-nj-individual"
        ? summitNjFormularySources.find((source) => source.insurer === "AmeriHealth NJ")
        : activePublicFormulary === "anthem-ny-select"
          ? summitNjFormularySources.find((source) => source.insurer === "Empire / Anthem NY")
        : activePublicFormulary === "uhc-commercial" || activePublicFormulary === "oxford-freedom"
          ? summitNjFormularySources.find((source) => source.insurer === "UnitedHealthcare / Oxford")
        : activePublicFormulary === "cigna-national-preferred"
          ? summitNjFormularySources.find((source) => source.insurer === "Cigna")
        : null;
  const publicPlanEyebrow =
    activePublicFormulary === "horizon-nj-marketplace"
      ? "2026 NJ Marketplace"
      : activePublicFormulary === "horizon-classic"
        ? "July 2026 Commercial"
      : activePublicFormulary === "amerihealth-nj-individual"
        ? "2026 NJ Individual & Family"
      : activePublicFormulary === "anthem-ny-select"
        ? "2026 New York Individual Select"
      : activePublicFormulary === "uhc-commercial" || activePublicFormulary === "oxford-freedom"
        ? "May 2026 Commercial PDL"
      : "2026 Cigna National Preferred";
  const publicPlanHeading =
    activePublicFormulary === "horizon-nj-marketplace"
      ? "Horizon BCBSNJ Marketplace"
      : activePublicFormulary === "horizon-classic"
        ? "Horizon BCBSNJ Classic Formulary"
      : activePublicFormulary === "amerihealth-nj-individual"
        ? "AmeriHealth NJ Individual & Family"
      : activePublicFormulary === "anthem-ny-select"
        ? "Anthem New York Individual Select"
      : activePublicFormulary === "uhc-commercial"
        ? "UnitedHealthcare Commercial PDL"
      : activePublicFormulary === "oxford-freedom"
        ? "Oxford Freedom Network PDL"
      : "Cigna National Preferred 3-Tier";
  const publicPlanBoundary =
    activePublicFormulary === "horizon-nj-marketplace"
      ? "Use only for the named Marketplace or listed Direct Access small-group products. Do not use for generic Horizon employer or Direct Access, Medicaid, or Medicare products."
      : activePublicFormulary === "horizon-classic"
        ? "Use only when the member's pharmacy benefit is explicitly Horizon Classic. Direct Access alone does not identify the pharmacy formulary."
      : activePublicFormulary === "amerihealth-nj-individual"
        ? "Do not use this result for AmeriHealth Value, Select, employer, or Medicare products."
      : activePublicFormulary === "anthem-ny-select"
        ? "This applies only to New York Individual Select plans, not New Jersey, employer, Medicare, or other Anthem formularies."
      : activePublicFormulary === "uhc-commercial"
        ? "This is a general UnitedHealthcare commercial PDL baseline. Employer benefits and pharmacy-benefit variants can differ."
      : activePublicFormulary === "oxford-freedom"
        ? "This is the Oxford Freedom Network baseline linked to the UHC commercial PDL. Confirm the exact Oxford product and employer benefit."
      : "This is an abridged Cigna National Preferred employer baseline. Confirm the employer drug-list variant before acting.";
  const workflowInsurers =
    insurerQuery || showAllInsurerWorkflows
      ? summitNjDirectory
      : summitNjDirectory.slice(0, 9);
  const openMedicareFinder = (benefitType?: "ma" | "pdp") => {
    if (benefitType) {
      setMedicareBenefitType(benefitType);
      setSelectedMedicarePlan(null);
    }
    medicareFinderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => medicareSearchRef.current?.focus(), 250);
  };
  const openPlanIntake = (insurer = "") => {
    if (insurer) setPlanIntake((current) => ({ ...current, insurer }));
    planIntakeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => planIntakeInsurerRef.current?.focus(), 250);
  };
  const submitPlanIntake = () => {
    if (!canStartPlanWorkflow) return;
    setSubmittedPlanIntake(planIntake);
    setSelectedInsurerName(planIntake.insurer);
    const nextMatch = planIntakeMatchFor(planIntake);
    if (nextMatch.kind === "medicare") {
      const isStandalonePartD =
        planIntake.planKind === "Standalone Medicare Part D (Original / Railroad Medicare)" ||
        ["Original Medicare", "Railroad Medicare"].includes(planIntake.insurer);
      setMedicareBenefitType(isStandalonePartD ? "pdp" : "ma");
      setMedicareQuery(planIntake.planName);
      window.setTimeout(() => {
        medicareFinderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        medicareSearchRef.current?.focus();
      }, 0);
    }
    if (nextMatch.kind === "uhc-nj-marketplace") {
      setUhcQhpPlanQuery(planIntake.planName);
      if (activeSelected) setUhcQhpDrugQuery(activeSelected.generic);
      window.setTimeout(() => {
        publicCoverageFinderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        uhcQhpPlanRef.current?.focus();
      }, 0);
    }
    if (nextMatch.kind === "aetna-nj-familycare") {
      if (activeSelected) setAetnaFamilyCareDrugQuery(activeSelected.generic);
      window.setTimeout(() => {
        publicCoverageFinderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        aetnaFamilyCareDrugRef.current?.focus();
      }, 0);
    }
    if (nextMatch.kind === "uhc-nj-community") {
      if (activeSelected) setUhcCommunityDrugQuery(activeSelected.generic);
      window.setTimeout(() => {
        publicCoverageFinderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        uhcCommunityDrugRef.current?.focus();
      }, 0);
    }
    if (nextMatch.kind === "fidelis-nj-familycare") {
      if (activeSelected) setFidelisFamilyCareDrugQuery(activeSelected.generic);
      window.setTimeout(() => {
        publicCoverageFinderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        fidelisFamilyCareDrugRef.current?.focus();
      }, 0);
    }
    if (nextMatch.kind === "horizon-nj-health") {
      if (activeSelected) setHorizonNjHealthDrugQuery(activeSelected.generic);
      window.setTimeout(() => {
        publicCoverageFinderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        horizonNjHealthDrugRef.current?.focus();
      }, 0);
    }
    if (nextMatch.kind === "wellpoint-nj-familycare") {
      if (activeSelected) setWellpointNjFamilyCareDrugQuery(activeSelected.generic);
      window.setTimeout(() => {
        publicCoverageFinderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        wellpointNjFamilyCareDrugRef.current?.focus();
      }, 0);
    }
    if (
      nextMatch.kind === "horizon-nj-marketplace" ||
      nextMatch.kind === "horizon-classic" ||
      nextMatch.kind === "amerihealth-nj-individual" ||
      nextMatch.kind === "anthem-ny-select" ||
      nextMatch.kind === "uhc-commercial" ||
      nextMatch.kind === "oxford-freedom" ||
      nextMatch.kind === "cigna-national-preferred"
    ) {
      if (activeSelected) setPublicPlanMedicationQuery(activeSelected.generic);
      window.setTimeout(() => {
        publicCoverageFinderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        publicPlanMedicationRef.current?.focus();
      }, 0);
    }
    if (nextMatch.kind === "imported") {
      setPlanFilter(nextMatch.plan.key);
      setView("medications");
      setQuery("");
      window.setTimeout(() => coverageQuickSearchRef.current?.focus(), 0);
    }
  };
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
  const medicareAutocompleteOptions = Array.from(
    new Set(
      medicarePlans.flatMap((plan) => [
        plan.plan_name,
        `${plan.contract_id}-${plan.plan_id}`,
      ]),
    ),
  ).slice(0, 12);
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
              </div>
              <p className="text-xs text-[#627b7b]">
                Regional coverage evidence for care teams
              </p>
            </div>
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
                Search {medications.length} pulmonary and commonly used medication families across {plans.length}
                named plan-family baselines. See preferred status, restrictions,
                and the evidence source together.
              </p>
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
                list="medication-suggestions"
                autoComplete="off"
                className="h-12 w-full rounded-xl bg-[#f4f8f7] pl-12 pr-4 text-[15px] text-[#173334] outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-[#55bda8]"
                placeholder="Search albuterol, metformin, Trelegy, or a medication..."
              />
              <datalist id="medication-suggestions">
                {autocompleteOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
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
                          const medication = medications.find(
                            (item) =>
                              item.generic === option ||
                              item.brands
                                .split(/[,;]/)
                                .some((brand) => brand.trim() === option),
                          );
                          if (medication) selectMedication(medication);
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
            <input
              aria-label="Therapeutic area"
              value={branch}
              onChange={(event) => setBranch(event.target.value)}
              list="therapeutic-area-options"
              autoComplete="off"
              className="h-12 rounded-xl border-0 bg-[#edf5f3] px-4 text-sm font-semibold text-[#214746] outline-none ring-2 ring-transparent focus:ring-[#55bda8] sm:max-w-64"
              placeholder="Therapeutic area"
            />
            <datalist id="therapeutic-area-options">
              {branches.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </datalist>
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
            {referencePlans.map((plan) => (
              <button
                key={plan.key}
                onClick={() => {
                  setPlanFilter(plan.key);
                  setView("medications");
                }}
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
            <section ref={planIntakeRef} className="mb-5 overflow-hidden rounded-2xl border border-[#9bcfc4] bg-[#eef8f5] shadow-sm">
              <div className="border-b border-[#cce5df] bg-white px-5 py-4 sm:px-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0d6664]">
                  Start with the insurance card
                </p>
                <h2 className="mt-1 text-lg font-bold tracking-tight text-[#173f41]">
                  Enter the plan details here. Do not start on a payer website.
                </h2>
                <p className="mt-1 max-w-3xl text-sm leading-5 text-[#55716f]">
                  Keep this to plan information only: insurer, plan type, plan or formulary name, and pharmacy-benefit label. Do not enter member IDs, DOBs, claim numbers, or patient details.
                </p>
                <p className="mt-3 text-xs font-semibold text-[#0d6664]">
                  Step 1: choose the major insurer. Step 2: choose its exact plan detail. Step 3: choose the medicine.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[#cce5df] bg-white px-3 py-2.5 text-xs leading-5 text-[#55716f]">
                  <span>Need to prepare the clinic’s plan list?</span>
                  <a
                    href="/clinic-plan-intake-template.csv"
                    download
                    className="font-bold text-[#0d6664] underline decoration-[#8fc9bd] underline-offset-2 hover:text-[#074f4d]"
                  >
                    Download the PHI-free template
                  </a>
                </div>
                <div className="mt-3 rounded-xl border border-dashed border-[#9bcfc4] bg-[#f8fcfb] px-3 py-3">
                  <p className="text-xs font-bold text-[#284e4d]">
                    Use the template for a PHI-free clinic plan list.
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-[#55716f]">
                    No files are uploaded, reviewed, or stored by this app. Keep insurer documents outside the portal and use the template only for a PHI-free plan list.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
                <label className="block">
                  <span className="text-xs font-bold text-[#284e4d]">Insurer on card</span>
                  <input
                    ref={planIntakeInsurerRef}
                    value={planIntake.insurer}
                    onChange={(event) => {
                      const nextInsurer = event.target.value;
                      const recognized = summitNjInsurers.find((insurer) => insurer.name === nextInsurer.trim());
                      setPlanIntake((current) => {
                        if (!recognized || current.insurer.trim() === nextInsurer.trim()) {
                          return { ...current, insurer: nextInsurer };
                        }
                        const nextKinds = planKindsForInsurer(recognized.name);
                        return {
                          insurer: nextInsurer,
                          planKind: nextKinds.includes(current.planKind) ? current.planKind : nextKinds[0],
                          planName: "",
                          pharmacyBenefit: "",
                        };
                      });
                      setSubmittedPlanIntake(null);
                    }}
                    list="plan-intake-insurers"
                    autoComplete="off"
                    className="mt-2 h-11 w-full rounded-xl border border-[#bfdcd5] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#55bda8]"
                    placeholder="Type insurer name"
                  />
                  <datalist id="plan-intake-insurers">
                    {summitNjInsurers.map((insurer) => (
                      <option key={insurer.name} value={insurer.name}>{insurer.name}</option>
                    ))}
                  </datalist>
                  {recognizedPlanIntakeInsurer && (
                    <p className="mt-1 text-[10px] font-semibold text-[#0d6664]">
                      Next fields filtered for {recognizedPlanIntakeInsurer.name}.
                    </p>
                  )}
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-[#284e4d]">Coverage type</span>
                  <select
                    value={planIntake.planKind}
                    onChange={(event) => {
                      setPlanIntake((current) => ({
                        ...current,
                        planKind: event.target.value,
                        planName: "",
                        pharmacyBenefit: "",
                      }));
                      setSubmittedPlanIntake(null);
                    }}
                    className="mt-2 h-11 w-full rounded-xl border border-[#bfdcd5] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#55bda8]"
                  >
                    {availablePlanKinds.map((kind) => <option key={kind}>{kind}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-[#284e4d]">
                    {isExactPublicWorkflow ? "Plan or formulary name (optional)" : "Plan or formulary name"}
                  </span>
                  <input
                    value={planIntake.planName}
                    onChange={(event) => setPlanIntake((current) => ({ ...current, planName: event.target.value }))}
                    list="plan-name-suggestions"
                    autoComplete="off"
                    className="mt-2 h-11 w-full rounded-xl border border-[#bfdcd5] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#55bda8]"
                    placeholder={
                      isExactPublicWorkflow
                        ? "Optional: paste the plan name from the card"
                        : recognizedPlanIntakeInsurer && availablePlanNames.length
                          ? "Select or type the exact plan name"
                          : "Type the exact plan or formulary name"
                    }
                  />
                  <datalist id="plan-name-suggestions">
                    {availablePlanNames.map((name) => <option key={name} value={name} />)}
                  </datalist>
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-[#284e4d]">Pharmacy benefit or drug-list label</span>
                  <input
                    value={planIntake.pharmacyBenefit}
                    onChange={(event) => {
                      setPlanIntake((current) => ({ ...current, pharmacyBenefit: event.target.value }));
                      setSubmittedPlanIntake(null);
                    }}
                    list="pharmacy-benefit-suggestions"
                    autoComplete="off"
                    className="mt-2 h-11 w-full rounded-xl border border-[#bfdcd5] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#55bda8]"
                    placeholder="Example: Advantage 3-Tier"
                  />
                  <datalist id="pharmacy-benefit-suggestions">
                    {availablePharmacyBenefits.map((label) => <option key={label} value={label} />)}
                  </datalist>
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3 border-t border-[#cce5df] bg-white px-5 py-4 sm:px-6">
                <button
                  type="button"
                  disabled={
                    !canStartPlanWorkflow
                  }
                  onClick={submitPlanIntake}
                  className="rounded-full bg-[#173f41] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0d6664] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {planIntakeActionLabel}
                </button>
                <span className="text-xs text-[#55716f]">Plan details stay in this browser session and are not saved.</span>
              </div>
              {submittedPlanIntake && intakeInsurer && intakeWorkflow && intakeMatch && !["medicare", "uhc-nj-marketplace", "aetna-nj-familycare", "uhc-nj-community", "fidelis-nj-familycare", "horizon-nj-marketplace", "horizon-classic", "amerihealth-nj-individual", "anthem-ny-select", "uhc-commercial", "oxford-freedom", "cigna-national-preferred", "imported"].includes(intakeMatch.kind) && (
                <div className="border-t border-[#cce5df] bg-[#f8fcfb] px-5 py-5 sm:px-6">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0d6664]">Plan match</p>
                      <h3 className="mt-1 text-lg font-bold text-[#173f41]">
                        {submittedPlanIntake.planName || intakeInsurer.name}
                      </h3>
                      <p className="mt-1 text-xs text-[#55716f]">
                        {submittedPlanIntake.planKind}{submittedPlanIntake.pharmacyBenefit ? ` · ${submittedPlanIntake.pharmacyBenefit}` : ""}
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#0d6664] ring-1 ring-[#c9e2dc]">No PHI stored</span>
                  </div>
                  <p className="mt-3 max-w-3xl text-sm leading-5 text-[#4e6c68]">
                    {intakeMatch.kind === "imported"
                      ? `Exact imported formulary match: ${intakeMatch.plan.name}. Confirm the medication's product, strength, device, and restrictions before acting.`
                      : intakeMatch.kind === "medicare"
                        ? "Select the exact Medicare Advantage or standalone Part D plan from the CMS data loaded in this portal. A carrier name alone is not a match."
                        : intakeMatch.kind === "uhc-nj-marketplace"
                          ? "Exact 2026 UnitedHealthcare NJ Marketplace plan and drug data are available in this portal. Select the HIOS plan and exact RxNorm product below."
                        : intakeMatch.kind === "aetna-nj-familycare"
                          ? "Current Aetna Better Health of New Jersey FamilyCare formulary data are available in this portal. Select the exact product NDC below."
                        : intakeMatch.kind === "uhc-nj-community"
                          ? "Current UHC Community Plan NJ Medicaid formulary data are available in this portal. Select the exact medication product below."
                        : intakeMatch.kind === "fidelis-nj-familycare"
                          ? "Current Fidelis Care NJ FamilyCare PDL rows are available in this portal. Select the exact medication product below."
                            : intakeMatch.kind === "horizon-nj-marketplace"
                              ? "Horizon BCBSNJ Marketplace formulary rows are available in this portal. Choose a medication product from the named Marketplace formulary family below."
                            : intakeMatch.kind === "horizon-classic"
                              ? "Horizon Classic formulary rows are available in this portal. Confirm the card or benefits document says Horizon Classic, then choose the medication product below."
                        : intakeMatch.kind === "amerihealth-nj-individual"
                              ? "AmeriHealth NJ Individual and Family formulary rows are available in this portal. Choose a medication product from that named formulary family below."
                            : intakeMatch.kind === "aetna-commercial-variant"
                              ? "This exact Aetna commercial drug-list variant is recognized. Aetna’s public source requires the plan-specific drug list; no generic Aetna result is inferred. Confirm the member’s exact plan before acting."
                            : intakeMatch.kind === "anthem-nj-mismatch"
                              ? "New Jersey’s Blue Cross Blue Shield carrier is Horizon BCBSNJ. Anthem plans are state-specific; confirm the state of the health plan and its exact drug list before using this portal result."
                            : intakeMatch.kind === "anthem-ny-select"
                              ? "Anthem New York Individual Select pulmonary formulary rows are available in this portal. Confirm this is a New York Individual Select plan before using the result."
                            : ["uhc-commercial", "oxford-freedom", "cigna-national-preferred"].includes(intakeMatch.kind)
                              ? "The exact named commercial PDL baseline is available in this portal. Choose a medication product, then confirm the employer benefit and drug-list variant before acting."
                        : intakeMatch.kind === "out-of-scope"
                          ? "This coverage type is outside the current imported data. Treat the result as unconfirmed."
                        : "This exact plan family is not imported in Formulary Finder yet. Do not infer medication coverage from the insurer name, network, or a different plan."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {intakeMatch.kind === "medicare" && (
                      <button
                        type="button"
                        onClick={() => {
                          const isStandalonePartD =
                            submittedPlanIntake.planKind === "Standalone Medicare Part D (Original / Railroad Medicare)" ||
                            ["Original Medicare", "Railroad Medicare"].includes(submittedPlanIntake.insurer);
                          setMedicareBenefitType(isStandalonePartD ? "pdp" : "ma");
                          setMedicareQuery(submittedPlanIntake.planName);
                          openMedicareFinder(isStandalonePartD ? "pdp" : "ma");
                        }}
                        className="rounded-full bg-[#173f41] px-3 py-1.5 text-xs font-bold text-white"
                      >
                        Search exact CMS plan in portal
                      </button>
                    )}
                    {intakeMatch.kind === "imported" && (
                      <button
                        type="button"
                        onClick={() => {
                          setPlanFilter(intakeMatch.plan.key);
                          setView("medications");
                        }}
                        className="rounded-full bg-[#173f41] px-3 py-1.5 text-xs font-bold text-white"
                      >
                        Search imported formulary
                      </button>
                    )}
                    {intakeMatch.kind === "uhc-nj-marketplace" && (
                      <button
                        type="button"
                        onClick={() => {
                          setUhcQhpPlanQuery(submittedPlanIntake.planName);
                          if (activeSelected) setUhcQhpDrugQuery(activeSelected.generic);
                          publicCoverageFinderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="rounded-full bg-[#173f41] px-3 py-1.5 text-xs font-bold text-white"
                      >
                        Choose exact UHC Marketplace plan
                      </button>
                    )}
                    {intakeMatch.kind === "aetna-nj-familycare" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (activeSelected) setAetnaFamilyCareDrugQuery(activeSelected.generic);
                          publicCoverageFinderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="rounded-full bg-[#173f41] px-3 py-1.5 text-xs font-bold text-white"
                      >
                        Choose exact Aetna FamilyCare product
                      </button>
                    )}
                    {intakeMatch.kind === "uhc-nj-community" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (activeSelected) setUhcCommunityDrugQuery(activeSelected.generic);
                          publicCoverageFinderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="rounded-full bg-[#173f41] px-3 py-1.5 text-xs font-bold text-white"
                      >
                        Choose UHC Community medication
                      </button>
                    )}
                    {intakeMatch.kind === "fidelis-nj-familycare" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (activeSelected) setFidelisFamilyCareDrugQuery(activeSelected.generic);
                          publicCoverageFinderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="rounded-full bg-[#173f41] px-3 py-1.5 text-xs font-bold text-white"
                      >
                        Choose Fidelis medication
                      </button>
                    )}
                    {(intakeMatch.kind === "horizon-nj-marketplace" || intakeMatch.kind === "horizon-classic" || intakeMatch.kind === "amerihealth-nj-individual" || intakeMatch.kind === "anthem-ny-select" || intakeMatch.kind === "uhc-commercial" || intakeMatch.kind === "oxford-freedom" || intakeMatch.kind === "cigna-national-preferred") && (
                      <button
                        type="button"
                        onClick={() => {
                          if (activeSelected) setPublicPlanMedicationQuery(activeSelected.generic);
                          publicCoverageFinderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="rounded-full bg-[#173f41] px-3 py-1.5 text-xs font-bold text-white"
                      >
                        Choose medication product
                      </button>
                    )}
                    {intakeMatch.kind === "unconfirmed" && (
                      <span className="rounded-full bg-[#fff7e8] px-3 py-1.5 text-xs font-bold text-[#8a5a16]">
                        No imported formulary result
                      </span>
                    )}
                    {intakeMatch.kind === "out-of-scope" && (
                      <span className="rounded-full bg-[#eef2f1] px-3 py-1.5 text-xs font-bold text-[#526b69]">
                        Outside current plan scope
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-[11px] leading-4 text-[#6a8580]">* Formulary evidence is not eligibility, a benefit guarantee, or a prescription decision. Confirm product, strength, device, and restrictions before acting.</p>
                </div>
              )}
            </section>
            {intakeMatch?.kind === "medicare" && (
            <section ref={medicareFinderRef} className="mb-5 overflow-hidden rounded-2xl border border-[#b9ddd5] bg-[#eef8f5] shadow-sm">
              <div className="border-b border-[#cce5df] bg-white px-5 py-4 sm:px-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0d6664]">
                  Step 2 of 3 · Medicare plan finder
                </p>
                <h2 className="mt-1 text-lg font-bold tracking-tight text-[#173f41]">
                  Find the exact Medicare drug plan.
                </h2>
                <p className="mt-1 max-w-3xl text-sm leading-5 text-[#55716f]">
                  Choose Medicare Advantage or standalone Part D, then use the carrier and exact plan name or contract-plan ID from the correct card.
                </p>
                <div className="mt-3 flex flex-wrap gap-2" aria-label="Medicare coverage type">
                  {([
                    ["ma", "Medicare Advantage"],
                    ["pdp", "Standalone Part D"],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={medicareBenefitType === value}
                      onClick={() => {
                        setMedicareBenefitType(value);
                        setMedicareQuery("");
                        setMedicarePlans([]);
                        setSelectedMedicarePlan(null);
                      }}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition ${medicareBenefitType === value ? "bg-[#0d6664] text-white ring-[#0d6664]" : "bg-white text-[#55716f] ring-[#bfdcd5]"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <label className="block">
                  <span className="text-xs font-bold text-[#284e4d]">
                    Search carrier, plan name, or plan ID
                  </span>
                  <input
                    ref={medicareSearchRef}
                    value={medicareQuery}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setMedicareQuery(nextValue);
                      setSelectedMedicarePlan(null);
                    }}
                    list="medicare-plan-suggestions"
                    className="mt-2 h-12 w-full rounded-xl border border-[#bfdcd5] bg-white px-4 text-sm outline-none ring-2 ring-transparent focus:ring-[#55bda8]"
                    placeholder={medicareBenefitType === "pdp" ? "Try SilverScript, Wellcare, or S4802-078" : "Try Humana, Wellcare, or H5216-319"}
                    autoComplete="off"
                  />
                  <datalist id="medicare-plan-suggestions">
                    {medicareAutocompleteOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </label>
                <div className="rounded-xl bg-white px-4 py-3 text-xs leading-5 text-[#55716f] ring-1 ring-[#cce4de]">
                  <span className="font-bold text-[#173f41]">Card check:</span>{" "}
                  {medicareBenefitType === "pdp" ? "separate Part D card + exact plan name/ID" : "Medicare Advantage card + exact plan name/ID"}<br />
                  Member ID is not needed or stored here.
                </div>
              </div>
              {(medicareQuery.trim().length >= 2 || medicarePlanLoading || medicarePlans.length > 0 || selectedMedicarePlan) && (
                <div className="border-t border-[#cce5df] bg-white px-5 py-4 sm:px-6">
                  {medicarePlanLoading ? (
                    <p className="text-sm font-semibold text-[#55716f]">Finding NJ Medicare plans…</p>
                  ) : medicarePlanError ? (
                    <p className="rounded-xl border border-[#e2c996] bg-[#fff9ea] p-3 text-sm text-[#785313]">
                      Medicare plan search is temporarily unavailable. Do not infer coverage from this result.
                    </p>
                  ) : selectedMedicarePlan ? (
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-sm font-bold text-[#0d6664]">Exact plan selected</p>
                        <p className="text-sm font-semibold text-[#173f41]">{selectedMedicarePlan.plan_name}</p>
                        <p className="mt-1 text-xs text-[#55716f]">{selectedMedicarePlan.plan_type} · {selectedMedicarePlan.contract_id}-{selectedMedicarePlan.plan_id} · Formulary {selectedMedicarePlan.formulary_id}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedMedicarePlan(null)}
                        className="w-fit rounded-full border border-[#b8d7d1] px-3 py-1.5 text-xs font-bold text-[#0d6664]"
                      >
                        Choose another
                      </button>
                    </div>
                  ) : medicarePlans.length > 0 ? (
                    <div>
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#55716f]">Choose the exact plan from the card</p>
                      <div className="grid gap-2 lg:grid-cols-2">
                        {medicarePlans.slice(0, 8).map((plan) => (
                          <button
                            type="button"
                            key={`${plan.contract_id}-${plan.plan_id}-${plan.segment_id}`}
                            onClick={() => {
                              setSelectedMedicarePlan(plan);
                              setView("medications");
                              setQuery("");
                              window.setTimeout(() => coverageQuickSearchRef.current?.focus(), 0);
                            }}
                            className="rounded-xl border border-[#d4e6e2] bg-[#f9fcfb] px-4 py-3 text-left transition hover:border-[#75bdb0] hover:bg-[#eef8f5] focus:outline-none focus:ring-2 focus:ring-[#55bda8]"
                          >
                            <span className="block text-sm font-bold text-[#173f41]">{plan.plan_name}</span>
                            <span className="mt-1 block text-xs text-[#5c7775]">{plan.plan_type} · {plan.contract_id}-{plan.plan_id} · Formulary {plan.formulary_id}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[#55716f]"><strong>Unconfirmed - not a denial.</strong> No NJ {medicareBenefitType === "pdp" ? "standalone Part D" : "Medicare Advantage"} plan matched that search. Check the correct card's carrier and contract-plan ID.</p>
                  )}
                </div>
              )}
            </section>
            )}
            {activePublicFormulary && (
            <section ref={publicCoverageFinderRef} className="mb-5 scroll-mt-4 overflow-hidden rounded-2xl border border-[#9fcfc4] bg-white shadow-sm">
              <div className="border-b border-[#d8e9e5] bg-[#f3faf8] px-5 py-4 sm:px-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0d6664]">
                  Live public formulary data
                </p>
                <h2 className="mt-1 text-lg font-bold tracking-tight text-[#173f41]">
                  Exact plan check
                </h2>
                <p className="mt-1 max-w-3xl text-sm leading-5 text-[#55716f]">
                  Select the major insurer and coverage type above. Formulary Finder then opens only the relevant plan detail, instead of showing every subplan at once.
                </p>
              </div>
              <div className="grid gap-5 p-5 sm:p-6">
                {(activePublicFormulary === "horizon-nj-marketplace" || activePublicFormulary === "horizon-classic" || activePublicFormulary === "amerihealth-nj-individual" || activePublicFormulary === "anthem-ny-select" || activePublicFormulary === "uhc-commercial" || activePublicFormulary === "oxford-freedom" || activePublicFormulary === "cigna-national-preferred") && publicPlanKey && (
                <article className="rounded-2xl border border-[#d4e6e2] bg-[#f9fcfb] p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0d6664]">
                        {publicPlanEyebrow}
                      </p>
                      <h3 className="mt-1 text-base font-bold text-[#173f41]">
                        {publicPlanHeading}
                      </h3>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-[#0d6664] ring-1 ring-[#b8d9d1]">Pulmonary source rows</span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[#55716f]">
                    This is one named formulary family, not a carrier-wide result. Select the medication product below. {publicPlanBoundary}
                  </p>
                  <label className="mt-4 block">
                    <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#284e4d]">
                      Step 2 of 2 · medication product
                      {activeSelected && (
                        <button
                          type="button"
                          onClick={() => {
                            setPublicPlanMedicationQuery(activeSelected.generic);
                            setSelectedPublicPlanMedication(null);
                            setPublicPlanCoverageVisible(false);
                          }}
                          className="text-[10px] text-[#0d6664] hover:underline"
                        >
                          Use {activeSelected.generic}
                        </button>
                      )}
                    </span>
                    <input
                      ref={publicPlanMedicationRef}
                      value={publicPlanMedicationQuery}
                      onChange={(event) => {
                        setPublicPlanMedicationQuery(event.target.value);
                        setSelectedPublicPlanMedication(null);
                        setPublicPlanCoverageVisible(false);
                      }}
                      list="public-plan-medication-suggestions"
                      className="mt-2 h-11 w-full rounded-xl border border-[#bfdcd5] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#55bda8]"
                      placeholder="Type medication, brand, strength, or form"
                      autoComplete="off"
                    />
                    <datalist id="public-plan-medication-suggestions">
                      {publicPlanMedicationSuggestions.map((medication) => (
                        <option key={medication.generic} value={medication.generic} label={medication.productDetails} />
                      ))}
                    </datalist>
                  </label>
                  {publicPlanMedicationSuggestions.length > 0 && !selectedPublicPlanMedication && (
                    <div className="mt-2 max-h-64 space-y-1.5 overflow-auto pr-1">
                      {needsProductCorrectionHint(publicPlanMedicationQuery, publicPlanMedicationSuggestions.map((medication) => `${medication.generic} ${medication.brands}`)) && (
                        <p className="rounded-lg bg-[#eef8f5] px-3 py-2 text-xs font-semibold text-[#0d6664]">Did you mean one of these listed products?</p>
                      )}
                      {publicPlanMedicationSuggestions.map((medication) => (
                        <button
                          type="button"
                          key={medication.generic}
                          onClick={() => {
                            setSelectedPublicPlanMedication(medication);
                            setPublicPlanMedicationQuery(medication.generic);
                            setPublicPlanCoverageVisible(false);
                          }}
                          className="w-full rounded-lg border border-[#d5e6e2] bg-white px-3 py-2 text-left hover:border-[#75bdb0] focus:outline-none focus:ring-2 focus:ring-[#55bda8]"
                        >
                          <span className="block text-xs font-bold text-[#173f41]">{medication.generic}</span>
                          <span className="mt-0.5 block text-[10px] text-[#607a77]">{medication.productDetails ?? medication.brands}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedPublicPlanMedication && (
                    <div className="mt-2 rounded-lg bg-[#eaf6f2] px-3 py-2 text-xs text-[#315b56]">
                      <strong>Medication selected:</strong> {selectedPublicPlanMedication.generic}
                      {selectedPublicPlanMedication.productDetails ? ` · ${selectedPublicPlanMedication.productDetails}` : ""}
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={!selectedPublicPlanMedication}
                      onClick={() => setPublicPlanCoverageVisible(true)}
                      className="rounded-full bg-[#173f41] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0d6664] focus:outline-none focus:ring-2 focus:ring-[#55bda8] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Check formulary
                    </button>
                    <span className="text-[11px] text-[#607a77]">{selectedPublicPlanMedication ? "Medication product selected." : "Choose a listed medication product first."}</span>
                  </div>
                  {publicPlanCoverageVisible && selectedPublicPlanMedication && selectedPublicPlanCoverage && (
                    <div className="mt-4 rounded-xl border border-[#d4e6e2] bg-white p-3">
                      {selectedPublicPlanCoverage.state === "Source loading" ? (
                        <p className="text-xs leading-5 text-[#785313]"><strong>Unconfirmed, not a denial.</strong> This medication is not yet mapped to a complete row for this source family.</p>
                      ) : (
                        <div>
                          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f6ef] px-2.5 py-1 text-xs font-bold text-[#15735f]">
                            <Icon name="check" className="h-3.5 w-3.5" />
                            Listed in the selected formulary family
                          </p>
                          <div className="mt-2 rounded-lg bg-[#f3faf8] p-2.5">
                            <p className="text-xs font-bold text-[#173f41]">{selectedPublicPlanCoverage.state}</p>
                            {selectedPublicPlanCoverage.productNote && <p className="mt-1 text-[10px] leading-4 text-[#58726f]">{selectedPublicPlanCoverage.productNote}</p>}
                            <div className="mt-2 flex flex-wrap gap-1">
                              {selectedPublicPlanCoverage.flags?.map((flag) => <span key={flag} className="rounded bg-[#fff1d9] px-1.5 py-1 text-[9px] font-bold text-[#8a5a16]">{flag}</span>)}
                              {!selectedPublicPlanCoverage.flags?.length && <span className="text-[10px] text-[#58726f]">No restriction flag in this imported source row.</span>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="mt-3 text-[10px] leading-4 text-[#6a817e]">* {publicPlanSource?.sourceLabel ?? "Source formulary"}. Listing is not eligibility, a benefit guarantee, cost, payment, or a prescription decision. Confirm the strength, device, and restrictions before acting.</p>
                </article>
                )}
                {activePublicFormulary === "uhc-nj-marketplace" && (
                <article className="rounded-2xl border border-[#d4e6e2] bg-[#f9fcfb] p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0d6664]">2026 NJ Marketplace</p>
                      <h3 className="mt-1 text-base font-bold text-[#173f41]">UnitedHealthcare Individual &amp; Family</h3>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-[#0d6664] ring-1 ring-[#b8d9d1]">6 HIOS plans</span>
                  </div>
                  <label className="mt-4 block">
                    <span className="text-xs font-bold text-[#284e4d]">Step 2 of 3 · plan name or HIOS plan ID</span>
                    <input
                      ref={uhcQhpPlanRef}
                      value={uhcQhpPlanQuery}
                      onChange={(event) => {
                        setUhcQhpPlanQuery(event.target.value);
                        setSelectedUhcQhpPlan(null);
                        setUhcQhpCoverage(null);
                        setUhcQhpCoverageRequest(0);
                      }}
                      list="uhc-qhp-plan-suggestions"
                      className="mt-2 h-11 w-full rounded-xl border border-[#bfdcd5] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#55bda8]"
                      placeholder="Try UHC Silver Value or 37777NJ0100005"
                      autoComplete="off"
                    />
                    <datalist id="uhc-qhp-plan-suggestions">
                      {uhcQhpPlans.map((plan) => (
                        <option key={plan.planId} value={plan.marketingName} label={plan.planId} />
                      ))}
                    </datalist>
                  </label>
                  {uhcQhpPlans.length > 0 && !selectedUhcQhpPlan && (
                    <div className="mt-2 space-y-1.5">
                      {uhcQhpPlans.map((plan) => (
                        <button
                          type="button"
                          key={plan.planId}
                          onClick={() => {
                            setSelectedUhcQhpPlan(plan);
                            setUhcQhpPlanQuery(plan.marketingName);
                            setUhcQhpCoverage(null);
                            setUhcQhpCoverageRequest(0);
                          }}
                          className="w-full rounded-lg border border-[#d5e6e2] bg-white px-3 py-2 text-left hover:border-[#75bdb0] focus:outline-none focus:ring-2 focus:ring-[#55bda8]"
                        >
                          <span className="block text-xs font-bold text-[#173f41]">{plan.marketingName}</span>
                          <span className="mt-0.5 block text-[10px] text-[#607a77]">{plan.planId}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedUhcQhpPlan && (
                    <div className="mt-2 rounded-lg bg-[#eaf6f2] px-3 py-2 text-xs text-[#315b56]">
                      <strong>Exact plan selected:</strong> {selectedUhcQhpPlan.planId}
                    </div>
                  )}
                  <label className="mt-4 block">
                    <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#284e4d]">
                      Step 3 of 3 · exact medication product
                      {activeSelected && (
                        <button
                          type="button"
                          onClick={() => {
                            setUhcQhpDrugQuery(activeSelected.generic);
                            setSelectedUhcQhpDrug(null);
                            setUhcQhpCoverage(null);
                            setUhcQhpCoverageRequest(0);
                          }}
                          className="text-[10px] text-[#0d6664] hover:underline"
                        >
                          Use {activeSelected.generic}
                        </button>
                      )}
                    </span>
                    <input
                      value={uhcQhpDrugQuery}
                      onChange={(event) => {
                        setUhcQhpDrugQuery(event.target.value);
                        setSelectedUhcQhpDrug(null);
                        setUhcQhpCoverage(null);
                        setUhcQhpCoverageRequest(0);
                      }}
                      list="uhc-qhp-drug-suggestions"
                      className="mt-2 h-11 w-full rounded-xl border border-[#bfdcd5] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#55bda8]"
                      placeholder="Type drug, strength, and form"
                      autoComplete="off"
                    />
                    <datalist id="uhc-qhp-drug-suggestions">
                      {uhcQhpDrugs.map((drug) => (
                        <option key={drug.rxcui} value={drug.drugName} label={`RxCUI ${drug.rxcui}`} />
                      ))}
                    </datalist>
                  </label>
                  {uhcQhpDrugs.length > 0 && !selectedUhcQhpDrug && (
                    <div className="mt-2 max-h-56 space-y-1.5 overflow-auto pr-1">
                      {needsProductCorrectionHint(uhcQhpDrugQuery, uhcQhpDrugs.map((drug) => drug.drugName)) && (
                        <p className="rounded-lg bg-[#eef8f5] px-3 py-2 text-xs font-semibold text-[#0d6664]">
                          Did you mean one of these exact products?
                        </p>
                      )}
                      {uhcQhpDrugs.map((drug) => (
                        <button
                          type="button"
                          key={drug.rxcui}
                          onClick={() => {
                            setSelectedUhcQhpDrug(drug);
                            setUhcQhpDrugQuery(drug.drugName);
                            setUhcQhpCoverage(null);
                            setUhcQhpCoverageRequest(0);
                          }}
                          className="w-full rounded-lg border border-[#d5e6e2] bg-white px-3 py-2 text-left hover:border-[#75bdb0] focus:outline-none focus:ring-2 focus:ring-[#55bda8]"
                        >
                          <span className="block text-xs font-bold text-[#173f41]">{drug.drugName}</span>
                          <span className="mt-0.5 block text-[10px] text-[#607a77]">RxCUI {drug.rxcui}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedUhcQhpDrug && (
                    <div className="mt-2 rounded-lg bg-[#eaf6f2] px-3 py-2 text-xs text-[#315b56]">
                      <strong>Exact product selected:</strong> RxCUI {selectedUhcQhpDrug.rxcui}
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={!selectedUhcQhpPlan || !selectedUhcQhpDrug || uhcQhpLoading}
                      onClick={() => setUhcQhpCoverageRequest((request) => request + 1)}
                      className="rounded-full bg-[#173f41] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0d6664] focus:outline-none focus:ring-2 focus:ring-[#55bda8] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {uhcQhpLoading ? "Checking coverage…" : "Check coverage"}
                    </button>
                    <span className="text-[11px] text-[#607a77]">
                      {selectedUhcQhpPlan && selectedUhcQhpDrug
                        ? "Exact plan and product selected."
                        : "Choose the exact plan and medication product first."}
                    </span>
                  </div>
                  {(uhcQhpLoading || uhcQhpError || uhcQhpCoverage) && (
                    <div className="mt-4 rounded-xl border border-[#d4e6e2] bg-white p-3">
                      {uhcQhpLoading ? (
                        <p className="text-xs font-semibold text-[#55716f]">Checking the public UHC formulary…</p>
                      ) : uhcQhpError ? (
                        <p className="text-xs text-[#785313]"><strong>Temporarily unavailable.</strong> Do not infer coverage.</p>
                      ) : uhcQhpCoverage?.status === "confirmed" && uhcQhpCoverage.coverage?.length ? (
                        <div>
                          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f6ef] px-2.5 py-1 text-xs font-bold text-[#15735f]">
                            <Icon name="check" className="h-3.5 w-3.5" />
                            Covered in the selected 2026 plan
                          </p>
                          {uhcQhpCoverage.coverage.map((row, index) => (
                            <div key={`${row.drugTier}-${index}`} className="mt-2 rounded-lg bg-[#f3faf8] p-2.5">
                              <span className="text-xs font-bold text-[#173f41]">{row.drugTier.replaceAll("-", " ")}</span>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {row.priorAuthorization && <span className="rounded bg-[#fff1d9] px-1.5 py-1 text-[9px] font-bold text-[#8a5a16]">PA</span>}
                                {row.stepTherapy && <span className="rounded bg-[#fff1d9] px-1.5 py-1 text-[9px] font-bold text-[#8a5a16]">ST</span>}
                                {row.quantityLimit && <span className="rounded bg-[#edf2f1] px-1.5 py-1 text-[9px] font-bold text-[#526b69]">QL</span>}
                                {!row.priorAuthorization && !row.stepTherapy && !row.quantityLimit && <span className="text-[10px] text-[#58726f]">No restriction flag in this source row.</span>}
                              </div>
                            </div>
                          ))}
                          <p className="mt-2 text-[10px] text-[#607a77]">RxCUI {uhcQhpCoverage.drug?.rxcui} · Source {uhcQhpCoverage.source?.drugs?.sourceDate?.slice(0, 10) ?? "current feed"}</p>
                        </div>
                      ) : uhcQhpCoverage ? (
                        <p className="text-xs leading-5 text-[#785313]"><strong>Unconfirmed, not a denial.</strong> No complete matching row was found for this exact plan and RxCUI.</p>
                      ) : null}
                    </div>
                  )}
                  <p className="mt-3 text-[10px] leading-4 text-[#6a817e]">* UHC NJ Individual/Family Marketplace only. Not UHC employer, Oxford, Medicare, Medicaid, eligibility, cost, or payment.</p>
                </article>
                )}

                {activePublicFormulary === "aetna-nj-familycare" && (
                <article className="rounded-2xl border border-[#d4e6e2] bg-[#f9fcfb] p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0d6664]">NJ FamilyCare Medicaid</p>
                      <h3 className="mt-1 text-base font-bold text-[#173f41]">Aetna Better Health of New Jersey</h3>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-[#0d6664] ring-1 ring-[#b8d9d1]">Exact NDC</span>
                  </div>
                  <label className="mt-4 block">
                    <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#284e4d]">
                      Step 2 of 2 · exact medication product
                      {activeSelected && (
                        <button
                          type="button"
                          onClick={() => {
                            setAetnaFamilyCareDrugQuery(activeSelected.generic);
                            setSelectedAetnaFamilyCareNdc("");
                            setAetnaFamilyCareCoverage(null);
                            setAetnaFamilyCareCoverageRequest(0);
                          }}
                          className="text-[10px] text-[#0d6664] hover:underline"
                        >
                          Use {activeSelected.generic}
                        </button>
                      )}
                    </span>
                    <input
                      ref={aetnaFamilyCareDrugRef}
                      value={aetnaFamilyCareDrugQuery}
                      onChange={(event) => {
                        setAetnaFamilyCareDrugQuery(event.target.value);
                        setSelectedAetnaFamilyCareNdc("");
                        setAetnaFamilyCareCoverage(null);
                        setAetnaFamilyCareCoverageRequest(0);
                      }}
                      list="aetna-familycare-drug-suggestions"
                      className="mt-2 h-11 w-full rounded-xl border border-[#bfdcd5] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#55bda8]"
                      placeholder="Type drug, strength, and dosage form"
                      autoComplete="off"
                    />
                    <datalist id="aetna-familycare-drug-suggestions">
                      {aetnaFamilyCareSuggestions.map((suggestion) => (
                        <option key={suggestion.drugName} value={suggestion.drugName} />
                      ))}
                    </datalist>
                  </label>
                  {aetnaFamilyCareSuggestions.length > 0 && (
                    <div className="mt-2 max-h-72 space-y-2 overflow-auto pr-1">
                      {needsProductCorrectionHint(aetnaFamilyCareDrugQuery, aetnaFamilyCareSuggestions.map((suggestion) => suggestion.drugName)) && (
                        <p className="rounded-lg bg-[#eef8f5] px-3 py-2 text-xs font-semibold text-[#0d6664]">
                          Did you mean one of these exact products?
                        </p>
                      )}
                      {aetnaFamilyCareSuggestions.map((suggestion) => (
                        <div key={suggestion.drugName} className="rounded-lg border border-[#d5e6e2] bg-white p-3">
                          <p className="text-xs font-bold text-[#173f41]">{suggestion.drugName}</p>
                          <p className="mt-1 text-[10px] text-[#607a77]">Choose the exact 11-digit NDC</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {suggestion.ndcs.slice(0, 4).map((ndc) => (
                              <button
                                type="button"
                                key={ndc}
                                aria-pressed={selectedAetnaFamilyCareNdc === ndc}
                                onClick={() => {
                                  setSelectedAetnaFamilyCareNdc(ndc);
                                  setAetnaFamilyCareCoverage(null);
                                  setAetnaFamilyCareCoverageRequest(0);
                                }}
                                className={`rounded-full px-2 py-1 text-[9px] font-bold ring-1 ${selectedAetnaFamilyCareNdc === ndc ? "bg-[#0d6664] text-white ring-[#0d6664]" : "bg-[#f3faf8] text-[#315b56] ring-[#b8d9d1]"}`}
                              >
                                {ndc}
                              </button>
                            ))}
                            {suggestion.ndcCount > 4 && <span className="px-1 py-1 text-[9px] text-[#6a817e]">+{suggestion.ndcCount - 4} package NDCs</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={!selectedAetnaFamilyCareNdc || aetnaFamilyCareLoading}
                      onClick={() => setAetnaFamilyCareCoverageRequest((request) => request + 1)}
                      className="rounded-full bg-[#173f41] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0d6664] focus:outline-none focus:ring-2 focus:ring-[#55bda8] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {aetnaFamilyCareLoading ? "Checking coverage…" : "Check coverage"}
                    </button>
                    <span className="text-[11px] text-[#607a77]">
                      {selectedAetnaFamilyCareNdc
                        ? `Exact NDC ${selectedAetnaFamilyCareNdc} selected.`
                        : "Choose the exact 11-digit NDC first."}
                    </span>
                  </div>
                  {(aetnaFamilyCareLoading || aetnaFamilyCareError || aetnaFamilyCareCoverage) && (
                    <div className="mt-4 rounded-xl border border-[#d4e6e2] bg-white p-3">
                      {aetnaFamilyCareLoading ? (
                        <p className="text-xs font-semibold text-[#55716f]">Checking the public Aetna FamilyCare formulary…</p>
                      ) : aetnaFamilyCareError ? (
                        <p className="text-xs text-[#785313]"><strong>Temporarily unavailable.</strong> Do not infer coverage.</p>
                      ) : aetnaFamilyCareCoverage?.status === "listed" && aetnaFamilyCareCoverage.matches?.length ? (
                        <div>
                          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f6ef] px-2.5 py-1 text-xs font-bold text-[#15735f]">
                            <Icon name="check" className="h-3.5 w-3.5" />
                            Covered in the current NJ FamilyCare formulary
                          </p>
                          {aetnaFamilyCareCoverage.matches.map((row) => (
                            <div key={row.ndc} className="mt-2 rounded-lg bg-[#f3faf8] p-2.5">
                              <p className="text-xs font-bold text-[#173f41]">{row.drugName}</p>
                              <p className="mt-0.5 text-[10px] text-[#607a77]">{row.drugTier} · NDC {row.ndc}</p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {row.priorAuthorization && <span className="rounded bg-[#fff1d9] px-1.5 py-1 text-[9px] font-bold text-[#8a5a16]">PA</span>}
                                {row.stepTherapy && <span className="rounded bg-[#fff1d9] px-1.5 py-1 text-[9px] font-bold text-[#8a5a16]">ST</span>}
                                {row.quantityLimit && <span className="rounded bg-[#edf2f1] px-1.5 py-1 text-[9px] font-bold text-[#526b69]">QL</span>}
                                {row.otc && <span className="rounded bg-[#edf2f1] px-1.5 py-1 text-[9px] font-bold text-[#526b69]">OTC</span>}
                              </div>
                            </div>
                          ))}
                          <p className="mt-2 text-[10px] text-[#607a77]">Effective {aetnaFamilyCareCoverage.source?.effectiveDate ?? "current source"}</p>
                        </div>
                      ) : aetnaFamilyCareCoverage ? (
                        <p className="text-xs leading-5 text-[#785313]"><strong>Unconfirmed, not a denial.</strong> No exact NDC row was found in this source.</p>
                      ) : null}
                    </div>
                  )}
                  <p className="mt-3 text-[10px] leading-4 text-[#6a817e]">* Aetna Better Health NJ FamilyCare Medicaid only. Not Aetna commercial, Medicare, eligibility, cost, or payment.</p>
                </article>
                )}
                {activePublicFormulary === "uhc-nj-community" && (
                <article className="rounded-2xl border border-[#d4e6e2] bg-[#f9fcfb] p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0d6664]">NJ Medicaid · 2026</p>
                      <h3 className="mt-1 text-base font-bold text-[#173f41]">UnitedHealthcare Community Plan of New Jersey</h3>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-[#0d6664] ring-1 ring-[#b8d9d1]">Exact RxNorm product</span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[#55716f]">Search the standard UHC Community Plan NJ Medicaid drug list, then select the exact product before checking its published tier and restrictions.</p>
                  <label className="mt-4 block">
                    <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#284e4d]">
                      Step 2 of 2 · exact medication product
                      {activeSelected && <button type="button" onClick={() => { setUhcCommunityDrugQuery(activeSelected.generic); setSelectedUhcCommunityDrug(null); setUhcCommunityCoverage(null); }} className="text-[10px] text-[#0d6664] hover:underline">Use {activeSelected.generic}</button>}
                    </span>
                    <input
                      ref={uhcCommunityDrugRef}
                      value={uhcCommunityDrugQuery}
                      onChange={(event) => { setUhcCommunityDrugQuery(event.target.value); setSelectedUhcCommunityDrug(null); setUhcCommunityCoverage(null); }}
                      list="uhc-community-drug-suggestions"
                      className="mt-2 h-11 w-full rounded-xl border border-[#bfdcd5] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#55bda8]"
                      placeholder="Type drug, strength, or dosage form"
                      autoComplete="off"
                    />
                    <datalist id="uhc-community-drug-suggestions">
                      {uhcCommunityDrugs.map((drug) => <option key={drug.rxcui} value={drug.drugName} />)}
                    </datalist>
                  </label>
                  {uhcCommunityDrugs.length > 0 && (
                    <div className="mt-2 max-h-64 space-y-2 overflow-auto pr-1">
                      {needsProductCorrectionHint(uhcCommunityDrugQuery, uhcCommunityDrugs.map((drug) => drug.drugName)) && <p className="rounded-lg bg-[#eef8f5] px-3 py-2 text-xs font-semibold text-[#0d6664]">Did you mean one of these exact products?</p>}
                      {uhcCommunityDrugs.map((drug) => (
                        <button type="button" key={drug.rxcui} onClick={() => { setSelectedUhcCommunityDrug(drug); setUhcCommunityDrugQuery(drug.drugName); setUhcCommunityCoverage(null); }} className={`block w-full rounded-lg border p-3 text-left ${selectedUhcCommunityDrug?.rxcui === drug.rxcui ? "border-[#0d6664] bg-[#e7f6ef]" : "border-[#d5e6e2] bg-white"}`}>
                          <p className="text-xs font-bold text-[#173f41]">{drug.drugName}</p>
                          <p className="mt-1 text-[10px] text-[#607a77]">Select exact product · RxCUI {drug.rxcui}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {(uhcCommunityLoading || uhcCommunityError || uhcCommunityCoverage) && (
                    <div className="mt-4 rounded-xl border border-[#d4e6e2] bg-white p-3">
                      {uhcCommunityLoading ? <p className="text-xs font-semibold text-[#55716f]">Checking the current UHC Community NJ formulary…</p> : uhcCommunityError ? <p className="text-xs text-[#785313]"><strong>Temporarily unavailable.</strong> Do not infer coverage.</p> : uhcCommunityCoverage?.status === "listed" && uhcCommunityCoverage.drug ? (
                        <div>
                          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f6ef] px-2.5 py-1 text-xs font-bold text-[#15735f]"><Icon name="check" className="h-3.5 w-3.5" />Listed on the UHC Community NJ Medicaid formulary</p>
                          <div className="mt-2 rounded-lg bg-[#f3faf8] p-2.5">
                            <p className="text-xs font-bold text-[#173f41]">{uhcCommunityCoverage.drug.drugName}</p>
                            <p className="mt-0.5 text-[10px] text-[#607a77]">{uhcCommunityCoverage.drug.tier} · RxCUI {uhcCommunityCoverage.drug.rxcui}</p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {uhcCommunityCoverage.drug.priorAuthorization && <span className="rounded bg-[#fff1d9] px-1.5 py-1 text-[9px] font-bold text-[#8a5a16]">PA</span>}
                              {uhcCommunityCoverage.drug.stepTherapy && <span className="rounded bg-[#fff1d9] px-1.5 py-1 text-[9px] font-bold text-[#8a5a16]">ST</span>}
                              {uhcCommunityCoverage.drug.quantityLimit && <span className="rounded bg-[#edf2f1] px-1.5 py-1 text-[9px] font-bold text-[#526b69]">QL</span>}
                            </div>
                          </div>
                          <p className="mt-2 text-[10px] text-[#607a77]">Published source: {uhcCommunityCoverage.source?.sourceLastModified ?? "current feed"}</p>
                        </div>
                      ) : <p className="text-xs leading-5 text-[#785313]"><strong>Unconfirmed, not a denial.</strong> No exact product row was found in this source.</p>}
                    </div>
                  )}
                  <p className="mt-3 text-[10px] leading-4 text-[#6a817e]">* Standard UHC Community Plan NJ Medicaid only. Not UHC employer, Marketplace, Medicare, Part D, eligibility, cost, or payment.</p>
                </article>
                )}
                {activePublicFormulary === "fidelis-nj-familycare" && (
                <article className="rounded-2xl border border-[#d4e6e2] bg-[#f9fcfb] p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0d6664]">NJ FamilyCare Medicaid · August 2026</p>
                      <h3 className="mt-1 text-base font-bold text-[#173f41]">Fidelis Care NJ FamilyCare</h3>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-[#0d6664] ring-1 ring-[#b8d9d1]">Exact pulmonary product</span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[#55716f]">Search the current Fidelis NJ FamilyCare PDL, then select the exact product to review its published tier and restrictions.</p>
                  <label className="mt-4 block">
                    <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#284e4d]">
                      Step 2 of 2 · exact medication product
                      {activeSelected && <button type="button" onClick={() => { setFidelisFamilyCareDrugQuery(activeSelected.generic); setSelectedFidelisFamilyCareDrug(null); setFidelisFamilyCareCoverage(null); }} className="text-[10px] text-[#0d6664] hover:underline">Use {activeSelected.generic}</button>}
                    </span>
                    <input
                      ref={fidelisFamilyCareDrugRef}
                      value={fidelisFamilyCareDrugQuery}
                      onChange={(event) => { setFidelisFamilyCareDrugQuery(event.target.value); setSelectedFidelisFamilyCareDrug(null); setFidelisFamilyCareCoverage(null); }}
                      list="fidelis-familycare-drug-suggestions"
                      className="mt-2 h-11 w-full rounded-xl border border-[#bfdcd5] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#55bda8]"
                      placeholder="Type drug, brand, strength, or form"
                      autoComplete="off"
                    />
                    <datalist id="fidelis-familycare-drug-suggestions">
                      {fidelisFamilyCareDrugs.map((drug) => <option key={drug.id} value={drug.name} />)}
                    </datalist>
                  </label>
                  {fidelisFamilyCareDrugs.length > 0 && (
                    <div className="mt-2 max-h-64 space-y-2 overflow-auto pr-1">
                      {needsProductCorrectionHint(fidelisFamilyCareDrugQuery, fidelisFamilyCareDrugs.map((drug) => `${drug.name} ${drug.aliases.join(" ")}`)) && <p className="rounded-lg bg-[#eef8f5] px-3 py-2 text-xs font-semibold text-[#0d6664]">Did you mean one of these exact products?</p>}
                      {fidelisFamilyCareDrugs.map((drug) => (
                        <button type="button" key={drug.id} onClick={() => { setSelectedFidelisFamilyCareDrug(drug); setFidelisFamilyCareDrugQuery(drug.name); setFidelisFamilyCareCoverage(null); }} className={`block w-full rounded-lg border p-3 text-left ${selectedFidelisFamilyCareDrug?.id === drug.id ? "border-[#0d6664] bg-[#e7f6ef]" : "border-[#d5e6e2] bg-white"}`}>
                          <p className="text-xs font-bold text-[#173f41]">{drug.name}</p>
                          <p className="mt-1 text-[10px] text-[#607a77]">Select exact product · {drug.tier === "P" ? "Preferred" : "Non-preferred"}{drug.note ? ` · ${drug.note}` : ""}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {(fidelisFamilyCareLoading || fidelisFamilyCareError || fidelisFamilyCareCoverage) && (
                    <div className="mt-4 rounded-xl border border-[#d4e6e2] bg-white p-3">
                      {fidelisFamilyCareLoading ? <p className="text-xs font-semibold text-[#55716f]">Checking the current Fidelis NJ FamilyCare PDL…</p> : fidelisFamilyCareError ? <p className="text-xs text-[#785313]"><strong>Temporarily unavailable.</strong> Do not infer coverage.</p> : fidelisFamilyCareCoverage?.status === "listed" && fidelisFamilyCareCoverage.drug ? (
                        <div>
                          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f6ef] px-2.5 py-1 text-xs font-bold text-[#15735f]"><Icon name="check" className="h-3.5 w-3.5" />Listed in the Fidelis NJ FamilyCare 2026 PDL</p>
                          <div className="mt-2 rounded-lg bg-[#f3faf8] p-2.5">
                            <p className="text-xs font-bold text-[#173f41]">{fidelisFamilyCareCoverage.drug.name}</p>
                            <p className="mt-0.5 text-[10px] text-[#607a77]">{fidelisFamilyCareCoverage.drug.tier === "P" ? "Preferred" : "Non-preferred"}</p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {fidelisFamilyCareCoverage.drug.priorAuthorization && <span className="rounded bg-[#fff1d9] px-1.5 py-1 text-[9px] font-bold text-[#8a5a16]">PA</span>}
                              {fidelisFamilyCareCoverage.drug.stepTherapy && <span className="rounded bg-[#fff1d9] px-1.5 py-1 text-[9px] font-bold text-[#8a5a16]">ST</span>}
                              {fidelisFamilyCareCoverage.drug.quantityLimit && <span className="rounded bg-[#edf2f1] px-1.5 py-1 text-[9px] font-bold text-[#526b69]">QL {fidelisFamilyCareCoverage.drug.quantityText ?? ""}</span>}
                              {fidelisFamilyCareCoverage.drug.ageLimit && <span className="rounded bg-[#edf2f1] px-1.5 py-1 text-[9px] font-bold text-[#526b69]">Age {fidelisFamilyCareCoverage.drug.ageText ?? "limit"}</span>}
                            </div>
                          </div>
                          {fidelisFamilyCareCoverage.drug.note && <p className="mt-2 text-[10px] leading-4 text-[#607a77]">{fidelisFamilyCareCoverage.drug.note}</p>}
                        </div>
                      ) : <p className="text-xs leading-5 text-[#785313]"><strong>Unconfirmed, not a denial.</strong> No exact product row was found in this extracted source.</p>}
                    </div>
                  )}
                  <p className="mt-3 text-[10px] leading-4 text-[#6a817e]">* Fidelis Care NJ FamilyCare Medicaid only. This is a partial pulmonary extraction from the current PDL. Not Fidelis Marketplace, Medicare, Part D, eligibility, cost, or payment.</p>
                </article>
                )}
                {activePublicFormulary === "horizon-nj-health" && (
                <article className="rounded-2xl border border-[#d4e6e2] bg-[#f9fcfb] p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0d6664]">NJ FamilyCare Medicaid · July 2026</p>
                      <h3 className="mt-1 text-base font-bold text-[#173f41]">Horizon NJ Health</h3>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-[#0d6664] ring-1 ring-[#b8d9d1]">Exact pulmonary product</span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[#55716f]">Search the current Horizon NJ Health Prescription Drug Listing, then select the exact product to review its published limitations.</p>
                  <label className="mt-4 block">
                    <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#284e4d]">
                      Step 2 of 2 · exact medication product
                      {activeSelected && <button type="button" onClick={() => { setHorizonNjHealthDrugQuery(activeSelected.generic); setSelectedHorizonNjHealthDrug(null); setHorizonNjHealthCoverage(null); }} className="text-[10px] text-[#0d6664] hover:underline">Use {activeSelected.generic}</button>}
                    </span>
                    <input
                      ref={horizonNjHealthDrugRef}
                      value={horizonNjHealthDrugQuery}
                      onChange={(event) => { setHorizonNjHealthDrugQuery(event.target.value); setSelectedHorizonNjHealthDrug(null); setHorizonNjHealthCoverage(null); }}
                      list="horizon-nj-health-drug-suggestions"
                      className="mt-2 h-11 w-full rounded-xl border border-[#bfdcd5] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#55bda8]"
                      placeholder="Type drug, brand, strength, or form"
                      autoComplete="off"
                    />
                    <datalist id="horizon-nj-health-drug-suggestions">
                      {horizonNjHealthDrugs.map((drug) => <option key={drug.id} value={drug.name} />)}
                    </datalist>
                  </label>
                  {horizonNjHealthDrugs.length > 0 && (
                    <div className="mt-2 max-h-64 space-y-2 overflow-auto pr-1">
                      {needsProductCorrectionHint(horizonNjHealthDrugQuery, horizonNjHealthDrugs.map((drug) => `${drug.name} ${drug.aliases.join(" ")}`)) && <p className="rounded-lg bg-[#eef8f5] px-3 py-2 text-xs font-semibold text-[#0d6664]">Did you mean one of these exact products?</p>}
                      {horizonNjHealthDrugs.map((drug) => (
                        <button type="button" key={drug.id} onClick={() => { setSelectedHorizonNjHealthDrug(drug); setHorizonNjHealthDrugQuery(drug.name); setHorizonNjHealthCoverage(null); }} className={`block w-full rounded-lg border p-3 text-left ${selectedHorizonNjHealthDrug?.id === drug.id ? "border-[#0d6664] bg-[#e7f6ef]" : "border-[#d5e6e2] bg-white"}`}>
                          <p className="text-xs font-bold text-[#173f41]">{drug.name}</p>
                          <p className="mt-1 text-[10px] text-[#607a77]">Select exact product{drug.priorAuthorization ? " · Prior authorization" : ""}{drug.limitations ? " · Limitations may apply" : ""}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {(horizonNjHealthLoading || horizonNjHealthError || horizonNjHealthCoverage) && (
                    <div className="mt-4 rounded-xl border border-[#d4e6e2] bg-white p-3">
                      {horizonNjHealthLoading ? <p className="text-xs font-semibold text-[#55716f]">Checking the current Horizon NJ Health formulary…</p> : horizonNjHealthError ? <p className="text-xs text-[#785313]"><strong>Temporarily unavailable.</strong> Do not infer coverage.</p> : horizonNjHealthCoverage?.status === "listed" && horizonNjHealthCoverage.drug ? (
                        <div>
                          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f6ef] px-2.5 py-1 text-xs font-bold text-[#15735f]"><Icon name="check" className="h-3.5 w-3.5" />Listed in the Horizon NJ Health 2026 drug listing</p>
                          <div className="mt-2 rounded-lg bg-[#f3faf8] p-2.5">
                            <p className="text-xs font-bold text-[#173f41]">{horizonNjHealthCoverage.drug.name}</p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {horizonNjHealthCoverage.drug.priorAuthorization && <span className="rounded bg-[#fff1d9] px-1.5 py-1 text-[9px] font-bold text-[#8a5a16]">PA</span>}
                              {horizonNjHealthCoverage.drug.limitations && <span className="rounded bg-[#edf2f1] px-1.5 py-1 text-[9px] font-bold text-[#526b69]">Limits</span>}
                            </div>
                          </div>
                          <p className="mt-2 text-[10px] leading-4 text-[#607a77]">The source marks this product as listed. Confirm the member’s exact benefit and current clinical criteria before prescribing.</p>
                        </div>
                      ) : <p className="text-xs leading-5 text-[#785313]"><strong>Unconfirmed, not a denial.</strong> No exact product row was found in this extracted source.</p>}
                    </div>
                  )}
                  <p className="mt-3 text-[10px] leading-4 text-[#6a817e]">* Horizon NJ Health NJ FamilyCare Medicaid only. This is a partial pulmonary extraction from the current approved drug listing. Not Horizon commercial, Marketplace, Medicare, Part D, eligibility, cost, or payment.</p>
                </article>
                )}
                {activePublicFormulary === "wellpoint-nj-familycare" && (
                <article className="rounded-2xl border border-[#d4e6e2] bg-[#f9fcfb] p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0d6664]">NJ FamilyCare Medicaid · Current machine-readable PDL</p>
                      <h3 className="mt-1 text-base font-bold text-[#173f41]">Wellpoint New Jersey FamilyCare</h3>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-[#0d6664] ring-1 ring-[#b8d9d1]">Exact pulmonary product</span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[#55716f]">Search the current Wellpoint NJ Medicaid PDL, then select the exact product and strength to review its published tier and restrictions.</p>
                  <label className="mt-4 block">
                    <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#284e4d]">
                      Step 2 of 2 · exact medication product
                      {activeSelected && <button type="button" onClick={() => { setWellpointNjFamilyCareDrugQuery(activeSelected.generic); setSelectedWellpointNjFamilyCareDrug(null); setWellpointNjFamilyCareCoverage(null); }} className="text-[10px] text-[#0d6664] hover:underline">Use {activeSelected.generic}</button>}
                    </span>
                    <input
                      ref={wellpointNjFamilyCareDrugRef}
                      value={wellpointNjFamilyCareDrugQuery}
                      onChange={(event) => { setWellpointNjFamilyCareDrugQuery(event.target.value); setSelectedWellpointNjFamilyCareDrug(null); setWellpointNjFamilyCareCoverage(null); }}
                      list="wellpoint-nj-familycare-drug-suggestions"
                      className="mt-2 h-11 w-full rounded-xl border border-[#bfdcd5] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#55bda8]"
                      placeholder="Type drug, brand, strength, or form"
                      autoComplete="off"
                    />
                    <datalist id="wellpoint-nj-familycare-drug-suggestions">
                      {wellpointNjFamilyCareDrugs.map((drug) => <option key={drug.id} value={drug.name} />)}
                    </datalist>
                  </label>
                  {wellpointNjFamilyCareDrugs.length > 0 && (
                    <div className="mt-2 max-h-64 space-y-2 overflow-auto pr-1">
                      {needsProductCorrectionHint(wellpointNjFamilyCareDrugQuery, wellpointNjFamilyCareDrugs.map((drug) => `${drug.name} ${drug.aliases.join(" ")}`)) && <p className="rounded-lg bg-[#eef8f5] px-3 py-2 text-xs font-semibold text-[#0d6664]">Did you mean one of these exact products?</p>}
                      {wellpointNjFamilyCareDrugs.map((drug) => (
                        <button type="button" key={drug.id} onClick={() => { setSelectedWellpointNjFamilyCareDrug(drug); setWellpointNjFamilyCareDrugQuery(drug.name); setWellpointNjFamilyCareCoverage(null); }} className={`block w-full rounded-lg border p-3 text-left ${selectedWellpointNjFamilyCareDrug?.id === drug.id ? "border-[#0d6664] bg-[#e7f6ef]" : "border-[#d5e6e2] bg-white"}`}>
                          <p className="text-xs font-bold text-[#173f41]">{drug.name}</p>
                          <p className="mt-1 text-[10px] text-[#607a77]">Select exact product · {drug.tier}{drug.priorAuthorization ? " · PA" : ""}{drug.quantityLimit ? " · QL" : ""}{drug.specialtyPharmacy ? " · Specialty" : ""}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {(wellpointNjFamilyCareLoading || wellpointNjFamilyCareError || wellpointNjFamilyCareCoverage) && (
                    <div className="mt-4 rounded-xl border border-[#d4e6e2] bg-white p-3">
                      {wellpointNjFamilyCareLoading ? <p className="text-xs font-semibold text-[#55716f]">Checking the current Wellpoint NJ FamilyCare PDL…</p> : wellpointNjFamilyCareError ? <p className="text-xs text-[#785313]"><strong>Temporarily unavailable.</strong> Do not infer coverage.</p> : wellpointNjFamilyCareCoverage?.status === "listed" && wellpointNjFamilyCareCoverage.drug ? (
                        <div>
                          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f6ef] px-2.5 py-1 text-xs font-bold text-[#15735f]"><Icon name="check" className="h-3.5 w-3.5" />Listed in the Wellpoint NJ FamilyCare 2026 PDL</p>
                          <div className="mt-2 rounded-lg bg-[#f3faf8] p-2.5">
                            <p className="text-xs font-bold text-[#173f41]">{wellpointNjFamilyCareCoverage.drug.name}</p>
                            <p className="mt-0.5 text-[10px] text-[#607a77]">{wellpointNjFamilyCareCoverage.drug.tier}</p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {wellpointNjFamilyCareCoverage.drug.priorAuthorization && <span className="rounded bg-[#fff1d9] px-1.5 py-1 text-[9px] font-bold text-[#8a5a16]">PA</span>}
                              {wellpointNjFamilyCareCoverage.drug.quantityLimit && <span className="rounded bg-[#edf2f1] px-1.5 py-1 text-[9px] font-bold text-[#526b69]">QL</span>}
                              {wellpointNjFamilyCareCoverage.drug.stepTherapy && <span className="rounded bg-[#fff1d9] px-1.5 py-1 text-[9px] font-bold text-[#8a5a16]">ST</span>}
                              {wellpointNjFamilyCareCoverage.drug.specialtyPharmacy && <span className="rounded bg-[#edf2f1] px-1.5 py-1 text-[9px] font-bold text-[#526b69]">Specialty</span>}
                              {wellpointNjFamilyCareCoverage.drug.ageLimit && <span className="rounded bg-[#edf2f1] px-1.5 py-1 text-[9px] font-bold text-[#526b69]">Age limit</span>}
                            </div>
                          </div>
                          <p className="mt-2 text-[10px] leading-4 text-[#607a77]">Confirm the member’s exact benefit and current clinical criteria before prescribing.</p>
                        </div>
                      ) : <p className="text-xs leading-5 text-[#785313]"><strong>Unconfirmed, not a denial.</strong> No exact product row was found in this extracted source.</p>}
                    </div>
                  )}
                  <p className="mt-3 text-[10px] leading-4 text-[#6a817e]">* Wellpoint NJ FamilyCare Medicaid only. Full machine-readable product feed, not eligibility, cost, payment, or clinical criteria. Not Wellpoint Medicare or Marketplace.</p>
                </article>
                )}
              </div>
            </section>
            )}
            <details className="mb-5 rounded-2xl border border-[#d8e5e3] bg-white shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-bold text-[#173f41] sm:px-6">
                <span>Need help identifying a plan or drug-list name?</span>
                <span className="rounded-full bg-[#eef8f5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0d6664]">Optional reference</span>
              </summary>
              <section className="border-t border-[#e1ecea]">
              <div className="border-b border-[#e1ecea] px-5 py-4 sm:px-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0d6664]">
                  Commercial plan finder
                </p>
                <h2 className="mt-1 text-lg font-bold tracking-tight text-[#173f41]">
                  Match the plan’s drug list before searching.
                </h2>
                <p className="mt-1 text-sm leading-5 text-[#55716f]">
                  Carrier names are not enough. Enter the plan or pharmacy-benefit name above, then search the imported evidence here. Official sources remain available for audit, not as the normal workflow.
                </p>
              </div>
              <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
                {commercialPlanRoutes.map((route) => (
                  <article key={route.carrier} className="rounded-xl border border-[#d8e6e3] bg-[#f9fcfb] p-4">
                    <h3 className="text-sm font-bold text-[#173f41]">{route.carrier}</h3>
                    <p className="mt-1 min-h-10 text-xs leading-5 text-[#5c7775]">{route.prompt}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openPlanIntake(route.intakeInsurer)}
                        className="rounded-full bg-[#173f41] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#0d6664]"
                      >
                        Enter plan details
                      </button>
                    </div>
                    <details className="mt-3 text-[10px] text-[#55716f]">
                      <summary className="cursor-pointer font-bold text-[#0d6664]">Evidence source</summary>
                      <a href={route.url} target="_blank" rel="noreferrer" className="mt-1 inline-block hover:underline">
                        {route.action}
                      </a>
                    </details>
                  </article>
                ))}
              </div>
              </section>
            </details>
            <details className="mb-5 rounded-2xl border border-[#d8e5e3] bg-white shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-bold text-[#173f41] sm:px-6">
                <span>Browse named formulary references</span>
                <span className="rounded-full bg-[#eef8f5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0d6664]">Optional reference</span>
              </summary>
              <div className="border-t border-[#e1ecea] p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Commercial and named-plan shortcuts</h2>
                <p className="text-xs text-[#6b8180]">
                  Select a sourced plan family to see its medications, coverage alternatives, and PA actions.
                </p>
              </div>
              <div className="flex items-center gap-2">
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
                const unconfirmed = medications.filter(
                  (med) => coverageFor(med, plan.key).state === "Source loading",
                ).length;
                const isGeneralPdlReference = generalPdlReferenceKeys.has(plan.key);
                return (
                  <article
                    key={plan.key}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setPlanFilter(plan.key);
                      setView("medications");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setPlanFilter(plan.key);
                        setView("medications");
                      }
                    }}
                    className="rounded-2xl border border-[#d8e5e3] bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-lg bg-[#e7f3f1] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0d6664]">
                        {isGeneralPdlReference ? "General PDL reference" : "Named formulary"}
                      </span>
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
                    <p className="mt-2 text-xs font-bold text-[#0d6664]">
                      {isGeneralPdlReference
                        ? "Search listings, then confirm the exact employer benefit"
                        : "Click to search this named formulary"}
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-[#eef8f4] p-3">
                        <div className="text-2xl font-semibold text-[#15735f]">
                          {preferred}
                        </div>
                        <div className="text-xs text-[#59736e]">
                          plan preferred / Tier 1
                        </div>
                      </div>
                      <div className="rounded-xl bg-[#fff6e8] p-3">
                        <div className="text-2xl font-semibold text-[#9a6417]">
                          {restricted}
                        </div>
                        <div className="text-xs text-[#7b6a4f]">restricted</div>
                      </div>
                    </div>
                    {unconfirmed > 0 && (
                      <p className="mt-3 rounded-lg bg-[#fff8e8] px-3 py-2 text-[10px] leading-4 text-[#785313]">
                        {unconfirmed} of {medications.length} medication families remain unconfirmed in this reference. Missing is not a denial.
                      </p>
                    )}
                    <a
                      href={plan.source}
                      onClick={(event) => event.stopPropagation()}
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
              </div>
            </details>

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
                    onChange={(event) => {
                      setInsurerQuery(event.target.value);
                      setSelectedInsurerName(null);
                    }}
                    list="insurer-suggestions"
                    className="h-11 w-full rounded-xl border border-[#d9e7e4] bg-[#f7faf9] pl-10 pr-3 text-sm outline-none ring-2 ring-transparent focus:bg-white focus:ring-[#55bda8]"
                    placeholder="Find Aetna, Medicare, UHC..."
                  />
                  <datalist id="insurer-suggestions">
                    {summitNjInsurers.map((insurer) => (
                      <option key={insurer.name} value={insurer.name} />
                    ))}
                  </datalist>
                </label>
              </div>
              <div className="mt-5 rounded-xl border border-[#b9ddd5] bg-[#eef8f5] p-4 sm:p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0d6664]">
                  Insurance card workflow
                </p>
                <h3 className="mt-1 text-lg font-bold tracking-tight text-[#173f41]">
                  Choose the insurer on the card to see the safe next step.
                </h3>
                <p className="mt-1 max-w-3xl text-sm leading-5 text-[#55716f]">
                  This does not collect member IDs, claim numbers, eligibility, or patient information. It routes staff to the correct plan, pharmacy-benefit, or authorization check.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {workflowInsurers.map((insurer) => (
                    <button
                      type="button"
                      key={insurer.name}
                      aria-pressed={selectedInsurerName === insurer.name}
                      onClick={() => setSelectedInsurerName(insurer.name)}
                      className={`rounded-xl border px-3 py-2.5 text-left transition focus:outline-none focus:ring-2 focus:ring-[#55bda8] ${selectedInsurerName === insurer.name ? "border-[#5aa998] bg-white shadow-sm" : "border-[#cfe2de] bg-[#f8fcfb] hover:border-[#8ec4ba]"}`}
                    >
                      <span className="block text-sm font-bold text-[#173f41]">
                        {insurer.name}
                      </span>
                      <span className="mt-1 block text-[10px] font-semibold text-[#4d7470]">
                        {insurer.category}
                      </span>
                    </button>
                  ))}
                </div>
                {!insurerQuery && !showAllInsurerWorkflows && (
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#55716f]">
                    <span>Showing 9 common starting points. Search by the insurer on the card for a direct workflow.</span>
                    <button
                      type="button"
                      onClick={() => setShowAllInsurerWorkflows(true)}
                      className="font-bold text-[#0d6664] hover:underline"
                    >
                      Show all {summitNjInsurers.length} workflows
                    </button>
                  </div>
                )}
                {summitNjDirectory.length === 0 && (
                  <p className="mt-4 rounded-lg bg-white p-3 text-sm text-[#55716f]">
                    No accepted insurer matches that search.
                  </p>
                )}
                {selectedInsurer && selectedWorkflow && (
                  <article className="mt-5 rounded-xl border border-[#9bcfc4] bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0d6664]">
                          {selectedWorkflow.kind}
                        </p>
                        <h4 className="mt-1 text-lg font-bold text-[#173f41]">
                          {selectedInsurer.name} plan check
                        </h4>
                      </div>
                      <span className="w-fit rounded-full bg-[#eef8f5] px-2.5 py-1 text-[10px] font-bold text-[#0d6664] ring-1 ring-[#c9e2dc]">
                        No PHI entry
                      </span>
                    </div>
                    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,.65fr)]">
                      <div>
                        <p className="text-xs font-bold text-[#284e4d]">Read from the card or benefits document</p>
                        <p className="mt-1 rounded-lg bg-[#f5faf8] p-3 text-sm leading-5 text-[#55716f]">
                          {selectedWorkflow.cardCheck}
                        </p>
                        <ol className="mt-4 space-y-2 text-sm leading-5 text-[#3f605d]">
                          {selectedWorkflow.steps.map((step, index) => (
                            <li key={step} className="flex gap-3">
                              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#dff1ec] text-[10px] font-bold text-[#0d6664]">
                                {index + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <aside className="rounded-xl border border-[#d9e9e5] bg-[#fbfdfc] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#55716f]">
                          Result rule
                        </p>
                        <p className="mt-2 text-xs leading-5 text-[#4e6c68]">
                          {selectedWorkflow.resultRule}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openPlanIntake(selectedInsurer.name)}
                            className="rounded-full bg-[#173f41] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#0d6664]"
                          >
                            Enter plan details
                          </button>
                          {selectedWorkflow.source && (
                            <details className="rounded-full border border-[#9bcfc4] px-3 py-1.5 text-xs font-bold text-[#0d6664]">
                              <summary className="cursor-pointer">Evidence source</summary>
                              <a href={selectedWorkflow.source.url} target="_blank" rel="noreferrer" className="mt-2 block underline">
                                {selectedWorkflow.source.label}
                              </a>
                            </details>
                          )}
                          {selectedWorkflow.cardAction && (
                            <p className="rounded-lg bg-[#f5faf8] p-2 text-[11px] leading-4 text-[#4e6c68]">
                              {selectedWorkflow.cardAction}
                            </p>
                          )}
                        </div>
                      </aside>
                    </div>
                  </article>
                )}
              </div>
              <details className="mt-5 rounded-xl border border-[#d8e8e4] bg-[#f5faf8] p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0d6664]">
                      Summit NJ pulmonary priority
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#183839]">
                      Source routes for the next insurer batches
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#446d69] ring-1 ring-[#c9ded9]">
                    Expand
                  </span>
                </summary>
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
              </details>
              <details
                open={Boolean(insurerQuery)}
                className="mt-5 rounded-xl border border-[#e1ebe9] bg-[#fbfdfc] p-4"
              >
                <summary className="cursor-pointer list-none text-sm font-bold text-[#183839]">
                  {insurerQuery
                    ? `${summitNjDirectory.length} matching accepted insurer${summitNjDirectory.length === 1 ? "" : "s"}`
                    : `Browse all ${summitNjInsurers.length} Summit NJ insurers`}
                </summary>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
                  <p className="mt-4 rounded-xl bg-[#f4f8f7] p-4 text-sm text-[#607977]">
                    No insurer matches that search.
                  </p>
                )}
              </details>
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
              <div className="flex flex-col gap-3 border-b border-[#e4ecea] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div>
                  <h2 className="font-bold">Medication coverage</h2>
                  <p className="text-xs text-[#6b8180]" aria-live="polite">
                    {results.length} results across {visiblePlans.length}{" "}
                    formular{visiblePlans.length === 1 ? "y" : "ies"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="relative block w-full sm:w-72">
                    <span className="sr-only">Quick search medication coverage</span>
                    <Icon
                      name="search"
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#698281]"
                    />
                    <input
                      id="coverage-quick-search"
                      ref={coverageQuickSearchRef}
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      list="coverage-medication-suggestions"
                      autoComplete="off"
                      className="h-10 w-full rounded-xl border border-[#d9e7e4] bg-[#f7faf9] pl-9 pr-3 text-sm outline-none ring-2 ring-transparent transition focus:bg-white focus:ring-[#55bda8]"
                      placeholder="Quick search coverage"
                    />
                    <datalist id="coverage-medication-suggestions">
                      {autocompleteOptions.map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                  </label>
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="shrink-0 rounded-lg px-2 py-2 text-xs font-bold text-[#0d6664] transition hover:bg-[#e7f3f1] focus:outline-none focus:ring-2 focus:ring-[#55bda8]"
                    >
                      Clear
                    </button>
                  )}
                  <Icon name="filter" className="hidden h-5 w-5 text-[#698281] sm:block" />
                </div>
              </div>
              <div className="max-h-[760px] divide-y divide-[#e7eeed] overflow-y-auto">
                {results.map((med) => (
                  <button
                    key={med.generic}
                    onClick={() => selectMedication(med)}
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
                              {isCoveredBySource(item.state) && (
                                <Icon name="check" className="h-3.5 w-3.5" />
                              )}
                              {isCoveredBySource(item.state) && (
                                <>
                                  <span>Source-listed</span>
                                  <span className="opacity-50">·</span>
                                </>
                              )}
                              <span>{plan.short}</span>
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

            <aside ref={medicationDetailRef} className="order-first h-fit scroll-mt-4 rounded-2xl border border-[#d8e5e3] bg-white p-5 shadow-sm xl:order-none xl:sticky xl:top-5">
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
                  {activeSelected.productDetails && (
                    <p className="mt-3 rounded-xl border border-[#dce9e6] bg-[#f8fbfa] p-3 text-[11px] leading-4 text-[#486665]">
                      <strong className="text-[#244a48]">Product details:</strong>{" "}
                      {activeSelected.productDetails}
                    </p>
                  )}
                  <p className="mt-2 text-[11px] leading-4 text-[#738786]">
                    Product-family summary. Device, strength, and brand or
                    generic status can differ.
                  </p>
                  <p className="mt-4 rounded-xl bg-[#f2f7f6] p-3 text-sm leading-5 text-[#3d5959]">
                    {activeSelected.use}
                  </p>
                  {selectedMedicarePlan && (
                    <section className="mt-5 rounded-xl border border-[#9fcfc4] bg-[#eef8f5] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0d6664]">
                            Selected {selectedMedicarePlan.plan_type}
                          </p>
                          <p className="mt-1 text-sm font-bold text-[#173f41]">
                            {selectedMedicarePlan.plan_name}
                          </p>
                          <p className="mt-0.5 text-[10px] text-[#58726f]">
                            {selectedMedicarePlan.contract_id}-{selectedMedicarePlan.plan_id} · Formulary {selectedMedicarePlan.formulary_id}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-2 py-1 text-[9px] font-bold text-[#0d6664] ring-1 ring-[#b8d9d1]">
                          CMS source
                        </span>
                      </div>
                      {medicareCoverageLoading ? (
                        <p className="mt-3 text-xs font-semibold text-[#55716f]">Checking the selected plan…</p>
                      ) : selectedMedicareCoverage?.coverage.length ? (
                        <div className="mt-3 space-y-2">
                          {selectedMedicareCoverage.coverage.map((item, index) => (
                            <div key={`${item.tier_level}-${index}`} className="rounded-lg bg-white p-2.5 ring-1 ring-[#cfe4df]">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-[#173f41]">
                                  {item.tier_level ? `Tier ${item.tier_level}` : "Tier not supplied"}
                                </span>
                                <span className="text-[9px] font-bold uppercase tracking-wide text-[#54716d]">
                                  Candidate row
                                </span>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {item.prior_authorization && <span className="rounded bg-[#fff1d9] px-1.5 py-1 text-[9px] font-bold text-[#8a5a16]">PA</span>}
                                {item.quantity_limit && <span className="rounded bg-[#edf2f1] px-1.5 py-1 text-[9px] font-bold text-[#526b69]">QL{item.quantity_limit_amount ? ` ${item.quantity_limit_amount}${item.quantity_limit_days ? ` / ${item.quantity_limit_days} days` : ""}` : ""}</span>}
                                {item.step_therapy && <span className="rounded bg-[#fff1d9] px-1.5 py-1 text-[9px] font-bold text-[#8a5a16]">ST</span>}
                                {!item.prior_authorization && !item.quantity_limit && !item.step_therapy && <span className="text-[10px] text-[#58726f]">No CMS restriction flag on this matched row.</span>}
                              </div>
                              {(item.rxcui || item.ndc) && (
                                <p className="mt-2 text-[9px] text-[#6a817e]">
                                  {item.rxcui ? `RxCUI ${item.rxcui}` : ""}{item.rxcui && item.ndc ? " · " : ""}{item.ndc ? `NDC ${item.ndc}` : ""}
                                </p>
                              )}
                            </div>
                          ))}
                          <p className="text-[10px] leading-4 text-[#55716f]">
                            CMS {selectedMedicareCoverage.source.source_version}. <strong>Needs product confirmation:</strong> match the device, strength, and NDC against the card/formulary before acting.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 rounded-lg border border-[#e2c996] bg-[#fff9ea] p-2.5 text-[10px] leading-4 text-[#785313]">
                          <strong>Unconfirmed - not a denial.</strong> No matching CMS product row was found for this medication name and selected plan. Verify the exact device, strength, and NDC in the plan formulary.
                        </div>
                      )}
                    </section>
                  )}
                  {!selectedMedicarePlan && (
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
                              <span className="inline-flex items-center gap-1">
                                {isCoveredBySource(item.state) && (
                                  <Icon name="check" className="h-3.5 w-3.5" />
                                )}
                                <span>{isCoveredBySource(item.state) ? "Source-listed" : displayState(item.state)}</span>
                                {isCoveredBySource(item.state) && (
                                  <>
                                    <span className="opacity-50">·</span>
                                    <span>{displayState(item.state)}</span>
                                  </>
                                )}
                              </span>
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
                          {item.state === "Source loading" && (
                            <div className="mt-2 rounded-md border border-[#e2c996] bg-[#fff9ea] px-2 py-2 text-[10px] leading-4 text-[#785313]">
                              <strong>Please verify insurance coverage.</strong>{" "}
                              This result is unconfirmed, not a denial. An official source was not found for this exact medication and plan combination.
                            </div>
                          )}
                          {item.priorAuthorizationUrl && (
                            <a
                              href={item.priorAuthorizationUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#fff6e8] px-2 py-1.5 text-[10px] font-bold text-[#8a5a16] ring-1 ring-[#efd4a4] hover:bg-[#ffedcc]"
                            >
                              {item.priorAuthorizationLabel ?? `Open PA form for ${activeSelected.generic}`}
                              <Icon name="external" className="h-3 w-3" />
                            </a>
                          )}
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
                                {plan.priorAuthorizationDownload
                                  ? `Download PA form for ${activeSelected.generic}`
                                  : `Open ${plan.short} PA route for ${activeSelected.generic}`}
                                <Icon name="external" className="h-3 w-3" />
                              </a>
                            )}
                          {!isStraightforwardCoverage(item.state) && (
                            <div className="mt-3 rounded-lg bg-[#f3f8f7] p-2.5">
                              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#466e69]">
                                Same-category reference options
                              </div>
                              {alternatives.length > 0 ? (
                                <>
                                  <p className="mt-1 text-[10px] leading-4 text-[#718482]">
                                    Not substitution advice. These medicines share a therapeutic category and have source-listed coverage on this reference plan. Review clinical appropriateness separately.
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {alternatives.map((alternative) => (
                                      <button
                                        key={alternative.generic}
                                        onClick={() => {
                                          setQuery("");
                                          setBranch(alternative.branch);
                                          selectMedication(alternative);
                                        }}
                                        className="rounded-full bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#0d6664] ring-1 ring-[#b9d8d2] transition hover:bg-[#e5f3f0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55bda8]"
                                      >
                                        {alternative.generic} · {displayState(coverageFor(alternative, plan.key).state)}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              ) : (
                                <p className="mt-1 text-[10px] leading-4 text-[#718482]">
                                  No covered alternative is verified in this source yet. Use the PA action above when appropriate.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  )}
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
              <strong>Evidence-first medication access.</strong> No patient data,
              eligibility checks, or medical advice. “Not listed” does not mean
              not covered.
            </p>
          </div>
          <span className="shrink-0 font-semibold">
            Curated public PDL snapshot. Verify the exact product.
          </span>
          <span className="shrink-0 font-semibold text-[#173f41]">
            Made by Rishva Iyer
          </span>
        </footer>
      </section>
    </main>
  );
};
