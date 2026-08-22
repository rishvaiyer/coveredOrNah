import type { ClinicCatalog } from "./catalogTypes";

export const sleepMedicineCatalog: ClinicCatalog = {
  slug: "sleep-medicine",
  name: "Sleep Medicine Starter Catalog",
  specialty: "Sleep medicine",
  status: "starter",
  medications: [
    ["Modafinil", "Provigil", "Excessive daytime sleepiness", "Narcolepsy, obstructive sleep apnea residual sleepiness, shift work disorder", "Generic tablets are stable; strength must be matched."],
    ["Armodafinil", "Nuvigil", "Excessive daytime sleepiness", "Narcolepsy, obstructive sleep apnea residual sleepiness, shift work disorder", "Distinct R-enantiomer product from modafinil; strengths differ."],
    ["Solriamfetol", "Sunosi", "Excessive daytime sleepiness", "Narcolepsy and obstructive sleep apnea residual sleepiness", "Brand-only tablet; strength tiers drive coverage."],
    ["Pitolisant", "Wakix", "Excessive daytime sleepiness", "Narcolepsy with or without cataplexy", "Brand-only; titration schedule and prior authorization are common."],
    ["Sodium oxybate", "Xywav", "Central hypersomnia therapy", "Narcolepsy with cataplexy and idiopathic hypersomnia", "REMS-restricted central pharmacy dispensing; lower-sodium formulation is distinct."],
    ["Zolpidem immediate-release", "Ambien", "Insomnia", "Sleep-onset insomnia", "Immediate-release tablets; generic supply is stable."],
    ["Zolpidem extended-release", "Ambien CR", "Insomnia", "Sleep onset and sleep maintenance insomnia", "Extended-release layer is clinically distinct from IR."],
    ["Zolpidem orally disintegrating", "Edluar, Zolpimist", "Insomnia", "Sleep-onset insomnia where swallowing tablets is difficult", "ODT tablet and sublingual spray products are distinct SKUs."],
    ["Eszopiclone", "Lunesta", "Insomnia", "Sleep onset and sleep maintenance insomnia", "Generic tablets; scored 3 mg strength matters."],
    ["Zaleplon", "Sonata", "Insomnia", "Short-acting sleep-onset insomnia", "Capsules; very short half-life distinguishes it from other Z-drugs."],
    ["Ramelteon", "Rozerem", "Insomnia", "Sleep-onset insomnia via melatonin receptor agonism", "Brand-only tablet; no controlled-substance scheduling."],
    ["Suvorexant", "Belsomra", "Insomnia", "Sleep onset and sleep maintenance insomnia", "Dual orexin receptor antagonist; dose tiers drive coverage."],
    ["Lemborexant", "Dayvigo", "Insomnia", "Sleep onset and sleep maintenance insomnia", "Dual orexin receptor antagonist; two strengths available."],
    ["Doxepin low-dose", "Silenor", "Insomnia", "Sleep maintenance insomnia at hypnotic doses", "Low-milligram sleep indication is distinct from antidepressant doxepin."],
    ["Trazodone", "Desyrel", "Off-label sleep aid", "Commonly used off-label for insomnia", "Framing kept neutral; tablets and strengths vary by supplier."],
    ["Clonidine extended-release", "Kapvay", "ADHD agent used off-label for pediatric sleep support", "Used off-label for pediatric insomnia when indicated by specialist", "Extended-release product only; immediate-release forms are distinct."],
  ].map(([generic, brands, category, commonUses, productDetails]) => ({ generic, brands, category, commonUses, productDetails })),
};
