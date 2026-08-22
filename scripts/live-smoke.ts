const baseUrl = (process.env.FORMULARY_FINDER_LIVE_URL || "https://formulary-finder-pilot-production.up.railway.app").replace(/\/$/, "");

const getJson = async (path: string) => {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`);
  return response.json() as Promise<Record<string, unknown>>;
};

const health = await getJson("/api/health");
const plans = await getJson("/api/medicare/plans?q=Aetna&state=NJ&benefitType=ma");
const coverage = await getJson("/api/medicare/coverage?contractId=H3152&planId=098&segmentId=000&medication=Albuterol%20HFA");
const medications = await getJson("/api/medications?q=selexipag");

if (health.status !== "ok") throw new Error("Health check did not return status ok");
if (!Array.isArray(plans.plans) || plans.plans.length === 0) throw new Error("Medicare plan search returned no plans");
if (!Array.isArray(coverage.coverage) || coverage.coverage.length === 0) throw new Error("Medicare coverage returned no rows");
const selexipag = (medications.medications as Array<{ coverage?: Record<string, { state?: string }> }>).find((row) => row.coverage?.wellcareNjH0913?.state === "Tier 5");
if (!selexipag) throw new Error("Wellcare Selexipag smoke check failed");

console.log(JSON.stringify({ baseUrl, health: health.status, planCount: plans.plans.length, coverageCount: coverage.coverage.length, wellcareSelexipag: "Tier 5" }));
