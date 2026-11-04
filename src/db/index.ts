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
  if (process.env.VERCEL) {
    // Vercel's filesystem is read-only: never fall back to PGlite there.
    throw new Error(
      "DATABASE_URL is missing. Connect Neon in Vercel → Storage for this environment, then redeploy.",
    );
  }
  return drizzlePglite(new PGlite(process.env.PGLITE_DIR ?? "./.pglite"), { schema });
}

type Db = ReturnType<typeof createDb>;

// Reuse one client across hot reloads in dev.
const globalForDb = globalThis as unknown as { __kinfoldDb?: Db };

function getDb(): Db {
  if (!globalForDb.__kinfoldDb) globalForDb.__kinfoldDb = createDb();
  return globalForDb.__kinfoldDb;
}

/**
 * Lazy: nothing connects until the first query. `next build` imports this
 * module in several workers at once; opening PGlite in each of them races on
 * the same ./.pglite folder.
 */
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    const real = getDb();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export { schema };
