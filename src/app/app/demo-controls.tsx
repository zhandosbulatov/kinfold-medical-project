import { resetDemo, simulateMissedDose } from "./demo-actions";

/** Presenter-only panel for the live pitch demo. Plain forms: no client JS. */
export function DemoControls() {
  return (
    <section
      aria-labelledby="demo-controls"
      className="mt-10 rounded-card border border-dashed border-line p-4"
    >
      <h2 id="demo-controls" className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
        Demo controls
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <form action={simulateMissedDose}>
          <button className="min-h-11 rounded-full bg-missed px-4 font-semibold text-white">
            Simulate missed dose
          </button>
        </form>
        <form action={resetDemo}>
          <button className="min-h-11 rounded-full border border-line bg-surface px-4 font-semibold">
            Reset demo
          </button>
        </form>
      </div>
    </section>
  );
}
