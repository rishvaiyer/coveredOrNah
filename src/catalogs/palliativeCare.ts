import type { ClinicCatalog } from "./catalogTypes";

export const palliativeCareCatalog: ClinicCatalog = {
  slug: "palliative-care",
  name: "Palliative and Supportive Care Catalog",
  specialty: "Palliative and supportive care",
  status: "starter",
  medications: [
    ["Ondansetron", "Zofran, Zuplenz", "Nausea and vomiting", "Chemotherapy-related and general symptom-management nausea", "Oral tablets, orally disintegrating tablets, soluble film, and IV products are distinct SKUs."],
    ["Scopolamine transdermal", "Transderm Scop", "Secretions", "Management of respiratory tract secretions in supportive care", "Transdermal patch only; oral forms are distinct products."],
    ["Haloperidol low-dose", "Haldol", "Delirium", "Low-dose delirium symptom management in supportive care", "Oral tablets and solution differ from decanoate long-acting injection; strength must be matched."],
    ["Olanzapine", "Zyprexa", "Nausea and appetite support", "Symptom-management nausea and appetite support in palliative settings", "Regular tablets, orally disintegrating tablets, and intramuscular products are distinct."],
    ["Dexamethasone", "Decadron", "Supportive care steroid", "Appetite, energy, and symptom-supportive use under clinician direction", "Tablets, oral solution, and injectable products are distinct; strength matters."],
    ["Methylphenidate", "Ritalin", "Fatigue", "Cancer- and illness-related fatigue symptom management", "Immediate-release and extended-release products are clinically distinct."],
    ["Mirtazapine", "Remeron", "Appetite and sleep support", "Appetite support with sedation benefit at lower strengths", "Regular and orally disintegrating tablets are distinct SKUs."],
    ["Dronabinol", "Marinol", "Appetite stimulation", "Appetite loss and associated nausea in advanced illness", "Capsule strengths must be matched exactly; scheduling varies by state."],
    ["Megestrol acetate", "Megace", "Appetite stimulation", "Appetite and weight support in advanced illness", "Suspension concentration and tablet products are distinct; strength matters."],
    ["Lactulose", "Enulose, Generlac", "Constipation", "Chronic constipation management including opioid-adjacent constipation", "Oral solution concentrations differ from single-dose packets."],
    ["Methylnaltrexone", "Relistor", "Opioid-induced constipation", "Constipation when bowel function is affected during comfort-focused care", "Subcutaneous kit strengths differ for body-weight dosing."],
    ["Naloxegol", "Movantik", "Opioid-induced constipation", "Peripheral-acting constipation management when opioids are part of care", "Tablet strengths differ; interaction screening applies."],
    ["Senna-S", "Senokot-S", "Constipation", "Stool softening combination for routine constipation management", "Combination tablet strengths vary by supplier."],
    ["Polyethylene glycol 3350", "Miralax", "Constipation", "Osmotic laxative for chronic constipation management", "Powder dose caps and unit-dose bottles are distinct SKUs."],
    ["Hydroxyzine", "Atarax, Vistaril", "Anxiety support", "Adjunctive anxiety and agitation support in comfort-focused care", "Tablets and capsules differ; syrup concentration matters."],
    ["Gabapentin", "Neurontin", "Neuropathic discomfort", "Nerve-related pain symptom management", "Capsules, tablets, and oral solution differ; renal-adjusted strengths matter."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
