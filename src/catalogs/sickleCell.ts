import type { ClinicCatalog } from "./catalogTypes";

export const sickleCellCatalog: ClinicCatalog = {
  slug: "sickle-cell",
  name: "Sickle Cell Disease Catalog",
  specialty: "Sickle cell disease",
  status: "starter",
  medications: [
    ["Hydroxyurea", "Droxia, Hydrea", "Disease-modifying anchor", "Reducing vaso-occlusive crises and acute chest syndrome", "Capsule and tablet strengths differ; Droxia and Hydrea products are distinct."],
    ["Crizanlizumab", "Adakveo", "Vaso-occlusive crisis reduction, medical-benefit contrast", "Recurrent vaso-occlusive crises", "Infusion billed under the medical benefit; site-of-care and buy-and-bill logistics differ from pharmacy coverage."],
    ["Voxelotor", "Oxbryta", "Hemoglobin S polymerization inhibitor, market-withdrawal caution", "Historic sickle cell disease therapy", "Voluntarily withdrawn worldwide by Pfizer in September 2024 after FDA safety data showed increased vaso-occlusive crises and deaths; verify no residual formulary or refill exposure."],
    ["L-glutamine", "Endari", "Disease-modifying adjunct", "Reducing acute complications of sickle cell disease", "Oral powder packets; brand Endari availability should be confirmed at renewal time."],
    ["Deferasirox", "Exjade, Jadenu", "Iron chelation", "Transfusion-related iron overload (hemosiderosis)", "Exjade dispersible tablets, Jadenu tablets, and granules are distinct products; exact form matters for mixing and dosing."],
    ["Deferoxamine", "Desferal", "Iron chelation, medical-benefit contrast", "Chronic transfusion hemosiderosis", "Subcutaneous or IV infusion billed under the medical benefit; home-infusion supply chain differs from oral chelators."],
    ["Folic acid", "Folvite", "Supportive supplementation", "Routine supplementation in chronic hemolysis", "Tablet strengths and combination products differ."],
    ["Penicillin V potassium", "Pen-Vee K", "Pediatric infection prophylaxis", "Pneumococcal sepsis prophylaxis in young children", "Oral solution and tablet strengths differ; age cutoffs drive duration of prophylaxis."],
    ["Cefuroxime axetil", "Ceftin", "Infection treatment", "Acute chest syndrome and serious bacterial infections", "Oral tablets and suspension differ; take-with-food labeling differs by strength."],
    ["Levofloxacin", "Levaquin", "Infection treatment", "Bacterial infections including acute chest syndrome", "Oral tablets and solution differ; fluoroquinolone warnings apply."],
    ["Morphine sulfate", "Generic morphine sulfate vials and concentrate", "Vaso-occlusive crisis, hospital medical-benefit contrast", "Inpatient severe pain management during vaso-occlusive crisis", "Inpatient standard-of-care analgesia administered under facility protocols; billed through the medical benefit, so outpatient formulary checks do not apply."],
    ["Ketorolac", "Toradol", "Vaso-occlusive crisis adjunct", "Short-course pain support around crisis episodes", "Tablets and injection differ; strict short-duration limits apply."],
    ["Ondansetron", "Zofran", "Supportive care", "Nausea and vomiting during crisis or hydration visits", "Oral soluble film, tablets, and solution differ."],
    ["Senna / docusate sodium", "Senokot-S, Senna-DSS", "Opioid-induced constipation program", "Constipation management alongside crisis pain regimens", "Fixed-combination and separate-component products differ; exact product must be matched."],
    ["Ceftriaxone", "Rocephin", "Infection treatment, medical-benefit contrast", "Serious bacterial infections requiring parenteral therapy", "Injection billed under the medical benefit; office-based administration differs from oral antibiotic coverage."],
    ["Celecoxib", "Celebrex", "Vaso-occlusive crisis, outpatient", "Outpatient pain management around crisis episodes", "Capsule strengths differ; boxed cardiovascular and GI warnings apply."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
