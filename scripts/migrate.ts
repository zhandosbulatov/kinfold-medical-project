import "./env";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { migrate as migratePostgres } from "drizzle-orm/postgres-js/migrator";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { db } from "../src/db";

async function main() {
  const migrationsFolder = "./drizzle";
  if (process.env.DATABASE_URL) {
    await migratePostgres(db as unknown as PostgresJsDatabase, { migrationsFolder });
  } else {
    await migratePglite(db as unknown as PgliteDatabase, { migrationsFolder });
  }
  console.log(`✓ migrations applied (${process.env.DATABASE_URL ? "Postgres" : "local PGlite"})`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
