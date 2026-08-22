import type { ClinicCatalog } from "./catalogTypes";

export const boneHealthCatalog: ClinicCatalog = {
  slug: "osteoporosis-bone-health",
  name: "Osteoporosis and Bone Health Catalog",
  specialty: "Osteoporosis and bone health",
  status: "starter",
  medications: [
    ["Alendronate", "Fosamax", "Oral bisphosphonate", "Postmenopausal osteoporosis prevention and treatment", "Weekly 70 mg tablet and oral solution differ; dosing-day instructions matter."],
    ["Risedronate weekly", "Actonel, Atelvia", "Oral bisphosphonate", "Postmenopausal osteoporosis prevention and treatment", "Weekly 35 mg immediate-release and delayed-release products are distinct."],
    ["Risedronate monthly", "Actonel", "Oral bisphosphonate", "Postmenopausal osteoporosis treatment", "Monthly 150 mg tablet is a distinct product from the weekly strength; exact strength matters."],
    ["Ibandronate", "Boniva", "Oral bisphosphonate", "Postmenopausal osteoporosis treatment", "Monthly 150 mg tablet differs from quarterly IV; oral and IV products are distinct."],
    ["Zoledronic acid", "Reclast", "IV bisphosphonate", "Postmenopausal osteoporosis treatment", "Annual IV infusion often billed under the medical benefit rather than pharmacy benefit."],
    ["Denosumab", "Prolia", "RANKL inhibitor", "Osteoporosis in high-fracture-risk patients", "Subcutaneous 60 mg every six months for bone disease; oncology Xgeva product is excluded."],
    ["Teriparatide", "Forteo", "Anabolic agent (PTH analog)", "High-fracture-risk osteoporosis", "Daily subcutaneous injection pen; device and pen strength must be matched."],
    ["Abaloparatide", "Tymlos", "Anabolic agent (PTHrP analog)", "High-fracture-risk postmenopausal osteoporosis", "Daily subcutaneous injection pen; device and pen strength must be matched."],
    ["Romosozumab", "Evenity", "Sclerostin inhibitor", "High-fracture-risk osteoporosis", "Twice-monthly subcutaneous injections for 12 months, typically billed under the medical benefit rather than pharmacy benefit; anabolic-to-antiresorptive sequencing affects duration."],
    ["Raloxifene", "Evista", "Estrogen agonist-antagonist", "Postmenopausal osteoporosis prevention and treatment", "Oral 60 mg tablet; strengths must be matched."],
    ["Calcium carbonate or citrate", "Caltrate, Citracal", "Mineral supplement", "Dietary calcium support in osteoporosis care", "Carbonate and citrate salts differ in absorption context; exact salt and strength matter."],
    ["Vitamin D2 or D3", "Drisdol, generic cholecalciferol", "Vitamin supplement", "Vitamin D insufficiency in bone health", "Prescription ergocalciferol (D2) and over-the-counter cholecalciferol (D3) are distinct products."],
    ["Calcitonin salmon nasal", "Miacalcin, Fortical", "Calcitonin", "Osteoporosis when alternatives unsuitable", "Nasal spray device and strength must be matched."],
    ["Conjugated estrogens/bazedoxifene", "Duavee", "Estrogen agonist-antagonist combination", "Postmenopausal osteoporosis risk with vasomotor symptoms", "Fixed-dose oral tablet; exact product must be matched."],
    ["Pamidronate", "Aredia", "IV bisphosphonate", "Selected metabolic bone disease settings", "IV infusion typically billed under the medical benefit rather than pharmacy benefit."],
    ["Ergocalciferol 50,000 IU", "Drisdol", "Prescription vitamin D", "Documented vitamin D deficiency in bone health workup", "Weekly 50,000 IU capsule is prescription-only and distinct from OTC strengths."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
