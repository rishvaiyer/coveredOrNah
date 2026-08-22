import type { ClinicCatalog } from "./catalogTypes";

export const benignHematologyCatalog: ClinicCatalog = {
  slug: "benign-hematology",
  name: "Benign Hematology Catalog",
  specialty: "Benign hematology",
  status: "starter",
  medications: [
    ["Ferrous sulfate", "Feosol, Fer-In-Sol", "Iron deficiency", "Oral iron replacement", "Oral tablets, elixir, and drops differ; salt form and strength must be matched."],
    ["Iron sucrose", "Venofer", "IV iron", "Iron replacement when oral iron fails or is not tolerated", "Medical-benefit infusion product; buy-and-bill coding and site-of-service rules apply."],
    ["Ferric carboxymaltose", "Injectafer", "IV iron", "Iron replacement with higher single-dose limits", "Medical-benefit infusion product distinct from iron sucrose; plan preference and step rules differ."],
    ["Folic acid", "Folic Acid", "Anemia support", "Folate-deficiency anemia and supplementation", "OTC and prescription strengths are distinct products."],
    ["Cyanocobalamin oral", "Vitamin B12 tablets", "B12 deficiency", "Oral B12 replacement", "High-dose oral tablets are distinct from injectable products; strength matters."],
    ["Cyanocobalamin injection", "Vitamin B12 injection", "B12 deficiency", "Injectable B12 replacement", "IM and subcutaneous vials; medical-benefit versus pharmacy-benefit coverage differs by plan."],
    ["Epoetin alfa / darbepoetin alfa", "Epogen, Procrit, Aranesp", "Erythropoiesis-stimulating agents", "Anemia of chronic kidney disease and chemotherapy-related anemia", "Medical-benefit contrast collapsed to one row: short-acting epoetin alfa versus long-acting darbepoetin alfa have different schedules, units, and billing codes."],
    ["Eltrombopag", "Promacta", "Spleen tyrosine kinase (SYK) inhibitor", "Chronic immune thrombocytopenia", "Tablet and powder-for-oral-suspension products are distinct; strength must be matched."],
    ["Romiplostim", "Nplate", "Spleen tyrosine kinase (SYK) inhibitor", "Chronic immune thrombocytopenia", "Medical-benefit weekly subcutaneous injection; buy-and-bill specialty pharmacy pathways differ from oral agents."],
    ["Fostamatinib", "Tavalisse", "Spleen tyrosine kinase (SYK) inhibitor", "Chronic immune thrombocytopenia after prior therapy", "Oral tablet taken twice daily; prior-authorization step requirements are common."],
    ["Eculizumab / ravulizumab", "Soliris, Ultomiris", "Complement inhibitors", "Paroxysmal nocturnal hemoglobinuria and complement-mediated TMA", "Medical-benefit contrast in one row: intravenous eculizumab every two weeks versus longer-interval eculizumab or ravulizumab; specialty network rules dominate."],
    ["Deferasirox", "Exjade, Jadenu", "Iron chelation", "Chronic iron overload from transfusions", "Exjade dispersible tablets, Jadenu tablets, and granules are distinct products with different administration."],
    ["Filgrastim", "Neupogen, Zarxio, Grastofil", "Colony-stimulating factors", "Neutropenia and stem-cell mobilization", "Medical-benefit contrast across brand, biosimilar, and long-acting pegfilgrastim products; billing codes differ."],
    ["Avatrombopag", "Doptelet", "Spleen tyrosine kinase (SYK) inhibitor", "Thrombocytopenia in chronic liver disease before procedures", "Oral tablet; note the correct spelling avatrombopag and the distinct procedure-day dosing schedule."],
    ["Luspatercept", "Reblozyl", "Erythroid maturation agents", "Transfusion-dependent anemia in MDS and beta-thalassemia", "Medical-benefit subcutaneous injection given every three weeks; specialty network and site-of-service rules apply."],
    ["Tranexamic acid", "Lysteda, Cyklokapron", "Antifibrinolytics", "Heavy menstrual bleeding and mucosal bleeding", "Oral tablet and injectable products are distinct; coverage pathway differs by setting."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
