import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  coverageFor,
  medications,
  type Medication,
} from "../src/components/generated/PulmonaryFormularyDashboard.js";
import {
  plans,
  primaryNjPlans,
  type PlanDefinition,
  type PlanKey,
} from "../src/components/generated/formularyPlanRegistry.js";
import { auditCoverageGaps } from "./audit-formulary-gaps.js";

type Lane =
  | "marketplace"
  | "commercial_fully_insured"
  | "medicare_advantage_part_d"
  | "medicaid_managed_care"
  | "carrier_reference";

type UniverseEntry = {
  planKey: PlanKey;
  planName: string;
  state: string;
  coverageLane: Lane;
  exactnessLevel: "exact_plan" | "plan_family" | "carrier_reference";
  sourceName: string;
  sourceUrl: string;
  sourceUpdated: string;
  refreshCadence: string | null;
  completenessClass: string | null;
  manifestAsOf: string | null;
  priorAuthorizationUrl: string | null;
  totalCells: number;
  confirmedCells: number;
  unconfirmedCells: number;
};

const LANE_BY_PLAN: Record<PlanKey, Lane> = {
  nyrx: "carrier_reference",
  njuhc: "carrier_reference",
  pama: "carrier_reference",
  horizonMarketplace: "marketplace",
  ambetterNjMarketplace: "marketplace",
  horizonClassic: "commercial_fully_insured",
  uhcCommercial: "carrier_reference",
  oxfordFreedom: "carrier_reference",
  aetnaMedicareHmo: "medicare_advantage_part_d",
  amerihealthNj: "marketplace",
  amerihealthValue: "marketplace",
  amerihealthSelect: "marketplace",
  cignaNationalPreferred: "carrier_reference",
  oscarNjIndividual: "marketplace",
  anthemNySelect: "marketplace",
  wellcareNjH0913: "medicare_advantage_part_d",
  humanaNj26408: "medicare_advantage_part_d",
  bravenNjH0885: "medicare_advantage_part_d",
  healthspringNj26096: "medicare_advantage_part_d",
  cloverNj2026: "medicare_advantage_part_d",
  wellpointNjFamilyCare: "medicaid_managed_care",
};

const EXACTNESS_BY_PLAN: Record<PlanKey, UniverseEntry["exactnessLevel"]> = {
  nyrx: "carrier_reference",
  njuhc: "carrier_reference",
  pama: "carrier_reference",
  horizonMarketplace: "plan_family",
  ambetterNjMarketplace: "plan_family",
  horizonClassic: "plan_family",
  uhcCommercial: "carrier_reference",
  oxfordFreedom: "carrier_reference",
  aetnaMedicareHmo: "exact_plan",
  amerihealthNj: "plan_family",
  amerihealthValue: "plan_family",
  amerihealthSelect: "plan_family",
  cignaNationalPreferred: "carrier_reference",
  oscarNjIndividual: "plan_family",
  anthemNySelect: "plan_family",
  wellcareNjH0913: "plan_family",
  humanaNj26408: "plan_family",
  bravenNjH0885: "plan_family",
  healthspringNj26096: "plan_family",
  cloverNj2026: "plan_family",
  wellpointNjFamilyCare: "plan_family",
};

type QueueReason = "UNCONFIRMED_NO_EXACT_PRODUCT" | "UNCONFIRMED_AMBIGUOUS_PRODUCT";

type QueueEntry = {
  planKey: PlanKey;
  planName: string;
  medication: string;
  therapeuticArea: string;
  reasonCode: QueueReason;
  productNote: string | null;
  requiredEvidence: string;
};

function main(): void {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const dataDir = path.resolve(here, "../data");
  const manifestPath = path.join(dataDir, "formulary-source-manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
    asOf: string;
    baselines: Array<{ planKey: string; sourceUrl: string; refreshCadence: string; completenessClass: string }>;
  };
  const manifestByPlan = new Map(manifest.baselines.map((b) => [b.planKey, b]));

  const audit = auditCoverageGaps(medications, primaryNjPlans);
  const byPlan = new Map(audit.byPlan.map((row) => [row.planKey, row]));
  if (byPlan.size !== primaryNjPlans.length) throw new Error("Audit plan set does not match registry");

  const universe: UniverseEntry[] = primaryNjPlans.map((plan: PlanDefinition & { key: PlanKey }) => {
    const counts = byPlan.get(plan.key);
    if (!counts) throw new Error(`Missing audit row for ${plan.key}`);
    const sourceMeta = manifestByPlan.get(plan.key) ?? null;
    return {
      planKey: plan.key,
      planName: plan.name,
      state: plan.region,
      coverageLane: LANE_BY_PLAN[plan.key],
      exactnessLevel: EXACTNESS_BY_PLAN[plan.key],
      sourceName: plan.short,
      sourceUrl: plan.source,
      sourceUpdated: plan.updated,
      refreshCadence: sourceMeta ? sourceMeta.refreshCadence : null,
      completenessClass: sourceMeta ? sourceMeta.completenessClass : null,
      manifestAsOf: manifest.asOf,
      priorAuthorizationUrl: plan.priorAuthorizationUrl ?? null,
      totalCells: counts.totalCells,
      confirmedCells: counts.confirmedCells,
      unconfirmedCells: counts.unconfirmedCells,
    };
  });

  const queue: QueueEntry[] = [];
  for (const medication of medications as readonly Medication[]) {
    for (const plan of primaryNjPlans) {
      const coverage = coverageFor(medication, plan.key);
      if (coverage.state !== "Source loading") continue;
      const note = coverage.productNote?.trim() || null;
      queue.push({
        planKey: plan.key,
        planName: plan.name,
        medication: medication.generic,
        therapeuticArea: medication.branch,
        reasonCode: note ? "UNCONFIRMED_AMBIGUOUS_PRODUCT" : "UNCONFIRMED_NO_EXACT_PRODUCT",
        productNote: note,
        requiredEvidence: note
          ? "Exact product/strength/device row from the current official plan-family source"
          : "Exact product row from the current official source; absence is not a denial",
      });
    }
  }

  const expectedUnconfirmed = audit.summary.unconfirmedCells;
  if (queue.length !== expectedUnconfirmed) {
    throw new Error(`Queue length ${queue.length} != audit unconfirmed ${expectedUnconfirmed}`);
  }

  mkdirSync(dataDir, { recursive: true });
  const universeDoc = {
    schemaVersion: 1,
    generatedBy: "scripts/generate-phase0-artifacts.ts",
    generatedAt: new Date().toISOString().slice(0, 10),
    freshnessAsOf: manifest.asOf,
    summary: audit.summary,
    plans: universe,
  };
  const queueDoc = {
    schemaVersion: 1,
    generatedBy: "scripts/generate-phase0-artifacts.ts",
    generatedAt: new Date().toISOString().slice(0, 10),
    freshnessAsOf: manifest.asOf,
    summary: {
      totalUnconfirmed: queue.length,
      ambiguousProduct: queue.filter((q) => q.reasonCode === "UNCONFIRMED_AMBIGUOUS_PRODUCT").length,
      noExactProduct: queue.filter((q) => q.reasonCode === "UNCONFIRMED_NO_EXACT_PRODUCT").length,
    },
    cells: queue.sort(
      (a, b) =>
        a.planKey.localeCompare(b.planKey) || a.medication.localeCompare(b.medication),
    ),
  };
  writeFileSync(path.join(dataDir, "payer-universe.json"), `${JSON.stringify(universeDoc, null, 2)}\n`);
  writeFileSync(path.join(dataDir, "unconfirmed-queue.json"), `${JSON.stringify(queueDoc, null, 2)}\n`);
  process.stdout.write(
    `payer-universe.json: ${universe.length} plans; unconfirmed-queue.json: ${queue.length} cells (${queueDoc.summary.ambiguousProduct} ambiguous, ${queueDoc.summary.noExactProduct} no-exact-product)\n`,
  );
}

main();
