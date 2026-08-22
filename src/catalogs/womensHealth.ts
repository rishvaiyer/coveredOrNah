import type { ClinicCatalog } from "./catalogTypes";

export const womensHealthCatalog: ClinicCatalog = {
  slug: "womens-health",
  name: "Women's Health Starter Catalog",
  specialty: "Obstetrics and gynecology and women's health",
  status: "starter",
  medications: [
    ["Norethindrone / ethinyl estradiol", "Various COC generics (e.g., Junel, Loestrin generics)", "Combined oral contraceptive", "Contraception; selected acne and cycle-control uses", "Oral tablets; strength tiers (1/20, 1.5/30, and others) and fe-chewable variants are distinct products."],
    ["Drospirenone-containing COC", "Yaz, Gianvi, Ocella, Loryna", "Combined oral contraceptive", "Contraception; PMDD and moderate acne labeling for specific products", "3 mg drospirenone / 0.02 mg ethinyl estradiol 24/4-day regimens are distinct from other drospirenone products like Yasmin (3/0.03, 21/7)."],
    ["Norelgestromin / ethinyl estradiol patch", "Xulane, Twirla (levonorgestrel patch)", "Transdermal contraceptive", "Contraception", "Weekly transdermal patch; Xulane and Twirla are separate NDAs with different hormones and body-site limits."],
    ["Etonogestrel / ethinyl estradiol vaginal ring", "NuvaRing, generic EluRyng", "Vaginal contraceptive ring", "Contraception", "Vaginal ring inserted monthly; brand NuvaRing versus generic EluRyng are distinct NDCs plans may prefer separately."],
    ["Medroxyprogesterone injection (IM)", "Depo-Provera 150 mg/mL", "Injectable progestin contraceptive", "Contraception via intramuscular injection", "150 mg/mL IM formulation in vials; distinct NDC from the subcutaneous product and from depot dosing kits."],
    ["Medroxyprogesterone injection (SC)", "Depo-SubQ Provera 104", "Injectable progestin contraceptive", "Contraception via subcutaneous injection", "104 mg/0.65 mL prefilled syringe for SC use only; not interchangeable with the IM 150 mg product on claims."],
    ["Levonorgestrel IUS", "Mirena, Liletta, Kyleena, Skyla", "Intrauterine system", "Contraception; heavy menstrual bleeding labeling (Mirena, Liletta at 52 mg)", "Medical-benefit contrast row: device is often billed under the medical benefit rather than pharmacy benefit; dose duration and indication differ by product (52 mg vs 19.5 mg, 8-year Mirena labeling)."],
    ["Levonorgestrel emergency contraceptive", "Plan B One-Step, Take Action, generic levonorgestrel 1.5 mg", "Emergency contraceptive", "Emergency contraception within 72 hours of unprotected intercourse", "Single-dose 1.5 mg tablet sold over the counter; pharmacy-only stocking and age rules affect availability rather than formulary tier."],
    ["Tranexamic acid", "Lysteda, generic tranexamic acid", "Antifibrinolytic", "Heavy menstrual bleeding", "Oral 650 mg tablets (Lysteda) differ from injectable tranexamic acid used perioperatively; indication drives coverage."],
    ["Spironolactone", "Aldactone, generic spironolactone", "Aldosterone antagonist (hormonal acne use)", "Hormonal acne in women; off-label dermatologic co-management with OB/GYN", "Oral tablets at 25 mg, 50 mg, and 100 mg; potassium monitoring and off-label acne diagnosis can trigger plan edits."],
    ["Metronidazole vaginal gel", "MetroGel-Vaginal, Vandazole, generic metronidazole gel", "Vaginal antibacterial", "Bacterial vaginosis", "0.75% vaginal gel with applicators differs from oral metronidazole tablets; gel strength and kit contents must be matched."],
    ["Clotrimazole vaginal cream", "Gyne-Lotrimin, generic clotrimazole vaginal cream", "Vaginal antifungal", "Vulvovaginal candidiasis", "Vaginal cream (often 1% or 2%) with applicators; OTC versus prescription package sizes are distinct products."],
    ["Conjugated estrogens", "Premarin", "Systemic estrogen therapy", "Moderate to severe vasomotor symptoms and related menopause indications", "Oral tablets at 0.3 mg through 1.25 mg; branded-only status and boxed warnings drive PA criteria; vaginal cream is a separate NDC."],
    ["Estradiol", "Estrace (oral), Climara, Vivelle-Dot, Minivelle (patches), generic estradiol", "Estrogen therapy", "Menopausal vasomotor symptoms and hypoestrogenism", "Vehicle/route split matters: oral tablets (1-2 mg) versus transdermal patches (weekly or twice-weekly, 0.025-0.1 mg/day) are separate coverage lines."],
    ["Progesterone micronized", "Prometrium, generic progesterone capsules", "Micronized progesterone", "Endometrial protection with estrogen therapy; secondary amenorrhea", "Peanut-oil suspension capsules at 100 mg and 200 mg; compounded progesterone creams are distinct and usually non-covered."],
    ["Ospemifene", "Osphena", "SERM (dyspareunia therapy)", "Moderate to severe dyspareunia and vaginal dryness from menopause", "Once-daily 60 mg oral tablet; boxed-warning risk language (endometrial cancer, cardiovascular); no REMS program and branded-only status drive prior auth."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
