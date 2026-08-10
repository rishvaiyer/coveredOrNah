import { Pool } from "pg";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const databaseUrl = process.env.DATABASE_URL;

export const pool = databaseUrl
  ? new Pool({ connectionString: databaseUrl, max: 5 })
  : null;

export const withDb = async <T>(callback: (database: Pool) => Promise<T>) => {
  if (!pool) return null;
  return callback(pool);
};

export const ensureFormularySchema = async () => {
  if (!pool) return false;
  const root = path.dirname(fileURLToPath(import.meta.url));
  const migration = await readFile(path.join(root, "sql", "001_medicare_formulary.sql"), "utf8");
  await pool.query(migration);
  return true;
};
