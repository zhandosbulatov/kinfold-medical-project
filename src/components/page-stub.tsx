import type { ReactNode } from "react";

/**
 * Placeholder for routes that a later build prompt fills in.
 * Delete the usage when the real page lands.
 */
export function PageStub({
  title,
  prompt,
  children,
}: {
  title: string;
  /** Which build prompt (docs/build-prompts.md) implements this route. */
  prompt: string;
  children?: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-5 py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">{prompt}</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">{title}</h1>
      {children ? <div className="mt-4 space-y-3 text-ink-muted">{children}</div> : null}
    </main>
  );
}
