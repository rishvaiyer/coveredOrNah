import type { ClinicCatalog } from "./catalogTypes";

export const urologyCatalog: ClinicCatalog = {
  slug: "urology",
  name: "Urology Starter Catalog",
  specialty: "Urology",
  status: "starter",
  medications: [
    ["Tamsulosin", "Flomax", "alpha-1 blocker", "Benign prostatic hyperplasia (BPH) symptoms", "Oral capsules; 0.4 mg and 0.8 mg strengths differ, and BPH-only labeling drives coverage."],
    ["Alfuzosin", "Uroxatral", "alpha-1 blocker", "BPH symptoms", "Extended-release tablets only; once-daily ER is distinct from immediate-release alpha-blockers."],
    ["Silodosin", "Rapaflo", "alpha-1 blocker", "BPH symptoms", "Oral capsules at 4 mg and 8 mg; selectivity profile differs from other alpha-blockers but product strength must still be matched."],
    ["Terazosin", "Hytrin", "alpha-1 blocker", "BPH symptoms and hypertension", "Dual-labeled for BPH and hypertension, so the diagnosis on the claim changes coverage criteria."],
    ["Finasteride", "Proscar, Propecia", "5-alpha reductase inhibitor", "BPH (Proscar 5 mg) and male pattern hair loss (Propecia 1 mg)", "The 5 mg and 1 mg products are separate drugs with separate indications and formulary placements; strength must be matched exactly."],
    ["Dutasteride", "Avodart", "5-alpha reductase inhibitor", "BPH symptoms and prostate enlargement", "Oral capsules only; combination products with tamsulosin are distinct NDCs from single-agent dutasteride."],
    ["Tadalafil (daily-dose)", "Cialis daily, generic tadalafil 2.5/5 mg", "PDE5 inhibitor", "Daily dosing for BPH symptoms or erectile dysfunction", "Low-strength daily tablets are a different product line from on-demand PAH (Adcirca/Alyq) high-strength tablets; indication and strength both drive coverage."],
    ["Solifenacin", "VESIcare", "antimuscarinic", "Overactive bladder with urge incontinence", "Oral tablets; VESIcare LS oral suspension is a distinct pediatric-labeled product from adult VESIcare tablets."],
    ["Oxybutynin", "Ditropan, Ditropan XL, Gelnique", "antimuscarinic", "Overactive bladder and detrusor overactivity", "Immediate-release tablets differ from extended-release tablets and transdermal gel; each dosage form is a distinct covered product."],
    ["Mirabegron", "Myrbetriq", "beta-3 adrenergic agonist", "Overactive bladder and neurogenic detrusor overactivity", "Extended-release tablets at 25 mg and 50 mg; indication (idiopathic versus neurogenic OAB) changes prior-auth rules."],
    ["Vibegron", "Gemtesa", "beta-3 adrenergic agonist", "Overactive bladder", "Once-daily oral tablets; branded-only status keeps it on the specialty-adjacent tier versus generic antimuscarinics."],
    ["Trospium chloride", "Sanctura, Sanctura XR", "antimuscarinic", "Overactive bladder with urge incontinence", "Immediate-release twice-daily tablets differ from extended-release once-daily capsules; renal dosing limits apply."],
    ["Phenazopyridine", "Pyridium, Azo Urinary Pain Relief", "urinary analgesic", "Urinary tract pain and burning irritation", "Prescription 200 mg tablets versus over-the-counter 95 mg products are distinct; short-course symptomatic use affects refill criteria."],
    ["Alprostadil injection", "Caverject, Edex", "erectile dysfunction injectable", "Erectile dysfunction unresponsive to oral therapy", "Medical-benefit note: office-administered and patient-injected formulations may bill under the medical benefit rather than pharmacy benefit; kit contents and diluent differ by brand."],
    ["Desmopressin acetate", "Nocturna", "vasopressin analog", "Nocturnal polyuria (nocturia) in adults", "Sublingual melt tablet developed specifically for nocturia; nasal sprays and DDAVP hemophilia products are separate indications and not interchangeable."],
    ["Pentosan polysulfate", "Elmiron", "bladder mucosa protectant", "Interstitial cystitis / bladder pain syndrome", "Oral capsules only; long-term therapy requires baseline eye exams for retinal toxicity, which plans increasingly build into prior auth."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
