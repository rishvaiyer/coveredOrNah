import type { ClinicCatalog } from "./catalogTypes";

export const pmrCatalog: ClinicCatalog = {
  slug: "pmr-rehab",
  name: "Physical Medicine and Rehabilitation Catalog",
  specialty: "Physical medicine and rehabilitation",
  status: "starter",
  medications: [
    ["Baclofen", "Lioresal", "Spasticity", "Spasticity from spinal cord injury, multiple sclerosis, or brain injury", "Oral tablets; intrathecal pump product is a distinct pathway."],
    ["Tizanidine", "Zanaflex", "Spasticity", "Spasticity and muscle tone management", "Tablet and capsule products differ in exposure."],
    ["Dantrolene", "Dantrium", "Spasticity", "Severe spasticity refractory to first-line agents", "Oral capsules; niche but clinically real in PM&R."],
    ["Botulinum toxin injections", "AbobotulinumtoxinA (Dysport), incobotulinumtoxinA (Xeomin), onabotulinumtoxinA (Botox)", "Spasticity, medical benefit", "Focal spasticity management", "Toxin products are not interchangeable; units differ by product and are billed under the medical benefit, not pharmacy."],
    ["Gabapentin", "Neurontin", "Neuropathic pain", "Post-stroke and spinal-cord-related neuropathic pain", "Capsule, tablet, and extended-release products differ."],
    ["Pregabalin", "Lyrica", "Neuropathic pain", "Neuropathic pain and radiculopathy syndromes", "Oral solution and tablet strengths must be matched."],
    ["Duloxetine", "Cymbalta", "Neuropathic pain", "Chronic musculoskeletal and neuropathic pain", "Delayed-release capsule strengths differ."],
    ["Amitriptyline", "Elavil", "Neuropathic pain", "Neuropathic pain and sleep-disrupting pain syndromes", "Oral tablets; low-dose and titration framing matters."],
    ["Modafinil", "Provigil", "Program support: post-TBI fatigue", "Traumatic brain injury fatigue (off-label cross-ref)", "Tablet strength must be matched; plan coverage varies widely."],
    ["Methylphenidate ER", "Concerta, Ritalin LA", "Program support: attention and fatigue", "Post-TBI attention and fatigue (off-label cross-ref)", "Extended-release devices and delivery profiles are distinct."],
    ["Amantadine", "Gocovri", "Program support: TBI fatigue", "Traumatic brain injury fatigue and alertness (cross-ref)", "Immediate-release tablets and extended-release capsules differ."],
    ["Diclofenac gel", "Voltaren gel", "Musculoskeletal pain", "Localized osteoarthritis and soft-tissue pain", "Gel concentration and dosing card packaging differ."],
    ["Lidocaine patch", "Lidoderm", "Topical analgesia", "Localized neuropathic pain syndromes", "Patch size, count, and OTC vs Rx distinction matter."],
    ["Memantine", "Namenda", "Program support: TBI cognition", "TBI cognitive support (framing-neutral cross-ref)", "Immediate-release tablets and extended-release capsules differ."],
    ["Oxybutynin", "Ditropan", "Neurogenic bladder cross-ref", "Neurogenic bladder in spinal cord injury and MS", "Immediate-release and extended-release products differ."],
    ["Bisacodyl", "Dulcolax", "Bowel program", "Neurogenic bowel program support", "Tablet and suppository forms serve distinct program steps."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
