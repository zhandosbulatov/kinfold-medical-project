import Link from "next/link";
import { Suspense, ViewTransition } from "react";
import { AppPage, Panel, Skeleton } from "@/components/app/app-page";
import { AutoRefresh } from "@/components/app/auto-refresh";
import { CopyLink } from "@/components/app/copy-link";
import { DoseCardFor } from "@/components/app/dose-card";
import { Sticker } from "@/components/rx/sticker";
import { getTodayView, type TodayDose } from "@/lib/data/app";
import { getDemoFamily } from "@/lib/data/family";
import { fmtDay, fmtRelative, fmtTime, localHour, MOOD_LABEL } from "@/lib/format";
import { DemoControls } from "./demo-controls";

export const metadata = { title: "Today" };

export default function TodayPage() {
  return (
    <AppPage title="Today">
      <Suspense fallback={<Skeleton lines={4} />}>
        <TodayContent />
      </Suspense>
      <DemoControls />
      <AutoRefresh />
    </AppPage>
  );
}

const SLOTS = [
  { label: "Morning", test: (h: number) => h < 12 },
  { label: "Afternoon", test: (h: number) => h >= 12 && h < 17 },
  { label: "Evening", test: (h: number) => h >= 17 },
];

async function TodayContent() {
  const demo = await getDemoFamily();
  if (!demo) return <p className="mt-6">Demo family not found. Run `npm run db:seed`.</p>;
  const { recipient } = demo;
  const tz = recipient.timezone;
  const view = await getTodayView(recipient.id, tz);
  const taken = view.today.filter((d) => d.status === "taken").length;

  return (
    <>
      <p className="mt-2 text-ink-muted">
        {recipient.name} · {fmtDay(view.now, tz)} · {taken} of {view.today.length} doses taken
      </p>

      {view.missed.length > 0 ? (
        <section aria-label="Missed doses" className="mt-6 space-y-3">
          {view.missed.map((d) => (
            <ViewTransition key={d.id} enter="fade-in" exit="fade-out">
              <MissedAlert dose={d} tz={tz} now={view.now} phone={recipient.phone} name={recipient.name} />
            </ViewTransition>
          ))}
        </section>
      ) : null}

      {SLOTS.map((slot) => {
        const doses = view.today.filter((d) => slot.test(localHour(d.scheduledAt, tz)));
        return doses.length > 0 ? (
          <Panel key={slot.label} title={slot.label}>
            <ul className="space-y-2">
              {doses.map((d) => (
                <ViewTransition key={d.id}>
                  <li>
                    <DoseCardFor dose={d} timeZone={tz} />
                  </li>
                </ViewTransition>
              ))}
            </ul>
          </Panel>
        ) : null;
      })}

      <Panel title={`${recipient.name}’s check-in`}>
        {view.mood ? (
          <p className="rounded-label border border-line bg-surface p-3 text-lg">
            <strong>{MOOD_LABEL[view.mood.mood] ?? "Checked in"}</strong>
            <span className="text-ink-muted"> · {fmtRelative(view.mood.createdAt, view.now)}</span>
          </p>
        ) : (
          <p className="text-ink-muted">No check-in yet today.</p>
        )}
      </Panel>

      {view.refills.length > 0 ? (
        <Panel title="Refills">
          <ul className="space-y-2">
            {view.refills.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-label border border-line bg-surface p-3"
              >
                <span className="text-lg font-semibold">{r.name}</span>
                <Sticker tone="yellow">
                  {r.days <= 0 ? "Out today" : `${r.days} ${r.days === 1 ? "day" : "days"} left`}
                </Sticker>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <Panel title="Next appointment">
        {view.nextAppt ? (
          <div className="rounded-label border border-line bg-surface p-3">
            <p className="text-lg font-semibold">{view.nextAppt.title}</p>
            <p className="text-ink-muted">
              {fmtDay(view.nextAppt.startsAt, tz)}, {fmtTime(view.nextAppt.startsAt, tz)}
              {view.nextAppt.provider ? ` · ${view.nextAppt.provider}` : ""}
            </p>
            {view.nextAppt.notes ? <p className="mt-1">{view.nextAppt.notes}</p> : null}
          </div>
        ) : (
          <p className="text-ink-muted">Nothing scheduled.</p>
        )}
      </Panel>

      <Panel title={`${recipient.name}’s link`}>
        <div className="flex items-center justify-between gap-3 rounded-label border border-line bg-surface p-3">
          <div className="min-w-0">
            <Link href={`/r/${recipient.privateToken}`} className="font-semibold underline underline-offset-4">
              Open {recipient.name}’s screen
            </Link>
            <p className="truncate font-mono text-sm text-ink-muted">/r/{recipient.privateToken}</p>
          </div>
          <CopyLink path={`/r/${recipient.privateToken}`} />
        </div>
      </Panel>
    </>
  );
}

function MissedAlert({
  dose,
  tz,
  now,
  phone,
  name,
}: {
  dose: TodayDose;
  tz: string;
  now: Date;
  phone: string | null;
  name: string;
}) {
  const sameDay = fmtDay(dose.scheduledAt, tz) === fmtDay(now, tz);
  return (
    <div className="rounded-card bg-missed-soft p-4">
      <p className="label-caps text-sm text-missed-ink">× Missed dose</p>
      <p className="mt-1 text-xl font-semibold">
        {dose.name}
        {dose.strength ? ` ${dose.strength}` : ""}
      </p>
      <p className="text-ink-muted">
        Due {fmtTime(dose.scheduledAt, tz)} {sameDay ? "today" : "yesterday"} · not confirmed by {name}
      </p>
      {phone ? (
        <a
          href={`tel:${phone}`}
          className="mt-3 inline-flex min-h-12 items-center rounded-label bg-ink px-5 font-semibold text-surface transition-[background-color] duration-150 hover:bg-ink/85"
        >
          Call {name === "Rose" ? "Mom" : name}
        </a>
      ) : null}
    </div>
  );
}
