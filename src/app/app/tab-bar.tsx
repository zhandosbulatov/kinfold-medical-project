"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/app", label: "Today" },
  { href: "/app/meds", label: "Meds" },
  { href: "/app/family", label: "Family" },
] as const;

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-3">
        {TABS.map((tab) => {
          const active =
            tab.href === "/app" ? pathname === "/app" : pathname.startsWith(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "flex min-h-14 items-center justify-center font-semibold text-brand-ink"
                    : "flex min-h-14 items-center justify-center text-ink-muted hover:text-ink"
                }
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
