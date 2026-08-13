import { pool } from "../db.js";
import { PDP_REGION_BY_STATE } from "./cms-medicare-utils.js";

const state = (process.env.CMS_CHECK_STATE ?? "NJ").trim().toUpperCase();
const pdpRegion = PDP_REGION_BY_STATE[state];

if (!pool) throw new Error("DATABASE_URL is required.");
if (!pdpRegion) throw new Error(`No standalone Part D region is configured for ${state}.`);

try {
  const result = await pool.query<{
    import_id: string;
    source_version: string;
    imported_at: string;
    medicare_advantage_plans: number;
    standalone_part_d_plans: number;
    standalone_part_d_formularies: number;
  }>(
    `SELECT
       i.id AS import_id,
       i.source_version,
       i.imported_at,
       count(DISTINCT (p.contract_id, p.plan_id, p.segment_id))
         FILTER (WHERE p.contract_id LIKE 'H%' AND p.state = $1)::int AS medicare_advantage_plans,
       count(DISTINCT (p.contract_id, p.plan_id, p.segment_id))
         FILTER (WHERE p.contract_id LIKE 'S%' AND p.pdp_region_code = $2)::int AS standalone_part_d_plans,
       count(DISTINCT p.formulary_id)
         FILTER (WHERE p.contract_id LIKE 'S%' AND p.pdp_region_code = $2)::int AS standalone_part_d_formularies
     FROM formulary_imports i
     LEFT JOIN medicare_plans p ON p.import_id = i.id
     WHERE i.id = (
       SELECT id FROM formulary_imports
       WHERE status = 'succeeded'
       ORDER BY imported_at DESC
       LIMIT 1
     )
     GROUP BY i.id, i.source_version, i.imported_at`,
    [state, pdpRegion],
  );

  if (!result.rowCount) throw new Error("No successful CMS Medicare import is available.");
  console.log(JSON.stringify({ state, pdpRegion, ...result.rows[0] }, null, 2));
} finally {
  await pool.end();
}
