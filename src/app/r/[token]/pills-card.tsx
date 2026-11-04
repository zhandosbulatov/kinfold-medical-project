"use client";

import { startTransition, useOptimistic, useState, ViewTransition } from "react";
import type { PillSlot } from "@/lib/data/rose";
import { takeSlot } from "./actions";

/**
 * Rose's one task. The tap is shown instantly (optimistic), the server
 * confirms, and the thank-you stays until her next pills are due: no
 * time-outs, nothing disappears on her.
 */
export function PillsCard({
  token,
  name,
  caregiver,
  current,
  next,
  takenToday,
}: {
  token: string;
  name: string;
  caregiver: string;
  current: PillSlot | null;
  next: PillSlot | null;
  takenToday: boolean;
}) {
  const [optimisticTaken, markTaken] = useOptimistic<string | null>(null);
  const [thankedAt, setThankedAt] = useState<string | null>(null);

  const showing = current && optimisticTaken !== current.at ? current : null;
  const thanked = optimisticTaken ?? thankedAt;

  function confirm(slot: PillSlot) {
    startTransition(async () => {
      markTaken(slot.at);
      await takeSlot(token, slot.at);
      // State set after an await needs its own transition.
      startTransition(() => setThankedAt(slot.at));
    });
  }

  return (
    <div aria-live="polite">
      {thanked ? (
        <ViewTransition key={`thanks-${thanked}`} enter="slide-up" exit="fade-out" default="none">
          <div className="rounded-card bg-taken-soft p-5">
            <p className="text-rose-xl font-bold text-taken-ink">✓ Thank you, {name}.</p>
            <p className="mt-2 text-rose">{caregiver} can see it.</p>
          </div>
        </ViewTransition>
      ) : null}

      {showing ? (
        <ViewTransition key={showing.at} enter="slide-up" exit="fade-out" default="none">
          <section
            aria-labelledby="pills-title"
            className={`rounded-card border-2 border-ink bg-surface p-5 ${thanked ? "mt-4" : ""}`}
          >
            <h2 id="pills-title" className="text-rose-xl font-bold">
              Your {showing.partOfDay} pills
            </h2>
            <p className="mt-1 text-rose text-ink-muted">
              {showing.overdue ? `These were for ${showing.timeLabel}.` : `For ${showing.timeLabel}`}
            </p>
            <ul className="mt-4 space-y-2 text-rose">
              {showing.pills.map((p) => (
                <li key={p.name} className="border-t border-line pt-2 first:border-t-0 first:pt-0">
                  <strong>{p.name}</strong>
                  {p.strength ? ` ${p.strength}` : ""}
                  {p.dose ? <span className="block text-ink-muted">{p.dose}</span> : null}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => confirm(showing)}
              className="mt-6 flex min-h-20 w-full items-center justify-center rounded-card bg-ink px-4 text-rose-xl font-bold text-surface transition-[background-color,transform] duration-150 hover:bg-ink/85 active:translate-y-px"
            >
              I took them
            </button>
          </section>
        </ViewTransition>
      ) : (
        <ViewTransition key="rest" enter="fade-in" exit="fade-out" default="none">
          <div className={thanked ? "mt-4 rounded-card bg-surface p-5" : "rounded-card bg-surface p-5"}>
            {next ? (
              <p className="text-rose">
                {thanked ? "Your next pills are at " : "No pills right now. Your next pills are at "}
                <strong>{next.timeLabel}</strong>.
              </p>
            ) : (
              <p className="text-rose">
                {takenToday || thanked ? "All done for today." : "No pills left today."}{" "}
                <span aria-hidden>🌷</span>
              </p>
            )}
          </div>
        </ViewTransition>
      )}
    </div>
  );
}
