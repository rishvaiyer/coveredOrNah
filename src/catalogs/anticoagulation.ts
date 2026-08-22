import type { ClinicCatalog } from "./catalogTypes";

export const anticoagulationCatalog: ClinicCatalog = {
  slug: "anticoagulation-management",
  name: "Anticoagulation Management Catalog",
  specialty: "Anticoagulation management",
  status: "starter",
  medications: [
    ["Warfarin", "Coumadin, Jantoven", "Vitamin K antagonist", "Stroke prevention in atrial fibrillation and venous thromboembolism", "1 mg, 2 mg, 2.5 mg, 5 mg, 7.5 mg, and 10 mg tablets are distinct rows; INR monitoring cadence drives refill friction."],
    ["Apixaban", "Eliquis", "Direct oral anticoagulant", "Atrial fibrillation stroke prevention and venous thromboembolism treatment", "Single product row; 2.5 mg versus 5 mg selection depends on age, weight, and creatinine criteria, so strength must be matched."],
    ["Rivaroxaban", "Xarelto", "Direct oral anticoagulant", "Atrial fibrillation stroke prevention and venous thromboembolism treatment", "Single product row; once-daily AF dosing versus twice-daily VTE dosing distinction affects quantity and prior auth."],
    ["Edoxaban", "Savaysa", "Direct oral anticoagulant", "Atrial fibrillation stroke prevention and venous thromboembolism treatment", "Creatinine-cleared dose selection applies; tablet strengths must be matched."],
    ["Dabigatran", "Pradaxa", "Direct oral anticoagulant", "Atrial fibrillation stroke prevention and venous thromboembolism treatment", "Capsule only; renal-dose adjustment and bottle versus blister packaging differ."],
    ["Enoxaparin", "Lovenox and generics", "Low molecular weight heparin", "Short-term bridging and home self-administered anticoagulation", "Self-administered prefilled syringes differ from multi-dose vials; benefit routing varies."],
    ["Fondaparinux", "Arixtra", "Factor Xa inhibitor, injectable", "Venous thromboembolism prophylaxis and treatment", "Prefilled syringes and vial presentations differ; non-formulary status on many plans raises sourcing friction."],
    ["Heparin", "Unfractionated heparin IV", "Intravenous anticoagulation", "Inpatient anticoagulation and rapid-reversal settings", "Hospital medical-benefit contrast row; infusion-site coverage differs from pharmacy benefit."],
    ["Phytonadione oral", "Mephyton and generics", "Oral vitamin K reversal", "Outpatient warfarin over-anticoagulation without major bleeding", "Oral reversal row distinct from intravenous products; pharmacy versus medical benefit routing differs."],
    ["Protamine sulfate", "Generic protamine IV", "Heparin reversal agent", "Reversal of unfractionated or low molecular weight heparin", "Intravenous medical-benefit contrast row; administered in monitored settings, not dispensed retail."],
    ["Idarucizumab", "Praxbind", "Dabigatran-specific reversal agent", "Emergency reversal of dabigatran anticoagulation", "Intravenous medical-benefit contrast row; emergency-department and inpatient administration only."],
    ["Andexanet alfa", "Andexxa", "Factor Xa inhibitor reversal agent", "Emergency reversal of apixaban or rivaroxaban anticoagulation", "Intravenous medical-benefit contrast row; high-cost inpatient agent with site-of-care coverage rules."],
    ["Clopidogrel", "Plavix and generics", "Antiplatelet, adjacent", "Adjacent antiplatelet therapy alongside anticoagulation decisions", "Tablet strengths differ; combination use with anticoagulants raises bleeding-management review."],
    ["Cilostazol", "Pletal", "Antiplatelet, claudication", "Intermittent claudication reduction in peripheral artery disease", "Heart-failure contraindication note; twice-daily tablets and generic availability affect sourcing."],
    ["Dipyridamole / aspirin", "Aggrenox and generics", "Antiplatelet combination", "Secondary stroke prevention", "Extended-release capsules are distinct from immediate-release components; capsule versus separate agents differ."],
    ["Tranexamic acid", "Lysteda and generics", "Bleeding management", "Heavy menstrual bleeding and mucosal bleeding control", "Oral tablets differ from injectable products; adjacent bleeding-management row with indication-based coverage."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
