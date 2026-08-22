import type { ClinicCatalog } from "./catalogTypes";

export const addictionMedicineCatalog: ClinicCatalog = {
  slug: "addiction-medicine",
  name: "Addiction Medicine Starter Catalog",
  specialty: "Addiction medicine",
  status: "starter",
  medications: [
    ["Buprenorphine/naloxone sublingual film", "Suboxone film", "OUD treatment", "Outpatient opioid use disorder maintenance", "Sublingual film and tablet products are distinct rows; film strength and unit count must be matched."],
    ["Buprenorphine/naloxone sublingual tablets", "Zubsolv, generic tablets", "OUD treatment", "Outpatient opioid use disorder maintenance", "Tablet strengths are not interchangeable with film strengths; brand and generic products differ."],
    ["Buprenorphine extended-release monthly injection", "Sublocade", "OUD treatment", "Monthly injectable opioid use disorder maintenance", "Subcutaneous monthly injection under REMS; only certified treatment settings dispense or administer."],
    ["Methadone", "Dolophine, generics", "OUD treatment", "Clinic-dispensed opioid agonist therapy for OUD", "OTP clinic dispensing rules apply; not an ordinary outpatient pharmacy product."],
    ["Naltrexone oral", "Revia, generics", "OUD and AUD treatment", "Oral relapse-prevention for opioid or alcohol use disorder", "Daily oral tablet; requires opioid-free interval before initiation."],
    ["Naltrexone extended-release IM", "Vivitrol", "OUD and AUD treatment", "Monthly injectable relapse prevention", "Monthly intramuscular injection is a distinct row from oral naltrexone; administration and billing differ."],
    ["Lofexidine", "Lucemyra", "Withdrawal support", "Short-term opioid withdrawal symptom relief", "Brand-only tablet course; distinct from OUD maintenance agents."],
    ["Clonidine", "Catapres, generics", "Withdrawal support adjunct", "Adjunctive withdrawal symptom support", "Tablet and patch forms differ; off-label supportive framing only."],
    ["Acamprosate", "Campral", "AUD treatment", "Alcohol use disorder abstinence support", "Delayed-release tablet dosed three times daily; renal-function dependent."],
    ["Disulfiram", "Antabuse, generics", "AUD treatment", "Alcohol aversion therapy", "Oral tablet; strict supervision and alcohol-avoidance counseling required."],
    ["Varenicline", "Chantix, generics", "Tobacco cessation", "Smoking cessation support", "Starter-pack and continuing-pack presentations must be matched."],
    ["Nicotine replacement transdermal patch", "Nicoderm CQ, generics", "Tobacco cessation", "Step-down nicotine replacement therapy", "Patch step strengths and package counts differ; OTC and Rx listings vary by plan."],
    ["Nicotine replacement gum", "Nicorette, generics", "Tobacco cessation", "On-demand nicotine replacement therapy", "2 mg and 4 mg pieces are distinct; package counts must be matched."],
    ["Nicotine replacement lozenge", "Commit, generics", "Tobacco cessation", "On-demand nicotine replacement therapy", "Lozenge is a distinct dosage form from gum; 2 mg and 4 mg strengths differ."],
    ["Ondansetron", "Zofran, generics", "Supportive care", "Nausea control during treatment visits and withdrawal support", "ODT tablet, regular tablet, and solution products differ."],
    ["Chlordiazepoxide", "Librium, generics", "Inpatient alcohol withdrawal protocol", "CIWA-based inpatient alcohol withdrawal management", "Inpatient protocol agent; scheduled-substance handling and setting restrictions apply."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
