import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { CliError } from "./client.js";
import { normalizeQhpFormulary, QHP_SCHEMA_REFERENCES } from "./qhp.js";

export const DEMO_FIXTURE_DATE = "2026-08-12";
export const DEMO_FIXTURE_REFERENCE = "fixtures/qhp-valid.json";

export type DemoVerification = {
  status: "passed";
  demo: "cms-qhp-formulary-normalization";
  deterministic: true;
  networkAccess: false;
  source: {
    id: "bundled-qhp-demo-fixture";
    reference: typeof DEMO_FIXTURE_REFERENCE;
    date: typeof DEMO_FIXTURE_DATE;
    sha256: string;
    schema: "CMS QHP drugs.json";
    schemaReferences: typeof QHP_SCHEMA_REFERENCES;
  };
  counts: {
    inputDrugs: number;
    planAssociations: number;
    candidateRows: number;
    completeCandidates: number;
    incompleteCandidates: number;
    rejectedAssociations: number;
    issues: number;
    errors: number;
    warnings: number;
    gaps: number;
  };
  validationStatus: "complete";
};

function gapCount(gaps: Record<string, number>) {
  return Object.values(gaps).reduce((total, count) => total + count, 0);
}

export async function verifyBundledDemo(): Promise<DemoVerification> {
  const fixtureUrl = new URL(`./${DEMO_FIXTURE_REFERENCE}`, import.meta.url);
  const bytes = await readFile(fileURLToPath(fixtureUrl));
  let payload: unknown;
  try {
    payload = JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new CliError("Bundled demo fixture is not valid JSON.", 1);
  }

  const result = normalizeQhpFormulary(payload);
  const counts = {
    inputDrugs: result.summary.inputDrugCount,
    planAssociations: result.summary.planAssociationCount,
    candidateRows: result.summary.candidateRowCount,
    completeCandidates: result.summary.completeCandidateCount,
    incompleteCandidates: result.summary.incompleteCandidateCount,
    rejectedAssociations: result.summary.rejectedAssociationCount,
    issues: result.issueSummary.totalIssueCount,
    errors: result.issueSummary.errorCount,
    warnings: result.issueSummary.warningCount,
    gaps: gapCount(result.gapSummary),
  };

  const passed = result.summary.validationStatus === "complete"
    && counts.candidateRows > 0
    && counts.completeCandidates === counts.candidateRows
    && counts.rejectedAssociations === 0
    && counts.issues === 0
    && counts.gaps === 0;
  if (!passed) {
    throw new CliError("Bundled QHP demo verification failed.", 1, {
      validationStatus: result.summary.validationStatus,
      counts,
    });
  }

  return {
    status: "passed",
    demo: "cms-qhp-formulary-normalization",
    deterministic: true,
    networkAccess: false,
    source: {
      id: "bundled-qhp-demo-fixture",
      reference: DEMO_FIXTURE_REFERENCE,
      date: DEMO_FIXTURE_DATE,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      schema: "CMS QHP drugs.json",
      schemaReferences: QHP_SCHEMA_REFERENCES,
    },
    counts,
    validationStatus: "complete",
  };
}
