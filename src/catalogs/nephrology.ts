import type { ClinicCatalog } from "./catalogTypes";

export const nephrologyCatalog: ClinicCatalog = {
  slug: "nephrology",
  name: "Nephrology Starter Catalog",
  specialty: "Nephrology",
  status: "starter",
  medications: [
    ["Sevelamer carbonate", "Renvela (Renagel is sevelamer hydrochloride, a separate salt and product)", "phosphate binder", "Hyperphosphatemia in chronic kidney disease and dialysis", "Powder packet and oral tablets differ; must be taken with meals, and carbonate differs from hydrochloride products."],
    ["Lanthanum carbonate", "Fosrenol", "phosphate binder", "Hyperphosphatemia in end-stage renal disease", "Chewable tablets and oral powder packets are distinct; taken with meals and requires dose titration."],
    ["Sucroferric oxyhydroxide", "Velphoro", "iron-based phosphate binder", "Hyperphosphatemia in dialysis patients", "Chewable tablets only; taken with meals and not interchangeable with other binder classes."],
    ["Ferric citrate", "Auryxia", "iron-based phosphate binder", "Hyperphosphatemia in dialysis and CKD on iron-repletion indication", "Oral tablets taken with meals; also labeled for iron deficiency, so indication drives coverage."],
    ["Calcitriol", "Rocaltrol is the oral brand; Calcijex is injectable calcitriol", "active vitamin D analog", "Secondary hyperparathyroidism in CKD and hypocalcemia", "Oral capsules and solution differ from IV Calcijex used in dialysis units; route is not interchangeable."],
    ["Paricalcitol", "Zemplar", "vitamin D analog", "Secondary hyperparathyroidism in CKD", "Oral capsules versus IV injection are distinct products; IV form is typically billed at the dialysis center."],
    ["Cinacalcet", "Sensipar", "calcimimetic", "Secondary hyperparathyroidism and parathyroid carcinoma hypercalcemia", "Oral tablets; dose varies by indication and dialysis status affects titration criteria."],
    ["Etelcalcetide (IV)", "Parsabiv", "calcimimetic", "Secondary hyperparathyroidism in hemodialysis", "IV-only administration three times weekly at dialysis; distinct route from oral cinacalcet and hemodialysis-labeled."],
    ["Darbepoetin alfa", "Aranesp", "ESA anemia therapy", "Anemia of chronic kidney disease", "Medical-benefit contrast row; dosed in the dialysis unit and billed under Part B rather than pharmacy benefit."],
    ["Epoetin alfa", "Epogen, Procrit", "ESA anemia therapy", "Anemia of chronic kidney disease", "Medical-benefit note: Epogen dialysis use is Part B billed while Procrit is often pharmacy benefit; strengths and vial sizes differ."],
    ["Sodium zirconium cyclosilicate", "Lokelma", "potassium binder", "Hyperkalemia", "Oral powder packets for suspension; maintenance versus correction dosing regimens differ and taken without regard to meals."],
    ["Patiromer", "Veltassa", "potassium binder", "Hyperkalemia", "Oral powder packets only; separated from other oral medications by several hours, which affects adherence criteria."],
    ["Sodium polystyrene sulfonate", "Kayexalate, Kionex", "potassium binder", "Hyperkalemia", "Oral powder and rectal suspension differ; sorbitol-containing products carry distinct safety considerations."],
    ["Furosemide", "Lasix", "loop diuretic", "Edema and volume overload in CKD", "Oral tablets and injectable forms differ; higher CKD doses and combination products must be matched."],
    ["Torsemide", "Soaanz, Demadex", "loop diuretic", "Edema in heart failure and renal disease", "Oral tablets; brand Soaanz is a distinct product from generic torsemide at the claim level."],
    ["Metoprolol succinate", "Toprol-XL, Kapspargo Sprinkle", "beta blocker", "Hypertension and heart failure in CKD", "Extended-release tablets versus sprinkle capsules differ; immediate-release tartrate is a separate product."],
    ["Amlodipine", "Norvasc", "calcium channel blocker", "Hypertension in CKD", "Oral tablet strengths must be matched; combination products with benazepril or valsartan are distinct."],
    ["Iron sucrose (IV)", "Venofer", "IV iron", "Iron deficiency anemia in hemodialysis-dependent CKD", "Medical-benefit contrast row; administered at the dialysis center and billed under Part B, not pharmacy benefit."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
