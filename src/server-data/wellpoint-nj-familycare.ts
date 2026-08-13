/**
 * Bounded pulmonary extraction from Wellpoint New Jersey's current Medicaid
 * Preferred Drug List. The official source is a searchable PDF and publishes
 * product names, preferred status, and restriction notes. Omitted products are
 * unconfirmed, never treated as a denial.
 */

export const WELLPOINT_NJ_FAMILYCARE_SOURCE_URL =
  "https://fm.formularynavigator.com/FBO/4/New_Jersey_PDL_English.pdf";
export const WELLPOINT_NJ_FAMILYCARE_EFFECTIVE_DATE = "2026-05-01";
export const WELLPOINT_NJ_FAMILYCARE_PUBLISHED_DATE = "2026-08-05";

export type WellpointNjFamilyCareDrug = Readonly<{
  id: string;
  name: string;
  aliases: readonly string[];
  tier: "Preferred" | "Non-Preferred";
  priorAuthorization: boolean;
  quantityLimit: boolean;
  stepTherapy: boolean;
  specialtyPharmacy: boolean;
  ageLimit: boolean;
  note?: string;
}>;

const row = (
  id: string,
  name: string,
  aliases: readonly string[],
  tier: WellpointNjFamilyCareDrug["tier"],
  note = "",
): WellpointNjFamilyCareDrug => Object.freeze({
  id,
  name,
  aliases,
  tier,
  priorAuthorization: /\bPA\b/.test(note),
  quantityLimit: /\bQL\b/.test(note),
  stepTherapy: /\bST\b/.test(note),
  specialtyPharmacy: /\bSP\b/.test(note),
  ageLimit: /\bAL\b/.test(note),
  ...(note ? { note } : {}),
});

export const wellpointNjFamilyCareDrugs: readonly WellpointNjFamilyCareDrug[] = Object.freeze([
  row("breyna", "BREYNA inhalation aerosol", ["breyna", "budesonide formoterol"], "Preferred", "QL"),
  row("budesonide-formoterol", "Budesonide-formoterol fumarate inhalation aerosol", ["budesonide formoterol", "symbicort"], "Preferred", "QL"),
  row("combivent-respimat", "COMBIVENT RESPIMAT inhalation aerosol solution", ["combivent", "combivent respimat"], "Preferred", "QL"),
  row("fluticasone-salmeterol-100-50", "Fluticasone-salmeterol inhalation aerosol powder 100-50 mcg/act", ["fluticasone salmeterol 100 50", "wixela 100 50"], "Preferred", "QL"),
  row("fluticasone-salmeterol-113-14", "Fluticasone-salmeterol inhalation aerosol powder 113-14 mcg/act", ["fluticasone salmeterol 113 14"], "Preferred", "QL"),
  row("fluticasone-salmeterol-232-14", "Fluticasone-salmeterol inhalation aerosol powder 232-14 mcg/act", ["fluticasone salmeterol 232 14"], "Preferred", "QL"),
  row("fluticasone-salmeterol-250-50", "Fluticasone-salmeterol inhalation aerosol powder 250-50 mcg/act", ["fluticasone salmeterol 250 50", "wixela 250 50"], "Preferred", "QL"),
  row("fluticasone-salmeterol-500-50", "Fluticasone-salmeterol inhalation aerosol powder 500-50 mcg/act", ["fluticasone salmeterol 500 50", "wixela 500 50"], "Preferred", "AL; QL"),
  row("ipratropium-albuterol", "Ipratropium-albuterol inhalation solution", ["ipratropium albuterol", "duoneb"], "Preferred", "QL"),
  row("stiolto", "STIOLTO RESPIMAT inhalation aerosol solution", ["stiolto", "tiotropium olodaterol"], "Preferred", "QL"),
  row("umeclidinium-vilanterol", "Umeclidinium-vilanterol inhalation aerosol powder", ["umeclidinium vilanterol", "anoro ellipta"], "Preferred", "QL"),
  row("wixela-100-50", "WIXELA INHUB inhalation aerosol powder 100-50 mcg/act", ["wixela 100 50"], "Preferred", "QL"),
  row("wixela-250-50", "WIXELA INHUB inhalation aerosol powder 250-50 mcg/act", ["wixela 250 50"], "Preferred", "QL"),
  row("wixela-500-50", "WIXELA INHUB inhalation aerosol powder 500-50 mcg/act", ["wixela 500 50"], "Preferred", "AL; QL"),
  row("xolair", "XOLAIR subcutaneous solution", ["xolair", "omalizumab"], "Preferred", "PA; SP; QL"),
  row("albuterol-hfa", "Albuterol sulfate HFA inhalation aerosol solution", ["albuterol", "albuterol hfa", "ventolin hfa", "proair hfa"], "Preferred", "QL"),
  row("albuterol-nebulization", "Albuterol sulfate inhalation nebulization solution", ["albuterol nebulizer", "albuterol neb"], "Preferred", "QL"),
  row("albuterol-syrup", "Albuterol sulfate oral syrup", ["albuterol syrup"], "Preferred"),
  row("albuterol-tablet", "Albuterol sulfate oral tablet", ["albuterol tablet", "albuterol tablets"], "Preferred"),
  row("serevent", "SEREVENT DISKUS inhalation aerosol powder", ["serevent", "salmeterol"], "Preferred", "QL"),
  row("ipratropium-hfa", "Ipratropium bromide HFA inhalation aerosol solution", ["ipratropium hfa", "atrovent hfa"], "Preferred", "QL"),
  row("ipratropium-solution", "Ipratropium bromide inhalation solution", ["ipratropium nebulizer"], "Preferred", "QL"),
  row("spiriva-respimat", "SPIRIVA RESPIMAT inhalation aerosol solution", ["spiriva", "tiotropium"], "Preferred", "QL"),
  row("montelukast-packet", "Montelukast sodium oral packet", ["montelukast packet", "singulair packet"], "Preferred", "QL"),
  row("montelukast-tablet", "Montelukast sodium oral tablet", ["montelukast", "singulair"], "Preferred", "QL"),
  row("montelukast-chewable", "Montelukast sodium oral tablet chewable", ["montelukast chewable", "singulair chewable"], "Preferred", "QL"),
  row("roflumilast", "Roflumilast oral tablet", ["roflumilast", "daliresp"], "Preferred", "QL"),
  row("budesonide-nebulizer", "Budesonide inhalation suspension", ["budesonide nebulizer", "pulmicort"], "Preferred", "QL"),
  row("fluticasone-furoate", "Fluticasone furoate Ellipta inhalation aerosol powder", ["fluticasone furoate", "arnuity ellipta"], "Preferred", "QL"),
  row("fluticasone-propionate-diskus", "Fluticasone propionate Diskus inhalation aerosol powder", ["fluticasone diskus", "flovent diskus"], "Preferred", "QL"),
  row("fluticasone-propionate-hfa", "Fluticasone propionate HFA inhalation aerosol", ["fluticasone hfa", "flovent hfa"], "Preferred", "QL"),
  row("ambrisentan", "Ambrisentan oral tablet", ["ambrisentan", "letairis"], "Preferred", "PA; SP; QL"),
  row("sildenafil-pah", "Sildenafil citrate oral tablet", ["sildenafil", "revatio"], "Preferred", "PA; SP; QL"),
  row("tadalafil-pah", "Tadalafil (PAH) oral tablet", ["tadalafil pulmonary hypertension", "alyq", "adcirca"], "Preferred", "PA; SP; QL"),
]);

export const wellpointNjFamilyCareSource = Object.freeze({
  id: "wellpoint-nj-familycare-2026-pdl",
  name: "Wellpoint New Jersey Medicaid-Approved Preferred Drug List",
  url: WELLPOINT_NJ_FAMILYCARE_SOURCE_URL,
  effectiveDate: WELLPOINT_NJ_FAMILYCARE_EFFECTIVE_DATE,
  publishedDate: WELLPOINT_NJ_FAMILYCARE_PUBLISHED_DATE,
  extraction: "partial-pulmonary-pdf-extraction" as const,
  boundary: "Wellpoint NJ FamilyCare Medicaid only. This is a partial pulmonary extraction from the current PDL, not eligibility, cost, payment, or a complete all-drug formulary.",
});

const normalize = (value: string): string => value.normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "").toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/g, " ").trim();

const distance = (a: string, b: string): number => {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
};

export function autocompleteWellpointNjFamilyCare(query: string, limit = 12): readonly WellpointNjFamilyCareDrug[] {
  const needle = normalize(query);
  if (!needle) return Object.freeze([]);
  const tokens = needle.split(" ").filter((token) => token.length >= 3);
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 25);
  return Object.freeze(wellpointNjFamilyCareDrugs
    .map((drug) => {
      const haystack = [drug.name, ...drug.aliases].map(normalize);
      const exact = haystack.some((value) => value === needle);
      const tokenMatch = tokens.length > 0 && tokens.every((token) => haystack.some((value) => value.includes(token)));
      const fuzzy = !exact && !tokenMatch && haystack.some((value) => distance(needle, value) <= Math.max(2, Math.floor(needle.length / 5)));
      return exact || tokenMatch || fuzzy ? { drug, score: exact ? 0 : tokenMatch ? 1 : 2 } : null;
    })
    .filter((value): value is { drug: WellpointNjFamilyCareDrug; score: number } => value !== null)
    .sort((a, b) => a.score - b.score || a.drug.name.localeCompare(b.drug.name))
    .slice(0, safeLimit)
    .map(({ drug }) => drug));
}

export function lookupWellpointNjFamilyCare(id: string) {
  const drug = wellpointNjFamilyCareDrugs.find((candidate) => candidate.id === id) ?? null;
  return Object.freeze({
    status: drug ? "listed" as const : "not-listed-in-source" as const,
    source: wellpointNjFamilyCareSource,
    drug,
    notice: drug
      ? "Listed in the Wellpoint New Jersey Medicaid PDL. Confirm the member's exact benefit, current restrictions, and clinical criteria before prescribing."
      : "This product was not found in the extracted rows. This is unconfirmed, not a coverage denial.",
  });
}
