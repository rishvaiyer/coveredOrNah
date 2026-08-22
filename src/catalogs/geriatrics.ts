import type { ClinicCatalog } from "./catalogTypes";

export const geriatricsCatalog: ClinicCatalog = {
  slug: "geriatrics",
  name: "Geriatrics Starter Catalog",
  specialty: "Geriatrics",
  status: "starter",
  medications: [
    ["Donepezil", "Aricept", "Cognitive support", "Alzheimer's disease cognitive symptoms", "Tablets and orally disintegrating tablets; 5 mg, 10 mg, and 23 mg strengths are distinct."],
    ["Memantine ER", "Namenda XR", "Cognitive support", "Moderate-to-severe Alzheimer's disease", "Once-daily extended-release capsules differ from immediate-release tablets; fixed-dose combination products differ."],
    ["Rivastigmine patch", "Exelon Patch", "Cognitive support", "Alzheimer's and Parkinson's disease dementia", "Daily-wear transdermal patches in distinct strengths; oral capsule products differ."],
    ["Quetiapine", "Seroquel", "Behavioral symptoms of dementia", "Plan-dependent coverage of low-dose regimens in dementia care settings", "Immediate-release and extended-release forms and strength ranges differ; coverage intent varies by dose level."],
    ["Mirtazapine", "Remeron", "Behavioral health", "Depression with appetite or sleep involvement", "Orally disintegrating tablets and standard tablets differ; common starting strength is 15 mg."],
    ["Polyethylene glycol 3350", "MiraLAX", "Constipation management", "Chronic constipation", "Powder packets versus bulk bottles differ; over-the-counter status affects coverage paths."],
    ["Senna", "Senokot", "Constipation management", "Habitual and opioid-adjacent constipation", "Standard and maximum tablet strengths differ; combination products with stool softeners differ."],
    ["Lactulose", "Enulose, Generlac", "Constipation management", "Chronic constipation", "Solution concentration and dosing frequency vary; large-volume use affects refill cadence."],
    ["Rifaximin", "Xifaxan", "Hepatic encephalopathy row", "Risk reduction of recurrent hepatic encephalopathy", "550 mg tablet; recurring-fill specialty coverage makes prior-authorization tracking relevant."],
    ["Alendronate", "Fosamax", "Bone health", "Osteoporosis treatment and prevention", "Weekly 70 mg and daily 10 mg regimens are distinct; 35 mg weekly strength differs."],
    ["Vitamin D2 / D3", "Drisdol; cholecalciferol products", "Bone health", "Vitamin D insufficiency support", "Prescription ergocalciferol (D2) and over-the-counter cholecalciferol (D3) rows are distinct."],
    ["Calcitonin salmon nasal", "Fortical, Miacalcin", "Bone health", "Osteoporosis in patients where alternatives are unsuitable", "Nasal spray device requires priming steps; device-specific coverage rules apply."],
    ["Teriparatide", "Forteo", "Bone health", "High-fracture-risk osteoporosis", "Daily pen-injector devices; medical-benefit versus pharmacy-benefit routing varies by plan."],
    ["Insulin glargine", "Lantus, Basaglar, Semglee, Toujeo", "Diabetes", "Simplified basal insulin regimens", "U-100 and concentrated U-300 strengths and interchangeable biosimilar designations differ."],
    ["Warfarin", "Coumadin, Jantoven", "Anticoagulation", "Stroke prevention in atrial fibrillation and venous thromboembolism", "Many tablet strengths exist; INR-monitoring program frequency shapes plan support services."],
    ["Apixaban", "Eliquis", "Anticoagulation", "Stroke prevention and venous thromboembolism", "5 mg and 2.5 mg strengths correspond to published dose-reduction criteria; exact strength must be matched."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
