import type { ClinicCatalog } from "./catalogTypes";

export const transplantCatalog: ClinicCatalog = {
  slug: "transplant",
  name: "Transplant Medicine Catalog",
  specialty: "Transplant medicine",
  status: "starter",
  medications: [
    ["Tacrolimus immediate-release", "Prograf", "Immunosuppressant", "Solid-organ transplant rejection prophylaxis", "Oral capsules and granules; trough-level monitored, IR and ER products are not interchangeable."],
    ["Tacrolimus extended-release", "Envarsus XR, Astagraf XL", "Immunosuppressant", "Solid-organ transplant rejection prophylaxis", "Extended-release products are distinct from IR tacrolimus and from each other; conversion changes dose and monitoring."],
    ["Cyclosporine modified", "Gengraf, Neoral", "Immunosuppressant", "Solid-organ transplant and autoimmune indications", "Modified (microemulsion) products have different absorption than non-modified Sandimmune and must not be substituted."],
    ["Mycophenolate mofetil", "CellCept, Myhibbin", "Immunosuppressant", "Solid-organ transplant rejection prophylaxis", "Capsules, tablets, and suspension differ; mofetil and mycophenolic acid products are not interchangeable."],
    ["Mycophenolic acid extended-release", "Myfortic", "Immunosuppressant", "Solid-organ transplant rejection prophylaxis", "Delayed-release MPA is distinct from mycophenolate mofetil despite overlapping labeling warnings."],
    ["Azathioprine", "Imuran, Azasan", "Immunosuppressant", "Transplant immunosuppression and autoimmune disease", "Tablet strengths and TPMT-guided dosing matter; interaction with allopurinol requires dose reduction."],
    ["Prednisone", "Deltasone, Rayos", "Immunosuppressant", "Rejection episodes and maintenance immunosuppression", "Immediate-release, delayed-release, and dose packs differ; taper instructions must match dispensed product."],
    ["Belatacept IV", "Nulojix", "Immunosuppressant", "Kidney transplant rejection prophylaxis in EBV-seropositive recipients", "Infusion-center medical-benefit product distinct from oral agents; dosing by month post-transplant."],
    ["Everolimus oral", "Zortress, Afinitor", "Immunosuppressant", "Transplant immunosuppression and oncology uses", "Zortress and Afinitor strengths overlap but indications differ; whole-blood trough monitoring applies."],
    ["Sirolimus", "Rapamune", "Immunosuppressant", "Kidney transplant rejection prophylaxis", "Oral solution and tablets are not milligram-equivalent; trough-level monitored with interacting agents."],
    ["Valganciclovir", "Valcyte", "Anti-infective prophylaxis", "CMV disease prophylaxis after transplantation", "Tablets and oral solution are not dose-equivalent; renal dose adjustment required."],
    ["Sulfamethoxazole / trimethoprim", "Bactrim DS, Septra", "Anti-infective prophylaxis", "Pneumocystis pneumonia prophylaxis after transplant", "DS versus SS strengths and titration schedules differ; interacts with immunosuppressant levels."],
    ["Clotrimazole troche", "Mycelex troche", "Anti-infective prophylaxis", "Oropharyngeal candidiasis prophylaxis after transplant", "Troche dosage form is distinct from cream and solution products of the same ingredient."],
    ["Pantoprazole", "Protonix", "Gastrointestinal protection", "GI prophylaxis on combination immunosuppression", "Delayed-release tablet and suspension products differ; interacts with absorption of co-administered agents."],
    ["Magnesium oxide", "Generic magnesium oxide", "Electrolyte replacement", "Hypomagnesemia from calcineurin inhibitors", "Over-the-counter strengths vary widely; elemental magnesium content differs by salt form."],
    ["Potassium chloride extended-release", "K-Dur, Klor-Con", "Electrolyte replacement", "Hypokalemia on tacrolimus-based regimens", "Extended-release tablets, packets, and crystals differ; hyperkalemia risk requires exact-product matching."]
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
