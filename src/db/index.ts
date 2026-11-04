import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * DATABASE_URL set (Vercel / Neon) → postgres-js over the pooled connection.
 * Not set (local, no Docker needed) → embedded PGlite stored in ./.pglite.
 * PGlite is single-process: stop `next dev` before running db:migrate/db:seed.
 */
function createDb() {
  const url = process.env.DATABASE_URL;
  if (url) {
    // prepare: false is required behind Neon's PgBouncer pooler.
    return drizzlePostgres(postgres(url, { prepare: false, max: 5 }), { schema });
  }
  return drizzlePglite(new PGlite(process.env.PGLITE_DIR ?? "./.pglite"), { schema });
}

type Db = ReturnType<typeof createDb>;

// Reuse one client across hot reloads in dev.
const globalForDb = globalThis as unknown as { __kinfoldDb?: Db };

export const db: Db = globalForDb.__kinfoldDb ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb.__kinfoldDb = db;

export { schema };
