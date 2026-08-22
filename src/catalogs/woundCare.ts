import type { ClinicCatalog } from "./catalogTypes";

export const woundCareCatalog: ClinicCatalog = {
  slug: "wound-care",
  name: "Wound Care Starter Catalog",
  specialty: "Wound care",
  status: "starter",
  medications: [
    ["Mupirocin 2% ointment", "Bactroban", "Topical anti-infectives", "Impetigo and secondarily infected lesions", "Ointment versus cream products differ; route split matters."],
    ["Mupirocin nasal", "Bactroban Nasal", "Decolonization", "MRSA nasal-carrier decolonization support", "Nasal formulation is distinct from the topical ointment NDC."],
    ["Retapamulin", "Altabax", "Topical anti-infectives", "Impetigo and small infected wounds", "Pleuromutilin ointment; brand-only availability history affects sourcing."],
    ["Bacitracin zinc / polymyxin B", "Polysporin and generics", "Topical anti-infectives", "Prevention of minor wound infection", "Over-the-counter routing row; pharmacy-benefit coverage varies by plan."],
    ["Silver sulfadiazine", "Silvadene, SSD", "Topical anti-infectives", "Burns and high-risk chronic wounds", "Cream strengths and jar sizes must be matched."],
    ["Povidone-iodine", "Betadine and generics", "Antiseptics", "Wound cleansing and antisepsis", "Over-the-counter routing row; solution, swab, and ointment forms differ."],
    ["Collagenase clostridial histolyticum", "Santyl", "Enzymatic debridement", "Enzymatic debridement of necrotic tissue", "Ointment only; debridement-agent distinction from sharp and autolytic methods."],
    ["Medical-grade honey", "Medihoney and similar", "Debridement and moisture balance", "Chronic wound bed preparation", "Neutral framing row; dressing versus gel presentations differ."],
    ["Triamcinolone topical", "Kenalog and generics", "Periwound dermatitis", "Eczema and inflammation around healing wounds", "Strengths and vehicles (cream, ointment, lotion) must be matched."],
    ["Pentoxifylline", "Trental", "Venous-ulcer adjunct", "Adjunct to compression for venous leg ulcers", "Oral tablets; extended-release claims differ by product."],
    ["Cephalexin", "Keflex", "Systemic antibiotics", "Non-purulent skin and wound infections", "Oral capsules and suspension."],
    ["Sulfamethoxazole / trimethoprim", "Bactrim DS", "Systemic antibiotics", "Purulent skin and wound infections incl. MRSA risk", "DS tablet versus regular-strength and suspension differ."],
    ["Clindamycin", "Cleocin", "Systemic antibiotics", "Skin structure and anaerobic-covering infections", "Oral capsules versus suspension; topical forms are separate NDCs."],
    ["Linezolid", "Zyvox", "Systemic antibiotics", "MRSA skin and soft-tissue infections", "Oral tablets and intravenous bags are distinct benefit routings."],
    ["Ceftriaxone", "Rocephin", "Systemic antibiotics, injectable", "Severe wound infections needing IV therapy", "Intravenous medical-benefit contrast row; site-of-care routing applies."],
    ["Vancomycin / daptomycin", "Vancocin; Cubicin", "Systemic antibiotics, IV anti-MRSA", "Serious MRSA wound and osteomyelitis-adjacent infections", "Intravenous medical-benefit contrast row; infusion-site coverage differs from pharmacy benefit."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
