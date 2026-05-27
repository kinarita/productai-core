import "server-only";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const dataDir = path.join(process.cwd(), "data");
const dbFilePath = path.join(dataDir, "productai.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbFilePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function getDbPath() {
  return dbFilePath;
}
