import type { ClinicCatalog } from "./catalogTypes";

export const gastroenterologyCatalog: ClinicCatalog = {
  slug: "gastroenterology",
  name: "Gastroenterology Starter Catalog",
  specialty: "Gastroenterology and hepatology",
  status: "starter",
  medications: [
    ["Mesalamine oral", "Apriso, Lialda, Asacol HD", "Ulcerative colitis 5-ASA", "Mild-to-moderate ulcerative colitis induction and maintenance", "Apriso extended-release capsule, Lialda delayed-release tablet, and Asacol HD 800 mg tablet are distinct delivery systems and are not interchangeable."],
    ["Mesalamine rectal", "Canasa, Rowasa", "Distal ulcerative colitis 5-ASA", "Proctitis and left-sided ulcerative colitis", "Suppository (Canasa) treats proctitis only; enema (Rowasa) reaches the left colon; formulation must be matched."],
    ["Balsalazide", "Colazal, Giazo", "Ulcerative colitis 5-ASA prodrug", "Mild-to-moderate ulcerative colitis", "Prodrug activated by colonic bacteria; capsule and pediatric formulations differ."],
    ["Infliximab IV", "Remicade, Inflectra, Avsola", "Medical-benefit TNF biologic", "Crohn disease and ulcerative colitis", "Buy-and-bill infusion under medical benefit, not pharmacy benefit; biosimilar choice is site-of-care driven."],
    ["Adalimumab biosimilars (GI)", "Hyrimoz, Hadlima, Idacio, others", "Pharmacy-benefit TNF biologic", "Crohn disease and ulcerative colitis", "GI-labeled biosimilars differ from dermatology picks; interchangeability status and device must be matched."],
    ["Ustekinumab biosimilars", "Wezlana, Selarsdi, Pyzchiva, others", "IL-12/23 biologic", "Crohn disease and ulcerative colitis", "Brand Stelara versus biosimilars churn by plan; Crohn versus UC labeling must be verified per product."],
    ["Vedolizumab", "Entyvio", "Gut-selective integrin biologic", "UC and Crohn maintenance", "IV infusion versus subcutaneous pen differ; gut-selective mechanism shapes step-therapy position."],
    ["Risankizumab", "Skyrizi", "IL-23 biologic", "Crohn disease and ulcerative colitis", "Subcutaneous versus IV induction presentations differ; indication-specific coverage varies by plan."],
    ["Etrasimod", "Velsipity", "Oral S1P modulator", "Moderate-to-severe ulcerative colitis", "Oral daily capsule with cardiac screening requirements; UC only, no Crohn label."],
    ["Ozanimod", "Zeposia", "Oral S1P modulator", "Moderate-to-severely active ulcerative colitis (no Crohn label)", "Dose titration starter pack matters; first-dose monitoring requirements differ by indication."],
    ["Upadacitinib", "Rinvoq", "Oral JAK inhibitor", "Moderate-to-severe UC and Crohn disease", "Extended-release tablet strengths differ; boxed-warning review and TB screening required."],
    ["Tofacitinib", "Xeljanz, Xeljanz XR", "Oral JAK inhibitor", "Moderate-to-severe ulcerative colitis", "Immediate-release versus XR dosing differ; UC only, no Crohn indication."],
    ["Prednisone", "Deltasone, Rayos", "Systemic corticosteroid bridge", "Short-term control of IBD flares", "Bridge therapy only; immediate-release, delayed-release, and dose packs differ."],
    ["Budesonide MMX tablet and rectal foam", "Uceris tablet, Uceris rectal foam", "Targeted-release corticosteroid", "Mild-to-moderate ulcerative colitis", "MMX tablet reaches the colon; budesonide rectal foam targets distal disease; Cortifoam is hydrocortisone acetate, a different molecule."],
    ["Rifaximin", "Xifaxan", "Gut-selective antibiotic", "Hepatic encephalopathy and diarrhea-predominant IBS", "Indication-driven coverage: HE cycling versus IBS-D; pack size and indication must be matched."],
    ["Lubiprostone", "Amitiza", "Chloride channel activator", "IBS-C and chronic idiopathic constipation", "IBS-C dose differs from chronic constipation dose; nausea limits use."],
    ["Linaclotide", "Linzess", "Guanylate cyclase-C agonist", "IBS-C and chronic idiopathic constipation", "IBS-C dose is 290 mcg once daily; chronic idiopathic constipation is 145 mcg once daily with 72 mcg as an alternative CIC strength."],
    ["Plecanatide", "Trulance", "GC-C agonist alternative", "Chronic idiopathic constipation and IBS-C", "Same class as linaclotide but separate formulary tier placement and PA criteria."],
    ["Ursodiol", "Actigall, Urso", "Hepatology bile acid", "Primary biliary cholangitis and gallstone dissolution", "Weight-based PBC dosing differs from fixed gallstone dosing; tablet and capsule strengths differ."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
