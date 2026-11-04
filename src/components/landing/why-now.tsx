const SOURCE_URL =
  "https://www.aarp.org/press/releases/2025-07-24-new-report-reveals-crisis-point-for-americas-63-million-family-caregivers.html";

const LINES: [label: string, value: string, note?: string][] = [
  ["Family caregivers, US", "63M", "AARP/NAC"],
  ["Up since 2015", "+20M", "AARP/NAC"],
  ["Also hold a job", "6 in 10", "AARP/NAC"],
  ["Oldest boomers turn 80", "2026", "born 1946"],
];

/** "Why now", printed as a pharmacy receipt instead of a big-number triptych. */
export function WhyNow() {
  return (
    <section aria-labelledby="why-title" className="border-y border-line bg-surface">
      <div className="mx-auto grid max-w-6xl items-start gap-12 px-5 py-20 md:grid-cols-[1fr_1.1fr] md:gap-16 md:py-28">
        <div>
          <h2 id="why-title" className="display text-2xl md:text-3xl">
            Families are carrying more of this than ever
          </h2>
          <p className="mt-4 max-w-[46ch] text-lg">
            Most family caregivers also work. The pill counts, the refill runs and the “did Mom take
            it?” texts happen between meetings. Kinfold takes over the checking, so your calls with
            Mom can be about something else.
          </p>
        </div>

        <figure className="mx-auto w-full max-w-md">
          <div className="border-y-2 border-dashed border-ink/40 bg-canvas px-5 py-5 font-mono text-sm tabular-nums sm:text-[0.95rem]">
            <p className="label-caps text-center text-base">Caregiving in the US</p>
            <p className="text-center text-sm text-ink-muted">Report printed 2025</p>
            <ul className="mt-4 space-y-3">
              {LINES.map(([label, value, note]) => (
                <li key={label}>
                  <div className="flex items-baseline gap-2">
                    <span className="min-w-0">{label}</span>
                    <span aria-hidden className="min-w-4 flex-1 border-b-2 border-dotted border-ink/30" />
                    <span className="whitespace-nowrap font-bold">{value}</span>
                  </div>
                  {note ? <span className="text-sm text-ink-muted">{note}</span> : null}
                </li>
              ))}
            </ul>
          </div>
          <figcaption className="mt-3 text-sm text-ink-muted">
            Source:{" "}
            <a
              href={SOURCE_URL}
              className="text-brand-ink underline underline-offset-2 hover:text-ink"
              target="_blank"
              rel="noreferrer"
            >
              AARP &amp; National Alliance for Caregiving, Caregiving in the US 2025
            </a>
            . The oldest boomers were born in 1946.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
