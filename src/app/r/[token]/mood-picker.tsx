"use client";

import { startTransition, useOptimistic, useState } from "react";
import { checkIn } from "./actions";

const MOODS = [
  { value: 1, label: "Not well", mouth: "M14 31 Q24 24 34 31" },
  { value: 2, label: "Okay", mouth: "M14 29 L34 29" },
  { value: 3, label: "Good", mouth: "M14 27 Q24 35 34 27" },
] as const;

/** Simple line face: one stroke weight, drawn on a 48px grid. */
function Face({ mouth }: { mouth: string }) {
  return (
    <svg viewBox="0 0 48 48" width="56" height="56" aria-hidden="true" className="shrink-0">
      <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="17" cy="19" r="2.5" fill="currentColor" />
      <circle cx="31" cy="19" r="2.5" fill="currentColor" />
      <path d={mouth} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function MoodPicker({
  token,
  caregiver,
  todayMood,
}: {
  token: string;
  caregiver: string;
  todayMood: number | null;
}) {
  const [mood, setMood] = useOptimistic(todayMood);
  // Thank her only for a tap made now; otherwise just remind her what she said earlier.
  const [tapped, setTapped] = useState(false);
  const earlier = MOODS.find((m) => m.value === mood)?.label.toLowerCase();
  const message = tapped
    ? `Thank you. ${caregiver} can see it.`
    : earlier
      ? `Earlier today you said: ${earlier}.`
      : "";

  return (
    <section aria-labelledby="mood-title" className="mt-10">
      <h2 id="mood-title" className="text-rose-xl font-bold">
        How are you feeling?
      </h2>
      <div role="group" aria-labelledby="mood-title" className="mt-4 grid grid-cols-3 gap-3">
        {MOODS.map((m) => {
          const selected = mood === m.value;
          return (
            <button
              key={m.value}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                setTapped(true); // urgent: the thank-you shows with the tap
                startTransition(async () => {
                  setMood(m.value);
                  await checkIn(token, m.value);
                });
              }}
              className={
                "flex min-h-32 flex-col items-center justify-center gap-2 rounded-card border-2 p-2 text-rose " +
                "transition-[background-color,border-color] duration-150 active:translate-y-px " +
                (selected ? "border-ink bg-brand-soft font-bold" : "border-line bg-surface hover:border-ink")
              }
            >
              <Face mouth={m.mouth} />
              {m.label}
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="mt-3 min-h-8 text-rose text-ink-muted">
        {message}
      </p>
    </section>
  );
}
