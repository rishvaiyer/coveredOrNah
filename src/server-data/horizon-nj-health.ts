/**
 * Pulmonary products transcribed from Horizon NJ Health's current approved
 * Prescription Drug Listing. The source is a searchable PDF, so this remains
 * a bounded pulmonary extraction rather than a claim that every drug is
 * represented here.
 */

export const HORIZON_NJ_HEALTH_SOURCE_URL =
  "https://www.horizonnjhealth.com/securecms-documents/368/formulary_english.pdf";
export const HORIZON_NJ_HEALTH_SOURCE_ID = "horizon-nj-health-2026-formulary";
export const HORIZON_NJ_HEALTH_EFFECTIVE_DATE = "2026-07-01";

export type HorizonNjHealthDrug = Readonly<{
  id: string;
  name: string;
  aliases: readonly string[];
  priorAuthorization: boolean;
  limitations: boolean;
  note?: string;
}>;

const row = (
  id: string,
  name: string,
  aliases: readonly string[],
  priorAuthorization: boolean,
  limitations: boolean,
  note?: string,
): HorizonNjHealthDrug => Object.freeze({ id, name, aliases, priorAuthorization, limitations, note });

export const horizonNjHealthDrugs: readonly HorizonNjHealthDrug[] = Object.freeze([
  row("airduo", "AIRDUO (generic only)", ["airduo", "fluticasone salmeterol airduo"], false, true),
  row("albuterol-sulfate", "Albuterol sulfate", ["albuterol", "albuterol sulfate"], false, true),
  row("albuterol-sulfate-hfa", "Albuterol sulfate HFA", ["albuterol hfa", "ventolin hfa", "proair hfa", "proventil hfa"], false, true),
  row("ambrisentan", "Ambrisentan", ["ambrisentan", "letairis"], true, true),
  row("arformoterol", "Arformoterol", ["arformoterol", "brovana"], false, true),
  row("bosentan", "Bosentan", ["bosentan", "tracleer"], true, true),
  row("budesonide-formoterol", "Budesonide/formoterol", ["budesonide formoterol", "symbicort"], false, true),
  row("budesonide-nebulizer", "Budesonide nebulizer solution", ["budesonide nebulizer", "pulmicort nebulizer", "pulmicort respules"], false, true),
  row("combivent", "COMBIVENT", ["combivent", "ipratropium albuterol"], false, true),
  row("fluticasone", "Fluticasone", ["fluticasone", "flonase"], false, true),
  row("fluticasone-diskus", "Fluticasone diskus", ["fluticasone diskus", "flovent diskus"], false, true),
  row("fluticasone-hfa", "Fluticasone HFA", ["fluticasone hfa", "flovent hfa"], false, true),
  row("fluticasone-salmeterol-diskus", "Fluticasone/salmeterol diskus", ["fluticasone salmeterol", "advair diskus", "airduo"], false, true),
  row("ipratropium", "Ipratropium", ["ipratropium", "atrovent"], false, true),
  row("ipratropium-albuterol", "Ipratropium/albuterol", ["ipratropium albuterol", "duoneb"], false, true),
  row("montelukast", "Montelukast", ["montelukast", "singulair"], false, true),
  row("sildenafil-pah", "Sildenafil 20mg tablet", ["sildenafil", "sildenafil pulmonary hypertension", "revatio"], true, true),
  row("tadalafil", "Tadalafil 20mg", ["tadalafil", "adcirca"], false, false),
  row("tezspire", "TEZSPIRE", ["tezspire", "tezepelumab"], true, true),
  row("tiotropium", "Tiotropium", ["tiotropium", "spiriva"], false, true),
  row("treprostinil", "Treprostinil injection", ["treprostinil", "remodulin"], true, false),
  row("xolair", "XOLAIR", ["xolair", "omalizumab"], true, false),
]);

export type HorizonNjHealthSource = Readonly<{
  id: typeof HORIZON_NJ_HEALTH_SOURCE_ID;
  name: "Horizon NJ Health 2026 Prescription Drug Listing";
  url: typeof HORIZON_NJ_HEALTH_SOURCE_URL;
  effectiveDate: typeof HORIZON_NJ_HEALTH_EFFECTIVE_DATE;
  extraction: "partial-pulmonary-pdf-extraction";
  boundary: string;
}>;

export const horizonNjHealthSource: HorizonNjHealthSource = Object.freeze({
  id: HORIZON_NJ_HEALTH_SOURCE_ID,
  name: "Horizon NJ Health 2026 Prescription Drug Listing",
  url: HORIZON_NJ_HEALTH_SOURCE_URL,
  effectiveDate: HORIZON_NJ_HEALTH_EFFECTIVE_DATE,
  extraction: "partial-pulmonary-pdf-extraction",
  boundary: "Horizon NJ Health NJ FamilyCare Medicaid only. This is a partial pulmonary extraction from the current approved drug listing, not eligibility, cost, payment, or a complete all-drug formulary.",
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

export function autocompleteHorizonNjHealth(query: string, limit = 12): readonly HorizonNjHealthDrug[] {
  const needle = normalize(query);
  if (!needle) return Object.freeze([]);
  const tokens = needle.split(" ").filter((token) => token.length >= 3);
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 25);
  return Object.freeze(horizonNjHealthDrugs
    .map((drug) => {
      const haystack = [drug.name, ...drug.aliases].map(normalize);
      const exact = haystack.some((value) => value === needle);
      const tokenMatch = tokens.length > 0 && tokens.every((token) => haystack.some((value) => value.includes(token)));
      const fuzzy = !exact && !tokenMatch && haystack.some((value) => distance(needle, value) <= Math.max(2, Math.floor(needle.length / 5)));
      return exact || tokenMatch || fuzzy ? { drug, score: exact ? 0 : tokenMatch ? 1 : 2 } : null;
    })
    .filter((value): value is { drug: HorizonNjHealthDrug; score: number } => value !== null)
    .sort((a, b) => a.score - b.score || a.drug.name.localeCompare(b.drug.name))
    .slice(0, safeLimit)
    .map(({ drug }) => drug));
}

export function lookupHorizonNjHealth(id: string) {
  const drug = horizonNjHealthDrugs.find((candidate) => candidate.id === id) ?? null;
  return Object.freeze({
    status: drug ? "listed" as const : "not-listed-in-source" as const,
    source: horizonNjHealthSource,
    drug,
    notice: drug
      ? "Listed in the Horizon NJ Health 2026 Prescription Drug Listing. Confirm the member's exact benefit, current restrictions, and clinical criteria before prescribing."
      : "This product was not found in the extracted rows. This is unconfirmed, not a coverage denial.",
  });
}
