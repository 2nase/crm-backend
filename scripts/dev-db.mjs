#!/usr/bin/env node
/**
 * Dev-only embedded Postgres bootstrap.
 *
 * Initialises a portable Postgres cluster under ./.pgdata, starts it on
 * localhost:${PG_PORT} (default 5432), and creates the ${DB_NAME} database
 * (default ai_crm) if missing. Runs in the foreground until SIGINT/SIGTERM.
 *
 * Usage:
 *   node scripts/dev-db.mjs              # start cluster, keep running
 *   PG_PORT=5433 node scripts/dev-db.mjs # custom port
 */
import EmbeddedPostgres from 'embedded-postgres';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', '.pgdata');
const DB_NAME = process.env.DB_NAME || 'ai_crm';
const PORT = parseInt(process.env.PG_PORT || '5432', 10);
const USER = process.env.PG_USER || 'postgres';
const PASSWORD = process.env.PG_PASSWORD || 'postgres';

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: USER,
  password: PASSWORD,
  port: PORT,
  persistent: true,
});

const isInitialised = fs.existsSync(path.join(DATA_DIR, 'PG_VERSION'));
if (!isInitialised) {
  console.log('[dev-db] initialising cluster at', DATA_DIR);
  await pg.initialise();
}

console.log(`[dev-db] starting cluster on port ${PORT}…`);
await pg.start();

try {
  await pg.createDatabase(DB_NAME);
  console.log(`[dev-db] created database "${DB_NAME}"`);
} catch (err) {
  if (/already exists/i.test(String(err?.message ?? err))) {
    console.log(`[dev-db] database "${DB_NAME}" already exists`);
  } else {
    console.error('[dev-db] createDatabase failed:', err);
    await pg.stop();
    process.exit(1);
  }
}

console.log(
  `[dev-db] READY — postgresql://${USER}:${PASSWORD}@localhost:${PORT}/${DB_NAME}`,
);
console.log('[dev-db] press Ctrl+C to stop');

const shutdown = async (signal) => {
  console.log(`[dev-db] received ${signal}, stopping cluster…`);
  try {
    await pg.stop();
  } catch (err) {
    console.error('[dev-db] stop failed:', err);
  }
  process.exit(0);
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// keep process alive
setInterval(() => {}, 1 << 30);
