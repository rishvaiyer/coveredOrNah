import type { ClinicCatalog } from "./catalogTypes";

export const multipleSclerosisCatalog: ClinicCatalog = {
  slug: "multiple-sclerosis",
  name: "Multiple Sclerosis Catalog",
  specialty: "Multiple sclerosis",
  status: "starter",
  medications: [
    ["Glatiramer acetate", "Copaxone, Glatopa", "Injectable immunomodulator", "Relapsing forms of multiple sclerosis", "Copaxone 40 mg three times weekly and 20 mg daily are distinct products; Glatopa is the generic and must be matched separately."],
    ["Interferon beta-1a", "Avonex, Rebif", "Injectable immunomodulator", "Relapsing forms of multiple sclerosis", "Avonex is intramuscular once weekly; Rebif is subcutaneous three times weekly; route and schedule are not interchangeable."],
    ["Peginterferon beta-1a", "Plegridy", "Injectable immunomodulator", "Relapsing forms of multiple sclerosis", "Subcutaneous injection every two weeks; pegylated schedule differs from non-pegylated interferon products."],
    ["Dimethyl fumarate / diroximel fumarate", "Tecfidera, Vumerity", "Oral immunomodulator", "Relapsing forms of multiple sclerosis", "Tecfidera and Vumerity are distinct products with different salt forms and codes; delayed-release capsules dosed twice daily."],
    ["Teriflunomide", "Aubagio", "Oral immunomodulator", "Relapsing forms of multiple sclerosis", "Once-daily oral tablet; 7 mg and 14 mg strengths are distinct."],
    ["Fingolimod", "Gilenya", "S1P receptor modulator", "Relapsing forms of multiple sclerosis", "Once-daily oral capsule; first-dose cardiac monitoring required."],
    ["Siponimod", "Mayzent", "S1P receptor modulator", "Relapsing forms of secondary progressive MS with active disease", "Once-daily oral tablet with CYP2C19-based titration."],
    ["Ozanimod", "Zeposia", "S1P receptor modulator", "Relapsing forms of multiple sclerosis (MS indication; ulcerative colitis is a separate listing)", "MS indication uses a 7-day escalating titration to 0.92 mg once daily."],
    ["Cladribine", "Mavenclad", "Oral cytotoxic agent", "Relapsing forms of multiple sclerosis", "Two annual treatment courses of short daily dosing weeks; cumulative lymphocyte monitoring applies."],
    ["Natalizumab", "Tysabri, Tyruko", "Integrin blocker infusion or injection", "Relapsing forms of multiple sclerosis", "IV every four weeks under medical benefit versus subcutaneous auto-injector; benefit channel changes billing entirely."],
    ["Ocrelizumab", "Ocrevus", "Anti-CD20 infusion", "Relapsing or primary progressive multiple sclerosis", "Two initial IV infusions two weeks apart, then every six months; medical benefit buy-and-bill contrast row."],
    ["Ofatumumab", "Kesimpta", "Anti-CD20 self-injection", "Relapsing forms of multiple sclerosis", "Subcutaneous monthly auto-injector dispensed through pharmacy benefit; contrast with IV anti-CD20 infusions."],
    ["Ublituximab", "Briumvi", "Anti-CD20 infusion", "Relapsing forms of multiple sclerosis", "IV infusion every 24 weeks after initial titrated doses; medical benefit contrast row."],
    ["Dalfampridine", "Ampyra", "Walking support", "Improvement of walking in multiple sclerosis", "Extended-release tablet twice daily; renal impairment restrictions apply."],
    ["Baclofen", "Lioresal", "Spasticity support", "Multiple sclerosis spasticity", "Scheduled oral tablets with titration; intrathecal pump therapy is a separate product."],
    ["Oxybutynin", "Ditropan, Ditropan XL", "Bladder-support symptom therapy", "Neurogenic bladder symptoms in multiple sclerosis", "Immediate-release and extended-release products differ; cross-reference the urology catalog for bladder-focused rows."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
