"use client";

import { useState } from "react";

/** Copies an absolute URL for `path` (origin is only known in the browser). */
export function CopyLink({ path, label = "Copy link" }: { path: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(new URL(path, window.location.origin).href);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          window.prompt("Copy this link:", new URL(path, window.location.origin).href);
        }
      }}
      className="inline-flex min-h-11 shrink-0 items-center rounded-label border-2 border-ink px-3 text-sm font-semibold transition-[background-color] duration-150 hover:bg-ink/10"
    >
      <span aria-live="polite">{copied ? "✓ Copied" : label}</span>
    </button>
  );
}
