import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getRoseView } from "@/lib/data/rose";
import { MoodPicker } from "./mood-picker";
import { PillsCard } from "./pills-card";

export const metadata = {
  title: "Your pills today",
  robots: { index: false, follow: false },
};

// Rose's private link: no login, no setup, no navigation, one thing at a time.
// Everything is ≥22px (text-rose); buttons are ≥64px tall.
export default function RosePage({ params }: PageProps<"/r/[token]">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-8 pb-12 text-rose">
      <Suspense fallback={<p className="text-rose">One moment…</p>}>
        <RoseScreen params={params} />
      </Suspense>
    </main>
  );
}

async function RoseScreen({ params }: Pick<PageProps<"/r/[token]">, "params">) {
  const { token } = await params;
  const view = await getRoseView(token);
  if (!view) notFound();
  const caregiver = view.caregiver?.name ?? "Your family";

  return (
    <>
      <h1 className="text-rose-xl font-bold">
        {view.greeting}, {view.recipient.name}.
      </h1>

      <div className="mt-6">
        <PillsCard
          token={token}
          name={view.recipient.name}
          caregiver={caregiver}
          current={view.current}
          next={view.next}
          takenToday={view.takenToday}
        />
      </div>

      <MoodPicker token={token} caregiver={caregiver} todayMood={view.moodToday} />

      {view.caregiver?.phone ? (
        <a
          href={`tel:${view.caregiver.phone}`}
          className="mt-10 flex min-h-16 items-center justify-center rounded-card border-2 border-ink bg-surface text-rose-xl font-bold transition-[background-color] duration-150 hover:bg-ink/5"
        >
          Call {caregiver}
        </a>
      ) : null}
    </>
  );
}
