import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../data/formulary-source-manifest.json", import.meta.url), "utf8")) as {
  schemaVersion: number;
  asOf: string;
  baselines: Array<{ planKey: string; sourceUrl: string; refreshCadence: string; completenessClass: string }>;
};

if (manifest.schemaVersion !== 1 || !manifest.asOf || !manifest.baselines.length) throw new Error("Invalid formulary source manifest");
const invalid = manifest.baselines.filter((source) => !source.planKey || !/^https:\/\//.test(source.sourceUrl) || !source.refreshCadence || !source.completenessClass);
if (invalid.length) throw new Error(`Invalid source entries: ${invalid.map((source) => source.planKey).join(", ")}`);
const asOf = new Date(`${manifest.asOf}T00:00:00Z`);
if (Number.isNaN(asOf.getTime())) throw new Error(`Invalid manifest asOf date: ${manifest.asOf}`);
const ageDays = Math.floor((Date.now() - asOf.getTime()) / 86_400_000);
const cadenceBudgetDays: Record<string, number> = {
  "monthly and at plan-year rollover": 45,
  "monthly CMS refresh plus payer document check": 45,
  "quarterly and at plan-year rollover": 110,
  "source refresh plus monthly payer-document check": 45,
};
const overdue = manifest.baselines.filter((source) => {
  const budget = cadenceBudgetDays[source.refreshCadence];
  return typeof budget === "number" && ageDays > budget;
});
const status = ageDays <= 2 ? "fresh" : overdue.length ? "refresh-due" : "current";
console.log(JSON.stringify({ asOf: manifest.asOf, verifiedAt: new Date().toISOString().slice(0, 10), sourceCount: manifest.baselines.length, ageDays, status, overdueSources: overdue.map((source) => source.planKey) }));
