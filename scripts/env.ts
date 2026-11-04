// Load .env.local then .env for standalone scripts (Next.js does this itself at runtime).
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

// Migrations and seeding go over Neon's direct (unpooled) connection when it's
// available. The pooled DATABASE_URL (PgBouncer) is for the app at runtime.
if (process.env.DATABASE_URL_UNPOOLED) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
}
