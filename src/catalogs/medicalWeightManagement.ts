import type { ClinicCatalog } from "./catalogTypes";

export const medicalWeightManagementCatalog: ClinicCatalog = {
  slug: "weight-management",
  name: "Medical Weight Management Catalog",
  specialty: "Medical weight management",
  status: "starter",
  medications: [
    ["Semaglutide (Wegovy)", "Wegovy", "Weight management GLP-1", "Chronic weight management", "Wegovy is a distinct product from Ozempic and Rybelsus; pen dose escalation steps and indication must be matched."],
    ["Semaglutide (Ozempic, Rybelsus)", "Ozempic, Rybelsus", "Diabetes GLP-1", "Type 2 diabetes", "Distinct-product row: diabetes-labeled Ozempic injectable and oral Rybelsus tablets are separate products from Wegovy; plans treat them differently."],
    ["Tirzepatide (Zepbound)", "Zepbound", "Weight management GIP/GLP-1", "Chronic weight management", "Zepbound is a distinct product from Mounjaro despite the same molecule; pen strengths and prior-authorization rules differ."],
    ["Liraglutide (Saxenda)", "Saxenda", "Weight management GLP-1", "Chronic weight management", "Saxenda is a distinct daily-injection product from Victoza; titration pens and indications differ."],
    ["Phentermine", "Adipex-P, Lomaira", "Stimulant appetite suppressant", "Short-term weight management", "Short-term framing row: tablet strengths differ and schedule-controlled status affects coverage and refills."],
    ["Phendimetrazine", "Bontril PDM", "Stimulant appetite suppressant", "Short-term weight management", "Schedule-controlled tablet distinct from phentermine; strength and controlled-substance handling differ."],
    ["Phentermine-topiramate ER", "Qsymia", "Combination appetite suppressant", "Chronic weight management", "Titration-dose packs are distinct products; No REMS program; titration-dose packs must be matched.."],
    ["Naltrexone-bupropion ER", "Contrave", "Combination weight management", "Chronic weight management", "Fixed-dose combination tablet distinct from either component alone; titration schedules are product-specific."],
    ["Orlistat", "Alli, Xenical", "Lipase inhibitor", "Weight management support", "Single row with OTC-versus-Rx distinction: OTC Alli 60 mg versus prescription Xenical 120 mg are different products at different strengths."],
    ["Setmelanotide", "Imcivree", "Melanocortin-4 receptor agonist", "Genetic obesity syndromes", "Rare-disease genetic-obesity row: specialty-distribution daily injection with confirmed genetic diagnosis requirements."],
    ["Metformin IR", "Glucophage", "Metabolic support", "PCOS and prediabetes support framing", "Neutral-framing row: immediate-release twice-daily versus once-daily ER products differ; GI-tolerability notes affect form choice documentation."],
    ["Metformin ER", "Glucophage XR, Fortamet", "Metabolic support", "PCOS and prediabetes support framing", "Separate extended-release row: ER tablets and extended-release capsules from different manufacturers are not interchangeable in dispensing systems."],
    ["Topiramate", "Topamax, Trokendi XR", "Off-label neutral framing", "Documented off-label use patterns", "Neutral off-label row: immediate-release versus extended-release capsules differ; cognitive-side-effect documentation is common."],
    ["Zonisamide", "Zonegran", "Off-label neutral framing", "Documented off-label use patterns", "Neutral off-label row: capsule strengths differ; sulfa-allergy flags appear in plan edits."],
    ["Bupropion SR", "Wellbutrin SR, Bupropion SR", "Off-label neutral framing", "Documented off-label use patterns", "Solo-agent row distinct from Contrave: formulation, strength, and indication labeling all differ from the combination product."],
    ["Vitamin B12 injection", "Cyanocobalamin injection", "Supportive care", "B12 monitoring during weight-management regimens", "Support-row: IM versus subcutaneous vials and medical-benefit versus pharmacy-benefit pathways differ by plan."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
