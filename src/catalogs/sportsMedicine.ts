import type { ClinicCatalog } from "./catalogTypes";

export const sportsMedicineCatalog: ClinicCatalog = {
  slug: "sports-medicine",
  name: "Sports Medicine Starter Catalog",
  specialty: "Sports medicine",
  status: "starter",
  medications: [
    ["Diclofenac sodium topical gel 1%", "Voltaren Arthritis Pain", "Topical NSAIDs", "Osteoarthritis of joints amenable to topical therapy", "Gel vehicle applied to skin; distinct route from oral diclofenac."],
    ["Diclofenac epolamine patch", "Flector", "Topical NSAIDs", "Acute pain from minor strains and sprains", "Transdermal patch vehicle differs from gel and oral products."],
    ["Naproxen", "Naprosyn, Anaprox, Aleve", "Oral NSAIDs", "Tendinitis, bursitis, and musculoskeletal pain", "Immediate-release, enteric-coated, delayed-release, and extended-release tablets differ."],
    ["Celecoxib", "Celebrex", "Oral NSAIDs", "Osteoarthritis and inflammatory joint pain", "Oral capsules only; strengths must be matched."],
    ["Meloxicam", "Mobic, Vivlodex", "Oral NSAIDs", "Osteoarthritis and inflammatory conditions", "Once-daily tablets and suspension products differ."],
    ["Ketorolac", "Toradol", "Oral NSAIDs", "Short-term management of moderately severe acute pain", "Short-course oral use only, typically five days or less; not for chronic use."],
    ["Acetaminophen", "Tylenol", "Analgesics", "Musculoskeletal pain and post-exertional pain", "Tablet, caplet, extended-release, and suspension forms differ."],
    ["Topical menthol / methyl salicylate combination", "Generic OTC counterirritant products", "Topical Analgesics", "Minor muscle and joint aches", "Cream, lotion, gel, and patch vehicles differ; OTC labeling varies by product."],
    ["Lidocaine 4% to 5% patch", "Lidoderm, generic and OTC variants", "Topical Analgesics", "Localized neuropathic or focal musculoskeletal pain", "Prescription 5% and OTC 4% patches are distinct products."],
    ["Triamcinolone acetonide injection", "Kenalog-10, Kenalog-40", "Injectable Corticosteroids", "Intra-articular and soft-tissue inflammation", "Administered in office as a joint injection; often covered under medical benefit rather than pharmacy benefit."],
    ["Prednisone burst and taper packs", "Deltasone, Rayos", "Systemic Corticosteroids", "Acute inflammatory flares", "Burst-and-taper dose packs and delayed-release products differ."],
    ["Colchicine", "Colcrys, Mitigare", "Gout Flare Agents", "Acute gout flares", "Brand and generic tablet strengths must be matched."],
    ["Allopurinol", "Zyloprim", "Urate-Lowering Agents", "Chronic gout maintenance therapy", "Not a flare treatment; tablet strengths must be matched."],
    ["Febuxostat", "Uloric", "Urate-Lowering Agents", "Chronic gout maintenance therapy", "Carries a boxed cardiovascular mortality warning in the label."],
    ["Baclofen", "Gablofen, Lioresal", "Muscle Relaxants", "Muscle spasticity", "Oral tablet strengths differ; titration matters clinically."],
    ["Cyclobenzaprine extended-release", "Amrix", "Muscle Relaxants", "Acute musculoskeletal spasm", "Extended-release capsules differ from immediate-release tablets in dosing frequency."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
