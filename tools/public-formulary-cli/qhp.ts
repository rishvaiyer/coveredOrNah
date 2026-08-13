import { readFile, stat } from "node:fs/promises";
import { isIP } from "node:net";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CliError, DEFAULT_TIMEOUT_MS, type FetchLike } from "./client.js";

export const DEFAULT_QHP_MAX_BYTES = 100 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const MAX_REPORTED_ISSUES = 1_000;

export const QHP_SCHEMA_REFERENCES = [
  "https://github.com/CMSgov/QHP-provider-formulary-APIs",
  "https://www.qhpcertification.cms.gov/s/PY25MRIssuerGuide08.05.24_final.pdf",
] as const;

type JsonObject = Record<string, unknown>;

export type QhpCandidateRow = {
  sourceDrugIndex: number;
  sourcePlanIndex: number;
  rxcui: string;
  drugName: string;
  planIdType: "HIOS-PLAN-ID";
  planId: string;
  drugTier: string;
  priorAuthorization: boolean | null;
  stepTherapy: boolean | null;
  quantityLimit: boolean | null;
  years: number[];
  validationStatus: "complete" | "candidate-with-gaps";
  gaps: string[];
};

export type QhpValidationIssue = {
  severity: "error" | "warning";
  code: string;
  path: string;
  message: string;
};

type GapSummary = {
  missingPriorAuthorizationCount: number;
  missingStepTherapyCount: number;
  missingQuantityLimitCount: number;
  invalidRestrictionValueCount: number;
  missingYearsCount: number;
  invalidYearsCount: number;
  normalizedFormattingCount: number;
  duplicateCandidateCount: number;
};

type SourceDescriptor = {
  kind: "file" | "url";
  reference: string;
  bytes: number;
};

function asObject(value: unknown): JsonObject | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as JsonObject
    : undefined;
}

function sanitizedUrlReference(url: URL) {
  return `${url.origin}${url.pathname}`;
}

function validateRemoteUrl(url: URL) {
  if (url.protocol !== "https:") throw new CliError("Remote QHP formulary URLs must use HTTPS.", 2);
  if (url.username || url.password) throw new CliError("Remote QHP formulary URLs cannot include credentials.", 2);
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || isIP(host)) {
    throw new CliError("Remote QHP formulary URLs must use a public hostname, not a local or literal IP address.", 2);
  }
}

async function readResponseWithinLimit(response: Response, maxBytes: number, controller: AbortController) {
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    controller.abort();
    throw new CliError(`Remote QHP formulary exceeds the ${maxBytes}-byte limit.`, 2);
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
      throw new CliError(`Remote QHP formulary exceeds the ${maxBytes}-byte limit.`, 2);
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

async function fetchRemoteJson(
  initialUrl: URL,
  fetchImpl: FetchLike,
  timeoutMs: number,
  maxBytes: number,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let url = initialUrl;

  try {
    for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
      validateRemoteUrl(url);
      const response = await fetchImpl(url, {
        headers: { accept: "application/json" },
        redirect: "manual",
        signal: controller.signal,
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) throw new CliError("Remote QHP formulary redirect did not include a location.", 1);
        if (redirectCount === MAX_REDIRECTS) throw new CliError(`Remote QHP formulary exceeded ${MAX_REDIRECTS} redirects.`, 1);
        url = new URL(location, url);
        continue;
      }
      if (!response.ok) {
        throw new CliError(`Remote QHP formulary request failed with HTTP ${response.status}.`, 1, {
          status: response.status,
          source: sanitizedUrlReference(url),
        });
      }

      const bytes = await readResponseWithinLimit(response, maxBytes, controller);
      return {
        text: new TextDecoder().decode(bytes),
        source: { kind: "url", reference: sanitizedUrlReference(url), bytes: bytes.byteLength } satisfies SourceDescriptor,
      };
    }
    throw new CliError("Remote QHP formulary redirect could not be resolved.", 1);
  } catch (error) {
    if (error instanceof CliError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new CliError(`Remote QHP formulary request timed out after ${timeoutMs} ms.`, 1, {
        source: sanitizedUrlReference(url),
      });
    }
    throw new CliError("Remote QHP formulary could not be read.", 1, {
      source: sanitizedUrlReference(url),
      cause: error instanceof Error ? error.message : String(error),
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function readQhpFormularyInput(
  input: string,
  options: { fetchImpl?: FetchLike; timeoutMs?: number; maxBytes?: number } = {},
) {
  const value = input.trim();
  if (!value) throw new CliError("input is required.", 2);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = options.maxBytes ?? DEFAULT_QHP_MAX_BYTES;
  if (!Number.isInteger(maxBytes) || maxBytes < 1_024 || maxBytes > 500 * 1024 * 1024) {
    throw new CliError("maxBytes must be between 1024 and 524288000.", 2);
  }

  let loaded: { text: string; source: SourceDescriptor };
  if (/^https?:\/\//i.test(value)) {
    loaded = await fetchRemoteJson(new URL(value), options.fetchImpl ?? fetch, timeoutMs, maxBytes);
  } else {
    const path = value.startsWith("file:") ? fileURLToPath(new URL(value)) : resolve(value);
    const metadata = await stat(path).catch((error) => {
      throw new CliError("Local QHP formulary could not be inspected.", 1, {
        source: path,
        cause: error instanceof Error ? error.message : String(error),
      });
    });
    if (!metadata.isFile()) throw new CliError("Local QHP formulary input must be a file.", 2, { source: path });
    if (metadata.size > maxBytes) throw new CliError(`Local QHP formulary exceeds the ${maxBytes}-byte limit.`, 2, { source: path });
    const bytes = await readFile(path);
    loaded = { text: bytes.toString("utf8"), source: { kind: "file", reference: path, bytes: bytes.byteLength } };
  }

  try {
    return { payload: JSON.parse(loaded.text) as unknown, source: loaded.source };
  } catch (error) {
    throw new CliError("QHP formulary input is not valid JSON.", 1, {
      source: loaded.source.reference,
      cause: error instanceof Error ? error.message : String(error),
    });
  }
}

function normalizedText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizedTier(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "-");
}

function planYears(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  if (!value.every((year) => Number.isInteger(year) && Number(year) >= 2000 && Number(year) <= 2100)) return undefined;
  return [...new Set(value as number[])].sort((left, right) => left - right);
}

export function normalizeQhpFormulary(payload: unknown, source?: SourceDescriptor) {
  if (!Array.isArray(payload)) throw new CliError("QHP drugs.json root must be an array of drug records.", 2);

  const candidateRows: QhpCandidateRow[] = [];
  const issues: QhpValidationIssue[] = [];
  let totalIssueCount = 0;
  let errorCount = 0;
  let warningCount = 0;
  let planAssociationCount = 0;
  let rejectedAssociationCount = 0;
  const gaps: GapSummary = {
    missingPriorAuthorizationCount: 0,
    missingStepTherapyCount: 0,
    missingQuantityLimitCount: 0,
    invalidRestrictionValueCount: 0,
    missingYearsCount: 0,
    invalidYearsCount: 0,
    normalizedFormattingCount: 0,
    duplicateCandidateCount: 0,
  };
  const seen = new Set<string>();

  const issue = (entry: QhpValidationIssue) => {
    totalIssueCount += 1;
    if (entry.severity === "error") errorCount += 1;
    else warningCount += 1;
    if (issues.length < MAX_REPORTED_ISSUES) issues.push(entry);
  };

  for (let drugIndex = 0; drugIndex < payload.length; drugIndex += 1) {
    const drugPath = `$[${drugIndex}]`;
    const drug = asObject(payload[drugIndex]);
    if (!drug) {
      issue({ severity: "error", code: "INVALID_DRUG_RECORD", path: drugPath, message: "Drug record must be an object." });
      continue;
    }

    const rxcui = normalizedText(drug.rxnorm_id);
    const drugName = normalizedText(drug.drug_name);
    const plans = drug.plans;
    let drugValid = true;
    if (!/^\d+$/.test(rxcui)) {
      issue({ severity: "error", code: "INVALID_RXCUI", path: `${drugPath}.rxnorm_id`, message: "rxnorm_id is required and must contain digits only." });
      drugValid = false;
    }
    if (!drugName) {
      issue({ severity: "error", code: "MISSING_DRUG_NAME", path: `${drugPath}.drug_name`, message: "drug_name is required and must be a non-empty string." });
      drugValid = false;
    }
    if (!Array.isArray(plans) || plans.length === 0) {
      issue({ severity: "error", code: "INVALID_PLANS", path: `${drugPath}.plans`, message: "plans is required and must be a non-empty array." });
      continue;
    }

    for (let planIndex = 0; planIndex < plans.length; planIndex += 1) {
      planAssociationCount += 1;
      const planPath = `${drugPath}.plans[${planIndex}]`;
      const plan = asObject(plans[planIndex]);
      if (!plan || !drugValid) {
        rejectedAssociationCount += 1;
        if (!plan) issue({ severity: "error", code: "INVALID_PLAN_RECORD", path: planPath, message: "Plan association must be an object." });
        continue;
      }

      const rawPlanIdType = normalizedText(plan.plan_id_type);
      const planIdType = rawPlanIdType.toUpperCase();
      const rawPlanId = normalizedText(plan.plan_id);
      const planId = rawPlanId.toUpperCase();
      const rawTier = normalizedText(plan.drug_tier);
      const drugTier = normalizedTier(rawTier);
      let identifiersValid = true;

      if (planIdType !== "HIOS-PLAN-ID") {
        issue({ severity: "error", code: "INVALID_PLAN_ID_TYPE", path: `${planPath}.plan_id_type`, message: "Marketplace plan_id_type must be HIOS-PLAN-ID." });
        identifiersValid = false;
      }
      if (!/^\d{5}[A-Z]{2}\d{7}$/.test(planId)) {
        issue({ severity: "error", code: "INVALID_PLAN_ID", path: `${planPath}.plan_id`, message: "plan_id must be a 14-character HIOS Marketplace plan ID." });
        identifiersValid = false;
      }
      if (!drugTier || !/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(drugTier)) {
        issue({ severity: "error", code: "INVALID_DRUG_TIER", path: `${planPath}.drug_tier`, message: "drug_tier is required and must normalize to uppercase hyphenated text." });
        identifiersValid = false;
      }
      if (!identifiersValid) {
        rejectedAssociationCount += 1;
        continue;
      }

      if (planIdType !== rawPlanIdType || planId !== rawPlanId || drugTier !== rawTier) {
        gaps.normalizedFormattingCount += 1;
        issue({ severity: "warning", code: "NORMALIZED_FORMATTING", path: planPath, message: "Identifier casing or drug tier formatting was normalized to CMS conventions." });
      }

      const rowGaps: string[] = [];
      const restriction = (field: "prior_authorization" | "step_therapy" | "quantity_limit") => {
        const value = plan[field];
        if (value === undefined) {
          const counter = field === "prior_authorization"
            ? "missingPriorAuthorizationCount"
            : field === "step_therapy"
              ? "missingStepTherapyCount"
              : "missingQuantityLimitCount";
          gaps[counter] += 1;
          rowGaps.push(field);
          issue({ severity: "warning", code: "MISSING_RESTRICTION", path: `${planPath}.${field}`, message: `${field} is absent; it must remain unknown, not false.` });
          return null;
        }
        if (typeof value !== "boolean") {
          gaps.invalidRestrictionValueCount += 1;
          rowGaps.push(field);
          issue({ severity: "error", code: "INVALID_RESTRICTION", path: `${planPath}.${field}`, message: `${field} must be a JSON boolean when present.` });
          return null;
        }
        return value;
      };

      const priorAuthorization = restriction("prior_authorization");
      const stepTherapy = restriction("step_therapy");
      const quantityLimit = restriction("quantity_limit");
      let years: number[] = [];
      if (plan.years === undefined) {
        gaps.missingYearsCount += 1;
        rowGaps.push("years");
        issue({ severity: "warning", code: "MISSING_YEARS", path: `${planPath}.years`, message: "years is absent; current plan-year applicability is unknown." });
      } else {
        const validated = planYears(plan.years);
        if (!validated) {
          gaps.invalidYearsCount += 1;
          rowGaps.push("years");
          issue({ severity: "error", code: "INVALID_YEARS", path: `${planPath}.years`, message: "years must be a non-empty array of four-digit plan years." });
        } else {
          years = validated;
        }
      }

      const duplicateKey = [rxcui, planId, drugTier, priorAuthorization, stepTherapy, quantityLimit, years.join(",")].join("|");
      if (seen.has(duplicateKey)) {
        gaps.duplicateCandidateCount += 1;
        issue({ severity: "warning", code: "DUPLICATE_CANDIDATE", path: planPath, message: "Duplicate drug-plan-tier candidate was omitted." });
        continue;
      }
      seen.add(duplicateKey);
      candidateRows.push({
        sourceDrugIndex: drugIndex,
        sourcePlanIndex: planIndex,
        rxcui,
        drugName,
        planIdType: "HIOS-PLAN-ID",
        planId,
        drugTier,
        priorAuthorization,
        stepTherapy,
        quantityLimit,
        years,
        validationStatus: rowGaps.length ? "candidate-with-gaps" : "complete",
        gaps: rowGaps,
      });
    }
  }

  const incompleteCandidateCount = candidateRows.filter((row) => row.validationStatus !== "complete").length;
  return {
    schema: "CMS QHP drugs.json",
    schemaReferences: QHP_SCHEMA_REFERENCES,
    source: source ?? null,
    summary: {
      inputDrugCount: payload.length,
      planAssociationCount,
      candidateRowCount: candidateRows.length,
      completeCandidateCount: candidateRows.length - incompleteCandidateCount,
      incompleteCandidateCount,
      rejectedAssociationCount,
      validationStatus: errorCount > 0 || rejectedAssociationCount > 0 ? "invalid" : incompleteCandidateCount > 0 ? "gaps" : "complete",
    },
    gapSummary: gaps,
    issueSummary: {
      totalIssueCount,
      errorCount,
      warningCount,
      reportedIssueCount: issues.length,
      truncated: totalIssueCount > issues.length,
    },
    issues,
    candidateRows,
  };
}

export async function ingestQhpFormulary(
  input: string,
  options: { fetchImpl?: FetchLike; timeoutMs?: number; maxBytes?: number } = {},
) {
  const loaded = await readQhpFormularyInput(input, options);
  return normalizeQhpFormulary(loaded.payload, loaded.source);
}
