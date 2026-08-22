import type { ClinicCatalog } from "./catalogTypes";

export const allergyImmunologyCatalog: ClinicCatalog = {
  slug: "allergy-immunology",
  name: "Allergy and Immunology Starter Catalog",
  specialty: "Allergy and immunology",
  status: "starter",
  medications: [
    ["Allergen immunotherapy extracts", "Grastek, Oralair, Ragwitek, Odactra, custom SCIT mixes", "Allergen immunotherapy", "Allergic rhinitis and asthma desensitization", "Subcutaneous extract vials are mixed per patient; sublingual tablet products are fixed-dose and must be matched by allergen."],
    ["Omalizumab", "Xolair", "Biologic", "Chronic urticaria and allergic asthma", "Prefilled syringe versus vial; dosing by weight and IgE level must be matched."],
    ["Mepolizumab", "Nucala", "Biologic", "Eosinophilic asthma and hypereosinophilic syndrome", "Autoinjector, prefilled syringe, and vial products differ."],
    ["Benralizumab", "Fasenra", "Biologic", "Eosinophilic asthma", "Prefilled syringe and autoinjector devices differ."],
    ["Tezepelumab", "Tezspire", "Biologic", "Severe asthma", "Prefilled syringe only; no weight-based titration but device matters."],
    ["Dupilumab", "Dupixent", "Biologic", "Atopic dermatitis, asthma, and chronic rhinosinusitis with nasal polyps", "Prefilled pen 300 mg and syringe 200 mg strengths differ."],
    ["Fluticasone propionate nasal", "Flonase", "Intranasal corticosteroid", "Allergic rhinitis", "OTC spray versus branded Rx product; strength and device differ."],
    ["Mometasone nasal", "Nasonex", "Intranasal corticosteroid", "Allergic rhinitis", "Spray pump strength and generic substitution matter."],
    ["Azelastine nasal", "Astelin, Astepro", "Intranasal antihistamine", "Allergic rhinitis", "0.1% and 0.15% strengths differ."],
    ["Fluticasone / azelastine nasal", "Dymista", "Combination intranasal therapy", "Allergic rhinitis inadequately controlled by monotherapy", "Combination product is not interchangeable with separate components."],
    ["Levocetirizine", "Xyzal", "Oral antihistamine", "Allergic rhinitis and chronic urticaria", "Tablet and oral solution products differ."],
    ["Desloratadine", "Clarinex", "Oral antihistamine", "Allergic rhinitis and chronic urticaria", "Tablet, disintegrating tablet, and syrup differ."],
    ["Montelukast", "Singulair", "Leukotriene modifier", "Asthma maintenance and allergic rhinitis", "10 mg tablet, chewable, and granule packet strengths differ."],
    ["Cromolyn nasal", "Nasalcrom", "Mast cell stabilizer", "Allergic rhinitis prophylaxis", "OTC spray concentration must be matched."],
    ["Ipratropium nasal", "Atrovent Nasal", "Intranasal anticholinergic", "Vasomotor and cold-induced rhinorrhea", "0.03% and 0.06% bottle strengths differ."],
    ["Epinephrine auto-injector", "EpiPen, Auvi-Q, generic epinephrine injection", "Anaphylaxis rescue", "Anaphylaxis", "Device brand, strength (0.3 mg vs 0.15 mg), and two-pack count must be matched."],
    ["Cetirizine", "Zyrtec", "Oral antihistamine", "Allergic rhinitis and chronic urticaria", "Tablet, chewable, and solution products differ."],
    ["Fexofenadine", "Allegra", "Oral antihistamine", "Allergic rhinitis and chronic urticaria", "Tablet, suspension, and combination products with pseudoephedrine differ."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
