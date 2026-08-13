export const AETNA_NJ_FAMILYCARE_SOURCE_URL =
  "https://fm.formularynavigator.com/FBO/111/Aetna_Better_Health_of_New_Jersey.json";

export const AETNA_NJ_FAMILYCARE_SOURCE_ID =
  "aetna-better-health-new-jersey-familycare-medicaid";

export const DEFAULT_AETNA_NJ_TIMEOUT_MS = 20_000;
export const DEFAULT_AETNA_NJ_MAX_BYTES = 32 * 1024 * 1024;
export const DEFAULT_AETNA_NJ_CACHE_TTL_MS = 6 * 60 * 60 * 1_000;

export type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export type AetnaNjFamilyCareSource = {
  id: typeof AETNA_NJ_FAMILYCARE_SOURCE_ID;
  name: "Aetna Better Health of New Jersey FamilyCare Medicaid formulary";
  authority: "Aetna Better Health of New Jersey";
  program: "NJ FamilyCare Medicaid";
  url: typeof AETNA_NJ_FAMILYCARE_SOURCE_URL;
  effectiveDate: string;
  exclusions: readonly [
    "Aetna commercial plans",
    "Aetna Medicare and Medicare Part D plans",
    "Member eligibility, cost, and claim-payment determinations",
  ];
};

export type AetnaNjFamilyCareProfile = {
  publicName: string;
  state: "NEW JERSEY";
  formularyType: "State Medicaid";
  formularyName: string;
  formularyId: number;
  formularyVersion: number;
  effectiveDate: string;
};

export type AetnaNjFamilyCareDrug = {
  ndc: string;
  drugName: string;
  drugTier: string;
  priorAuthorization: boolean;
  stepTherapy: boolean;
  quantityLimit: boolean;
  otc: boolean;
};

type SearchProduct = {
  drugName: string;
  normalizedName: string;
  ndcs: readonly string[];
};

export type AetnaNjFamilyCareFormulary = {
  profile: Readonly<AetnaNjFamilyCareProfile>;
  drugs: readonly Readonly<AetnaNjFamilyCareDrug>[];
  fetchedAt: string;
  responseBytes: number;
  responseEtag: string | null;
  responseLastModified: string | null;
  readonly indexes: {
    byNdc: ReadonlyMap<string, readonly Readonly<AetnaNjFamilyCareDrug>[]>;
    products: readonly Readonly<SearchProduct>[];
  };
};

export type AetnaNjFamilyCareMetadata = {
  source: AetnaNjFamilyCareSource;
  profile: Readonly<AetnaNjFamilyCareProfile>;
  fetchedAt: string;
  rowCount: number;
  productCount: number;
  responseBytes: number;
  responseEtag: string | null;
  responseLastModified: string | null;
};

export type AetnaNjFamilyCareAutocompleteSuggestion = {
  drugName: string;
  ndcCount: number;
  ndcs: readonly string[];
};

export type AetnaNjFamilyCareAutocompleteResult = {
  source: AetnaNjFamilyCareSource;
  query: string;
  suggestions: readonly AetnaNjFamilyCareAutocompleteSuggestion[];
};

export type AetnaNjFamilyCareCoverageResult = {
  source: AetnaNjFamilyCareSource;
  ndc: string;
  status: "listed" | "not-listed-in-source";
  matches: readonly Readonly<AetnaNjFamilyCareDrug>[];
  notice: string;
};

export type AetnaNjFamilyCareErrorCode =
  | "HTTP_ERROR"
  | "INVALID_JSON"
  | "INVALID_NDC"
  | "INVALID_SCHEMA"
  | "NETWORK_ERROR"
  | "RESPONSE_TOO_LARGE"
  | "TIMEOUT";

export class AetnaNjFamilyCareError extends Error {
  constructor(
    readonly code: AetnaNjFamilyCareErrorCode,
    message: string,
    readonly details: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = "AetnaNjFamilyCareError";
  }
}

type RawProfile = {
  public_name?: unknown;
  state?: unknown;
  formulary_type?: unknown;
  formulary_name?: unknown;
  formulary_id?: unknown;
  formulary_version?: unknown;
  formulary_effective_date?: unknown;
};

type RawDrug = {
  ndc?: unknown;
  ndc_label_name?: unknown;
  drug_tier?: unknown;
  prior_authorization?: unknown;
  step_therapy?: unknown;
  quantity_limit?: unknown;
  otc?: unknown;
};

export type ValidateAetnaNjFamilyCareOptions = {
  fetchedAt?: string;
  responseBytes?: number;
  responseEtag?: string | null;
  responseLastModified?: string | null;
};

export type FetchAetnaNjFamilyCareOptions = {
  fetchImpl?: FetchLike;
  timeoutMs?: number;
  maxBytes?: number;
  now?: () => Date;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function schemaError(message: string, details: Record<string, unknown> = {}): never {
  throw new AetnaNjFamilyCareError("INVALID_SCHEMA", message, details);
}

function requiredString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    schemaError(`Expected a non-empty string at ${path}.`);
  }
  return value.trim();
}

function requiredBoolean(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") {
    schemaError(`Expected a boolean at ${path}.`);
  }
  return value;
}

function requiredInteger(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) {
    schemaError(`Expected a safe integer at ${path}.`);
  }
  return value;
}

function requiredDate(value: unknown, path: string): string {
  const date = requiredString(value, path);
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const usMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);
  const parts = isoMatch
    ? { year: Number(isoMatch[1]), month: Number(isoMatch[2]), day: Number(isoMatch[3]) }
    : usMatch
      ? { year: Number(usMatch[3]), month: Number(usMatch[1]), day: Number(usMatch[2]) }
      : null;
  if (!parts) schemaError(`Expected a calendar date at ${path}.`, { value: date });

  const parsed = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  if (
    parsed.getUTCFullYear() !== parts.year ||
    parsed.getUTCMonth() + 1 !== parts.month ||
    parsed.getUTCDate() !== parts.day
  ) {
    schemaError(`Expected a valid calendar date at ${path}.`, { value: date });
  }
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function validateSourceProfile(raw: RawProfile): AetnaNjFamilyCareProfile {
  const publicName = requiredString(raw.public_name, "Profile_Information.public_name");
  const state = requiredString(raw.state, "Profile_Information.state");
  const formularyType = requiredString(raw.formulary_type, "Profile_Information.formulary_type");

  if (publicName !== "Aetna_Better_Health_of_New_Jersey") {
    schemaError("The source public name is not Aetna Better Health of New Jersey.", { publicName });
  }
  if (state !== "NEW JERSEY") {
    schemaError("The source is not scoped to New Jersey.", { state });
  }
  if (formularyType !== "State Medicaid") {
    schemaError("The source is not the State Medicaid formulary.", { formularyType });
  }

  return {
    publicName,
    state,
    formularyType,
    formularyName: requiredString(raw.formulary_name, "Profile_Information.formulary_name"),
    formularyId: requiredInteger(raw.formulary_id, "Profile_Information.formulary_id"),
    formularyVersion: requiredInteger(raw.formulary_version, "Profile_Information.formulary_version"),
    effectiveDate: requiredDate(
      raw.formulary_effective_date,
      "Profile_Information.formulary_effective_date",
    ),
  };
}

function validateDrug(raw: RawDrug, index: number): AetnaNjFamilyCareDrug {
  const path = `Drug_Information[${index}]`;
  const ndc = requiredString(raw.ndc, `${path}.ndc`);
  if (!/^\d{11}$/.test(ndc)) {
    schemaError(`Expected an 11-digit NDC at ${path}.ndc.`, { ndc, index });
  }

  return {
    ndc,
    drugName: requiredString(raw.ndc_label_name, `${path}.ndc_label_name`),
    drugTier: requiredString(raw.drug_tier, `${path}.drug_tier`),
    priorAuthorization: requiredBoolean(raw.prior_authorization, `${path}.prior_authorization`),
    stepTherapy: requiredBoolean(raw.step_therapy, `${path}.step_therapy`),
    quantityLimit: requiredBoolean(raw.quantity_limit, `${path}.quantity_limit`),
    otc: requiredBoolean(raw.otc, `${path}.otc`),
  };
}

function buildIndexes(drugs: readonly Readonly<AetnaNjFamilyCareDrug>[]) {
  const byNdc = new Map<string, Readonly<AetnaNjFamilyCareDrug>[]>();
  const productGroups = new Map<string, { drugName: string; ndcs: Set<string> }>();

  for (const drug of drugs) {
    const ndcMatches = byNdc.get(drug.ndc);
    if (ndcMatches) ndcMatches.push(drug);
    else byNdc.set(drug.ndc, [drug]);

    const normalizedName = normalizeSearchText(drug.drugName);
    const group = productGroups.get(normalizedName);
    if (group) group.ndcs.add(drug.ndc);
    else productGroups.set(normalizedName, { drugName: drug.drugName, ndcs: new Set([drug.ndc]) });
  }

  const readonlyByNdc = new Map<string, readonly Readonly<AetnaNjFamilyCareDrug>[]>();
  for (const [ndc, matches] of byNdc) readonlyByNdc.set(ndc, Object.freeze(matches.slice()));

  const products = Array.from(productGroups, ([normalizedName, group]) =>
    Object.freeze({
      drugName: group.drugName,
      normalizedName,
      ndcs: Object.freeze(Array.from(group.ndcs).sort()),
    }))
    .sort((a, b) => a.drugName.localeCompare(b.drugName));

  return Object.freeze({
    byNdc: readonlyByNdc as ReadonlyMap<string, readonly Readonly<AetnaNjFamilyCareDrug>[]>,
    products: Object.freeze(products),
  });
}

export function validateAetnaNjFamilyCarePayload(
  payload: unknown,
  options: ValidateAetnaNjFamilyCareOptions = {},
): AetnaNjFamilyCareFormulary {
  if (!isObject(payload)) schemaError("Expected the formulary payload to be a JSON object.");
  if (!isObject(payload.Profile_Information)) {
    schemaError("Expected Profile_Information to be an object.");
  }
  if (!Array.isArray(payload.Drug_Information) || payload.Drug_Information.length === 0) {
    schemaError("Expected Drug_Information to be a non-empty array.");
  }

  const profile = Object.freeze(validateSourceProfile(payload.Profile_Information));
  const drugs = Object.freeze(
    payload.Drug_Information.map((raw, index) => {
      if (!isObject(raw)) schemaError(`Expected Drug_Information[${index}] to be an object.`);
      return Object.freeze(validateDrug(raw, index));
    }),
  );

  const fetchedAt = options.fetchedAt ?? new Date(0).toISOString();
  if (Number.isNaN(Date.parse(fetchedAt))) {
    schemaError("fetchedAt must be an ISO timestamp.", { fetchedAt });
  }

  return Object.freeze({
    profile,
    drugs,
    fetchedAt,
    responseBytes: options.responseBytes ?? 0,
    responseEtag: options.responseEtag ?? null,
    responseLastModified: options.responseLastModified ?? null,
    indexes: buildIndexes(drugs),
  });
}

function sourceFor(formulary: AetnaNjFamilyCareFormulary): AetnaNjFamilyCareSource {
  return Object.freeze({
    id: AETNA_NJ_FAMILYCARE_SOURCE_ID,
    name: "Aetna Better Health of New Jersey FamilyCare Medicaid formulary",
    authority: "Aetna Better Health of New Jersey",
    program: "NJ FamilyCare Medicaid",
    url: AETNA_NJ_FAMILYCARE_SOURCE_URL,
    effectiveDate: formulary.profile.effectiveDate,
    exclusions: Object.freeze([
      "Aetna commercial plans",
      "Aetna Medicare and Medicare Part D plans",
      "Member eligibility, cost, and claim-payment determinations",
    ] as const),
  });
}

export function getAetnaNjFamilyCareMetadata(
  formulary: AetnaNjFamilyCareFormulary,
): AetnaNjFamilyCareMetadata {
  return Object.freeze({
    source: sourceFor(formulary),
    profile: formulary.profile,
    fetchedAt: formulary.fetchedAt,
    rowCount: formulary.drugs.length,
    productCount: formulary.indexes.products.length,
    responseBytes: formulary.responseBytes,
    responseEtag: formulary.responseEtag,
    responseLastModified: formulary.responseLastModified,
  });
}

function matchScore(normalizedName: string, normalizedQuery: string): number | null {
  if (normalizedName === normalizedQuery) return 0;
  if (normalizedName.startsWith(normalizedQuery)) return 1;
  if (normalizedName.split(" ").some((token) => token.startsWith(normalizedQuery))) return 2;
  const queryTokens = normalizedQuery.split(" ");
  const nameTokens = normalizedName.split(" ");
  if (
    queryTokens.length > 1 &&
    queryTokens.every((queryToken) => nameTokens.some((nameToken) => nameToken.startsWith(queryToken)))
  )
    return 3;
  if (normalizedName.includes(normalizedQuery)) return 3;
  const typoTolerance = (queryToken: string) =>
    queryToken.length >= 8 ? 2 : queryToken.length >= 5 ? 1 : 0;
  const editDistance = (left: string, right: string) => {
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
  };
  const fuzzyScore = queryTokens.map((queryToken) => {
    const matches = nameTokens
      .map((nameToken) => editDistance(queryToken, nameToken))
      .filter((distance) => distance <= typoTolerance(queryToken));
    return matches.length ? Math.min(...matches) : null;
  });
  if (fuzzyScore.every((distance) => distance !== null))
    return 10 + fuzzyScore.reduce((total, distance) => total + (distance ?? 0), 0);
  return null;
}

export function autocompleteAetnaNjFamilyCareDrugs(
  formulary: AetnaNjFamilyCareFormulary,
  query: string,
  limit = 20,
): AetnaNjFamilyCareAutocompleteResult {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < 2) {
    throw new AetnaNjFamilyCareError(
      "INVALID_SCHEMA",
      "Drug autocomplete requires at least two letters or digits.",
      { query: query.trim() },
    );
  }
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    throw new AetnaNjFamilyCareError(
      "INVALID_SCHEMA",
      "Autocomplete limit must be an integer from 1 through 100.",
      { limit },
    );
  }

  const suggestions = formulary.indexes.products
    .map((product) => ({ product, score: matchScore(product.normalizedName, normalizedQuery) }))
    .filter((candidate): candidate is { product: Readonly<SearchProduct>; score: number } =>
      candidate.score !== null)
    .sort((a, b) => a.score - b.score || a.product.drugName.localeCompare(b.product.drugName))
    .slice(0, limit)
    .map(({ product }) => Object.freeze({
      drugName: product.drugName,
      ndcCount: product.ndcs.length,
      ndcs: Object.freeze(product.ndcs.slice(0, 10)),
    }));

  return Object.freeze({
    source: sourceFor(formulary),
    query: query.trim(),
    suggestions: Object.freeze(suggestions),
  });
}

export function normalizeAetnaNjFamilyCareNdc(value: string): string {
  const ndc = value.replace(/[\s-]/g, "");
  if (!/^\d{11}$/.test(ndc)) {
    throw new AetnaNjFamilyCareError(
      "INVALID_NDC",
      "Aetna NJ FamilyCare lookup requires an exact 11-digit NDC.",
      { value },
    );
  }
  return ndc;
}

export function lookupAetnaNjFamilyCareCoverageByNdc(
  formulary: AetnaNjFamilyCareFormulary,
  ndcInput: string,
): AetnaNjFamilyCareCoverageResult {
  const ndc = normalizeAetnaNjFamilyCareNdc(ndcInput);
  const matches = formulary.indexes.byNdc.get(ndc) ?? Object.freeze([]);
  const listed = matches.length > 0;

  return Object.freeze({
    source: sourceFor(formulary),
    ndc,
    status: listed ? "listed" : "not-listed-in-source",
    matches,
    notice: listed
      ? "Listed in the public Aetna Better Health of New Jersey FamilyCare Medicaid formulary. This is not an eligibility, cost, or payment determination."
      : "No exact NDC row was found in this source. This is not a denial; verify the current formulary, product NDC, and member benefit.",
  });
}

async function readBodyWithLimit(response: Response, maxBytes: number): Promise<{ text: string; bytes: number }> {
  const contentLength = response.headers.get("content-length");
  if (contentLength && /^\d+$/.test(contentLength) && Number(contentLength) > maxBytes) {
    throw new AetnaNjFamilyCareError(
      "RESPONSE_TOO_LARGE",
      `Aetna NJ FamilyCare source exceeds the ${maxBytes}-byte response limit.`,
      { contentLength: Number(contentLength), maxBytes },
    );
  }

  if (!response.body) return { text: "", bytes: 0 };

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const chunks: string[] = [];
  let bytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel("response size limit exceeded");
        throw new AetnaNjFamilyCareError(
          "RESPONSE_TOO_LARGE",
          `Aetna NJ FamilyCare source exceeds the ${maxBytes}-byte response limit.`,
          { bytesRead: bytes, maxBytes },
        );
      }
      chunks.push(decoder.decode(value, { stream: true }));
    }
    chunks.push(decoder.decode());
    return { text: chunks.join(""), bytes };
  } finally {
    reader.releaseLock();
  }
}

export async function fetchAetnaNjFamilyCareFormulary(
  options: FetchAetnaNjFamilyCareOptions = {},
): Promise<AetnaNjFamilyCareFormulary> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_AETNA_NJ_TIMEOUT_MS;
  const maxBytes = options.maxBytes ?? DEFAULT_AETNA_NJ_MAX_BYTES;
  const now = options.now ?? (() => new Date());

  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1) {
    throw new AetnaNjFamilyCareError("INVALID_SCHEMA", "timeoutMs must be a positive integer.");
  }
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) {
    throw new AetnaNjFamilyCareError("INVALID_SCHEMA", "maxBytes must be a positive integer.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(AETNA_NJ_FAMILYCARE_SOURCE_URL, {
      headers: {
        accept: "application/json",
        "user-agent": "FormularyFinder/0.1 public-formulary-adapter",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new AetnaNjFamilyCareError(
        "HTTP_ERROR",
        `Aetna NJ FamilyCare source returned HTTP ${response.status}.`,
        { status: response.status, source: AETNA_NJ_FAMILYCARE_SOURCE_URL },
      );
    }

    const body = await readBodyWithLimit(response, maxBytes);
    let payload: unknown;
    try {
      payload = JSON.parse(body.text);
    } catch {
      throw new AetnaNjFamilyCareError(
        "INVALID_JSON",
        "Aetna NJ FamilyCare source did not return valid JSON.",
        { responseBytes: body.bytes, source: AETNA_NJ_FAMILYCARE_SOURCE_URL },
      );
    }

    return validateAetnaNjFamilyCarePayload(payload, {
      fetchedAt: now().toISOString(),
      responseBytes: body.bytes,
      responseEtag: response.headers.get("etag"),
      responseLastModified: response.headers.get("last-modified"),
    });
  } catch (error) {
    if (error instanceof AetnaNjFamilyCareError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new AetnaNjFamilyCareError(
        "TIMEOUT",
        `Aetna NJ FamilyCare source timed out after ${timeoutMs} ms.`,
        { timeoutMs, source: AETNA_NJ_FAMILYCARE_SOURCE_URL },
      );
    }
    throw new AetnaNjFamilyCareError(
      "NETWORK_ERROR",
      "Aetna NJ FamilyCare source could not be fetched.",
      {
        source: AETNA_NJ_FAMILYCARE_SOURCE_URL,
        cause: error instanceof Error ? error.message : String(error),
      },
    );
  } finally {
    clearTimeout(timer);
  }
}

export type AetnaNjFamilyCareAdapterOptions = FetchAetnaNjFamilyCareOptions & {
  cacheTtlMs?: number;
};

export class AetnaNjFamilyCareAdapter {
  private cached: { formulary: AetnaNjFamilyCareFormulary; expiresAtMs: number } | null = null;
  private inFlight: Promise<AetnaNjFamilyCareFormulary> | null = null;

  constructor(private readonly options: AetnaNjFamilyCareAdapterOptions = {}) {
    const ttl = options.cacheTtlMs ?? DEFAULT_AETNA_NJ_CACHE_TTL_MS;
    if (!Number.isSafeInteger(ttl) || ttl < 0) {
      throw new AetnaNjFamilyCareError("INVALID_SCHEMA", "cacheTtlMs must be a non-negative integer.");
    }
  }

  clearCache(): void {
    this.cached = null;
  }

  async load(forceRefresh = false): Promise<AetnaNjFamilyCareFormulary> {
    const now = this.options.now ?? (() => new Date());
    const nowMs = now().getTime();
    if (!forceRefresh && this.cached && this.cached.expiresAtMs > nowMs) {
      return this.cached.formulary;
    }
    if (this.inFlight) return this.inFlight;

    this.inFlight = fetchAetnaNjFamilyCareFormulary(this.options)
      .then((formulary) => {
        this.cached = {
          formulary,
          expiresAtMs: now().getTime() +
            (this.options.cacheTtlMs ?? DEFAULT_AETNA_NJ_CACHE_TTL_MS),
        };
        return formulary;
      })
      .finally(() => {
        this.inFlight = null;
      });

    return this.inFlight;
  }
}
