import { Suspense, ViewTransition } from "react";
import { AppPage, Skeleton } from "@/components/app/app-page";
import { RxLabel } from "@/components/rx/rx-label";
import { Sticker } from "@/components/rx/sticker";
import { PrimaryLink } from "@/components/ui/link-button";
import { daysLeft, getMedsView } from "@/lib/data/app";
import { getDemoFamily } from "@/lib/data/family";
import { fmtClock, fmtDay } from "@/lib/format";

export const metadata = { title: "Medications" };

export default function MedsPage() {
  return (
    <AppPage title="Medications">
      <div className="mt-4">
        <PrimaryLink href="/app/meds/add">Add medication</PrimaryLink>
      </div>
      <Suspense fallback={<Skeleton lines={3} />}>
        <MedList />
      </Suspense>
    </AppPage>
  );
}

async function MedList() {
  const demo = await getDemoFamily();
  if (!demo) return null;
  const tz = demo.recipient.timezone;
  const meds = await getMedsView(demo.recipient.id);

  if (meds.length === 0) {
    return (
      <p className="mt-8 text-lg text-ink-muted">
        No medications yet. Add the first one from a bottle photo.
      </p>
    );
  }

  return (
    <ul className="mt-8 space-y-5">
      {meds.map((m) => {
        const days = daysLeft(m);
        return (
          <ViewTransition key={m.id}>
            <li>
              <RxLabel on="counter">
                <div className="flex items-start justify-between gap-3">
                  <RxLabel.Drug>
                    {m.name}
                    {m.strength ? ` ${m.strength}` : ""}
                  </RxLabel.Drug>
                  <Sticker tone={m.source === "photo" ? "green" : "blue"} className="shrink-0">
                    {m.source === "photo" ? "From photo" : "Typed"}
                  </Sticker>
                </div>
                <RxLabel.Directions>
                  {m.dose ?? "1 dose"} at {m.scheduleTimes.map(fmtClock).join(" and ")}
                  {m.instructions ? `. ${m.instructions}.` : "."}
                </RxLabel.Directions>
                <RxLabel.Meta
                  items={[
                    ["Pills left", m.pillsLeft == null ? "unknown" : String(m.pillsLeft)],
                    ["Lasts", days == null ? "unknown" : `${days} ${days === 1 ? "day" : "days"}`],
                    ["Refill", m.refillDate ? fmtDay(new Date(`${m.refillDate}T12:00:00Z`), tz) : "not set"],
                  ]}
                />
                {days != null && days <= 7 ? (
                  <p className="mt-3">
                    <Sticker tone="yellow">Refill soon: {days <= 0 ? "out today" : `${days} days left`}</Sticker>
                  </p>
                ) : null}
              </RxLabel>
            </li>
          </ViewTransition>
        );
      })}
    </ul>
  );
}
