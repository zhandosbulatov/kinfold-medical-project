import { RxLabel } from "@/components/rx/rx-label";
import { Sticker } from "@/components/rx/sticker";

// Static HTML pictures of the real product screens. Each is one role="img"
// with a text alternative, so screen readers don't meet fake buttons.

/** Step 1: a bottle label becomes checked, structured fields. */
export function LabelReadMock() {
  const fields: [string, string][] = [
    ["Medication", "Lisinopril"],
    ["Strength", "10 mg"],
    ["When", "Every morning, 8:00 AM"],
    ["Pills left", "24 · refill in 24 days"],
  ];
  return (
    <div
      role="img"
      aria-label="A Lisinopril bottle label next to the fields Kinfold reads from it: medication, strength, schedule and pills left, with the schedule flagged for checking."
      className="grid items-center gap-4 xl:grid-cols-[1fr_auto_1fr]"
    >
      <RxLabel on="counter">
        <RxLabel.Header rx="4471188" pharmacy="Riverside" />
        <RxLabel.Patient>Rose M.</RxLabel.Patient>
        <RxLabel.Drug>Lisinopril 10 mg</RxLabel.Drug>
        <RxLabel.Directions>Take 1 tablet by mouth every morning.</RxLabel.Directions>
      </RxLabel>
      <span className="label-caps rotate-90 text-center text-2xl text-brand-ink xl:rotate-0 xl:text-3xl" aria-hidden>
        →
      </span>
      <dl className="rounded-card border border-line bg-surface p-4">
        {fields.map(([k, v]) => (
          <div
            key={k}
            className={`flex justify-between gap-3 border-b border-line py-2 last:border-0 ${
              k === "When" ? "-mx-2 rounded-label bg-due-soft px-2" : ""
            }`}
          >
            <dt className="text-ink-muted">{k}</dt>
            <dd className="text-right font-semibold">
              {v}
              {k === "When" ? (
                <span className="block text-sm font-normal text-due-ink">Check this</span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Step 2: Rose's whole screen. One task, one button. */
export function RoseScreenMock() {
  return (
    <div
      role="img"
      aria-label="Rose’s screen: her morning pills, Lisinopril and Metformin, with one large ‘I took them’ button and a ‘Call Anna’ button."
      className="mx-auto w-full max-w-[22rem] rounded-card border-2 border-ink bg-surface p-5"
    >
      <p className="text-rose text-ink-muted">Good morning, Rose.</p>
      <p className="mt-3 text-rose-xl font-bold">Your morning pills</p>
      <ul className="mt-3 space-y-1 text-rose">
        <li>Lisinopril 10 mg</li>
        <li>Metformin 500 mg</li>
      </ul>
      <div className="mt-5 flex min-h-20 items-center justify-center rounded-card bg-ink text-rose-xl font-bold text-surface">
        I took them
      </div>
      <div className="mt-3 flex min-h-14 items-center justify-center rounded-card border-2 border-ink text-rose font-semibold">
        Call Anna
      </div>
    </div>
  );
}

/** Step 3: Anna's Today, with a missed dose flagged. */
export function FamilyTodayMock() {
  const rows: { time: string; med: string; status: "taken" | "due"; note: string }[] = [
    { time: "8:00 AM", med: "Lisinopril 10 mg", status: "taken", note: "Taken 8:12" },
    { time: "8:00 AM", med: "Metformin 500 mg", status: "taken", note: "Taken 8:12" },
    { time: "9:00 PM", med: "Atorvastatin 20 mg", status: "due", note: "Due" },
  ];
  return (
    <div
      role="img"
      aria-label="Anna’s Today screen: last night’s Metformin flagged as missed with a Call Mom button, this morning’s two doses taken at 8:12, and tonight’s Atorvastatin due."
      className="w-full rounded-card border border-line bg-surface p-4"
    >
      <p className="label-caps text-sm text-ink-muted">Today · Rose</p>
      <div className="mt-3 rounded-label bg-missed-soft p-3">
        <p className="font-semibold text-missed-ink">× Missed: Metformin, 8:00 PM yesterday</p>
        <p className="mt-2 inline-flex min-h-10 items-center rounded-label bg-ink px-3 text-sm font-semibold text-surface">
          Call Mom
        </p>
      </div>
      <ul className="mt-3 divide-y divide-line">
        {rows.map((r) => (
          <li key={r.med} className="flex items-center justify-between gap-3 py-2.5">
            <span>
              <span className="block font-mono text-sm tabular-nums text-ink-muted">{r.time}</span>
              {r.med}
            </span>
            {r.status === "taken" ? (
              <span className="font-semibold text-taken-ink">✓ {r.note}</span>
            ) : (
              <span className="font-semibold text-due-ink">○ {r.note}</span>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-2">
        <Sticker tone="blue">Ben took “Pick up refill”</Sticker>
      </div>
    </div>
  );
}
