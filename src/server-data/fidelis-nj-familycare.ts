/**
 * High-confidence pulmonary rows transcribed from Fidelis Care's current
 * New Jersey FamilyCare PDL (updated August 2026).
 *
 * The source is a searchable PDF rather than a trustworthy current machine
 * readable feed. This intentionally stays a partial, source-backed fixture:
 * an omitted product is unconfirmed, never a denial.
 */

export const FIDELIS_NJ_FAMILYCARE_SOURCE_URL =
  "https://www.fideliscarenj.com/content/dam/centene/wellcare/nj/pdfs/pdls/NJ_Caid_Preferred_Drug_List_2026_Eng_Spa_R.pdf";

export const FIDELIS_NJ_FAMILYCARE_SOURCE_ID = "fidelis-nj-familycare-2026-pdl";
export const FIDELIS_NJ_FAMILYCARE_EFFECTIVE_DATE = "2026-08-01";

export type FidelisNjFamilyCareDrug = Readonly<{
  id: string;
  name: string;
  aliases: readonly string[];
  tier: "P" | "NF";
  priorAuthorization: boolean;
  stepTherapy: boolean;
  quantityLimit: boolean;
  ageLimit: boolean;
  quantityText?: string;
  ageText?: string;
  note?: string;
}>;

const row = (
  id: string,
  name: string,
  aliases: readonly string[],
  tier: FidelisNjFamilyCareDrug["tier"],
  restrictions: Pick<FidelisNjFamilyCareDrug, "priorAuthorization" | "stepTherapy" | "quantityLimit" | "ageLimit"> & Partial<Pick<FidelisNjFamilyCareDrug, "quantityText" | "ageText" | "note">>,
): FidelisNjFamilyCareDrug => Object.freeze({ id, name, aliases, tier, ...restrictions });

export const fidelisNjFamilyCareDrugs: readonly FidelisNjFamilyCareDrug[] = Object.freeze([
  row("albuterol-hfa", "Albuterol sulfate HFA aerosol", ["albuterol", "albuterol hfa", "proair hfa", "proventil hfa", "ventolin hfa"], "P", { priorAuthorization: false, stepTherapy: false, quantityLimit: true, ageLimit: false, quantityText: "2 packages per fill retail", note: "Ventolin HFA and Proventil HFA are listed as NF brand entries." }),
  row("albuterol-nebu-063-125", "Albuterol sulfate nebulizer 0.63 mg/3 mL or 1.25 mg/3 mL", ["albuterol nebulizer", "albuterol neb", "accuneb"], "P", { priorAuthorization: false, stepTherapy: false, quantityLimit: true, ageLimit: false, quantityText: "300 mL per 31 days retail" }),
  row("albuterol-nebu-083", "Albuterol sulfate nebulizer 0.083%", ["albuterol nebulizer 0.083", "albuterol 2.5 mg 3 ml"], "P", { priorAuthorization: false, stepTherapy: false, quantityLimit: true, ageLimit: false, quantityText: "720 mL per 31 days retail" }),
  row("albuterol-syrup", "Albuterol sulfate syrup", ["albuterol syrup"], "P", { priorAuthorization: false, stepTherapy: false, quantityLimit: true, ageLimit: false, quantityText: "80 mL daily" }),
  row("albuterol-tablets", "Albuterol sulfate tablets", ["albuterol tablets"], "P", { priorAuthorization: false, stepTherapy: false, quantityLimit: false, ageLimit: false }),
  row("budesonide-nebu", "Budesonide inhalation suspension", ["budesonide nebulizer", "pulmicort suspension"], "P", { priorAuthorization: false, stepTherapy: false, quantityLimit: true, ageLimit: true, quantityText: "4 mL daily", ageText: "Up to 8 years old" }),
  row("budesonide-formoterol", "Budesonide-formoterol fumarate dihydrate", ["budesonide formoterol", "symbicort"], "P", { priorAuthorization: false, stepTherapy: false, quantityLimit: true, ageLimit: true, quantityText: "10.2 g per 30 days retail", ageText: "Up to 12 years old", note: "Symbicort is listed as NF brand." }),
  row("fluticasone-furoate", "Fluticasone furoate inhalation", ["fluticasone furoate", "arnuity ellipta"], "P", { priorAuthorization: false, stepTherapy: false, quantityLimit: true, ageLimit: false, quantityText: "30 each per 30 days retail and mail" }),
  row("fluticasone-propionate-hfa", "Fluticasone propionate HFA", ["flovent hfa", "fluticasone hfa"], "P", { priorAuthorization: false, stepTherapy: false, quantityLimit: true, ageLimit: true, quantityText: "10.6 g per 31 days retail", ageText: "Up to 12 years old", note: "Flovent HFA 44 mcg is listed as NF brand." }),
  row("fluticasone-salmeterol", "Fluticasone-salmeterol inhalation", ["fluticasone salmeterol", "advair diskus", "airduo respiclick"], "P", { priorAuthorization: false, stepTherapy: false, quantityLimit: true, ageLimit: true, quantityText: "1 each per 31 days retail", ageText: "At least 12 years old", note: "Advair Diskus and AirDuo brand entries are listed as NF." }),
  row("qvar-redihaler", "QVAR RediHaler", ["qvar", "beclomethasone"], "P", { priorAuthorization: false, stepTherapy: false, quantityLimit: true, ageLimit: false, quantityText: "10.6 g per 31 days retail" }),
  row("ipratropium-albuterol", "Ipratropium-albuterol nebulizer solution", ["ipratropium albuterol", "duoneb", "combivent"], "P", { priorAuthorization: false, stepTherapy: false, quantityLimit: true, ageLimit: false, quantityText: "720 mL per 31 days retail", note: "Combivent Respimat is a separate NF brand entry." }),
  row("levalbuterol", "Levalbuterol tartrate", ["levalbuterol", "xopenex"], "P", { priorAuthorization: false, stepTherapy: false, quantityLimit: true, ageLimit: false, quantityText: "30 g per 31 days retail", note: "Xopenex HFA is listed as NF brand." }),
  row("montelukast", "Montelukast sodium", ["montelukast", "singulair"], "P", { priorAuthorization: false, stepTherapy: false, quantityLimit: true, ageLimit: false, quantityText: "1 each daily" }),
  row("roflumilast", "Roflumilast", ["roflumilast", "daliresp"], "P", { priorAuthorization: false, stepTherapy: false, quantityLimit: true, ageLimit: false, quantityText: "1 each daily", note: "Daliresp is listed as NF brand." }),
  row("tiotropium", "Spiriva HandiHaler", ["spiriva", "tiotropium"], "NF", { priorAuthorization: false, stepTherapy: false, quantityLimit: false, ageLimit: false }),
  row("cinqair", "Cinqair", ["reslizumab"], "P", { priorAuthorization: true, stepTherapy: false, quantityLimit: false, ageLimit: false }),
  row("xolair", "Xolair", ["omalizumab"], "P", { priorAuthorization: true, stepTherapy: false, quantityLimit: false, ageLimit: false }),
  row("ambrisentan", "Ambrisentan", ["ambrisentan", "letairis", "pulmonary hypertension"], "P", { priorAuthorization: true, stepTherapy: false, quantityLimit: true, ageLimit: true, quantityText: "1 each daily", ageText: "At least 18 years old", note: "Letairis is listed as NF brand." }),
  row("sildenafil-pah", "Sildenafil citrate for pulmonary hypertension", ["sildenafil pulmonary hypertension", "revatio", "pulmonary hypertension"], "P", { priorAuthorization: true, stepTherapy: false, quantityLimit: true, ageLimit: false, quantityText: "3 each daily", note: "Revatio is listed as NF brand." }),
  row("tadalafil-pah", "Tadalafil for pulmonary hypertension", ["tadalafil pulmonary hypertension", "adcirca", "pulmonary hypertension"], "P", { priorAuthorization: true, stepTherapy: false, quantityLimit: false, ageLimit: false, note: "Adcirca is listed as NF brand." }),
]);

export type FidelisNjFamilyCareSource = Readonly<{
  id: typeof FIDELIS_NJ_FAMILYCARE_SOURCE_ID;
  name: "Fidelis Care New Jersey FamilyCare Medicaid 2026 PDL";
  url: typeof FIDELIS_NJ_FAMILYCARE_SOURCE_URL;
  effectiveDate: typeof FIDELIS_NJ_FAMILYCARE_EFFECTIVE_DATE;
  extraction: "partial-pulmonary-pdf-extraction";
  boundary: string;
}>;

export const fidelisNjFamilyCareSource: FidelisNjFamilyCareSource = Object.freeze({
  id: FIDELIS_NJ_FAMILYCARE_SOURCE_ID,
  name: "Fidelis Care New Jersey FamilyCare Medicaid 2026 PDL",
  url: FIDELIS_NJ_FAMILYCARE_SOURCE_URL,
  effectiveDate: FIDELIS_NJ_FAMILYCARE_EFFECTIVE_DATE,
  extraction: "partial-pulmonary-pdf-extraction",
  boundary: "NJ FamilyCare Medicaid Fidelis/WellCare PDL only. Not Fidelis Marketplace, Medicare, Part D, eligibility, cost, or payment.",
});

function normalize(value: string): string {
  return value.normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "").toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/g, " ").trim();
}

function distance(a: string, b: string): number {
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
}

export function autocompleteFidelisNjFamilyCare(query: string, limit = 12): readonly FidelisNjFamilyCareDrug[] {
  const needle = normalize(query);
  if (!needle) return Object.freeze([]);
  const tokens = needle.split(" ").filter((token) => token.length >= 3);
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 25);
  return Object.freeze(fidelisNjFamilyCareDrugs
    .map((drug) => {
      const haystack = [drug.name, ...drug.aliases].map(normalize);
      const exact = haystack.some((value) => value === needle);
      const tokenMatch = tokens.length > 0 && tokens.every((token) => haystack.some((value) => value.includes(token)));
      const fuzzy = !exact && !tokenMatch && haystack.some((value) => distance(needle, value) <= Math.max(2, Math.floor(needle.length / 5)));
      return exact || tokenMatch || fuzzy ? { drug, score: exact ? 0 : tokenMatch ? 1 : 2 } : null;
    })
    .filter((value): value is { drug: FidelisNjFamilyCareDrug; score: number } => value !== null)
    .sort((a, b) => a.score - b.score || a.drug.name.localeCompare(b.drug.name))
    .slice(0, safeLimit)
    .map(({ drug }) => drug));
}

export function lookupFidelisNjFamilyCare(id: string) {
  const drug = fidelisNjFamilyCareDrugs.find((candidate) => candidate.id === id) ?? null;
  return Object.freeze({
    status: drug ? "listed" as const : "not-listed-in-source" as const,
    source: fidelisNjFamilyCareSource,
    drug,
    notice: drug
      ? "Listed in the Fidelis NJ FamilyCare 2026 PDL. Confirm the member's exact benefit, current restrictions, and clinical criteria before prescribing."
      : "This product was not found in the extracted rows. This is unconfirmed, not a coverage denial.",
  });
}
