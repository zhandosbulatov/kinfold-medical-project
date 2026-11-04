import { Suspense } from "react";
import { PageStub } from "@/components/page-stub";
import { getDemoFamily, getTodayDoseCounts } from "@/lib/data/family";
import { DEMO_BEN_INVITE } from "@/lib/demo";
import { DemoControls } from "./demo-controls";

export const metadata = { title: "Today" };

// Today tab — replaced in Prompt 4. For now it proves the DB plumbing.
export default function TodayPage() {
  return (
    <PageStub title="Today" prompt="Prompt 4">
      <Suspense fallback={<p>Loading today…</p>}>
        <TodaySummary />
      </Suspense>
      <DemoControls />
    </PageStub>
  );
}

async function TodaySummary() {
  const demo = await getDemoFamily();
  if (!demo) return <p>Demo family not found. Run <code>npm run db:seed</code>.</p>;
  const { family, recipient } = demo;
  const counts = await getTodayDoseCounts(recipient.id, recipient.timezone);
  return (
    <>
      <p>
        <strong className="text-ink">{family.name}</strong> · caring for {recipient.name}
      </p>
      <p>
        Today: {counts.taken} taken · {counts.due} due · {counts.missed} missed
      </p>
      <p>
        Rose’s link:{" "}
        <a className="text-brand-ink underline" href={`/r/${recipient.privateToken}`}>
          /r/{recipient.privateToken}
        </a>{" "}
        · Ben’s invite:{" "}
        <a className="text-brand-ink underline" href={`/join/${DEMO_BEN_INVITE}`}>
          /join/{DEMO_BEN_INVITE}
        </a>
      </p>
    </>
  );
}
