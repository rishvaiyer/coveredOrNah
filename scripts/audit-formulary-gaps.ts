import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  coverageFor,
  medications,
  primaryNjPlans,
  type Coverage,
  type CoverageState,
  type Medication,
  type PlanKey,
} from "../src/components/generated/PulmonaryFormularyDashboard.js";

export const VALID_COVERAGE_STATES = [
  "Preferred",
  "Preferred + PA",
  "Tier 1",
  "Tier 1 + PA",
  "Tier 2",
  "Tier 2 + PA",
  "Tier 3",
  "Tier 4",
  "Tier 5",
  "Tier varies",
  "Non-preferred",
  "Not on PDL",
  "Source loading",
  "Generic",
  "Low-cost generic",
  "Preferred brand",
  "Listed in PDL",
  "Non-preferred drug",
  "Non-formulary",
] as const satisfies readonly CoverageState[];

type AuditedPlan = Pick<(typeof plans)[number], "key" | "short" | "name">;
type CoverageResolver = (medication: Medication, plan: PlanKey) => Coverage;

export type GapAudit = {
  summary: {
    medicationCount: number;
    planCount: number;
    totalCells: number;
    confirmedCells: number;
    unconfirmedCells: number;
    unconfirmedPercent: number;
  };
  byPlan: Array<{
    planKey: PlanKey;
    planName: string;
    totalCells: number;
    confirmedCells: number;
    unconfirmedCells: number;
  }>;
  byTherapeuticArea: Array<{
    therapeuticArea: string;
    medicationCount: number;
    totalCells: number;
    confirmedCells: number;
    unconfirmedCells: number;
  }>;
  byMedication: Array<{
    medication: string;
    therapeuticArea: string;
    totalCells: number;
    confirmedCells: number;
    unconfirmedCells: number;
  }>;
};

export function auditCoverageGaps(
  medicationRows: readonly Medication[] = medications,
  planRows: readonly AuditedPlan[] = primaryNjPlans,
  resolveCoverage: CoverageResolver = coverageFor,
): GapAudit {
  const validStates = new Set<string>(VALID_COVERAGE_STATES);
  const planKeys = new Set<string>();
  for (const plan of planRows) {
    if (planKeys.has(plan.key)) throw new Error(`Duplicate baseline plan key: ${plan.key}`);
    planKeys.add(plan.key);
  }

  const cells = medicationRows.flatMap((medication) =>
    planRows.map((plan) => {
      const state = resolveCoverage(medication, plan.key).state as string;
      if (!validStates.has(state)) {
        throw new Error(
          `Invalid coverage state "${state}" for medication "${medication.generic}" and plan "${plan.key}".`,
        );
      }
      return {
        medication: medication.generic,
        therapeuticArea: medication.branch,
        planKey: plan.key,
        unconfirmed: state === "Source loading",
      };
    }),
  );

  const unconfirmedCells = cells.filter((cell) => cell.unconfirmed).length;
  const totalCells = cells.length;
  const countCells = (selected: typeof cells) => {
    const unconfirmed = selected.filter((cell) => cell.unconfirmed).length;
    return {
      totalCells: selected.length,
      confirmedCells: selected.length - unconfirmed,
      unconfirmedCells: unconfirmed,
    };
  };

  const therapeuticAreas = [...new Set(medicationRows.map((medication) => medication.branch))].sort();

  return {
    summary: {
      medicationCount: medicationRows.length,
      planCount: planRows.length,
      totalCells,
      confirmedCells: totalCells - unconfirmedCells,
      unconfirmedCells,
      unconfirmedPercent: totalCells === 0 ? 0 : Number(((unconfirmedCells / totalCells) * 100).toFixed(2)),
    },
    byPlan: planRows.map((plan) => ({
      planKey: plan.key,
      planName: plan.name,
      ...countCells(cells.filter((cell) => cell.planKey === plan.key)),
    })),
    byTherapeuticArea: therapeuticAreas.map((therapeuticArea) => ({
      therapeuticArea,
      medicationCount: medicationRows.filter((medication) => medication.branch === therapeuticArea).length,
      ...countCells(cells.filter((cell) => cell.therapeuticArea === therapeuticArea)),
    })),
    byMedication: medicationRows
      .map((medication) => ({
        medication: medication.generic,
        therapeuticArea: medication.branch,
        ...countCells(cells.filter((cell) => cell.medication === medication.generic)),
      }))
      .sort((left, right) => left.medication.localeCompare(right.medication)),
  };
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  try {
    process.stdout.write(`${JSON.stringify(auditCoverageGaps(), null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
