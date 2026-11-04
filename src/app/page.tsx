import Link from "next/link";

// Landing page — replaced in Prompt 2. Static: no runtime data.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">Kinfold</p>
      <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-ink">
        Know Mom took her pills — without calling every day.
      </h1>
      <p className="mt-4 text-ink-muted">
        Snap her pill bottles. She taps “I took it.” You and your siblings see every dose and
        hear about a missed one. Mom doesn’t set up anything.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/quiz"
          className="rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-strong"
        >
          Take the 2-minute check
        </Link>
        <Link
          href="/app"
          className="rounded-full border border-line bg-surface px-6 py-3 font-semibold text-ink hover:border-brand"
        >
          View demo
        </Link>
      </div>
    </main>
  );
}
