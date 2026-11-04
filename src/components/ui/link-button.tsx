import Link from "next/link";
import type { ComponentProps } from "react";

type LinkButtonProps = Omit<ComponentProps<typeof Link>, "className">;

const base =
  "inline-flex min-h-12 items-center justify-center rounded-label px-6 font-semibold " +
  "transition-[background-color,border-color,transform] duration-150 ease-out active:translate-y-px";

/** Primary action: ink fill. One per view. */
export function PrimaryLink(props: LinkButtonProps) {
  return <Link {...props} className={`${base} bg-ink text-surface hover:bg-ink/85`} />;
}

/** Secondary action: ink outline, works on canvas and on the amber bottle. */
export function SecondaryLink(props: LinkButtonProps) {
  return (
    <Link
      {...props}
      className={`${base} border-2 border-ink text-ink hover:bg-ink/10`}
    />
  );
}
