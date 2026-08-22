import type { ClinicCatalog } from "./catalogTypes";

export const painManagementCatalog: ClinicCatalog = {
  slug: "pain-management",
  name: "Pain Management Starter Catalog",
  specialty: "Pain management",
  status: "starter",
  medications: [
    ["Ibuprofen", "Advil, Motrin", "NSAID (oral)", "Mild to moderate musculoskeletal and inflammatory pain", "Oral tablets, capsules, and suspension; OTC and prescription strengths differ."],
    ["Naproxen", "Naprosyn, Anaprox, Aleve", "NSAID (oral)", "Musculoskeletal and inflammatory pain", "Immediate-release, delayed-release, and controlled-release tablets differ."],
    ["Meloxicam", "Mobic, Vivlodex", "NSAID (oral)", "Osteoarthritis and inflammatory arthritis pain", "Oral tablets and capsules; strength and dosage form must be matched."],
    ["Celecoxib", "Celebrex", "NSAID (COX-2 selective, oral)", "Osteoarthritis, rheumatoid arthritis, and acute pain", "Oral capsules; strength must be matched."],
    ["Diclofenac sodium topical gel 1%", "Voltaren Arthritis Pain gel", "NSAID (topical)", "Osteoarthritic joint pain amenable to topical treatment", "Topical gel dosed by gram; distinct from all oral diclofenac products."],
    ["Diclofenac epolamine topical patch", "Flector", "NSAID (transdermal patch)", "Localized acute pain from minor strains and sprains", "Transdermal patch system; distinct route from oral diclofenac and topical gel."],
    ["Indomethacin extended-release", "Indomethacin ER capsules", "NSAID (oral, extended-release)", "Inflammatory arthritis and selected chronic pain states", "Extended-release capsules are distinct from immediate-release capsules."],
    ["Acetaminophen", "Tylenol, Ofirmev", "Non-opioid analgesic", "Mild to moderate pain and fever", "Tablets, caplets, solution, suppository, and IV formulations differ; watch combination-product duplication."],
    ["Tramadol", "Ultram, Ultram ER, ConZip", "Centrally acting analgesic (controlled substance)", "Moderate to moderately severe pain when non-opioid options are inadequate", "Immediate-release tablets and extended-release products differ; schedule status varies by state."],
    ["Lidocaine 5% patch", "Lidoderm and OTC lidocaine patches", "Local anesthetic (topical patch)", "Localized neuropathic and musculoskeletal pain", "Prescription Lidoderm and OTC patches differ in labeling and coverage; keep OTC versus Rx framing neutral."],
    ["Capsaicin 8% patch", "Qutenza", "Neurolytic topical (in-office)", "Peripheral neuropathic pain such as postherpetic neuralgia", "In-office administered patch; typically a medical-benefit product rather than pharmacy benefit."],
    ["Duloxetine", "Cymbalta, Drizalma Sprinkle", "SNRI (oral)", "Chronic musculoskeletal pain including osteoarthritis and low back pain", "Delayed-release capsules and sprinkle capsules differ; strength must be matched."],
    ["Cyclobenzaprine", "Flexeril (IR), Amrix (ER)", "Skeletal muscle relaxant", "Acute musculoskeletal muscle spasm", "Immediate-release tablets differ from extended-release Amrix capsules in dosing and coverage."],
    ["Baclofen", "Baclofen, Kemstro", "Skeletal muscle relaxant (antispasticity)", "Spasticity from neurologic conditions", "Oral tablets and suspension differ; gradual taper matters on discontinuation."],
    ["Tizanidine", "Zanaflex", "Skeletal muscle relaxant (alpha-2 agonist)", "Spasticity and selected muscle spasm", "Tablets and capsules are not interchangeable; timing with food changes absorption."],
    ["Methocarbamol", "Robaxin", "Skeletal muscle relaxant", "Acute musculoskeletal muscle spasm", "Oral tablets and injectable formulation differ; strength must be matched."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
