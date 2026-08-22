import type { ClinicCatalog } from "./catalogTypes";

export const postAcuteLtcCatalog: ClinicCatalog = {
  slug: "post-acute-ltc",
  name: "Post-Acute and Long-Term Care Catalog",
  specialty: "Post-acute and long-term care",
  status: "starter",
  medications: [
    ["Donepezil", "Aricept", "Cognitive support", "Dementia-related cognitive symptoms", "Immediate-release tablet once daily versus disintegrating tablet and patch forms; regimen simplification reviews often check form consistency without changing care decisions."],
    ["Memantine ER", "Namenda XR", "Cognitive support", "Moderate dementia-related symptoms", "Extended-release capsule once daily is distinct from immediate-release twice-daily tablets; consolidation between forms is a common simplification checkpoint."],
    ["Quetiapine", "Seroquel", "Behavioral symptom management", "Behavioral symptom regimens reviewed under deprescribing-awareness policies", "Immediate-release versus extended-release products differ; nursing-pass timing and taper-aware documentation are frequent review points."],
    ["Risperidone", "Risperdal", "Behavioral symptom management", "Behavioral symptom regimens reviewed under deprescribing-awareness policies", "Tablet, orally disintegrating tablet, and solution are distinct; dose strength and solution concentration must be matched."],
    ["Haloperidol", "Haldol", "Behavioral symptom management", "Behavioral symptom regimens reviewed under deprescribing-awareness policies", "Oral tablet versus decanoate injection are entirely different coverage pathways; administration route must be matched."],
    ["Trazodone", "Desyrel", "Sleep-support regimens", "Sleep-support regimens reviewed under deprescribing-awareness policies", "Tablet strengths vary widely; nursing-pass timing relative to meals is a documented distinction."],
    ["Polyethylene glycol 3350", "Miralax", "Bowel regimen", "Constipation bowel-regimen protocols", "Powder dosed by capful rather than tablet count; standing-order wording often names the capful explicitly."],
    ["Senna-docusate combination", "Senna-S, Senokot-S", "Bowel regimen", "Constipation bowel-regimen protocols", "Combination versus single-agent senna products differ; tablet counts on MARs must match the ordered product."],
    ["Lactulose", "Enulose, Kristalose", "Bowel regimen", "Constipation and hepatic encephalopathy bowel regimens", "Solution and packet forms differ; titration-to-effect orders are a common documentation point."],
    ["Bisacodyl suppository", "Dulcolax suppository", "Bowel regimen", "Rescue bowel-regimen protocols", "Suppository route is distinct from oral tablets; PRN rescue orders name the route explicitly."],
    ["Oxybutynin", "Ditropan, Ditropan XL", "Urinary symptom management", "Overactive-bladder symptom regimens", "Immediate-release multiple-daily-dose versus extended-release once-daily forms differ; anticholinergic-burden reviews flag this row."],
    ["Tamsulosin", "Flomax", "Urinary symptom management", "Male lower-urinary-tract symptom regimens", "Capsule strength and timing relative to the same daily dose are matched on nursing passes."],
    ["Warfarin", "Coumadin, Jantoven", "Anticoagulation", "Anticoagulation with INR-based monitoring workflows", "Simplified-monitoring framing row: tablet strengths are color-coded and INR-testing logistics drive coordination load, not clinical advice."],
    ["Insulin glargine", "Lantus, Basaglar, Toujeo", "Diabetes", "Once-daily basal insulin workflows", "U-100 versus U-300 Toujeo concentrations and pen versus vial devices are distinct; once-daily scheduling simplifies nursing passes."],
    ["Furosemide", "Lasix", "Diuretics", "Edema and fluid-management workflows", "Timing rows matter: morning dosing avoids overnight nursing-pass disruption and tablet strength must be matched."],
    ["Levothyroxine", "Synthroid, Levoxyl", "Endocrine", "Hypothyroidism workflows", "Morning fasting-rule rows distinguish empty-stomach administration timing from breakfast-medication passes; strength and manufacturer matching applies."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
