export type CmsRow = Record<string, string>;

export const PDP_REGION_BY_STATE: Record<string, string> = {
  NJ: "04",
  NY: "02",
  PA: "06",
};

export function normalizeCmsRow(headers: string[], values: string[]): CmsRow {
  return Object.fromEntries(
    headers.map((header, index) => [header.trim(), (values[index] ?? "").trim()]),
  );
}

export function isEligibleCmsPlan(
  row: CmsRow,
  states: Set<string>,
  pdpRegions: Set<string>,
) {
  return (
    row.PLAN_SUPPRESSED_YN !== "Y" &&
    (states.has(row.STATE.toUpperCase()) || pdpRegions.has(row.PDP_REGION_CODE))
  );
}
