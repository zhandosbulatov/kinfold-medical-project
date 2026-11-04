// Load .env.local then .env for standalone scripts (Next.js does this itself at runtime).
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ quiet: true });
