import "./env";
import { DEMO_BEN_INVITE, DEMO_ROSE_TOKEN } from "../src/lib/demo";
import { seedDemo } from "../src/db/seed-demo";

seedDemo()
  .then((r) => {
    console.log(`✓ seeded demo family (${r.day}): ${r.meds} meds, ${r.doses} doses, ${r.missed} missed`);
    console.log(`  Anna: /app   Rose: /r/${DEMO_ROSE_TOKEN}   Ben: /join/${DEMO_BEN_INVITE}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
