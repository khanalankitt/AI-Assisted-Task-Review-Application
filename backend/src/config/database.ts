import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from './env';

const dbPath = config.dbPath;

if (dbPath !== ':memory:') {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export const db = new Database(dbPath);

if (dbPath !== ':memory:') {
  db.pragma('journal_mode = WAL');
}

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    analysis TEXT
  )
`);

// Lightweight migration: add the analysis column to databases created before
// AI analysis was persisted.
const columns = db.prepare('PRAGMA table_info(tasks)').all() as {
  name: string;
}[];
if (!columns.some((col) => col.name === 'analysis')) {
  db.exec('ALTER TABLE tasks ADD COLUMN analysis TEXT');
}
