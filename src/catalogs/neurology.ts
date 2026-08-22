import type { ClinicCatalog } from "./catalogTypes";

export const neurologyCatalog: ClinicCatalog = {
  slug: "neurology",
  name: "Neurology Starter Catalog",
  specialty: "Neurology",
  status: "starter",
  medications: [
    ["Sumatriptan", "Imitrex", "Migraine acute", "Acute migraine attacks", "Oral tablets and subcutaneous injection are distinct products; device and strength must be matched."],
    ["Rizatriptan", "Maxalt, Maxalt-MLT", "Migraine acute", "Acute migraine attacks", "Standard tablets and orally disintegrating tablets differ."],
    ["Eletriptan", "Relpax", "Migraine acute", "Acute migraine attacks", "Oral tablet strengths must be matched."],
    ["Ubrogepant", "Ubrelvy", "Migraine acute", "Acute migraine attacks with or without aura", "Oral tablet strengths differ; gepant class often plan-managed."],
    ["Rimegepant", "Nurtec ODT", "Migraine acute and prevention", "Acute treatment and alternate-day preventive use", "Orally disintegrating formulation is required for both labeled uses."],
    ["Eptinezumab", "Vyepti", "Migraine prevention", "Preventive treatment of episodic and chronic migraine", "Intravenous infusion product; site-of-care and benefit routing matter."],
    ["Erenumab", "Aimovig", "Migraine prevention", "Preventive treatment of migraine", "Autoinjector monthly dosing; CGRP biologic prior authorization common."],
    ["Fremanezumab", "Ajovy", "Migraine prevention", "Preventive treatment of episodic and chronic migraine", "Monthly or quarterly autoinjector and prefilled syringe options."],
    ["Galcanezumab", "Emgality", "Migraine prevention", "Preventive treatment of migraine and cluster headache", "Loading dose then monthly injections; device and kit contents must be matched."],
    ["Topiramate", "Topamax, Trokendi XR, Qudexy XR", "Migraine prevention and epilepsy", "Migraine prevention and seizure disorders", "Immediate-release and extended-release capsules differ."],
    ["Divalproex ER", "Depakote ER", "Migraine prevention and epilepsy", "Migraine prevention and seizure disorders", "Extended-release and delayed-release products are not interchangeable."],
    ["Lamotrigine", "Lamictal, Lamictal XR", "Epilepsy", "Focal and generalized seizures", "Immediate-release, extended-release, and chewable products differ; slow titration schedule matters."],
    ["Levetiracetam", "Keppra, Elepsia XR, Spritam", "Epilepsy", "Focal and generalized seizures", "Immediate-release, extended-release, IV, and solution products differ."],
    ["Pregabalin", "Lyrica, Lyrica CR", "Epilepsy and neuropathic pain", "Partial-onset seizures and neuropathic pain", "Immediate-release capsules and extended-release tablets differ; controlled-substance rules apply."],
    ["Gabapentin", "Neurontin, Gralise, Horizant", "Epilepsy and neuropathic pain", "Partial-onset seizures and postherpetic neuralgia", "Immediate-release, gastroretentive, and prodrug products are not interchangeable."],
    ["Levodopa / carbidopa", "Sinemet, Rytary", "Parkinson disease", "Parkinson disease motor symptoms", "Immediate-release Sinemet tablets and extended-release Rytary capsules are distinct products with different conversion ratios."],
    ["Rasagiline", "Azilect", "Parkinson disease", "Parkinson disease motor symptoms", "Oral tablet strengths differ; MAO-B inhibitor interactions matter."],
    ["Pramipexole", "Mirapex, Mirapex ER", "Parkinson disease", "Parkinson disease motor symptoms", "Immediate-release and extended-release tablets differ."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
