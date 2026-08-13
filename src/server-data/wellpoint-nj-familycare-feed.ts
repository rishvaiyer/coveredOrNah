/**
 * Full current Wellpoint NJ FamilyCare machine-readable formulary adapter.
 * The public Wellpoint page links this JSON feed and its PDF. The adapter
 * validates the payer identity and date before returning any product result.
 */

export const WELLPOINT_NJ_FAMILYCARE_FEED_URL =
  "https://fm.formularynavigator.com/FBO/4/New%20Jersey%20Medicaid.json";
export const WELLPOINT_NJ_FAMILYCARE_FEED_ID = "wellpoint-nj-familycare-2026-json";

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export type WellpointFeedDrug = Readonly<{
  ndc: string;
  drugName: string;
  drugTier: string;
  priorAuthorization: boolean;
  stepTherapy: boolean;
  quantityLimit: boolean;
  otc: boolean;
}>;

type Product = Readonly<{
  id: string;
  name: string;
  aliases: readonly string[];
  rows: readonly WellpointFeedDrug[];
}>;

export type WellpointNjFamilyCareFeed = Readonly<{
  profile: Readonly<{
    publicName: string;
    state: string;
    formularyName: string;
    formularyId: number;
    formularyVersion: number;
    effectiveDate: string;
  }>;
  drugs: readonly WellpointFeedDrug[];
  products: readonly Product[];
  fetchedAt: string;
  responseBytes: number;
  responseLastModified: string | null;
}>;

export type WellpointFeedErrorCode = "HTTP_ERROR" | "INVALID_JSON" | "INVALID_SCHEMA" | "NETWORK_ERROR" | "RESPONSE_TOO_LARGE" | "TIMEOUT";

export class WellpointFeedError extends Error {
  constructor(readonly code: WellpointFeedErrorCode, message: string) {
    super(message);
    this.name = "WellpointFeedError";
  }
}

const normalize = (value: string): string => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/g, " ").trim();

function assertObject(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new WellpointFeedError("INVALID_SCHEMA", `Expected object at ${path}.`);
  return value as Record<string, unknown>;
}

function stringValue(value: unknown, path: string): string {
  if (typeof value !== "string" || !value.trim()) throw new WellpointFeedError("INVALID_SCHEMA", `Expected non-empty string at ${path}.`);
  return value.trim();
}

function booleanValue(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") throw new WellpointFeedError("INVALID_SCHEMA", `Expected boolean at ${path}.`);
  return value;
}

function integerValue(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) throw new WellpointFeedError("INVALID_SCHEMA", `Expected integer at ${path}.`);
  return value;
}

function dateValue(value: unknown, path: string): string {
  const raw = stringValue(value, path);
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw);
  if (!match) throw new WellpointFeedError("INVALID_SCHEMA", `Expected MM/DD/YYYY at ${path}.`);
  return `${match[3]}-${match[1]}-${match[2]}`;
}

function parseFeed(raw: unknown, responseBytes: number, fetchedAt: string, responseLastModified: string | null): WellpointNjFamilyCareFeed {
  const root = assertObject(raw, "root");
  const profileRaw = assertObject(root.Profile_Information, "Profile_Information");
  const profile = {
    publicName: stringValue(profileRaw.public_name, "Profile_Information.public_name"),
    state: stringValue(profileRaw.state, "Profile_Information.state"),
    formularyName: stringValue(profileRaw.formulary_name, "Profile_Information.formulary_name"),
    formularyId: integerValue(profileRaw.formulary_id, "Profile_Information.formulary_id"),
    formularyVersion: integerValue(profileRaw.formulary_version, "Profile_Information.formulary_version"),
    effectiveDate: dateValue(profileRaw.formulary_effective_date, "Profile_Information.formulary_effective_date"),
  };
  if (profile.state !== "NEW JERSEY" || profile.publicName !== "New Jersey Medicaid") {
    throw new WellpointFeedError("INVALID_SCHEMA", "The feed is not the Wellpoint New Jersey Medicaid formulary.");
  }
  const rawDrugs = root.Drug_Information;
  if (!Array.isArray(rawDrugs) || rawDrugs.length === 0) throw new WellpointFeedError("INVALID_SCHEMA", "Drug_Information is empty or invalid.");
  const drugs = rawDrugs.map((value, index) => {
    const row = assertObject(value, `Drug_Information[${index}]`);
    const ndc = stringValue(row.ndc, `Drug_Information[${index}].ndc`);
    if (!/^\d{11}$/.test(ndc)) throw new WellpointFeedError("INVALID_SCHEMA", `Invalid NDC at Drug_Information[${index}].ndc.`);
    return Object.freeze({
      ndc,
      drugName: stringValue(row.ndc_label_name, `Drug_Information[${index}].ndc_label_name`),
      drugTier: stringValue(row.drug_tier, `Drug_Information[${index}].drug_tier`),
      priorAuthorization: booleanValue(row.prior_authorization, `Drug_Information[${index}].prior_authorization`),
      stepTherapy: booleanValue(row.step_therapy, `Drug_Information[${index}].step_therapy`),
      quantityLimit: booleanValue(row.quantity_limit, `Drug_Information[${index}].quantity_limit`),
      otc: booleanValue(row.otc, `Drug_Information[${index}].otc`),
    });
  });
  const groups = new Map<string, { name: string; rows: WellpointFeedDrug[] }>();
  for (const drug of drugs) {
    const key = normalize(drug.drugName);
    const group = groups.get(key);
    if (group) group.rows.push(drug);
    else groups.set(key, { name: drug.drugName, rows: [drug] });
  }
  const products = Array.from(groups, ([key, group]) => Object.freeze({
    id: `wellpoint-${key.replace(/[^a-z0-9]+/g, "-")}`,
    name: group.name,
    aliases: Object.freeze([] as string[]),
    rows: Object.freeze(group.rows.slice()),
  }));
  return Object.freeze({ profile: Object.freeze(profile), drugs: Object.freeze(drugs), products: Object.freeze(products), fetchedAt, responseBytes, responseLastModified });
}

export type FetchWellpointFeedOptions = { fetchImpl?: FetchLike; timeoutMs?: number; maxBytes?: number; now?: () => Date };

export async function fetchWellpointNjFamilyCareFeed(options: FetchWellpointFeedOptions = {}): Promise<WellpointNjFamilyCareFeed> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? 30_000;
  const maxBytes = options.maxBytes ?? 64 * 1024 * 1024;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let response: Response;
    try {
      response = await fetchImpl(WELLPOINT_NJ_FAMILYCARE_FEED_URL, { signal: controller.signal, headers: { Accept: "application/json" } });
    } catch (error) {
      if ((error as { name?: string }).name === "AbortError") throw new WellpointFeedError("TIMEOUT", "Wellpoint feed request timed out.");
      throw new WellpointFeedError("NETWORK_ERROR", "Unable to reach the Wellpoint feed.");
    }
    if (!response.ok) throw new WellpointFeedError("HTTP_ERROR", `Wellpoint feed returned HTTP ${response.status}.`);
    const contentLength = Number(response.headers.get("content-length") ?? "0");
    if (contentLength > maxBytes) throw new WellpointFeedError("RESPONSE_TOO_LARGE", "Wellpoint feed exceeded the size limit.");
    const text = await response.text();
    const responseBytes = new TextEncoder().encode(text).byteLength;
    if (responseBytes > maxBytes) throw new WellpointFeedError("RESPONSE_TOO_LARGE", "Wellpoint feed exceeded the size limit.");
    let raw: unknown;
    try { raw = JSON.parse(text); } catch { throw new WellpointFeedError("INVALID_JSON", "Wellpoint feed returned invalid JSON."); }
    return parseFeed(raw, responseBytes, (options.now ?? (() => new Date()))().toISOString(), response.headers.get("last-modified"));
  } finally {
    clearTimeout(timeout);
  }
}

const distance = (a: string, b: string): number => {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j += 1) { const current = row[j]; row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1)); previous = current; }
  }
  return row[b.length];
};

export function autocompleteWellpointFeed(feed: WellpointNjFamilyCareFeed, query: string, limit = 12): readonly Product[] {
  const needle = normalize(query); if (!needle) return Object.freeze([]);
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 25);
  return Object.freeze(feed.products.map((product) => {
    const name = normalize(product.name); const exact = name === needle; const contains = name.includes(needle); const fuzzy = !exact && !contains && distance(needle, name) <= Math.max(2, Math.floor(needle.length / 5));
    return exact || contains || fuzzy ? { product, score: exact ? 0 : contains ? 1 : 2 } : null;
  }).filter((value): value is { product: Product; score: number } => value !== null).sort((a, b) => a.score - b.score || a.product.name.localeCompare(b.product.name)).slice(0, safeLimit).map(({ product }) => product));
}

export function lookupWellpointFeedProduct(feed: WellpointNjFamilyCareFeed, id: string) {
  const product = feed.products.find((candidate) => candidate.id === id) ?? null;
  return Object.freeze({ status: product ? "listed" as const : "not-listed-in-source" as const, product, source: feed.profile, notice: product ? "Listed in the current Wellpoint New Jersey Medicaid machine-readable formulary. Confirm the member's exact benefit and current clinical criteria before prescribing." : "This product was not found in the source. This is unconfirmed, not a coverage denial." });
}
