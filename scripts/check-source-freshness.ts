import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../data/formulary-source-manifest.json", import.meta.url), "utf8")) as {
  schemaVersion: number;
  asOf: string;
  baselines: Array<{ planKey: string; sourceUrl: string; refreshCadence: string; completenessClass: string }>;
};

if (manifest.schemaVersion !== 1 || !manifest.asOf || !manifest.baselines.length) throw new Error("Invalid formulary source manifest");
const invalid = manifest.baselines.filter((source) => !source.planKey || !/^https:\/\//.test(source.sourceUrl) || !source.refreshCadence || !source.completenessClass);
if (invalid.length) throw new Error(`Invalid source entries: ${invalid.map((source) => source.planKey).join(", ")}`);
console.log(JSON.stringify({ asOf: manifest.asOf, sourceCount: manifest.baselines.length, status: "ready-for-refresh" }));
