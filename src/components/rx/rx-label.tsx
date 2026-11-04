import type { ReactNode } from "react";

/**
 * A printed prescription label (compound component).
 *
 *   <RxLabel on="bottle">
 *     <RxLabel.Header rx="4471203" pharmacy="Riverside Pharmacy" />
 *     <RxLabel.Patient>Rose M.</RxLabel.Patient>
 *     <RxLabel.Drug>Metformin 500 mg tablet</RxLabel.Drug>
 *     <RxLabel.Directions>Take 1 tablet by mouth twice daily with food.</RxLabel.Directions>
 *     <RxLabel.Meta items={[["Qty", "60"], ["Refills", "2"]]} />
 *   </RxLabel>
 */
const SURFACES = {
  /** Lying on the amber bottle → paper shadow, no border. */
  bottle: "shadow-label",
  /** On the page canvas → defined edge, no shadow. */
  counter: "border border-line",
} as const;

function RxLabelRoot({
  children,
  on,
  className = "",
}: {
  children: ReactNode;
  on: keyof typeof SURFACES;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-label bg-surface px-4 py-3 text-ink sm:px-5 sm:py-4 ${SURFACES[on]} ${className}`}
    >
      {children}
    </div>
  );
}

function Header({ rx, pharmacy }: { rx: string; pharmacy: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b-2 border-ink pb-1.5 font-mono text-sm tabular-nums">
      <span>Rx {rx}</span>
      <span className="label-caps text-sm">{pharmacy}</span>
    </div>
  );
}

function Patient({ children }: { children: ReactNode }) {
  return <p className="label-caps mt-2 text-lg leading-tight">{children}</p>;
}

function Drug({ children }: { children: ReactNode }) {
  return <p className="label-caps text-xl leading-tight sm:text-2xl">{children}</p>;
}

function Directions({ children }: { children: ReactNode }) {
  return <p className="mt-1 max-w-[34ch] leading-snug">{children}</p>;
}

function Meta({ items }: { items: [label: string, value: string][] }) {
  return (
    <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-line pt-2 font-mono text-sm tabular-nums text-ink-muted">
      {items.map(([label, value]) => (
        <div key={label} className="flex gap-1.5">
          <dt>{label}</dt>
          <dd className="text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export const RxLabel = Object.assign(RxLabelRoot, {
  Header,
  Patient,
  Drug,
  Directions,
  Meta,
});
