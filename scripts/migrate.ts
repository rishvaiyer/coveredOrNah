import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../db.js";

if (!pool) throw new Error("DATABASE_URL is required for migrations.");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migration = await readFile(path.join(root, "sql", "001_medicare_formulary.sql"), "utf8");
await pool.query(migration);
await pool.end();
console.log("Medicare formulary schema is ready.");
