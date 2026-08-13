export const UHC_NJ_COMMUNITY_SOURCE_URL =
  "https://legacy.providerlookuponline.com/mrf/optumrx/drugs/2877216/JSON_Drugs_UHCCPNJ.json";

export const UHC_NJ_COMMUNITY_PLAN_ID = "UCSNJQ1";
export const UHC_NJ_COMMUNITY_YEAR = 2026;

export type UhcNjCommunityDrug = Readonly<{
  rxcui: string;
  drugName: string;
  tier: string;
  priorAuthorization: boolean;
  stepTherapy: boolean;
  quantityLimit: boolean;
}>;

export type UhcNjCommunitySource = Readonly<{
  name: "UnitedHealthcare Community Plan of New Jersey Medicaid formulary";
  planId: "UCSNJQ1";
  year: 2026;
  url: typeof UHC_NJ_COMMUNITY_SOURCE_URL;
  boundary: "Only the standard UHC Community Plan NJ Medicaid formulary. Not UHC employer, Individual/Family Marketplace, Medicare, Part D, alternate Medicaid programs, eligibility, cost, or payment.";
}>;

export type UhcNjCommunitySnapshot = Readonly<{
  drugs: readonly UhcNjCommunityDrug[];
  fetchedAt: string;
  responseLastModified: string | null;
  responseEtag: string | null;
}>;

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type RawPlan = Record<string, unknown>;
type RawDrug = Record<string, unknown>;

const DEFAULT_CACHE_MS = 6 * 60 * 60 * 1000;
const DEFAULT_TIMEOUT_MS = 20_000;
const MAX_BYTES = 32 * 1024 * 1024;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalized(value: string) {
  return value.toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/g, " ").trim();
}

function stringField(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function booleanField(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function isTargetAssociation(raw: RawPlan): raw is RawPlan {
  const years = Array.isArray(raw.years) ? raw.years : [];
  return raw.plan_id_type === "PLAN-ID" && raw.plan_id === UHC_NJ_COMMUNITY_PLAN_ID && years.includes(UHC_NJ_COMMUNITY_YEAR);
}

function parsePayload(payload: unknown, fetchedAt: string, responseLastModified: string | null, responseEtag: string | null): UhcNjCommunitySnapshot {
  if (!Array.isArray(payload) || payload.length === 0) throw new Error("UHC Community NJ source did not return a drug list.");
  const byRxcui = new Map<string, UhcNjCommunityDrug>();
  for (const raw of payload) {
    if (!isRecord(raw)) continue;
    const rxcui = stringField(raw.rxnorm_id);
    const drugName = stringField(raw.drug_name);
    const plans = Array.isArray(raw.plans) ? raw.plans.filter(isRecord) : [];
    if (!/^\d+$/.test(rxcui) || !drugName) continue;
    for (const plan of plans) {
      if (!isTargetAssociation(plan)) continue;
      const tier = stringField(plan.drug_tier);
      const priorAuthorization = booleanField(plan.prior_authorization);
      const stepTherapy = booleanField(plan.step_therapy);
      const quantityLimit = booleanField(plan.quantity_limit);
      if (!tier || priorAuthorization === null || stepTherapy === null || quantityLimit === null) continue;
      byRxcui.set(rxcui, Object.freeze({ rxcui, drugName, tier, priorAuthorization, stepTherapy, quantityLimit }));
      break;
    }
  }
  if (!byRxcui.size) throw new Error("UHC Community NJ source had no complete 2026 standard-plan records.");
  return Object.freeze({
    drugs: Object.freeze(Array.from(byRxcui.values()).sort((a, b) => a.drugName.localeCompare(b.drugName))),
    fetchedAt,
    responseLastModified,
    responseEtag,
  });
}

export class UhcNjCommunityAdapter {
  private cached: { expiresAt: number; snapshot: UhcNjCommunitySnapshot } | null = null;
  private pending: Promise<UhcNjCommunitySnapshot> | null = null;

  constructor(private readonly options: Readonly<{ fetchImpl?: FetchLike; now?: () => number; cacheMs?: number; timeoutMs?: number }> = {}) {}

  async load(): Promise<UhcNjCommunitySnapshot> {
    const now = this.options.now?.() ?? Date.now();
    if (this.cached && this.cached.expiresAt > now) return this.cached.snapshot;
    if (!this.pending) {
      this.pending = this.fetchAndParse().then((snapshot) => {
        this.cached = { snapshot, expiresAt: now + (this.options.cacheMs ?? DEFAULT_CACHE_MS) };
        return snapshot;
      }).finally(() => { this.pending = null; });
    }
    return this.pending;
  }

  private async fetchAndParse(): Promise<UhcNjCommunitySnapshot> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
    try {
      const response = await (this.options.fetchImpl ?? fetch)(UHC_NJ_COMMUNITY_SOURCE_URL, { signal: controller.signal, headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`UHC Community NJ source returned HTTP ${response.status}.`);
      const contentLength = Number(response.headers.get("content-length"));
      if (Number.isFinite(contentLength) && contentLength > MAX_BYTES) throw new Error("UHC Community NJ source exceeds the size limit.");
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.byteLength > MAX_BYTES) throw new Error("UHC Community NJ source exceeds the size limit.");
      let payload: unknown;
      try { payload = JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new Error("UHC Community NJ source returned invalid JSON."); }
      return parsePayload(payload, new Date().toISOString(), response.headers.get("last-modified"), response.headers.get("etag"));
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const uhcNjCommunitySource = (): UhcNjCommunitySource => Object.freeze({
  name: "UnitedHealthcare Community Plan of New Jersey Medicaid formulary",
  planId: UHC_NJ_COMMUNITY_PLAN_ID,
  year: UHC_NJ_COMMUNITY_YEAR,
  url: UHC_NJ_COMMUNITY_SOURCE_URL,
  boundary: "Only the standard UHC Community Plan NJ Medicaid formulary. Not UHC employer, Individual/Family Marketplace, Medicare, Part D, alternate Medicaid programs, eligibility, cost, or payment.",
});

export function autocompleteUhcNjCommunity(snapshot: UhcNjCommunitySnapshot, query: string, limit = 12) {
  const needle = normalized(query);
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 25);
  if (!needle) return Object.freeze([] as UhcNjCommunityDrug[]);
  const tokens = needle.split(" ").filter((token) => token.length >= 3);
  const matches = snapshot.drugs
    .map((drug) => {
      const name = normalized(drug.drugName);
      const score = name.includes(needle) ? 0 : tokens.some((token) => name.includes(token)) ? 1 : null;
      return score === null ? null : { drug, score };
    })
    .filter((match): match is { drug: UhcNjCommunityDrug; score: number } => match !== null)
    .sort((left, right) => left.score - right.score || left.drug.drugName.localeCompare(right.drug.drugName))
    .map((match) => match.drug);
  return Object.freeze(matches.slice(0, safeLimit));
}

export function lookupUhcNjCommunity(snapshot: UhcNjCommunitySnapshot, rxcui: string) {
  const match = snapshot.drugs.find((drug) => drug.rxcui === rxcui) ?? null;
  return Object.freeze({
    status: match ? "listed" as const : "not-listed-in-source" as const,
    source: uhcNjCommunitySource(),
    drug: match,
    sourceRetrievedAt: snapshot.fetchedAt,
    sourceLastModified: snapshot.responseLastModified,
  });
}
