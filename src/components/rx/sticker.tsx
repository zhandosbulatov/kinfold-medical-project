import type { ReactNode } from "react";

const TONES = {
  green: "bg-sticker-green",
  yellow: "bg-sticker-yellow",
  blue: "bg-sticker-blue",
  pink: "bg-sticker-pink",
} as const;

/**
 * An auxiliary warning sticker, the kind a pharmacist adds to a bottle
 * ("TAKE WITH FOOD"). Kinfold's callout device. Always ink on a light tone.
 */
export function Sticker({
  tone,
  children,
  className = "",
}: {
  tone: keyof typeof TONES;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`label-caps inline-flex items-center gap-1.5 rounded-label px-2.5 py-1 text-sm text-ink ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
