import type { ClinicCatalog } from "./catalogTypes";

export const cardiologyCatalog: ClinicCatalog = {
  slug: "cardiology",
  name: "Cardiology Starter Catalog",
  specialty: "Cardiology",
  status: "starter",
  medications: [
    ["Apixaban", "Eliquis", "Anticoagulation", "Stroke prevention in atrial fibrillation and venous thromboembolism", "2.5 mg and 5 mg tablets are distinct; indication changes dosing frequency."],
    ["Rivaroxaban", "Xarelto", "Anticoagulation", "Atrial fibrillation stroke prevention, venous thromboembolism, and post-procedure prophylaxis", "Tablet strengths and once vs twice daily directions differ by indication."],
    ["Clopidogrel", "Plavix", "Antiplatelet", "Acute coronary syndrome and stent thrombosis prevention", "Oral tablet; 75 mg maintenance strength."],
    ["Ticagrelor", "Brilinta", "Antiplatelet", "Acute coronary syndrome with aspirin", "90 mg and 60 mg maintenance tablets are distinct; aspirin dose must be matched."],
    ["Atorvastatin (high-intensity)", "Lipitor", "Lipid lowering", "ASCVD risk reduction in established cardiovascular disease", "High-intensity means 40 mg or 80 mg tablets; lower strengths are moderate intensity."],
    ["Ezetimibe", "Zetia", "Lipid lowering", "Add-on LDL lowering when statins are insufficient", "Oral tablet; single-agent and combination products differ."],
    ["Alirocumab", "Praluent", "PCSK9 inhibitor", "Familial hypercholesterolemia and ASCVD needing further LDL reduction", "Subcutaneous autoinjector pens; 75 mg and 150 mg devices differ."],
    ["Inclisiran", "Leqvio", "siRNA lipid lowering", "LDL reduction in ASCVD on a twice-yearly schedule", "Subcutaneous clinic-administered injection at baseline, three months, then every six months."],
    ["Sacubitril/valsartan", "Entresto", "Heart failure", "Heart failure with reduced ejection fraction", "24/26 mg, 49/51 mg, and 97/103 mg titration strengths differ; ACE inhibitor washout required."],
    ["Spironolactone", "Aldactone", "Aldosterone antagonist", "HFrEF and resistant hypertension", "12.5 mg, 25 mg, 50 mg, and 100 mg tablets differ; potassium monitoring applies."],
    ["Empagliflozin", "Jardiance", "SGLT2 inhibitor", "Heart failure and type 2 diabetes with cardiovascular benefit", "10 mg and 25 mg tablets; heart failure indication is approved independent of diabetes."],
    ["Dapagliflozin", "Farxiga", "SGLT2 inhibitor", "Heart failure, chronic kidney disease, and type 2 diabetes", "5 mg and 10 mg tablets; indication drives prior-authorization rules."],
    ["Metoprolol succinate", "Toprol XL", "Beta blocker", "HFrEF, hypertension, and angina", "Extended-release only; immediate-release tartrate products are distinct."],
    ["Carvedilol", "Coreg, Coreg CR", "Beta blocker", "HFrEF and post-MI dysfunction", "Immediate-release twice daily vs once-daily CR capsules; titration strengths differ."],
    ["Amiodarone", "Cordarone, Pacerone", "Antiarrhythmic", "Ventricular arrhythmias and rhythm control in atrial fibrillation", "100 mg, 200 mg, and 400 mg tablets differ; loading schedules affect refill timing."],
    ["Digoxin", "Lanoxin", "Rate control and inotropy", "Heart failure and rate control in atrial fibrillation", "125 mcg and 250 mcg tablets plus oral solution are distinct; renal dosing matters."],
    ["Furosemide", "Lasix", "Loop diuretic", "Volume overload in heart failure", "20 mg, 40 mg, and 80 mg tablets plus oral solution differ."],
    ["Sildenafil/tadalafil (PAH)", "Revatio; Adcirca, Alyq", "PAH vasodilator (PDE5 inhibitor)", "Pulmonary arterial hypertension WHO group I", "PAH products use 20 mg sildenafil three times daily or 20 mg-plus once-daily tadalafil tablets; these are distinct from erectile dysfunction and benign prostatic hyperplasia products and must not be substituted."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
