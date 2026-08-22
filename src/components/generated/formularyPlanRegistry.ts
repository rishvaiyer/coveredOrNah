export type PlanKey =
  | "nyrx"
  | "njuhc"
  | "pama"
  | "horizonMarketplace"
  | "ambetterNjMarketplace"
  | "horizonClassic"
  | "uhcCommercial"
  | "oxfordFreedom"
  | "aetnaMedicareHmo"
  | "amerihealthNj"
  | "amerihealthValue"
  | "amerihealthSelect"
  | "cignaNationalPreferred"
  | "oscarNjIndividual"
  | "anthemNySelect"
  | "wellcareNjH0913"
  | "humanaNj26408"
  | "bravenNjH0885"
  | "healthspringNj26096"
  | "cloverNj2026"
  | "wellpointNjFamilyCare";

export type PlanDefinition = {
  key: PlanKey;
  short: string;
  name: string;
  region: string;
  updated: string;
  source: string;
  priorAuthorizationUrl?: string;
  priorAuthorizationLabel?: string;
  priorAuthorizationDownload?: boolean;
};

export const plans: PlanDefinition[] = [
  {
    key: "horizonMarketplace",
    short: "Horizon Marketplace",
    name: "Horizon BCBSNJ Marketplace",
    region: "NJ",
    updated: "Aug 2026",
    source:
      "https://www.myprime.com/content/dam/prime/memberportal/WebDocs/2026/Formularies/HIM/2026_NJ_3T_HealthInsuranceMarketplace.pdf",
  },
  {
    key: "horizonClassic",
    short: "Horizon Classic",
    name: "Horizon BCBSNJ Classic Formulary",
    region: "NJ",
    updated: "Jul 1, 2026",
    source:
      "https://www.myprime.com/content/dam/prime/memberportal/WebDocs/2026/Formularies/Commercial/5517-L_Horizon_Classic.pdf",
    priorAuthorizationUrl: "https://www.horizonblue.com/providers/pharmacy",
    priorAuthorizationLabel: "Open Horizon pharmacy PA route",
  },
  {
    key: "ambetterNjMarketplace",
    short: "Ambetter NJ Marketplace",
    name: "Ambetter from WellCare of New Jersey Marketplace Formulary",
    region: "NJ",
    updated: "Aug 2026",
    source:
      "https://www.ambetterhealth.com/content/dam/centene/new-jersey/ambetter/pdf/2026-nj-formulary.pdf",
    priorAuthorizationUrl:
      "https://www.ambetterhealth.com/en/nj/provider-resources/pharmacy/",
    priorAuthorizationLabel: "Open Ambetter pharmacy resources",
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
    key: "oxfordFreedom",
    short: "Oxford Freedom",
    name: "Oxford Freedom Network commercial PDL baseline",
    region: "NJ / NY",
    updated: "May 1, 2026",
    source:
      "https://www.uhcprovider.com/content/dam/provider/docs/public/resources/pharmacy/commercial-pdl-may-2026.pdf",
    priorAuthorizationUrl:
      "https://www.uhcprovider.com/en/prior-auth-advance-notification/prior-auth-specialty-drugs/prior-auth-pharmacy-medical-necessity.html",
    priorAuthorizationLabel: "Open Oxford / UHC PA route",
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
    key: "amerihealthValue",
    short: "AmeriHealth Value",
    name: "AmeriHealth New Jersey Value Formulary",
    region: "NJ",
    updated: "Jul 1, 2026",
    source:
      "https://www.amerihealth.com/pdfs/providers/pharmacy_information/value/ah-value-formulary-nj.pdf",
    priorAuthorizationUrl:
      "https://www.amerihealth.com/resources/for-providers/policies-and-guidelines/prior-authorization.html",
    priorAuthorizationLabel: "Open PA route",
  },
  {
    key: "amerihealthSelect",
    short: "AmeriHealth Select",
    name: "AmeriHealth New Jersey Select Formulary",
    region: "NJ",
    updated: "Jul 1, 2026",
    source:
      "https://amerihealth.com/pdfs/providers/pharmacy_information/select_drug/ah-select-drug-formulary-nj.pdf",
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
  {
    key: "wellcareNjH0913",
    short: "Wellcare NJ",
    name: "Wellcare NJ Medicare H0913-002/021 formulary",
    region: "NJ",
    updated: "Jul 22, 2026",
    source: "https://www.wellcare.com/en/New-Jersey/Providers/Medicare/Pharmacy",
    priorAuthorizationUrl:
      "https://www.wellcare.com/-/media/pdfs/na/member/request-forms/der/na_drug_coverage_determination_request_2025_r.ashx",
    priorAuthorizationLabel: "Download Wellcare PA form",
    priorAuthorizationDownload: true,
  },
  {
    key: "humanaNj26408",
    short: "Humana NJ",
    name: "Humana NJ Medicare formulary 26408",
    region: "NJ",
    updated: "Aug 1, 2026",
    source: "https://assets.humana.com/is/content/humana/20260009PDG2640826Cpdf",
    priorAuthorizationUrl:
      "https://provider.humana.com/pharmacy-resources/prior-authorizations",
    priorAuthorizationLabel: "Open Humana PA route",
  },
  {
    key: "bravenNjH0885",
    short: "Braven NJ",
    name: "Braven NJ Medicare H0885 formulary",
    region: "NJ",
    updated: "Jul 22, 2026",
    source: "https://mydirectory.bravenhealth.com/",
  },
  {
    key: "healthspringNj26096",
    short: "HealthSpring NJ",
    name: "HealthSpring NJ Medicare H3949-054 / H7849-149 formulary",
    region: "NJ",
    updated: "May 1, 2026",
    source: "https://www.healthspring.com/static/docs/medicare/plans/2026/formulary-mapd.pdf",
    priorAuthorizationUrl: "https://www.healthspring.com/providers/pharmacy",
    priorAuthorizationLabel: "Open HealthSpring drug PA forms",
  },
  {
    key: "cloverNj2026",
    short: "Clover NJ",
    name: "Clover NJ Medicare formulary 00026082",
    region: "NJ",
    updated: "Jun 23, 2026",
    source:
      "https://cdn.cloverhealth.com/filer_cloudrun_public/filer_public/c5/9f/c59f4269-fd6e-4d72-9580-cb812b952e43/25mx108a_2026_formulary_ch_nj_cy26_5t_gs_core_july_26.pdf",
    priorAuthorizationUrl: "https://cdrd.cvscaremarkmyd.com/CoverageDetermination.aspx?ClientID=51",
    priorAuthorizationLabel: "Open Clover drug PA form",
  },
  {
    key: "wellpointNjFamilyCare",
    short: "Wellpoint FamilyCare",
    name: "Wellpoint New Jersey FamilyCare PDL",
    region: "NJ",
    updated: "May 1, 2026",
    source: "https://fm.formularynavigator.com/FBO/4/New%20Jersey%20Medicaid.json",
    priorAuthorizationUrl:
      "https://www.provider.wellpoint.com/new-jersey-provider/member-eligibility-and-pharmacy/pharmacy-information",
    priorAuthorizationLabel: "Open Wellpoint NJ pharmacy PA route",
  },
];

export const exactMedicarePlanKeys = new Set<PlanKey>([
  "aetnaMedicareHmo",
  "wellcareNjH0913",
  "humanaNj26408",
  "bravenNjH0885",
  "healthspringNj26096",
  "cloverNj2026",
]);

export const primaryNjPlans = plans.filter(
  (plan) => plan.region.includes("NJ") && plan.key !== "anthemNySelect",
);

export const referencePlans = primaryNjPlans.filter(
  (plan) => !exactMedicarePlanKeys.has(plan.key),
);

export const generalPdlReferenceKeys = new Set<PlanKey>([
  "uhcCommercial",
  "oxfordFreedom",
  "cignaNationalPreferred",
]);

export const planNameSuggestions = Array.from(
  new Set(referencePlans.flatMap((plan) => [plan.name, plan.short])),
).sort();

export const pharmacyBenefitSuggestions = [
  "Commercial PDL",
  "Medicare formulary",
  "Advantage 3-Tier",
  "Prime Therapeutics",
  "Optum Rx",
  "CVS Caremark",
  "Express Scripts",
].sort();

export type CommercialPlanRoute = {
  carrier: string;
  intakeInsurer: string;
  prompt: string;
  action: string;
  url: string;
  baseline?: PlanKey;
};

export const commercialPlanRoutes: CommercialPlanRoute[] = [
  {
    carrier: "Horizon BCBSNJ",
    intakeInsurer: "Horizon BCBSNJ",
    prompt:
      "Direct Access POS: use the pharmacy benefit or drug-list name on the card. Marketplace is a separate drug list.",
    action: "Check Horizon plan in MyPrime",
    url: "https://www.myprime.com/",
  },
  {
    carrier: "UHC / Oxford",
    intakeInsurer: "UnitedHealthcare",
    prompt:
      "Freedom: choose the PDL variant shown on the plan/SBC, such as Access, Traditional, or Advantage.",
    action: "Open UHC / Oxford drug lists",
    url: "https://www.uhcprovider.com/en/resource-library/drug-lists-pharmacy.html?CID=none",
    baseline: "oxfordFreedom",
  },
  {
    carrier: "Aetna",
    intakeInsurer: "Aetna",
    prompt: "Choose the plan year and pharmacy plan name from the card or benefits document.",
    action: "Find an Aetna medication",
    url: "https://www.aetna.com/individuals-families/find-a-medication.html",
  },
  {
    carrier: "Cigna",
    intakeInsurer: "Cigna",
    prompt: "Choose the employer drug-list family, such as Standard, Value, Performance, or Advantage.",
    action: "Open Cigna drug lists",
    url: "https://www.cigna.com/individuals-families/member-guide/prescription-drug-lists",
    baseline: "cignaNationalPreferred",
  },
  {
    carrier: "AmeriHealth NJ",
    intakeInsurer: "AmeriHealth / AmeriHealth Administrators",
    prompt: "Choose Value, Select, or Individual & Family from the plan/SBC.",
    action: "Open AmeriHealth formulary",
    url: "https://www.amerihealth.com/resources/for-providers/policies-and-guidelines/value-formulary.html",
    baseline: "amerihealthNj",
  },
  {
    carrier: "Oscar NJ",
    intakeInsurer: "Oscar Health",
    prompt: "Use the plan name or HIOS/product identifier from the enrollment card or benefits page.",
    action: "Open Oscar drug check",
    url: "https://www.hioscar.com/care-options",
    baseline: "oscarNjIndividual",
  },
];
