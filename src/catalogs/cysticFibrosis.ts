import type { ClinicCatalog } from "./catalogTypes";

export const cysticFibrosisCatalog: ClinicCatalog = {
  slug: "cystic-fibrosis",
  name: "Cystic Fibrosis Care Catalog",
  specialty: "Cystic fibrosis care",
  status: "starter",
  medications: [
    ["Elexacaftor / tezacaftor / ivacaftor", "Trikafta", "CFTR modulator", "F508del and responsive variants", "Tablet versus granule packets differ by age band."],
    ["Ivacaftor", "Kalydeco", "CFTR potentiator", "Gating and residual-function variants", "Variant-specific eligibility drives coverage review."],
    ["Tezacaftor / ivacaftor", "Symdeko", "CFTR corrector-potentiator", "F508del homozygous or responsive variants", "Tablet and granule packets differ by age."],
    ["Dornase alfa", "Pulmozyme", "Inhaled mucolytic enzyme", "Daily airway clearance support", "Nebulizer with dedicated jet nebulizer assembly; single-use ampules."],
    ["Tobramycin inhaled", "TOBI, Bethkis, Podhaler", "Inhaled antibiotic", "Chronic Pseudomonas airway infection", "Nebulized solutions versus dry-powder Podhaler are distinct products with distinct cycles."],
    ["Aztreonam lysine inhalation", "Cayston", "Inhaled antibiotic", "Chronic Pseudomonas in patients 6 years and older", "Requires the Altera Nebulizer; 28-day-on/28-day-off cycles."],
    ["Hypertonic saline inhalation", "Hyper-Sal, Nebusal generics", "Inhaled osmotic agent", "Airway clearance adjunct from age 6", "Percent strength (3, 6, 7) and ampule volume vary by product."],
    ["Pancreatic enzyme replacement", "Creon, Zenpep, Viokace", "Enzyme replacement", "Exocrine pancreatic insufficiency", "Lipase units per capsule differ across brands; Viokace is taken with an acid suppressant."],
    ["Ursodiol", "Actigall, generics", "Bile acid therapy", "Associated liver disease support framing kept neutral", "Capsule strengths and weight-based protocols are plan-review relevant."],
    ["Fat-soluble vitamin support", "AquADEK-type CF multivitamins", "Vitamin supplementation", "Fat-soluble vitamin A, D, E, K replacement", "Formulations are product-distinct; not interchangeable with standard multivitamins."],
    ["Albuterol nebulized", "AccuNeb and generic unit-dose vials", "Short-acting bronchodilator", "Pre-airway-clearance bronchodilation", "Unit-dose vials for nebulization differ from HFA inhaler products."],
    ["Azithromycin", "Zithromax", "Macrolide", "Chronic maintenance anti-inflammatory use per CF protocol", "Long-term chronic-use indication differs from acute infection dosing."],
    ["Omeprazole", "Prilosec", "Proton pump inhibitor", "GERD management common in CF", "Delayed-release capsule versus suspension products differ."],
    ["Budesonide nebulized", "Pulmicort respules", "Inhaled corticosteroid", "ABPA-management component under specialist direction", "Respule suspension differs from DPI products used in asthma."],
    ["Insulin", "Multiple products", "Diabetes management", "Cystic fibrosis-related diabetes cross-specialty row", "See endocrinology catalog; device and regimen distinctions apply."],
    ["Ibuprofen", "Generic prescription ibuprofen", "NSAID", "Pediatric anti-inflammatory use under CF center protocol", "High-dose monitoring framing kept neutral; strengths differ from OTC products."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
