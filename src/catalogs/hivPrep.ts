import type { ClinicCatalog } from "./catalogTypes";

export const hivPrepCatalog: ClinicCatalog = {
  slug: "hiv-prep",
  name: "HIV and PrEP Care Catalog",
  specialty: "HIV and PrEP care",
  status: "starter",
  medications: [
    ["Emtricitabine / tenofovir disoproxil fumarate", "Truvada and generics", "PrEP and HIV treatment backbone", "Pre-exposure prophylaxis and HIV treatment", "Brand Truvada and generic F/TDF products are distinct NDCs; indication differs between PrEP and treatment."],
    ["Emtricitabine / tenofovir alafenamide", "Descovy", "PrEP and HIV treatment backbone", "HIV treatment and PrEP excluding receptive vaginal intercourse risk", "TAF product has a narrower PrEP indication than TDF; exact indication must be matched to the approved label."],
    ["Bictegravir / emtricitabine / tenofovir alafenamide", "Biktarvy", "Single-tablet regimen", "First-line HIV treatment", "Single-tablet complete regimen; components are not separately substitutable without changing the regimen."],
    ["Dolutegravir", "Tivicay", "Integrase inhibitor", "HIV treatment as part of multi-drug regimens", "Standalone integrase inhibitor distinct from fixed-dose combinations; strength and co-administration matter."],
    ["Dolutegravir / lamivudine", "Dovato", "Single-tablet regimen", "Two-drug HIV treatment for treatment-naive patients", "Two-drug single-tablet regimen is distinct from three-drug STRs; only certain patient profiles qualify."],
    ["Raltegravir", "Isentress, Isentress HD", "Integrase inhibitor", "HIV treatment in selected regimens", "Twice-daily 400 mg and once-daily HD 600 mg products are distinct strengths and are not interchangeable."],
    ["Darunavir / cobicistat", "Rezolsta", "Boosted protease inhibitor", "HIV treatment as part of complete regimens", "Fixed-dose boost pair; darunavir alone or with ritonavir is a different product with different dosing rules."],
    ["Doravirine", "Pifeltro", "NNRTI", "HIV treatment as part of complete regimens", "Tablet-only NNRTI; fewer interactions than efavirenz-based legacy regimens but still part of combination therapy."],
    ["Rilpivirine", "Edurant", "NNRTI", "HIV treatment in patients with suppressed viral load", "Requires meal timing and acid-suppression separation; oral tablet is distinct from the long-acting injectable."],
    ["Cabotegravir / rilpivirine extended-release injectable", "Cabenuva", "Long-acting injectable regimen", "Maintenance therapy replacing suppressive oral regimens", "In-clinic monthly or every-two-months injections; medical-benefit buy-and-bill candidacy unlike pharmacy-benefit orals."],
    ["Lenacapavir extended-release injectable", "Sunlenca", "Long-acting capsid inhibitor", "Multidrug-resistant HIV treatment with other antiretrovirals", "Twice-yearly subcutaneous injection paired with oral loading; medical-benefit administration channel distinct from retail pharmacy fills."],
    ["Valacyclovir", "Valtrex and acyclovir generics", "HSV support therapy", "Herpes simplex reactivation common in HIV care", "Collapsed HSV-support row covering valacyclovir and acyclovir; salt forms and strengths differ between the two ingredients."],
    ["Fluconazole", "Diflucan", "Antifungal", "Oropharyngeal and esophageal candidiasis in HIV care", "Tablet and suspension strengths differ; interacts with multiple antiretrovirals including rilpivirine."],
    ["Ondansetron", "Zofran", "Supportive care", "Nausea during regimen changes or opportunistic infection workup", "Oral soluble film, tablets, and solution products differ; QT interaction awareness with other agents."],
    ["Loperamide", "Imodium and generics", "Supportive care", "Diarrhea support on antiretroviral regimens", "Over-the-counter capsule and liquid forms vary; cardiac-warning labeling limits dose escalation."],
    ["Cholestyramine", "Questran", "Supportive care", "Bile-acid diarrhea support and binding applications", "Powder packets versus bulk canisters differ; must be separated from co-administered antiretrovirals by several hours."]
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
