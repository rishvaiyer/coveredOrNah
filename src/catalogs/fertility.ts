import type { ClinicCatalog } from "./catalogTypes";

export const fertilityCatalog: ClinicCatalog = {
  slug: "fertility",
  name: "Fertility and Reproductive Endocrinology Catalog",
  specialty: "Fertility and reproductive endocrinology",
  status: "starter",
  medications: [
    ["Letrozole", "Femara", "Ovulation induction", "First-line ovulation induction, including PCOS", "Oral tablet strengths must be matched; ovulation-induction use is common and plan-dependent."],
    ["Clomiphene citrate", "Clomid, Serophene", "Ovulation induction", "Ovulation induction and timed intercourse cycles", "Tablet strength and package quantity matter for cycle coverage."],
    ["Metformin", "Glucophage", "PCOS support", "PCOS metabolic support alongside induction therapy", "Immediate-release and extended-release products differ."],
    ["Leuprolide acetate injection", "Lupron", "Cycle suppression", "GnRH agonist suppression before stimulation", "Distinct kit configurations and dose durations must be matched; pharmacy-vs-medical-benefit candidacy varies."],
    ["Ganirelix acetate", "Ganirelix", "Cycle suppression", "GnRH antagonist injection during stimulation", "Prefilled syringe strengths must be matched; often medical-benefit candidate."],
    ["Cetrorelix", "Cetrotide", "Cycle suppression", "GnRH antagonist injection during stimulation", "Kit contents and reconstitution supplies must be matched."],
    ["Follitropin products", "Gonal-f (follitropin alfa); Follistim AQ (follitropin beta)", "Gonadotropin stimulation", "Ovarian stimulation cycles", "Alfa and beta products are distinct molecules; pen devices, cartridge sizes, and vial strengths must be matched and are not interchangeable."],
    ["Menotropins", "Menopur", "Gonadotropin stimulation", "hMG-based ovarian stimulation", "Reconstituted vial kits with mixing supplies; dose and kit size must be matched."],
    ["Human chorionic gonadotropin trigger", "Ovidrel (recombinant); Novarel, Pregnyl (urinary)", "Trigger shot", "hCG trigger before egg retrieval", "Recombinant prefilled syringe and urinary vial-with-diluent kits are distinct products; device and kit contents must be matched."],
    ["Progesterone in oil injection", "Progesterone in oil", "Luteal support", "Intramuscular luteal-phase support after transfer", "Oil concentration (50 mg/mL vs 100 mg/mL) and vial size must be matched."],
    ["Progesterone vaginal products", "Crinone gel; vaginal suppositories and inserts", "Luteal support", "Vaginal luteal-phase support after transfer", "Gel applicator sizes versus suppository or insert formats differ; pharmacy benefit candidacy varies by product."],
    ["Estradiol valerate injection", "Delestrogen", "Endometrial preparation", "Intramuscular estrogen priming for lining development", "Oil concentration (5 mg/mL vs 20 mg/mL) and vial size must be matched."],
    ["Prenatal vitamins, prescription grade", "Prenate, CitraNatal, OB Complete", "Preconception support", "Prescription-grade prenatal supplementation", "Neutral support row; formulation differences include DHA, iron form, and tablet-versus-softgel format."],
    ["Aspirin, low dose", "Bayer Low Dose; generic 81 mg tablets", "Protocol adjunct", "Clinic-directed low-dose aspirin protocols", "Neutral protocol adjunct row; plan coverage rarely applies and clinic guidance governs use."],
    ["Enoxaparin", "Lovenox", "Protocol adjunct", "Thromboprophylaxis in selected IVF protocols", "Neutral protocol adjunct row; prefilled syringe strength and package count must be matched."],
    ["Doxycycline", "Vibramycin; generic doxycycline", "Prophylaxis", "Short-course prophylaxis around egg retrieval", "Hyclate and monohydrate products differ; prophylactic course length is clinic-specific."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
