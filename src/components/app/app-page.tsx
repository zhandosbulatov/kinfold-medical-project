import { ViewTransition, type ReactNode } from "react";

/**
 * Frame for one tab of Anna's app. Tabs are lateral (no depth), so switching
 * is a plain cross-fade, never a directional slide.
 */
export function AppPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <ViewTransition enter="fade-in" exit="fade-out" default="none">
      <main className="mx-auto w-full max-w-xl flex-1 px-5 pt-6 pb-10">
        <p className="label-caps text-sm text-ink-muted">Kinfold · Rose’s care circle</p>
        <h1 className="display mt-1 text-3xl">{title}</h1>
        {children}
      </main>
    </ViewTransition>
  );
}

/** A titled block inside a tab. */
export function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const id = `panel-${title.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="mt-8">
      <div className="flex items-end justify-between gap-3">
        <h2 id={id} className="label-caps text-base">
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div role="status" aria-label="Loading…" className="mt-8 space-y-3">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="h-16 rounded-label bg-line/60" />
      ))}
    </div>
  );
}
