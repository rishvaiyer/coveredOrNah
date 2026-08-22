import type { ClinicCatalog } from "./catalogTypes";

export const oralOncologyCatalog: ClinicCatalog = {
  slug: "oral-oncology",
  name: "Oral Oncology Starter Catalog",
  specialty: "Oral oncology",
  status: "starter",
  medications: [
    ["Tamoxifen", "Soltamox", "Breast oncology", "Hormone receptor positive breast cancer", "Tablets and oral solution differ; indication split between adjuvant and risk-reduction use."],
    ["Anastrozole", "Arimidex", "Breast oncology", "Postmenopausal hormone receptor positive breast cancer", "Oral tablet strengths must be matched; premenopausal use is off-label."],
    ["Letrozole", "Femara", "Breast oncology", "Postmenopausal hormone receptor positive breast cancer", "Oral tablet strengths differ; extended adjuvant setting is a distinct indication."],
    ["Exemestane", "Aromasin", "Breast oncology", "Postmenopausal breast cancer after nonsteroidal aromatase inhibitor progression", "Oral tablet strengths differ; sequence after prior aromatase inhibitor matters."],
    ["Abiraterone", "Zytiga generics (abiraterone acetate)", "Prostate oncology", "Metastatic castration resistant prostate cancer", "Generic tablets and Yonsa nanocrystal formulation are distinct products; prednisone co-administration varies by indication."],
    ["Enzalutamide", "Xtandi", "Prostate oncology", "Nonmetastatic and metastatic castration resistant prostate cancer", "Indication splits across nmCRPC and mCRPC settings; capsule and tablet forms differ."],
    ["Apalutamide", "Erleada", "Prostate oncology", "Nonmetastatic castration resistant prostate cancer", "Fixed-dose oral tablet; indication differs from enzalutamide in earlier-stage disease."],
    ["Imatinib", "Gleevec", "CML and GIST", "Chronic myeloid leukemia and gastrointestinal stromal tumors", "Indication splits between CML, GIST, Ph+ ALL, and other targets; tablet strengths vary widely."],
    ["Ibrutinib", "Imbruvica", "B-cell malignancies", "CLL, mantle cell lymphoma, Waldenstrom macroglobulinemia", "Capsule, tablet, and suspension products differ; dosing varies by indication."],
    ["Acalabrutinib", "Calquence", "B-cell malignancies", "CLL and mantle cell lymphoma", "Capsule versus fixed-dose combination tablet with obinutuzumab co-pack distinction."],
    ["Lenalidomide", "Revlimid", "Multiple myeloma", "Multiple myeloma, myelodysplastic syndrome subtypes, mantle cell lymphoma", "Revlimid REMS is the only REMS program in this starter set; indication and strength distinctions drive coverage review."],
    ["Capecitabine", "Xeloda", "Colorectal and breast oncology", "Colorectal, gastric, and breast cancer", "Oral tablet strengths combine to reach doses; indication split across GI and breast settings."],
    ["Sorafenib", "Nexavar", "Liver and kidney oncology", "Hepatocellular carcinoma, renal cell carcinoma, thyroid cancer", "Tablet strengths differ; indication split among liver, kidney, and thyroid cancers."],
    ["Sunitinib", "Sutent", "Kidney oncology and GIST", "Renal cell carcinoma, imatinib-resistant GIST, pancreatic NET", "Schedule-based dosing cycles vary by indication; capsule strengths matter."],
    ["Palbociclib", "Ibrance", "Breast oncology", "HR-positive HER2-negative advanced or metastatic breast cancer", "Combination partner (letrozole vs fulvestrant) changes indication framing; capsule and tablet forms differ."],
    ["Olaparib", "Lynparza", "Ovarian, breast, prostate, pancreatic oncology", "BRCA-mutated ovarian, breast, prostate, and pancreatic cancers", "Tablet formulation replaced capsules at different dose equivalence; biomarker and indication splits drive coverage."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({
    generic,
    brands,
    category,
    commonUses,
    productDetails,
  })),
};
