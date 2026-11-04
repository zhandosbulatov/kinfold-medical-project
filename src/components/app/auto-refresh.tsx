"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Keeps a live demo fresh: when Rose taps "I took them" on her phone, Anna's
 * screen picks it up within ~15 seconds, or right away when the tab regains focus.
 * Renders nothing.
 */
export function AutoRefresh({ everyMs = 15_000 }: { everyMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const id = window.setInterval(refresh, everyMs);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router, everyMs]);
  return null;
}
