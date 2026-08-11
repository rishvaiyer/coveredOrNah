import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import type { PoolClient } from "pg";
import { pool } from "../db.js";

const planFile = process.env.CMS_PLAN_FILE;
const drugFile = process.env.CMS_DRUG_FILE;
const sourceUrl = process.env.CMS_SOURCE_URL ?? "https://data.cms.gov/provider-summary-by-type-of-service/medicare-part-d-prescribers/monthly-prescription-drug-plan-formulary-and-pharmacy-network-information";
const sourceVersion = process.env.CMS_SOURCE_VERSION ?? new Date().toISOString().slice(0, 10);
const states = new Set((process.env.CMS_STATES ?? "NJ,NY,PA").split(",").map((value) => value.trim().toUpperCase()).filter(Boolean));
// CMS PDP regions: 02 New York, 04 New Jersey, 06 Pennsylvania/West Virginia.
const pdpRegions = new Set((process.env.CMS_PDP_REGION_CODES ?? "02,04,06").split(",").map((value) => value.trim()).filter(Boolean));
const batchSize = Number(process.env.CMS_IMPORT_BATCH_SIZE ?? "500");

if (!pool || !planFile || !drugFile) throw new Error("DATABASE_URL, CMS_PLAN_FILE, and CMS_DRUG_FILE are required.");
if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 1_000) throw new Error("CMS_IMPORT_BATCH_SIZE must be an integer between 1 and 1000.");
if (states.size === 0 || pdpRegions.size === 0) throw new Error("CMS_STATES and CMS_PDP_REGION_CODES must contain at least one value.");

type CmsRow = Record<string, string>;

const requiredPlanHeaders = ["PLAN_SUPPRESSED_YN", "STATE", "PDP_REGION_CODE", "FORMULARY_ID", "CONTRACT_ID", "PLAN_ID", "SEGMENT_ID", "CONTRACT_NAME", "PLAN_NAME", "COUNTY_CODE", "MA_REGION_CODE"];
const requiredDrugHeaders = ["FORMULARY_ID", "RXCUI", "NDC", "TIER_LEVEL_VALUE", "QUANTITY_LIMIT_YN", "QUANTITY_LIMIT_AMOUNT", "QUANTITY_LIMIT_DAYS", "PRIOR_AUTHORIZATION_YN", "STEP_THERAPY_YN", "SELECTED_DRUG_YN"];

async function forEachPipeRow(file: string, requiredHeaders: string[], onRow: (row: CmsRow) => Promise<void>) {
  const input = createInterface({ input: createReadStream(file), crlfDelay: Infinity });
  let headers: string[] | undefined;
  let lineNumber = 0;

  for await (const line of input) {
    lineNumber += 1;
    if (!headers) {
      headers = line.split("|");
      const missing = requiredHeaders.filter((header) => !headers!.includes(header));
      if (missing.length) throw new Error(`${file} is missing CMS headers: ${missing.join(", ")}`);
      continue;
    }
    if (!line) continue;
    const values = line.split("|");
    if (values.length > headers.length) throw new Error(`${file}:${lineNumber} has more columns than its CMS header.`);
    await onRow(Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
  }

  if (!headers) throw new Error(`${file} is empty.`);
}

function asNullable(value: string) {
  return value || null;
}

function asTier(value: string) {
  const tier = Number(value);
  return Number.isInteger(tier) && tier > 0 ? tier : null;
}

async function insertRows(client: PoolClient, table: string, columns: string[], rows: Array<Array<string | number | boolean | null>>) {
  if (!rows.length) return;
  const values: Array<string | number | boolean | null> = [];
  const placeholders = rows.map((row, rowIndex) => {
    const offset = rowIndex * columns.length;
    values.push(...row);
    return `(${row.map((_, columnIndex) => `$${offset + columnIndex + 1}`).join(",")})`;
  });
  await client.query(`INSERT INTO ${table} (${columns.join(",")}) VALUES ${placeholders.join(",")} ON CONFLICT DO NOTHING`, values);
}

const client = await pool.connect();
let importId: number | undefined;
try {
  const created = await client.query<{ id: number }>("INSERT INTO formulary_imports (source_url, source_version, status) VALUES ($1, $2, 'running') RETURNING id", [sourceUrl, sourceVersion]);
  importId = created.rows[0].id;
  await client.query("BEGIN");

  const formularies = new Set<string>();
  let planCount = 0;
  let planRows: Array<Array<string | number | boolean | null>> = [];
  const planColumns = ["import_id", "contract_id", "plan_id", "segment_id", "contract_name", "plan_name", "formulary_id", "state", "county_code", "ma_region_code", "pdp_region_code"];
  const flushPlans = async () => {
    await insertRows(client, "medicare_plans", planColumns, planRows);
    planRows = [];
  };

  await forEachPipeRow(planFile, requiredPlanHeaders, async (row) => {
    const state = row.STATE.toUpperCase();
    const eligible = row.PLAN_SUPPRESSED_YN !== "Y" && (states.has(state) || pdpRegions.has(row.PDP_REGION_CODE));
    if (!eligible || !row.FORMULARY_ID) return;
    formularies.add(row.FORMULARY_ID);
    planRows.push([importId!, row.CONTRACT_ID, row.PLAN_ID, row.SEGMENT_ID || "000", row.CONTRACT_NAME, row.PLAN_NAME, row.FORMULARY_ID, asNullable(state), asNullable(row.COUNTY_CODE), asNullable(row.MA_REGION_CODE), asNullable(row.PDP_REGION_CODE)]);
    planCount += 1;
    if (planRows.length >= batchSize) await flushPlans();
  });
  await flushPlans();

  let drugCount = 0;
  let drugRows: Array<Array<string | number | boolean | null>> = [];
  const drugColumns = ["import_id", "formulary_id", "rxcui", "ndc", "tier_level", "quantity_limit", "quantity_limit_amount", "quantity_limit_days", "prior_authorization", "step_therapy", "selected_drug"];
  const flushDrugs = async () => {
    await insertRows(client, "medicare_formulary_drugs", drugColumns, drugRows);
    drugRows = [];
  };

  await forEachPipeRow(drugFile, requiredDrugHeaders, async (row) => {
    if (!formularies.has(row.FORMULARY_ID)) return;
    drugRows.push([importId!, row.FORMULARY_ID, asNullable(row.RXCUI), asNullable(row.NDC), asTier(row.TIER_LEVEL_VALUE), row.QUANTITY_LIMIT_YN === "Y", asNullable(row.QUANTITY_LIMIT_AMOUNT), asNullable(row.QUANTITY_LIMIT_DAYS), row.PRIOR_AUTHORIZATION_YN === "Y", row.STEP_THERAPY_YN === "Y", row.SELECTED_DRUG_YN === "Y"]);
    drugCount += 1;
    if (drugRows.length >= batchSize) await flushDrugs();
  });
  await flushDrugs();

  await client.query("UPDATE formulary_imports SET status = 'succeeded', plan_count = $2, drug_count = $3 WHERE id = $1", [importId, planCount, drugCount]);
  await client.query("COMMIT");
  console.log(JSON.stringify({ importId, planCount, drugCount, formularyCount: formularies.size, states: [...states], pdpRegions: [...pdpRegions] }));
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  if (importId) await client.query("UPDATE formulary_imports SET status = 'failed', error = $2 WHERE id = $1", [importId, error instanceof Error ? error.message : String(error)]).catch(() => undefined);
  throw error;
} finally {
  client.release();
  await pool.end();
}
