import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { pool } from "../db.js";

const planFile = process.env.CMS_PLAN_FILE;
const drugFile = process.env.CMS_DRUG_FILE;
const sourceUrl = process.env.CMS_SOURCE_URL ?? "https://data.cms.gov/provider-summary-by-type-of-service/medicare-part-d-prescribers/monthly-prescription-drug-plan-formulary-and-pharmacy-network-information";
const sourceVersion = process.env.CMS_SOURCE_VERSION ?? new Date().toISOString().slice(0, 10);
if (!pool || !planFile || !drugFile) throw new Error("DATABASE_URL, CMS_PLAN_FILE, and CMS_DRUG_FILE are required.");

const readRows = async (file: string, onRow: (row: Record<string, string>) => Promise<void>) => {
  const input = createInterface({ input: createReadStream(file), crlfDelay: Infinity });
  let headers: string[] | null = null;
  for await (const line of input) {
    if (!headers) { headers = line.split("|"); continue; }
    const values = line.split("|");
    await onRow(Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
  }
};

const client = await pool.connect();
try {
  await client.query("BEGIN");
  const imported = await client.query<{ id: number }>("INSERT INTO formulary_imports (source_url, source_version, status) VALUES ($1, $2, 'running') RETURNING id", [sourceUrl, sourceVersion]);
  const importId = imported.rows[0].id;
  const formularies = new Set<string>(); let planCount = 0;
  await readRows(planFile, async (row) => {
    const eligible = row.PLAN_SUPPRESSED_YN !== "Y" && ((row.STATE && ["NJ", "NY", "PA"].includes(row.STATE)) || row.PDP_REGION_CODE === "04" || row.MA_REGION_CODE === "04");
    if (!eligible || !row.FORMULARY_ID) return;
    formularies.add(row.FORMULARY_ID);
    await client.query(`INSERT INTO medicare_plans (import_id, contract_id, plan_id, segment_id, contract_name, plan_name, formulary_id, state, county_code, ma_region_code, pdp_region_code) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [importId, row.CONTRACT_ID, row.PLAN_ID, row.SEGMENT_ID || "000", row.CONTRACT_NAME, row.PLAN_NAME, row.FORMULARY_ID, row.STATE || null, row.COUNTY_CODE || null, row.MA_REGION_CODE || null, row.PDP_REGION_CODE || null]);
    planCount += 1;
  });
  let drugCount = 0;
  await readRows(drugFile, async (row) => {
    if (!formularies.has(row.FORMULARY_ID)) return;
    await client.query(`INSERT INTO medicare_formulary_drugs (import_id, formulary_id, rxcui, ndc, tier_level, quantity_limit, quantity_limit_amount, quantity_limit_days, prior_authorization, step_therapy, selected_drug) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT DO NOTHING`, [importId, row.FORMULARY_ID, row.RXCUI || null, row.NDC || null, Number(row.TIER_LEVEL_VALUE) || null, row.QUANTITY_LIMIT_YN === "Y", row.QUANTITY_LIMIT_AMOUNT || null, row.QUANTITY_LIMIT_DAYS || null, row.PRIOR_AUTHORIZATION_YN === "Y", row.STEP_THERAPY_YN === "Y", row.SELECTED_DRUG_YN === "Y"]);
    drugCount += 1;
  });
  await client.query("UPDATE formulary_imports SET status = 'succeeded', plan_count = $2, drug_count = $3 WHERE id = $1", [importId, planCount, drugCount]);
  await client.query("COMMIT"); console.log(JSON.stringify({ importId, planCount, drugCount, formularyCount: formularies.size }));
} catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); await pool.end(); }
