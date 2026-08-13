export const UHC_NJ_QHP_MANIFEST_URL = "https://providermrf.uhc.com/api/files/ui/ifp/";
export const UHC_NJ_QHP_SCOPE = "UnitedHealthcare Individual & Family ACA Marketplace QHP, New Jersey, plan year 2026 only";
export const UHC_NJ_QHP_BOUNDARY = "Not UnitedHealthcare employer, commercial group, Medicare, Medicaid, member eligibility, or a guarantee of payment.";

const UHC_NJ_ISSUER_ID = "37777";
const PLAN_YEAR = 2026;
const PLAN_FILENAME = "JSON_PLANS_NJ.json";
const DRUG_FILENAME = "JSON_Drugs_UHCNJEX_HIX.json";
const ALLOWED_SOURCE_HOSTS = new Set(["providermrf.uhc.com", "legacy.providerlookuponline.com"]);
const DEFAULT_TIMEOUT_MS = 20_000;
const DEFAULT_CACHE_TTL_MS = 6 * 60 * 60 * 1_000;
const DEFAULT_STALE_IF_ERROR_MS = 24 * 60 * 60 * 1_000;
const MANIFEST_MAX_BYTES = 2 * 1024 * 1024;
const PLAN_MAX_BYTES = 2 * 1024 * 1024;
const DRUG_MAX_BYTES = 25 * 1024 * 1024;
const MAX_REDIRECTS = 3;

export type UhcNjQhpFetch = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type JsonObject = Record<string, unknown>;

type ManifestEntry = {
  name: string;
  date?: string;
  blobPath?: string;
  url?: string;
  isExternal?: boolean;
};

export type UhcNjQhpPlan = {
  planId: string;
  marketingName: string;
  years: number[];
  summaryUrl: string | null;
  marketingUrl: string | null;
  formularyUrl: string | null;
  lastUpdatedOn: string | null;
  drugTiers: string[];
};

export type UhcNjQhpDrugAssociation = {
  planId: string;
  drugTier: string;
  priorAuthorization: boolean | null;
  stepTherapy: boolean | null;
  quantityLimit: boolean | null;
  years: number[];
  restrictionsComplete: boolean;
};

export type UhcNjQhpDrug = {
  rxcui: string;
  drugName: string;
  associations: UhcNjQhpDrugAssociation[];
};

type SourceFile = {
  url: string;
  listedAt: string | null;
  sourceDate: string | null;
  etag: string | null;
};

type Snapshot = {
  plans: Map<string, UhcNjQhpPlan>;
  drugs: Map<string, UhcNjQhpDrug>;
  source: {
    scope: string;
    boundary: string;
    state: "NJ";
    year: 2026;
    issuerId: "37777";
    manifestUrl: string;
    plans: SourceFile;
    drugs: SourceFile;
    retrievedAt: string;
    quality: {
      planCount: number;
      drugCount: number;
      associationCount: number;
      rejectedPlanCount: number;
      rejectedDrugCount: number;
      rejectedAssociationCount: number;
      incompleteRestrictionCount: number;
    };
  };
};

type CachedSnapshot = {
  snapshot: Snapshot;
  expiresAt: number;
  staleUntil: number;
};

type AdapterOptions = {
  fetchImpl?: UhcNjQhpFetch;
  timeoutMs?: number;
  cacheTtlMs?: number;
  staleIfErrorMs?: number;
  now?: () => number;
  manifestUrl?: string;
  limits?: Partial<{ manifest: number; plans: number; drugs: number }>;
};

type FetchJsonResult = {
  payload: unknown;
  url: string;
  lastModified: string | null;
  etag: string | null;
};

export class UhcNjQhpError extends Error {
  constructor(
    readonly code: "SOURCE_TIMEOUT" | "SOURCE_TOO_LARGE" | "SOURCE_HTTP_ERROR" | "SOURCE_INVALID_JSON" | "SOURCE_SCHEMA_ERROR" | "SOURCE_CONFIGURATION_ERROR" | "SOURCE_UNAVAILABLE",
    message: string,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "UhcNjQhpError";
  }
}

function asObject(value: unknown): JsonObject | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as JsonObject
    : undefined;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function stringOrNull(value: unknown) {
  const text = stringValue(value);
  return text || null;
}

function normalizedTokens(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean);
}

function editDistance(left: string, right: string) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let previous = row[0];
    row[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const current = row[rightIndex];
      row[rightIndex] = Math.min(
        row[rightIndex] + 1,
        row[rightIndex - 1] + 1,
        previous + Number(left[leftIndex - 1] !== right[rightIndex - 1]),
      );
      previous = current;
    }
  }
  return row[right.length];
}

function medicationMatchScore(drugName: string, query: string) {
  const normalizedName = drugName.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  if (normalizedName.includes(normalizedQuery)) return 0;
  const queryTokens = normalizedTokens(query);
  const nameTokens = normalizedTokens(drugName);
  if (!queryTokens.length) return null;
  const distances = queryTokens.map((queryToken) => {
    const threshold = queryToken.length >= 8 ? 2 : queryToken.length >= 5 ? 1 : 0;
    const matches = nameTokens
      .map((nameToken) => (nameToken.startsWith(queryToken) ? 0 : editDistance(queryToken, nameToken)))
      .filter((distance) => distance <= threshold);
    return matches.length ? Math.min(...matches) : null;
  });
  return distances.some((distance) => distance === null)
    ? null
    : 10 + distances.reduce((total, distance) => total + (distance ?? 0), 0);
}

function yearValues(value: unknown) {
  return Array.isArray(value)
    ? value.filter((year): year is number => Number.isInteger(year) && year >= 2000 && year <= 2100)
    : [];
}

function normalizeTier(value: unknown) {
  return stringValue(value).toUpperCase().replace(/\s+/g, "-");
}

function safeSourceUrl(value: string) {
  const url = new URL(value);
  return `${url.origin}${url.pathname}`;
}

function validateSourceUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || !ALLOWED_SOURCE_HOSTS.has(url.hostname.toLowerCase())) {
    throw new UhcNjQhpError("SOURCE_CONFIGURATION_ERROR", "UHC source URL is not on an approved HTTPS host.", {
      source: safeSourceUrl(value),
    });
  }
  if (url.username || url.password) {
    throw new UhcNjQhpError("SOURCE_CONFIGURATION_ERROR", "UHC source URL cannot contain credentials.");
  }
  return url;
}

async function responseBytes(response: Response, maxBytes: number, controller: AbortController) {
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    controller.abort();
    throw new UhcNjQhpError("SOURCE_TOO_LARGE", `UHC source exceeds the ${maxBytes}-byte limit.`);
  }
  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > maxBytes) {
      controller.abort();
      throw new UhcNjQhpError("SOURCE_TOO_LARGE", `UHC source exceeds the ${maxBytes}-byte limit.`);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

async function fetchJson(
  initialUrl: string,
  fetchImpl: UhcNjQhpFetch,
  timeoutMs: number,
  maxBytes: number,
): Promise<FetchJsonResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let url = validateSourceUrl(initialUrl);
  try {
    for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
      const response = await fetchImpl(url, {
        headers: { accept: "application/json" },
        redirect: "manual",
        signal: controller.signal,
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location || redirects === MAX_REDIRECTS) {
          throw new UhcNjQhpError("SOURCE_HTTP_ERROR", "UHC source redirect could not be resolved.", {
            source: safeSourceUrl(url.toString()),
          });
        }
        url = validateSourceUrl(new URL(location, url).toString());
        continue;
      }
      if (!response.ok) {
        throw new UhcNjQhpError("SOURCE_HTTP_ERROR", `UHC source returned HTTP ${response.status}.`, {
          status: response.status,
          source: safeSourceUrl(url.toString()),
        });
      }
      const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
      if (contentType && !contentType.includes("json")) {
        throw new UhcNjQhpError("SOURCE_INVALID_JSON", "UHC source did not return JSON content.", {
          source: safeSourceUrl(url.toString()),
        });
      }
      const bytes = await responseBytes(response, maxBytes, controller);
      let payload: unknown;
      try {
        payload = JSON.parse(new TextDecoder().decode(bytes));
      } catch {
        throw new UhcNjQhpError("SOURCE_INVALID_JSON", "UHC source returned invalid JSON.", {
          source: safeSourceUrl(url.toString()),
        });
      }
      return {
        payload,
        url: safeSourceUrl(url.toString()),
        lastModified: response.headers.get("last-modified"),
        etag: response.headers.get("etag"),
      };
    }
    throw new UhcNjQhpError("SOURCE_HTTP_ERROR", "UHC source redirect could not be resolved.");
  } catch (error) {
    if (error instanceof UhcNjQhpError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new UhcNjQhpError("SOURCE_TIMEOUT", `UHC source request timed out after ${timeoutMs} ms.`, {
        source: safeSourceUrl(url.toString()),
      });
    }
    throw new UhcNjQhpError("SOURCE_UNAVAILABLE", "UHC source request could not be completed.", {
      source: safeSourceUrl(url.toString()),
      cause: error instanceof Error ? error.message : String(error),
    });
  } finally {
    clearTimeout(timer);
  }
}

function manifestEntries(value: unknown, key: "plans" | "drugs") {
  const root = asObject(value);
  const entries = root?.[key];
  if (!Array.isArray(entries)) {
    throw new UhcNjQhpError("SOURCE_SCHEMA_ERROR", `UHC manifest is missing the ${key} list.`);
  }
  return entries.map(asObject).filter((entry): entry is JsonObject => Boolean(entry)).map((entry) => ({
    name: stringValue(entry.name),
    date: stringOrNull(entry.date) ?? undefined,
    blobPath: stringOrNull(entry.blobPath) ?? undefined,
    url: stringOrNull(entry.url) ?? undefined,
    isExternal: entry.isExternal === true,
  } satisfies ManifestEntry));
}

function sourceFromManifest(entry: ManifestEntry, manifestUrl: string) {
  if (entry.url) return validateSourceUrl(entry.url).toString();
  if (!entry.blobPath) throw new UhcNjQhpError("SOURCE_SCHEMA_ERROR", `UHC manifest entry ${entry.name} has no source path.`);
  return validateSourceUrl(new URL(`/api/stream/${entry.blobPath}`, manifestUrl).toString()).toString();
}

function parsePlans(payload: unknown) {
  if (!Array.isArray(payload)) throw new UhcNjQhpError("SOURCE_SCHEMA_ERROR", "UHC NJ plans file root must be an array.");
  const plans = new Map<string, UhcNjQhpPlan>();
  let rejectedPlanCount = 0;
  for (const value of payload) {
    const plan = asObject(value);
    if (!plan || !yearValues(plan.years).includes(PLAN_YEAR)) continue;
    const planId = stringValue(plan.plan_id).toUpperCase();
    const marketingName = stringValue(plan.marketing_name);
    const formulary = Array.isArray(plan.formulary) ? plan.formulary : [];
    const tiers = [...new Set(formulary.map(asObject).filter((entry): entry is JsonObject => Boolean(entry)).map((entry) => normalizeTier(entry.drug_tier)).filter((tier) => /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(tier)))];
    if (stringValue(plan.plan_id_type).toUpperCase() !== "HIOS-PLAN-ID" || !/^37777NJ\d{7}$/.test(planId) || !marketingName || tiers.length === 0) {
      rejectedPlanCount += 1;
      continue;
    }
    plans.set(planId, {
      planId,
      marketingName,
      years: [PLAN_YEAR],
      summaryUrl: stringOrNull(plan.summary_url),
      marketingUrl: stringOrNull(plan.marketing_url),
      formularyUrl: stringOrNull(plan.formulary_url),
      lastUpdatedOn: stringOrNull(plan.last_updated_on),
      drugTiers: tiers.sort(),
    });
  }
  if (plans.size === 0) {
    throw new UhcNjQhpError("SOURCE_SCHEMA_ERROR", "UHC NJ plans source contained no valid 2026 NJ Individual/Family HIOS plans.");
  }
  return { plans, rejectedPlanCount };
}

function parseDrugs(payload: unknown, plans: Map<string, UhcNjQhpPlan>) {
  if (!Array.isArray(payload)) throw new UhcNjQhpError("SOURCE_SCHEMA_ERROR", "UHC NJ drugs file root must be an array.");
  const drugs = new Map<string, UhcNjQhpDrug>();
  let rejectedDrugCount = 0;
  let rejectedAssociationCount = 0;
  let incompleteRestrictionCount = 0;
  let associationCount = 0;

  for (const value of payload) {
    const drug = asObject(value);
    const rxcui = stringValue(drug?.rxnorm_id);
    const drugName = stringValue(drug?.drug_name);
    if (!drug || !/^\d+$/.test(rxcui) || !drugName || !Array.isArray(drug.plans)) {
      rejectedDrugCount += 1;
      continue;
    }
    const associations: UhcNjQhpDrugAssociation[] = [];
    for (const associationValue of drug.plans) {
      const association = asObject(associationValue);
      if (!association || !yearValues(association.years).includes(PLAN_YEAR)) continue;
      const planId = stringValue(association.plan_id).toUpperCase();
      const drugTier = normalizeTier(association.drug_tier);
      if (stringValue(association.plan_id_type).toUpperCase() !== "HIOS-PLAN-ID" || !/^37777NJ\d{7}$/.test(planId) || !plans.has(planId) || !/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(drugTier)) {
        rejectedAssociationCount += 1;
        continue;
      }
      const priorAuthorization = typeof association.prior_authorization === "boolean" ? association.prior_authorization : null;
      const stepTherapy = typeof association.step_therapy === "boolean" ? association.step_therapy : null;
      const quantityLimit = typeof association.quantity_limit === "boolean" ? association.quantity_limit : null;
      const restrictionsComplete = priorAuthorization !== null && stepTherapy !== null && quantityLimit !== null;
      if (!restrictionsComplete) incompleteRestrictionCount += 1;
      associationCount += 1;
      associations.push({
        planId,
        drugTier,
        priorAuthorization,
        stepTherapy,
        quantityLimit,
        years: [PLAN_YEAR],
        restrictionsComplete,
      });
    }
    if (!associations.length) continue;
    const existing = drugs.get(rxcui);
    if (existing) {
      existing.associations.push(...associations);
    } else {
      drugs.set(rxcui, { rxcui, drugName, associations });
    }
  }
  if (drugs.size === 0 || associationCount === 0) {
    throw new UhcNjQhpError("SOURCE_SCHEMA_ERROR", "UHC NJ drugs source contained no valid 2026 NJ QHP associations.");
  }
  return { drugs, rejectedDrugCount, rejectedAssociationCount, incompleteRestrictionCount, associationCount };
}

function sourceDate(result: FetchJsonResult, listedAt?: string) {
  const value = result.lastModified || listedAt || null;
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : value;
}

function publicSource(snapshot: Snapshot, cacheStatus: "fresh" | "stale", warning?: string) {
  return {
    ...snapshot.source,
    cacheStatus,
    warning: warning ?? null,
  };
}

export class UhcNjQhpAdapter {
  private readonly fetchImpl: UhcNjQhpFetch;
  private readonly timeoutMs: number;
  private readonly cacheTtlMs: number;
  private readonly staleIfErrorMs: number;
  private readonly now: () => number;
  private readonly manifestUrl: string;
  private readonly limits: { manifest: number; plans: number; drugs: number };
  private cache?: CachedSnapshot;
  private loading?: Promise<Snapshot>;

  constructor(options: AdapterOptions = {}) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.cacheTtlMs = options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
    this.staleIfErrorMs = options.staleIfErrorMs ?? DEFAULT_STALE_IF_ERROR_MS;
    this.now = options.now ?? Date.now;
    this.manifestUrl = validateSourceUrl(options.manifestUrl ?? UHC_NJ_QHP_MANIFEST_URL).toString();
    this.limits = {
      manifest: options.limits?.manifest ?? MANIFEST_MAX_BYTES,
      plans: options.limits?.plans ?? PLAN_MAX_BYTES,
      drugs: options.limits?.drugs ?? DRUG_MAX_BYTES,
    };
  }

  private async loadSnapshot() {
    const manifest = await fetchJson(this.manifestUrl, this.fetchImpl, this.timeoutMs, this.limits.manifest);
    const planEntry = manifestEntries(manifest.payload, "plans").find((entry) => entry.name === PLAN_FILENAME);
    const drugEntry = manifestEntries(manifest.payload, "drugs").find((entry) => entry.name === DRUG_FILENAME);
    if (!planEntry || !drugEntry) {
      throw new UhcNjQhpError("SOURCE_SCHEMA_ERROR", "UHC manifest is missing the NJ Individual/Family plan or drug file.");
    }
    const planUrl = sourceFromManifest(planEntry, this.manifestUrl);
    const drugUrl = sourceFromManifest(drugEntry, this.manifestUrl);
    const [planResult, drugResult] = await Promise.all([
      fetchJson(planUrl, this.fetchImpl, this.timeoutMs, this.limits.plans),
      fetchJson(drugUrl, this.fetchImpl, this.timeoutMs, this.limits.drugs),
    ]);
    const planData = parsePlans(planResult.payload);
    const drugData = parseDrugs(drugResult.payload, planData.plans);
    return {
      plans: planData.plans,
      drugs: drugData.drugs,
      source: {
        scope: UHC_NJ_QHP_SCOPE,
        boundary: UHC_NJ_QHP_BOUNDARY,
        state: "NJ",
        year: 2026,
        issuerId: "37777",
        manifestUrl: safeSourceUrl(this.manifestUrl),
        plans: {
          url: planResult.url,
          listedAt: planEntry.date ?? null,
          sourceDate: sourceDate(planResult, planEntry.date),
          etag: planResult.etag,
        },
        drugs: {
          url: drugResult.url,
          listedAt: drugEntry.date ?? null,
          sourceDate: sourceDate(drugResult, drugEntry.date),
          etag: drugResult.etag,
        },
        retrievedAt: new Date(this.now()).toISOString(),
        quality: {
          planCount: planData.plans.size,
          drugCount: drugData.drugs.size,
          associationCount: drugData.associationCount,
          rejectedPlanCount: planData.rejectedPlanCount,
          rejectedDrugCount: drugData.rejectedDrugCount,
          rejectedAssociationCount: drugData.rejectedAssociationCount,
          incompleteRestrictionCount: drugData.incompleteRestrictionCount,
        },
      },
    } satisfies Snapshot;
  }

  private async snapshot() {
    const now = this.now();
    if (this.cache && now < this.cache.expiresAt) {
      return { snapshot: this.cache.snapshot, cacheStatus: "fresh" as const };
    }
    try {
      if (!this.loading) {
        this.loading = this.loadSnapshot().finally(() => {
          this.loading = undefined;
        });
      }
      const snapshot = await this.loading;
      this.cache = {
        snapshot,
        expiresAt: now + this.cacheTtlMs,
        staleUntil: now + this.cacheTtlMs + this.staleIfErrorMs,
      };
      return { snapshot, cacheStatus: "fresh" as const };
    } catch (error) {
      if (this.cache && now < this.cache.staleUntil) {
        return {
          snapshot: this.cache.snapshot,
          cacheStatus: "stale" as const,
          warning: `Latest source refresh failed: ${error instanceof UhcNjQhpError ? error.code : "SOURCE_UNAVAILABLE"}`,
        };
      }
      throw error;
    }
  }

  async exactPlanSearch(query: string) {
    const normalized = query.trim().toLowerCase();
    const loaded = await this.snapshot();
    const plans = [...loaded.snapshot.plans.values()]
      .filter((plan) =>
        plan.planId.toLowerCase().includes(normalized) ||
        plan.marketingName.toLowerCase().includes(normalized),
      )
      .sort((left, right) => {
        const leftExact = left.planId.toLowerCase() === normalized || left.marketingName.toLowerCase() === normalized;
        const rightExact = right.planId.toLowerCase() === normalized || right.marketingName.toLowerCase() === normalized;
        return Number(rightExact) - Number(leftExact) || left.marketingName.localeCompare(right.marketingName);
      });
    const exactMatch = plans.some((plan) =>
      plan.planId.toLowerCase() === normalized || plan.marketingName.toLowerCase() === normalized,
    );
    return {
      status: exactMatch ? "confirmed" as const : plans.length ? "candidates" as const : "unconfirmed" as const,
      reason: exactMatch ? null : plans.length ? "EXACT_PLAN_SELECTION_REQUIRED" : "NO_PLAN_MATCH",
      source: publicSource(loaded.snapshot, loaded.cacheStatus, loaded.warning),
      plans,
    };
  }

  async drugAutocomplete(query: string, limit = 20) {
    const normalized = query.trim().toLowerCase();
    const loaded = await this.snapshot();
    const drugs = [...loaded.snapshot.drugs.values()]
      .map((drug) => ({
        drug,
        score: drug.rxcui.startsWith(normalized) ? 0 : medicationMatchScore(drug.drugName, normalized),
      }))
      .filter((candidate): candidate is { drug: UhcNjQhpDrug; score: number } => candidate.score !== null)
      .sort((left, right) => {
        return left.score - right.score || left.drug.drugName.localeCompare(right.drug.drugName);
      })
      .slice(0, limit)
      .map(({ drug }) => ({
        rxcui: drug.rxcui,
        drugName: drug.drugName,
        planCount: new Set(drug.associations.map((association) => association.planId)).size,
      }));
    return {
      status: drugs.length ? "confirmed" as const : "unconfirmed" as const,
      reason: drugs.length ? null : "NO_DRUG_MATCH",
      source: publicSource(loaded.snapshot, loaded.cacheStatus, loaded.warning),
      drugs,
    };
  }

  async coverage(planIdInput: string, rxcuiInput: string) {
    const planId = planIdInput.trim().toUpperCase();
    const rxcui = rxcuiInput.trim();
    const loaded = await this.snapshot();
    const source = publicSource(loaded.snapshot, loaded.cacheStatus, loaded.warning);
    const plan = loaded.snapshot.plans.get(planId);
    if (!plan) return { status: "unconfirmed" as const, covered: null, reason: "PLAN_NOT_FOUND", source, planId, rxcui };
    const drug = loaded.snapshot.drugs.get(rxcui);
    if (!drug) return { status: "unconfirmed" as const, covered: null, reason: "RXCUI_NOT_FOUND", source, plan, rxcui };
    const matches = drug.associations.filter((association) => association.planId === planId);
    if (!matches.length) return { status: "unconfirmed" as const, covered: null, reason: "NO_MATCH_IN_SOURCE", source, plan, drug };
    if (matches.some((match) => !match.restrictionsComplete)) {
      return { status: "unconfirmed" as const, covered: null, reason: "INCOMPLETE_SOURCE_RESTRICTIONS", source, plan, drug: { rxcui: drug.rxcui, drugName: drug.drugName }, matches };
    }
    return {
      status: "confirmed" as const,
      covered: true,
      reason: null,
      source,
      plan,
      drug: { rxcui: drug.rxcui, drugName: drug.drugName },
      coverage: matches,
      note: "Listed in the official UHC NJ Individual/Family 2026 QHP machine-readable formulary. This does not verify member eligibility or payment.",
    };
  }
}

export function serializeUhcNjQhpError(error: unknown) {
  const sourceError = error instanceof UhcNjQhpError
    ? error
    : new UhcNjQhpError("SOURCE_UNAVAILABLE", "UHC NJ QHP data is temporarily unavailable.");
  return {
    status: "error" as const,
    covered: null,
    error: sourceError.code,
    message: sourceError.message,
    source: {
      scope: UHC_NJ_QHP_SCOPE,
      boundary: UHC_NJ_QHP_BOUNDARY,
      state: "NJ",
      year: PLAN_YEAR,
      issuerId: UHC_NJ_ISSUER_ID,
      manifestUrl: UHC_NJ_QHP_MANIFEST_URL,
    },
  };
}
