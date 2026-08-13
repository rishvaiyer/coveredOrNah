const RXNORM_BASE_URL = "https://rxnav.nlm.nih.gov/REST";
const MARKETPLACE_BASE_URL = "https://marketplace.api.healthcare.gov/api/v1";

export const DEFAULT_TIMEOUT_MS = 15_000;

export type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export type SourceRecord = {
  id: string;
  name: string;
  authority: string;
  baseUrl: string;
  documentationUrl: string;
  authentication: string;
  scope: string;
  limitations: string[];
};

export const SOURCE_REGISTRY: SourceRecord[] = [
  {
    id: "rxnorm",
    name: "RxNorm API",
    authority: "U.S. National Library of Medicine",
    baseUrl: RXNORM_BASE_URL,
    documentationUrl: "https://lhncbc.nlm.nih.gov/RxNav/APIs/RxNormAPIs.html",
    authentication: "None",
    scope: "Normalize medication names to active RxNorm concepts and inspect product identifiers.",
    limitations: [
      "A name can map to multiple concepts.",
      "An RxCUI alone does not prove coverage for a specific plan or member.",
    ],
  },
  {
    id: "cms-marketplace",
    name: "CMS Marketplace API",
    authority: "Centers for Medicare & Medicaid Services",
    baseUrl: MARKETPLACE_BASE_URL,
    documentationUrl: "https://developer.cms.gov/marketplace-api/api-spec",
    authentication: "CMS_MARKETPLACE_API_KEY query credential",
    scope: "Search ACA Marketplace drugs and check drug coverage against Marketplace plan IDs.",
    limitations: [
      "API keys are rate limited.",
      "Coverage applies to ACA Marketplace plans, not Medicaid, Medicare Part D, employer, or member eligibility.",
      "Official plan documents and current payer determinations remain controlling.",
    ],
  },
  {
    id: "cms-qhp-machine-readable-formulary",
    name: "CMS QHP machine-readable formulary files",
    authority: "Centers for Medicare & Medicaid Services",
    baseUrl: "Issuer-hosted public HTTPS drugs.json files",
    documentationUrl: "https://github.com/CMSgov/QHP-provider-formulary-APIs",
    authentication: "None",
    scope: "Issuer-published RxCUI, plan, tier, restriction, and plan-year associations for Qualified Health Plans.",
    limitations: [
      "Issuer-generated data must be checked for freshness and completeness.",
      "The normalized output is candidate evidence and is not written to the production database.",
      "Official plan documents and current payer determinations remain controlling.",
    ],
  },
  {
    id: "cms-medicare-files",
    name: "CMS monthly Medicare formulary files",
    authority: "Centers for Medicare & Medicaid Services",
    baseUrl: "https://data.cms.gov",
    documentationUrl: "https://data.cms.gov/provider-summary-by-type-of-service/medicare-part-d-prescribers/monthly-prescription-drug-plan-formulary-and-pharmacy-network-information",
    authentication: "None for published files",
    scope: "Bulk Medicare Advantage and Part D plan/formulary data imported by scripts/import-cms-medicare.ts.",
    limitations: [
      "Separate bulk-file workflow, not queried by this CLI.",
      "The current MVP may intentionally exclude standalone Part D plans.",
    ],
  },
];

export class CliError extends Error {
  readonly exitCode: number;
  readonly details?: Record<string, unknown>;

  constructor(message: string, exitCode = 1, details?: Record<string, unknown>) {
    super(message);
    this.name = "CliError";
    this.exitCode = exitCode;
    this.details = details;
  }
}

export function redactUrl(input: string | URL) {
  const url = new URL(input.toString());
  for (const key of ["apikey", "api_key", "token", "access_token"]) {
    if (url.searchParams.has(key)) url.searchParams.set(key, "REDACTED");
  }
  return url.toString();
}

function excerpt(value: string, limit = 500) {
  return value.length <= limit ? value : `${value.slice(0, limit)}...`;
}

export async function requestJson(
  fetchImpl: FetchLike,
  url: URL,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
    const raw = await response.text();
    let body: unknown;
    try {
      body = raw ? JSON.parse(raw) : null;
    } catch {
      throw new CliError("Source returned a non-JSON response.", 1, {
        status: response.status,
        source: redactUrl(url),
        response: excerpt(raw),
      });
    }

    if (!response.ok) {
      throw new CliError(`Source request failed with HTTP ${response.status}.`, 1, {
        status: response.status,
        source: redactUrl(url),
        response: body,
      });
    }
    return body;
  } catch (error) {
    if (error instanceof CliError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new CliError(`Source request timed out after ${timeoutMs} ms.`, 1, {
        source: redactUrl(url),
      });
    }
    throw new CliError("Source request could not be completed.", 1, {
      source: redactUrl(url),
      cause: error instanceof Error ? error.message : String(error),
    });
  } finally {
    clearTimeout(timer);
  }
}

function objectValue(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function requireDigits(value: string, label: string) {
  if (!/^\d+$/.test(value)) throw new CliError(`${label} must contain digits only.`, 2);
  return value;
}

function requireMarketYear(value: number) {
  if (!Number.isInteger(value) || value < 2000 || value > 2100) {
    throw new CliError("year must be a four-digit market year.", 2);
  }
  return value;
}

function requirePlanId(value: string) {
  const normalized = value.trim().toUpperCase();
  if (!/^\d{5}[A-Z]{2}\d{7}$/.test(normalized)) {
    throw new CliError(`Invalid Marketplace plan ID: ${value}`, 2);
  }
  return normalized;
}

export const RXNORM_SEARCH_MODES = {
  exact: 0,
  normalized: 1,
  "exact-or-normalized": 2,
  approximate: 9,
} as const;

export type RxNormSearchMode = keyof typeof RXNORM_SEARCH_MODES;

export class RxNormClient {
  constructor(
    private readonly fetchImpl: FetchLike = fetch,
    private readonly timeoutMs = DEFAULT_TIMEOUT_MS,
    private readonly baseUrl = RXNORM_BASE_URL,
  ) {}

  async version() {
    return requestJson(this.fetchImpl, new URL(`${this.baseUrl}/version.json`), this.timeoutMs);
  }

  async normalize(name: string, mode: RxNormSearchMode = "exact-or-normalized") {
    const query = name.trim();
    if (!query) throw new CliError("name is required.", 2);
    const searchCode = RXNORM_SEARCH_MODES[mode];
    if (searchCode === undefined) throw new CliError(`Unsupported RxNorm search mode: ${mode}`, 2);

    const url = new URL(`${this.baseUrl}/rxcui.json`);
    url.searchParams.set("name", query);
    url.searchParams.set("allsrc", "0");
    url.searchParams.set("search", String(searchCode));
    const payload = objectValue(await requestJson(this.fetchImpl, url, this.timeoutMs));
    const ids = stringArray(objectValue(payload.idGroup).rxnormId);
    const candidates = await Promise.all(ids.map(async (rxcui) => {
      const details = objectValue(await this.product(rxcui, false));
      return details.properties ?? { rxcui };
    }));

    return {
      source: "rxnorm",
      query,
      mode,
      candidateCount: candidates.length,
      candidates,
      warning: candidates.length > 1
        ? "Multiple RxNorm concepts matched. Select the exact strength, dose form, and product before using coverage data."
        : undefined,
    };
  }

  async product(rxcui: string, includeNdcs = false) {
    const normalized = requireDigits(rxcui.trim(), "rxcui");
    const propertiesUrl = new URL(`${this.baseUrl}/rxcui/${normalized}/properties.json`);
    const propertiesPayload = objectValue(await requestJson(this.fetchImpl, propertiesUrl, this.timeoutMs));
    const result: Record<string, unknown> = {
      source: "rxnorm",
      rxcui: normalized,
      properties: propertiesPayload.properties ?? null,
    };

    if (includeNdcs) {
      const ndcUrl = new URL(`${this.baseUrl}/rxcui/${normalized}/ndcs.json`);
      const ndcPayload = objectValue(await requestJson(this.fetchImpl, ndcUrl, this.timeoutMs));
      const ndcGroup = objectValue(ndcPayload.ndcGroup);
      result.ndcs = stringArray(objectValue(ndcGroup.ndcList).ndc);
    }
    return result;
  }
}

export function marketplaceApiKey(env: NodeJS.ProcessEnv = process.env) {
  const value = env.CMS_MARKETPLACE_API_KEY?.trim();
  if (!value) {
    throw new CliError(
      "CMS_MARKETPLACE_API_KEY is required. Request a key at https://developer.cms.gov/marketplace-api/key-request.html",
      2,
    );
  }
  return value;
}

export class MarketplaceClient {
  constructor(
    private readonly apiKey: string,
    private readonly fetchImpl: FetchLike = fetch,
    private readonly timeoutMs = DEFAULT_TIMEOUT_MS,
    private readonly baseUrl = MARKETPLACE_BASE_URL,
  ) {
    if (!apiKey.trim()) throw new CliError("Marketplace API key cannot be empty.", 2);
  }

  private url(path: string, parameters: Record<string, string | number | undefined> = {}) {
    const url = new URL(`${this.baseUrl}${path}`);
    for (const [key, value] of Object.entries(parameters)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
    url.searchParams.set("apikey", this.apiKey);
    return url;
  }

  async marketYears() {
    return requestJson(this.fetchImpl, this.url("/market-years"), this.timeoutMs);
  }

  async searchDrugs(query: string, year?: number, autocomplete = false) {
    const q = query.trim();
    if (!q) throw new CliError("query is required.", 2);
    if (autocomplete && q.length < 3) throw new CliError("Autocomplete query must contain at least 3 characters.", 2);
    return requestJson(
      this.fetchImpl,
      this.url(autocomplete ? "/drugs/autocomplete" : "/drugs/search", {
        q,
        year: year === undefined ? undefined : requireMarketYear(year),
      }),
      this.timeoutMs,
    );
  }

  async drugCoverage(rxcuis: string[], planIds: string[], year: number) {
    if (!rxcuis.length) throw new CliError("At least one rxcui is required.", 2);
    if (!planIds.length) throw new CliError("At least one plan-id is required.", 2);
    const drugs = rxcuis.map((value) => requireDigits(value.trim(), "rxcui"));
    const plans = planIds.map(requirePlanId);
    return requestJson(
      this.fetchImpl,
      this.url("/drugs/covered", {
        drugs: drugs.join(","),
        planids: plans.join(","),
        year: requireMarketYear(year),
      }),
      this.timeoutMs,
    );
  }

  async plan(planId: string, year: number) {
    const normalized = requirePlanId(planId);
    return requestJson(
      this.fetchImpl,
      this.url(`/plans/${encodeURIComponent(normalized)}`, { year: requireMarketYear(year) }),
      this.timeoutMs,
    );
  }
}
