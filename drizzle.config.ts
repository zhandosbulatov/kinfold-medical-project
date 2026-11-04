import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config();

const url = process.env.DATABASE_URL;

export default url
  ? defineConfig({
      dialect: "postgresql",
      schema: "./src/db/schema.ts",
      out: "./drizzle",
      dbCredentials: { url },
    })
  : defineConfig({
      dialect: "postgresql",
      driver: "pglite",
      schema: "./src/db/schema.ts",
      out: "./drizzle",
      dbCredentials: { url: process.env.PGLITE_DIR ?? "./.pglite" },
    });
