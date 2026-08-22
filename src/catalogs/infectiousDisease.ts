import type { ClinicCatalog } from "./catalogTypes";

export const infectiousDiseaseCatalog: ClinicCatalog = {
  slug: "infectious-disease",
  name: "Infectious Disease Starter Catalog",
  specialty: "Infectious disease",
  status: "starter",
  medications: [
    ["Amoxicillin / clavulanate", "Augmentin", "Beta-lactam combinations", "Sinusitis, otitis, skin, and bite infections", "Ratio (4:1 vs 7:1), strength, and dosage form must be matched; tablet and suspension products differ."],
    ["Cefdinir", "Omnicef", "Cephalosporins", "Respiratory, skin, and ear infections", "Oral capsules and suspension; strength must be matched."],
    ["Cefpodoxime", "Vantin", "Cephalosporins", "Respiratory, skin, and urinary infections", "Oral tablets and suspension; proxetyl prodrug products differ from other cefpodoxime salts."],
    ["Ciprofloxacin", "Cipro", "Fluoroquinolones", "Urinary and selected gram-negative infections", "Immediate-release, XR, and suspension products differ; strengths must be matched."],
    ["Levofloxacin", "Levaquin", "Fluoroquinolones", "Pneumonia, sinusitis, and urinary infections", "Oral tablets, solution, and IV; strengths must be matched."],
    ["Moxifloxacin", "Avelox", "Fluoroquinolones", "Pneumonia and complicated infections", "Oral tablets and IV; ophthalmic moxifloxacin products are distinct entries."],
    ["Doxycycline", "Vibramycin, Doryx, Oracea (40 mg MR is labeled for rosacea inflammatory lesions, not infection)", "Tetracyclines", "Skin, respiratory, and tick-borne infections", "Hyclate and monohydrate salts and delayed-release products differ."],
    ["Minocycline", "Minocin, Solodyn (ER is labeled for acne vulgaris, not infection)", "Tetracyclines", "Skin and resistant gram-positive infections", "IR capsules, ER tablets, and pellet-filled capsules differ; strengths must be matched."],
    ["Azithromycin", "Zithromax", "Macrolides", "Respiratory and selected bacterial infections", "Tablet dose packs, suspension, and microsphere packet products differ."],
    ["Clarithromycin", "Biaxin", "Macrolides", "Respiratory and H. pylori regimens", "IR tablets, XL tablets, and suspension differ."],
    ["Linezolid", "Zyvox", "Oxazolidinones", "MRSA skin infections and resistant gram-positive pneumonia", "Oral tablets, suspension, and IV exist; formulation determines the benefit path."],
    ["Daptomycin", "Cubicin", "Medical-benefit injectables", "MRSA bacteremia and right-sided endocarditis", "IV-only buy-and-bill contrast row; not dispensed through the outpatient pharmacy benefit."],
    ["Vancomycin (oral)", "Firvanq, Vancocin", "C. difficile therapy", "Clostridioides difficile infection", "PO capsules or solution treat C. diff colitis; IV vancomycin does not reach the colon and follows a different benefit path."],
    ["Metronidazole", "Flagyl", "Nitroimidazoles", "Anaerobic and protozoal infections; C. diff alternative", "IR tablets, ER tablets, and capsules differ; topical products are distinct entries."],
    ["Nitrofurantoin", "Macrobid, Macrodantin", "Urinary anti-infectives", "Uncomplicated urinary tract infection", "Macrocrystals (Macrodantin) and monohydrate/macrocrystals (Macrobid) are distinct products with different dosing frequency."],
    ["Fluconazole", "Diflucan", "Azole antifungals", "Candidiasis", "Oral tablets, suspension, and IV; single-dose and multi-day strengths must be matched."],
    ["Terbinafine", "Lamisil", "Antifungals", "Onychomycosis and dermatophyte infections", "Oral tablets are prescription; OTC creams are a separate product line."],
    ["Oseltamivir", "Tamiflu", "Antivirals", "Influenza treatment and post-exposure prophylaxis", "30 mg, 45 mg, and 75 mg capsules and oral suspension must be matched by strength."],
    ["Valacyclovir", "Valtrex", "Antivirals", "Herpes simplex and herpes zoster", "Oral tablet strengths differ; acyclovir products are not interchangeable at the NDC level."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
